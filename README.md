# Wedding Quest 💍

A cozy side-scrolling adventure that doubles as our wedding invitation —
inspired by [Milki Delivery](https://dodoot.itch.io/milki-delivery-demo). Walk
and hop your way right through the countryside, meet the neighbors, and collect
every detail of the big day, spend the hearts you find on a gift at the stall,
and reach the two of us waiting under the mandap — where the full invitation
finally appears, with fireworks.

Built with [Phaser 3](https://phaser.io) + [Vite](https://vite.dev) + TypeScript.
Plays in any browser, desktop or phone (on-screen controls appear on touch devices).

📐 **[docs/DESIGN.md](docs/DESIGN.md)** — why it's built this way: the art
direction, how the two families' worlds are blended, the systems and the traps.
**[CLAUDE.md](CLAUDE.md)** is the short version for anyone (or any agent)
picking the code up cold.

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
venues, dress code, and every NPC's dialogue, plus which column of the
level each character stands in. Replace the `[bracketed]` placeholders with
your real details.

> ⚠️ This repo is public: only commit details you're happy for anyone to see.

## Sending it to someone by name

Add `?to=` to the link and the invitation is addressed to them — on the card
("*joyfully invite Anders & Eva to their wedding*") and again from the two of
you at the end of the walk, if they play that far.

```
https://<your-url>/?to=Anders%20%26%20Eva      → Anders & Eva
https://<your-url>/?to=Mormor                  → Mormor
https://<your-url>/                            → "joyfully invite you"
```

URL-encode it: a space is `%20` and an ampersand is `%26` — an unescaped `&`
would end the parameter and the second name would vanish. `scripts/make-invites.mjs`
does that for you, one pasteable line per guest:

```bash
node scripts/make-invites.mjs "Anders & Eva" "Mormor"
node scripts/make-invites.mjs --file ~/guests.txt          # one name per line
node scripts/make-invites.mjs --base https://example.com "Mormor"
```

Names are arguments, never a file in here — keep the list somewhere outside the
repo. `--base` defaults to the preview URL below.

There is deliberately **no guest list in the repo** — it is public, and a list
of everyone invited would be published with it. Each link only knows the one
name it carries, and a link with no name still reads correctly, which is the
one that gets forwarded around.

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

## Checking a change

`scripts/playthrough.mjs` walks the whole level, talks to every villager, and
asserts the things that must not break — everyone reachable, the HUD counting
them all, the walk ending at golden hour, the invitation card opening, and a
clean console.

```bash
npm run build && npm run preview   # one terminal
npm i -D playwright                # once; deliberately not a project dependency
node scripts/playthrough.mjs       # another terminal
```

## Project layout

```
docs/DESIGN.md          ✏️  design decisions, house rules and known traps
public/assets/          generated sprites + parallax art (see CREDITS.md)
scripts/                asset generator (python3 scripts/gen_placeholder_assets.py)
src/content/wedding.ts  ✏️  all wedding text, family names, dialogue and placement
src/world/level.ts      the level: ground profile, platforms, hearts, props
src/world/daylight.ts   keyframed time-of-day moods driven by level progress
src/scenes/             boot / title / world scenes
src/objects/            Player (takes a sprite key, ready for character select), NPC
src/ui/                 dialogue box, HUD, invitation card, touch controls (DOM-based)
```

### How the scene is put together

`WorldScene.LAYERS` defines the parallax stack. Each distant band is anchored by
its *ridge line* — the y inside the artwork where its horizon sits — placed at a
fraction of the view height, so the horizon holds together at any zoom or aspect
ratio. `fg-grass` uses a scroll factor above 1, which is what makes it read as
being in front of the player. The camera picks an integer zoom that shows about
260px of world vertically and frames the player ~70% down the screen.

## Roadmap

- [x] **POC** — walk and jump through the countryside, NPCs share the wedding info, final invitation card
- [x] Side-view platformer look with layered parallax and higher-resolution art
- [x] **Detail pass 1** — the walk has a time of day (morning → golden hour) and everything casts a shadow
- [x] **Detail pass 2** — the cast recast as family, each with a prop that says who they are, blinking, landing squash and over-head emotes
- [x] **Detail pass 3** — a world that moves: drifting clouds, swaying grass, bird flocks, butterflies over the flower patches, and petals thickening as the wedding nears
- [x] **Detail pass 4a** — landmarks in both vocabularies: falu-red cottage, birch, midsummer pole and dala horse alongside a mandap, marigold garlands, banana plants, kolam and brass lamps that light up at dusk
- [ ] Detail pass 4b — foreground variety (stone-edge and reed stretches instead of one grass verge)
- [x] **The finale** — the couple stand under the mandap instead of a signpost, hearts became currency at a gift stall, and reaching the end sets off fireworks
- [ ] Detail pass 5 — the two of you as the playable leads, plus a companion
- [ ] Puzzles / quiz about us → earn points (NPC "visited" and heart tracking already in place)
- [ ] Open leaderboard (needs a small backend — e.g. Supabase or Vercel KV)
- [ ] Choose your character: groom or bride (`Player` already takes a sprite key)
- [ ] Swap the generated art for a commissioned pack (see `public/assets/CREDITS.md`)
