/*
 * Tonight + Asteroid watch: live Open-Meteo conditions, current moon phase,
 * and NASA NeoWs near-Earth close approaches.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { publicAsset } from "./assets";
import { useTilt } from "./interactions";
import {
  cToF,
  formatDateTime,
  formatTime,
  getAsteroids,
  getForecastForCity,
  getForecastForCoords,
  getMoonInfo,
  type AsteroidItem,
  type ForecastHour,
  type SkyForecast,
} from "./live-data";

function cloudPath(values: number[], w: number, h: number): { line: string; area: string } {
  const safeValues = values.length ? values : [0];
  const stepX = safeValues.length > 1 ? w / (safeValues.length - 1) : w;
  const pts = safeValues.map((v, i) => [i * stepX, h - (v / 100) * h] as const);
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return { line: d, area: `${d} L ${w},${h} L 0,${h} Z` };
}

function MoonDisc({ illumination }: { illumination: number }) {
  const shade = Math.max(8, Math.min(88, 100 - illumination));
  return (
    <div className="relative h-16 w-16" aria-hidden>
      <div className="absolute inset-0 rounded-full bg-[#d9dee9] shadow-[0_0_24px_rgba(217,222,233,0.25)]" />
      <div
        className="absolute inset-y-0 right-0 rounded-r-full bg-[#0a0e1a]"
        style={{ width: `${shade}%` }}
      />
      <div className="absolute inset-0 rounded-full ring-1 ring-white/10" />
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="glass-soft flex items-center gap-2.5 !rounded-full px-4 py-2">
      <span className="text-[13.5px] text-ink">{label}</span>
      <span className="font-mono-data text-[11px] text-star">{value}</span>
    </span>
  );
}

export default function Tonight({ reduced }: { reduced: boolean }) {
  const chartWrap = useRef<HTMLDivElement>(null);
  const leftTilt = useTilt<HTMLDivElement>(2.4, reduced);
  const rightTilt = useTilt<HTMLDivElement>(2.4, reduced);
  const [drawn, setDrawn] = useState(reduced);
  const [cityInput, setCityInput] = useState("Chicago");
  const [forecast, setForecast] = useState<SkyForecast | null>(null);
  const [asteroids, setAsteroids] = useState<AsteroidItem[]>([]);
  const [forecastStatus, setForecastStatus] = useState<"loading" | "live" | "error">("loading");
  const [asteroidStatus, setAsteroidStatus] = useState<"loading" | "live" | "error">("loading");
  const [forecastError, setForecastError] = useState("");
  const moon = useMemo(() => getMoonInfo(), []);

  const loadCity = (city: string) => {
    const controller = new AbortController();
    setForecastStatus("loading");
    setForecastError("");
    getForecastForCity(city, controller.signal)
      .then((data) => {
        setForecast(data);
        setForecastStatus("live");
      })
      .catch((err: unknown) => {
        setForecastStatus("error");
        setForecastError(err instanceof Error ? err.message : "Forecast unavailable");
      });
    return () => controller.abort();
  };

  useEffect(() => loadCity("Chicago"), []);

  useEffect(() => {
    const controller = new AbortController();
    getAsteroids(controller.signal)
      .then((items) => {
        setAsteroids(items);
        setAsteroidStatus("live");
      })
      .catch(() => setAsteroidStatus("error"));
    return () => controller.abort();
  }, []);

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

  const useBrowserLocation = () => {
    if (!navigator.geolocation) {
      setForecastStatus("error");
      setForecastError("Browser location is not available");
      return;
    }
    setForecastStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getForecastForCoords(pos.coords.latitude, pos.coords.longitude, "your location")
          .then((data) => {
            setForecast(data);
            setForecastStatus("live");
            setCityInput("Your location");
          })
          .catch((err: unknown) => {
            setForecastStatus("error");
            setForecastError(err instanceof Error ? err.message : "Forecast unavailable");
          });
      },
      () => {
        setForecastStatus("error");
        setForecastError("Location permission was not granted");
      },
      { enableHighAccuracy: false, timeout: 9000 },
    );
  };

  const submitCity = (event: React.FormEvent) => {
    event.preventDefault();
    if (!cityInput.trim() || cityInput === "Your location") return;
    loadCity(cityInput.trim());
  };

  const hours: ForecastHour[] = forecast?.hours ?? [];
  const W = 560;
  const H = 150;
  const { line, area } = cloudPath(hours.map((hour) => hour.cloud), W, H);
  const firstHour = hours[0];
  const bestHour = forecast?.bestHour ?? null;
  const avgCloud = hours.length
    ? Math.round(hours.reduce((sum, hour) => sum + hour.cloud, 0) / hours.length)
    : null;

  return (
    <section id="tonight" aria-label="Tonight's sky report" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          <div ref={leftTilt} className="glass px-7 py-6 will-change-transform">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-star">
                  Live Open-Meteo forecast
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
                  Tonight near {forecast?.place ?? "Chicago"}
                </h3>
                <p className="mt-1 text-sm text-ink-2">
                  {forecastStatus === "loading"
                    ? "Loading cloud cover and visibility..."
                    : forecastStatus === "error"
                      ? forecastError
                      : bestHour
                        ? `Best window: ${formatTime(bestHour.time)} with ${bestHour.cloud}% cloud cover.`
                        : "Forecast loaded."}
                </p>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                    {moon.name}
                  </p>
                  <p className="font-mono-data text-2xl text-ink">{moon.illumination}%</p>
                </div>
                <MoonDisc illumination={moon.illumination} />
              </div>
            </div>

            <form onSubmit={submitCity} className="mt-6 flex flex-col gap-2 sm:flex-row">
              <input
                value={cityInput}
                onChange={(event) => setCityInput(event.target.value)}
                aria-label="Forecast city"
                className="min-w-0 flex-1 rounded-full bg-white/[0.05] px-5 py-3 text-[14px] text-ink outline-none ring-star/40 transition-shadow placeholder:text-ink-2/60 focus:ring-2"
              />
              <button
                type="submit"
                className="rounded-full bg-star px-5 py-3 text-[13px] font-medium text-space transition-transform active:scale-[0.96]"
              >
                Update city
              </button>
              <button
                type="button"
                onClick={useBrowserLocation}
                className="rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-[13px] font-medium text-ink transition-colors hover:bg-white/[0.1]"
              >
                Use location
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <StatChip label="Clouds" value={avgCloud == null ? "n/a" : `${avgCloud}%`} />
              <StatChip label="Visibility" value={firstHour?.visibilityKm == null ? "n/a" : `${firstHour.visibilityKm} km`} />
              <StatChip label="Temp" value={cToF(firstHour?.tempC ?? null)} />
              <StatChip label="Rain" value={firstHour?.rain == null ? "n/a" : `${firstHour.rain}%`} />
            </div>

            <div ref={chartWrap} className="mt-7">
              <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-2">
                Cloud cover, next 12 hours
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
                {hours.filter((_, index) => index % 2 === 0).slice(0, 6).map((hour) => (
                  <span key={hour.time}>{formatTime(hour.time)}</span>
                ))}
              </div>
            </div>
          </div>

          <div ref={rightTilt} className="glass relative overflow-hidden px-7 py-6 will-change-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-star">
                  Live NASA NeoWs
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
                  Asteroid watch
                </h3>
              </div>
              <img src={publicAsset("assets/icons/asteroid.png")} alt="" className="h-6 w-6 opacity-80" />
            </div>
            <p className="mt-1 text-sm text-ink-2">
              {asteroidStatus === "loading"
                ? "Loading near-Earth close approaches..."
                : asteroidStatus === "error"
                  ? "NASA feed is rate-limited or unavailable right now."
                  : "Closest known near-Earth approaches today."}
            </p>
            <div className="relative mt-4 aspect-[4/3]">
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
              {asteroidStatus === "loading" && (
                <div className="absolute inset-x-6 top-1/2 h-3 -translate-y-1/2 rounded-full astro-shimmer" />
              )}
              {asteroids.map((asteroid, i) => (
                <div
                  key={asteroid.id}
                  className="group absolute"
                  style={{
                    left: `${asteroid.x}%`,
                    top: `${asteroid.y}%`,
                    transform: "translate(-50%, -50%)",
                    animation: reduced ? undefined : `astro-float ${5 + i * 0.9}s ease-in-out ${i * 0.6}s infinite alternate`,
                  }}
                >
                  <div
                    className="rounded-full border border-star/40 bg-star/15 transition-colors duration-300 group-hover:bg-star/30"
                    style={{ width: Math.min(58, 16 + asteroid.diameterM / 8), height: Math.min(58, 16 + asteroid.diameterM / 8) }}
                  />
                  <div className="font-mono-data pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2 whitespace-nowrap text-[10px] leading-tight text-ink-2">
                    <span className="text-ink">{asteroid.name}</span>
                    <br />
                    {asteroid.diameterM} m | {asteroid.lunarDistance.toFixed(1)} LD
                    <br />
                    {formatDateTime(asteroid.closeTime)}
                  </div>
                </div>
              ))}
            </div>
            <p className="font-mono-data mt-2 text-[10px] uppercase tracking-[0.18em] text-ink-2/70">
              Bubble size = estimated diameter | LD = lunar distances
            </p>
          </div>
        </div>
        <h2 className="mt-14 font-display text-4xl font-semibold leading-none tracking-tighter text-ink md:text-6xl">
          Check the sky, then decide<span className="text-star">.</span>
        </h2>
      </div>
    </section>
  );
}
