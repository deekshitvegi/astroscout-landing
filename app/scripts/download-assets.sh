#!/bin/bash
# Downloads the generated media assets for the AstroScout landing page
# from the live deployment into app/public/. Run from the repo root.
set -e
BASE="https://astroscout.higgsfield.app"
PUB="app/public"

mkdir -p "$PUB/assets/icons" "$PUB/frames/hero"

echo "Downloading background plates + branding..."
for f in hero-deck.jpg milkyway-ridge.jpg aurora-plate.jpg worldmap-dots.jpg \
         og-cover.png brand-icon.png hero-film.mp4 \
         app-sky.jpg app-iss.jpg app-tonight.jpg; do
  curl -sf -o "$PUB/assets/$f" "$BASE/assets/$f" && echo "  assets/$f"
done

echo "Downloading icons..."
for f in telescope.png satellite.png rocket.png moon.png \
         asteroid.png compass.png radar.png chat.png; do
  curl -sf -o "$PUB/assets/icons/$f" "$BASE/assets/icons/$f" && echo "  assets/icons/$f"
done

echo "Downloading 61 hero film frames..."
for i in $(seq -f "%04g" 1 61); do
  curl -sf -o "$PUB/frames/hero/f_$i.jpg" "$BASE/frames/hero/f_$i.jpg"
done
echo "  frames/hero: $(ls "$PUB/frames/hero" | wc -l) frames"

echo "Done. Run: bun install && bun run dev"

