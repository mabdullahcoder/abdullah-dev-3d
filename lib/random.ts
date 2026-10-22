// Deterministic PRNG so server and client render identical "random" layouts.
export function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Round SVG geometry so server and browser trig results serialise identically.
export const r2 = (n: number) => Math.round(n * 100) / 100;

export const clamp01 =(v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

// Normalised progress of `v` through the window [start, end].
export const range = (v: number, start: number, end: number) =>
  clamp01((v - start) / (end - start));
