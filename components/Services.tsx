"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type Ref } from "react";
import BarReveal from "./BarReveal";
import BlockReveal from "./BlockReveal";
import HexCluster from "./HexCluster";
import { r2 } from "@/lib/random";

// Orbit radius: 17.3vw on desktop (≈222px at 1280), larger share of the width on phones.
const R = "var(--orbit-r)";

function Label({ children, delay = 0 }: { children: string; delay?: number }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <span className="size-[6px] shrink-0 bg-lime" />
      <BarReveal underline delay={delay} margin="0px 0px -20% 0px">
        <span className="title">{children}</span>
      </BarReveal>
    </span>
  );
}

const TICK_ANGLES = [22, 68, 112, 158, 202, 248, 292, 338];

function Orbit({ centerRef }: { centerRef?: Ref<HTMLDivElement> }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: boxRef, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-30, 40]);

  return (
    <div
      ref={boxRef}
      className="relative mx-auto h-[calc(2*var(--orbit-r)+220px)] w-full"
    >
      {/* Crosshair through the orbit centre */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-ink/10" />
      <div ref={centerRef} className="absolute left-1/2 top-1/2 size-px" />

      <motion.svg
        viewBox="-110 -110 220 220"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible"
        style={{ width: `calc(2 * ${R})`, height: `calc(2 * ${R})`, rotate }}
        aria-hidden
      >
        <circle
          r={100}
          fill="none"
          stroke="var(--lime-ink)"
          strokeOpacity={0.7}
          strokeWidth={0.45}
          strokeDasharray="0.9 1.6"
        />
        {TICK_ANGLES.map((a) => {
          const rad = (a * Math.PI) / 180;
          const x = r2(Math.cos(rad) * 100);
          const y = r2(Math.sin(rad) * 100);
          return (
            <g key={a} transform={`translate(${x} ${y}) rotate(${a + 45})`} stroke="var(--lime-ink)" strokeWidth={0.6}>
              <line x1={-2.6} y1={0} x2={2.6} y2={0} />
              <line x1={0} y1={-2.6} x2={0} y2={2.6} />
            </g>
          );
        })}
      </motion.svg>

      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: `calc(50% - ${R} - 4.6rem)` }}>
        <Label>Development</Label>
      </div>
      <div
        className="absolute top-1/2 -translate-y-1/2"
        style={{ right: `calc(50% + ${R} + var(--label-gap))` }}
      >
        <Label delay={0.1}>Design</Label>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `calc(50% + ${R} + var(--label-gap))` }}>
        <Label delay={0.2}>SEO</Label>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: `calc(50% + ${R} + 3rem)` }}>
        <Label delay={0.3}>E-Commerce</Label>
      </div>
    </div>
  );
}

export default function Services({ orbitCenterRef }: { orbitCenterRef?: Ref<HTMLDivElement> }) {
  return (
    <section
      id="services"
      data-theme="light"
      className="relative py-section [--label-gap:14px] [--orbit-r:26vw] md:[--label-gap:22px] md:[--orbit-r:17.3vw]"
    >
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-ink/10" />

      <BlockReveal
        seed={11}
        block="lime"
        className="heading relative z-[1] px-gutter text-center"
        lines={[["We", "are", { text: "good", className: "text-lime-ink" }, "at"]]}
      />

      <div className="mt-stack">
        <Orbit centerRef={orbitCenterRef} />
      </div>

      <HexCluster seed={21} blur className="absolute bottom-[14%] left-[8%] w-[80px] opacity-90" />
    </section>
  );
}
