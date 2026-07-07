/*
 * Scroll runtime: Lenis smooth scroll bridged to GSAP ScrollTrigger.
 * autoRaf: false + gsap.ticker drives Lenis so scrub stays butter-smooth.
 * Client-only: mounted from AstroPage inside useEffect.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function startScrollRuntime(reduced: boolean): () => void {
  if (reduced) {
    // No smooth scroll, but ScrollTrigger still works off native scroll.
    ScrollTrigger.refresh();
    return () => {};
  }
  lenis = new Lenis({
    autoRaf: false,
    lerp: 0.11,
    wheelMultiplier: 1,
    touchMultiplier: 1.4,
  });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => {
    lenis?.raf(time * 1000);
  };
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

export { gsap, ScrollTrigger };

