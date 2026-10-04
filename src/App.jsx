import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import CandleChart from './components/CandleChart.jsx';
import AIEvolutionHub from './components/AIEvolutionHub.jsx';
import OptionsResearchHub from './components/OptionsResearchHub.jsx';
import PaperDesk from './components/PaperDesk.jsx';
import SettingsModal from './components/SettingsModal.jsx';

const CRYPTO_PAIRS = [
  { symbol: 'BTCUSDT', label: 'BTC/USDT', category: 'Crypto' },
  { symbol: 'ETHUSDT', label: 'ETH/USDT', category: 'Crypto' },
  { symbol: 'SOLUSDT', label: 'SOL/USDT', category: 'Crypto' }
];

const FOREX_PAIRS = [
  { symbol: 'EURUSD', label: 'EUR/USD', category: 'Forex' },
  { symbol: 'GBPUSD', label: 'GBP/USD', category: 'Forex' },
  { symbol: 'USDJPY', label: 'USD/JPY', category: 'Forex' },
  { symbol: 'XAUUSD', label: 'Gold (XAU/USD)', category: 'Commodities' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('chart');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [state, setState] = useState(null);
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchState = async () => {
    try {
      const res = await fetch(`/api/state?symbol=${symbol}&timeframe=15m`);
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.warn('Error fetching system state:', err.message);
    }
  };

  const fetchCandlesData = async () => {
    try {
      const res = await fetch(`/api/candles?symbol=${symbol}&timeframe=15m&limit=150`);
      if (res.ok) {
        const data = await res.json();
        setCandles(data.candles || []);
      }
    } catch (err) {
      console.warn('Error fetching candles:', err.message);
    }
  };

  useEffect(() => {
    fetchState();
    fetchCandlesData();
    setLoading(false);

    const interval = setInterval(() => {
      fetchState();
      fetchCandlesData();
    }, 2000);

    return () => clearInterval(interval);
  }, [symbol]);

  const handleToggleAutoTrader = async (enabled) => {
    try {
      await fetch('/api/autotrader/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      fetchState();
    } catch (e) {}
  };

  const handleTriggerOptimize = async () => {
    try {
      await fetch('/api/optimize/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, generations: 5 })
      });
      fetchState();
    } catch (e) {}
  };

  const handleExecutePaperTrade = async (sym, type) => {
    try {
      await fetch('/api/paper/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: sym, type, capitalPct: 0.02 })
      });
      fetchState();
    } catch (e) {}
  };

  const handleClosePosition = async (positionId) => {
    try {
      await fetch('/api/paper/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId })
      });
      fetchState();
    } catch (e) {}
  };

  const handleEmergencyClose = async () => {
    try {
      await fetch('/api/paper/emergency-close', { method: 'POST' });
      fetchState();
    } catch (e) {}
  };

  const handleSaveConfig = async (newConfig) => {
    try {
      await fetch('/api/binance/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      fetchState();
    } catch (e) {}
  };

  if (loading && !state) {
    return (
      <div className="min-h-screen bg-slate-950 text-cyan-400 flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Booting Autonomous Quantum AI Engine (Crypto & Forex)...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        state={state}
        onTriggerOptimize={handleTriggerOptimize}
        onToggleAutoTrader={handleToggleAutoTrader}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Multi-Asset Symbol Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-3 rounded-2xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mr-1">Crypto:</span>
            {CRYPTO_PAIRS.map((item) => (
              <button
                key={item.symbol}
                onClick={() => setSymbol(item.symbol)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                  symbol === item.symbol
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}

            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider ml-2 mr-1">Forex & Gold:</span>
            {FOREX_PAIRS.map((item) => (
              <button
                key={item.symbol}
                onClick={() => setSymbol(item.symbol)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                  symbol === item.symbol
                    ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}

          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">Auto-Pilot: <strong className={state?.autoTrader?.isAutoTradingEnabled ? 'text-emerald-400' : 'text-slate-500'}>{state?.autoTrader?.isAutoTradingEnabled ? 'ACTIVE [ON]' : 'PAUSED [OFF]'}</strong></span>
            <span className="text-slate-400">Regime: <strong className="text-cyan-400">{state?.regime?.regime || 'BULL_EXPANSION'}</strong></span>
          </div>
        </div>

        {/* Tab 1: Live Market & Chart */}
        {activeTab === 'chart' && (
          <div className="space-y-6">
            <CandleChart
              candles={candles}
              activePositions={state?.paper?.activePositions || []}
              currentPrice={state?.currentPrice}
            />

            {/* Quick Order Bar */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Quick Order Desk ({symbol})</h4>
                <p className="text-xs text-slate-400 font-mono">Execute micro-trade order based on active self-improving strategy rules.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleExecutePaperTrade(symbol, 'LONG')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
                >
                  Buy / LONG ({symbol})
                </button>
                <button
                  onClick={() => handleExecutePaperTrade(symbol, 'SHORT')}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-rose-500/20"
                >
                  Sell / SHORT ({symbol})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Self-Improvement Hub */}
        {activeTab === 'evolution' && (
          <AIEvolutionHub
            strategy={state?.strategy}
            history={state?.evolutionHistory}
            isOptimizing={state?.isOptimizing}
            onTriggerOptimize={handleTriggerOptimize}
          />
        )}

        {/* Tab 3: Options & News Research Hub */}
        {activeTab === 'options' && (
          <OptionsResearchHub
            regime={state?.regime}
            options={state?.options}
            sentiment={state?.sentiment}
          />
        )}

        {/* Tab 4: Paper Desk */}
        {activeTab === 'desk' && (
          <PaperDesk
            paper={state?.paper}
            currentPrice={state?.currentPrice}
            onExecuteTrade={handleExecutePaperTrade}
            onClosePosition={handleClosePosition}
            onEmergencyClose={handleEmergencyClose}
          />
        )}

        {/* Tab 5: Settings */}
        {activeTab === 'settings' && (
          <SettingsModal
            binance={state?.binance}
            onSaveConfig={handleSaveConfig}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-900 py-3 px-4 text-center text-xs text-slate-500 font-mono">
        Quantum AI Trading Engine &copy; 2026. Autonomous Auto-Pilot Framework.
      </footer>
    </div>
  );
}
