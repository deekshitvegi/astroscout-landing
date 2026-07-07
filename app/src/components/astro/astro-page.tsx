/*
 * AstroPage: client-side page shell. Boots the Lenis+GSAP scroll runtime,
 * mounts the fixed starfield + cursor glow, and choreographs per-section
 * scroll reveals (transform/scale only - screenshot-safe).
 */
import { useEffect, useState } from "react";
import Starfield from "./starfield";
import CursorGlow from "./cursor-glow";
import Nav from "./nav";
import Hero from "./hero";
import HowItWorks from "./how-it-works";
import Planetarium from "./planetarium";
import IssTracker from "./iss-tracker";
import Launches from "./launches";
import Tonight from "./tonight";
import AskAnything from "./ask-anything";
import FreeBand from "./free-band";
import { startScrollRuntime, gsap, ScrollTrigger } from "./scroll-runtime";

export default function AstroPage() {
  const [reduced, setReduced] = useState(false);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    setBooted(true);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!booted) return;
    const stop = startScrollRuntime(reduced);
    let ctx: gsap.Context | undefined;
    if (!reduced) {
      ctx = gsap.context(() => {
        // Section entrances: slide + settle with spring-ish easing.
        document.querySelectorAll<HTMLElement>("[data-chapter]").forEach((sec) => {
          gsap.fromTo(
            sec,
            { y: 64 },
            {
              y: 0,
              ease: "power3.out",
              duration: 1,
              scrollTrigger: {
                trigger: sec,
                start: "top 86%",
                end: "top 45%",
                scrub: 0.8,
              },
            },
          );
        });
      });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
    return () => {
      ctx?.revert();
      stop();
    };
  }, [booted, reduced]);

  return (
    <div className="astro-page relative min-h-dvh">
      <Starfield reduced={reduced} />
      <CursorGlow reduced={reduced} />
      <Nav reduced={reduced} />
      <main className="relative z-10">
        <Hero reduced={reduced} />
        <div data-chapter>
          <HowItWorks reduced={reduced} />
        </div>
        <div data-chapter>
          <Planetarium reduced={reduced} />
        </div>
        <div data-chapter>
          <IssTracker reduced={reduced} />
        </div>
        <div data-chapter>
          <Launches reduced={reduced} />
        </div>
        <div data-chapter>
          <Tonight reduced={reduced} />
        </div>
        <div data-chapter>
          <AskAnything />
        </div>
        <div data-chapter>
          <FreeBand reduced={reduced} />
        </div>
      </main>
    </div>
  );
}
