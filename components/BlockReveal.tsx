"use client";

import { motion, useInView, type UseInViewOptions } from "framer-motion";
import { Fragment, useMemo, useRef, type ElementType } from "react";
import { mulberry32 } from "@/lib/random";

export type Word = string | { text: string; className?: string };

const BLOCKS = {
  lime: { background: "var(--lime)", boxShadow: "0 0.09em 0 #6c9a0b, 0 0.25em 0.4em rgba(0,0,0,0.08)" },
  black: { background: "#0b0b0b", boxShadow: "0.05em 0.08em 0 #3c3c3c, 0 0.25em 0.4em rgba(0,0,0,0.18)" },
};

/**
 * Text whose words start hidden under solid slabs. When the text reaches the trigger line the
 * slabs jolt, tumble and fall away (the "We are good at" / "Featured work" reveal).
 */
export default function BlockReveal({
  lines,
  block = "lime",
  as: Tag = "h2",
  className,
  lineClassName,
  seed = 1,
  margin = "0px 0px -40% 0px",
}: {
  lines: Word[][];
  block?: keyof typeof BLOCKS;
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  seed?: number;
  margin?: UseInViewOptions["margin"];
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin });

  const flights = useMemo(() => {
    const rand = mulberry32(seed * 97);
    return lines.map((line) =>
      line.map(() => ({
        x: (rand() - 0.5) * 520,
        y: 380 + rand() * 420,
        rotate: (rand() - 0.5) * 110,
        rotateX: (rand() - 0.5) * 140,
        rotateY: (rand() - 0.5) * 90,
        jolt: (rand() - 0.5) * 16,
        delay: rand() * 0.12,
      })),
    );
  }, [lines, seed]);

  let index = 0;
  return (
    <Tag ref={ref} className={className} style={{ perspective: "900px" }}>
      {lines.map((line, li) => (
        <span key={li} className={`block ${lineClassName ?? ""}`}>
          {line.map((w, wi) => {
            const word = typeof w === "string" ? { text: w } : w;
            const f = flights[li][wi];
            const order = index++;
            return (
              <Fragment key={wi}>
                {wi > 0 && " "}
                <span className={`relative inline-block preserve-3d ${word.className ?? ""}`}>
                  {word.text}
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute block rounded-[0.03em]"
                    style={{
                      ...BLOCKS[block],
                      top: "0.1em",
                      bottom: "0.05em",
                      left: "-0.05em",
                      right: "-0.05em",
                      zIndex: 5,
                    }}
                    initial={false}
                    animate={
                      inView
                        ? {
                            x: [0, f.jolt, f.x],
                            y: [0, -18, f.y],
                            rotate: [0, f.rotate * 0.15, f.rotate],
                            rotateX: [0, f.rotateX * 0.2, f.rotateX],
                            rotateY: [0, f.rotateY * 0.2, f.rotateY],
                            opacity: [1, 1, 0],
                            // Fallen slabs leave the layout so they cannot widen the page.
                            transitionEnd: { visibility: "hidden" },
                          }
                        : { x: 0, y: 0, rotate: 0, rotateX: 0, rotateY: 0, opacity: 1, visibility: "visible" }
                    }
                    transition={{
                      duration: 1.15,
                      times: [0, 0.22, 1],
                      ease: [0.5, 0, 0.75, 0.4],
                      delay: f.delay + order * 0.025,
                    }}
                  />
                </span>
              </Fragment>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
