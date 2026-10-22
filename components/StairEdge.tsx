"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

const LEVELS = [0, 1, 2, 3, 2, 1, 0];

function Column({
  level,
  progress,
  color,
  stepVh,
}: {
  level: number;
  progress: MotionValue<number>;
  color: string;
  stepVh: number;
}) {
  const height = useTransform(progress, (p) => `${level * stepVh * Math.max(0, 1 - p)}vh`);
  return <motion.div className="-mx-px flex-1" style={{ height, background: color }} />;
}

/**
 * Stepped "pyramid" top edge for a section. The steps are tallest while the section enters the
 * viewport and flatten out as it reaches the top (`progress` 0 → 1).
 */
export default function StairEdge({
  progress,
  color,
  stepVh = 5,
}: {
  progress: MotionValue<number>;
  color: string;
  stepVh?: number;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute bottom-full left-0 right-0 flex items-end">
      {LEVELS.map((level, i) => (
        <Column key={i} level={level} progress={progress} color={color} stepVh={stepVh} />
      ))}
    </div>
  );
}
