/**
 * The walk has a time of day.
 *
 * Progress through the level (0 at the spawn, 1 at the mandap) drives a
 * lerp between a handful of keyframed moods, so guests set off in the cool
 * light of morning and reach the wedding at golden hour. Nothing here is
 * animated on a clock — the sky is a function of how far you've walked, which
 * means the arc always lands with the story rather than with real time.
 *
 * Colours are Phaser tints, i.e. multiplied over the artwork: 0xffffff leaves
 * a layer untouched. Distant bands are pushed further toward the sky colour
 * than near ones, which is what sells atmospheric perspective as the light
 * changes.
 */

export interface Mood {
  /** progress through the level this keyframe sits at */
  at: number;
  sky: number;
  mountains: number;
  hills: number;
  hedge: number;
  foreground: number;
  /** 0..1 cross-fade from the day sky texture to the dusk one */
  duskBlend: number;
  /** camera colour-matrix grade multiplied over the finished frame */
  grade: number;
  /** additive bloom over the horizon */
  glow: number;
  glowAlpha: number;
  /** 0..1 — how lit the string lights and windows should be (used from stage 4) */
  lightsOn: number;
}

const MOODS: Mood[] = [
  {
    // early morning: cool and a little hazy, sun still low behind you
    at: 0,
    sky: 0xe6eef8,
    mountains: 0xd8e4f0,
    hills: 0xe4eef4,
    hedge: 0xeef4f8,
    foreground: 0xe8f0f6,
    duskBlend: 0,
    grade: 0xeef4fb,
    glow: 0xbfd8f0,
    glowAlpha: 0.07,
    lightsOn: 0.15,
  },
  {
    // mid-morning: the haze burns off
    at: 0.22,
    sky: 0xf8fbfe,
    mountains: 0xf2f7fb,
    hills: 0xf8fbfd,
    hedge: 0xfbfdfe,
    foreground: 0xfafcfe,
    duskBlend: 0,
    grade: 0xfafcfe,
    glow: 0xdfeeff,
    glowAlpha: 0.03,
    lightsOn: 0,
  },
  {
    // full midday — everything neutral, the art exactly as drawn
    at: 0.45,
    sky: 0xffffff,
    mountains: 0xffffff,
    hills: 0xffffff,
    hedge: 0xffffff,
    foreground: 0xffffff,
    duskBlend: 0,
    grade: 0xffffff,
    glow: 0xffe9c0,
    glowAlpha: 0.02,
    lightsOn: 0,
  },
  {
    // afternoon: the light starts to warm and the dusk sky begins to bleed in
    at: 0.68,
    sky: 0xfff6e8,
    mountains: 0xffeeda,
    hills: 0xfff4e4,
    hedge: 0xfff8ec,
    foreground: 0xfff6e8,
    duskBlend: 0.12,
    grade: 0xfff6ea,
    glow: 0xffd9a0,
    glowAlpha: 0.12,
    lightsOn: 0.1,
  },
  {
    // golden hour, arriving at the wedding
    at: 0.9,
    sky: 0xffe8cc,
    mountains: 0xffd8bc,
    hills: 0xffd9ae,
    hedge: 0xffe0b8,
    foreground: 0xf7cfa4,
    duskBlend: 0.72,
    grade: 0xffdcb4,
    glow: 0xffb257,
    glowAlpha: 0.3,
    lightsOn: 0.7,
  },
  {
    // the last steps past the mandap, sun on the horizon
    at: 1,
    sky: 0xffdcc0,
    mountains: 0xf0bda8,
    hills: 0xf0c096,
    hedge: 0xf2c8a0,
    foreground: 0xdda878,
    duskBlend: 1,
    grade: 0xffcda0,
    glow: 0xff9a45,
    glowAlpha: 0.4,
    lightsOn: 1,
  },
];

function mixChannel(a: number, b: number, t: number, shift: number): number {
  return Math.round(((a >> shift) & 0xff) + (((b >> shift) & 0xff) - ((a >> shift) & 0xff)) * t);
}

function mixColor(a: number, b: number, t: number): number {
  return (mixChannel(a, b, t, 16) << 16) | (mixChannel(a, b, t, 8) << 8) | mixChannel(a, b, t, 0);
}

/** Mood at a given progress (0..1), interpolated between the keyframes. */
export function moodAt(progress: number): Mood {
  const p = Math.max(0, Math.min(1, progress));
  let i = 0;
  while (i < MOODS.length - 2 && MOODS[i + 1].at < p) i++;
  const a = MOODS[i];
  const b = MOODS[i + 1];
  const span = b.at - a.at;
  // smoothstep so keyframes don't announce themselves as you cross them
  const raw = span <= 0 ? 0 : (p - a.at) / span;
  const t = raw * raw * (3 - 2 * Math.max(0, Math.min(1, raw)));

  return {
    at: p,
    sky: mixColor(a.sky, b.sky, t),
    mountains: mixColor(a.mountains, b.mountains, t),
    hills: mixColor(a.hills, b.hills, t),
    hedge: mixColor(a.hedge, b.hedge, t),
    foreground: mixColor(a.foreground, b.foreground, t),
    duskBlend: a.duskBlend + (b.duskBlend - a.duskBlend) * t,
    grade: mixColor(a.grade, b.grade, t),
    glow: mixColor(a.glow, b.glow, t),
    glowAlpha: a.glowAlpha + (b.glowAlpha - a.glowAlpha) * t,
    lightsOn: a.lightsOn + (b.lightsOn - a.lightsOn) * t,
  };
}

/** Tint for a parallax layer key, so WorldScene doesn't need a switch. */
export function moodTintFor(mood: Mood, key: string): number {
  switch (key) {
    case 'bg-sky':
    case 'bg-sky-dusk':
      return mood.sky;
    case 'bg-mountains':
      return mood.mountains;
    case 'bg-hills':
      return mood.hills;
    case 'bg-hedge':
      return mood.hedge;
    case 'fg-grass':
      return mood.foreground;
    default:
      return 0xffffff;
  }
}
