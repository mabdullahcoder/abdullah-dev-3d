import { LOGO_PATHS, LOGO_STROKE, LOGO_VIEWBOX } from "./logoPaths";

export type Loop = Array<[number, number]>;

let cache: Loop[] | null = null;

// Ramer–Douglas–Peucker on an open polyline.
function simplify(points: Loop, eps: number): Loop {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack: Array<[number, number]> = [[0, points.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop()!;
    const [x1, y1] = points[s];
    const [x2, y2] = points[e];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    let max = 0;
    let idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = Math.abs(dy * points[i][0] - dx * points[i][1] + x2 * y1 - y2 * x1) / len;
      if (d > max) {
        max = d;
        idx = i;
      }
    }
    if (max > eps && idx > 0) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/**
 * Traces the stroked logo into closed outline loops (in viewBox units) by rasterising the strokes
 * and running marching squares over the coverage. Browser-only (uses a canvas).
 */
export function getLogoOutline(scale = 4): Loop[] {
  if (cache) return cache;

  const pad = 2;
  const W = LOGO_VIEWBOX.w * scale + pad * 2;
  const H = LOGO_VIEWBOX.h * scale + pad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.translate(pad, pad);
  ctx.scale(scale, scale);
  ctx.lineWidth = LOGO_STROKE;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#000";
  for (const d of LOGO_PATHS) ctx.stroke(new Path2D(d));
  const px = ctx.getImageData(0, 0, W, H).data;
  const val = (x: number, y: number) => px[(y * W + x) * 4 + 3] / 255;

  const iso = 0.5;
  const points = new Map<number, [number, number]>();
  const adj = new Map<number, number[]>();
  const hId = (x: number, y: number) => (y * (W + 1) + x) * 2;
  const vId = (x: number, y: number) => (y * (W + 1) + x) * 2 + 1;
  const t = (a: number, b: number) => (iso - a) / (b - a);
  const link = (e1: number, e2: number) => {
    (adj.get(e1) ?? adj.set(e1, []).get(e1)!).push(e2);
    (adj.get(e2) ?? adj.set(e2, []).get(e2)!).push(e1);
  };

  for (let y = 0; y < H - 1; y++) {
    for (let x = 0; x < W - 1; x++) {
      const a = val(x, y);
      const b = val(x + 1, y);
      const c = val(x + 1, y + 1);
      const d = val(x, y + 1);
      const idx = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0);
      if (idx === 0 || idx === 15) continue;

      const T = hId(x, y);
      const R = vId(x + 1, y);
      const B = hId(x, y + 1);
      const L = vId(x, y);
      if (!points.has(T) && (a > iso) !== (b > iso)) points.set(T, [x + t(a, b), y]);
      if (!points.has(R) && (b > iso) !== (c > iso)) points.set(R, [x + 1, y + t(b, c)]);
      if (!points.has(B) && (d > iso) !== (c > iso)) points.set(B, [x + t(d, c), y + 1]);
      if (!points.has(L) && (a > iso) !== (d > iso)) points.set(L, [x, y + t(a, d)]);

      const centerIn = (a + b + c + d) / 4 > iso;
      switch (idx) {
        case 1: case 14: link(L, B); break;
        case 2: case 13: link(B, R); break;
        case 3: case 12: link(L, R); break;
        case 4: case 11: link(T, R); break;
        case 6: case 9: link(T, B); break;
        case 7: case 8: link(T, L); break;
        case 5:
          if (centerIn) { link(T, L); link(B, R); } else { link(T, R); link(L, B); }
          break;
        case 10:
          if (centerIn) { link(T, R); link(L, B); } else { link(T, L); link(B, R); }
          break;
      }
    }
  }

  // Walk the edge graph into closed loops.
  const visited = new Set<number>();
  const loops: Loop[] = [];
  for (const start of adj.keys()) {
    if (visited.has(start)) continue;
    const loop: Loop = [];
    let prev = -1;
    let cur = start;
    while (!visited.has(cur)) {
      visited.add(cur);
      const p = points.get(cur)!;
      loop.push([(p[0] + 0.5 - pad) / scale, (p[1] + 0.5 - pad) / scale]);
      const next = adj.get(cur)!.find((n) => n !== prev && !visited.has(n));
      if (next === undefined) break;
      prev = cur;
      cur = next;
    }
    if (loop.length > 8) {
      // RDP needs distinct endpoints: split the closed loop at the point farthest from its start.
      const [sx, sy] = loop[0];
      let far = 1;
      loop.forEach(([x, y], i) => {
        if (Math.hypot(x - sx, y - sy) > Math.hypot(loop[far][0] - sx, loop[far][1] - sy)) far = i;
      });
      const a = simplify(loop.slice(0, far + 1), 0.18);
      const b = simplify([...loop.slice(far), loop[0]], 0.18);
      loops.push([...a.slice(0, -1), ...b.slice(0, -1)]);
    }
  }

  cache = loops;
  return loops;
}
