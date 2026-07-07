/*
 * Tonight + Asteroid watch: gapless bento of two asymmetric glass cells.
 * Left: planet visibility chips, moon phase disc, cloud-cover area chart
 * (SVG, draws in on scroll). Right: asteroid bubble chart with floating
 * bubbles. Inverted-classic anchor: headline sits at the bottom.
 */
import { useEffect, useRef, useState } from "react";
import { publicAsset } from "./assets";
import { useTilt } from "./interactions";

const PLANET_CHIPS = [
  { name: "Venus", vis: "High", icon: "assets/icons/moon.png" },
  { name: "Mars", vis: "High", icon: "assets/icons/asteroid.png" },
  { name: "Jupiter", vis: "High", icon: "assets/icons/compass.png" },
  { name: "Saturn", vis: "Medium", icon: "assets/icons/radar.png" },
];

const CLOUD = [62, 74, 81, 78, 64, 47, 33, 26, 22, 28, 41, 58];
const HOURS = ["8 PM", "10 PM", "12 AM", "2 AM", "4 AM", "6 AM"];

const ASTEROIDS = [
  { name: "2026 XR", d: 220, ld: 1.2, eta: "3h 12m", x: 68, y: 22 },
  { name: "2026 JK1", d: 140, ld: 2.1, eta: "6h 45m", x: 30, y: 34 },
  { name: "2026 YR4", d: 90, ld: 4.3, eta: "11h 28m", x: 74, y: 56 },
  { name: "2026 WQ", d: 45, ld: 6.7, eta: "16h 05m", x: 26, y: 66 },
  { name: "2026 VG2", d: 30, ld: 9.8, eta: "21h 47m", x: 58, y: 82 },
];

function cloudPath(w: number, h: number): { line: string; area: string } {
  const stepX = w / (CLOUD.length - 1);
  const pts = CLOUD.map((v, i) => [i * stepX, h - (v / 100) * h] as const);
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return { line: d, area: `${d} L ${w},${h} L 0,${h} Z` };
}

function MoonDisc() {
  return (
    <div className="relative h-16 w-16" aria-hidden>
      <div className="absolute inset-0 rounded-full bg-[#d9dee9] shadow-[0_0_24px_rgba(217,222,233,0.25)]" />
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle at 128% 50%, transparent 62%, #0a0e1a 63%)" }}
      />
    </div>
  );
}

export default function Tonight({ reduced }: { reduced: boolean }) {
  const chartRef = useRef<SVGPathElement>(null);
  const chartWrap = useRef<HTMLDivElement>(null);
  const leftTilt = useTilt<HTMLDivElement>(2.4, reduced);
  const rightTilt = useTilt<HTMLDivElement>(2.4, reduced);
  const [drawn, setDrawn] = useState(reduced);

  useEffect(() => {
    if (reduced || !chartWrap.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(chartWrap.current);
    return () => io.disconnect();
  }, [reduced]);

  const W = 560;
  const H = 150;
  const { line, area } = cloudPath(W, H);

  return (
    <section id="tonight" aria-label="Tonight's sky report" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          {/* Tonight cell */}
          <div ref={leftTilt} className="glass px-7 py-6 will-change-transform">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
                  Tonight over your city
                </h3>
                <p className="mt-1 text-sm text-ink-2">Clear intervals after midnight.</p>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                    Waxing gibbous
                  </p>
                  <p className="font-mono-data text-2xl text-ink">82%</p>
                </div>
                <MoonDisc />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {PLANET_CHIPS.map((p) => (
                <span
                  key={p.name}
                  className="glass-soft flex items-center gap-2.5 !rounded-full px-4 py-2"
                >
                  <span className="text-[13.5px] text-ink">{p.name}</span>
                  <span
                    className="font-mono-data text-[11px]"
                    style={{ color: p.vis === "High" ? "#8caeff" : "#8b93a7" }}
                  >
                    {p.vis}
                  </span>
                </span>
              ))}
            </div>
            <div ref={chartWrap} className="mt-7">
              <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                Cloud cover by hour
              </p>
              <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" aria-hidden>
                <defs>
                  <linearGradient id="cloudFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8caeff" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#8caeff" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path
                  d={area}
                  fill="url(#cloudFill)"
                  style={{
                    opacity: drawn ? 1 : 0.35,
                    transition: "opacity 1.4s ease 0.4s",
                  }}
                />
                <path
                  ref={chartRef}
                  d={line}
                  fill="none"
                  stroke="#8caeff"
                  strokeWidth="2"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={drawn ? 0 : 1}
                  style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.6,0,0.2,1)" }}
                />
              </svg>
              <div className="font-mono-data mt-1 flex justify-between text-[10px] text-ink-2/70">
                {HOURS.map((hr) => (
                  <span key={hr}>{hr}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Asteroid cell */}
          <div ref={rightTilt} className="glass relative overflow-hidden px-7 py-6 will-change-transform">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
                Asteroid watch
              </h3>
              <img src={publicAsset("assets/icons/asteroid.png")} alt="" className="h-6 w-6 opacity-80" />
            </div>
            <p className="mt-1 text-sm text-ink-2">Near-Earth close approaches, next 24 hours.</p>
            <div className="relative mt-4 aspect-[4/3]">
              {/* range rings */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
                {[18, 34, 50].map((r) => (
                  <circle
                    key={r}
                    cx="50"
                    cy="50"
                    r={r}
                    fill="none"
                    stroke="rgba(140,174,255,0.14)"
                    strokeWidth="0.4"
                  />
                ))}
              </svg>
              {ASTEROIDS.map((a, i) => (
                <div
                  key={a.name}
                  className="group absolute"
                  style={{
                    left: `${a.x}%`,
                    top: `${a.y}%`,
                    transform: "translate(-50%, -50%)",
                    animation: reduced ? undefined : `astro-float ${5 + i * 0.9}s ease-in-out ${i * 0.6}s infinite alternate`,
                  }}
                >
                  <div
                    className="rounded-full border border-star/40 bg-star/15 transition-colors duration-300 group-hover:bg-star/30"
                    style={{ width: 14 + a.d / 9, height: 14 + a.d / 9 }}
                  />
                  <div className="font-mono-data pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2 whitespace-nowrap text-[10px] leading-tight text-ink-2">
                    <span className="text-ink">{a.name}</span>
                    <br />
                    {a.d} m · {a.ld} LD · {a.eta}
                  </div>
                </div>
              ))}
            </div>
            <p className="font-mono-data mt-2 text-[10px] uppercase tracking-[0.18em] text-ink-2/70">
              Bubble size = diameter · LD = lunar distances
            </p>
          </div>
        </div>
        {/* inverted-classic anchor: headline below the bento */}
        <h2 className="mt-14 font-display text-4xl font-semibold leading-none tracking-tighter text-ink md:text-6xl">
          Know before you go<span className="text-star">.</span>
        </h2>
      </div>
    </section>
  );
}
