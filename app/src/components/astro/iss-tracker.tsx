/*
 * ISS chapter: live position from wheretheiss.at, drawn over the world map.
 * The trail is built from fetched points during the current visit.
 */
import { useEffect, useRef, useState } from "react";
import { publicAsset } from "./assets";
import { getIssPosition, type IssPosition } from "./live-data";

type TrailPoint = { lat: number; lon: number; timestamp: number };

const INITIAL_ISS: IssPosition = {
  latitude: 0,
  longitude: 0,
  altitude: 420,
  velocity: 27580,
  visibility: "unknown",
  footprint: 4500,
  timestamp: Math.floor(Date.now() / 1000),
};

export default function IssTracker({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<IssPosition>(INITIAL_ISS);
  const trailRef = useRef<TrailPoint[]>([]);
  const [tele, setTele] = useState<IssPosition>(INITIAL_ISS);
  const [status, setStatus] = useState<"loading" | "live" | "error">("loading");
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    let disposed = false;
    let timeout = 0;
    const controller = new AbortController();

    const load = async () => {
      try {
        const next = await getIssPosition(controller.signal);
        if (disposed) return;
        liveRef.current = next;
        trailRef.current = [
          ...trailRef.current,
          { lat: next.latitude, lon: next.longitude, timestamp: next.timestamp },
        ].slice(-28);
        setTele(next);
        setStatus("live");
        setUpdatedAt(Date.now());
      } catch {
        if (!disposed) setStatus((prev) => (prev === "live" ? "live" : "error"));
      } finally {
        if (!disposed) timeout = window.setTimeout(load, reduced ? 30000 : 8000);
      }
    };

    load();
    return () => {
      disposed = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [reduced]);

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

    let raf = 0;
    const draw = () => {
      const current = liveRef.current;
      const trail = trailRef.current;
      ctx.clearRect(0, 0, w, h);

      if (trail.length > 1) {
        ctx.beginPath();
        let started = false;
        trail.forEach((point, index) => {
          const [x, y] = toXY(point.lat, point.lon);
          const prev = trail[index - 1];
          if (!started || (prev && Math.abs(prev.lon - point.lon) > 90)) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.strokeStyle = "rgba(140,174,255,0.72)";
        ctx.lineWidth = 1.6;
        ctx.shadowColor = "rgba(140,174,255,0.8)";
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      const [x, y] = toXY(current.latitude, current.longitude);
      const pulse = reduced ? 0.45 : (Date.now() % 1600) / 1600;
      ctx.globalAlpha = 1 - pulse;
      ctx.beginPath();
      ctx.arc(x, y, 8 + pulse * 24, 0, Math.PI * 2);
      ctx.strokeStyle = "#8caeff";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#cfe0ff";
      ctx.shadowColor = "#8caeff";
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-star">
              Live orbit feed
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-none tracking-tighter text-ink md:text-6xl">
              Where the station is, right now
            </h2>
          </div>
          <p className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink-2">
            {status === "live" && updatedAt
              ? `Updated ${new Date(updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}`
              : status === "loading"
                ? "Connecting"
                : "Feed unavailable"}
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-[3fr_2fr]">
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
                Live ISS position
              </span>
            </div>
          </div>
          <div className="glass px-7 py-6">
            <div className="hairline-y">
              <div className="flex items-center justify-between pb-4">
                <div>
                  <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                    Altitude
                  </p>
                  <p className="font-mono-data mt-1 text-3xl text-ink">
                    {tele.altitude.toFixed(1)} <span className="text-sm text-ink-2">km</span>
                  </p>
                </div>
                <img src={publicAsset("assets/icons/satellite.png")} alt="" className="h-9 w-9 opacity-80" />
              </div>
              <div className="py-4">
                <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                  Speed
                </p>
                <p className="font-mono-data mt-1 text-3xl text-ink">
                  {Math.round(tele.velocity).toLocaleString("en-US")}{" "}
                  <span className="text-sm text-ink-2">km/h</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                    Latitude
                  </p>
                  <p className="font-mono-data mt-1 text-lg text-ink">{tele.latitude.toFixed(4)} deg</p>
                </div>
                <div>
                  <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                    Longitude
                  </p>
                  <p className="font-mono-data mt-1 text-lg text-ink">{tele.longitude.toFixed(4)} deg</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                    Visibility
                  </p>
                  <p className="font-mono-data mt-1 text-lg capitalize text-ink">{tele.visibility}</p>
                </div>
                <div>
                  <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                    Footprint
                  </p>
                  <p className="font-mono-data mt-1 text-lg text-ink">
                    {Math.round(tele.footprint).toLocaleString("en-US")} km
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-5 text-[12px] leading-relaxed text-ink-2">
              Position and telemetry update from a public ISS API in your browser. The line on the map is the trail
              collected during this visit.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
