/**
 * Autonomous Auto-Trader Engine (Auto-Pilot Execution Loop)
 * Automatically scans market regimes, indicator signals, and executes trades autonomously when active
 */
import { fetchHistoricalKlines, getLatestPrice, SUPPORTED_PAIRS } from './dataFetcher.js';
import { classifyMarketRegime, REGIMES } from './regimeDetector.js';
import { getActiveStrategy } from './optimizer.js';
import { executePaperTrade, getPaperAccountState } from './paperBroker.js';
import { calculateEMA, calculateRSI, calculateATR, calculateBollingerBands } from './indicators.js';

let isAutoTradingEnabled = true; // Auto-Trading ON by default!
let autoTradeLogs = [];
let lastTradeTimes = new Map(); // Cooldown tracker to prevent over-trading

export function getAutoTraderStatus() {
  return {
    isAutoTradingEnabled,
    autoTradeLogs: autoTradeLogs.slice(-30)
  };
}

export function setAutoTradingStatus(enabled) {
  isAutoTradingEnabled = Boolean(enabled);
  logAutoAction(`Autonomous Auto-Trader switched ${isAutoTradingEnabled ? 'ON [AUTO-PILOT ACTIVE]' : 'OFF [PAUSED]'}`);
  return getAutoTraderStatus();
}

export async function runAutoTraderTick() {
  if (!isAutoTradingEnabled) return;

  const strategy = getActiveStrategy();
  const paperState = getPaperAccountState();

  // Maximum active positions limit (e.g. max 4 positions simultaneously for safety)
  if (paperState.activePositions.length >= 4) return;

  // Scan pairs for high-probability signals
  for (const pair of SUPPORTED_PAIRS) {
    const symbol = pair.symbol;

    // Cooldown check (don't open trade on same symbol within 3 minutes)
    const lastTime = lastTradeTimes.get(symbol) || 0;
    if (Date.now() - lastTime < 180000) continue;

    // Don't open duplicate trades on same symbol
    const existingPos = paperState.activePositions.find(p => p.symbol === symbol);
    if (existingPos) continue;

    try {
      const candles = await fetchHistoricalKlines(symbol, '15m', 80);
      if (!candles || candles.length < 50) continue;

      const closes = candles.map(c => c.close);
      const highs = candles.map(c => c.high);
      const lows = candles.map(c => c.low);

      const regime = classifyMarketRegime(candles);
      const currentPrice = closes[closes.length - 1];

      const emaFast = calculateEMA(closes, strategy.emaFast || 12)[closes.length - 1];
      const emaSlow = calculateEMA(closes, strategy.emaSlow || 50)[closes.length - 1];
      const rsi = calculateRSI(closes, strategy.rsiPeriod || 14)[closes.length - 1];
      const bands = calculateBollingerBands(closes, 20, 2)[closes.length - 1];

      // Auto Signals
      let signalType = null;

      // 1. Bull Expansion / Squeeze Breakout Entry
      if (
        (regime.regime === REGIMES.BULL_EXPANSION || regime.regime === REGIMES.CALM_COMPRESSION) &&
        emaFast > emaSlow &&
        rsi > 42 && rsi < 68 &&
        currentPrice > (bands ? bands.middle : currentPrice)
      ) {
        signalType = 'LONG';
      }
      // 2. Bear Contraction Entry
      else if (
        regime.regime === REGIMES.BEAR_CONTRACTION &&
        emaFast < emaSlow &&
        rsi < 58 && rsi > 32 &&
        currentPrice < (bands ? bands.middle : currentPrice)
      ) {
        signalType = 'SHORT';
      }

      if (signalType) {
        const result = executePaperTrade(symbol, signalType, 0.02);
        if (result.success) {
          lastTradeTimes.set(symbol, Date.now());
          logAutoAction(`🤖 AUTO-PILOT EXECUTION: Opened ${signalType} trade on ${pair.label} @ ${currentPrice} (Confluence: ${regime.regime}, RSI ${rsi.toFixed(1)})`);
        }
      }
    } catch (e) {
      console.warn(`[AutoTrader] Error checking signal for ${symbol}:`, e.message);
    }
  }
}

function logAutoAction(msg) {
  console.log(`[AutoTrader] ${msg}`);
  autoTradeLogs.unshift({
    timestamp: new Date().toLocaleTimeString(),
    message: msg
  });
  if (autoTradeLogs.length > 50) autoTradeLogs.pop();
}
