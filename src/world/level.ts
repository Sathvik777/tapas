/**
 * The side-scrolling level, built from a compact description:
 * a ground-height profile, floating platforms, props, decor, and heart pickups.
 * Rows are 32px tiles; row 13 is the lowest, row 0 the sky.
 */

export const TILE_SIZE = 32;
export const LEVEL_COLS = 180;
/**
 * Ground surfaces live in rows 9-13; the rest is dirt fill. The level is far
 * deeper than it needs to be so that tall viewports (a phone held upright)
 * never scroll past the bottom of the world and reveal empty space.
 */
export const LEVEL_ROWS = 24;

// Tile indices in assets/tiles.png
export const T = {
  EMPTY: -1,
  GROUND_TOP: 0,
  DIRT: 1,
  PLAT_L: 2,
  PLAT_M: 3,
  PLAT_R: 4,
  FLOWERS: 5,
  TUFT: 6,
  FENCE: 7,
} as const;

export const SOLID_TILES = [T.GROUND_TOP, T.DIRT];
export const ONE_WAY_TILES = [T.PLAT_L, T.PLAT_M, T.PLAT_R];

/**
 * Ground surface row per column range (inclusive). Columns not covered fall
 * back to the previous segment. Dips to row 13 act as gentle "gaps" you can
 * always jump back out of — there are no pits of death.
 */
const GROUND_SEGMENTS: Array<[from: number, to: number, row: number]> = [
  [0, 19, 11],
  [20, 33, 10], // little rise with the house
  [34, 35, 11],
  [36, 37, 13], // dip
  [38, 63, 11], // platform playground
  [64, 74, 10],
  [75, 94, 9], // hilltop
  [95, 109, 10],
  [110, 111, 13], // dip
  [112, 139, 11],
  [140, 159, 10],
  [160, 179, 10], // wedding meadow finale
];

/** Floating platforms: [fromCol, toCol, row]. */
const PLATFORMS: Array<[number, number, number]> = [
  [44, 46, 8],
  [52, 54, 7],
  [58, 60, 8],
  [86, 88, 6],
  [116, 118, 8],
  [122, 124, 7],
  [128, 130, 8],
];

/** Heart pickups: [col, row]. Kept clear of the bunting poles and garlands. */
const HEARTS: Array<[number, number]> = [
  [16, 9],
  [36, 12],
  [45, 6],
  [53, 5],
  [59, 6],
  [66, 8],
  [87, 4],
  [92, 7],
  [110, 12],
  [117, 6],
  [123, 5],
  [129, 6],
  [154, 8],
  [165, 8],
];

export type PropType =
  // shared countryside
  | 'tree'
  | 'cart'
  | 'sign'
  | 'rock'
  | 'bush'
  | 'pole'
  // her side
  | 'cottage'
  | 'birch'
  | 'maypole'
  | 'dalahorse'
  | 'meadow'
  // his side
  | 'mandap'
  | 'banana'
  | 'kolam'
  | 'lamp'
  | 'toran'
  | 'garland';

export interface PropDef {
  type: PropType;
  tx: number;
}

/**
 * Both vocabularies share the whole road rather than one handing over to the
 * other: birch grows beside banana, a falu-red cottage wears a mango-leaf
 * toran, and marigold garlands hang over a midsummer pole. NPC columns
 * (12, 30, 68, 100, 135, 155) are kept clear so nobody stands inside a prop.
 *
 * Two placements are not free choices:
 *
 * - **A kolam goes at the threshold of the building it belongs to**, so it
 *   shares that building's column (26 with the cottage, 171 with the mandap).
 *   Off to one side it reads as a stain on the road rather than a welcome.
 * - **A garland is tied at both ends.** The art is 128px of drooping marigolds,
 *   which spans four columns, so each one sits midway between two anchors that
 *   are four columns apart and are the same height — two bunting poles, or a
 *   pole and the cottage roof. Anything else leaves it hanging in mid-air.
 */
const PROPS: PropDef[] = [
  { type: 'meadow', tx: 2 },
  { type: 'bush', tx: 5 },
  { type: 'birch', tx: 7 },
  { type: 'banana', tx: 10 },
  { type: 'sign', tx: 15 },
  { type: 'dalahorse', tx: 18 },
  { type: 'pole', tx: 21 },
  { type: 'garland', tx: 23 }, // pole 21 → cottage roof
  { type: 'cottage', tx: 26 },
  { type: 'toran', tx: 26 },
  { type: 'kolam', tx: 26 }, // at the cottage door
  { type: 'meadow', tx: 33 },
  { type: 'lamp', tx: 36 },
  { type: 'tree', tx: 41 },
  { type: 'banana', tx: 44 },
  { type: 'rock', tx: 50 },
  { type: 'maypole', tx: 55 },
  { type: 'bush', tx: 62 },
  { type: 'pole', tx: 70 },
  { type: 'garland', tx: 72 }, // pole 70 → pole 74
  { type: 'meadow', tx: 72 },
  { type: 'pole', tx: 74 },
  { type: 'birch', tx: 76 },
  { type: 'tree', tx: 80 },
  { type: 'rock', tx: 84 },
  { type: 'banana', tx: 88 },
  { type: 'bush', tx: 93 },
  { type: 'cart', tx: 97 },
  { type: 'lamp', tx: 103 },
  { type: 'tree', tx: 106 },
  { type: 'meadow', tx: 109 },
  { type: 'kolam', tx: 117 },
  { type: 'pole', tx: 120 },
  { type: 'bush', tx: 121 },
  { type: 'garland', tx: 122 }, // pole 120 → pole 124
  { type: 'pole', tx: 124 },
  { type: 'sign', tx: 126 },
  { type: 'rock', tx: 131 },
  { type: 'banana', tx: 138 },
  { type: 'birch', tx: 141 },
  { type: 'tree', tx: 145 },
  { type: 'meadow', tx: 148 },
  { type: 'pole', tx: 148 },
  { type: 'garland', tx: 150 }, // pole 148 → pole 152
  { type: 'pole', tx: 152 },
  { type: 'tree', tx: 158 },
  { type: 'dalahorse', tx: 161 },
  { type: 'maypole', tx: 164 },
  { type: 'banana', tx: 167 },
  { type: 'lamp', tx: 168 },
  { type: 'mandap', tx: 171 },
  { type: 'kolam', tx: 171 },
  { type: 'lamp', tx: 178 },
];

/** Decorative fence runs beside the house and the finale. */
const FENCES: Array<[number, number]> = [
  [21, 23],
  [29, 31],
  [161, 164],
  [176, 178],
];

export const PLAYER_SPAWN_COL = 3;

export interface DecorDef {
  kind: 'tuft' | 'flowers';
  tx: number;
  ty: number;
}

export interface ParsedLevel {
  width: number;
  height: number;
  data: number[][];
  props: PropDef[];
  decor: DecorDef[];
  hearts: Array<{ tx: number; ty: number }>;
  /** y pixel of the walkable surface at a column (top edge of the ground tile). */
  surfaceY(tx: number): number;
  groundRow(tx: number): number;
}

export function parseLevel(): ParsedLevel {
  const groundRows = new Array<number>(LEVEL_COLS).fill(11);
  for (const [from, to, row] of GROUND_SEGMENTS) {
    for (let x = from; x <= Math.min(to, LEVEL_COLS - 1); x++) groundRows[x] = row;
  }

  const data: number[][] = Array.from({ length: LEVEL_ROWS }, () =>
    new Array<number>(LEVEL_COLS).fill(T.EMPTY),
  );

  for (let x = 0; x < LEVEL_COLS; x++) {
    const g = groundRows[x];
    data[g][x] = T.GROUND_TOP;
    for (let y = g + 1; y < LEVEL_ROWS; y++) data[y][x] = T.DIRT;
  }

  for (const [from, to, row] of PLATFORMS) {
    for (let x = from; x <= to; x++) {
      data[row][x] = x === from ? T.PLAT_L : x === to ? T.PLAT_R : T.PLAT_M;
    }
  }

  // decor on the surface: fences where placed, otherwise scattered flowers/tufts
  const decorated = new Set<number>();
  for (const [from, to] of FENCES) {
    for (let x = from; x <= to; x++) {
      data[groundRows[x] - 1][x] = T.FENCE;
      decorated.add(x);
    }
  }
  // Grass and flowers are sprites rather than tiles so they can sway.
  const decor: DecorDef[] = [];
  const propCols = new Set(PROPS.flatMap((p) => [p.tx - 1, p.tx, p.tx + 1]));
  for (let x = 2; x < LEVEL_COLS - 2; x += 1) {
    if (decorated.has(x) || propCols.has(x)) continue;
    const h = (x * 37) % 11; // deterministic scatter
    if (h === 0) decor.push({ kind: 'flowers', tx: x, ty: groundRows[x] - 1 });
    else if (h === 5) decor.push({ kind: 'tuft', tx: x, ty: groundRows[x] - 1 });
  }

  return {
    width: LEVEL_COLS,
    height: LEVEL_ROWS,
    data,
    props: PROPS,
    decor,
    hearts: HEARTS.map(([tx, ty]) => ({ tx, ty })),
    surfaceY: (tx) => groundRows[Math.max(0, Math.min(LEVEL_COLS - 1, tx))] * TILE_SIZE,
    groundRow: (tx) => groundRows[Math.max(0, Math.min(LEVEL_COLS - 1, tx))],
  };
}
