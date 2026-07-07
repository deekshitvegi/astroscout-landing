/*
 * Ask anything: centered narrow glass chat panel. Canned Q&A with typing,
 * shimmer skeleton while "thinking", and quick-question chips. The board's
 * pass-time table appears in the first answer.
 */
import { useEffect, useRef, useState } from "react";
import { publicAsset } from "./assets";

type Msg =
  | { role: "user"; text: string }
  | { role: "bot"; text: string; table?: { d: string; t: string; dur: string; el: string }[] };

const ANSWERS: Record<string, Msg> = {
  iss: {
    role: "bot",
    text: "Here are the visible ISS passes this week. Look for a bright, fast dot crossing the sky.",
    table: [
      { d: "Mon", t: "22:07", dur: "4 min", el: "48°" },
      { d: "Tue", t: "23:49", dur: "6 min", el: "62°" },
      { d: "Wed", t: "22:58", dur: "5 min", el: "55°" },
    ],
  },
  saturn: {
    role: "bot",
    text: "Saturn rises at 22:10 tonight and stays up until dawn. Best view after midnight, looking southeast. The rings are tilted 18 degrees this season, a great year for them.",
  },
  moon: {
    role: "bot",
    text: "Tonight's moon is a waxing gibbous, 82% lit. It sets at 04:36, so the darkest skies come in the last two hours before dawn.",
  },
};

const CHIPS = [
  { key: "iss", label: "When can I see the ISS?" },
  { key: "saturn", label: "Is Saturn visible tonight?" },
  { key: "moon", label: "What is the moon doing?" },
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

export default function AskAnything({ reduced }: { reduced: boolean }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "user", text: "When can I see the ISS from Lisbon this week?" },
    ANSWERS.iss,
  ]);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, thinking]);

  const ask = (key: string, label: string) => {
    if (thinking) return;
    setMsgs((m) => [...m, { role: "user", text: label }]);
    setThinking(true);
    setTimeout(
      () => {
        setThinking(false);
        setMsgs((m) => [...m, ANSWERS[key] ?? ANSWERS.iss]);
      },
      reduced ? 250 : 1400,
    );
  };

  const submitFree = () => {
    const q = input.trim();
    if (!q || thinking) return;
    setInput("");
    const lower = q.toLowerCase();
    const key = lower.includes("saturn")
      ? "saturn"
      : lower.includes("moon")
        ? "moon"
        : "iss";
    ask(key, q);
  };

  return (
    <section id="ask" aria-label="Ask AstroScout anything" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-center">
          <h2 className="font-display text-4xl font-semibold leading-none tracking-tighter text-ink md:text-6xl">
            Ask anything up there
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-2">
            The agent reads live NASA and orbital data before it answers. This is a small taste
            with canned data.
          </p>
        </div>
        <div className="glass mt-10 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-white/[0.07] px-6 py-4">
            <img src={publicAsset("assets/icons/chat.png")} alt="" className="h-4.5 w-4.5" />
            <span className="font-display text-[14px] font-medium tracking-tight text-ink">
              AstroScout
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-star" />
              <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-2">
                demo data
              </span>
            </span>
          </div>
          <div ref={scrollRef} className="flex max-h-[380px] flex-col gap-4 overflow-y-auto px-6 py-6">
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
                  {m.table && (
                    <div className="font-mono-data mt-2 overflow-hidden rounded-2xl border border-white/[0.08] text-[12px]">
                      <div className="grid grid-cols-4 gap-2 bg-white/[0.06] px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-ink-2">
                        <span>Day</span>
                        <span>Time</span>
                        <span>Length</span>
                        <span>Max elev</span>
                      </div>
                      {m.table.map((r) => (
                        <div
                          key={r.d}
                          className="grid grid-cols-4 gap-2 border-t border-white/[0.06] px-4 py-2 text-ink"
                        >
                          <span>{r.d}</span>
                          <span>{r.t}</span>
                          <span className="text-ink-2">{r.dur}</span>
                          <span className="text-star">{r.el}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}
            {thinking && <Shimmer />}
          </div>
          <div className="border-t border-white/[0.07] px-4 py-3">
            <div className="flex flex-wrap gap-2 px-2 pb-3">
              {CHIPS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => ask(c.key, c.label)}
                  className="rounded-full border border-white/[0.1] px-3.5 py-1.5 text-[12px] text-ink-2 transition-colors duration-200 hover:border-star/40 hover:text-ink active:scale-[0.96]"
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitFree()}
                placeholder="Ask about the ISS, Saturn, the moon..."
                aria-label="Ask AstroScout"
                className="min-w-0 flex-1 rounded-full bg-white/[0.05] px-5 py-3 text-[14px] text-ink outline-none ring-star/40 transition-shadow placeholder:text-ink-2/60 focus:ring-2"
              />
              <button
                type="button"
                onClick={submitFree}
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
