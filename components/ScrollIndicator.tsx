"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const TRACK = 144;
const THUMB = 32;

export default function ScrollIndicator() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, TRACK - THUMB]);
  const [dark, setDark] = useState(false);

  // Flip to white while a dark section sits under the indicator.
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const probe = window.innerHeight / 2;
      let isDark = false;
      document.querySelectorAll<HTMLElement>("[data-theme]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= probe && r.bottom >= probe) isDark = el.dataset.theme === "dark";
      });
      setDark(isDark);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed right-7 top-1/2 z-40 hidden -translate-y-1/2 transition-colors duration-300 md:block"
      style={{ height: TRACK, color: dark ? "#fff" : "#0d0d0d" }}
    >
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current opacity-25" />
      <motion.div
        className="absolute left-1/2 w-[3px] -translate-x-1/2 bg-current"
        style={{ y, height: THUMB }}
      />
    </div>
  );
}
