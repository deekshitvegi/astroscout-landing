/*
 * Sticky guide section. This keeps the scrollytelling feel, but removes
 * the fake phone-app pitch and points users at the working tools on the page.
 */
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "./scroll-runtime";

const STEPS = [
  {
    n: "01",
    title: "Explore the sky map",
    body: "Drag the planetarium below, change the time slider, and inspect stars, constellations, and planets in the browser.",
  },
  {
    n: "02",
    title: "Read live feeds",
    body: "ISS position, launch schedules, weather, and asteroid close approaches are fetched from public data sources.",
  },
  {
    n: "03",
    title: "Decide if it is worth going out",
    body: "Use cloud cover, visibility, moon phase, and upcoming events to plan an observing window tonight.",
  },
];

function PreviewPanel({ active }: { active: number }) {
  return (
    <div className="glass relative mx-auto w-full max-w-[460px] overflow-hidden px-7 py-6">
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
        <div>
          <p className="font-mono-data text-[10px] uppercase tracking-[0.22em] text-star">
            Working site
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
            Use AstroScout here
          </h3>
        </div>
        <span className="font-mono-data rounded-full bg-star/12 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-star">
          Live
        </span>
      </div>

      <div className="relative min-h-[360px] pt-6">
        <div
          data-panel
          className="absolute inset-x-0 top-6 transition-[clip-path] duration-700"
          style={{ clipPath: active === 0 ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-white/[0.08] bg-space-2">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(140,174,255,0.18),transparent_28%),radial-gradient(circle_at_70%_52%,rgba(255,255,255,0.16),transparent_2px)]" />
            <svg viewBox="0 0 260 190" className="absolute inset-0 h-full w-full" aria-hidden>
              <path d="M32 126 82 90 112 132 166 64 222 104" fill="none" stroke="#8caeff" strokeWidth="1.2" opacity="0.6" />
              {[32, 82, 112, 166, 222].map((x, i) => (
                <circle key={x} cx={x} cy={[126, 90, 132, 64, 104][i]} r="2.8" fill="#e8edf8" />
              ))}
            </svg>
            <div className="absolute bottom-5 left-5 right-5">
              <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-2">
                Planetarium
              </p>
              <p className="mt-1 text-sm text-ink">Canvas sky map with drag and time controls.</p>
            </div>
          </div>
        </div>

        <div
          data-panel
          className="absolute inset-x-0 top-6 transition-[clip-path] duration-700"
          style={{ clipPath: active === 1 ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
        >
          <div className="space-y-3">
            {[
              ["ISS", "Live latitude, longitude, altitude"],
              ["Launches", "Upcoming NET windows"],
              ["Open-Meteo", "Cloud cover and visibility"],
              ["NASA NeoWs", "Near-Earth approaches"],
            ].map(([label, value]) => (
              <div key={label} className="glass-soft grid grid-cols-[0.8fr_1.2fr_auto] items-center gap-3 px-4 py-4">
                <span className="font-display text-[15px] font-medium text-ink">{label}</span>
                <span className="text-[12px] text-ink-2">{value}</span>
                <span className="h-2 w-2 rounded-full bg-star shadow-[0_0_12px_rgba(140,174,255,0.8)]" />
              </div>
            ))}
          </div>
        </div>

        <div
          data-panel
          className="absolute inset-x-0 top-6 transition-[clip-path] duration-700"
          style={{ clipPath: active === 2 ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
        >
          <div className="glass-soft px-5 py-5">
            <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-star">
              Tonight checklist
            </p>
            <div className="mt-5 space-y-4">
              {[
                "Pick a city or use browser location",
                "Check cloud cover and visibility",
                "Watch the ISS and launch panels",
                "Ask the live data assistant a direct question",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full border border-star/40 text-[10px] text-star">
                    OK
                  </span>
                  <span className="text-sm text-ink-2">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorks({ reduced }: { reduced: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced || !wrapRef.current) return;
    const st = ScrollTrigger.create({
      trigger: wrapRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const idx = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length));
        setActive((prev) => (prev === idx ? prev : idx));
      },
    });
    return () => st.kill();
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const panels = wrapRef.current?.querySelectorAll("[data-panel]");
    if (!panels) return;
    panels.forEach((el, i) => {
      gsap.to(el, {
        y: i === active ? 0 : 18,
        duration: 0.6,
        ease: "power2.out",
      });
    });
  }, [active, reduced]);

  return (
    <section id="how" aria-label="How to use AstroScout" className="relative">
      <div
        ref={wrapRef}
        className="relative hidden md:block"
        style={{ height: reduced ? "auto" : "300dvh" }}
      >
        <div className={reduced ? "" : "sticky top-0 flex h-dvh items-center"}>
          <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_minmax(360px,500px)] items-center gap-16 px-8">
            <div className="max-w-md">
              <p className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-star">
                No app install
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tighter text-ink md:text-5xl">
                Use AstroScout right here
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-2">
                This section is a quick guide to the live tools on this page.
              </p>
              <div className="mt-10 flex flex-col gap-3">
                {STEPS.map((s, i) => {
                  const on = reduced || i === active;
                  return (
                    <button
                      key={s.n}
                      type="button"
                      onClick={() => setActive(i)}
                      className="glass-soft cursor-pointer px-6 py-5 text-left transition-transform duration-500"
                      style={{
                        transform: on ? "translateX(10px)" : "translateX(0)",
                        borderColor: on ? "rgba(140,174,255,0.32)" : undefined,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="font-mono-data text-xs tracking-widest"
                          style={{ color: on ? "#8caeff" : "#8b93a7" }}
                        >
                          {s.n}
                        </span>
                        <span
                          className="font-display text-lg font-medium tracking-tight"
                          style={{ color: on ? "#e8edf8" : "#8b93a7" }}
                        >
                          {s.title}
                        </span>
                      </div>
                      <p
                        className="mt-2 overflow-hidden pl-9 text-sm leading-relaxed text-ink-2 transition-[max-height,opacity] duration-500"
                        style={{ maxHeight: on ? 100 : 0, opacity: on ? 1 : 0.4 }}
                      >
                        {s.body}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
            <PreviewPanel active={active} />
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-xl flex-col gap-5 px-6 py-20 md:hidden">
        <p className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-star">
          No app install
        </p>
        <h2 className="font-display text-4xl font-semibold tracking-tighter text-ink">
          Use AstroScout right here
        </h2>
        {STEPS.map((s) => (
          <div key={s.n} className="glass-soft px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="font-mono-data text-xs tracking-widest text-star">{s.n}</span>
              <span className="font-display text-lg font-medium tracking-tight text-ink">{s.title}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
