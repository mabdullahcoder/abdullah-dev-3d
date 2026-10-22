import { mulberry32, r2 } from "@/lib/random";

// All artworks share a 400×300 viewBox and are rendered inside <HexReveal>'s SVG.

function Pine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-2.5} y={36} width={5} height={14} fill="#5a4636" />
      <path d="M0 -6 L13 14 L-13 14 Z" fill="#2f5d3c" />
      <path d="M0 4 L17 26 L-17 26 Z" fill="#2b5537" />
      <path d="M0 16 L20 40 L-20 40 Z" fill="#274f33" />
      <path d="M0 -6 L5 2 L-4 3 Z" fill="#f2f5f7" opacity={0.85} />
      <path d="M-9 24 L-3 20 L2 25 Z" fill="#eef2f5" opacity={0.7} />
      <path d="M4 37 L12 33 L16 38 Z" fill="#eef2f5" opacity={0.6} />
    </g>
  );
}

export function PawwwArt() {
  return (
    <g>
      <defs>
        <linearGradient id="paw-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f6f8" />
          <stop offset="1" stopColor="#e3e8ed" />
        </linearGradient>
        <radialGradient id="paw-pond" cx="0.45" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#a9d0e6" />
          <stop offset="0.6" stopColor="#6aa5cb" />
          <stop offset="1" stopColor="#4c88b0" />
        </radialGradient>
        <filter id="paw-fog">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <rect width="400" height="300" fill="url(#paw-sky)" />
      <g filter="url(#paw-fog)" opacity="0.45">
        <Pine x={205} y={112} s={0.7} />
        <Pine x={250} y={120} s={0.55} />
        <rect x={300} y={118} width={30} height={40} fill="#c6ccd3" />
      </g>
      <rect y="178" width="400" height="122" fill="#f7f9fb" />
      <ellipse cx="175" cy="236" rx="168" ry="36" fill="url(#paw-pond)" />
      <ellipse cx="150" cy="228" rx="90" ry="9" fill="#d6ecf7" opacity="0.5" />
      <ellipse cx="120" cy="243" rx="40" ry="4" fill="#d6ecf7" opacity="0.35" />
      <Pine x={75} y={130} s={1.1} />
      <Pine x={145} y={134} s={1.05} />
      {/* little cabin */}
      <g transform="translate(318 140)">
        <rect x={0} y={14} width={50} height={38} fill="#b9c4cf" />
        <rect x={6} y={0} width={22} height={20} fill="#c9d2db" />
        <path d="M-4 16 L25 2 L54 16 Z" fill="#e9eef2" />
        <rect x={30} y={26} width={10} height={9} fill="#6c7a86" />
        <circle cx={14} cy={38} r={5} fill="#5c3b2a" />
        <rect x={10} y={40} width={8} height={12} fill="#7b5a44" />
      </g>
      {/* the dog, sitting with its back to us */}
      <g transform="translate(205 246)">
        <ellipse cx={0} cy={36} rx={17} ry={22} fill="#b8692c" />
        <ellipse cx={0} cy={40} rx={11} ry={15} fill="#c97c3b" />
        <circle cx={0} cy={10} r={12} fill="#b8692c" />
        <ellipse cx={-10} cy={13} rx={5} ry={9} fill="#8f4f1f" />
        <ellipse cx={10} cy={13} rx={5} ry={9} fill="#8f4f1f" />
        <path d="M14 48 C26 50 28 58 22 62" stroke="#a65c24" strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

export function PritamArt() {
  const rand = mulberry32(42);
  const embers = Array.from({ length: 150 }, () => {
    // keep embers mostly around the frame edges and lower band
    const edge = rand();
    let x: number, y: number;
    if (edge < 0.3) {
      x = rand() * 60;
      y = rand() * 300;
    } else if (edge < 0.6) {
      x = 340 + rand() * 60;
      y = rand() * 300;
    } else if (edge < 0.85) {
      x = rand() * 400;
      y = 230 + rand() * 70;
    } else {
      x = rand() * 400;
      y = rand() * 40;
    }
    return { x: r2(x), y: r2(y), r: r2(0.8 + rand() * 3.4), c: rand() };
  });
  return (
    <g>
      <defs>
        <filter id="pri-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="400" height="300" fill="#070505" />
      <g filter="url(#pri-glow)">
        {embers.map((e, i) => (
          <circle
            key={i}
            cx={e.x}
            cy={e.y}
            r={e.r}
            fill={e.c < 0.45 ? "#ff3d0a" : e.c < 0.8 ? "#ff7a1a" : "#ffc34d"}
            opacity={r2(0.35 + (e.r / 4.2) * 0.6)}
          />
        ))}
      </g>
      <g fill="#e9e9e9" fontFamily="var(--nf-geist), sans-serif" fontWeight={500}>
        <text x={78} y={62} fontSize={27} letterSpacing={-0.5}>IAM</text>
        <text x={78} y={90} fontSize={27} letterSpacing={-0.5}>PRITAM</text>
        <text x={212} y={150} fontSize={30} letterSpacing={-0.5}>CREATIVE</text>
        <text x={212} y={180} fontSize={30} letterSpacing={-0.5}>DEV</text>
      </g>
      <rect x={78} y={124} width={30} height={2} fill="#bbb" />
      <rect x={78} y={130} width={22} height={2} fill="#777" />
      <circle cx={314} cy={46} r={3} fill="#ddd" />
      <rect x={300} y={98} width={18} height={2} fill="#777" />
      <rect x={180} y={226} width={40} height={2} fill="#666" />
    </g>
  );
}

function Figure({ x, y, s, flip = false }: { x: number; y: number; s: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={-62} rx={9} ry={11} fill="url(#ru-chrome)" />
      <path
        d="M-14 -48 C-20 -30 -18 -6 -12 6 L-16 52 L-8 54 L0 12 L6 54 L14 52 L11 6 C18 -8 20 -32 14 -48 Z"
        fill="url(#ru-chrome)"
      />
      <path d="M-14 -44 L-26 -10 L-21 -8 L-10 -36 Z" fill="url(#ru-chrome)" />
      <path d="M14 -44 L24 -14 L19 -12 L10 -36 Z" fill="url(#ru-chrome)" />
    </g>
  );
}

export function RuchitArt() {
  const rand = mulberry32(7);
  const flecks = Array.from({ length: 70 }, () => ({
    x: r2(175 + rand() * 50),
    y: r2(80 + rand() * 150),
    r: r2(1 + rand() * 3),
  }));
  return (
    <g>
      <defs>
        <linearGradient id="ru-chrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f4f4" />
          <stop offset="0.45" stopColor="#9a9a9a" />
          <stop offset="0.7" stopColor="#d9d9d9" />
          <stop offset="1" stopColor="#5d5d5d" />
        </linearGradient>
        <radialGradient id="ru-head" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#fbffd0" />
          <stop offset="0.45" stopColor="#eaff3b" />
          <stop offset="0.8" stopColor="#c8d61a" />
          <stop offset="1" stopColor="#7d8611" />
        </radialGradient>
        <filter id="ru-soft">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <rect width="400" height="300" fill="#0b0b0b" />
      <rect x={140} y={0} width={120} height={300} fill="#151515" />
      <rect x={130} y={0} width={6} height={300} fill="#1d1d1d" />
      <rect x={264} y={0} width={6} height={300} fill="#1d1d1d" />
      <g opacity={0.9}>
        <Figure x={40} y={200} s={1.05} />
        <Figure x={78} y={192} s={1.15} />
        <Figure x={108} y={206} s={0.9} />
        <Figure x={300} y={198} s={1.1} flip />
        <Figure x={336} y={190} s={1.15} flip />
        <Figure x={368} y={206} s={0.95} flip />
      </g>
      <ellipse cx={200} cy={150} rx={34} ry={88} fill="url(#ru-head)" />
      <g filter="url(#ru-soft)" fill="#ffffff" opacity={0.75}>
        {flecks.map((f, i) => (
          <circle key={i} cx={f.x} cy={f.y} r={f.r} opacity={0.3 + (i % 5) * 0.12} />
        ))}
      </g>
      <path d="M176 220 C186 262 214 262 224 220" fill="#d7d7d7" opacity={0.85} />
    </g>
  );
}

export function DeepflowArt() {
  const rand = mulberry32(99);
  const dots = Array.from({ length: 520 }, () => {
    // two-lobed "brain" cloud
    const lobe = rand() < 0.5 ? -1 : 1;
    const a = rand() * Math.PI * 2;
    const rr = Math.sqrt(rand());
    const spread = rand() < 0.18 ? 1.6 : 1;
    return {
      x: r2(200 + lobe * 42 * rr * 0.4 + Math.cos(a) * 92 * rr * spread),
      y: r2(112 + Math.sin(a) * 62 * rr * spread),
      r: r2(0.5 + rand() * 1.3),
      c: rand(),
    };
  });
  return (
    <g>
      <defs>
        <linearGradient id="df-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a313d" />
          <stop offset="0.62" stopColor="#3b4552" />
          <stop offset="1" stopColor="#5a6573" />
        </linearGradient>
        <radialGradient id="df-glow" cx="0.5" cy="0.4" r="0.5">
          <stop offset="0" stopColor="#ff3fd0" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff3fd0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="df-swoosh" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#ff2fa6" />
          <stop offset="1" stopColor="#ff8ee0" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#df-bg)" />
      <ellipse cx="200" cy="112" rx="150" ry="100" fill="url(#df-glow)" />
      <g>
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill={d.c < 0.6 ? "#ff5bd6" : d.c < 0.85 ? "#c77dff" : "#ffd1f3"}
            opacity={r2(0.45 + d.c * 0.5)}
          />
        ))}
      </g>
      {/* floor reflection */}
      <rect y={250} width="400" height="50" fill="#6a7584" opacity={0.35} />
      {/* website mockup */}
      <g transform="translate(118 132)">
        <rect width={164} height={112} rx={3} fill="#0d0d12" />
        <path d="M70 112 C110 90 130 50 164 34 L164 112 Z" fill="url(#df-swoosh)" />
        <path d="M96 112 C122 96 140 70 164 60 L164 112 Z" fill="#7a1252" opacity={0.6} />
        <rect x={8} y={7} width={14} height={3} fill="#ff4fbf" />
        <rect x={110} y={7} width={44} height={2} fill="#555" />
        <text x={10} y={36} fontSize={7} fill="#ff6fcf" fontFamily="var(--nf-geist), sans-serif">
          Neural Innovation
        </text>
        <text x={10} y={48} fontSize={9} fill="#fff" fontWeight={600} fontFamily="var(--nf-geist), sans-serif">
          Building your future
        </text>
        <text x={10} y={59} fontSize={9} fill="#fff" fontWeight={600} fontFamily="var(--nf-geist), sans-serif">
          together
        </text>
        <rect x={10} y={70} width={26} height={7} rx={1} fill="#ff4fbf" />
        <rect x={0} y={104} width={164} height={8} fill="#000" opacity={0.6} />
      </g>
      <rect x={118} y={244} width={164} height={20} fill="#0d0d12" opacity={0.25} />
    </g>
  );
}
