/*
 * ISS chapter: asymmetric 60/40 split. Dark dotted world map with an
 * animated ground track + pulsing blip (canvas over the generated plate),
 * glass telemetry panel with ticking mono readouts.
 */
import { useEffect, useRef, useState } from "react";
import { publicAsset } from "./assets";

// Simple circular-orbit ground-track model (51.6 deg inclination).
function issState(tSec: number) {
  const period = 5580; // ~93 min
  const phase = (tSec % period) / period;
  const angle = phase * Math.PI * 2;
  const incl = (51.6 * Math.PI) / 180;
  const lat = Math.asin(Math.sin(incl) * Math.sin(angle)) * (180 / Math.PI);
  // longitude drifts west as Earth rotates under the orbit
  const lon = ((phase * 360 * (period / 5580) * 1.0 - tSec * (360 / 86400) + 540) % 360) - 180;
  return { lat, lon: -lon };
}

export default function IssTracker({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tele, setTele] = useState({ lat: -24.87, lon: 132.21, alt: 419.4, speed: 27584 });

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

    const toXY = (lat: number, lon: number): [number, number] => [
      ((lon + 180) / 360) * w,
      ((90 - lat) / 180) * h,
    ];

    const t0 = Date.now() / 1000 - 1400; // start mid-pass for a nice curve
    let raf = 0;
    let lastTele = 0;
    const draw = () => {
      const t = Date.now() / 1000 - t0;
      ctx.clearRect(0, 0, w, h);

      // trail: past 40 minutes
      ctx.beginPath();
      let started = false;
      for (let dt = -2400; dt <= 0; dt += 30) {
        const s = issState(t + dt);
        const [x, y] = toXY(s.lat, s.lon);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          // break the line when wrapping the dateline
          const prev = issState(t + dt - 30);
          if (Math.abs(prev.lon - s.lon) > 90) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.strokeStyle = "rgba(140,174,255,0.75)";
      ctx.lineWidth = 1.6;
      ctx.shadowColor = "rgba(140,174,255,0.8)";
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // upcoming path (dashed)
      ctx.beginPath();
      started = false;
      for (let dt = 0; dt <= 1800; dt += 30) {
        const s = issState(t + dt);
        const [x, y] = toXY(s.lat, s.lon);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          const prev = issState(t + dt - 30);
          if (Math.abs(prev.lon - s.lon) > 90) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.setLineDash([3, 6]);
      ctx.strokeStyle = "rgba(140,174,255,0.28)";
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.setLineDash([]);

      // blip
      const s = issState(t);
      const [x, y] = toXY(s.lat, s.lon);
      const pulse = reduced ? 0.5 : (Date.now() % 1600) / 1600;
      ctx.globalAlpha = 1 - pulse;
      ctx.beginPath();
      ctx.arc(x, y, 6 + pulse * 22, 0, Math.PI * 2);
      ctx.strokeStyle = "#8caeff";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#cfe0ff";
      ctx.shadowColor = "#8caeff";
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      // telemetry state ~2Hz
      if (Date.now() - lastTele > 500) {
        lastTele = Date.now();
        setTele({
          lat: s.lat,
          lon: s.lon,
          alt: 418.2 + Math.sin(t / 300) * 2.1,
          speed: 27580 + Math.round(Math.sin(t / 120) * 14),
        });
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduced]);

  return (
    <section id="orbit" aria-label="Live ISS tracker" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-star">
          Orbit watch
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-none tracking-tighter text-ink md:text-6xl">
          Where the station is, right now
        </h2>
        <div className="mt-12 grid gap-6 lg:grid-cols-[3fr_2fr]">
          {/* map */}
          <div ref={wrapRef} className="glass-soft relative aspect-[16/9] overflow-hidden !rounded-[26px]">
            <img
              src={publicAsset("assets/worldmap-dots.jpg")}
              alt="World map"
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />
            <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />
            <div className="absolute bottom-4 left-5 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-star opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-star" />
              </span>
              <span className="font-mono-data text-[11px] uppercase tracking-[0.2em] text-ink-2">
                Simulated ground track
              </span>
            </div>
          </div>
          {/* telemetry */}
          <div className="glass px-7 py-6">
            <div className="hairline-y">
              <div className="flex items-center justify-between pb-4">
                <div>
                  <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                    Altitude
                  </p>
                  <p className="font-mono-data mt-1 text-3xl text-ink">
                    {tele.alt.toFixed(1)} <span className="text-sm text-ink-2">km</span>
                  </p>
                </div>
                <img src={publicAsset("assets/icons/satellite.png")} alt="" className="h-9 w-9 opacity-80" />
              </div>
              <div className="py-4">
                <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                  Speed
                </p>
                <p className="font-mono-data mt-1 text-3xl text-ink">
                  {tele.speed.toLocaleString("en-US")}{" "}
                  <span className="text-sm text-ink-2">km/h</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                    Latitude
                  </p>
                  <p className="font-mono-data mt-1 text-lg text-ink">{tele.lat.toFixed(4)}°</p>
                </div>
                <div>
                  <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                    Longitude
                  </p>
                  <p className="font-mono-data mt-1 text-lg text-ink">{tele.lon.toFixed(4)}°</p>
                </div>
                <div>
                  <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                    Orbit period
                  </p>
                  <p className="font-mono-data mt-1 text-lg text-ink">92.9 min</p>
                </div>
                <div>
                  <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                    Crew aboard
                  </p>
                  <p className="font-mono-data mt-1 text-lg text-ink">7</p>
                </div>
              </div>
            </div>
            <p className="mt-5 text-[12px] leading-relaxed text-ink-2">
              The full app tracks the real station from live Celestrak orbital elements and
              predicts visible passes over your exact location.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
