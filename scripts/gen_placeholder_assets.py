#!/usr/bin/env python3
"""Generate the game's pixel-art placeholder assets (side-view platformer, 32px unit).

Art direction: cozy countryside side-scroller — layered parallax with
atmospheric perspective (far hazy mountains -> green hills -> hedgerow),
a foreground fence/grass bank that passes in front of the player, and
chunky dark outlines on characters and props.

Run:  python3 scripts/gen_placeholder_assets.py
Deps: pillow
"""

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent.parent / "public" / "assets"
TILE = 32
random.seed(7)

OUTLINE = (58, 43, 42, 255)

# terrain palette
GRASS = "#7fc860"
GRASS_LIGHT = "#9bd97a"
GRASS_DARK = "#5c9c46"
GRASS_EDGE = "#3f6b33"
DIRT = "#c79461"
DIRT_DARK = "#a9754b"
DIRT_LIGHT = "#d9a878"
STONE = "#9a9186"
WOOD = "#a9784e"
WOOD_DARK = "#7d5333"
WOOD_EDGE = "#4a3323"


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def outline_sprite(img: Image.Image, color=OUTLINE) -> None:
    """Draw a 1px outline in transparent pixels adjacent to opaque ones."""
    px = img.load()
    w, h = img.size
    to_set = []
    for y in range(h):
        for x in range(w):
            if px[x, y][3] == 0:
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] > 0 and px[nx, ny][:3] != color[:3]:
                        to_set.append((x, y))
                        break
    for x, y in to_set:
        px[x, y] = color


def speckle(d: ImageDraw.ImageDraw, x0, y0, x1, y1, color, n, size=1):
    for _ in range(n):
        x = random.randint(x0, x1)
        y = random.randint(y0, y1)
        d.rectangle([x, y, x + size - 1, y + size - 1], fill=color)


# ---------------------------------------------------------------- parallax helpers
def ridge_ys(w: int, base: float, waves):
    """Seamlessly tileable ridge line. Every wave period must divide w."""
    ys = []
    for x in range(w):
        y = base
        for amp, period, phase in waves:
            y += amp * math.sin(2 * math.pi * x / period + phase)
        ys.append(y)
    return ys


def fill_below(d, ys, h, color):
    for x, y in enumerate(ys):
        d.line([x, int(y), x, h], fill=color)


def top_band(d, ys, color, thickness):
    for x, y in enumerate(ys):
        d.line([x, int(y), x, int(y) + thickness], fill=color)


# ---------------------------------------------------------------- terrain tiles
def grass_cap(d: ImageDraw.ImageDraw, ox: int, w: int = TILE, depth: int = 12) -> None:
    d.rectangle([ox, 0, ox + w - 1, depth - 1], fill=GRASS)
    d.rectangle([ox, 2, ox + w - 1, 4], fill=GRASS_LIGHT)
    d.rectangle([ox, 0, ox + w - 1, 1], fill=GRASS_EDGE)  # cartoon outline on top
    speckle(d, ox, 6, ox + w - 1, depth - 2, GRASS_DARK, w // 5)
    for bx in range(ox + 3, ox + w - 1, 6):
        d.point((bx, depth - 1), fill=GRASS_DARK)


def dirt_body(d, ox, y0, y1):
    d.rectangle([ox, y0, ox + TILE - 1, y1], fill=DIRT)
    # soft mottling reads as packed earth (regular streaks look like brickwork)
    for _ in range(7):
        x = ox + random.randint(0, TILE - 8)
        y = random.randint(y0 + 1, max(y0 + 1, y1 - 5))
        w_ = random.randint(4, 10)
        d.ellipse([x, y, x + w_, y + random.randint(2, 4)], fill=DIRT_LIGHT)
    for _ in range(6):
        x = ox + random.randint(0, TILE - 6)
        y = random.randint(y0 + 1, max(y0 + 1, y1 - 4))
        d.ellipse([x, y, x + random.randint(3, 7), y + random.randint(2, 3)], fill=DIRT_DARK)
    # shadow just under the grass so the road edge has depth
    d.rectangle([ox, y0, ox + TILE - 1, y0 + 2], fill="#a97a50")


def make_tiles() -> None:
    """0 ground-top, 1 dirt, 2/3/4 platform L/M/R, 5 flowers, 6 tuft, 7 fence."""
    img = Image.new("RGBA", (TILE * 8, TILE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # 0: ground top
    dirt_body(d, 0, 10, TILE - 1)
    d.ellipse([6, 22, 12, 26], fill=STONE)
    grass_cap(d, 0)

    # 1: dirt fill
    ox = TILE
    dirt_body(d, ox, 0, TILE - 1)
    d.ellipse([ox + 20, 8, ox + 27, 13], fill=STONE)
    d.ellipse([ox + 5, 21, ox + 10, 25], fill="#8b8378")

    # 2/3/4: floating platform
    for i, part in ((2, "l"), (3, "m"), (4, "r")):
        ox = TILE * i
        bot = 15
        x0 = ox + (3 if part == "l" else 0)
        x1 = ox + TILE - 1 - (3 if part == "r" else 0)
        d.rectangle([x0, 9, x1, bot], fill=DIRT)
        d.line([x0, bot, x1, bot], fill=WOOD_EDGE)
        d.rectangle([x0, 0, x1, 8], fill=GRASS)
        d.rectangle([x0, 2, x1, 4], fill=GRASS_LIGHT)
        d.rectangle([x0, 0, x1, 1], fill=GRASS_EDGE)
        speckle(d, x0, 5, x1, 8, GRASS_DARK, 4)
        if part == "l":
            d.line([x0, 0, x0, bot], fill=GRASS_EDGE)
        if part == "r":
            d.line([x1, 0, x1, bot], fill=GRASS_EDGE)

    # 5: flowers
    ox = TILE * 5
    for fx, fy, c in ((7, 20, "#f28bb4"), (17, 16, "#f5d76b"), (25, 22, "#f7f3ea"), (12, 25, "#e0576f")):
        d.line([ox + fx, fy + 4, ox + fx, fy + 11], fill="#4f8f3d")
        d.line([ox + fx, fy + 7, ox + fx + 2, fy + 6], fill="#4f8f3d")
        d.ellipse([ox + fx - 3, fy - 1, ox + fx + 3, fy + 5], fill=c)
        d.ellipse([ox + fx - 1, fy + 1, ox + fx + 1, fy + 3], fill="#fff7e0")

    # 6: tall grass tuft
    ox = TILE * 6
    for tx in (5, 10, 15, 20, 25):
        h = random.randint(9, 16)
        d.line([ox + tx, 31, ox + tx, 31 - h], fill=GRASS_DARK)
        d.line([ox + tx, 31, ox + tx - 2, 31 - h + 4], fill="#5a9c44")
        d.line([ox + tx, 31, ox + tx + 2, 31 - h + 3], fill=GRASS)

    # 7: fence
    ox = TILE * 7
    for px_ in (4, 24):
        d.rectangle([ox + px_, 6, ox + px_ + 3, 31], fill=WOOD)
        d.rectangle([ox + px_, 6, ox + px_ + 1, 31], fill=WOOD_DARK)
        d.rectangle([ox + px_ - 1, 5, ox + px_ + 4, 6], fill=WOOD_EDGE)
    d.rectangle([ox, 12, ox + TILE - 1, 15], fill=WOOD)
    d.rectangle([ox, 15, ox + TILE - 1, 16], fill=WOOD_DARK)
    d.rectangle([ox, 23, ox + TILE - 1, 26], fill=WOOD)
    d.rectangle([ox, 26, ox + TILE - 1, 27], fill=WOOD_DARK)

    img.save(OUT / "tiles.png")


# ---------------------------------------------------------------- sky
SKY_DAY = dict(
    name="bg-sky.png",
    stops=[(92, 168, 217), (170, 216, 238), (226, 241, 240)],
    sun=[(40, (186, 214, 235)), (32, (243, 240, 220)), (26, (255, 246, 205))],
    sun_at=(1150, 66),
    cloud_lit=(252, 253, 255),
    cloud_shade=(214, 230, 243),
    bird=(96, 118, 134),
)

# Golden hour cross-fades in over the last third of the walk. Multiply-tinting
# the day sky can only darken it (blue x orange = brown), so dusk is its own
# texture with the clouds in the same places for a clean blend.
SKY_DUSK = dict(
    name="bg-sky-dusk.png",
    stops=[(86, 78, 140), (214, 118, 126), (255, 198, 122)],
    sun=[(96, (247, 168, 104)), (66, (255, 206, 132)), (44, (255, 243, 205))],
    sun_at=(1150, 150),
    cloud_lit=(255, 214, 170),
    cloud_shade=(188, 122, 138),
    bird=(92, 62, 84),
)


def make_sky(pal) -> None:
    w, h = 1536, 800
    img = Image.new("RGBA", (w, h))
    d = ImageDraw.Draw(img)
    top, mid, low = pal["stops"]
    horizon = 440
    for y in range(h):
        if y < horizon * 0.5:
            c = lerp(top, mid, y / (horizon * 0.5))
        elif y < horizon:
            c = lerp(mid, low, (y - horizon * 0.5) / (horizon * 0.5))
        else:
            c = low
        d.line([0, y, w, y], fill=c)

    sx, sy = pal["sun_at"]
    for r, c in pal["sun"]:
        d.ellipse([sx - r, sy - r, sx + r, sy + r], fill=c)

    def cloud(cx, cy, s):
        for base in (cx - w, cx, cx + w):  # wrap for seamless tiling
            puffs = [(0, 4, 34, 20), (20, -6, 30, 24), (42, 2, 26, 18), (14, 8, 44, 16)]
            for ex, ey, ew, eh in puffs:
                d.ellipse(
                    [base + ex * s, cy + (ey + 5) * s, base + (ex + ew) * s, cy + (ey + eh) * s + 5],
                    fill=pal["cloud_shade"],
                )
            for ex, ey, ew, eh in puffs:
                d.ellipse(
                    [base + ex * s, cy + ey * s, base + (ex + ew) * s, cy + (ey + eh) * s],
                    fill=pal["cloud_lit"],
                )

    for cx, cy, s_ in (
        (60, 96, 1.0), (300, 168, 0.75), (470, 60, 1.15), (200, 250, 0.6),
        (700, 120, 0.9), (940, 66, 1.05), (1120, 190, 0.7), (1330, 104, 0.85),
    ):
        cloud(cx, cy, s_)

    def bird(bx, by, s=1.0):
        for base in (bx - w, bx, bx + w):
            d.arc([base, by, base + int(9 * s), by + int(6 * s)], 200, 340, fill=pal["bird"])
            d.arc([base + int(8 * s), by, base + int(17 * s), by + int(6 * s)], 200, 340, fill=pal["bird"])

    for bx, by, bs in ((160, 150, 1.0), (420, 120, 0.8), (452, 138, 0.7),
                       (880, 168, 0.9), (1210, 132, 0.8), (1246, 148, 0.65)):
        bird(bx, by, bs)
    img.save(OUT / pal["name"])


# ---------------------------------------------------------------- distance layers
def make_mountains() -> None:
    w, h = 1024, 260
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ys = ridge_ys(w, 72, [(30, 1024, 0.3), (18, 512, 1.7), (9, 256, 2.6), (5, 128, 0.9)])
    fill_below(d, ys, h, "#adc8d2")
    top_band(d, ys, "#c2dae0", 6)
    ys2 = ridge_ys(w, 116, [(24, 512, 1.2), (13, 256, 0.4), (7, 128, 2.0)])
    fill_below(d, ys2, h, "#92b4c2")
    top_band(d, ys2, "#a8c8d3", 5)
    img.save(OUT / "bg-mountains.png")


def make_hills() -> None:
    w, h = 1024, 300
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ys = ridge_ys(w, 62, [(26, 1024, 2.1), (15, 512, 0.8), (8, 256, 1.5), (4, 128, 2.7)])
    fill_below(d, ys, h, "#8cc47b")
    top_band(d, ys, "#a4d492", 7)
    ys2 = ridge_ys(w, 108, [(20, 512, 0.2), (11, 256, 1.9), (6, 128, 0.7)])
    fill_below(d, ys2, h, "#74ad63")
    top_band(d, ys2, "#8bc077", 6)
    # tree clumps along the near ridge
    for x in range(6, w, 23):
        y = int(ys2[x % w])
        r = random.randint(6, 10)
        d.ellipse([x - r, y - r - 2, x + r, y + r - 4], fill="#4f8a42")
        d.ellipse([x - r + 2, y - r, x + r - 4, y + r - 8], fill="#5e9b4c")
    # field patches
    for x in range(30, w, 96):
        y = int(ys[x % w]) + 26
        d.ellipse([x, y, x + 54, y + 16], fill="#99cc85")
    img.save(OUT / "bg-hills.png")


def make_hedge() -> None:
    """Nearest background band: clumpy hedgerow with solid fill below."""
    w, h = 1024, 340
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    base = 58
    d.rectangle([0, base, w, h], fill="#4f8a42")
    # occasional taller trees break up the hedge line
    for x in range(24, w, 128):
        cy = base - 34
        d.rectangle([x - 3, cy, x + 3, base + 20], fill="#3c6b32")
        for ex, ey, r in ((0, -8, 20), (-13, 2, 14), (13, 2, 14), (0, -20, 15)):
            d.ellipse([x + ex - r, cy + ey - r, x + ex + r, cy + ey + r], fill="#478039")
        d.ellipse([x - 14, cy - 26, x - 2, cy - 14], fill="#57924a")
    for x in range(-10, w + 30, 21):
        r = random.randint(12, 20)
        cy = base + random.randint(-4, 4)
        d.ellipse([x - r, cy - r, x + r, cy + r], fill="#4f8a42")
        d.ellipse([x - r + 3, cy - r + 2, x + r - 5, cy + r - 8], fill="#5f9c4f")
        d.ellipse([x - r + 6, cy - r + 4, x - r + 13, cy - r + 10], fill="#6faa5b")
    # darker skirt so it reads as the closest band
    d.rectangle([0, base + 40, w, h], fill="#437637")
    for x in range(0, w, 17):
        d.ellipse([x, base + 34, x + 16, base + 48], fill="#437637")
    img.save(OUT / "bg-hedge.png")


def make_foreground() -> None:
    """Fence + grass bank drawn IN FRONT of the player (the Milki-style depth cue)."""
    w, h = 512, 240
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # low fence first, grass bank drawn over its feet
    for i, px_ in enumerate(range(10, w, 64)):
        top = 8 + (i % 3)
        d.rectangle([px_ - 1, top - 2, px_ + 8, 76], fill=WOOD_EDGE)
        d.rectangle([px_, top, px_ + 7, 74], fill=WOOD)
        d.rectangle([px_, top, px_ + 2, 74], fill="#c08d5f")
        d.rectangle([px_ + 5, top, px_ + 7, 74], fill=WOOD_DARK)
    for ry in (20, 44):
        d.rectangle([0, ry - 2, w, ry + 7], fill=WOOD_EDGE)
        d.rectangle([0, ry, w, ry + 5], fill=WOOD)
        d.rectangle([0, ry, w, ry + 1], fill="#c08d5f")
        d.rectangle([0, ry + 4, w, ry + 5], fill=WOOD_DARK)

    # grass bank in front of the fence feet
    ys = ridge_ys(w, 62, [(5, 256, 0.6), (3, 128, 2.2), (2, 64, 1.1)])
    fill_below(d, ys, h, "#3f7035")
    top_band(d, ys, "#548f44", 9)
    for x, y in enumerate(ys):
        if x % 2 == 0:
            d.point((x, int(y)), fill="#2c5226")
    # tufts poking above the bank
    for x in range(3, w, 9):
        y = int(ys[x]) - 1
        hgt = random.randint(6, 15)
        d.line([x, y, x - 2, y - hgt], fill="#3f7035")
        d.line([x, y, x + 1, y - hgt - 2], fill="#4a8039")
        d.line([x, y, x + 3, y - hgt + 3], fill="#356028")
    # a few flowers
    for x in range(24, w, 84):
        y = int(ys[x]) - 12
        c = random.choice(["#f28bb4", "#f5d76b", "#f7f3ea"])
        d.line([x, y + 12, x, y + 2], fill="#356028")
        d.ellipse([x - 3, y - 2, x + 3, y + 4], fill=c)

    img.save(OUT / "fg-fence.png")


# ---------------------------------------------------------------- props
def make_tree() -> None:
    img = Image.new("RGBA", (64, 96), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([27, 56, 36, 94], fill=WOOD_DARK)
    d.rectangle([27, 56, 30, 94], fill=WOOD)
    d.polygon([(27, 70), (18, 80), (20, 82), (28, 74)], fill=WOOD_DARK)
    for cx, cy, r, c in (
        (32, 30, 26, "#4f9e4f"),
        (17, 38, 15, "#579f4b"),
        (47, 38, 15, "#579f4b"),
        (32, 22, 18, "#66b45e"),
        (24, 18, 11, "#7fc86e"),
        (42, 26, 10, "#7fc86e"),
    ):
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)
    speckle(d, 12, 10, 52, 46, "#93d681", 18)
    speckle(d, 14, 30, 50, 52, "#468c3e", 12)
    outline_sprite(img)
    img.save(OUT / "tree.png")


def make_house() -> None:
    img = Image.new("RGBA", (128, 112), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([12, 48, 115, 110], fill="#f4e6cc")
    d.rectangle([12, 48, 115, 54], fill="#e8d6b6")
    for x in (12, 62, 112):
        d.rectangle([x, 48, x + 3, 110], fill="#c4a276")
    d.rectangle([12, 107, 115, 110], fill="#c4a276")
    d.polygon([(2, 52), (64, 6), (125, 52)], fill="#c96f5a")
    d.polygon([(10, 48), (64, 10), (117, 48)], fill="#d97f66")
    for ry in range(16, 48, 8):
        d.line([64 - int((ry - 8) * 1.35), ry, 64 + int((ry - 8) * 1.35), ry], fill="#b8604c")
    d.rectangle([0, 50, 127, 54], fill="#a85a48")
    d.rectangle([54, 74, 73, 110], fill=WOOD_DARK)
    d.ellipse([54, 66, 73, 84], fill=WOOD_DARK)
    d.rectangle([57, 78, 70, 110], fill=WOOD)
    d.ellipse([57, 70, 70, 86], fill=WOOD)
    d.point((68, 92), fill="#f5d76b")
    for wx in (22, 88):
        d.rectangle([wx, 62, wx + 17, 77], fill="#aadcf0")
        d.rectangle([wx, 62, wx + 17, 66], fill="#cdeef8")
        d.rectangle([wx - 1, 61, wx + 18, 62], fill=WOOD_DARK)
        d.rectangle([wx - 1, 77, wx + 18, 78], fill=WOOD_DARK)
        d.line([wx + 8, 62, wx + 8, 77], fill=WOOD_DARK)
        d.line([wx, 70, wx + 17, 70], fill=WOOD_DARK)
        d.rectangle([wx - 2, 79, wx + 19, 84], fill=WOOD)
        for fx in range(wx + 1, wx + 17, 4):
            d.rectangle([fx, 77, fx + 1, 78], fill=random.choice(["#f28bb4", "#e0576f", "#f5d76b"]))
    cx, cy = 63, 60
    d.polygon([(cx - 4, cy - 2), (cx, cy + 3), (cx + 4, cy - 2)], fill="#e0576f")
    d.ellipse([cx - 5, cy - 5, cx - 0, cy - 0], fill="#e0576f")
    d.ellipse([cx - 0, cy - 5, cx + 5, cy - 0], fill="#e0576f")
    outline_sprite(img)
    img.save(OUT / "house.png")


def make_arch() -> None:
    img = Image.new("RGBA", (80, 88), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.arc([8, 4, 71, 68], 180, 360, fill="#f7f3ea", width=9)
    d.rectangle([8, 36, 16, 86], fill="#f7f3ea")
    d.rectangle([63, 36, 71, 86], fill="#f7f3ea")
    d.arc([8, 4, 71, 68], 180, 360, fill="#e8ddc8", width=2)
    d.line([9, 36, 9, 86], fill="#e8ddc8")
    d.line([64, 36, 64, 86], fill="#e8ddc8")
    for ang in range(190, 351, 14):
        a = math.radians(ang)
        x = 40 + 31 * math.cos(a)
        y = 36 + 31 * math.sin(a)
        c = random.choice(["#f28bb4", "#e0576f", "#f5d76b", "#f7c8d8"])
        d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=c)
        d.point((int(x) - 1, int(y) - 1), fill="#fff2f6")
    for x, y in ((10, 46), (66, 52), (12, 66), (64, 74), (10, 80)):
        c = random.choice(["#f28bb4", "#e0576f", "#f5d76b"])
        d.ellipse([x, y, x + 5, y + 5], fill=c)
        d.point((x + 1, y + 1), fill="#fff2f6")
    outline_sprite(img)
    img.save(OUT / "arch.png")


def make_signpost() -> None:
    img = Image.new("RGBA", (40, 52), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([17, 8, 22, 50], fill=WOOD_DARK)
    d.line([18, 8, 18, 50], fill=WOOD)
    for by, bh in ((6, 12), (22, 10)):
        d.rectangle([3, by, 36, by + bh], fill=WOOD)
        d.rectangle([3, by, 36, by + 1], fill="#c39060")
        d.rectangle([3, by + bh - 1, 36, by + bh], fill=WOOD_DARK)
        d.line([7, by + 4, 30, by + 4], fill=WOOD_DARK)
        d.line([7, by + 7, 24, by + 7], fill=WOOD_DARK)
    d.ellipse([29, 7, 33, 11], fill="#e0576f")
    d.ellipse([32, 7, 36, 11], fill="#e0576f")
    d.polygon([(29, 9), (36, 9), (32, 15)], fill="#e0576f")
    outline_sprite(img)
    img.save(OUT / "signpost.png")


def make_cart() -> None:
    """Flower cart — the 'vending machine' beat from the reference."""
    img = Image.new("RGBA", (76, 84), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # awning
    for i, x in enumerate(range(4, 72, 8)):
        c = "#e0576f" if i % 2 == 0 else "#f7f3ea"
        d.polygon([(x, 8), (x + 8, 8), (x + 8, 22), (x + 4, 26), (x, 22)], fill=c)
    d.rectangle([2, 4, 73, 10], fill="#c9455c")
    # body
    d.rectangle([10, 30, 66, 66], fill="#d9a45f")
    d.rectangle([10, 30, 66, 34], fill="#e8b878")
    d.rectangle([10, 44, 66, 47], fill=WOOD_DARK)
    for sx in range(14, 64, 12):
        d.rectangle([sx, 34, sx + 8, 43], fill="#b9834a")
    # flower buckets on the counter
    for bx, c in ((16, "#f28bb4"), (32, "#f5d76b"), (48, "#f7f3ea")):
        d.rectangle([bx, 22, bx + 12, 31], fill="#8fa8b8")
        d.rectangle([bx, 22, bx + 12, 24], fill="#a8bfcc")
        for fx in range(bx + 1, bx + 12, 4):
            d.line([fx, 22, fx - 1, 14], fill="#4f8a42")
            d.ellipse([fx - 3, 10, fx + 2, 16], fill=c)
    # posts + wheels
    d.rectangle([4, 8, 8, 68], fill=WOOD_DARK)
    d.rectangle([68, 8, 72, 68], fill=WOOD_DARK)
    for wx in (20, 56):
        d.ellipse([wx - 10, 62, wx + 10, 82], fill=WOOD_DARK)
        d.ellipse([wx - 6, 66, wx + 6, 78], fill="#c9a271")
        d.ellipse([wx - 2, 70, wx + 2, 74], fill=WOOD_DARK)
    outline_sprite(img)
    img.save(OUT / "cart.png")


def make_arrow_sign() -> None:
    img = Image.new("RGBA", (52, 62), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([22, 24, 28, 60], fill=WOOD_DARK)
    d.rectangle([22, 24, 24, 60], fill=WOOD)
    d.polygon([(2, 8), (38, 8), (50, 20), (38, 32), (2, 32)], fill=WOOD)
    d.polygon([(2, 8), (38, 8), (50, 20), (38, 32), (2, 32)], outline=WOOD_EDGE)
    d.rectangle([4, 10, 36, 13], fill="#c39060")
    d.line([8, 18, 30, 18], fill=WOOD_DARK)
    d.line([8, 24, 24, 24], fill=WOOD_DARK)
    d.ellipse([36, 15, 41, 20], fill="#e0576f")
    d.ellipse([39, 15, 44, 20], fill="#e0576f")
    d.polygon([(36, 18), (44, 18), (40, 25)], fill="#e0576f")
    outline_sprite(img)
    img.save(OUT / "sign.png")


def make_rock() -> None:
    img = Image.new("RGBA", (38, 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(2, 22), (8, 8), (18, 2), (30, 8), (36, 22)], fill="#9a9186")
    d.polygon([(8, 9), (18, 3), (24, 8), (14, 12)], fill="#b3aa9e")
    d.polygon([(2, 22), (8, 14), (14, 22)], fill="#867d73")
    outline_sprite(img)
    img.save(OUT / "rock.png")


def make_bush() -> None:
    img = Image.new("RGBA", (52, 34), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for cx, cy, r in ((14, 20, 13), (28, 15, 15), (42, 21, 11)):
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill="#4f8a42")
    for cx, cy, r in ((13, 17, 8), (27, 12, 9), (41, 18, 6)):
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill="#63a352")
    for x, y, c in ((10, 12, "#f28bb4"), (34, 10, "#f5d76b"), (24, 20, "#f7f3ea")):
        d.ellipse([x, y, x + 4, y + 4], fill=c)
    d.rectangle([0, 30, 51, 33], fill="#4f8a42")
    outline_sprite(img)
    img.save(OUT / "bush.png")


def make_pole() -> None:
    """Bunting pole — festive vertical rhythm, like the reference's pylons."""
    w, h = 72, 92
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # post with a crossbar
    d.rectangle([30, 10, 37, 90], fill=WOOD_DARK)
    d.rectangle([30, 10, 32, 90], fill=WOOD)
    d.rectangle([22, 8, 45, 13], fill=WOOD)
    d.rectangle([22, 12, 45, 13], fill=WOOD_DARK)
    d.polygon([(30, 24), (22, 34), (24, 36), (32, 27)], fill=WOOD_DARK)
    d.polygon([(37, 24), (45, 34), (43, 36), (35, 27)], fill=WOOD_DARK)
    # bunting drooping off both ends of the crossbar
    def swag(x0, y0, x1, y1, flags):
        for i in range(flags + 1):
            t = i / flags
            x = x0 + (x1 - x0) * t
            y = y0 + (y1 - y0) * t + math.sin(math.pi * t) * 9
            if i > 0:
                d.line([prev, (x, y)], fill="#7d6a58")
            prev = (x, y)
            if i < flags:
                c = ["#e0576f", "#f5d76b", "#f28bb4", "#f7f3ea"][i % 4]
                d.polygon([(x, y + 1), (x + 8, y + 2), (x + 4, y + 11)], fill=c)

    swag(0, 16, 22, 12, 3)
    swag(45, 12, 70, 18, 3)
    outline_sprite(img)
    img.save(OUT / "pole.png")


# ---------------------------------------------------------------- lighting helpers
def make_shadow() -> None:
    """Soft contact shadow. Scaled per entity at runtime."""
    w, h = 48, 18
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([4, 3, w - 5, h - 4], fill=(34, 26, 30, 205))
    img = img.filter(ImageFilter.GaussianBlur(2.2))
    img.save(OUT / "shadow.png")


def make_heart_pickup() -> None:
    img = Image.new("RGBA", (20, 18), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([1, 1, 9, 9], fill="#e0576f")
    d.ellipse([10, 1, 18, 9], fill="#e0576f")
    d.polygon([(1, 6), (18, 6), (10, 16)], fill="#e0576f")
    d.ellipse([3, 3, 6, 6], fill="#f2a0b4")
    outline_sprite(img)
    img.save(OUT / "heart.png")


# ---------------------------------------------------------------- characters
# Frames are 40 wide (art centred in 32px, leaving room on the right for a held
# prop) x 40 tall. Order: idle, walk x3, jump, blink.
FRAME_W, FRAME_H = 40, 40
BODY_X = 4
POSES = ["idle", "w1", "w2", "w3", "jump", "blink"]

JASMINE = "#f7f3ea"


def shade(hex_color: str, f: float) -> str:
    c = tuple(int(hex_color[i : i + 2], 16) for i in (1, 3, 5))
    return "#%02x%02x%02x" % tuple(max(0, min(255, int(v * f))) for v in c)


# ---- held props. Each is drawn after the body, in front of the torso.
def acc_cane(d, ox, by, hy):
    """Mormor: knitted shawl and a walking cane."""
    d.polygon([(ox + 10, by + 1), (ox + 22, by + 1), (ox + 19, by + 9), (ox + 13, by + 9)], fill="#b0577a")
    d.polygon([(ox + 10, by + 1), (ox + 16, by + 1), (ox + 14, by + 9), (ox + 13, by + 9)], fill="#c76d90")
    d.line([ox + 27, by + 6, ox + 27, by + 20], fill="#8a5a34", width=2)
    d.arc([ox + 23, by + 2, ox + 31, by + 10], 180, 350, fill="#8a5a34", width=2)
    for i in range(3):  # flower crown
        d.ellipse([ox + 11 + i * 5, hy - 3, ox + 15 + i * 5, hy + 1],
                  fill=["#f7f3ea", "#f5d76b", "#6f9ad4"][i])


def acc_saree(d, ox, by, hy):
    """Ammamma: a pallu drawn over one shoulder, jasmine in her hair, a stick."""
    d.polygon([(ox + 11, by), (ox + 17, by), (ox + 24, by + 13), (ox + 18, by + 13)], fill="#c9455c")
    d.line([ox + 12, by + 2, ox + 22, by + 12], fill="#f5d76b")
    d.line([ox + 14, by, ox + 24, by + 10], fill="#f5d76b")
    d.line([ox + 27, by + 5, ox + 27, by + 20], fill="#7d5333", width=2)
    for i in range(4):  # mallige strand
        d.ellipse([ox + 8, hy + 3 + i * 3, ox + 11, hy + 6 + i * 3], fill=JASMINE)


def acc_nadaswaram(d, ox, by, hy):
    """The nadaswaram — long conical oboe, raised to play."""
    del hy
    d.line([ox + 21, by + 2, ox + 33, by - 9], fill="#4a3323", width=3)
    d.line([ox + 22, by + 1, ox + 31, by - 7], fill="#6b4a2e", width=1)
    d.polygon([(ox + 31, by - 7), (ox + 39, by - 14), (ox + 36, by - 4)], fill="#4a3323")
    d.polygon([(ox + 32, by - 8), (ox + 37, by - 12), (ox + 35, by - 6)], fill="#7d5333")
    d.ellipse([ox + 19, by + 1, ox + 23, by + 5], fill="#c9a227")
    for nx, ny in ((ox + 34, by - 20), (ox + 38, by - 26)):
        d.ellipse([nx, ny + 3, nx + 3, ny + 6], fill="#4a3428")
        d.line([nx + 3, ny + 4, nx + 3, ny], fill="#4a3428")


def acc_basket(d, ox, by, hy):
    """Marigold and jasmine, with a couple of Swedish cornflowers."""
    del hy
    d.rectangle([ox + 22, by + 5, ox + 37, by + 15], fill="#c69a5e")
    for bx in range(ox + 23, ox + 37, 3):
        d.line([bx, by + 5, bx, by + 15], fill="#a87f48")
    d.arc([ox + 22, by, ox + 37, by + 11], 180, 360, fill="#a87f48", width=2)
    for fx, c in ((24, "#f5a623"), (28, "#e8801f"), (32, JASMINE), (35, "#6f9ad4")):
        d.line([ox + fx, by + 5, ox + fx - 1, by], fill="#4f8a42")
        d.ellipse([ox + fx - 3, by - 4, ox + fx + 1, by], fill=c)


def acc_pillow(d, ox, by, hy):
    """The ring bearer's cushion, held at chest height."""
    del hy
    d.rectangle([ox + 22, by + 2, ox + 36, by + 11], fill="#f7e6ef")
    d.rectangle([ox + 22, by + 2, ox + 36, by + 4], fill="#fdf5f8")
    for cx in (ox + 22, ox + 36):
        d.ellipse([cx - 2, by, cx + 2, by + 4], fill="#f2c9dc")
        d.ellipse([cx - 2, by + 9, cx + 2, by + 13], fill="#f2c9dc")
    d.ellipse([ox + 26, by + 3, ox + 32, by + 9], outline="#f5d76b", width=2)


def acc_tray(d, ox, by, hy):
    """Both kitchens on one tray: prinsesstarta and a stack of laddus."""
    del hy
    d.rectangle([ox + 21, by + 12, ox + 39, by + 15], fill="#d9d2c4")
    d.rectangle([ox + 21, by + 15, ox + 39, by + 16], fill="#a8a294")
    d.pieslice([ox + 22, by + 3, ox + 32, by + 17], 180, 360, fill="#8fc46a")
    d.pieslice([ox + 24, by + 5, ox + 29, by + 15], 180, 300, fill="#a5d484")
    d.rectangle([ox + 22, by + 10, ox + 32, by + 12], fill="#f7f3ea")
    d.ellipse([ox + 25, by, ox + 29, by + 4], fill="#e07a9a")
    for i, (lx, ly) in enumerate(((34, 8), (37, 8), (35, 4))):
        d.ellipse([ox + lx, by + ly, ox + lx + 4, by + ly + 4], fill=["#e8a33c", "#f5b955"][i % 2])


ACCESSORIES = {
    "cane": acc_cane,
    "saree": acc_saree,
    "nadaswaram": acc_nadaswaram,
    "basket": acc_basket,
    "pillow": acc_pillow,
    "tray": acc_tray,
}


def draw_side_char(frame, skin, hair, outfit, outfit2, pose, long_hair, dress, accessory):
    """A chibi character facing RIGHT, art centred in a 40x40 frame."""
    d = ImageDraw.Draw(frame)
    ox = BODY_X
    bob = {"idle": 0, "w1": 0, "w2": 1, "w3": 0, "jump": -2, "blink": 0}[pose]
    pants = shade(outfit2, 0.75)
    shoe = "#4a3c50"

    ly = 31 + bob
    if pose == "jump":
        d.rectangle([ox + 12, ly, ox + 15, ly + 4], fill=pants)
        d.rectangle([ox + 17, ly + 1, ox + 20, ly + 5], fill=pants)
        d.rectangle([ox + 12, ly + 4, ox + 16, ly + 6], fill=shoe)
        d.rectangle([ox + 17, ly + 5, ox + 21, ly + 7], fill=shoe)
    elif pose in ("w1", "w3"):
        fwd = pose == "w1"
        bx = 11 if fwd else 15
        d.rectangle([ox + bx, ly, ox + bx + 3, ly + 6], fill=pants)
        d.rectangle([ox + bx - 1, ly + 6, ox + bx + 3, ly + 8], fill=shoe)
        fx = 18 if fwd else 14
        d.rectangle([ox + fx, ly, ox + fx + 3, ly + 6], fill=pants)
        d.rectangle([ox + fx, ly + 6, ox + fx + 4, ly + 8], fill=shoe)
    else:
        d.rectangle([ox + 13, ly, ox + 16, ly + 6], fill=pants)
        d.rectangle([ox + 17, ly, ox + 20, ly + 6], fill=shade(outfit2, 0.65))
        d.rectangle([ox + 12, ly + 6, ox + 16, ly + 8], fill=shoe)
        d.rectangle([ox + 17, ly + 6, ox + 21, ly + 8], fill=shoe)

    by = 20 + bob
    if dress:
        d.polygon([(ox + 12, by), (ox + 21, by), (ox + 25, by + 13), (ox + 8, by + 13)], fill=outfit)
        d.polygon([(ox + 12, by), (ox + 15, by), (ox + 11, by + 13), (ox + 8, by + 13)],
                  fill=shade(outfit, 0.88))
        d.line([ox + 9, by + 12, ox + 24, by + 12], fill=outfit2)
        d.line([ox + 8, by + 13, ox + 25, by + 13], fill=outfit2)
    else:
        d.rectangle([ox + 11, by, ox + 22, by + 11], fill=outfit)
        d.rectangle([ox + 11, by, ox + 13, by + 11], fill=shade(outfit, 0.85))
        d.rectangle([ox + 11, by + 10, ox + 22, by + 11], fill=outfit2)
        d.rectangle([ox + 15, by, ox + 19, by + 1], fill=outfit2)

    # front arm
    if pose == "jump":
        d.rectangle([ox + 20, by - 4, ox + 23, by + 3], fill=outfit)
        d.rectangle([ox + 20, by - 7, ox + 23, by - 4], fill=skin)
    elif pose in ("w1", "w3"):
        swing = 3 if pose == "w1" else -3
        d.rectangle([ox + 18 + swing // 3, by + 2, ox + 21 + swing // 3, by + 8], fill=outfit)
        d.rectangle([ox + 18 + swing, by + 8, ox + 20 + swing, by + 10], fill=skin)
    else:
        d.rectangle([ox + 19, by + 2, ox + 22, by + 8], fill=shade(outfit, 0.9))
        d.rectangle([ox + 19, by + 8, ox + 21, by + 10], fill=skin)

    hy = 3 + bob
    d.rounded_rectangle([ox + 8, hy, ox + 25, hy + 16], radius=5, fill=skin)
    d.rounded_rectangle([ox + 7, hy - 1, ox + 25, hy + 7], radius=4, fill=hair)
    d.rectangle([ox + 7, hy + 4, ox + 12, hy + 12], fill=hair)
    d.polygon([(ox + 18, hy + 3), (ox + 25, hy + 3), (ox + 25, hy + 6), (ox + 20, hy + 5)], fill=hair)
    d.line([ox + 8, hy + 1, ox + 24, hy + 1], fill=shade(hair, 1.35))
    if long_hair:
        d.rectangle([ox + 6, hy + 4, ox + 10, hy + 25], fill=hair)
        d.rectangle([ox + 6, hy + 22, ox + 10, hy + 25], fill=shade(hair, 0.8))
    d.ellipse([ox + 11, hy + 8, ox + 15, hy + 12], fill=skin)
    d.point((ox + 13, hy + 10), fill=shade(skin, 0.8))
    if pose == "blink":
        d.line([ox + 20, hy + 10, ox + 22, hy + 10], fill=OUTLINE)
    else:
        d.rectangle([ox + 20, hy + 8, ox + 21, hy + 11], fill=OUTLINE)
        d.point((ox + 21, hy + 8), fill="#ffffff")
    d.rectangle([ox + 23, hy + 12, ox + 24, hy + 13], fill=shade(skin, 0.85))
    d.rectangle([ox + 21, hy + 13, ox + 23, hy + 13], fill="#b56a5a")
    d.rectangle([ox + 18, hy + 12, ox + 19, hy + 13], fill="#f0a8a8")

    if accessory:
        ACCESSORIES[accessory](d, ox, by, hy)


def make_character(name, skin, hair, outfit, outfit2, long_hair=False, dress=False, accessory=None):
    sheet = Image.new("RGBA", (FRAME_W * len(POSES), FRAME_H), (0, 0, 0, 0))
    for i, pose in enumerate(POSES):
        frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
        draw_side_char(frame, skin, hair, outfit, outfit2, pose, long_hair, dress, accessory)
        outline_sprite(frame)
        sheet.paste(frame, (i * FRAME_W, 0))
    sheet.save(OUT / f"char-{name}.png")


# ---------------------------------------------------------------- emotes
def make_emotes() -> None:
    """Over-head markers: someone to meet, and someone already met."""
    talk = Image.new("RGBA", (20, 18), (0, 0, 0, 0))
    d = ImageDraw.Draw(talk)
    d.rounded_rectangle([0, 0, 19, 12], radius=4, fill="#fdf9f0")
    d.polygon([(6, 12), (13, 12), (8, 17)], fill="#fdf9f0")
    for i in range(3):
        d.ellipse([4 + i * 5, 5, 6 + i * 5, 7], fill="#4a3428")
    outline_sprite(talk)
    talk.save(OUT / "emote-talk.png")

    done = Image.new("RGBA", (20, 18), (0, 0, 0, 0))
    d = ImageDraw.Draw(done)
    d.rounded_rectangle([0, 0, 19, 12], radius=4, fill="#fdf9f0")
    d.polygon([(6, 12), (13, 12), (8, 17)], fill="#fdf9f0")
    d.ellipse([5, 3, 9, 7], fill="#e0576f")
    d.ellipse([9, 3, 13, 7], fill="#e0576f")
    d.polygon([(5, 5), (13, 5), (9, 10)], fill="#e0576f")
    outline_sprite(done)
    done.save(OUT / "emote-done.png")


def make_dust() -> None:
    """Puff kicked up on jump and landing."""
    img = Image.new("RGBA", (16, 12), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([2, 3, 11, 11], fill=(232, 220, 200, 235))
    d.ellipse([7, 1, 15, 9], fill=(244, 236, 220, 220))
    d.ellipse([0, 6, 6, 12], fill=(220, 206, 186, 200))
    img.save(OUT / "dust.png")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    make_tiles()
    make_sky(SKY_DAY)
    make_sky(SKY_DUSK)
    make_mountains()
    make_hills()
    make_hedge()
    make_foreground()
    make_tree()
    make_house()
    make_arch()
    make_signpost()
    make_cart()
    make_arrow_sign()
    make_rock()
    make_bush()
    make_pole()
    make_heart_pickup()
    make_shadow()
    make_emotes()
    make_dust()

    make_character("groom", "#c98d5e", "#221a18", "#3d5a80", "#2b4462")
    make_character("bride", "#f0d0b4", "#d9b168", "#f7f3ea", "#d8c9b8", long_hair=True, dress=True)
    # the two grandmothers, one from each side
    make_character("npc-mormor", "#f0d5bd", "#e2e0dc", "#6f8ba8", "#5a7189",
                   long_hair=True, dress=True, accessory="cane")
    make_character("npc-ammamma", "#b87b4c", "#e8e4e0", "#c9455c", "#a3384b",
                   long_hair=True, dress=True, accessory="saree")
    make_character("npc-baker", "#e8bd95", "#a85a2a", "#e0576f", "#b84457", accessory="tray")
    make_character("npc-florist", "#c98d5e", "#2a2320", "#7fb069", "#628a50",
                   long_hair=True, dress=True, accessory="basket")
    make_character("npc-musician", "#b87b4c", "#2a2320", "#f5a623", "#d98e1b", accessory="nadaswaram")
    make_character("npc-kid", "#d9a878", "#2a2320", "#f5d76b", "#d4b73f", accessory="pillow")

    print(f"Assets written to {OUT}")


if __name__ == "__main__":
    main()
