import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils.js';

/**
 * Lightweight animated "data waves" backdrop for the hero.
 * Canvas, capped at ~30fps, pauses when offscreen or when the user prefers
 * reduced motion. Colours come from CSS tokens so it adapts to light/dark.
 */
export function AnimatedWaves({ className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf;
    let running = true;
    let last = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const lineColor = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--hero-line').trim() || '214 90% 55%';

    const draw = (t) => {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      if (t - last < 33) return; // ~30fps
      last = t;

      ctx.clearRect(0, 0, width, height);
      const phase = reduce ? 0 : t / 3200;
      const hsl = lineColor();

      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const amp = 14 + i * 8;
        const yBase = height * (0.35 + i * 0.13);
        for (let x = 0; x <= width; x += 8) {
          const y =
            yBase +
            Math.sin(x / 140 + phase + i) * amp +
            Math.sin(x / 60 - phase * 1.4 + i) * (amp / 3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsl(${hsl} / ${0.18 - i * 0.025})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      // drifting glow points
      for (let i = 0; i < 6; i++) {
        const x = ((i * 173 + phase * 40) % (width + 60)) - 30;
        const y = height * (0.3 + ((i * 37) % 50) / 100);
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hsl} / 0.5)`;
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);

    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      io.disconnect();
    };
  }, []);

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div
        className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: 'hsl(var(--hero-glow) / 0.18)' }}
      />
      <canvas ref={canvasRef} className="size-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background" />
    </div>
  );
}
