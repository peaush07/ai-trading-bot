import React from 'react';
import { Wallet, ShieldAlert, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function PaperDesk({ paper, currentPrice, onExecuteTrade, onClosePosition, onEmergencyClose }) {
  const wallet = paper?.wallet || { initialCapital: 10000, balance: 10000, equity: 10000, unrealizedPnl: 0, realizedPnl: 0 };
  const positions = paper?.activePositions || [];
  const closed = paper?.closedTrades || [];

  return (
    <div className="space-y-6">
      
      {/* Wallet Overview & Controls Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Paper Trading Simulator Wallet (\$10,000 Baseline)
            </span>
            <div className="text-3xl font-extrabold text-white font-mono mt-1">
              \${wallet.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-xs text-slate-400 ml-2 font-sans font-normal">Account Equity</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onExecuteTrade('BTCUSDT', 'LONG')}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              <ArrowUpRight className="w-4 h-4" />
              Paper BUY / LONG
            </button>

            <button
              onClick={() => onExecuteTrade('BTCUSDT', 'SHORT')}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/20"
            >
              <ArrowDownRight className="w-4 h-4" />
              Paper SELL / SHORT
            </button>

            <button
              onClick={onEmergencyClose}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 flex items-center gap-1.5 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              EMERGENCY CLOSE ALL
            </button>
          </div>
        </div>

        {/* Balance Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Available Balance</span>
            <span className="text-slate-100 font-bold text-base">\${wallet.balance.toFixed(2)}</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Unrealized PnL</span>
            <span className={`font-bold text-base ${wallet.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {wallet.unrealizedPnl >= 0 ? '+' : ''}\${wallet.unrealizedPnl.toFixed(2)}
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Realized PnL</span>
            <span className={`font-bold text-base ${wallet.realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {wallet.realizedPnl >= 0 ? '+' : ''}\${wallet.realizedPnl.toFixed(2)}
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Win / Total Trades</span>
            <span className="text-cyan-400 font-bold text-base">{wallet.winCount || 0} / {wallet.totalTradesCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Active Positions Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          Active Open Micro-Positions ({positions.length})
        </h3>

        {positions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No active positions open right now. Click Paper BUY or SELL above to open a test micro-trade!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Symbol / Type</th>
                  <th className="p-3">Entry Price</th>
                  <th className="p-3">Mark Price</th>
                  <th className="p-3">Stop Loss</th>
                  <th className="p-3">Unrealized PnL</th>
                  <th className="p-3">Multi-Tier Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {positions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-slate-900/40">
                    <td className="p-3">
                      <span className="font-bold text-white mr-2">{pos.symbol}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        pos.type === 'LONG' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {pos.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-200">\${pos.entryPrice.toFixed(2)}</td>
                    <td className="p-3 text-cyan-400 font-semibold">\${pos.currentPrice.toFixed(2)}</td>
                    <td className="p-3 text-rose-400">
                      \${pos.stopLoss.toFixed(2)}
                      {pos.stopLossMovedToBreakEven && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[9px] font-sans font-bold">BE</span>
                      )}
                    </td>
                    <td className={`p-3 font-bold ${pos.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pos.unrealizedPnl >= 0 ? '+' : ''}\${pos.unrealizedPnl.toFixed(2)} ({pos.pnlPct}%)
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${pos.tp1Hit ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-500'}`}>
                        {pos.tp1Hit ? 'TP1 Locked (Break-Even Risk-Free)' : 'TP1 Pending (+1.5R)'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onClosePosition(pos.id)}
                        className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-sans text-[11px] font-semibold transition-all border border-rose-800/60"
                      >
                        Close Position
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
