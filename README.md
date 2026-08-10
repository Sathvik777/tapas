# Wedding Quest 💍

A cozy side-scrolling adventure that doubles as our wedding invitation —
inspired by [Milki Delivery](https://dodoot.itch.io/milki-delivery-demo). Walk
and hop your way right through the countryside, meet the neighbors, and collect
every detail of the big day. Once you've talked to everyone, the signpost by
the wedding arch reveals the full invitation.

Built with [Phaser 3](https://phaser.io) + [Vite](https://vite.dev) + TypeScript.
Plays in any browser, desktop or phone (on-screen controls appear on touch devices).

## Play / develop

Node 22 (pinned in `.nvmrc`).

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

Vercel is connected, and **every push to this branch redeploys the same preview URL**:

**https://tapas-git-claude-wedding-game-poc-n3638n-sathvik777s-projects.vercel.app**

Keep that link on your phone — it always serves the latest commit on
`claude/wedding-game-poc-n3638n`, so you can re-test after each change without
hunting for a new URL. Vercel also comments a link on every pull request.

### If the preview asks you to log in

New Vercel projects protect preview deployments by default, which means anyone
who is not signed into your Vercel account hits a login wall — including you on a
phone, and including any guest you send the game to. Turn it off at
**Vercel → the `tapas` project → Settings → Deployment Protection → Vercel
Authentication → Disabled**. The preview becomes publicly reachable by URL, which
is what you want for an invitation (and the repo is public already).

### Why the production URL is empty

Vercel builds production from the repository's default branch, and `master` is
still the old TAPAS Python fork — there is no `package.json` there, so there is
nothing for it to build. Merging this branch into `master` makes the production
URL serve the game. Until then, use the preview URL above.

## Project layout

```
public/assets/          generated sprites + parallax art (see CREDITS.md)
scripts/                asset generator (python3 scripts/gen_placeholder_assets.py)
src/content/wedding.ts  ✏️  all wedding text, family names, dialogue and placement
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
- [x] **Detail pass 1** — the walk has a time of day (morning → golden hour) and everything casts a shadow
- [x] **Detail pass 2** — the cast recast as family, each with a prop that says who they are, blinking, landing squash and over-head emotes
- [ ] Detail passes 3-5 — an animated world, landmarks and foreground variety, the two of you as the leads
- [ ] Puzzles / quiz about us → earn points (NPC "visited" and heart tracking already in place)
- [ ] Open leaderboard (needs a small backend — e.g. Supabase or Vercel KV)
- [ ] Choose your character: groom or bride (`Player` already takes a sprite key)
- [ ] Swap the generated art for a commissioned pack (see `public/assets/CREDITS.md`)
