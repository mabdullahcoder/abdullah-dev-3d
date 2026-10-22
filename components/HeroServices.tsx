"use client";

import { motion, useMotionValue, useScroll, useTransform, type MotionStyle } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import Hero from "./Hero";
import LogoGL from "./LogoGL";
import Services from "./Services";

type Track = { top: number; height: number; logoH: number };

/**
 * Hero + "We are good at" share one 3D logo. It sits beside the hero headline, stays pinned to
 * the viewport centre while spinning through a full turn, and lands in the centre of the orbit.
 * That is plain CSS sticky inside a track that runs from the hero centre to the orbit centre.
 */
export default function HeroServices() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const orbitCenterRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const travel = useMotionValue(1);

  useLayoutEffect(() => {
    const measure = () => {
      const wrapper = wrapperRef.current;
      const hero = heroRef.current;
      const center = orbitCenterRef.current;
      const logo = logoRef.current;
      if (!wrapper || !hero || !center || !logo) return;
      const w = wrapper.getBoundingClientRect();
      const c = center.getBoundingClientRect();
      const logoH = logo.offsetHeight;
      const heroCenter = hero.offsetHeight / 2;
      const orbitCenter = c.top - w.top;
      const next = { top: heroCenter - logoH / 2, height: orbitCenter - heroCenter + logoH, logoH };
      travel.set(Math.max(1, next.height - logoH));
      setTrack((prev) =>
        prev && prev.top === next.top && prev.height === next.height && prev.logoH === next.logoH ? prev : next,
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    if (logoRef.current) ro.observe(logoRef.current);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [travel]);

  const { scrollY } = useScroll();
  const p = useTransform(() => Math.min(1, Math.max(0, scrollY.get() / travel.get())));
  const rotateY = useTransform(p, [0, 1], [-50, -350]);
  const rotateX = useTransform(p, [0, 0.5, 1], [8, -8, 6]);
  const rotateZ = useTransform(p, [0, 0.5, 1], [-9, 12, 0]);
  // 1 → 0 as the logo travels; scales a breakpoint-specific horizontal offset (see className).
  const offset = useTransform(p, [0, 0.35], [1, 0]);

  return (
    <div ref={wrapperRef} className="relative">
      <div ref={heroRef}>
        <Hero />
      </div>
      <Services orbitCenterRef={orbitCenterRef} />

      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 z-20"
        style={{
          top: track?.top ?? 0,
          height: track?.height ?? 0,
          visibility: track ? "visible" : "hidden",
        }}
      >
        <div
          className="sticky flex justify-center"
          style={{ top: track ? `calc(50svh - ${track.logoH / 2}px)` : 0 }}
        >
          <motion.div
            ref={logoRef}
            className="w-[clamp(130px,19.8vw,380px)] translate-x-[calc(var(--k)*24vw)] md:translate-x-[calc(var(--k)*2.1vw)]"
            style={{ "--k": offset } as unknown as MotionStyle}
          >
            <LogoGL rotateX={rotateX} rotateY={rotateY} rotateZ={rotateZ} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
