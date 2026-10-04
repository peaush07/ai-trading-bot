import React, { useRef, useEffect } from 'react';

export default function CandleChart({ candles, activePositions = [], currentPrice }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = 420;

    // Clear background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Padding & dimensions
    const padding = { top: 20, right: 75, bottom: 40, left: 15 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const displayCandles = candles.slice(-65);
    const minPrice = Math.min(...displayCandles.map(c => c.low)) * 0.997;
    const maxPrice = Math.max(...displayCandles.map(c => c.high)) * 1.003;
    const priceRange = maxPrice - minPrice || 1;

    const candleWidth = (chartWidth / displayCandles.length) * 0.65;
    const candleGap = chartWidth / displayCandles.length;

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let i = 0; i < 5; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      const priceVal = maxPrice - (priceRange / 4) * i;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`\$${priceVal.toFixed(1)}`, width - padding.right + 8, y + 4);
    }

    // Draw Candlesticks
    displayCandles.forEach((c, idx) => {
      const x = padding.left + idx * candleGap + candleGap / 2;
      const isBull = c.close >= c.open;

      const openY = padding.top + chartHeight * (1 - (c.open - minPrice) / priceRange);
      const closeY = padding.top + chartHeight * (1 - (c.close - minPrice) / priceRange);
      const highY = padding.top + chartHeight * (1 - (c.high - minPrice) / priceRange);
      const lowY = padding.top + chartHeight * (1 - (c.low - minPrice) / priceRange);

      const color = isBull ? '#10b981' : '#f43f5e';

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      const bodyY = Math.min(openY, closeY);
      const bodyHeight = Math.max(2, Math.abs(closeY - openY));
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
    });

    // Draw Active Open Positions Overlay (Entry, Stop Loss, TP Lines)
    activePositions.forEach(pos => {
      const entryY = padding.top + chartHeight * (1 - (pos.entryPrice - minPrice) / priceRange);
      const slY = padding.top + chartHeight * (1 - (pos.stopLoss - minPrice) / priceRange);

      if (entryY >= padding.top && entryY <= padding.top + chartHeight) {
        // Entry Line (Cyan Dotted)
        ctx.strokeStyle = '#06b6d4';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padding.left, entryY);
        ctx.lineTo(width - padding.right, entryY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(width - padding.right + 4, entryY - 10, 68, 18);
        ctx.fillStyle = '#090d16';
        ctx.font = '10px font-semibold sans-serif';
        ctx.fillText(`ENTRY \$${pos.entryPrice.toFixed(0)}`, width - padding.right + 8, entryY + 3);
      }

      if (slY >= padding.top && slY <= padding.top + chartHeight) {
        // Stop Loss Line (Rose Dotted)
        ctx.strokeStyle = pos.stopLossMovedToBreakEven ? '#38bdf8' : '#f43f5e';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(padding.left, slY);
        ctx.lineTo(width - padding.right, slY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = pos.stopLossMovedToBreakEven ? '#0284c7' : '#e11d48';
        ctx.fillRect(width - padding.right + 4, slY - 10, 68, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.fillText(pos.stopLossMovedToBreakEven ? 'BE-SL' : 'SL', width - padding.right + 8, slY + 3);
      }
    });

    // Current Price Pulse Line
    if (currentPrice) {
      const curY = padding.top + chartHeight * (1 - (currentPrice - minPrice) / priceRange);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding.left, curY);
      ctx.lineTo(width - padding.right, curY);
      ctx.stroke();
    }

  }, [candles, activePositions, currentPrice]);

  return (
    <div className="w-full glass-panel rounded-2xl p-4 border border-slate-800 relative">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            Binance Real-Time Candlestick Chart
          </span>
          <span className="text-xs text-slate-400 font-mono">15m Timeframe</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> EMA 50</span>
          <span className="text-cyan-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> EMA 200</span>
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full h-[420px] rounded-xl cursor-crosshair" />
    </div>
  );
}
