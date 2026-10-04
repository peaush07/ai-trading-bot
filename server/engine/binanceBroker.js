/**
 * Binance Live & Testnet Broker Adapter (CCXT Core Integration)
 */
import ccxt from 'ccxt';

let binanceExchange = null;
let binanceConfig = {
  apiKey: '',
  secret: '',
  isTestnet: true,
  isLiveEnabled: false,
  tradingMode: 'PAPER' // 'PAPER' or 'BINANCE'
};

export function getBinanceConfig() {
  return {
    isTestnet: binanceConfig.isTestnet,
    isLiveEnabled: binanceConfig.isLiveEnabled,
    tradingMode: binanceConfig.tradingMode,
    hasApiKey: Boolean(binanceConfig.apiKey && binanceConfig.secret)
  };
}

export function updateBinanceConfig(newConfig) {
  binanceConfig = {
    ...binanceConfig,
    ...newConfig
  };

  if (binanceConfig.apiKey && binanceConfig.secret) {
    try {
      binanceExchange = new ccxt.binance({
        apiKey: binanceConfig.apiKey,
        secret: binanceConfig.secret,
        enableRateLimit: true,
        options: {
          defaultType: 'future' // USDT-M Futures default
        }
      });

      if (binanceConfig.isTestnet) {
        binanceExchange.setSandboxMode(true);
      }
      console.log(`[BinanceBroker] Binance CCXT client initialized (Testnet: ${binanceConfig.isTestnet})`);
    } catch (err) {
      console.warn('[BinanceBroker] Error initializing CCXT exchange:', err.message);
    }
  }

  return getBinanceConfig();
}

export async function fetchBinanceBalance() {
  if (!binanceExchange || !binanceConfig.hasApiKey) {
    return { success: false, reason: 'API_KEYS_NOT_CONFIGURED' };
  }

  try {
    const balance = await binanceExchange.fetchBalance();
    return {
      success: true,
      usdtTotal: balance.total?.USDT || 0,
      usdtFree: balance.free?.USDT || 0,
      usdtUsed: balance.used?.USDT || 0
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function executeBinanceTrade(symbol = 'BTC/USDT', side = 'buy', amount = 0.001) {
  if (!binanceExchange || !binanceConfig.isLiveEnabled) {
    return { success: false, reason: 'BINANCE_LIVE_TRADING_DISABLED' };
  }

  try {
    const order = await binanceExchange.createMarketOrder(symbol, side, amount);
    console.log(`[BinanceBroker] Order executed on Binance: ${order.id}`);
    return { success: true, order };
  } catch (error) {
    console.error('[BinanceBroker] Trade execution failed:', error.message);
    return { success: false, error: error.message };
  }
}
