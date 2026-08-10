#!/usr/bin/env python3
"""Generate the game's pixel-art placeholder assets.

The project was designed for the Sprout Lands asset pack (cupnooble.itch.io),
which cannot be redistributed in a public repo. These generated sprites keep
the game fully playable; drop Sprout Lands files into public/assets/ and
adjust the loader in src/scenes/BootScene.ts to upgrade the art.

Run:  python3 scripts/gen_placeholder_assets.py
Deps: pillow
"""

import random
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "public" / "assets"
TILE = 16
random.seed(42)

# ---------------------------------------------------------------- palette
GRASS = "#8fce6a"
GRASS_DARK = "#79b356"
GRASS_LIGHT = "#a3dd7f"
PATH = "#e8c990"
PATH_DARK = "#d9b878"
WATER = "#6fb5e0"
WATER_LIGHT = "#a8d8f0"
WATER_DARK = "#5aa2d0"
WOOD = "#b07d4f"
WOOD_DARK = "#8a5a3b"
OUTLINE = (58, 43, 58, 255)


def speckle(d: ImageDraw.ImageDraw, ox: int, oy: int, color: str, n: int) -> None:
    for _ in range(n):
        x = ox + random.randint(1, TILE - 2)
        y = oy + random.randint(1, TILE - 2)
        d.point((x, y), fill=color)
        if random.random() < 0.5:
            d.point((x + 1, y), fill=color)


def make_tileset() -> None:
    """8 tiles in one row: grass, grass2, path, water, flowers, tuft, fence, dark grass."""
    img = Image.new("RGBA", (TILE * 8, TILE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    def base(i: int, color: str) -> int:
        d.rectangle([i * TILE, 0, i * TILE + TILE - 1, TILE - 1], fill=color)
        return i * TILE

    # 0/1: grass variants
    ox = base(0, GRASS)
    speckle(d, ox, 0, GRASS_DARK, 5)
    speckle(d, ox, 0, GRASS_LIGHT, 4)
    ox = base(1, GRASS)
    speckle(d, ox, 0, GRASS_DARK, 8)
    speckle(d, ox, 0, GRASS_LIGHT, 2)

    # 2: path
    ox = base(2, PATH)
    speckle(d, ox, 0, PATH_DARK, 7)
    speckle(d, ox, 0, "#f2dcae", 3)

    # 3: water
    ox = base(3, WATER)
    for y, c in ((3, WATER_LIGHT), (8, WATER_DARK), (12, WATER_LIGHT)):
        x0 = ox + random.randint(1, 5)
        d.line([x0, y, x0 + 5, y], fill=c)

    # 4: flowers on grass
    ox = base(4, GRASS)
    speckle(d, ox, 0, GRASS_DARK, 4)
    for fx, fy, c in ((3, 4, "#f28bb4"), (10, 3, "#f5d76b"), (6, 10, "#f7f3ea"), (12, 11, "#f28bb4")):
        d.point((ox + fx, fy), fill="#5e8f45")
        d.rectangle([ox + fx - 1, fy - 2, ox + fx + 1, fy], fill=c)
        d.point((ox + fx, fy - 1), fill="#ffffff")

    # 5: tall grass tuft
    ox = base(5, GRASS)
    speckle(d, ox, 0, GRASS_DARK, 3)
    for tx in (3, 6, 9, 12):
        h = random.randint(4, 7)
        d.line([ox + tx, 13, ox + tx, 13 - h], fill="#5e8f45")
        d.point((ox + tx - 1, 13 - h + 1), fill="#6faf52")

    # 6: fence on grass
    ox = base(6, GRASS)
    speckle(d, ox, 0, GRASS_DARK, 4)
    d.rectangle([ox + 2, 3, ox + 4, 13], fill=WOOD)
    d.rectangle([ox + 11, 3, ox + 13, 13], fill=WOOD)
    d.rectangle([ox + 0, 6, ox + 15, 8], fill=WOOD_DARK)
    d.point((ox + 3, 4), fill="#c99968")
    d.point((ox + 12, 4), fill="#c99968")

    # 7: darker grass (map border)
    ox = base(7, GRASS_DARK)
    speckle(d, ox, 0, "#68a04a", 6)

    img.save(OUT / "tiles.png")


def make_tree() -> None:
    img = Image.new("RGBA", (32, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([13, 30, 18, 46], fill=WOOD_DARK)
    d.line([14, 30, 14, 46], fill="#6f4630")
    for cx, cy, r, c in (
        (16, 16, 13, "#4f9e4f"),
        (9, 20, 8, "#5aa957"),
        (23, 20, 8, "#5aa957"),
        (16, 12, 9, "#66b45e"),
        (12, 10, 5, "#7fc86e"),
    ):
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)
    for _ in range(10):
        x, y = random.randint(6, 26), random.randint(6, 24)
        d.point((x, y), fill="#8fd67e")
    img.save(OUT / "tree.png")


def make_house() -> None:
    img = Image.new("RGBA", (64, 56), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # walls
    d.rectangle([6, 24, 57, 54], fill="#f2e3c9")
    d.rectangle([6, 24, 57, 54], outline="#c9b391")
    # roof
    d.polygon([(2, 26), (32, 4), (61, 26)], fill="#c96f5a")
    d.polygon([(6, 26), (32, 8), (57, 26)], fill="#d97f66")
    d.line([2, 26, 61, 26], fill="#a85a48")
    # door
    d.rectangle([27, 38, 36, 54], fill=WOOD_DARK)
    d.point((34, 46), fill="#f5d76b")
    # windows
    for wx in (12, 44):
        d.rectangle([wx, 34, wx + 7, 41], fill="#a8d8f0")
        d.rectangle([wx, 34, wx + 7, 41], outline=WOOD_DARK)
        d.line([wx + 3, 34, wx + 3, 41], fill=WOOD_DARK)
    # heart above the door
    d.point((30, 33), fill="#e0576f")
    d.point((33, 33), fill="#e0576f")
    d.rectangle([29, 34, 34, 35], fill="#e0576f")
    d.point((31, 36), fill="#e0576f")
    d.point((32, 36), fill="#e0576f")
    img.save(OUT / "house.png")


def make_arch() -> None:
    """Wedding arch."""
    img = Image.new("RGBA", (40, 44), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.arc([4, 2, 35, 34], 180, 360, fill="#f7f3ea", width=4)
    d.rectangle([4, 18, 7, 42], fill="#f7f3ea")
    d.rectangle([32, 18, 35, 42], fill="#f7f3ea")
    for x, y in ((6, 20), (33, 24), (10, 8), (28, 8), (19, 3), (6, 32), (33, 36), (14, 4), (24, 4)):
        d.rectangle([x, y, x + 1, y + 1], fill=random.choice(["#f28bb4", "#e0576f", "#f5d76b"]))
    img.save(OUT / "arch.png")


def make_signpost() -> None:
    img = Image.new("RGBA", (20, 26), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([9, 4, 11, 24], fill=WOOD_DARK)
    d.rectangle([2, 4, 18, 14], fill=WOOD)
    d.rectangle([2, 4, 18, 14], outline=WOOD_DARK)
    d.line([5, 8, 15, 8], fill="#7a4f33")
    d.line([5, 11, 12, 11], fill="#7a4f33")
    img.save(OUT / "signpost.png")


def make_heart() -> None:
    img = Image.new("RGBA", (10, 9), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = "#e0576f"
    d.rectangle([1, 1, 3, 2], fill=c)
    d.rectangle([6, 1, 8, 2], fill=c)
    d.rectangle([0, 2, 9, 4], fill=c)
    d.rectangle([1, 5, 8, 5], fill=c)
    d.rectangle([2, 6, 7, 6], fill=c)
    d.rectangle([3, 7, 6, 7], fill=c)
    d.point((4, 8), fill=c)
    d.point((5, 8), fill=c)
    d.point((2, 2), fill="#f2a0b4")
    img.save(OUT / "heart.png")


# ---------------------------------------------------------------- characters
FRAME_W, FRAME_H = 16, 20


def draw_char_frame(
    d: ImageDraw.ImageDraw,
    ox: int,
    oy: int,
    skin: str,
    hair: str,
    outfit: str,
    outfit2: str,
    facing: str,
    step: int,
    long_hair: bool,
    dress: bool,
) -> None:
    """One 16x20 frame. step: 0 idle, 1 left foot, 2 right foot."""
    bob = 1 if step else 0

    # legs / feet
    ly = 17
    if dress:
        # dress covers legs; show feet peeking
        d.rectangle([5, ly + 1, 6, ly + 2], fill="#5a4a5a") if step != 2 else None
        d.rectangle([9, ly + 1, 10, ly + 2], fill="#5a4a5a") if step != 1 else None
    else:
        lift_l = 1 if step == 1 else 0
        lift_r = 1 if step == 2 else 0
        d.rectangle([5, ly - lift_l, 6, ly + 2 - lift_l], fill="#5a4a5a")
        d.rectangle([9, ly - lift_r, 10, ly + 2 - lift_r], fill="#5a4a5a")

    # body
    by = 11 + bob
    if dress:
        d.polygon([(5, by), (10, by), (12, by + 7), (3, by + 7)], fill=outfit)
        d.line([4, by + 6, 11, by + 6], fill=outfit2)
    else:
        d.rectangle([4, by, 11, by + 5], fill=outfit)
        d.line([4, by + 5, 11, by + 5], fill=outfit2)
        # arms
        d.rectangle([3, by + 1, 3, by + 4], fill=skin)
        d.rectangle([12, by + 1, 12, by + 4], fill=skin)

    # head
    hy = 3 + bob
    d.rectangle([4, hy, 11, hy + 8], fill=skin)

    # hair
    d.rectangle([4, hy - 1, 11, hy + 2], fill=hair)
    d.point((4, hy + 3), fill=hair)
    d.point((11, hy + 3), fill=hair)
    if long_hair:
        d.rectangle([3, hy, 3, hy + 9], fill=hair)
        d.rectangle([12, hy, 12, hy + 9], fill=hair)
    if facing == "up":
        d.rectangle([4, hy, 11, hy + 6], fill=hair)

    # face
    if facing == "down":
        d.point((6, hy + 4), fill=OUTLINE)
        d.point((9, hy + 4), fill=OUTLINE)
        d.point((6, hy + 6), fill="#e8a0a0")
        d.point((9, hy + 6), fill="#e8a0a0")
    elif facing == "left":
        d.point((5, hy + 4), fill=OUTLINE)
        d.point((5, hy + 6), fill="#e8a0a0")
    elif facing == "right":
        d.point((10, hy + 4), fill=OUTLINE)
        d.point((10, hy + 6), fill="#e8a0a0")

    del ox, oy  # frames are drawn on per-frame images, offsets unused


def make_character(
    name: str,
    skin: str,
    hair: str,
    outfit: str,
    outfit2: str,
    long_hair: bool = False,
    dress: bool = False,
) -> None:
    """12-frame sheet: rows down/left/right/up, 3 walk frames each."""
    sheet = Image.new("RGBA", (FRAME_W * 3, FRAME_H * 4), (0, 0, 0, 0))
    for row, facing in enumerate(["down", "left", "right", "up"]):
        for col, step in enumerate([0, 1, 2]):
            frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
            d = ImageDraw.Draw(frame)
            draw_char_frame(d, 0, 0, skin, hair, outfit, outfit2, facing, step, long_hair, dress)
            sheet.paste(frame, (col * FRAME_W, row * FRAME_H))
    sheet.save(OUT / f"char-{name}.png")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    make_tileset()
    make_tree()
    make_house()
    make_arch()
    make_signpost()
    make_heart()

    # playable characters (groom / bride — character select comes later)
    make_character("groom", "#f2c9a1", "#3b2f2f", "#3d5a80", "#2b4462")
    make_character("bride", "#f2c9a1", "#6b4a34", "#f7f3ea", "#e0d5c5", long_hair=True, dress=True)

    # NPCs
    make_character("npc-elder", "#e8bd95", "#cfcfcf", "#7a6f5a", "#635a48")
    make_character("npc-baker", "#f2c9a1", "#a85a2a", "#e0576f", "#b84457")
    make_character("npc-florist", "#d9a878", "#2f4a2f", "#7fb069", "#628a50", long_hair=True, dress=True)
    make_character("npc-musician", "#f2c9a1", "#f5d76b", "#9a6fb0", "#7d5591")
    make_character("npc-kid", "#e8bd95", "#3b2f2f", "#f5a623", "#d98e1b")

    print(f"Assets written to {OUT}")


if __name__ == "__main__":
    main()
