/*
 * Compact bright-star catalog (J2000 RA hours / Dec degrees, visual mag)
 * plus constellation line indices. Enough for a believable, draggable sky.
 */
export type CatStar = { name: string; ra: number; dec: number; mag: number };

export const STARS: CatStar[] = [
  // Orion
  { name: "Betelgeuse", ra: 5.919, dec: 7.407, mag: 0.5 },
  { name: "Rigel", ra: 5.242, dec: -8.202, mag: 0.13 },
  { name: "Bellatrix", ra: 5.418, dec: 6.35, mag: 1.64 },
  { name: "Alnilam", ra: 5.604, dec: -1.202, mag: 1.69 },
  { name: "Alnitak", ra: 5.679, dec: -1.943, mag: 1.77 },
  { name: "Mintaka", ra: 5.533, dec: -0.299, mag: 2.23 },
  { name: "Saiph", ra: 5.796, dec: -9.67, mag: 2.09 },
  // Ursa Major (Big Dipper)
  { name: "Dubhe", ra: 11.062, dec: 61.751, mag: 1.79 },
  { name: "Merak", ra: 11.031, dec: 56.382, mag: 2.37 },
  { name: "Phecda", ra: 11.897, dec: 53.695, mag: 2.44 },
  { name: "Megrez", ra: 12.257, dec: 57.033, mag: 3.31 },
  { name: "Alioth", ra: 12.9, dec: 55.96, mag: 1.77 },
  { name: "Mizar", ra: 13.399, dec: 54.925, mag: 2.27 },
  { name: "Alkaid", ra: 13.792, dec: 49.313, mag: 1.86 },
  // Cassiopeia
  { name: "Caph", ra: 0.153, dec: 59.15, mag: 2.27 },
  { name: "Schedar", ra: 0.675, dec: 56.537, mag: 2.24 },
  { name: "Gamma Cas", ra: 0.945, dec: 60.717, mag: 2.47 },
  { name: "Ruchbah", ra: 1.43, dec: 60.235, mag: 2.68 },
  { name: "Segin", ra: 1.906, dec: 63.67, mag: 3.38 },
  // Cygnus
  { name: "Deneb", ra: 20.69, dec: 45.28, mag: 1.25 },
  { name: "Sadr", ra: 20.371, dec: 40.257, mag: 2.23 },
  { name: "Gienah Cyg", ra: 20.77, dec: 33.97, mag: 2.48 },
  { name: "Delta Cyg", ra: 19.749, dec: 45.131, mag: 2.87 },
  { name: "Albireo", ra: 19.512, dec: 27.96, mag: 3.18 },
  // Lyra
  { name: "Vega", ra: 18.616, dec: 38.784, mag: 0.03 },
  { name: "Sheliak", ra: 18.834, dec: 33.363, mag: 3.52 },
  { name: "Sulafat", ra: 18.982, dec: 32.69, mag: 3.24 },
  // Aquila
  { name: "Altair", ra: 19.846, dec: 8.868, mag: 0.77 },
  { name: "Tarazed", ra: 19.771, dec: 10.613, mag: 2.72 },
  { name: "Alshain", ra: 19.922, dec: 6.407, mag: 3.71 },
  // Scorpius
  { name: "Antares", ra: 16.49, dec: -26.432, mag: 1.09 },
  { name: "Shaula", ra: 17.56, dec: -37.104, mag: 1.63 },
  { name: "Sargas", ra: 17.622, dec: -42.998, mag: 1.87 },
  { name: "Dschubba", ra: 16.005, dec: -22.622, mag: 2.32 },
  { name: "Acrab", ra: 16.091, dec: -19.805, mag: 2.62 },
  // Taurus
  { name: "Aldebaran", ra: 4.599, dec: 16.509, mag: 0.85 },
  { name: "Elnath", ra: 5.438, dec: 28.608, mag: 1.68 },
  // Gemini
  { name: "Pollux", ra: 7.755, dec: 28.026, mag: 1.14 },
  { name: "Castor", ra: 7.577, dec: 31.888, mag: 1.57 },
  { name: "Alhena", ra: 6.629, dec: 16.399, mag: 1.92 },
  // Canis Major
  { name: "Sirius", ra: 6.752, dec: -16.716, mag: -1.46 },
  { name: "Adhara", ra: 6.977, dec: -28.972, mag: 1.5 },
  { name: "Wezen", ra: 7.14, dec: -26.393, mag: 1.84 },
  // Leo
  { name: "Regulus", ra: 10.139, dec: 11.967, mag: 1.35 },
  { name: "Denebola", ra: 11.818, dec: 14.572, mag: 2.14 },
  { name: "Algieba", ra: 10.333, dec: 19.842, mag: 2.28 },
  { name: "Zosma", ra: 11.237, dec: 20.524, mag: 2.56 },
  // Bootes + misc anchors
  { name: "Arcturus", ra: 14.261, dec: 19.182, mag: -0.05 },
  { name: "Spica", ra: 13.42, dec: -11.161, mag: 0.97 },
  { name: "Procyon", ra: 7.655, dec: 5.225, mag: 0.34 },
  { name: "Capella", ra: 5.278, dec: 45.998, mag: 0.08 },
  { name: "Fomalhaut", ra: 22.961, dec: -29.622, mag: 1.16 },
  { name: "Polaris", ra: 2.53, dec: 89.264, mag: 1.98 },
  // Pegasus square
  { name: "Markab", ra: 23.079, dec: 15.205, mag: 2.49 },
  { name: "Scheat", ra: 23.063, dec: 28.083, mag: 2.42 },
  { name: "Algenib", ra: 0.221, dec: 15.184, mag: 2.84 },
  { name: "Alpheratz", ra: 0.14, dec: 29.09, mag: 2.06 },
];

const idx = (name: string) => STARS.findIndex((s) => s.name === name);

type Constellation = { name: string; lines: [number, number][]; label: number };

function lines(pairs: [string, string][]): [number, number][] {
  return pairs.map(([a, b]) => [idx(a), idx(b)]);
}

export const CONSTELLATIONS: Constellation[] = [
  {
    name: "Orion",
    label: idx("Alnilam"),
    lines: lines([
      ["Betelgeuse", "Bellatrix"],
      ["Bellatrix", "Mintaka"],
      ["Mintaka", "Alnilam"],
      ["Alnilam", "Alnitak"],
      ["Alnitak", "Saiph"],
      ["Saiph", "Rigel"],
      ["Rigel", "Mintaka"],
      ["Betelgeuse", "Alnitak"],
    ]),
  },
  {
    name: "Ursa Major",
    label: idx("Megrez"),
    lines: lines([
      ["Dubhe", "Merak"],
      ["Merak", "Phecda"],
      ["Phecda", "Megrez"],
      ["Megrez", "Dubhe"],
      ["Megrez", "Alioth"],
      ["Alioth", "Mizar"],
      ["Mizar", "Alkaid"],
    ]),
  },
  {
    name: "Cassiopeia",
    label: idx("Gamma Cas"),
    lines: lines([
      ["Caph", "Schedar"],
      ["Schedar", "Gamma Cas"],
      ["Gamma Cas", "Ruchbah"],
      ["Ruchbah", "Segin"],
    ]),
  },
  {
    name: "Cygnus",
    label: idx("Sadr"),
    lines: lines([
      ["Deneb", "Sadr"],
      ["Sadr", "Albireo"],
      ["Delta Cyg", "Sadr"],
      ["Sadr", "Gienah Cyg"],
    ]),
  },
  {
    name: "Lyra",
    label: idx("Vega"),
    lines: lines([
      ["Vega", "Sheliak"],
      ["Sheliak", "Sulafat"],
      ["Sulafat", "Vega"],
    ]),
  },
  {
    name: "Aquila",
    label: idx("Altair"),
    lines: lines([
      ["Tarazed", "Altair"],
      ["Altair", "Alshain"],
    ]),
  },
  {
    name: "Scorpius",
    label: idx("Antares"),
    lines: lines([
      ["Acrab", "Dschubba"],
      ["Dschubba", "Antares"],
      ["Antares", "Shaula"],
      ["Shaula", "Sargas"],
    ]),
  },
  {
    name: "Gemini",
    label: idx("Castor"),
    lines: lines([
      ["Castor", "Pollux"],
      ["Pollux", "Alhena"],
    ]),
  },
  {
    name: "Canis Major",
    label: idx("Sirius"),
    lines: lines([
      ["Sirius", "Wezen"],
      ["Wezen", "Adhara"],
    ]),
  },
  {
    name: "Leo",
    label: idx("Regulus"),
    lines: lines([
      ["Regulus", "Algieba"],
      ["Algieba", "Zosma"],
      ["Zosma", "Denebola"],
    ]),
  },
  {
    name: "Pegasus",
    label: idx("Markab"),
    lines: lines([
      ["Markab", "Scheat"],
      ["Scheat", "Alpheratz"],
      ["Alpheratz", "Algenib"],
      ["Algenib", "Markab"],
    ]),
  },
  {
    name: "Taurus",
    label: idx("Aldebaran"),
    lines: lines([["Aldebaran", "Elnath"]]),
  },
];

/* Planets: fake-but-plausible ecliptic positions for tonight's view */
export const PLANETS = [
  { name: "Venus", ra: 7.9, dec: 21.5, color: "#f2edda", size: 3.4 },
  { name: "Mars", ra: 11.4, dec: 6.2, color: "#e8a07a", size: 2.6 },
  { name: "Jupiter", ra: 4.1, dec: 20.8, color: "#e6d9b8", size: 3.8 },
  { name: "Saturn", ra: 23.5, dec: -6.5, color: "#d9cfa8", size: 3.0 },
];

