/*
 * Interactive planetarium (spectacle second beat): a drag-to-pan canvas sky
 * with real bright stars, constellation lines, the Milky Way band, planets,
 * and a time slider that rotates the sky (sidereal drift). Full-bleed
 * image-as-canvas section, bottom-left glass control panel per the board.
 */
import { useEffect, useRef, useState } from "react";
import { CONSTELLATIONS, PLANETS, STARS } from "./star-catalog";
import { publicAsset } from "./assets";

const TAU = Math.PI * 2;

export default function Planetarium({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hour, setHour] = useState(22);
  const view = useRef({ yaw: 1.2, pitch: 0.42, dragging: false, lx: 0, ly: 0, vyaw: 0.00035 });
  const hourRef = useRef(hour);
  hourRef.current = hour;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // project RA/Dec through a rotating camera (stereographic-ish)
    const fov = 1.15;
    const project = (raH: number, dec: number): [number, number, number] | null => {
      const st = hourRef.current;
      const lst = ((st - 18) / 24) * TAU; // sidereal offset from slider
      const ra = (raH / 24) * TAU - lst;
      const d = (dec / 180) * Math.PI;
      // unit vector
      const x = Math.cos(d) * Math.cos(ra);
      const y = Math.cos(d) * Math.sin(ra);
      const z = Math.sin(d);
      const { yaw, pitch } = view.current;
      // yaw
      const x1 = x * Math.cos(yaw) + y * Math.sin(yaw);
      const y1 = -x * Math.sin(yaw) + y * Math.cos(yaw);
      // pitch
      const z1 = z * Math.cos(pitch) - x1 * Math.sin(pitch);
      const x2 = x1 * Math.cos(pitch) + z * Math.sin(pitch);
      if (x2 < 0.12) return null; // behind camera
      const sx = w / 2 + (y1 / x2) * (w / (2 * fov));
      const sy = h / 2 - (z1 / x2) * (w / (2 * fov));
      return [sx, sy, x2];
    };

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Milky Way band: soft diagonal wash following the galactic plane
      const mw = ctx.createLinearGradient(0, h * 0.15, w, h * 0.85);
      mw.addColorStop(0, "rgba(140,174,255,0)");
      mw.addColorStop(0.5, "rgba(160,180,230,0.05)");
      mw.addColorStop(1, "rgba(140,174,255,0)");
      ctx.fillStyle = mw;
      ctx.fillRect(0, 0, w, h);

      // constellation lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(140,174,255,0.38)";
      for (const c of CONSTELLATIONS) {
        for (const [a, b] of c.lines) {
          const pa = project(STARS[a].ra, STARS[a].dec);
          const pb = project(STARS[b].ra, STARS[b].dec);
          if (!pa || !pb) continue;
          ctx.beginPath();
          ctx.moveTo(pa[0], pa[1]);
          ctx.lineTo(pb[0], pb[1]);
          ctx.stroke();
        }
        const ls = STARS[c.label];
        const lp = ls ? project(ls.ra, ls.dec) : null;
        if (lp) {
          ctx.fillStyle = "rgba(140,174,255,0.6)";
          ctx.font = "10px 'IBM Plex Mono', monospace";
          ctx.fillText(c.name.toUpperCase(), lp[0] + 10, lp[1] - 8);
        }
      }

      // stars
      for (const s of STARS) {
        const p = project(s.ra, s.dec);
        if (!p) continue;
        const r = Math.max(0.7, 3.2 - s.mag * 0.75);
        ctx.globalAlpha = Math.min(1, 1.15 - s.mag * 0.16);
        ctx.fillStyle = "#dfe8ff";
        ctx.beginPath();
        ctx.arc(p[0], p[1], r, 0, TAU);
        ctx.fill();
        if (s.mag < 0.6) {
          ctx.globalAlpha = 0.25;
          ctx.beginPath();
          ctx.arc(p[0], p[1], r * 2.6, 0, TAU);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // planets
      for (const pl of PLANETS) {
        const p = project(pl.ra, pl.dec);
        if (!p) continue;
        ctx.fillStyle = pl.color;
        ctx.beginPath();
        ctx.arc(p[0], p[1], pl.size, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(232,237,248,0.85)";
        ctx.font = "11px 'IBM Plex Mono', monospace";
        ctx.fillText(pl.name, p[0] + 9, p[1] + 4);
      }

      // idle drift
      if (!view.current.dragging && !reduced) view.current.yaw += view.current.vyaw;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    // drag to pan
    const onDown = (e: PointerEvent) => {
      view.current.dragging = true;
      view.current.lx = e.clientX;
      view.current.ly = e.clientY;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!view.current.dragging) return;
      const dx = e.clientX - view.current.lx;
      const dy = e.clientY - view.current.ly;
      view.current.lx = e.clientX;
      view.current.ly = e.clientY;
      view.current.yaw -= dx * 0.0026;
      view.current.pitch = Math.max(-1.2, Math.min(1.35, view.current.pitch + dy * 0.0022));
    };
    const onUp = () => {
      view.current.dragging = false;
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [reduced]);

  const hourLabel = `${String(Math.floor(hour)).padStart(2, "0")}:${hour % 1 ? "30" : "00"}`;

  return (
    <section id="sky" aria-label="Interactive planetarium" className="relative">
      <div ref={wrapRef} className="relative h-[88dvh] min-h-[560px] w-full overflow-hidden">
        {/* backdrop plate under the canvas for depth */}
        <img
          src={publicAsset("assets/milkyway-ridge.jpg")}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div aria-hidden className="absolute inset-0 bg-space/55" />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none"
          style={{ cursor: "grab" }}
          aria-label="Draggable sky map with constellations and planets"
        />
        {/* bottom-left glass control panel (board anchor) */}
        <div className="pointer-events-none absolute inset-0 flex items-end p-6 md:p-12">
          <div className="glass pointer-events-auto w-full max-w-md px-7 py-6">
            <p className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-star">
              Interactive planetarium
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold leading-none tracking-tighter text-ink md:text-5xl">
              The sky, in your hands
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-2">
              Drag to explore constellations, planets, and the Milky Way. Slide through the night
              and watch the sky turn.
            </p>
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <span className="font-mono-data text-xs text-ink-2">Tonight</span>
                <span className="font-mono-data rounded-full bg-white/[0.07] px-3 py-1 text-xs text-ink">
                  {hourLabel}
                </span>
              </div>
              <input
                type="range"
                min={18}
                max={30}
                step={0.5}
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                aria-label="Time of night"
                className="astro-slider mt-3 w-full"
              />
              <div className="font-mono-data mt-1 flex justify-between text-[10px] text-ink-2/70">
                <span>18:00</span>
                <span>22:00</span>
                <span>02:00</span>
                <span>06:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
