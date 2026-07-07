/*
 * Fixed background: parallax starfield canvas + three aurora orbs whose
 * colors shift per scroll chapter. Stars move slower than content (depth).
 * Client-only; static gradient fallback for reduced motion / SSR.
 */
import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; tw: number; layer: number };

const CHAPTER_PALETTES: [string, string, string][] = [
  ["#1b2f7a", "#3a1d6e", "#0d3b5c"], // hero
  ["#16255f", "#2a1650", "#0d3b5c"], // how
  ["#0d3b5c", "#1b2f7a", "#123a6e"], // sky
  ["#123a6e", "#0d3b5c", "#1b2f7a"], // iss
  ["#2c1a5e", "#3a1d6e", "#1b2f7a"], // launch
  ["#0d3b5c", "#123a6e", "#2a1650"], // tonight
  ["#1b2f7a", "#2a1650", "#0d3b5c"], // ask
  ["#0d3b5c", "#1b2f7a", "#3a1d6e"], // free + footer
];

function hexLerp(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const out = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${out[0]},${out[1]},${out[2]})`;
}

export default function Starfield({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orb1 = useRef<HTMLDivElement>(null);
  const orb2 = useRef<HTMLDivElement>(null);
  const orb3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const seed = (n: number) => {
      let s = n;
      return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
      };
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rand = seed(42);
      const count = Math.min(340, Math.floor((w * h) / 4200));
      stars = Array.from({ length: count }, () => ({
        x: rand() * w,
        y: rand() * (h * 2.2),
        r: 0.35 + rand() * 1.25,
        tw: rand() * Math.PI * 2,
        layer: rand() < 0.6 ? 0.12 : rand() < 0.85 ? 0.22 : 0.38,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let t = 0;
    const draw = () => {
      t += 0.016;
      const sy = window.scrollY;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const py = (((s.y - sy * s.layer) % (h * 2.2)) + h * 2.2) % (h * 2.2) - h * 0.6;
        if (py < -8 || py > h + 8) continue;
        const twinkle = reduced ? 0.75 : 0.55 + 0.45 * Math.sin(t * 1.4 + s.tw);
        ctx.globalAlpha = twinkle * (s.layer > 0.3 ? 0.95 : 0.6);
        ctx.fillStyle = s.layer > 0.3 ? "#c9d9ff" : "#8fa3cc";
        ctx.beginPath();
        ctx.arc(s.x, py, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();

    // Chapter-linked orb colors
    let colorRaf = 0;
    const updateOrbs = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const p = docH > 0 ? window.scrollY / docH : 0;
      const f = p * (CHAPTER_PALETTES.length - 1);
      const i = Math.min(Math.floor(f), CHAPTER_PALETTES.length - 2);
      const tt = f - i;
      const a = CHAPTER_PALETTES[i];
      const b = CHAPTER_PALETTES[i + 1];
      if (orb1.current) orb1.current.style.background = hexLerp(a[0], b[0], tt);
      if (orb2.current) orb2.current.style.background = hexLerp(a[1], b[1], tt);
      if (orb3.current) orb3.current.style.background = hexLerp(a[2], b[2], tt);
      colorRaf = 0;
    };
    const onScroll = () => {
      if (!colorRaf) colorRaf = requestAnimationFrame(updateOrbs);
    };
    updateOrbs();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      if (colorRaf) cancelAnimationFrame(colorRaf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  return (
    <div aria-hidden className="fixed inset-0 z-0 pointer-events-none">
      <div
        ref={orb1}
        className="absolute rounded-full opacity-55"
        style={{
          width: "55vw",
          height: "55vw",
          left: "-12vw",
          top: "-14vw",
          background: "#1b2f7a",
          filter: "blur(140px)",
          transform: "translateZ(0)",
        }}
      />
      <div
        ref={orb2}
        className="absolute rounded-full opacity-45"
        style={{
          width: "48vw",
          height: "48vw",
          right: "-16vw",
          top: "32vh",
          background: "#3a1d6e",
          filter: "blur(150px)",
          transform: "translateZ(0)",
        }}
      />
      <div
        ref={orb3}
        className="absolute rounded-full opacity-50"
        style={{
          width: "52vw",
          height: "52vw",
          left: "8vw",
          bottom: "-22vw",
          background: "#0d3b5c",
          filter: "blur(150px)",
          transform: "translateZ(0)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}

