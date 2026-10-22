"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";
import BlockReveal from "./BlockReveal";
import HexReveal from "./HexReveal";
import { DeepflowArt, PawwwArt, PritamArt, RuchitArt } from "./ProjectArt";
import StairEdge from "./StairEdge";
import { r2 } from "@/lib/random";

type Project = {
  name: string;
  tags: string;
  art: ReactNode;
  origin: [number, number];
};

const PROJECTS: Project[] = [
  { name: "Pawww", tags: "Web • Design • Development", art: <PawwwArt />, origin: [0.25, 0.85] },
  { name: "Pritam Das", tags: "Web • Development • WebGL", art: <PritamArt />, origin: [0.6, 0.75] },
  { name: "WTF Ruchit", tags: "Web • Design • Development", art: <RuchitArt />, origin: [0.4, 0.8] },
  { name: "Deepflow", tags: "Web • Development", art: <DeepflowArt />, origin: [0.55, 0.8] },
];

/** Radar-style ring of ticks plus crosshair lines, pinned behind the project list. */
function Gauge({ progress }: { progress: MotionValue<number> }) {
  const rotate = useTransform(progress, [0, 1], [-20, 70]);
  const diagonal = useTransform(rotate, (r) => -22 + r * 0.25);
  const ticks = Array.from({ length: 72 }, (_, i) => i);
  return (
    <div className="absolute inset-0 text-white">
      <div className="absolute left-0 right-0 top-1/2 h-px bg-current opacity-35" />
      <motion.div
        className="absolute left-1/2 top-1/2 h-px w-[160vmax] -translate-x-1/2 bg-current opacity-35"
        style={{ rotate: diagonal }}
      />
      <motion.svg
        viewBox="-110 -110 220 220"
        className="absolute left-1/2 top-1/2 size-[64vw] -translate-x-1/2 -translate-y-1/2 md:size-[42vw]"
        style={{ rotate }}
        aria-hidden
      >
        {ticks.map((i) => {
          const a = (i / ticks.length) * Math.PI * 2;
          const long = i % 4 === 0;
          const inner = long ? 92 : 96;
          const outer = 101;
          // a few gaps so the ring reads as arcs rather than a closed dial
          if (i % 18 > 13) return null;
          return (
            <line
              key={i}
              x1={r2(Math.cos(a) * inner)}
              y1={r2(Math.sin(a) * inner)}
              x2={r2(Math.cos(a) * outer)}
              y2={r2(Math.sin(a) * outer)}
              stroke="currentColor"
              strokeWidth={long ? 1.1 : 0.7}
              opacity={long ? 0.85 : 0.6}
            />
          );
        })}
      </motion.svg>
    </div>
  );
}

function ProjectItem({ project, index }: { project: Project; index: number }) {
  const right = index % 2 === 1;
  return (
    <article
      className={`relative w-[86%] md:w-[34.4vw] ${right ? "ml-auto md:ml-[55.5vw]" : "md:ml-[10.2vw]"}`}
    >
      <HexReveal seed={index + 1} origin={project.origin} label={`${project.name} project preview`}>
        {project.art}
      </HexReveal>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <BlockReveal
          as="h3"
          block="black"
          seed={30 + index}
          margin="0px 0px -25% 0px"
          className="title"
          lines={[[project.name]]}
        />
        <BlockReveal
          as="p"
          block="black"
          seed={40 + index}
          margin="0px 0px -25% 0px"
          className="caption text-right"
          lines={[[project.tags]]}
        />
      </div>
    </article>
  );
}

export default function FeaturedWork() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const { scrollYProgress: through } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section id="work" ref={ref} data-theme="lime" className="relative z-10 bg-lime">
      <StairEdge progress={enter} color="var(--lime)" />

      <div className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-svh overflow-hidden">
          <Gauge progress={through} />
        </div>
      </div>

      <div className="relative pt-section text-center">
        <BlockReveal
          seed={17}
          block="black"
          className="heading px-gutter"
          lines={[["Featured", "work"]]}
        />
      </div>

      <div className="relative mt-stack flex flex-col gap-14 px-gutter md:gap-8 md:px-0">
        {PROJECTS.map((p, i) => (
          <ProjectItem key={p.name} project={p} index={i} />
        ))}
      </div>
    </section>
  );
}
