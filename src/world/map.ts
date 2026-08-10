/**
 * The village, drawn as a character grid.
 *
 * Ground legend:  . grass   , grass-alt   P path   W water (solid)
 *                 F flowers  T tall grass  X fence (solid)
 * Props (drawn on grass): t tree  H house  A wedding arch  S signpost
 */

export const TILE_SIZE = 16;

// Tile indices inside assets/tiles.png
export const TILE = {
  GRASS: 0,
  GRASS_ALT: 1,
  PATH: 2,
  WATER: 3,
  FLOWERS: 4,
  TUFT: 5,
  FENCE: 6,
  GRASS_DARK: 7,
} as const;

export const SOLID_TILES = [TILE.WATER, TILE.FENCE];

const GRID = [
  'tttttttttttttttttttttttttttttt',
  't..T....F....,.....T....F...,t',
  't.F.....,...........,....T...t',
  't....,......F.A.F.......,....t',
  't..,....F.....P...S..,......Ft',
  't.T.......,...P........F...T.t',
  't...H.........P..,...........t',
  't.,......F....P......,....,..t',
  't........,....P...........T..t',
  't...XXX.......P....,..F......t',
  't.F......,....P..........,..Ft',
  't..PPPPPPPPPPPPPPPPPPPPPP....t',
  't.,....F......P......,....T..t',
  't.....,.......P...F..........t',
  't....F........P...........,..t',
  't.T.......,...P.......WWWW...t',
  't...F.........P......WWWWWW..t',
  't.......,.....P.......WWWWW..t',
  't..,......F...P...........T..t',
  't....T........P....F....,....t',
  't.F......,....P....,......F.,t',
  'tttttttttttttttttttttttttttttt',
];

export interface PropDef {
  type: 'tree' | 'house' | 'arch' | 'signpost';
  tx: number;
  ty: number;
}

export interface ParsedMap {
  width: number;
  height: number;
  data: number[][];
  props: PropDef[];
}

const PROP_CHARS: Record<string, PropDef['type']> = {
  t: 'tree',
  H: 'house',
  A: 'arch',
  S: 'signpost',
};

export function parseMap(): ParsedMap {
  const height = GRID.length;
  const width = GRID[0].length;
  const data: number[][] = [];
  const props: PropDef[] = [];

  for (let y = 0; y < height; y++) {
    const row = GRID[y];
    if (row.length !== width) {
      throw new Error(`Map row ${y} has length ${row.length}, expected ${width}`);
    }
    const out: number[] = [];
    for (let x = 0; x < width; x++) {
      const ch = row[x];
      const prop = PROP_CHARS[ch];
      if (prop) {
        props.push({ type: prop, tx: x, ty: y });
        // subtle checker variation under props and plain grass
        out.push((x * 3 + y * 5) % 7 < 5 ? TILE.GRASS : TILE.GRASS_ALT);
        continue;
      }
      switch (ch) {
        case ',':
          out.push(TILE.GRASS_ALT);
          break;
        case 'P':
          out.push(TILE.PATH);
          break;
        case 'W':
          out.push(TILE.WATER);
          break;
        case 'F':
          out.push(TILE.FLOWERS);
          break;
        case 'T':
          out.push(TILE.TUFT);
          break;
        case 'X':
          out.push(TILE.FENCE);
          break;
        default:
          out.push((x * 3 + y * 5) % 7 < 5 ? TILE.GRASS : TILE.GRASS_ALT);
      }
    }
    data.push(out);
  }
  return { width, height, data, props };
}
