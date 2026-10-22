"use client";

import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import { mulberry32 } from "@/lib/random";

const ARMS = 5;
const STREAKS = 620;

type Streak = { arm: number; r: number; off: number; len: number; w: number; speed: number };

/** Green spiral "galaxy" drawn on canvas with additive blending; only animates while visible. */
export default function Vortex({ scale, className }: { scale: MotionValue<number>; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runningRef = useRef(false);
  const startRef = useRef<() => void>(() => {});
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rand = mulberry32(5);
    const streaks: Streak[] = Array.from({ length: STREAKS }, () => ({
      arm: Math.floor(rand() * ARMS),
      r: Math.pow(rand(), 0.8),
      off: (rand() - 0.5) * 0.85,
      len: 0.4 + rand() * 0.8,
      w: rand(),
      speed: 0.55 + rand() * 0.5,
    }));

    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const size = Math.min(1400, Math.round(canvas.clientWidth * dpr));
      if (canvas.width !== size) {
        canvas.width = size;
        canvas.height = size;
      }
    };

    let raf = 0;
    const t0 = performance.now();

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const S = canvas.width;
      const c = S / 2;
      const R = S * 0.44;
      const unit = S / 600;
      ctx.clearRect(0, 0, S, S);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      for (const s of streaks) {
        const base = s.arm * ((Math.PI * 2) / ARMS) + s.r * 3.4 + s.off + t * s.speed * (1.7 - s.r);
        const span = s.len * (1.15 - s.r * 0.45);
        const rad = s.r * R;
        ctx.beginPath();
        for (let k = 0; k <= 8; k++) {
          const u = k / 8;
          const a = base - span * u;
          const rr = rad * (1 + u * 0.24);
          const x = c + Math.cos(a) * rr;
          const y = c + Math.sin(a) * rr;
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle =
          s.r < 0.22
            ? "rgba(255,255,236,0.26)"
            : s.r < 0.45
              ? "rgba(190,255,130,0.2)"
              : s.r < 0.75
                ? "rgba(64,236,30,0.2)"
                : "rgba(30,140,14,0.18)";
        ctx.lineWidth = unit * (8 + (1 - s.r) * 26) * (0.5 + s.w);
        ctx.stroke();
      }

      const g = ctx.createRadialGradient(c, c, 0, c, c, R * 0.5);
      g.addColorStop(0, "rgba(255,255,242,0.95)");
      g.addColorStop(0.45, "rgba(226,255,180,0.55)");
      g.addColorStop(1, "rgba(110,255,50,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(c, c, R * 0.5, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    startRef.current = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      resize();
      raf = requestAnimationFrame(draw);
    };
    stopRef.current = () => {
      runningRef.current = false;
      cancelAnimationFrame(raf);
    };

    window.addEventListener("resize", resize);
    if (scale.get() > 0.005) startRef.current();
    return () => {
      stopRef.current();
      window.removeEventListener("resize", resize);
    };
  }, [scale]);

  useMotionValueEvent(scale, "change", (v) => {
    if (v > 0.005) startRef.current();
    else stopRef.current();
  });

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
