"use client";

import { animate, motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

const COLUMNS = 7;
const EASE = [0.76, 0, 0.24, 1] as const;

type Phase = "counting" | "exiting" | "wiping" | "done";

export default function Loader() {
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const [phase, setPhase] = useState<Phase>("counting");

  useMotionValueEvent(count, "change", (v) => setDisplay(Math.round(v)));

  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";

    // Counter jumps the way the original does: quick to 14, a pause, then 98 → 100.
    const steps: Array<[number, number, number]> = [
      // [delay(ms), target, duration(s)]
      [80, 14, 0.18],
      [1150, 98, 0.12],
      [1420, 100, 0.08],
    ];
    const timers = steps.map(([delay, target, duration]) =>
      window.setTimeout(() => animate(count, target, { duration, ease: "linear" }), delay),
    );
    timers.push(window.setTimeout(() => setPhase("exiting"), 2050));
    timers.push(window.setTimeout(() => setPhase("wiping"), 2650));
    timers.push(
      window.setTimeout(() => {
        document.documentElement.style.overflow = "";
      }, 2900),
    );
    timers.push(window.setTimeout(() => setPhase("done"), 3500));
    return () => {
      timers.forEach(clearTimeout);
      document.documentElement.style.overflow = "";
    };
  }, [count]);

  if (phase === "done") return null;

  const contentHidden = phase !== "counting";
  const ready = display >= 98;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto" aria-live="polite" aria-label="Loading">
      {/* Background columns — retract upward edges-first for the staircase wipe */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: COLUMNS }).map((_, i) => {
          const fromCenter = Math.abs(i - (COLUMNS - 1) / 2);
          const delay = ((COLUMNS - 1) / 2 - fromCenter) * 0.07;
          return (
            <motion.div
              key={i}
              className="h-full flex-1 bg-lime origin-top -mx-px"
              initial={{ scaleY: 1 }}
              animate={{ scaleY: phase === "wiping" ? 0 : 1 }}
              transition={{ duration: 0.6, ease: EASE, delay }}
            />
          );
        })}
      </div>

      <motion.div
        className="absolute inset-0 text-ink"
        animate={{ opacity: contentHidden ? 0 : 1 }}
        transition={{ duration: 0.25, delay: contentHidden ? 0.15 : 0 }}
      >
        <p className="label absolute left-gutter top-gutter text-[1.9rem] md:text-[2.65rem]">
          Loading
        </p>
        <p className="caption absolute right-gutter top-[calc(var(--gutter)+6px)]">
          Please wait
        </p>

        <p className="caption absolute bottom-gutter left-gutter">
          Preparing experience
        </p>
        <p className="label absolute bottom-gutter right-gutter text-sm">
          {ready ? "Ready" : "Loading assets"}
        </p>
      </motion.div>

      {/* Progress line */}
      <motion.div
        className="absolute bottom-[calc(var(--gutter)+36px)] left-gutter right-gutter h-px origin-left"
        animate={{ scaleX: contentHidden ? 0 : 1 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <div className="absolute inset-0 bg-ink/35" />
        <div
          className="absolute left-0 top-[-0.5px] h-[2px] bg-ink"
          style={{ width: `${display}%` }}
        />
      </motion.div>

      {/* Counter — slides up out of its mask when loading completes */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="overflow-hidden">
          <motion.p
            className="label text-ink text-[34vw] md:text-[21vw] leading-[1.02] tabular-nums"
            animate={{ y: contentHidden ? "-105%" : "0%" }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {String(display).padStart(2, "0")}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
