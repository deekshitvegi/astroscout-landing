/*
 * Ask live data: a browser-side assistant that answers from public APIs.
 * It is intentionally transparent: public API calls, visible sources.
 */
import { useEffect, useRef, useState } from "react";
import { publicAsset } from "./assets";
import {
  cToF,
  formatDateTime,
  formatTime,
  getAsteroids,
  getForecastForCity,
  getIssPosition,
  getMoonInfo,
  getUpcomingLaunches,
} from "./live-data";

type Row = { label: string; value: string; note?: string };
type Msg =
  | { role: "user"; text: string }
  | { role: "bot"; text: string; rows?: Row[]; source?: string };

const CHIPS = [
  "Where is the ISS now?",
  "Next rocket launch",
  "Cloud cover tonight",
  "Closest asteroid today",
  "Moon phase",
];

function Shimmer() {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white/[0.05] px-4 py-3" aria-hidden>
      {[100, 82, 64].map((wPct) => (
        <div key={wPct} className="astro-shimmer h-3 rounded-full" style={{ width: `${wPct}%` }} />
      ))}
    </div>
  );
}

async function answerQuestion(question: string): Promise<Extract<Msg, { role: "bot" }>> {
  const lower = question.toLowerCase();

  if (lower.includes("iss") || lower.includes("station") || lower.includes("orbit")) {
    const iss = await getIssPosition();
    return {
      role: "bot",
      text: `The ISS is currently over ${iss.latitude.toFixed(2)} deg latitude, ${iss.longitude.toFixed(2)} deg longitude, moving at ${Math.round(iss.velocity).toLocaleString("en-US")} km/h.`,
      source: "wheretheiss.at",
      rows: [
        { label: "Altitude", value: `${iss.altitude.toFixed(1)} km` },
        { label: "Visibility", value: iss.visibility },
        { label: "Footprint", value: `${Math.round(iss.footprint).toLocaleString("en-US")} km` },
      ],
    };
  }

  if (lower.includes("launch") || lower.includes("rocket")) {
    const launches = await getUpcomingLaunches();
    const next = launches[0];
    if (!next) throw new Error("No launch data returned");
    return {
      role: "bot",
      text: `The next listed launch is ${next.name}. NET ${formatDateTime(next.net)} from ${next.location}.`,
      source: "Launch Library",
      rows: launches.slice(0, 3).map((launch) => ({
        label: launch.vehicle,
        value: formatDateTime(launch.net),
        note: launch.name,
      })),
    };
  }

  if (lower.includes("asteroid") || lower.includes("neo") || lower.includes("near-earth")) {
    const asteroids = await getAsteroids();
    const nearest = asteroids[0];
    if (!nearest) throw new Error("No asteroid data returned");
    return {
      role: "bot",
      text: `The closest known near-Earth approach in today's NASA feed is ${nearest.name} at ${nearest.lunarDistance.toFixed(1)} lunar distances.`,
      source: "NASA NeoWs",
      rows: asteroids.slice(0, 3).map((asteroid) => ({
        label: asteroid.name,
        value: `${asteroid.lunarDistance.toFixed(1)} LD`,
        note: `${asteroid.diameterM} m, ${formatTime(asteroid.closeTime)}`,
      })),
    };
  }

  if (lower.includes("moon") || lower.includes("phase")) {
    const moon = getMoonInfo();
    return {
      role: "bot",
      text: `The moon is ${moon.name.toLowerCase()} and about ${moon.illumination}% illuminated tonight.`,
      source: "Local phase calculation",
      rows: [
        { label: "Illumination", value: `${moon.illumination}%` },
        { label: "Moon age", value: `${moon.ageDays} days` },
      ],
    };
  }

  if (
    lower.includes("cloud") ||
    lower.includes("weather") ||
    lower.includes("tonight") ||
    lower.includes("clear") ||
    lower.includes("visibility")
  ) {
    const cityMatch = question.match(/(?:in|near|for)\s+([a-zA-Z .,-]+)$/);
    const city = cityMatch?.[1]?.trim() || "Chicago";
    const forecast = await getForecastForCity(city);
    const first = forecast.hours[0];
    const best = forecast.bestHour;
    return {
      role: "bot",
      text: best
        ? `For ${forecast.place}, the best upcoming observing window is around ${formatTime(best.time)} with ${best.cloud}% cloud cover.`
        : `I loaded the forecast for ${forecast.place}, but there was not enough hourly data to pick a best window.`,
      source: "Open-Meteo",
      rows: [
        { label: "Clouds now", value: first ? `${first.cloud}%` : "n/a" },
        { label: "Visibility", value: first?.visibilityKm == null ? "n/a" : `${first.visibilityKm} km` },
        { label: "Temperature", value: cToF(first?.tempC ?? null) },
      ],
    };
  }

  return {
    role: "bot",
    text: "I can answer live questions about the ISS, upcoming launches, cloud cover, today's near-Earth asteroids, and the moon phase. Try one of the quick questions below.",
    source: "AstroScout browser tools",
  };
}

export default function AskAnything() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "bot",
      text: "Ask me for live sky data. I fetch public sources in your browser and show the source behind each answer.",
      source: "Ready",
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, thinking]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || thinking) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setThinking(true);
    try {
      const answer = await answerQuestion(q);
      setMsgs((m) => [...m, answer]);
    } catch (err: unknown) {
      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: err instanceof Error
            ? `I could not reach that live data source: ${err.message}. Try again in a moment.`
            : "I could not reach that live data source. Try again in a moment.",
          source: "Network",
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <section id="ask" aria-label="Ask AstroScout live data" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-center">
          <h2 className="font-display text-4xl font-semibold leading-none tracking-tighter text-ink md:text-6xl">
            Ask the live sky feeds
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-2">
            ISS position, launches, weather, moon phase, and near-Earth objects, fetched directly from public APIs.
          </p>
        </div>
        <div className="glass mt-10 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-white/[0.07] px-6 py-4">
            <img src={publicAsset("assets/icons/chat.png")} alt="" className="h-4.5 w-4.5" />
            <span className="font-display text-[14px] font-medium tracking-tight text-ink">
              AstroScout live data
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-star" />
              <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-2">
                public APIs
              </span>
            </span>
          </div>
          <div ref={scrollRef} className="flex max-h-[420px] flex-col gap-4 overflow-y-auto px-6 py-6">
            {msgs.map((m, i) =>
              m.role === "user" ? (
                <p
                  key={i}
                  className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-star/16 px-4 py-2.5 text-[14px] leading-relaxed text-ink"
                >
                  {m.text}
                </p>
              ) : (
                <div key={i} className="max-w-[92%]">
                  <p className="rounded-2xl rounded-bl-md bg-white/[0.05] px-4 py-3 text-[14px] leading-relaxed text-ink-2">
                    {m.text}
                  </p>
                  {m.rows && (
                    <div className="font-mono-data mt-2 overflow-hidden rounded-2xl border border-white/[0.08] text-[12px]">
                      {m.rows.map((row) => (
                        <div
                          key={`${row.label}-${row.value}`}
                          className="grid grid-cols-[0.8fr_0.7fr_1fr] gap-2 border-t border-white/[0.06] px-4 py-2 first:border-t-0"
                        >
                          <span className="text-ink">{row.label}</span>
                          <span className="text-star">{row.value}</span>
                          <span className="text-ink-2">{row.note ?? ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {m.source && (
                    <p className="font-mono-data mt-2 text-[10px] uppercase tracking-[0.18em] text-ink-2/70">
                      Source: {m.source}
                    </p>
                  )}
                </div>
              ),
            )}
            {thinking && <Shimmer />}
          </div>
          <div className="border-t border-white/[0.07] px-4 py-3">
            <div className="flex flex-wrap gap-2 px-2 pb-3">
              {CHIPS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => void ask(label)}
                  className="rounded-full border border-white/[0.1] px-3.5 py-1.5 text-[12px] text-ink-2 transition-colors duration-200 hover:border-star/40 hover:text-ink active:scale-[0.96]"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void ask(input)}
                placeholder="Ask about ISS, launches, cloud cover, asteroids..."
                aria-label="Ask AstroScout"
                className="min-w-0 flex-1 rounded-full bg-white/[0.05] px-5 py-3 text-[14px] text-ink outline-none ring-star/40 transition-shadow placeholder:text-ink-2/60 focus:ring-2"
              />
              <button
                type="button"
                onClick={() => void ask(input)}
                aria-label="Send"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-star text-space transition-transform duration-150 hover:scale-105 active:scale-[0.92]"
              >
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" strokeWidth="2" stroke="currentColor" aria-hidden>
                  <path d="M5 12h13M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
