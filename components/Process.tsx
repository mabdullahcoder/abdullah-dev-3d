"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import BarReveal from "./BarReveal";
import BlockReveal from "./BlockReveal";
import HexCluster from "./HexCluster";

function StepCard({
  title,
  items,
  tone,
  className,
}: {
  title: string;
  items: string[];
  tone: "lime" | "dark";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Cards fade up into full strength as they travel up the viewport.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.15"] });
  const opacity = useTransform(scrollYProgress, [0, 0.35, 1], [0, 0.25, 1]);

  return (
    <motion.div ref={ref} style={{ opacity }} className={className}>
      <p className="title mb-4 text-muted">{title}</p>
      <div
        className={`flex h-36 w-48 items-center rounded-sm px-8 ${
          tone === "lime" ? "bg-lime/60 text-ink/80" : "bg-[#2a2c2e]/85 text-white/80"
        }`}
      >
        <ul className="text-sm leading-6">
          {items.map((it) => (
            <li key={it}>• {it}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function Process() {
  return (
    <section
      id="process"
      data-theme="light"
      className="relative pb-[calc(var(--section-y)+var(--stair))] pt-section"
    >
      <div className="grid grid-cols-1 gap-8 px-gutter md:grid-cols-[64%_1fr] md:gap-0">
        <BlockReveal
          seed={5}
          block="lime"
          className="heading relative z-[1]"
          lineClassName="md:whitespace-nowrap"
          lines={[
            ["We", "believe", "in", "a", { text: "process", className: "text-lime-ink" }],
            ["That", "works"],
          ]}
        />

        <div className="md:pt-[calc(16.1vw+33px)]">
          <BarReveal>
            <p className="body max-w-[420px]">
              If you have an idea, a thought, or even just a doubt...
            </p>
          </BarReveal>
          <div className="mt-8 md:mt-24">
            <a href="#contact" className="btn btn-lime">
              Schedule call
            </a>
          </div>
        </div>
      </div>

      {/* Phones: a simple zig-zag column. Desktop: the scattered composition. */}
      <div className="relative mt-stack flex flex-col gap-12 px-gutter md:block md:h-[620px] md:px-0">
        <StepCard
          title="Discovery"
          tone="lime"
          items={["Creative Brief", "Brand Research", "Mood Boards"]}
          className="self-start md:absolute md:left-[14.5%] md:top-0"
        />
        <StepCard
          title="Develop"
          tone="dark"
          items={["Creative Coding", "WebGL & 3D", "Animations"]}
          className="self-end md:absolute md:left-[33.1%] md:top-[340px]"
        />

        <div className="relative self-start md:absolute md:left-[82.8%] md:top-[355px]">
          <HexCluster seed={9} blur className="absolute -left-6 -top-10 w-[96px] opacity-90" />
          <span className="label relative inline-flex h-7 items-center rounded-sm bg-lime px-2.5 text-[13px] text-ink shadow-[0_3px_0_var(--lime-edge)]">
            Re-arrange
          </span>
        </div>
      </div>

      <HexCluster seed={13} blur className="absolute right-[9%] top-[6vh] w-[70px]" />
    </section>
  );
}
