# Wedding Quest — design decisions

Why the game is built the way it is. The README covers how to run it; this
covers the choices, the rules that keep them coherent, and the handful of traps
that will otherwise get "fixed" back into bugs.

---

## The brief

A browser game that *is* the wedding invitation. A guest opens a link on their
phone, walks right for a few minutes, meets the family, and ends up holding the
invitation — date, venue, dress code, RSVP — having been told it by people
rather than shown it on a page.

Two constraints follow from the audience, and they outrank everything else:

- **Anyone can finish it.** Grandparents included. The platforming is gentle,
  nothing kills you, no gap is inescapable, and the only tutorial is a card that
  says "head right".
- **It has to work on a phone, in a browser, from a cold link.** No install, no
  account, no landscape requirement (though landscape looks better and the game
  says so once).

The look is modelled on [Milki Delivery](https://dodoot.itch.io/milki-delivery-demo):
layered parallax with atmospheric perspective, a foreground layer passing in
front of the player, chunky dark outlines, and cozy cream UI cards with heavy
borders.

---

## The two families

The couple is Swedish and South Indian, and the world carries both **from the
first step to the last**. This is a rule, not a mood:

> Neither vocabulary ever gets a stretch of road to itself, and neither replaces
> the other at any point. If you add a prop from one side, the surrounding
> stretch should already carry something from the other.

The rejected alternative was a journey that begins Swedish and becomes Indian.
It reads as travelling *away* from one family toward the other. Blending
throughout reads as two families already joined — which is the point of the day.

**Her side:** falu-red cottage with white corner boards, birch, midsummer pole
dressed in birch and wildflowers, dala horse, cornflower / oxeye daisy / lupine
meadows, prinsesstårta.

**His side (South Indian specifically):** mandap, marigold garlands, mango-leaf
toran, banana plants, kolam laid on the road, brass kuthu vilakku lamps,
nadaswaram.

Deliberate collisions are the best part and worth adding more of: the cottage
wears a toran along its eaves, one basket holds marigolds *and* cornflowers, the
sweets tray carries prinsesstårta next to laddus, and the mandap at the end is
dressed in both.

---

## Systems, and what must stay true

### Daylight (`src/world/daylight.ts`)

The sky is a function of **how far you have walked**, not of a clock. Progress
through the level lerps between keyframed moods, so the walk always runs morning
→ midday → golden hour and guests always arrive at the wedding at sunset. Tie it
to real time and the arc stops landing with the story.

- Tints are Phaser tints, i.e. **multiplied** — `0xffffff` means untouched, and
  a tint can only ever *darken*. This is why dusk is its own sky texture
  (`bg-sky-dusk.png`) cross-faded in over the last third: tinting the blue day
  sky orange produces brown, not a sunset. The clouds sit in matching positions
  in both textures so the blend is invisible.
- Multiply is still the right tool for the *land*: warm evening light genuinely
  does darken and warm grass.
- `lightsOn` rises toward the end and drives the lamp halos. Anything else that
  should light up at dusk should read the same value.

### Parallax (`WorldScene.LAYERS`)

Each band is anchored by its **ridge line** — the y inside the artwork where its
horizon sits — placed at a fraction of the view height. That keeps the horizon
stack coherent at any zoom, aspect ratio or device. Anchoring by the bottom edge
instead breaks the moment the viewport changes shape.

`fg-grass` uses a scroll factor **above 1** so it slides past faster than the
world. That single layer is doing most of the work of making the scene read as
three-dimensional.

**Keep the foreground low.** This layer used to be a waist-high fence
(`fg-fence.png`). It looked right in the source art and wrong in the game: at
the zoom the game actually runs at it took the bottom fifth of the frame and
walled off the road, the dirt and anything standing near the camera. The verge
that replaced it is a shallow grass bank with tufts — the depth cue comes from
the *speed* the layer passes at, not its height. Its ridge row is `FG_RIDGE_Y`
in the generator and `ridgeY` in `LAYERS`; the two have to agree.

Bands are plain world objects re-anchored to the camera every frame rather than
`scrollFactor` children, and oversized by `BG_MARGIN` so the one-frame follow lag
never exposes an edge.

### Depth order

Roughly: parallax bands are negative, the **tilemap sits at 0**, props 0.4–7,
heart pickups 8, villagers 10, player 20, foreground verge 40, emotes 60,
particles 90, the couple's marker 100.

The tilemap is at 0 rather than 5 specifically so contact shadows can sit *under*
each prop and still read above the ground. Moving it will silently hide every
shadow.

### Camera

Integer zoom only — fractional zoom makes pixel art shimmer and can bleed
neighbouring tiles. The zoom that gets picked shows roughly 260px of world
height, with a floor so the view never gets narrower than 300px (which is what a
phone held upright would otherwise do). The player sits ~70% down the frame:
sky and hills above, road and grass verge below.

The level is 24 rows deep although the ground only uses rows 9–13. The extra
depth exists so a tall viewport can never scroll past the bottom of the world
and reveal empty space.

### Interaction

- **Villagers are solid until you've met them.** Blocking the road is what makes
  them impossible to walk past without noticing; once you've spoken, they stop
  blocking, because hopping over the same grandmother on every pass gets old.
  The first time you push against one, the game offers "hop over with Space".
- **One meaning per symbol.** A floating heart is a collectible. A speech bubble
  over someone's head means you haven't met them; it becomes a heart bubble once
  you have. The couple at the end have their own marker. Early on the heart meant
  both "talk here" and "collect me", which read as a bug.
- **`nearestInteractable` compares everyone on one footing.** It used to return
  the nearest *villager* before considering anything else, which made the gift
  stall unopenable whenever a villager stood within range of it — the stall was
  nearer and still lost.

---

### Dialogue

The card sits in the **top half**. On a phone the bottom of the screen is thumbs
and controls, and a card down there covers the person who is speaking.

It **advances by itself** after a pause that scales with the length of the line,
so the game can be watched one-handed or handed to someone who is not going to
tap. Tapping still works and simply gets there sooner. The whole screen is the
target — see the traps below.

### Two doors, and a named link

The title screen offers **the invitation** and **the walk**, side by side. The
walk used to be the only way in, with each villager holding one piece of the
details and the card appearing once you had met all six. That is a good game
and a bad invitation: most guests open a wedding link to find out when and
where, and asking them to finish a platformer first loses them. The walk keeps
every piece — nothing was moved out of it — but it is now something a guest
chooses rather than something they must survive.

The guest's name rides in the URL (`?to=`, parsed in `src/guest.ts`) and lands
in exactly two places: the line on the card, and the couple's first words at
the mandap. **A link with no name must read correctly**, because that is the
one that gets forwarded on. There is no guest list in the repo — it is public.

### The finale

Hearts scattered along the road are **currency**, which is what gives them a
point beyond being nice to grab. They buy a gift at the stall roughly two thirds
of the way along; the stallholder gives tips on what the couple would actually
keep. The couple themselves stand under the mandap at the end — talking to them
is what completes the invitation, and it sets off fireworks. If you brought a
gift, they mention it.

## Content

Everything a guest reads lives in **`src/content/wedding.ts`** — names, date,
venue, dress code, RSVP, every line of dialogue, and which level column each
villager stands in. Nothing guest-facing should be written anywhere else.

Placeholders are `[bracketed]` so unfilled ones are obvious in a screenshot.

> The repository is public. Only commit details you are happy for anyone to
> read.

---

## Assets

Every sprite, tile and background is **generated** by
`scripts/gen_placeholder_assets.py` (Pillow). Nothing third-party is
redistributed, which is what lets the repo stay public.

```bash
pip install pillow
python3 scripts/gen_placeholder_assets.py
```

To change the art, change the generator and re-run it — don't hand-edit the
PNGs, or the next run will overwrite you. `public/assets/CREDITS.md` describes
what each file is for.

Characters are 40×40 frames: the body is drawn centred in 32px with the
remaining width on the right reserved for a held prop, which is why the physics
bodies carry an x offset. Frame order is idle, three walk frames, jump, blink.

---

## Verification

`scripts/playthrough.mjs` is the gate. It walks the level like a player, talks
to everyone, and asserts that each villager is reachable and speaks, the HUD
counts them all, the walk ends at golden hour, the invitation card opens, and
the console stayed clean.

```bash
npm run build && npm run preview     # one terminal
npm i -D playwright                  # once — see below
node scripts/playthrough.mjs         # another terminal
```

Playwright is intentionally **not** a project dependency: Vercel installs
devDependencies at build time and Playwright's postinstall downloads browser
binaries, which would slow every deploy for a check that only runs locally.

Screenshot the result too. Several bugs in this project were invisible to
assertions and obvious in a picture — a colour grade covering half the screen, a
name badge sitting on top of the dialogue text, sprites reading as stickers
because they had no shadow.

---

## Traps

Things that look like bugs but aren't, and fixes that will reintroduce real ones.

- **The dialogue card must not take pointer events.** The whole screen advances
  the dialogue, via a full-screen catcher underneath. Give the card
  `pointer-events` back and it will swallow every tap that lands on it — which is
  exactly where a thumb rests on a phone. The map button on a dialogue page is
  the one deliberate exception, and it comes with a second rule: **a page
  carrying a link does not auto-advance.** Dialogue otherwise moves on by itself
  so the game can be watched one-handed, and a button that slides away while
  someone is reaching for it is worse than no button at all.
- **The colour grade is a camera post-effect, not a screen-space quad.** A
  scroll-fixed quad is still scaled by camera zoom, so it covers only part of the
  viewport with a hard seam down the middle. If WebGL is unavailable the grade
  silently no-ops and the per-band tints still carry the time of day.
- **The name badge is in the document flow on purpose.** Absolutely positioning
  it looks tidier until a long name wraps to two lines and covers the first line
  of dialogue.
- **The production URL is empty by design, for now.** Vercel builds production
  from `master`, which is still the original Python fork. The branch preview URL
  is the live game; merging is what makes production serve it.
- **`spark.png` and friends must be added to `BootScene`'s load list.** Generating
  an asset is only half of it. A texture that was never loaded renders as
  Phaser's missing-texture placeholder — green wireframe boxes — which is exactly
  what the first pass of the fireworks looked like.
- **Preview deployments may sit behind a Vercel login.** That is deployment
  protection, not a broken build — Settings → Deployment Protection → Vercel
  Authentication.
- **The bride and the florist are drawn to look like the real people.** Their
  colouring and `curly=True` in `make_character` are deliberate, not the
  generator's defaults left unfinished. Don't normalise them back toward the
  rest of the cast.
- **Anything that hangs or lies flat has to be tied to something.** A garland
  floats unless both of its ends land on a bunting pole's crossbar or the
  cottage roof — the art spans four columns, so its two anchors have to be four
  columns apart and the same height. A kolam belongs at a building's threshold,
  sharing that building's column. Both rules are written out over `PROPS` in
  `level.ts`; the offsets they depend on are in `WorldScene.PROP_ANCHOR`.
- **Nothing important goes below the ground line.** The camera deadzone lets the
  ground line sit anywhere from 59% to 81% down the frame while the foreground
  verge starts at 90%, so at the bottom of that range there is no visible road
  at all. The kolam used to lie out on the dirt and vanished for whole stretches
  of the walk; it is centred on the ground line now, at the feet of whoever is
  standing on it.

---

## Still open

- **Foreground variety.** One grass verge runs the entire level. Swapping it by
  zone — meadow grass, a low stone edge, reeds — plus the occasional foreground
  tree trunk sweeping past, would multiply the sense of travel for very little
  work. Whatever replaces it stays low; see the note in Parallax.
- **The two leads.** The player is still a generic figure. Needs real outfits
  and colouring, which unlocks the groom/bride character select the `Player`
  class already takes a sprite key for.
- **A companion** that follows you and sits when you stop.
- **Quiz and points**, then an **open leaderboard** — villager-visited and heart
  counts are already tracked, but a leaderboard needs a small backend.
