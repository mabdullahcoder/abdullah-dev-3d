"use client";

import { motion, useInView, type UseInViewOptions } from "framer-motion";
import { useRef, type ReactNode } from "react";

/**
 * A thin bar under the text grows to cover it, then collapses downward to reveal the text.
 * With `underline`, the bar settles as a short marker underline (service labels).
 */
export default function BarReveal({
  children,
  color = "var(--lime)",
  underline = false,
  delay = 0,
  className,
  margin = "0px 0px -15% 0px",
}: {
  children: ReactNode;
  color?: string;
  underline?: boolean;
  delay?: number;
  className?: string;
  margin?: UseInViewOptions["margin"];
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin });

  return (
    <span ref={ref} className={`relative inline-block ${className ?? ""}`}>
      <motion.span
        className="relative z-[1] inline-block"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.01, delay: delay + 0.42 }}
      >
        {children}
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute -left-[3px] -right-[3px] bottom-[-0.1em] top-[-0.1em] block origin-bottom"
        style={{ background: color, zIndex: underline ? 0 : 2 }}
        initial={{ scaleY: 0.1 }}
        animate={inView ? { scaleY: [0.1, 1, 1, underline ? 0.2 : 0] } : { scaleY: 0.1 }}
        transition={{ duration: 1, times: [0, 0.32, 0.42, 1], ease: [0.65, 0, 0.35, 1], delay }}
      />
    </span>
  );
}
