import React from 'react';
import { BarChart3, PieChart, Newspaper, TrendingUp, ShieldAlert, Activity, ArrowUpRight } from 'lucide-react';

export default function OptionsResearchHub({ regime, options, sentiment }) {
  const currentRegime = regime?.regime || 'BULL_EXPANSION';
  const confidence = Math.round((regime?.confidence || 0.85) * 100);

  const getRegimeColor = (r) => {
    switch (r) {
      case 'BULL_EXPANSION': return 'text-emerald-400 bg-emerald-950/40 border-emerald-800';
      case 'BEAR_CONTRACTION': return 'text-rose-400 bg-rose-950/40 border-rose-800';
      case 'CALM_COMPRESSION': return 'text-cyan-400 bg-cyan-950/40 border-cyan-800';
      default: return 'text-amber-400 bg-amber-950/40 border-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Cards: Market Regime & Options Gamma Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Market Regime Classifier Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Unsupervised Market Regime Classifier (HMM)
            </span>
            <span className="text-xs font-mono text-cyan-400">Confidence: {confidence}%</span>
          </div>

          <div className={`p-4 rounded-xl border ${getRegimeColor(currentRegime)} mb-4`}>
            <div className="text-lg font-extrabold tracking-wide">{currentRegime.replace('_', ' ')}</div>
            <p className="text-xs opacity-80 mt-1">
              {currentRegime === 'BULL_EXPANSION' && 'Price > EMA 50/200. High momentum trend with volume confirmation.'}
              {currentRegime === 'BEAR_CONTRACTION' && 'Price below trend EMAs. Downtrend markdown regime.'}
              {currentRegime === 'CALM_COMPRESSION' && 'Volatility Squeeze. Tight Bollinger Bandwidth with pending breakout impulse.'}
              {currentRegime === 'VOLATILE_RANGE' && 'High volatility rangebound consolidation.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-xs text-slate-300">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">EMA 50 / 200</span>
              <span className="text-cyan-400 font-semibold">\${regime?.metrics?.ema50?.toFixed(0) || 64500}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">RSI (14)</span>
              <span className="text-emerald-400 font-semibold">{regime?.metrics?.rsi || 54}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">ATR Volatility</span>
              <span className="text-amber-400 font-semibold">\${regime?.metrics?.atr?.toFixed(0) || 1250}</span>
            </div>
          </div>
        </div>

        {/* Options Analytics Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Deribit & Binance Options Analytics
            </span>
            <span className="text-xs font-mono text-purple-400">Crypto Derivatives</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 font-mono">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Implied Volatility (IV)</span>
              <span className="text-2xl font-bold text-purple-400">{options?.impliedVolatility || '52.4%'}</span>
              <span className="text-[10px] text-slate-500 block mt-1">IV Rank: {options?.ivRank || 45}/100</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Put / Call Ratio (PCR)</span>
              <span className="text-2xl font-bold text-cyan-400">{options?.putCallRatio || 0.85}</span>
              <span className="text-[10px] text-emerald-400 block mt-1">{options?.skewBias || 'BULLISH_CALL_DEMAND'}</span>
            </div>
          </div>

          <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs font-mono">
            <div className="flex justify-between items-center text-purple-300">
              <span>Dealer Gamma Exposure (GEX):</span>
              <span className="font-bold">\${options?.gexValueMillionUSD || 1.45}M USD</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Regime: <strong className="text-cyan-400">{options?.gexRegime || 'POSITIVE_GEX'}</strong>
            </span>
          </div>
        </div>

      </div>

      {/* Online News & Market Research Ingestion */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-emerald-400" />
            Real-Time Market Research & Sentiment Ingestion (FinBERT)
          </h3>
          <span className="text-xs font-mono text-emerald-400">Fear & Greed: {sentiment?.fearAndGreedIndex || 64}/100</span>
        </div>

        <div className="space-y-3">
          {(sentiment?.headlines || []).map((h, i) => (
            <div key={i} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-200 font-medium">{h.text}</span>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-400 font-mono font-bold text-[10px]">
                {h.sentiment} ({Math.round(h.weight * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
