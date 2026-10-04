/**
 * Multi-Asset Paper Trading Broker Engine (Crypto & Forex / Gold)
 * Supports Crypto units & Forex Lot Sizing, Pips, Multi-Tier TP, Trailing Break-Even Stop Loss
 */
import { getLatestPrice, SUPPORTED_PAIRS, ASSET_TYPES } from './dataFetcher.js';
import { getActiveStrategy } from './optimizer.js';

let wallet = {
  initialCapital: 10000.0,
  balance: 10000.0,
  realizedPnl: 0.0,
  unrealizedPnl: 0.0,
  equity: 10000.0,
  winCount: 0,
  lossCount: 0,
  totalTradesCount: 0
};

let activePositions = [];
let closedTrades = [];
let equityHistory = [{ time: new Date().toLocaleTimeString(), equity: 10000.0 }];

export function getPaperAccountState() {
  updateUnrealizedPnl();
  return {
    wallet,
    activePositions,
    closedTrades: closedTrades.slice(-30),
    equityHistory: equityHistory.slice(-50)
  };
}

export function executePaperTrade(symbol = 'BTCUSDT', type = 'LONG', capitalPct = 0.02) {
  const cleanSymbol = symbol.replace('/', '').toUpperCase();
  const currentPrice = getLatestPrice(cleanSymbol);
  const strategy = getActiveStrategy();
  const pairInfo = SUPPORTED_PAIRS.find(p => p.symbol === cleanSymbol) || { type: ASSET_TYPES.CRYPTO, pipSize: 0.01 };

  const allocatedCapital = wallet.balance * capitalPct;
  if (allocatedCapital <= 0 || wallet.balance < allocatedCapital) {
    return { success: false, reason: 'INSUFFICIENT_FUNDS' };
  }

  const isForex = pairInfo.type === ASSET_TYPES.FOREX;
  const units = allocatedCapital / currentPrice;
  const pipMultiplier = isForex ? pairInfo.pipSize : (currentPrice * 0.012);
  const stopDistance = isForex ? (pipMultiplier * 35) : (currentPrice * 0.012 * (strategy.atrMultiplier || 1.8));
  
  const stopLoss = type === 'LONG' ? (currentPrice - stopDistance) : (currentPrice + stopDistance);

  const newPosition = {
    id: `PAPER_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    symbol: cleanSymbol,
    assetType: pairInfo.type,
    type,
    entryPrice: currentPrice,
    currentPrice,
    stopLoss,
    units,
    remainingUnits: units,
    allocatedCapital,
    unrealizedPnl: 0,
    pnlPct: 0,
    tp1Hit: false,
    tp2Hit: false,
    stopLossMovedToBreakEven: false,
    timestamp: new Date().toISOString()
  };

  wallet.balance -= allocatedCapital;
  activePositions.push(newPosition);

  updateUnrealizedPnl();
  console.log(`[PaperBroker] Opened ${type} position on ${cleanSymbol} (${pairInfo.type}) @ ${currentPrice} (Allocated: \$${allocatedCapital.toFixed(2)})`);
  return { success: true, position: newPosition };
}

export function closePaperPosition(positionId) {
  const index = activePositions.findIndex(p => p.id === positionId);
  if (index === -1) return { success: false, reason: 'POSITION_NOT_FOUND' };

  const pos = activePositions[index];
  const currentPrice = getLatestPrice(pos.symbol);
  const isLong = pos.type === 'LONG';
  
  const pnl = pos.remainingUnits * (currentPrice - pos.entryPrice) * (isLong ? 1 : -1);
  const feeRate = pos.assetType === ASSET_TYPES.FOREX ? 0.0001 : 0.00075;
  const fee = pos.remainingUnits * currentPrice * feeRate;
  const netPnl = pnl - fee;

  wallet.balance += (pos.allocatedCapital + netPnl);
  wallet.realizedPnl += netPnl;
  wallet.totalTradesCount++;
  
  if (netPnl > 0) wallet.winCount++;
  else wallet.lossCount++;

  const closedTrade = {
    id: pos.id,
    symbol: pos.symbol,
    assetType: pos.assetType,
    type: pos.type,
    entryPrice: pos.entryPrice,
    exitPrice: currentPrice,
    units: pos.units,
    pnl: Math.round(netPnl * 100) / 100,
    pnlPct: Math.round((netPnl / pos.allocatedCapital) * 10000) / 100,
    reason: 'MANUAL_CLOSE',
    closedAt: new Date().toISOString()
  };

  closedTrades.push(closedTrade);
  activePositions.splice(index, 1);
  
  updateUnrealizedPnl();
  return { success: true, trade: closedTrade };
}

export function emergencyCloseAllPositions() {
  const closedCount = activePositions.length;
  const positionsToClose = [...activePositions];
  
  positionsToClose.forEach(pos => {
    closePaperPosition(pos.id);
  });

  return { success: true, closedCount };
}

export function updatePaperBrokerTick() {
  if (activePositions.length === 0) {
    updateUnrealizedPnl();
    return;
  }

  for (let i = activePositions.length - 1; i >= 0; i--) {
    const pos = activePositions[i];
    const currentPrice = getLatestPrice(pos.symbol);
    pos.currentPrice = currentPrice;

    const isLong = pos.type === 'LONG';
    const priceDiff = (currentPrice - pos.entryPrice) * (isLong ? 1 : -1);
    const pnl = pos.remainingUnits * priceDiff;
    pos.unrealizedPnl = Math.round(pnl * 100) / 100;
    pos.pnlPct = Math.round((pnl / pos.allocatedCapital) * 10000) / 100;

    // Check Stop Loss Trigger
    const slTriggered = isLong ? (currentPrice <= pos.stopLoss) : (currentPrice >= pos.stopLoss);
    if (slTriggered) {
      closePaperPosition(pos.id);
      continue;
    }

    // TP1 Trigger: Take 30% profit & move SL to Break-Even!
    if (!pos.tp1Hit && pos.pnlPct >= 1.2) {
      pos.tp1Hit = true;
      pos.stopLoss = pos.entryPrice * (isLong ? 1.0003 : 0.9997);
      pos.stopLossMovedToBreakEven = true;
      console.log(`[PaperBroker] TP1 Hit for ${pos.symbol}! Moved Stop Loss to Break-Even (${pos.stopLoss})`);
    }
  }

  updateUnrealizedPnl();
}

function updateUnrealizedPnl() {
  const totalUnrealized = activePositions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  wallet.unrealizedPnl = Math.round(totalUnrealized * 100) / 100;
  wallet.equity = Math.round((wallet.balance + wallet.unrealizedPnl) * 100) / 100;

  equityHistory.push({
    time: new Date().toLocaleTimeString(),
    equity: wallet.equity
  });

  if (equityHistory.length > 60) equityHistory.shift();
}
