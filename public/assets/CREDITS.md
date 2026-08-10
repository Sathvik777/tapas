# Asset credits

All sprites in this folder are **generated placeholders**, produced by
`scripts/gen_placeholder_assets.py` in this repository. They are original
to this project and free to use with it.

## Upgrading to Sprout Lands

The game was designed with the [Sprout Lands asset pack by Cup Nooble](https://cupnooble.itch.io/sprout-lands-asset-pack)
in mind (cozy top-down farm/village style). To upgrade:

1. Download the pack from itch.io (free version requires crediting Cup Nooble;
   check the license — redistributing the raw assets is not allowed, which
   includes committing them to a **public** repo. Consider making the repo
   private first, or buying the premium pack and reviewing its terms).
2. Replace the PNGs in this folder (keep the same filenames, or update
   `src/scenes/BootScene.ts` frame sizes to match the pack's sprite sheets).
3. Add the credit line "Art: Sprout Lands by Cup Nooble" to the title screen
   and README.
