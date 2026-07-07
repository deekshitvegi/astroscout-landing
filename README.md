# AstroScout - landing site

Your AI copilot for the night sky. AstroScout is a scroll-driven, liquid-glass landing page with an interactive planetarium, simulated ISS tracking, rocket launch countdowns, tonight's sky report, asteroid watch, and an ask-anything chat demo.

**Live site:** https://deekshitvegi.github.io/astroscout-landing/

![AstroScout](app/public/assets/og-cover.png)

## Highlights

- **Scroll-scrubbed hero** - a 61-frame generated film painted to canvas, with a typing "Ask AstroScout" loop
- **Pinned scrollytelling** - phone mockup stays centered while 3 feature steps swap beside it
- **Interactive planetarium** - drag-to-pan canvas sky built from a J2000 star catalog, constellations, planets, and a time-of-night slider
- **ISS tracker** - animated ground track over a dotted world map with ticking telemetry
- **Launch board** - ticking T-minus countdowns with in-person viewing spots
- **Tonight bento** - moon phase, planet visibility, cloud-cover chart, and floating asteroid bubbles
- Liquid-glass design system with aurora orbs, parallax starfield, magnetic buttons, cursor glow, and reduced-motion support

## Stack

React 19, Vite, Tailwind CSS v4, GSAP + ScrollTrigger, Lenis, GitHub Pages.

## Getting Started

```bash
cd app
npm install
npm run dev
npm run build
```

The generated media assets are committed under `app/public` so GitHub Pages can build the site without needing the original Higgsfield deployment.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, builds the app from `app/`, and publishes `app/dist` to GitHub Pages.

## Project Structure

```text
app/
  src/
    components/astro/   # all landing sections + scroll runtime
      hero.tsx          # scroll-scrubbed film hero
      how-it-works.tsx  # pinned phone scrollytelling
      planetarium.tsx   # drag-to-pan canvas sky
      star-catalog.ts   # J2000 star, constellation, and planet data
      iss-tracker.tsx   # simulated orbit ground track
      launches.tsx      # ticking T-minus board
      tonight.tsx       # sky report + asteroid watch bento
      ask-anything.tsx  # canned AI chat demo
      free-band.tsx     # count-up metrics + credits footer
      starfield.tsx     # parallax starfield + aurora orbs
      scroll-runtime.ts # Lenis + GSAP bridge
    styles.css          # design tokens + glass system
  public/assets/        # generated media assets
  public/frames/hero/   # 61 scrub film frames
```

## Data Sources Credited

[NASA](https://api.nasa.gov), [Celestrak](https://celestrak.org), [Open-Meteo](https://open-meteo.com), and [Launch Library](https://thespacedevs.com).

All visual assets were AI-generated for this project.
