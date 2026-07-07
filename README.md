# AstroScout — landing site

Your AI copilot for the night sky. A scroll-driven, liquid-glass landing page for AstroScout: interactive planetarium, live ISS tracking, rocket launch countdowns, tonight's sky report, asteroid watch, and an ask-anything AI chat.

**Live site:** https://astroscout.higgsfield.app

![AstroScout](https://astroscout.higgsfield.app/assets/og-cover.png)

## Highlights

- **Scroll-scrubbed film hero** — a 61-frame generated film driven by scroll position (canvas painting, no video element), with a typing "Ask AstroScout" loop
- **Pinned scrollytelling** — phone mockup stays centered while 3 feature steps swap beside it
- **Interactive planetarium** — drag-to-pan canvas sky built from a real J2000 star catalog (RA/Dec/magnitude), constellations, planets, and a time-of-night slider
- **ISS tracker** — animated ground track over a dotted world map with ticking telemetry (51.6° inclination, ~93 min period simulation)
- **Launch board** — genuinely ticking T-minus countdowns with in-person viewing spots
- **Tonight bento** — moon phase, planet visibility, cloud-cover chart that draws in on scroll, floating asteroid bubbles
- Liquid-glass design system: 24px backdrop blur panels, specular top edges, aurora gradient orbs that shift per section, parallax starfield, magnetic buttons, cursor glow
- Lenis smooth scroll driven by the GSAP ticker, bridged to ScrollTrigger; `prefers-reduced-motion` respected everywhere with static fallbacks

## Stack

React 19 · TanStack Start (SSR) · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · Cloudflare Workers

## Getting started

```bash
bun install

# fetch the generated media assets (film frames, plates, icons, screens)
# they are not committed to keep the repo light
bash app/scripts/download-assets.sh

cd app && bun run dev      # local dev
cd app && bun run build    # typecheck + production build
```

## Project structure

```
app/
  src/
    components/astro/   # all landing sections + scroll runtime
      hero.tsx            # pinned scroll-scrubbed film hero
      how-it-works.tsx    # pinned phone scrollytelling
      planetarium.tsx     # drag-to-pan canvas sky
      star-catalog.ts     # J2000 star/constellation/planet data
      iss-tracker.tsx     # simulated orbit ground track
      launches.tsx        # ticking T-minus board
      tonight.tsx         # sky report + asteroid watch bento
      ask-anything.tsx    # canned AI chat demo
      free-band.tsx       # count-up metrics + credits footer
      starfield.tsx       # parallax starfield + aurora orbs
      scroll-runtime.ts   # Lenis + GSAP bridge
    routes/             # TanStack Start routes
    styles.css          # design tokens + glass system
  public/assets/        # generated media (via download script)
  public/frames/hero/   # 61 scrub film frames (via download script)
```

## Data sources credited on the site

[NASA](https://api.nasa.gov) · [Celestrak](https://celestrak.org) · [Open-Meteo](https://open-meteo.com) · [Launch Library](https://thespacedevs.com)

All visual assets (hero film, background plates, icons, app screens) were AI-generated for this project.
