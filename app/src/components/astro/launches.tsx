/*
 * Launch chapter: live upcoming launches from Launch Library.
 * The countdown is tied to the next real NET time instead of a fake page-load timer.
 */
import { useEffect, useMemo, useState } from "react";
import { publicAsset } from "./assets";
import { formatDateTime, getUpcomingLaunches, type LaunchItem } from "./live-data";

function countdownParts(target: string, now: number) {
  const diff = Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000));
  const days = Math.floor(diff / 86400);
  const hh = Math.floor((diff % 86400) / 3600);
  const mm = Math.floor((diff % 3600) / 60);
  const ss = diff % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return days > 0 ? `T-${days}d ${pad(hh)}:${pad(mm)}:${pad(ss)}` : `T-${pad(hh)}:${pad(mm)}:${pad(ss)}`;
}

function LaunchRow({ launch }: { launch: LaunchItem }) {
  return (
    <a
      href={launch.url}
      target="_blank"
      rel="noreferrer"
      className="glass-soft group grid grid-cols-[1.15fr_0.85fr_1.1fr] items-center gap-4 px-5 py-4 text-left transition-transform duration-300 hover:translate-x-1 md:grid-cols-[1.2fr_0.7fr_1.1fr_0.8fr]"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-star" />
        <span className="min-w-0 truncate font-display text-[15px] font-medium tracking-tight text-ink">
          {launch.name}
        </span>
      </span>
      <span className="font-mono-data text-[12px] text-ink-2">{launch.vehicle}</span>
      <span className="text-[12px] text-ink-2">{launch.location}</span>
      <span className="hidden font-mono-data text-[11px] text-star/90 md:block">
        {formatDateTime(launch.net)}
      </span>
    </a>
  );
}

export default function Launches({ reduced }: { reduced: boolean }) {
  const [launches, setLaunches] = useState<LaunchItem[]>([]);
  const [status, setStatus] = useState<"loading" | "live" | "error">("loading");
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const controller = new AbortController();
    getUpcomingLaunches(controller.signal)
      .then((items) => {
        setLaunches(items);
        setStatus("live");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Launch feed unavailable");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), reduced ? 10000 : 1000);
    return () => clearInterval(id);
  }, [reduced]);

  const nextLaunch = launches[0];
  const countdown = useMemo(
    () => (nextLaunch ? countdownParts(nextLaunch.net, now) : status === "loading" ? "Loading" : "Unavailable"),
    [nextLaunch, now, status],
  );

  return (
    <section id="launches" aria-label="Rocket launch tracker" className="relative overflow-hidden py-24 md:py-36">
      <img
        src={publicAsset("assets/aurora-plate.jpg")}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <img src={publicAsset("assets/icons/rocket.png")} alt="" className="h-5 w-5 opacity-90" />
          <p className="font-mono-data text-[11px] uppercase tracking-[0.22em] text-star">
            Live launch tracker
          </p>
        </div>
        <p
          className="font-mono-data mx-auto mt-6 max-w-full whitespace-nowrap text-[clamp(2.6rem,10vw,10rem)] font-light leading-none tracking-tight text-star"
          aria-live="polite"
          suppressHydrationWarning
        >
          {countdown}
        </p>
        <div className="mx-auto mt-5 max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-4xl">
            {nextLaunch?.name ?? "Upcoming launches"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {nextLaunch
              ? `${nextLaunch.vehicle} from ${nextLaunch.pad}, ${nextLaunch.location}. Status: ${nextLaunch.status}.`
              : status === "loading"
                ? "Fetching Launch Library data..."
                : `Launch Library is unavailable right now: ${error}`}
          </p>
        </div>
        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-3">
          <div className="font-mono-data grid grid-cols-[1.15fr_0.85fr_1.1fr] gap-4 px-5 text-left text-[10px] uppercase tracking-[0.2em] text-ink-2 md:grid-cols-[1.2fr_0.7fr_1.1fr_0.8fr]">
            <span>Mission</span>
            <span>Vehicle</span>
            <span>Launch site</span>
            <span className="hidden md:block">NET</span>
          </div>
          {status === "loading"
            ? [0, 1, 2].map((i) => <div key={i} className="astro-shimmer h-16 rounded-[26px]" />)
            : launches.map((launch) => <LaunchRow key={launch.id} launch={launch} />)}
        </div>
        {nextLaunch && (
          <a
            href={nextLaunch.url}
            target="_blank"
            rel="noreferrer"
            className="group mt-12 inline-flex items-center gap-2 text-[15px] font-medium text-ink"
          >
            <span className="relative">
              Open source details
              <span className="absolute -bottom-1 left-0 h-px w-full bg-star/80 transition-transform duration-300 group-hover:scale-x-110" />
            </span>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 stroke-star transition-transform duration-300 group-hover:translate-x-1.5"
              fill="none"
              strokeWidth="1.8"
              aria-hidden
            >
              <path d="M4 12h15m0 0-6-6m6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>
    </section>
  );
}
