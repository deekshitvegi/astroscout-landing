# AstroScout — design brief

## Design read
Amateur astronomers and space-curious people who want one place that tells them
what is happening in the sky tonight; the register is quiet awe: standing under
a clear night sky with a very good instrument in hand.

## Concept spine
**The observatory deck.** The whole page is one continuous night: the visitor
walks onto a glass observation deck floating in space, and each scroll chapter
swings the instrument toward a different target (the sky, the ISS, a launch
pad, tonight's forecast, an asteroid field). Glass panels are the instrument's
readouts; the aurora orbs are the sky slowly turning behind the deck.

## Delivery tier
**spectacle** (brief literally asks for an award-winning, hyper-interactive
scroll experience: pinned scrollytelling, parallax starfield, custom cursor
glow, canvas interactions).

## Locked palette (user-specified, overrides default bans)
- Ground: `#04060d` deep space (user-named)
- Panel glass: `rgba(255,255,255,0.04-0.08)` with 1px top specular
- Accent (ONE): `#8caeff` ice-blue starlight (user-named)
- Aurora atmospherics: indigo `#1b2f7a`, violet `#3a1d6e`, teal `#0d3b5c`
  (user-named, used ONLY as blurred background orbs, never as UI accents)
- Text: `#e8edf8` primary, `#8b93a7` secondary
Defense: the entire palette was explicitly specified by the user; it is the
brand. The single interactive accent is #8caeff, everything else is atmosphere.

## Locked type
- Display + body: **Inter Tight** (display) + **Inter** (body), tight tracking.
  Justification: the user explicitly asked for Inter / SF-Pro feel (Apple
  Liquid Glass direction), which is the "neutral/Apple" carve-out.
- Mono for data readouts (countdowns, coordinates): **IBM Plex Mono**.

## Tier-1 technique
**A1 — single-shot hero scrub** (wow-catalog A1): a generated ~5s cinematic
space film (slow push through a nebula toward a glass-blue horizon glow)
scrubbed frame-by-frame by the hero pin. Defense: the spine is "the deck swings
the instrument": scrolling literally drives the telescope's slow slew, so the
visitor's hand motion IS the camera move.
Second beat (spectacle contract): **interactive canvas planetarium** in the
feature chapter, a drag-to-pan night sky with real bright-star positions and
constellation lines, plus a time slider. Custom cursor glow (brief-mandated).
Anti-convergence: first build in this chat; all six axes derive from the
brief's material world (glass, starlight, orbital data).

## Combinatorial pick (Phase 1, held across all boards)
- Theme paradigm: Deep Dark with a twist: liquid-glass panels over live sky
- Background character: full-bleed cinematic imagery (starfield + aurora orbs)
- Typography character: Swiss rational sans with hard hierarchy (Inter Tight)
- Hero architecture: cinematic centered minimalist (single focal glass search
  bar; the film is the visual)
- Section system: poster-stacked storytelling (each feature = one glass poster)
- Signature components: oversized metrics strip · product UI panel stack ·
  hover-accordion slices · layered image crop frames
- Narrative spine motif: tool/precision instrument (the observatory deck)
- Second-read moment: one oversized numeral as structure (the live T-minus
  countdown rendered as giant display type in the launch chapter)

## Section plan (one layout family each, no consecutive repeats)
1. **Nav** — sticky glass bar, monogram + 4 links + one CTA.
2. **Hero** (full-viewport, centered statement) — pinned film scrub, headline
   "Your AI copilot for the night sky", glass search bar, looping mock chat
   bubble. Composition anchor: stacked center.
3. **How it works** (sticky pinned scrollytelling) — device mockup pinned
   center-right, three captions swap on the left as you scroll. Anchor:
   off-grid offset.
4. **Sky chapter** (image-as-canvas, full-bleed interactive) — the drag
   planetarium with time slider. Anchor: bottom-left over image.
5. **Orbit chapter** (asymmetric split 60/40) — ISS ground-track map with
   pulsing blip + live-ish telemetry readout. Anchor: top-left lead.
6. **Launch chapter** (oversized metrics strip) — giant mono T-minus counter +
   upcoming launch rows with viewing spots. Anchor: centered statement,
   numeral-as-structure moment lives here.
7. **Tonight + Asteroids** (gapless bento, 2 asymmetric cells) — tonight's
   visibility/moon/cloud chart + animated asteroid bubble chart. Anchor:
   inverted classic.
8. **Ask anything** (split testimonial-wall style chat) — AI chat panel with
   shimmer loaders and canned deep-space answers. Anchor: centered narrow.
9. **Free stack band** (full-width comparison band) — "100% free" data-source
   comparison, count-up numbers. Anchor: top-left lead.
10. **Footer** — data-source credits, GitHub link.
Eyebrow budget: ceil(10/3) = 4 max; using 3 (sky, orbit, launch chapters).

## Asset plan (Higgsfield kit)
- Hero film: 2 hero-still candidates (nebula deck vista) → seedance 5s slow
  push scrub film → ~100 frames in `public/frames/hero/`.
- Section plates: 2 atmospheric plates (aurora gradient depth, deep starfield
  macro) for chapter backgrounds.
- Content imagery: 3 app-UI screens (planetarium screen, ISS tracker screen,
  tonight report screen) for the scrollytelling device mockup; 1 wide
  world-map night plate for the ISS chapter.
- Custom icon set: one sheet of 8 thin-stroke 2px glyphs in #8caeff on solid
  ground (telescope, satellite, rocket, moon phase, asteroid, chat, radar,
  compass) → sliced + background-removed.
- Logo: minimal line monogram (telescope/star hybrid) + head kit.
- OG/cover/favicon: via generate_app_branding.

## CTA inventory (bespoke chrome, each its own component)
- Nav "Launch app" — small glass capsule, specular top edge, magnetic pull.
- Hero "Ask AstroScout" — the glass search bar itself is the CTA: focus ring
  glow, typing placeholder loop, submit arrow that compresses on click.
- Launch chapter "Get launch alerts" — underlined inline link + arrow that
  extends on hover.
- Free band "Star on GitHub" — framed block button, 1px border, fills glass
  on hover.
Mobile: nav collapses to monogram + Launch app; scrollytelling becomes
stacked cards; planetarium pans by touch-drag; cursor glow disabled on touch.

