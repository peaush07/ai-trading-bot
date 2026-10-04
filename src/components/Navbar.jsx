import React from 'react';
import { Cpu, TrendingUp, BarChart2, ShieldAlert, Settings, RefreshCw, Zap, PlayCircle, PauseCircle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, state, onTriggerOptimize, onToggleAutoTrader }) {
  const symbol = state?.symbol || 'BTCUSDT';
  const price = state?.currentPrice || 85300;
  const isPaper = state?.binance?.tradingMode !== 'BINANCE';
  const isOptimizing = state?.isOptimizing;
  const isAutoTradingEnabled = state?.autoTrader?.isAutoTradingEnabled;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Live Ticker */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Cpu className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">QUANTUM <span className="text-cyan-400">AI</span></span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                v2.6 Self-Improving
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {symbol}: <span className="text-slate-100 font-semibold">\${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'chart'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Live Market
          </button>

          <button
            onClick={() => setActiveTab('evolution')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'evolution'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-4 h-4" />
            AI Evolution
            {isOptimizing && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>}
          </button>

          <button
            onClick={() => setActiveTab('options')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'options'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Options & Research
          </button>

          <button
            onClick={() => setActiveTab('desk')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'desk'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Paper Desk
          </button>
        </nav>

        {/* Action Controls: Auto-Trader Toggle, Evolve, Mode Status */}
        <div className="flex items-center gap-2.5">
          
          {/* Auto-Trader Switch */}
          <button
            onClick={() => onToggleAutoTrader(!isAutoTradingEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isAutoTradingEnabled
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            {isAutoTradingEnabled ? (
              <>
                <PlayCircle className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Auto-Pilot: ON</span>
              </>
            ) : (
              <>
                <PauseCircle className="w-4 h-4 text-slate-400" />
                <span>Auto-Pilot: OFF</span>
              </>
            )}
          </button>

          <button
            onClick={onTriggerOptimize}
            disabled={isOptimizing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isOptimizing
                ? 'bg-amber-950/60 border-amber-800/60 text-amber-400 cursor-not-allowed'
                : 'bg-cyan-950/50 hover:bg-cyan-900/60 border-cyan-700/50 text-cyan-300 shadow-sm'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin text-amber-400' : ''}`} />
            {isOptimizing ? 'Evolving AI...' : 'Evolve Strategy'}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              isPaper
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400'
                : 'bg-rose-950/40 border-rose-800/50 text-rose-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isPaper ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            {isPaper ? 'Paper Mode' : 'Binance Live'}
            <Settings className="w-3.5 h-3.5 ml-0.5 opacity-70" />
          </button>

        </div>

      </div>
    </header>
  );
}
