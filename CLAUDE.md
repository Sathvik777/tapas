# Working in this repo

A browser game that serves as a wedding invitation. Phaser 3 + Vite + TypeScript,
deployed on Vercel. Read `docs/DESIGN.md` before changing anything visual — it
explains the decisions and lists the traps that get re-broken.

## Commands

```bash
npm install
npm run dev                        # dev server (--host to reach it from a phone)
npm run build                      # tsc --noEmit + vite build
npm run preview                    # serve the production build on :4173

python3 scripts/gen_placeholder_assets.py   # regenerate all art (needs pillow)
node scripts/playthrough.mjs                # end-to-end check, needs preview running
```

Node 22, pinned in `.nvmrc`.

## Where things live

| Path | What |
| --- | --- |
| `src/content/wedding.ts` | **All** guest-facing text, family names, dialogue, villager placement |
| `src/world/level.ts` | Ground profile, platforms, props, decor, heart pickups |
| `src/world/daylight.ts` | Keyframed time-of-day moods driven by level progress |
| `src/scenes/WorldScene.ts` | The game: parallax, props, camera, interaction, ambience |
| `src/objects/` | `Player`, `NPC` |
| `src/ui/` | DOM-based dialogue, HUD, invitation card, touch controls |
| `scripts/gen_placeholder_assets.py` | Generates every PNG in `public/assets` |

## House rules

- **Never hand-edit `public/assets/*.png`.** They are generated; the next run of
  the generator overwrites them. Change the generator instead.
- **Guest-facing copy only in `src/content/wedding.ts`.** No strings in scenes.
- **The repo is public.** The couple's own names are published by their choice.
  Everything else — family names, dress code, anything not yet decided — stays a
  `[bracketed]` placeholder until the owner fills it in. Don't invent any of it.
- **Both families, everywhere.** Swedish and South Indian vocabularies share the
  whole level; neither gets a stretch to itself. See `docs/DESIGN.md`.
- Develop on a branch and open a PR; `master` is what Vercel publishes to
  https://sathvik-samina.com, the link the guests actually have.

## Before you push

Run the playthrough and *look at a screenshot*. Several real bugs here passed
every assertion and were obvious in a picture: a colour grade covering half the
frame, a name badge on top of the dialogue text, sprites floating because they
had no shadow.

`WorldScene` exposes `window.__wq` in the browser — `player()`, `visited()`,
`hearts()`, `mood()`, `emotes()`, `bg()` — which is what the playthrough script
and any ad-hoc Playwright check should read rather than scraping pixels.
