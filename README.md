# Wedding Quest 💍

A tiny cozy adventure game that doubles as our wedding invitation — inspired by
[Milki Delivery](https://dodoot.itch.io/milki-delivery-demo). Walk through a
little village, meet the neighbors, and collect every detail of the big day.
When you've talked to everyone, the signpost by the wedding arch reveals the
full invitation.

Built with [Phaser 3](https://phaser.io) + [Vite](https://vite.dev) + TypeScript.
Playable in any browser, desktop or phone (virtual joystick + action button on touch).

## Play / develop

```bash
npm install
npm run dev       # local dev server (add --host to test from your phone)
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build
```

Controls: **WASD / arrow keys** to walk, **E / Space / Enter** to talk.
On touch devices: drag anywhere on the left of the screen for the joystick,
tap the ❤ button to talk.

## Editing the wedding details

Everything guests read lives in **`src/content/wedding.ts`** — names, date,
venue, dress code, RSVP, and every NPC's dialogue. Replace the `[bracketed]`
placeholders with real details.

> ⚠️ This repo is public: only commit details you're happy for anyone to see.

## Continuous deployment (Vercel)

One-time setup (~2 minutes):

1. Go to [vercel.com](https://vercel.com) and sign in **with GitHub**.
2. **Add New… → Project**, import `sathvik777/tapas`.
3. Vercel auto-detects Vite (`vercel.json` is already configured) — click **Deploy**.

After that:

- every push to `master` deploys the live game to your production URL, and
- **every pull request automatically gets its own preview URL**, posted as a
  PR comment by the Vercel bot — open it on your phone to test changes.

GitHub Actions (`.github/workflows/ci.yml`) also builds every PR, so broken
builds are flagged even before Vercel is connected.

## Project layout

```
public/assets/          sprites + tiles (generated placeholders, see CREDITS.md)
scripts/                asset generator (python3 scripts/gen_placeholder_assets.py)
src/content/wedding.ts  ✏️  all wedding text and NPC dialogue
src/world/map.ts        the village map, drawn as a character grid
src/scenes/             boot / title / world scenes
src/objects/            Player (supports a sprite-key for future character select), NPC
src/ui/                 dialogue box, HUD, invitation card, touch controls (DOM-based)
```

## Roadmap

- [x] **POC** — explore the village, NPCs share the wedding info, final invitation card
- [ ] Puzzles / quiz about us → earn points (NPC "visited" tracking already in place)
- [ ] Open leaderboard (needs a small backend — e.g. Supabase or Vercel KV)
- [ ] Choose your character: groom or bride (`Player` already takes a sprite key)
- [ ] Swap placeholder art for the Sprout Lands pack (see `public/assets/CREDITS.md`)
