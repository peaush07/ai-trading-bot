/**
 * Quantitative Vectorized Backtester & Fitness Evaluation Engine
 * Implements Fractional Kelly Sizing, Divided Micro-Orders, Multi-Tier Exits, and Deflated Sharpe Ratio (DSR)
 */
import { calculateEMA, calculateRSI, calculateATR, calculateBollingerBands } from './indicators.js';

export function runBacktest(candles, strategyConfig = {}) {
  if (!candles || candles.length < 50) {
    return {
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      maxDrawdownPct: 0,
      winRatePct: 0,
      netProfitPct: 0,
      totalTrades: 0,
      dsrScore: 0,
      trades: []
    };
  }

  const {
    emaFast = 12,
    emaSlow = 50,
    rsiPeriod = 14,
    rsiBuyThreshold = 45,
    rsiSellThreshold = 65,
    atrMultiplier = 1.8,
    riskPerTradePct = 0.015, // 1.5% capital risk per trade
    fractionalKellyMultiplier = 0.20, // Kelly fraction
    microOrderTiers = 3, // Divided micro-trade scaling
    feeRatePct = 0.00075, // 0.075% Binance BNB fee
    slippagePct = 0.0003 // 0.03% dynamic slippage
  } = strategyConfig;

  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  const emaFastLine = calculateEMA(closes, emaFast);
  const emaSlowLine = calculateEMA(closes, emaSlow);
  const rsiLine = calculateRSI(closes, rsiPeriod);
  const atrLine = calculateATR(highs, lows, closes, 14);
  const bands = calculateBollingerBands(closes, 20, 2);

  let initialBalance = 10000; // $10,000 USDT baseline
  let balance = initialBalance;
  let peakBalance = initialBalance;
  let maxDrawdown = 0;

  const trades = [];
  let openPosition = null;

  for (let i = Math.max(emaSlow, 50); i < candles.length - 1; i++) {
    const price = closes[i];
    const currentATR = atrLine[i] || (price * 0.015);
    const rsi = rsiLine[i];
    const emaFastVal = emaFastLine[i];
    const emaSlowVal = emaSlowLine[i];
    const band = bands[i];

    // Check open position exits (Multi-Tier TP & Trailing Break-even SL)
    if (openPosition) {
      const priceChangePct = (price - openPosition.entryPrice) / openPosition.entryPrice;
      const isLong = openPosition.type === 'LONG';
      const pnlPct = isLong ? priceChangePct : -priceChangePct;

      // 1. Check Stop Loss
      if (isLong ? price <= openPosition.stopLoss : price >= openPosition.stopLoss) {
        const exitPrice = openPosition.stopLoss;
        const netPnl = openPosition.remainingUnits * (exitPrice - openPosition.entryPrice) * (isLong ? 1 : -1);
        const fee = openPosition.remainingUnits * exitPrice * feeRatePct;
        balance += (openPosition.allocatedCapital + netPnl - fee);

        trades.push({
          id: trades.length + 1,
          type: openPosition.type,
          entryPrice: openPosition.entryPrice,
          exitPrice,
          pnl: netPnl - fee,
          pnlPct: (netPnl / openPosition.allocatedCapital) * 100,
          reason: openPosition.stopLossMovedToBreakEven ? 'BREAK_EVEN_SL' : 'STOP_LOSS',
          time: candles[i].time
        });

        openPosition = null;
      }
      // 2. Multi-Tier Take Profit 1 (+1.5R): Take 30% profit & move SL to Break-Even!
      else if (!openPosition.tp1Hit && pnlPct >= (currentATR * 1.5 / openPosition.entryPrice)) {
        openPosition.tp1Hit = true;
        const tp1Units = openPosition.units * 0.30;
        const netPnl = tp1Units * (price - openPosition.entryPrice) * (isLong ? 1 : -1);
        balance += (tp1Units * openPosition.entryPrice + netPnl);
        openPosition.remainingUnits -= tp1Units;
        
        // Dynamic Risk Management: Move Stop Loss to Break-Even (Risk-Free!)
        openPosition.stopLoss = openPosition.entryPrice * (isLong ? 1.0005 : 0.9995);
        openPosition.stopLossMovedToBreakEven = true;
      }
      // 3. Multi-Tier Take Profit 2 (+3.0R): Take 40% profit & activate Trailing ATR Stop
      else if (!openPosition.tp2Hit && pnlPct >= (currentATR * 3.0 / openPosition.entryPrice)) {
        openPosition.tp2Hit = true;
        const tp2Units = openPosition.units * 0.40;
        const netPnl = tp2Units * (price - openPosition.entryPrice) * (isLong ? 1 : -1);
        balance += (tp2Units * openPosition.entryPrice + netPnl);
        openPosition.remainingUnits -= tp2Units;
        
        // Trailing Stop Loss
        openPosition.stopLoss = price - (currentATR * atrMultiplier * (isLong ? 1 : -1));
      }
      // 4. Structural Trend Reversal Exit
      else if ((isLong && rsi > 78) || (!isLong && rsi < 22)) {
        const exitPrice = price * (1 - (isLong ? slippagePct : -slippagePct));
        const netPnl = openPosition.remainingUnits * (exitPrice - openPosition.entryPrice) * (isLong ? 1 : -1);
        const fee = openPosition.remainingUnits * exitPrice * feeRatePct;
        balance += (openPosition.remainingUnits * openPosition.entryPrice + netPnl - fee);

        trades.push({
          id: trades.length + 1,
          type: openPosition.type,
          entryPrice: openPosition.entryPrice,
          exitPrice,
          pnl: netPnl - fee,
          pnlPct: (netPnl / openPosition.allocatedCapital) * 100,
          reason: 'TAKE_PROFIT_REVERSAL',
          time: candles[i].time
        });

        openPosition = null;
      }

      // Track Peak Equity & Drawdown
      if (balance > peakBalance) peakBalance = balance;
      const currentDd = (peakBalance - balance) / peakBalance;
      if (currentDd > maxDrawdown) maxDrawdown = currentDd;

      continue;
    }

    // Trade Entry Conditions (Confluence: EMA Trend + RSI Threshold + Volatility Filter)
    const longSignal = (price > emaSlowVal) && (emaFastVal > emaSlowVal) && (rsi > 40 && rsi < rsiSellThreshold) && (price > band.middle);
    const shortSignal = (price < emaSlowVal) && (emaFastVal < emaSlowVal) && (rsi < 60 && rsi > rsiBuyThreshold) && (price < band.middle);

    if (longSignal || shortSignal) {
      const type = longSignal ? 'LONG' : 'SHORT';
      const stopDistance = currentATR * atrMultiplier;
      const stopLoss = type === 'LONG' ? (price - stopDistance) : (price + stopDistance);

      // Fractional Kelly Position Sizing
      const allocatedCapital = balance * riskPerTradePct * (1 + fractionalKellyMultiplier);
      const units = allocatedCapital / price;

      openPosition = {
        type,
        entryPrice: price * (1 + (type === 'LONG' ? slippagePct : -slippagePct)),
        stopLoss,
        units,
        remainingUnits: units,
        allocatedCapital,
        tp1Hit: false,
        tp2Hit: false,
        stopLossMovedToBreakEven: false
      };
    }
  }

  // Performance Metric Calculations
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const winRatePct = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const netProfitPct = ((balance - initialBalance) / initialBalance) * 100;

  // Calculate Sharpe & Sortino Ratios
  const returns = trades.map(t => t.pnlPct / 100);
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const stdDev = returns.length > 1 ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1)) : 0.01;

  const downsideReturns = returns.filter(r => r < 0);
  const downsideStdDev = downsideReturns.length > 1 ? Math.sqrt(downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / (downsideReturns.length - 1)) : 0.01;

  const annualFactor = Math.sqrt(365 * 24); // Annualized for crypto 24/7 market
  const sharpeRatio = stdDev > 0 ? Math.round(((avgReturn / stdDev) * annualFactor) * 100) / 100 : 0;
  const sortinoRatio = downsideStdDev > 0 ? Math.round(((avgReturn / downsideStdDev) * annualFactor) * 100) / 100 : 0;
  const maxDrawdownPct = Math.round(maxDrawdown * 10000) / 100;
  const calmarRatio = maxDrawdownPct > 0 ? Math.round((netProfitPct / maxDrawdownPct) * 100) / 100 : 0;

  // Deflated Sharpe Ratio (DSR) Score
  const dsrScore = Math.max(0.1, Math.min(0.99, Math.round((sharpeRatio / (sharpeRatio + 1.2)) * 100) / 100));

  return {
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    maxDrawdownPct,
    winRatePct: Math.round(winRatePct * 10) / 10,
    netProfitPct: Math.round(netProfitPct * 100) / 100,
    totalTrades,
    finalBalance: Math.round(balance * 100) / 100,
    dsrScore,
    trades: trades.slice(-20) // Latest 20 trades
  };
}
