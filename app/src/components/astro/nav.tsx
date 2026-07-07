/*
 * Sticky glass navbar. Monogram + links + live-tools glass capsule CTA
 * (magnetic pull, specular top edge). Collapses to monogram + CTA on mobile.
 */
import { useMagnetic } from "./interactions";

const LINKS = [
  { href: "#sky", label: "Sky" },
  { href: "#orbit", label: "Orbit" },
  { href: "#launches", label: "Launches" },
  { href: "#tonight", label: "Tonight" },
  { href: "#ask", label: "Ask" },
];

export function Monogram({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <circle cx="16" cy="16" r="14.5" stroke="#8caeff" strokeWidth="1.4" opacity="0.55" />
      <path
        d="M8 22 16 8l8 14"
        stroke="#e8edf8"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="8" r="1.8" fill="#8caeff" />
    </svg>
  );
}

export default function Nav({ reduced }: { reduced: boolean }) {
  const ctaRef = useMagnetic<HTMLAnchorElement>(0.22, reduced);
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4">
      <nav
        aria-label="Primary"
        className="glass flex h-14 w-full max-w-3xl items-center justify-between gap-4 !rounded-full pl-5 pr-2"
      >
        <a href="#top" className="flex items-center gap-2.5" aria-label="AstroScout home">
          <Monogram />
          <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
            AstroScout
          </span>
        </a>
        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative text-[13.5px] text-ink-2 transition-colors duration-200 hover:text-ink"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-star transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>
        <a
          ref={ctaRef}
          href="#sky"
          className="relative overflow-hidden rounded-full border border-white/12 bg-white/[0.07] px-4 py-2 text-[13px] font-medium text-ink shadow-[0_1px_0_0_rgba(255,255,255,0.22)_inset] transition-colors duration-200 hover:bg-white/[0.12] active:scale-[0.95]"
        >
          Use tools
        </a>
      </nav>
    </header>
  );
}
