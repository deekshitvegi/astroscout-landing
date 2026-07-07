/*
 * Hero: pinned scroll-scrubbed film (Tier-1, wow-catalog A1).
 * Frame 1 paints immediately (screenshot-safe); scroll plays the film.
 * Content animates transform/scale only, never opacity-to-zero.
 * Reduced motion: static final frame, no pin.
 * pinSpacing kept OFF; the film section owns its own tall wrapper instead
 * so the following section slides naturally (no dead spacer band).
 */
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "./scroll-runtime";
import { useMagnetic } from "./interactions";
import { publicAsset } from "./assets";

const FRAME_COUNT = 61;
const framePath = (i: number) => publicAsset(`frames/hero/f_${String(i + 1).padStart(4, "0")}.jpg`);

const CHAT_LOOP = [
  {
    q: "Where is the ISS right now?",
    a: "The Orbit panel and live assistant fetch the current station latitude, longitude, altitude, and speed from a public API.",
  },
  {
    q: "Is tonight worth observing?",
    a: "The Tonight panel checks live cloud cover, visibility, rain chance, temperature, and current moon phase for your city.",
  },
  {
    q: "What is the next rocket launch?",
    a: "The Launches panel reads upcoming NET windows from Launch Library and counts down to the next listed launch.",
  },
];

const PLACEHOLDERS = [
  "Where is the ISS now?",
  "Show upcoming rocket launches",
  "Cloud cover tonight in Chicago",
  "Closest asteroid today",
];

function useTypedPlaceholder(reduced: boolean): string {
  const [text, setText] = useState(PLACEHOLDERS[0]);
  useEffect(() => {
    if (reduced) return;
    let phrase = 0;
    let char = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const full = PLACEHOLDERS[phrase];
      if (!deleting) {
        char++;
        if (char >= full.length) {
          deleting = true;
          timer = setTimeout(tick, 2200);
          setText(full);
          return;
        }
      } else {
        char -= 2;
        if (char <= 0) {
          char = 0;
          deleting = false;
          phrase = (phrase + 1) % PLACEHOLDERS.length;
        }
      }
      setText(PLACEHOLDERS[phrase].slice(0, Math.max(char, 0)) || " ");
      timer = setTimeout(tick, deleting ? 22 : 46);
    };
    timer = setTimeout(tick, 1400);
    return () => clearTimeout(timer);
  }, [reduced]);
  return text;
}

function ChatBubble({ reduced }: { reduced: boolean }) {
  const [idx, setIdx] = useState(0);
  const [qChars, setQChars] = useState(reduced ? CHAT_LOOP[0].q.length : 0);
  const [showA, setShowA] = useState(reduced);

  useEffect(() => {
    if (reduced) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const run = (i: number) => {
      if (!alive) return;
      setIdx(i);
      setQChars(0);
      setShowA(false);
      const q = CHAT_LOOP[i].q;
      let c = 0;
      const typeQ = () => {
        if (!alive) return;
        c++;
        setQChars(c);
        if (c < q.length) {
          timer = setTimeout(typeQ, 34);
        } else {
          timer = setTimeout(() => {
            if (!alive) return;
            setShowA(true);
            timer = setTimeout(() => run((i + 1) % CHAT_LOOP.length), 5200);
          }, 700);
        }
      };
      timer = setTimeout(typeQ, 900);
    };
    run(0);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [reduced]);

  const item = CHAT_LOOP[idx];
  return (
    <div className="glass-soft w-full max-w-md px-5 py-4 text-left" aria-hidden>
      <div className="flex items-center gap-2">
        <img src={publicAsset("assets/icons/chat.png")} alt="" className="h-4 w-4 opacity-80" />
        <span className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink-2">
          Available now
        </span>
      </div>
      <p className="mt-3 min-h-[1.4em] text-[15px] leading-snug text-ink">
        {item.q.slice(0, qChars)}
        {!showA && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-star" />}
      </p>
      <div
        className="mt-2 overflow-hidden transition-[max-height] duration-700 ease-out"
        style={{ maxHeight: showA ? 160 : 0 }}
      >
        <p className="rounded-2xl bg-white/[0.05] px-4 py-3 text-[13.5px] leading-relaxed text-ink-2">
          {item.a}
        </p>
      </div>
    </div>
  );
}

export default function Hero({ reduced }: { reduced: boolean }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const placeholder = useTypedPlaceholder(reduced);
  const askRef = useMagnetic<HTMLButtonElement>(0.3, reduced);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const images: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
    let loadedMax = -1;
    let current = 0;
    let disposed = false;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      paint(current);
    };

    const paint = (frame: number) => {
      const pick = Math.min(frame, loadedMax);
      if (pick < 0) return;
      const img = images[pick];
      if (!img) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.width, ch / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    // Frame 1 immediately, then stream the rest.
    const first = new Image();
    first.src = framePath(reduced ? FRAME_COUNT - 1 : 0);
    first.onload = () => {
      if (disposed) return;
      images[0] = first;
      loadedMax = 0;
      resize();
    };
    if (!reduced) {
      let i = 1;
      const streamNext = () => {
        if (disposed || i >= FRAME_COUNT) return;
        const idx = i++;
        const img = new Image();
        img.src = framePath(idx);
        img.onload = () => {
          if (disposed) return;
          images[idx] = img;
          while (loadedMax + 1 < FRAME_COUNT && images[loadedMax + 1]) loadedMax++;
          if (idx === current || loadedMax === idx) paint(current);
          streamNext();
        };
        img.onerror = () => streamNext();
      };
      // 4 parallel streams
      streamNext();
      streamNext();
      streamNext();
      streamNext();
    }

    window.addEventListener("resize", resize);
    resize();

    let st: ScrollTrigger | undefined;
    let ctxGsap: gsap.Context | undefined;
    if (!reduced && pinRef.current && stageRef.current) {
      ctxGsap = gsap.context(() => {
        st = ScrollTrigger.create({
          trigger: pinRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            const frame = Math.min(
              FRAME_COUNT - 1,
              Math.round(self.progress * (FRAME_COUNT - 1)),
            );
            if (frame !== current) {
              current = frame;
              paint(frame);
            }
            // content drifts up + scales down slightly as the film plays
            if (contentRef.current) {
              const p = self.progress;
              contentRef.current.style.transform = `translate3d(0, ${p * -12}vh, 0) scale(${1 - p * 0.06})`;
            }
          },
        });
      }, pinRef);
    }

    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      st?.kill();
      ctxGsap?.revert();
    };
  }, [reduced]);

  // entrance: fires on mount (screenshot-safe, transform-only)
  useEffect(() => {
    if (reduced || !contentRef.current) return;
    const nodes = contentRef.current.querySelectorAll("[data-rise]");
    gsap.fromTo(
      nodes,
      { y: 46 },
      { y: 0, duration: 1.15, ease: "power3.out", stagger: 0.09, delay: 0.1 },
    );
  }, [reduced]);

  return (
    <section id="top" aria-label="AstroScout hero">
      {/* Tall wrapper = scrub track; the inner stage stays pinned via sticky. */}
      <div ref={pinRef} className="relative" style={{ height: reduced ? "100dvh" : "260dvh" }}>
        <div ref={stageRef} className="sticky top-0 h-dvh overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
          {/* readability scrim */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 90% 62% at 50% 46%, rgba(4,6,13,0.18), rgba(4,6,13,0.62) 82%)",
            }}
          />
          <div
            ref={contentRef}
            className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center gap-7 px-6 pt-24 text-center will-change-transform"
          >
            <h1
              data-rise
              className="font-display text-5xl font-semibold leading-none tracking-tighter text-white md:text-7xl"
            >
              Your live console{" "}
              <br />
              for the night sky
            </h1>
            <p data-rise className="max-w-md text-base leading-relaxed text-ink-2">
              Plan tonight with live ISS position, launch schedules, weather, moon phase, and NASA asteroid data.
            </p>
            <div data-rise className="glass flex w-full max-w-xl items-center gap-3 py-2 pl-6 pr-2">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0 stroke-ink-2"
                fill="none"
                strokeWidth="1.6"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.6-3.6" strokeLinecap="round" />
              </svg>
              <span className="min-w-0 flex-1 truncate text-left text-[15px] text-ink-2">
                {placeholder}
              </span>
              <button
                ref={askRef}
                type="button"
                onClick={() => {
                  document.getElementById("ask")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group rounded-full bg-star/90 px-5 py-3 text-[14px] font-medium text-space transition-colors duration-200 hover:bg-star active:scale-[0.94]"
              >
                Ask live data
              </button>
            </div>
            <div data-rise className="flex w-full justify-center">
              <ChatBubble reduced={reduced} />
            </div>
          </div>
          {/* film progress dot rail */}
          {!reduced && (
            <div aria-hidden className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-star/80" />
              <span className="h-1 w-10 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full w-1/3 animate-pulse rounded-full bg-star/60" />
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
