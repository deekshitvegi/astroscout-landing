/*
 * Free stack band + footer: oversized count-up metrics strip, framed-block
 * GitHub CTA (fills glass on hover), footer with data-source credits.
 */
import { useEffect, useRef, useState } from "react";

const METRICS = [
  { end: 2.5, dec: 1, suffix: "M+", label: "Stars mapped" },
  { end: 120, dec: 0, suffix: "+", label: "Launches tracked" },
  { end: 0, dec: 0, suffix: "", label: "Dollars" },
];

const SOURCES = [
  { name: "NASA", url: "https://api.nasa.gov", host: "nasa.gov" },
  { name: "Celestrak", url: "https://celestrak.org", host: "celestrak.org" },
  { name: "Open-Meteo", url: "https://open-meteo.com", host: "open-meteo.com" },
  { name: "Launch Library", url: "https://thespacedevs.com", host: "thespacedevs.com" },
];

function CountUp({
  end,
  dec,
  suffix,
  reduced,
}: {
  end: number;
  dec: number;
  suffix: string;
  reduced: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(reduced ? end : 0);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 1600;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(end * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [end, reduced]);

  return (
    <span ref={ref} className="font-mono-data tabular-nums">
      {val.toFixed(dec)}
      {suffix}
    </span>
  );
}

export default function FreeBand({ reduced }: { reduced: boolean }) {
  return (
    <>
      <section aria-label="Free and open data" className="relative py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="glass px-8 py-10 md:px-12">
            <h2 className="max-w-xl font-display text-4xl font-semibold leading-none tracking-tighter text-ink md:text-5xl">
              100% free. Powered by open data.
            </h2>
            <div className="mt-10 grid gap-8 border-t border-white/[0.07] pt-8 md:grid-cols-[1fr_1fr_0.7fr_auto] md:items-end">
              {METRICS.map((m) => (
                <div key={m.label}>
                  <p className="text-5xl font-light text-star md:text-6xl">
                    <CountUp end={m.end} dec={m.dec} suffix={m.suffix} reduced={reduced} />
                  </p>
                  <p className="font-mono-data mt-2 text-[11px] uppercase tracking-[0.22em] text-ink-2">
                    {m.label}
                  </p>
                </div>
              ))}
              {/* CTA garment: framed block, fills glass on hover */}
              <a
                href="https://github.com/deekshitvegi/astroscout-landing"
                target="_blank"
                rel="noreferrer"
                className="group relative inline-flex items-center gap-2.5 self-start overflow-hidden rounded-2xl border border-star/50 px-6 py-3.5 text-[14px] font-medium text-ink transition-colors duration-300 hover:text-space md:self-end"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 -z-0 origin-bottom scale-y-0 bg-star transition-transform duration-300 ease-out group-hover:scale-y-100"
                />
                <svg viewBox="0 0 24 24" className="relative z-10 h-4.5 w-4.5 fill-current" aria-hidden>
                  <path d="M12 1.8A10.2 10.2 0 0 0 8.77 21.68c.51.1.7-.22.7-.49v-1.9c-2.84.62-3.44-1.2-3.44-1.2-.46-1.18-1.13-1.5-1.13-1.5-.93-.63.07-.62.07-.62 1.03.07 1.57 1.06 1.57 1.06.91 1.57 2.4 1.11 2.98.85.1-.66.36-1.11.65-1.37-2.27-.26-4.65-1.13-4.65-5.04 0-1.11.4-2.02 1.05-2.74-.1-.26-.46-1.3.1-2.7 0 0 .86-.28 2.8 1.05a9.73 9.73 0 0 1 5.1 0c1.94-1.33 2.8-1.05 2.8-1.05.56 1.4.2 2.44.1 2.7.65.72 1.05 1.63 1.05 2.74 0 3.92-2.39 4.78-4.66 5.03.37.32.69.94.69 1.9v2.82c0 .27.18.6.7.49A10.2 10.2 0 0 0 12 1.8Z" />
                </svg>
                <span className="relative z-10">Star on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/[0.06] py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden>
              <circle cx="16" cy="16" r="14.5" stroke="#8caeff" strokeWidth="1.4" opacity="0.55" />
              <path d="M8 22 16 8l8 14" stroke="#e8edf8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="16" cy="8" r="1.8" fill="#8caeff" />
            </svg>
            <span className="text-[13px] text-ink-2">
              AstroScout. Built under one sky, for everyone.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-mono-data text-[10px] uppercase tracking-[0.22em] text-ink-2/70">
              Data sources
            </span>
            {SOURCES.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="group text-[13px] text-ink-2 transition-colors hover:text-ink"
              >
                {s.name}
                <span className="font-mono-data ml-1.5 text-[10px] text-ink-2/60 group-hover:text-star/80">
                  {s.host}
                </span>
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
