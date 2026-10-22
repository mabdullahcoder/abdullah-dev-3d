"use client";

import { motion, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { getLogoOutline, type Loop } from "@/lib/logoOutline";
import { LOGO_VIEWBOX } from "@/lib/logoPaths";
import { mulberry32 } from "@/lib/random";
import { Logo3D } from "./Logo";

type Variant = "green" | "dark";
type Angle = MotionValue<number> | number;

const DEG = Math.PI / 180;
const UNIT = 100; // viewBox units per world unit
const CANVAS_SCALE = 1.5; // canvas overhangs the layout box so rotations never clip
const FOV = 18;

const read = (v: Angle | undefined) => (v === undefined ? 0 : typeof v === "number" ? v : v.get());

function signedArea(loop: Loop) {
  let a = 0;
  for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
    a += (loop[j][0] - loop[i][0]) * (loop[j][1] + loop[i][1]);
  }
  return a / 2;
}

function contains(loop: Loop, [x, y]: [number, number]) {
  let inside = false;
  for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
    const [xi, yi] = loop[i];
    const [xj, yj] = loop[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Outline loops → THREE shapes (outer contours with their holes), centred, y-up, world units. */
function buildShapes(loops: Loop[]) {
  const cx = LOGO_VIEWBOX.w / 2;
  const cy = LOGO_VIEWBOX.h / 2;
  const toVec = ([x, y]: [number, number]) => new THREE.Vector2((x - cx) / UNIT, -(y - cy) / UNIT);

  const info = loops.map((loop) => ({ loop, area: Math.abs(signedArea(loop)) }));
  const depthOf = info.map((a, i) => info.filter((b, j) => j !== i && b.area > a.area && contains(b.loop, a.loop[0])).length);
  const shapes = new Map<number, THREE.Shape>();
  info.forEach((a, i) => {
    if (depthOf[i] % 2 === 0) shapes.set(i, new THREE.Shape(a.loop.map(toVec)));
  });
  info.forEach((a, i) => {
    if (depthOf[i] % 2 === 0) return;
    // attach the hole to its smallest enclosing outer contour
    let best = -1;
    info.forEach((b, j) => {
      if (shapes.has(j) && b.area > a.area && contains(b.loop, a.loop[0]) && (best < 0 || b.area < info[best].area)) best = j;
    });
    if (best >= 0) shapes.get(best)!.holes.push(new THREE.Path(a.loop.map(toVec)));
  });
  return [...shapes.values()];
}

function buildGeometry() {
  const shapes = buildShapes(getLogoOutline());
  const raw = new THREE.ExtrudeGeometry(shapes, {
    depth: 0.26,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.045,
    bevelOffset: -0.045,
    bevelSegments: 6,
    curveSegments: 1,
  });
  // Weld vertices so the dense traced outline shades as one smooth, rounded surface.
  raw.deleteAttribute("normal");
  raw.deleteAttribute("uv");
  const geo = mergeVertices(raw, 1e-4);
  raw.dispose();
  geo.computeVertexNormals();
  geo.center();
  // Planar UVs from the front view so the fibre texture reads consistently over face and sides.
  const pos = geo.getAttribute("position");
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) * 0.9 + pos.getZ(i) * 0.6;
    uv[i * 2 + 1] = pos.getY(i) * 0.9;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

/**
 * Short random fibres on a canvas. As a bump map ("bump") it gives the mark its felt / flocked
 * relief; as a colour map ("tint") it adds the light and dark speckle of real grass-like flock.
 */
function fibreTexture(kind: "bump" | "tint") {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = kind === "bump" ? "#808080" : "#d9d9d9";
  ctx.fillRect(0, 0, size, size);
  const rand = mulberry32(kind === "bump" ? 11 : 29);
  ctx.lineCap = "round";
  for (let i = 0; i < 16000; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const a = rand() * Math.PI * 2;
    const l = 1.5 + rand() * 5;
    const light = rand() < (kind === "bump" ? 0.5 : 0.35);
    const alpha = 0.15 + rand() * (kind === "bump" ? 0.35 : 0.45);
    ctx.strokeStyle = light ? `rgba(255,255,255,${alpha})` : `rgba(40,40,40,${alpha})`;
    ctx.lineWidth = 0.6 + rand() * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = kind === "bump" ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function buildScene(variant: Variant, bump: THREE.Texture, tint: THREE.Texture) {
  const scene = new THREE.Scene();
  let material: THREE.MeshPhysicalMaterial;

  if (variant === "green") {
    material = new THREE.MeshPhysicalMaterial({
      color: "#4a880f",
      map: tint,
      roughness: 0.92,
      metalness: 0,
      sheen: 0.4,
      sheenColor: new THREE.Color("#b9f25a"),
      sheenRoughness: 0.4,
      bumpMap: bump,
      bumpScale: 5,
      envMapIntensity: 0.3,
    });
    // Strong key from the upper left so the bevel and side walls fall into darker green.
    const key = new THREE.DirectionalLight("#fffdf4", 3.2);
    key.position.set(-3, 4, 6);
    const fill = new THREE.DirectionalLight("#eaffd8", 0.2);
    fill.position.set(4, -1.5, 3);
    const rim = new THREE.DirectionalLight("#ffffff", 0.9);
    rim.position.set(3, 3, -5);
    scene.add(key, fill, rim, new THREE.HemisphereLight("#ffffff", "#22301a", 0.12));
  } else {
    material = new THREE.MeshPhysicalMaterial({
      color: "#0a0e07",
      roughness: 0.3,
      metalness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.16,
      bumpMap: bump,
      bumpScale: 0.6,
      envMapIntensity: 0.9,
    });
    // The vortex sits behind the mark: lime rim light from behind, a soft key from the front.
    const rimL = new THREE.PointLight("#c6ff3d", 40, 0, 2);
    rimL.position.set(-2.6, 0.6, -1.6);
    const rimR = new THREE.PointLight("#dfff7a", 40, 0, 2);
    rimR.position.set(2.6, -0.4, -1.6);
    const glow = new THREE.PointLight("#9dff2e", 10, 0, 2);
    glow.position.set(0, -2.4, 2);
    const key = new THREE.DirectionalLight("#ffffff", 0.9);
    key.position.set(-2, 3, 5);
    scene.add(rimL, rimR, glow, key);
  }
  return { scene, material };
}

/**
 * The logo as a real 3D object: traced from the SVG mark, extruded with rounded bevels and lit with
 * physically-based materials. Rotation (degrees, CSS convention) can be driven by motion values.
 */
export default function LogoGL({
  variant = "green",
  rotateX,
  rotateY,
  rotateZ,
  className,
}: {
  variant?: Variant;
  rotateX?: Angle;
  rotateY?: Angle;
  rotateZ?: Angle;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      // No WebGL: swap to the CSS-layered fallback on the next frame.
      const id = requestAnimationFrame(() => setFailed(true));
      return () => cancelAnimationFrame(id);
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);

    const bump = fibreTexture("bump");
    const tint = fibreTexture("tint");
    const { scene, material } = buildScene(variant, bump, tint);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;

    const geometry = buildGeometry();
    const mesh = new THREE.Mesh(geometry, material);
    const pivot = new THREE.Group();
    pivot.add(mesh);
    scene.add(pivot);

    const visibleH = (LOGO_VIEWBOX.h / UNIT) * CANVAS_SCALE;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, visibleH / 2 / Math.tan((FOV / 2) * DEG));

    let raf = 0;
    const render = () => {
      raf = 0;
      // CSS is y-down, three is y-up: X and Z rotations flip sign.
      pivot.rotation.set(-read(rotateX) * DEG, read(rotateY) * DEG, -read(rotateZ) * DEG);
      renderer.render(scene, camera);
    };
    const invalidate = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      invalidate();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const unsubs = [rotateX, rotateY, rotateZ]
      .filter((v): v is MotionValue<number> => typeof v === "object" && v !== null)
      .map((v) => v.on("change", invalidate));

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      unsubs.forEach((u) => u());
      geometry.dispose();
      material.dispose();
      bump.dispose();
      tint.dispose();
      env.dispose();
      room.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, [variant, rotateX, rotateY, rotateZ]);

  return (
    <div className={`relative ${className ?? ""}`} style={{ aspectRatio: `${LOGO_VIEWBOX.w} / ${LOGO_VIEWBOX.h}` }}>
      {failed ? (
        <div className="h-full w-full" style={{ perspective: "1400px", fontSize: "clamp(13px, 1.98vw, 38px)" }}>
          <motion.div className="preserve-3d h-full w-full" style={{ rotateX, rotateY, rotateZ }}>
            <Logo3D variant={variant} />
          </motion.div>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            left: `${(-(CANVAS_SCALE - 1) / 2) * 100}%`,
            top: `${(-(CANVAS_SCALE - 1) / 2) * 100}%`,
            width: `${CANVAS_SCALE * 100}%`,
            height: `${CANVAS_SCALE * 100}%`,
          }}
        />
      )}
    </div>
  );
}
