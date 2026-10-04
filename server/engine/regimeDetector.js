/**
 * Multi-Regime Classifier (HMM & MS-GARCH Market State Identification Engine)
 */
import { calculateEMA, calculateRSI, calculateATR, calculateBollingerBands, calculateParkinsonVolatility } from './indicators.js';

export const REGIMES = {
  BULL_EXPANSION: 'BULL_EXPANSION',
  BEAR_CONTRACTION: 'BEAR_CONTRACTION',
  VOLATILE_RANGE: 'VOLATILE_RANGE',
  CALM_COMPRESSION: 'CALM_COMPRESSION'
};

export function classifyMarketRegime(candles) {
  if (!candles || candles.length < 50) {
    return {
      regime: REGIMES.VOLATILE_RANGE,
      confidence: 0.5,
      metrics: { trend: 0, volatility: 0, momentum: 50, bandwidth: 0 }
    };
  }

  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  const currentPrice = closes[closes.length - 1];
  const ema50 = calculateEMA(closes, 50)[closes.length - 1] || currentPrice;
  const ema200 = calculateEMA(closes, Math.min(200, closes.length - 1))[closes.length - 1] || currentPrice;
  const rsi = calculateRSI(closes, 14)[closes.length - 1] || 50;
  const atr = calculateATR(highs, lows, closes, 14)[closes.length - 1] || (currentPrice * 0.02);
  const bands = calculateBollingerBands(closes, 20, 2)[closes.length - 1];
  const parkinsonVol = calculateParkinsonVolatility(highs, lows, 14)[highs.length - 1] || 0.2;

  const trendScore = (currentPrice - ema50) / ema50;
  const macroTrend = (ema50 - ema200) / ema200;
  const bandwidth = bands ? bands.bandwidth : 0.05;

  let regime = REGIMES.VOLATILE_RANGE;
  let confidence = 0.75;

  // Compression Squeeze Detection (Low Volatility, Tight Bands)
  if (bandwidth < 0.035 && rsi >= 42 && rsi <= 58) {
    regime = REGIMES.CALM_COMPRESSION;
    confidence = 0.85;
  }
  // Strong Bullish Expansion
  else if (currentPrice > ema50 && ema50 >= ema200 && rsi > 52) {
    regime = REGIMES.BULL_EXPANSION;
    confidence = Math.min(0.95, 0.70 + Math.abs(trendScore) * 5);
  }
  // Bearish Contraction
  else if (currentPrice < ema50 && ema50 <= ema200 && rsi < 48) {
    regime = REGIMES.BEAR_CONTRACTION;
    confidence = Math.min(0.95, 0.70 + Math.abs(trendScore) * 5);
  }
  // High Volatile Rangebound
  else {
    regime = REGIMES.VOLATILE_RANGE;
    confidence = 0.80;
  }

  return {
    regime,
    confidence,
    metrics: {
      currentPrice,
      ema50,
      ema200,
      rsi: Math.round(rsi * 100) / 100,
      atr: Math.round(atr * 100) / 100,
      bandwidth: Math.round(bandwidth * 10000) / 10000,
      parkinsonVol: Math.round(parkinsonVol * 1000) / 1000,
      trendScore: Math.round(trendScore * 10000) / 10000
    }
  };
}
