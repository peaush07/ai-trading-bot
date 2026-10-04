/**
 * Fullstack Express & WebSocket Control Server for Self-Improving AI Trading Bot
 */
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { fetchHistoricalKlines, startLiveTickerStream, getLatestPrice, SUPPORTED_PAIRS } from './engine/dataFetcher.js';
import { classifyMarketRegime } from './engine/regimeDetector.js';
import { computeOptionsAnalytics } from './engine/optionsAnalytics.js';
import { fetchMarketSentiment } from './engine/sentimentFetcher.js';
import { getActiveStrategy, getEvolutionHistory, isOptimizing, runSelfImprovementCycle } from './engine/optimizer.js';
import { getPaperAccountState, executePaperTrade, closePaperPosition, emergencyCloseAllPositions, updatePaperBrokerTick } from './engine/paperBroker.js';
import { getBinanceConfig, updateBinanceConfig, fetchBinanceBalance } from './engine/binanceBroker.js';
import { getAutoTraderStatus, setAutoTradingStatus, runAutoTraderTick } from './engine/autoTrader.js';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

// Initialize Live Market Feeds
const symbolsToStream = SUPPORTED_PAIRS.map(p => p.symbol);
startLiveTickerStream(symbolsToStream, () => {
  broadcastWssState();
});

// Periodic background engine ticks
setInterval(() => {
  updatePaperBrokerTick();
  broadcastWssState();
}, 1000);

// Autonomous Auto-Trader Tick (Every 5 seconds)
setInterval(() => {
  runAutoTraderTick();
}, 5000);

// API Routes

// 1. Full Telemetry State
app.get('/api/state', async (req, res) => {
  const symbol = req.query.symbol || 'BTCUSDT';
  const timeframe = req.query.timeframe || '15m';

  const candles = await fetchHistoricalKlines(symbol, timeframe, 150);
  const regime = classifyMarketRegime(candles);
  const options = computeOptionsAnalytics(symbol.replace('USDT', ''), candles[candles.length - 1]?.close || 85300);
  const sentiment = await fetchMarketSentiment(symbol.replace('USDT', ''));
  const strategy = getActiveStrategy();
  const evolution = getEvolutionHistory();
  const paperState = getPaperAccountState();
  const binanceState = getBinanceConfig();
  const autoTrader = getAutoTraderStatus();

  res.json({
    symbol,
    timeframe,
    currentPrice: getLatestPrice(symbol),
    regime,
    options,
    sentiment,
    strategy,
    isOptimizing: isOptimizing(),
    evolutionHistory: evolution,
    paper: paperState,
    binance: binanceState,
    autoTrader
  });
});

// 2. Klines / Candles Endpoint
app.get('/api/candles', async (req, res) => {
  const symbol = req.query.symbol || 'BTCUSDT';
  const timeframe = req.query.timeframe || '15m';
  const limit = parseInt(req.query.limit || '200');

  const candles = await fetchHistoricalKlines(symbol, timeframe, limit);
  res.json({ symbol, timeframe, candles });
});

// 3. Autonomous Auto-Trader Toggle
app.post('/api/autotrader/toggle', (req, res) => {
  const { enabled } = req.body;
  const status = setAutoTradingStatus(enabled);
  res.json({ success: true, status });
});

// 4. Trigger AI Self-Improvement Evolution Cycle
app.post('/api/optimize/trigger', async (req, res) => {
  const symbol = req.body.symbol || 'BTCUSDT';
  const generations = req.body.generations || 5;

  runSelfImprovementCycle(symbol, generations);
  res.json({ success: true, message: `AI Self-Improvement loop initiated for ${symbol}` });
});

// 5. Paper Trading Actions
app.post('/api/paper/trade', (req, res) => {
  const { symbol = 'BTCUSDT', type = 'LONG', capitalPct = 0.02 } = req.body;
  const result = executePaperTrade(symbol, type, capitalPct);
  res.json(result);
});

app.post('/api/paper/close', (req, res) => {
  const { positionId } = req.body;
  const result = closePaperPosition(positionId);
  res.json(result);
});

app.post('/api/paper/emergency-close', (req, res) => {
  const result = emergencyCloseAllPositions();
  res.json(result);
});

// 6. Binance Settings
app.post('/api/binance/config', (req, res) => {
  const result = updateBinanceConfig(req.body);
  res.json({ success: true, config: result });
});

app.get('/api/binance/balance', async (req, res) => {
  const result = await fetchBinanceBalance();
  res.json(result);
});

function broadcastWssState() {
  if (wss.clients.size === 0) return;

  const symbol = 'BTCUSDT';
  const currentPrice = getLatestPrice(symbol);
  const paperState = getPaperAccountState();

  const payload = JSON.stringify({
    type: 'TICK_UPDATE',
    timestamp: Date.now(),
    symbol,
    currentPrice,
    equity: paperState.wallet.equity,
    unrealizedPnl: paperState.wallet.unrealizedPnl,
    activePositionsCount: paperState.activePositions.length,
    isOptimizing: isOptimizing()
  });

  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(payload);
  });
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[ControlServer] AI Trading Control Server running on http://0.0.0.0:${PORT}`);
});
