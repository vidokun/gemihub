'use client';

import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  label: string;
  vx: number;
  vy: number;
}

const NODE_LABELS = ['GemiHub', 'Antigravity', '9Router', 'Gemini CLI', 'OpenCode', 'CMD'];

function initNodes(w: number, h: number): Node[] {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.32;
  return NODE_LABELS.map((label, i) => {
    const angle = (2 * Math.PI * i) / NODE_LABELS.length - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      label,
      vx: 0,
      vy: 0,
    };
  });
}

export default function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const timeRef = useRef(0);
  const dimensionsRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimensionsRef.current = { w, h };
      nodesRef.current = initNodes(w, h);
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
      const { w, h } = dimensionsRef.current;
      if (!ctx || w === 0) {
        animId = requestAnimationFrame(draw);
        return;
      }

      timeRef.current += 0.016;

      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;

      for (const n of nodes) {
        n.vx += (Math.sin(timeRef.current * 0.7 + n.x * 0.01) * 0.06 - n.vx) * 0.02;
        n.vy += (Math.cos(timeRef.current * 0.6 + n.y * 0.01) * 0.06 - n.vy) * 0.02;
        n.x += n.vx;
        n.y += n.vy;
      }

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        const pulse = 1 + Math.sin(timeRef.current * 2.5 + nodes.indexOf(n)) * 0.12;

        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 16 * pulse);
        glow.addColorStop(0, 'rgba(139, 92, 246, 0.18)');
        glow.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(139, 92, 246, 0.35)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4.5 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#a78bfa';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + 16);
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden h-[380px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
