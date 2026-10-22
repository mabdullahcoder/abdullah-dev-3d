"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useId, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { clamp01, mulberry32 } from "@/lib/random";

const W = 400;
const H = 300;
const R = 24;

function hexPath(r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

/**
 * Reveals SVG artwork through a honeycomb mask that grows cell-by-cell (with a little glitch
 * jitter) as the image scrolls up through the viewport.
 */
export default function HexReveal({
  children,
  seed = 1,
  origin = [0.3, 0.8],
  label,
  className,
}: {
  children: ReactNode;
  seed?: number;
  origin?: [number, number];
  label: string;
  className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const boxRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Array<SVGPolygonElement | null>>([]);
  const fullRef = useRef<SVGRectElement>(null);

  const cells = useMemo(() => {
    const rand = mulberry32(seed * 131);
    const out: Array<{ x: number; y: number; t: number; jx: number }> = [];
    const w = Math.sqrt(3) * R;
    const ox = origin[0] * W;
    const oy = origin[1] * H;
    const maxD = Math.hypot(W, H) * 0.8;
    for (let row = -1; row * 1.5 * R < H + R; row++) {
      for (let col = -1; col * w < W + w; col++) {
        const x = col * w + (row % 2 ? w / 2 : 0);
        const y = row * 1.5 * R;
        const d = Math.hypot(x - ox, y - oy) / maxD;
        out.push({ x, y, t: d * 0.78 + rand() * 0.2, jx: (rand() - 0.5) * 36 });
      }
    }
    return out;
  }, [seed, origin]);

  const { scrollYProgress } = useScroll({ target: boxRef, offset: ["start end", "start 0.18"] });

  const paint = (p: number) => {
    const k = p * 1.12;
    cells.forEach((c, i) => {
      const el = cellRefs.current[i];
      if (!el) return;
      const local = clamp01((k - c.t) / 0.1);
      const jitter = local > 0 && local < 1 ? c.jx * (1 - local) : 0;
      el.setAttribute(
        "transform",
        `translate(${(c.x + jitter).toFixed(2)} ${c.y.toFixed(2)}) scale(${(local * 1.06).toFixed(3)})`,
      );
    });
    fullRef.current?.setAttribute("opacity", p >= 0.985 ? "1" : "0");
  };

  useMotionValueEvent(scrollYProgress, "change", paint);
  useLayoutEffect(() => {
    paint(scrollYProgress.get());
  });

  return (
    <div ref={boxRef} className={`relative aspect-[4/3] w-full ${className ?? ""}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={label}
      >
        <defs>
          <clipPath id={`clip-${id}`}>
            <rect width={W} height={H} rx={12} />
          </clipPath>
          <mask id={`mask-${id}`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
            <rect ref={fullRef} width={W} height={H} fill="#fff" opacity={0} />
            {cells.map((c, i) => (
              <polygon
                key={i}
                ref={(el) => {
                  cellRefs.current[i] = el;
                }}
                points={hexPath(R + 0.6)}
                fill="#fff"
                transform={`translate(${c.x} ${c.y}) scale(0)`}
              />
            ))}
          </mask>
        </defs>
        <g clipPath={`url(#clip-${id})`} mask={`url(#mask-${id})`}>
          {children}
        </g>
      </svg>
    </div>
  );
}
