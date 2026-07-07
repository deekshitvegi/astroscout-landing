/*
 * Shared micro-interaction hooks: magnetic pull + cursor tilt.
 * rAF-driven transforms, no per-frame React state.
 */
import { useEffect, useRef, type RefObject } from "react";

export function useMagnetic<T extends HTMLElement>(
  strength = 0.28,
  reduced = false,
): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      tx = dx * strength;
      ty = dy * strength;
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength, reduced]);
  return ref;
}

export function useTilt<T extends HTMLElement>(max = 4, reduced = false): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    let trx = 0;
    let trY = 0;
    let crx = 0;
    let cry = 0;
    const loop = () => {
      crx += (trx - crx) * 0.14;
      cry += (trY - cry) * 0.14;
      el.style.transform = `perspective(900px) rotateX(${crx}deg) rotateY(${cry}deg)`;
      if (Math.abs(trx - crx) > 0.02 || Math.abs(trY - cry) > 0.02) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      trx = -py * max;
      trY = px * max;
      kick();
    };
    const onLeave = () => {
      trx = 0;
      trY = 0;
      kick();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max, reduced]);
  return ref;
}

