# Asset credits

Every sprite and background in this folder is **generated**, produced by
`scripts/gen_placeholder_assets.py` in this repository. They are original to
this project — no third-party pack is redistributed here, so the repo can stay
public without licensing worries.

Regenerate any time with:

```bash
pip install pillow
python3 scripts/gen_placeholder_assets.py
```

## What's here

| File | Role |
| --- | --- |
| `tiles.png` | 32×32 terrain tiles: ground, dirt, one-way platforms, flowers, tufts, fence |
| `bg-sky.png` | Sky gradient with clouds, birds and a sun (1536px wide so it doesn't repeat on screen) |
| `bg-mountains.png` / `bg-hills.png` / `bg-hedge.png` | Parallax bands, hazier and bluer with distance |
| `fg-grass.png` | Foreground grass verge that scrolls *faster* than the world |
| `char-*.png` | 32×40 side-view characters, 5 frames: idle, 3× walk, jump |
| `tree/house/arch/signpost/cart/sign/rock/bush/pole/heart` | World props |

## Art direction

The look follows [Milki Delivery](https://dodoot.itch.io/milki-delivery-demo):
layered parallax with atmospheric perspective, a foreground layer passing in
front of the player, chunky dark outlines, and cozy outlined UI cards.

## Swapping in a bought/commissioned pack

Replace the PNGs keeping the same filenames, then adjust the frame size in
`src/scenes/BootScene.ts` (characters are loaded as 32×40 spritesheets) and the
ridge anchors in `WorldScene.LAYERS` if your background bands put the horizon
at a different height. If you use a pack such as Sprout Lands, check its
license first — most free packs allow use with credit but **not**
redistribution, which committing them to a public repo would count as.
