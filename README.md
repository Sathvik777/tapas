# Wedding Quest 💍

A cozy side-scrolling adventure that doubles as our wedding invitation —
inspired by [Milki Delivery](https://dodoot.itch.io/milki-delivery-demo). Walk
and hop your way right through the countryside, meet the neighbors, and collect
every detail of the big day. Once you've talked to everyone, the signpost by
the wedding arch reveals the full invitation.

Built with [Phaser 3](https://phaser.io) + [Vite](https://vite.dev) + TypeScript.
Plays in any browser, desktop or phone (on-screen controls appear on touch devices).

## Play / develop

```bash
npm install
npm run dev       # local dev server (add --host to test from your phone)
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build
```

**Controls** — walk with ← →  / A D, jump with Space / ↑ / W, talk with E or Enter.
On a phone: ◀ ▶ to walk, ⤒ to jump, and a ❤ button appears whenever someone is
close enough to talk to. Landscape looks best; the game says so on startup.

## Editing the wedding details

Everything guests read lives in **`src/content/wedding.ts`** — names, date,
venue, dress code, RSVP, and every NPC's dialogue, plus which column of the
level each character stands in. Replace the `[bracketed]` placeholders with
your real details.

> ⚠️ This repo is public: only commit details you're happy for anyone to see.

## Continuous deployment (Vercel)

One-time setup (~2 minutes):

1. Go to [vercel.com](https://vercel.com) and sign in **with GitHub**.
2. **Add New… → Project**, import `sathvik777/tapas`.
3. Vercel auto-detects Vite (`vercel.json` is already configured) — click **Deploy**.

After that:

- every push to `master` deploys the live game to your production URL, and
- **every pull request gets its own preview URL**, posted as a PR comment by the
  Vercel bot — open it on your phone to test changes.

GitHub Actions (`.github/workflows/ci.yml`) also builds every PR, so a broken
build is caught even before Vercel is connected.

## Project layout

```
public/assets/          generated sprites + parallax art (see CREDITS.md)
scripts/                asset generator (python3 scripts/gen_placeholder_assets.py)
src/content/wedding.ts  ✏️  all wedding text, NPC dialogue and NPC placement
src/world/level.ts      the level: ground profile, platforms, hearts, props
src/scenes/             boot / title / world scenes
src/objects/            Player (takes a sprite key, ready for character select), NPC
src/ui/                 dialogue box, HUD, invitation card, touch controls (DOM-based)
```

### How the scene is put together

`WorldScene.LAYERS` defines the parallax stack. Each distant band is anchored by
its *ridge line* — the y inside the artwork where its horizon sits — placed at a
fraction of the view height, so the horizon holds together at any zoom or aspect
ratio. `fg-fence` uses a scroll factor above 1, which is what makes it read as
being in front of the player. The camera picks an integer zoom that shows about
260px of world vertically and frames the player ~70% down the screen.

## Roadmap

- [x] **POC** — walk and jump through the countryside, NPCs share the wedding info, final invitation card
- [x] Side-view platformer look with layered parallax and higher-resolution art
- [ ] Puzzles / quiz about us → earn points (NPC "visited" and heart tracking already in place)
- [ ] Open leaderboard (needs a small backend — e.g. Supabase or Vercel KV)
- [ ] Choose your character: groom or bride (`Player` already takes a sprite key)
- [ ] Swap the generated art for a commissioned pack (see `public/assets/CREDITS.md`)
