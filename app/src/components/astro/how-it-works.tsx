/*
 * "How it works" — sticky pinned scrollytelling. The phone mockup stays
 * pinned right; three captions swap on the left as the user scrolls.
 * Screenshot-safe: captions animate transform only, active state is opaque
 * by default. Mobile: stacked static cards, no pin.
 */
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "./scroll-runtime";
import { publicAsset } from "./assets";

const STEPS = [
  {
    n: "01",
    title: "Point it anywhere",
    body: "The sky map follows your view. Drag through constellations, planets, and the Milky Way in real time.",
    screen: "assets/app-sky.jpg",
    icon: "assets/icons/compass.png",
  },
  {
    n: "02",
    title: "Ask in plain words",
    body: "When is the next ISS pass, what is that bright dot, is tonight clear. AstroScout answers from live data.",
    screen: "assets/app-iss.jpg",
    icon: "assets/icons/chat.png",
  },
  {
    n: "03",
    title: "Go out and observe",
    body: "A nightly report tells you exactly what is worth stepping outside for, and when the clouds part.",
    screen: "assets/app-tonight.jpg",
    icon: "assets/icons/telescope.png",
  },
];

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
    const screens = wrapRef.current?.querySelectorAll("[data-screen]");
    if (!screens) return;
    screens.forEach((el, i) => {
      gsap.to(el, {
        scale: i === active ? 1 : 1.04,
        duration: 0.7,
        ease: "power2.out",
      });
    });
  }, [active, reduced]);

  // Mobile / reduced-motion: static stacked layout
  return (
    <section id="how" aria-label="How AstroScout works" className="relative">
      {/* Desktop scrollytelling */}
      <div
        ref={wrapRef}
        className="relative hidden md:block"
        style={{ height: reduced ? "auto" : "300dvh" }}
      >
        <div className={reduced ? "" : "sticky top-0 flex h-dvh items-center"}>
          <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_minmax(300px,420px)] items-center gap-16 px-8">
            <div className="max-w-md">
              <h2 className="font-display text-4xl font-semibold tracking-tighter text-ink md:text-5xl">
                Three moves, one night
              </h2>
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
                      <img src={publicAsset(s.icon)} alt="" className="h-4 w-4" style={{ opacity: on ? 1 : 0.45 }} />
                        <span
                          className="font-display text-lg font-medium tracking-tight"
                          style={{ color: on ? "#e8edf8" : "#8b93a7" }}
                        >
                          {s.title}
                        </span>
                      </div>
                      <p
                        className="mt-2 overflow-hidden pl-9 text-sm leading-relaxed text-ink-2 transition-[max-height,opacity] duration-500"
                        style={{ maxHeight: on ? 90 : 0, opacity: on ? 1 : 0.4 }}
                      >
                        {s.body}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* pinned device */}
            <div className="relative mx-auto aspect-[9/17] w-full max-w-[340px]">
              <div className="glass absolute inset-0 !rounded-[42px] p-2.5">
                <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-space-2">
                  {STEPS.map((s, i) => (
                    <img
                      key={s.screen}
                      data-screen
                      src={publicAsset(s.screen)}
                      alt={`AstroScout app: ${s.title}`}
                      className="absolute inset-0 h-full w-full object-cover object-top transition-[clip-path] duration-700 ease-out will-change-transform"
                      style={{
                        clipPath:
                          reduced || i <= active ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
                        zIndex: i,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile stacked */}
      <div className="mx-auto flex max-w-xl flex-col gap-8 px-6 py-20 md:hidden">
        <h2 className="font-display text-4xl font-semibold tracking-tighter text-ink">
          Three moves, one night
        </h2>
        {STEPS.map((s) => (
          <div key={s.n} className="glass-soft overflow-hidden">
            <img src={publicAsset(s.screen)} alt={`AstroScout app: ${s.title}`} className="aspect-[9/12] w-full object-cover object-top" />
            <div className="px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="font-mono-data text-xs tracking-widest text-star">{s.n}</span>
                <span className="font-display text-lg font-medium tracking-tight text-ink">{s.title}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


