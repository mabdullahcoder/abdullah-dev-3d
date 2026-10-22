"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { mulberry32 } from "@/lib/random";

const R = 10; // hex radius in viewBox units

function hexPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

/** A small honeycomb whose cells light up in rolling waves (seen in the hero and process areas). */
export default function HexCluster({
  seed = 1,
  className,
  cols = 5,
  rows = 5,
  blur = false,
}: {
  seed?: number;
  className?: string;
  cols?: number;
  rows?: number;
  blur?: boolean;
}) {
  const cells = useMemo(() => {
    const rand = mulberry32(seed);
    const w = Math.sqrt(3) * R;
    const out: Array<{ x: number; y: number; delay: number; dur: number; peak: number }> = [];
    const cx = ((cols - 1) * w) / 2;
    const cy = ((rows - 1) * 1.5 * R) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * w + (r % 2 ? w / 2 : 0);
        const y = r * 1.5 * R;
        const d = Math.hypot(x - cx, y - cy);
        // Keep it roughly round
        if (d > Math.min(cols * w, rows * 1.5 * R) * 0.55) continue;
        out.push({
          x,
          y,
          delay: d * 0.035 + rand() * 3.2,
          dur: 1.4 + rand() * 1.0,
          peak: 0.6 + rand() * 0.4,
        });
      }
    }
    return out;
  }, [seed, cols, rows]);

  const w = Math.sqrt(3) * R;
  const vbW = cols * w + w;
  const vbH = rows * 1.5 * R + R * 1.5;

  return (
    <svg
      viewBox={`${-R} ${-R} ${vbW} ${vbH}`}
      className={className}
      style={blur ? { filter: "blur(1.5px)" } : undefined}
      aria-hidden
    >
      {cells.map((c, i) => (
        <g key={i}>
          <polygon
            points={hexPoints(c.x, c.y, R - 0.6)}
            fill="none"
            stroke="var(--lime)"
            strokeOpacity={0.35}
            strokeWidth={0.6}
          />
          <motion.polygon
            points={hexPoints(c.x, c.y, R - 0.9)}
            fill="var(--lime)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, c.peak, c.peak, 0] }}
            transition={{
              duration: c.dur,
              times: [0, 0.2, 0.65, 1],
              delay: c.delay,
              repeat: Infinity,
              repeatDelay: 2.2 + (i % 4) * 0.6,
              ease: "easeInOut",
            }}
          />
        </g>
      ))}
    </svg>
  );
}
