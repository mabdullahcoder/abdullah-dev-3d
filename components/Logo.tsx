"use client";

import { useId, type CSSProperties } from "react";
import { LOGO_PATHS, LOGO_STROKE as STROKE, LOGO_VIEWBOX } from "@/lib/logoPaths";

type Variant = "green" | "dark";

const PALETTE: Record<Variant, { face: string; side: string; back: string; grain: string }> = {
  green: { face: "#86c232", side: "#5b8f17", back: "#46720f", grain: "#3d6410" },
  dark: { face: "#0c1405", side: "#c9f25a", back: "#7fae1d", grain: "#000" },
};

function Mark({
  color,
  filter,
  className,
  style,
}: {
  color: string;
  filter?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox={`0 0 ${LOGO_VIEWBOX.w} ${LOGO_VIEWBOX.h}`}
      className={className}
      style={style}
      aria-hidden
    >
      <g
        fill="none"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={filter}
      >
        {LOGO_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

/**
 * CSS fallback for <LogoGL> when WebGL is unavailable: stacked SVG layers in a preserve-3d
 * container, rotated in 3D by the parent. Size is driven by the parent's width (em-based depth).
 */
export function Logo3D({
  variant = "green",
  layers = 14,
  className,
}: {
  variant?: Variant;
  layers?: number;
  className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const c = PALETTE[variant];
  const depthStep = 0.85 / layers; // em per layer (total depth ≈ 0.85em)

  return (
    <div
      className={`preserve-3d relative ${className ?? ""}`}
      style={{ aspectRatio: `${LOGO_VIEWBOX.w} / ${LOGO_VIEWBOX.h}` }}
    >
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id={`grain-${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.25"
            result="speckle"
          />
          <feFlood floodColor={c.grain} result="tint" />
          <feComposite in="tint" in2="speckle" operator="in" result="dots" />
          <feComposite in="dots" in2="SourceGraphic" operator="in" result="clipped" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="clipped" />
          </feMerge>
        </filter>
      </svg>

      {Array.from({ length: layers }).map((_, i) => {
        const isFront = i === layers - 1;
        const isBack = i === 0;
        const z = (i - (layers - 1)) * depthStep;
        // Side layers shade from the face colour toward the back colour for some depth.
        const color = isFront ? c.face : isBack ? c.back : i > layers * 0.6 ? c.side : c.back;
        return (
          <Mark
            key={i}
            color={color}
            filter={isFront || isBack ? `url(#grain-${id})` : undefined}
            className="absolute inset-0 h-full w-full"
            style={{ transform: `translateZ(${z}em)`, backfaceVisibility: "visible" }}
          />
        );
      })}
    </div>
  );
}

export function LogoFlat({ className, color = "currentColor" }: { className?: string; color?: string }) {
  return <Mark color={color} className={className} />;
}
