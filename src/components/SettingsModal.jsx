import React, { useState } from 'react';
import { Settings, ShieldCheck, Key, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';

export default function SettingsModal({ binance, onSaveConfig }) {
  const [apiKey, setApiKey] = useState('');
  const [secret, setSecret] = useState('');
  const [isTestnet, setIsTestnet] = useState(binance?.isTestnet ?? true);
  const [tradingMode, setTradingMode] = useState(binance?.tradingMode || 'PAPER');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig({
      apiKey,
      secret,
      isTestnet,
      tradingMode,
      isLiveEnabled: tradingMode === 'BINANCE'
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-3xl mx-auto space-y-6">
      
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">System & Binance Exchange Settings</h2>
          <p className="text-xs text-slate-400">Configure Paper Simulator vs. Binance Exchange API readiness and risk guardrails.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Trading Mode Switch */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="text-xs text-slate-300 font-semibold uppercase block">Execution Broker Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTradingMode('PAPER')}
              className={`p-3 rounded-xl text-xs font-bold border text-left transition-all ${
                tradingMode === 'PAPER'
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>Paper Trading Simulator</span>
                {tradingMode === 'PAPER' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] font-normal text-slate-400 mt-1">100% Risk-Free paper wallet (\$10,000 USDT) with live Binance data feeds.</p>
            </button>

            <button
              type="button"
              onClick={() => setTradingMode('BINANCE')}
              className={`p-3 rounded-xl text-xs font-bold border text-left transition-all ${
                tradingMode === 'BINANCE'
                  ? 'bg-rose-950/60 border-rose-700 text-rose-300 shadow-md shadow-rose-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>Binance Exchange Mode</span>
                {tradingMode === 'BINANCE' && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
              </div>
              <p className="text-[11px] font-normal text-slate-400 mt-1">Direct CCXT order execution on Binance Testnet or Production.</p>
            </button>
          </div>
        </div>

        {/* Binance API Keys Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              Binance API Credentials
            </span>
            <button
              type="button"
              onClick={() => setIsTestnet(!isTestnet)}
              className="text-xs text-cyan-400 font-mono hover:underline"
            >
              Mode: {isTestnet ? 'Binance Testnet (Sandbox)' : 'Binance Production Mainnet'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Binance API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter Binance API Key..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Binance Secret Key</label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter Binance API Secret..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Risk & Safety Limits */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
          <span className="text-slate-300 font-semibold uppercase block font-sans">Hard Risk Guardrails</span>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <span className="text-slate-500 block">Max Risk / Trade</span>
              <span className="text-cyan-400 font-bold">1.5% Equity</span>
            </div>
            <div>
              <span className="text-slate-500 block">Circuit Breaker DD</span>
              <span className="text-rose-400 font-bold">3.0% Max Daily</span>
            </div>
            <div>
              <span className="text-slate-500 block">Fractional Kelly</span>
              <span className="text-emerald-400 font-bold">&lambda; = 0.20</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-slate-950 font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
        >
          {saved ? '✓ Config Saved Successfully!' : 'Save System Configuration'}
        </button>

      </form>

    </div>
  );
}
