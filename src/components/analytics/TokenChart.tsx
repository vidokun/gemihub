'use client';

import { useEffect, useRef } from 'react';
import type { RequestLog } from '@/lib/types';
import Skeleton from './Skeleton';

interface TokenChartProps {
  logs: RequestLog[];
  loading?: boolean;
}

function abbreviateNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function formatTimeLabel(ts: string, logs: RequestLog[]): string {
  if (logs.length === 0) return '';
  const d = new Date(ts);
  const first = new Date(logs[0].timestamp);
  const last = new Date(logs[logs.length - 1].timestamp);
  const rangeMs = last.getTime() - first.getTime();
  const rangeHours = rangeMs / (1000 * 60 * 60);

  if (rangeHours <= 24) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function smoothCeil(n: number): number {
  if (n <= 0) return 10;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  const norm = n / mag;
  let nice = 1;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 5) nice = 5;
  else nice = 10;
  return nice * mag;
}

export default function TokenChart({ logs, loading = false }: TokenChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (logs.length === 0) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let frameId: number | null = null;

    function draw() {
      const ctx = canvas!.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = container!.clientWidth;
      const h = 320;

      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const padLeft = 60;
      const padRight = 20;
      const padTop = 30;
      const padBottom = 40;

      const chartW = w - padLeft - padRight;
      const chartH = h - padTop - padBottom;

      ctx.fillStyle = getComputedStyle(container!).getPropertyValue('--bg').trim() || '#0a0a0b';
      ctx.fillRect(0, 0, w, h);

      if (logs.length === 0) {
        const muted = getComputedStyle(container!).getPropertyValue('--muted').trim() || '#71717a';
        ctx.fillStyle = muted;
        ctx.font = '14px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No data for selected range', w / 2, h / 2);
        return;
      }

      const sorted = [...logs].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      const firstTime = new Date(sorted[0].timestamp).getTime();
      const lastTime = new Date(sorted[sorted.length - 1].timestamp).getTime();
      const timeSpan = lastTime - firstTime || 1;

      let maxVal = 0;
      for (const log of sorted) {
        const v = Math.max(log.prompt_tokens ?? 0, log.completion_tokens ?? 0);
        if (v > maxVal) maxVal = v;
      }
      maxVal = smoothCeil(maxVal);

      const xFromT = (ts: string) => {
        const t = new Date(ts).getTime();
        const ratio = (t - firstTime) / timeSpan;
        return padLeft + ratio * chartW;
      };

      const yFromV = (v: number) => {
        return padTop + chartH - (v / maxVal) * chartH;
      };

      const borderColor = getComputedStyle(container!).getPropertyValue('--border').trim() || '#1f1f24';
      const mutedColor = getComputedStyle(container!).getPropertyValue('--muted').trim() || '#71717a';

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 0.5;
      const gridLines = 5;
      for (let i = 0; i <= gridLines; i++) {
        const y = padTop + (chartH / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + chartW, y);
        ctx.stroke();

        const val = Math.round(maxVal - (maxVal / gridLines) * i);
        ctx.fillStyle = mutedColor;
        ctx.font = '11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(abbreviateNumber(val), padLeft - 8, y);
      }

      const xLabelCount = 6;
      for (let i = 0; i <= xLabelCount; i++) {
        const ratio = i / xLabelCount;
        const idx = Math.round(ratio * (sorted.length - 1));
        const log = sorted[Math.min(idx, sorted.length - 1)];
        const x = padLeft + ratio * chartW;
        const label = formatTimeLabel(log.timestamp, sorted);

        ctx.fillStyle = mutedColor;
        ctx.font = '11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(label, x, padTop + chartH + 8);

        ctx.strokeStyle = borderColor;
        ctx.beginPath();
        ctx.moveTo(x, padTop + chartH);
        ctx.lineTo(x, padTop + chartH + 4);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(padLeft, padTop + chartH);
      for (let i = 0; i < sorted.length; i++) {
        const x = xFromT(sorted[i].timestamp);
        const y = yFromV(sorted[i].prompt_tokens ?? 0);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(padLeft + chartW, padTop + chartH);
      ctx.closePath();
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(padLeft, padTop + chartH);
      for (let i = 0; i < sorted.length; i++) {
        const x = xFromT(sorted[i].timestamp);
        const y = yFromV(sorted[i].completion_tokens ?? 0);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(padLeft + chartW, padTop + chartH);
      ctx.closePath();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.fill();

      function drawLine(c: CanvasRenderingContext2D, data: (log: RequestLog) => number, color: string, width: number) {
        c.beginPath();
        let started = false;
        for (let i = 0; i < sorted.length; i++) {
          const x = xFromT(sorted[i].timestamp);
          const y = yFromV(data(sorted[i]));
          if (isNaN(y)) continue;
          if (!started) {
            c.moveTo(x, y);
            started = true;
          } else {
            c.lineTo(x, y);
          }
        }
        c.strokeStyle = color;
        c.lineWidth = width;
        c.lineJoin = 'round';
        c.stroke();
      }

      drawLine(ctx, (l) => l.prompt_tokens ?? 0, '#f59e0b', 2);
      drawLine(ctx, (l) => l.completion_tokens ?? 0, '#10b981', 2);

      const legendX = padLeft + chartW - 200;
      const legendY = padTop - 18;
      const dotRadius = 4;

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(legendX, legendY, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = getComputedStyle(container!).getPropertyValue('--text').trim() || '#e4e4e7';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Input Tokens', legendX + 10, legendY);

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(legendX + 100, legendY, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = getComputedStyle(container!).getPropertyValue('--text').trim() || '#e4e4e7';
      ctx.fillText('Output Tokens', legendX + 100 + 10, legendY);
    }

    draw();

    const ro = new ResizeObserver(() => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(draw);
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [logs, loading]);

  return (
    <div
      ref={containerRef}
      className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden"
    >
      {loading ? (
        <Skeleton className="w-full h-[320px] rounded-none" />
      ) : (
        <canvas ref={canvasRef} className="w-full block" />
      )}
    </div>
  );
}
