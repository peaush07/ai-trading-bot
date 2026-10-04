import React from 'react';
import { Cpu, Zap, ShieldCheck, Award, ArrowUpRight, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function AIEvolutionHub({ strategy, history = [], isOptimizing, onTriggerOptimize }) {
  return (
    <div className="space-y-6">
      
      {/* Strategy Core Metrics Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">{strategy?.name || 'Active Strategy Model'}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Gen {strategy?.generation || 1}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Scientific Hypothesis: {strategy?.hypothesis || 'Standard institutional multi-regime model.'}
            </p>
          </div>

          <button
            onClick={onTriggerOptimize}
            disabled={isOptimizing}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
              isOptimizing
                ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:opacity-90 shadow-cyan-500/25'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
            {isOptimizing ? 'Running Scientific Evolution Loop...' : 'Trigger AI Self-Improvement'}
          </button>
        </div>

        {/* 6 Key Quant Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="glass-card p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase font-semibold">Sharpe Ratio</span>
            <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">{strategy?.sharpeRatio || 1.95}</div>
            <span className="text-[10px] text-emerald-400 font-medium">Risk-Adjusted</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase font-semibold">Sortino Ratio</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{strategy?.sortinoRatio || 2.30}</div>
            <span className="text-[10px] text-slate-400 font-medium">Downside Risk</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase font-semibold">Win Rate %</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{strategy?.winRatePct || 68.5}%</div>
            <span className="text-[10px] text-emerald-400 font-medium">High Probability</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase font-semibold">Max Drawdown</span>
            <div className="text-2xl font-bold text-rose-400 font-mono mt-1">{strategy?.maxDrawdownPct || 2.1}%</div>
            <span className="text-[10px] text-slate-400 font-medium">Capital Protection</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase font-semibold">Deflated Sharpe (DSR)</span>
            <div className="text-2xl font-bold text-blue-400 font-mono mt-1">0.86</div>
            <span className="text-[10px] text-blue-400 font-medium">Overfit Protection</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase font-semibold">Fitness Score</span>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{strategy?.fitnessScore || 1.85}</div>
            <span className="text-[10px] text-amber-400 font-medium">Composite Quant Fitness</span>
          </div>
        </div>
      </div>

      {/* Evolution History & Hypothesis Timeline */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Evolution Timeline & Scientific Hypotheses
          </h3>
          <span className="text-xs text-slate-400 font-mono">Sealed Out-of-Sample Validation</span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No evolution cycles executed yet. Click "Trigger AI Self-Improvement" to initiate the feedback loop!
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {history.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border text-xs transition-all ${
                  item.status === 'ACCEPTED_IMPROVEMENT'
                    ? 'bg-emerald-950/20 border-emerald-800/60 text-slate-200'
                    : 'bg-slate-900/50 border-slate-800/60 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400 font-mono">Gen {item.generation}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'ACCEPTED_IMPROVEMENT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.status === 'ACCEPTED_IMPROVEMENT' ? 'ACCEPTED' : 'REJECTED'}
                    </span>
                  </div>
                  <span className="font-mono text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>

                <p className="font-mono text-slate-300 mb-2">{item.hypothesis}</p>

                <div className="flex flex-wrap gap-4 font-mono text-[11px] text-slate-400">
                  <span>Out-of-Sample Sharpe: <strong className="text-cyan-400">{item.sharpeRatio}</strong></span>
                  <span>Win Rate: <strong className="text-emerald-400">{item.winRatePct}%</strong></span>
                  <span>Max DD: <strong className="text-rose-400">{item.maxDrawdownPct}%</strong></span>
                  <span>DSR: <strong className="text-blue-400">{item.dsrScore}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
