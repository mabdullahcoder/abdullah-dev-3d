"use client";

import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Plus } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { range } from "@/lib/random";
import LogoGL from "./LogoGL";
import StairEdge from "./StairEdge";
import Vortex from "./Vortex";

const PHRASES = [
  "Built different",
  "Design with purpose",
  "Code with passion",
  "Create with vision",
  "Innovate always",
];

// Timeline in viewport-heights scrolled past the section top (negative = still entering).
const WINDOWS: Array<{ enter: [number, number]; exit: [number, number] }> = [
  { enter: [-0.75, -0.25], exit: [0.3, 0.6] },
  { enter: [0.6, 0.9], exit: [1.3, 1.6] },
  { enter: [1.6, 1.9], exit: [2.3, 2.6] },
  { enter: [2.6, 2.9], exit: [3.3, 3.6] },
  { enter: [3.6, 3.9], exit: [4.3, 4.6] },
];
const VORTEX: [number, number] = [4.6, 5.8];
const LOGO: [number, number] = [5.3, 5.95];
const OUTRO: [number, number] = [5.95, 6.75];
const STAGE_VH = 6.85; // sticky travel; section height = STAGE_VH + 1 viewport

const EXTRUDE = "-1px 1px 0 #a9a9a9, -2px 2px 0 #7e7e7e, -3px 3px 0 #545454";

function staggered(s: number, [a, b]: [number, number], j: number, n: number) {
  const len = b - a;
  const start = a + (n > 1 ? j / (n - 1) : 0) * len * 0.55;
  return range(s, start, start + len * 0.45);
}

function Letter({
  char,
  s,
  j,
  n,
  win,
}: {
  char: string;
  s: MotionValue<number>;
  j: number;
  n: number;
  win: (typeof WINDOWS)[number];
}) {
  const rotateY = useTransform(s, (v) => (1 - staggered(v, win.enter, j, n)) * 90 - staggered(v, win.exit, j, n) * 90);
  const opacity = useTransform(s, (v) => staggered(v, win.enter, j, n) * (1 - staggered(v, win.exit, j, n)));
  return (
    <motion.span className="inline-block" style={{ rotateY, opacity, textShadow: EXTRUDE }}>
      {char}
    </motion.span>
  );
}

function Phrase({ text, s, win }: { text: string; s: MotionValue<number>; win: (typeof WINDOWS)[number] }) {
  const chars = [...text.toUpperCase()];
  const n = chars.length;
  return (
    <p
      aria-hidden
      className="heading absolute inset-x-0 top-1/2 -translate-y-1/2 whitespace-nowrap px-gutter text-center text-white text-[clamp(2.4rem,7vw,9.5rem)]"
      style={{ perspective: "800px" }}
    >
      {chars.map((ch, j) =>
        ch === " " ? (
          <span key={j}> </span>
        ) : (
          <Letter key={j} char={ch} s={s} j={j} n={n} win={win} />
        ),
      )}
    </p>
  );
}

function BigLetter({ char, s, j, n }: { char: string; s: MotionValue<number>; j: number; n: number }) {
  // Centre letters lead, outer letters follow.
  const order = Math.abs(j - (n - 1) / 2) / ((n - 1) / 2);
  const y = useTransform(s, (v) => {
    const e = range(v, OUTRO[0] + 0.15 + order * 0.25, OUTRO[0] + 0.55 + order * 0.25);
    return `${(1 - e) * 75}vh`;
  });
  const rotateX = useTransform(s, (v) => {
    const e = range(v, OUTRO[0] + 0.15 + order * 0.25, OUTRO[0] + 0.55 + order * 0.25);
    return (1 - e) * 55;
  });
  return (
    <motion.span className="inline-block" style={{ y, rotateX }}>
      {char}
    </motion.span>
  );
}

function Corner({ className, y }: { className: string; y?: MotionValue<string> }) {
  return (
    <motion.span className={`absolute text-white ${className}`} style={{ y }}>
      <motion.span
        className="block"
        animate={{ opacity: [1, 0.35, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Plus size={15} strokeWidth={3} />
      </motion.span>
    </motion.span>
  );
}

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const top = useMotionValue(0);
  const vh = useMotionValue(800);

  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      top.set(el.getBoundingClientRect().top + window.scrollY);
      vh.set(window.innerHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [top, vh]);

  const { scrollY } = useScroll();
  const s = useTransform(() => (scrollY.get() - top.get()) / vh.get());
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start start"] });

  const vortexScale = useTransform(s, (v) => {
    const e = range(v, VORTEX[0], VORTEX[1]);
    return e <= 0 ? 0 : 0.05 + (1 - Math.pow(1 - e, 2.2)) * 0.95;
  });
  const logoScale = useTransform(s, [LOGO[0], LOGO[1]], [0.18, 1]);
  const logoOpacity = useTransform(s, [LOGO[0], LOGO[0] + 0.12], [0, 1]);
  const outroY = useTransform(s, [OUTRO[0], OUTRO[1]], ["0vh", "-44vh"]);
  const topCornerY = useTransform(s, [OUTRO[0], OUTRO[1]], ["0vh", "27vh"]);
  const word = [..."ABDULLAH"];

  return (
    <section
      ref={ref}
      data-theme="dark"
      className="relative z-10 bg-night"
      style={{ height: `${(STAGE_VH + 1) * 100}vh` }}
    >
      <StairEdge progress={enter} color="var(--night)" />
      <div id="contact" className="absolute bottom-0 h-svh w-px" />

      <div className="sticky top-0 h-svh overflow-hidden">
        <h2 className="sr-only">{PHRASES.join(". ")}. Abdullah.</h2>

        <Corner className="left-[3.6%] top-[4%]" y={topCornerY} />
        <Corner className="right-[3.6%] top-[4.5%]" y={topCornerY} />
        <Corner className="bottom-[5%] left-[3.6%]" />
        <Corner className="bottom-[4.5%] right-[3.6%]" />

        {PHRASES.map((p, i) => (
          <Phrase key={p} text={p} s={s} win={WINDOWS[i]} />
        ))}

        <motion.div
          className="absolute left-1/2 top-1/2 w-[92vw] -translate-x-1/2 -translate-y-1/2 md:w-[52vw]"
          style={{ y: outroY }}
        >
          <motion.div style={{ scale: vortexScale }}>
            <Vortex scale={vortexScale} className="block aspect-square w-full [filter:blur(1.6px)_saturate(1.25)]" />
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ y: outroY }}
        >
          <motion.div
            className="w-[clamp(120px,19vw,360px)]"
            style={{ scale: logoScale, opacity: logoOpacity }}
          >
            <LogoGL variant="dark" rotateX={6} rotateY={-24} />
          </motion.div>
        </motion.div>

        <p
          aria-hidden
          className="absolute inset-x-0 bottom-[13vh] whitespace-nowrap text-center font-bebas text-[26.5vw] leading-[0.8] text-white"
          style={{ perspective: "900px" }}
        >
          {word.map((ch, j) => (
            <BigLetter key={j} char={ch} s={s} j={j} n={word.length} />
          ))}
        </p>
      </div>
    </section>
  );
}
