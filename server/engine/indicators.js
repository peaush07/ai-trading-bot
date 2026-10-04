/**
 * Technical Indicators Engine for Quantitative Trading Strategy Analysis
 */

export function calculateEMA(prices, period) {
  if (!prices || prices.length < period) return Array(prices.length).fill(null);
  const k = 2 / (period + 1);
  const ema = new Array(prices.length).fill(null);
  
  // Initial SMA as starting point
  let sum = 0;
  for (let i = 0; i < period; i++) sum += prices[i];
  ema[period - 1] = sum / period;

  for (let i = period; i < prices.length; i++) {
    ema[i] = prices[i] * k + ema[i - 1] * (1 - k);
  }
  return ema;
}

export function calculateRSI(prices, period = 14) {
  if (!prices || prices.length <= period) return Array(prices.length).fill(50);
  const rsi = new Array(prices.length).fill(50);
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - diff) / period;
    }

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - (100 / (1 + rs));
    }
  }
  return rsi;
}

export function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  const macdLine = new Array(prices.length).fill(0);

  for (let i = 0; i < prices.length; i++) {
    if (fastEMA[i] !== null && slowEMA[i] !== null) {
      macdLine[i] = fastEMA[i] - slowEMA[i];
    }
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram = new Array(prices.length).fill(0);

  for (let i = 0; i < prices.length; i++) {
    if (signalLine[i] !== null) {
      histogram[i] = macdLine[i] - signalLine[i];
    }
  }

  return { macdLine, signalLine, histogram };
}

export function calculateATR(highs, lows, closes, period = 14) {
  if (!highs || highs.length < period) return Array(highs.length).fill(0);
  const tr = new Array(highs.length).fill(0);

  tr[0] = highs[0] - lows[0];
  for (let i = 1; i < highs.length; i++) {
    const hl = highs[i] - lows[i];
    const hc = Math.abs(highs[i] - closes[i - 1]);
    const lc = Math.abs(lows[i] - closes[i - 1]);
    tr[i] = Math.max(hl, hc, lc);
  }

  const atr = new Array(highs.length).fill(0);
  let sum = 0;
  for (let i = 0; i < period; i++) sum += tr[i];
  atr[period - 1] = sum / period;

  for (let i = period; i < highs.length; i++) {
    atr[i] = (atr[i - 1] * (period - 1) + tr[i]) / period;
  }
  return atr;
}

export function calculateBollingerBands(prices, period = 20, stdDevMultiplier = 2) {
  const bands = new Array(prices.length).fill(null).map(() => ({ middle: 0, upper: 0, lower: 0, bandwidth: 0 }));

  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += prices[j];
    const mean = sum / period;

    let variance = 0;
    for (let j = i - period + 1; j <= i; j++) variance += Math.pow(prices[j] - mean, 2);
    const stdDev = Math.sqrt(variance / period);

    const upper = mean + stdDevMultiplier * stdDev;
    const lower = mean - stdDevMultiplier * stdDev;

    bands[i] = {
      middle: mean,
      upper,
      lower,
      bandwidth: mean !== 0 ? (upper - lower) / mean : 0
    };
  }
  return bands;
}

export function calculateParkinsonVolatility(highs, lows, period = 14) {
  const vol = new Array(highs.length).fill(0);
  const factor = 1 / (4 * Math.log(2));

  for (let i = period - 1; i < highs.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      if (lows[j] > 0) {
        const ratio = Math.log(highs[j] / lows[j]);
        sum += ratio * ratio;
      }
    }
    vol[i] = Math.sqrt(factor * (sum / period)) * Math.sqrt(365); // Annualized
  }
  return vol;
}
