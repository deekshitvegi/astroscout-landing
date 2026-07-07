/*
 * Launch chapter: the "oversized numeral as structure" moment. A giant
 * live-ticking mono T-minus counter, two glass launch rows with viewing
 * spots, and the underlined-inline-link CTA (its own garment).
 */
import { useEffect, useState } from "react";
import { publicAsset } from "./assets";

// Fixed future launch targets so the countdown genuinely ticks.
function nextLaunchTarget(): number {
  // next 02:14:36-style window: now + a stable offset seeded per page load
  const base = Date.now();
  return base + (2 * 3600 + 14 * 60 + 36) * 1000;
}

const LAUNCHES = [
  {
    mission: "Lunar Horizon",
    vehicle: "Falcon 9",
    site: "Kennedy Space Center, FL",
    spot: "Playalinda Beach, 5 km",
  },
  {
    mission: "Sentinel-9B",
    vehicle: "Atlas V",
    site: "Cape Canaveral, FL",
    spot: "Max Brewer Causeway, 19 km",
  },
];

function pad(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

export default function Launches({ reduced }: { reduced: boolean }) {
  const [target] = useState(nextLaunchTarget);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, Math.floor((target - now) / 1000));
  const hh = Math.floor(diff / 3600);
  const mm = Math.floor((diff % 3600) / 60);
  const ss = diff % 60;

  return (
    <section id="launches" aria-label="Rocket launch tracker" className="relative overflow-hidden py-24 md:py-36">
      {/* violet aurora plate behind (board: violet glow top edge) */}
      <img
        src={publicAsset("assets/aurora-plate.jpg")}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <img src={publicAsset("assets/icons/rocket.png")} alt="" className="h-5 w-5 opacity-90" />
          <p className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-star">
            Next launch window
          </p>
        </div>
        <p
          className="font-mono-data mt-6 whitespace-nowrap text-5xl font-light leading-none tracking-tight text-star sm:text-6xl md:text-[10rem]"
          aria-live="off"
          suppressHydrationWarning
        >
          T-{pad(hh)}:{pad(mm)}:<span className={reduced ? "" : "tabular-nums"}>{pad(ss)}</span>
        </p>
        <div className="mx-auto mt-14 flex max-w-3xl flex-col gap-3 text-left">
          <div className="font-mono-data grid grid-cols-[1.3fr_0.8fr_1.2fr] gap-4 px-6 text-[10px] uppercase tracking-[0.2em] text-ink-2 md:grid-cols-[1.2fr_0.7fr_1.1fr_1fr]">
            <span>Mission</span>
            <span>Vehicle</span>
            <span>Launch site</span>
            <span className="hidden md:block">Where to watch</span>
          </div>
          {LAUNCHES.map((l) => (
            <div
              key={l.mission}
              className="glass-soft group grid grid-cols-[1.3fr_0.8fr_1.2fr] items-center gap-4 px-6 py-4 transition-transform duration-300 hover:translate-x-1 md:grid-cols-[1.2fr_0.7fr_1.1fr_1fr]"
            >
              <span className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-star" />
                <span className="font-display text-[15px] font-medium tracking-tight text-ink">
                  {l.mission}
                </span>
              </span>
              <span className="font-mono-data text-[13px] text-ink-2">{l.vehicle}</span>
              <span className="text-[13px] text-ink-2">{l.site}</span>
              <span className="hidden items-center gap-2 md:flex">
                <img src={publicAsset("assets/icons/radar.png")} alt="" className="h-4 w-4 opacity-70" />
                <span className="font-mono-data text-[12px] text-star/90">{l.spot}</span>
              </span>
            </div>
          ))}
        </div>
        {/* CTA garment: underlined inline link, arrow extends on hover */}
        <a
          href="#ask"
          className="group mt-12 inline-flex items-center gap-2 text-[15px] font-medium text-ink"
        >
          <span className="relative">
            Get launch alerts
            <span className="absolute -bottom-1 left-0 h-px w-full bg-star/80 transition-transform duration-300 group-hover:scale-x-110" />
          </span>
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 stroke-star transition-transform duration-300 group-hover:translate-x-1.5"
            fill="none"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M4 12h15m0 0-6-6m6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  );
}
