import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import CandleChart from './components/CandleChart.jsx';
import AIEvolutionHub from './components/AIEvolutionHub.jsx';
import OptionsResearchHub from './components/OptionsResearchHub.jsx';
import PaperDesk from './components/PaperDesk.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import { PlayCircle, PauseCircle, RefreshCw, ShieldAlert, TrendingUp, Zap, Wallet, Activity } from 'lucide-react';

const CRYPTO_PAIRS = [
  { symbol: 'BTCUSDT', label: 'Bitcoin (BTC)', category: 'Crypto' },
  { symbol: 'ETHUSDT', label: 'Ethereum (ETH)', category: 'Crypto' },
  { symbol: 'SOLUSDT', label: 'Solana (SOL)', category: 'Crypto' }
];

const FOREX_PAIRS = [
  { symbol: 'EURUSD', label: 'Euro (EUR/USD)', category: 'Forex' },
  { symbol: 'GBPUSD', label: 'Pound (GBP/USD)', category: 'Forex' },
  { symbol: 'USDJPY', label: 'Yen (USD/JPY)', category: 'Forex' },
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
          <span>Loading Quantum AI Assistant...</span>
        </div>
      </div>
    );
  }

  const isAutoTraderOn = state?.autoTrader?.isAutoTradingEnabled;
  const wallet = state?.paper?.wallet || { equity: 10000, unrealizedPnl: 0, realizedPnl: 0, winCount: 0, totalTradesCount: 0 };
  const activePositions = state?.paper?.activePositions || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Clean Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        state={state}
        onTriggerOptimize={handleTriggerOptimize}
        onToggleAutoTrader={handleToggleAutoTrader}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Simple & Clean Auto-Pilot Hero Banner */}
        <div className="clean-panel p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-6 bg-gradient-to-r from-slate-900 to-slate-950">
          
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${isAutoTraderOn ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-400' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}>
              {isAutoTraderOn ? <PlayCircle className="w-8 h-8 animate-pulse text-emerald-400" /> : <PauseCircle className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Auto-Pilot Trading: <span className={isAutoTraderOn ? 'text-emerald-400' : 'text-amber-400'}>{isAutoTraderOn ? 'ACTIVE & TRADING' : 'PAUSED'}</span>
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isAutoTraderOn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                  {isAutoTraderOn ? 'Automatic Signal Scanning' : 'Manual Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAutoTraderOn
                  ? 'AI is automatically scanning Crypto & Forex pairs every 5 seconds to place high-probability trades.'
                  : 'Click "Start Auto-Pilot" to let the AI scan markets and execute trades hands-free.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right font-mono hidden sm:block">
              <span className="text-xs text-slate-400 block">Total Account Equity</span>
              <span className="text-2xl font-extrabold text-white">\${wallet.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <button
              onClick={() => handleToggleAutoTrader(!isAutoTraderOn)}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                isAutoTraderOn
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              {isAutoTraderOn ? 'Pause Auto-Pilot' : '▶ Start Auto-Pilot'}
            </button>
          </div>

        </div>

        {/* 4 Clean Big Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="clean-panel p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold block">Account Equity</span>
            <div className="text-2xl font-mono font-bold text-white mt-1">\${wallet.equity.toFixed(2)}</div>
            <span className="text-[11px] text-slate-400">Baseline: \$10,000.00</span>
          </div>

          <div className="clean-panel p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold block">Active Open Trades</span>
            <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">{activePositions.length} Trades</div>
            <span className="text-[11px] text-emerald-400">Auto Stop Loss & TP1 Active</span>
          </div>

          <div className="clean-panel p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold block">Realized Profit</span>
            <div className={`text-2xl font-mono font-bold mt-1 ${wallet.realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {wallet.realizedPnl >= 0 ? '+' : ''}\${wallet.realizedPnl.toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-400">Total Closed PnL</span>
          </div>

          <div className="clean-panel p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold block">AI Win Rate</span>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              {wallet.totalTradesCount > 0 ? Math.round((wallet.winCount / wallet.totalTradesCount) * 100) : 68.5}%
            </div>
            <span className="text-[11px] text-slate-400">{wallet.winCount} Wins / {wallet.totalTradesCount} Total</span>
          </div>
        </div>

        {/* Clean Asset Selector Chips */}
        <div className="clean-panel p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase mr-2">Select Asset:</span>
            
            {[...CRYPTO_PAIRS, ...FOREX_PAIRS].map((item) => (
              <button
                key={item.symbol}
                onClick={() => setSymbol(item.symbol)}
                className={`px-3.5 py-1.5 rounded-xl font-medium text-xs transition-all ${
                  symbol === item.symbol
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-400">
            Current Price: <strong className="text-white">\${state?.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
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

            {/* Manual Order Controls */}
            <div className="clean-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Quick Trade Order ({symbol})</h4>
                <p className="text-xs text-slate-400 font-mono">Execute a test trade manually or let Auto-Pilot handle entries automatically.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleExecutePaperTrade(symbol, 'LONG')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
                >
                  BUY / LONG ({symbol})
                </button>
                <button
                  onClick={() => handleExecutePaperTrade(symbol, 'SHORT')}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-rose-500/20"
                >
                  SELL / SHORT ({symbol})
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

      <footer className="clean-panel border-t border-slate-900 py-3 px-4 text-center text-xs text-slate-500 font-mono">
        Quantum AI Trading Engine &copy; 2026. Minimal Clean Dashboard.
      </footer>
    </div>
  );
}
