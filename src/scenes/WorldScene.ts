import Phaser from 'phaser';
import { COUPLE_SCENE, INVITATION_LINES, NPCS, SHOP, type GiftDef } from '../content/wedding';
import { NPC } from '../objects/NPC';
import { Player } from '../objects/Player';
import { DialogueBox } from '../ui/DialogueBox';
import { isTouchDevice } from '../ui/dom';
import { Hud } from '../ui/Hud';
import { InvitationCard } from '../ui/InvitationCard';
import { ShopCard } from '../ui/ShopCard';
import { TouchControls } from '../ui/TouchControls';
import { moodAt, moodTintFor, type Mood } from '../world/daylight';
import {
  ONE_WAY_TILES,
  parseLevel,
  PLAYER_SPAWN_COL,
  SOLID_TILES,
  TILE_SIZE,
  type ParsedLevel,
  type PropDef,
  type PropType,
} from '../world/level';

const INTERACT_RANGE = 56;
const GRAVITY = 900;
/** Height above the ground at which the player's shadow has shrunk to its smallest. */
const SHADOW_FADE_HEIGHT = 110;
const SHADOW_ALPHA = 0.62;

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private npcs: NPC[] = [];
  private emotes = new Map<NPC, Phaser.GameObjects.Image>();
  private wasOnGround = true;
  private decor: Array<{ sprite: Phaser.GameObjects.Image; phase: number }> = [];
  /** The two of them under the mandap — the last thing you reach. */
  private couple!: Phaser.GameObjects.Sprite;
  private shopkeeper!: Phaser.GameObjects.Sprite;
  private shop = new ShopCard();
  private gift: GiftDef | null = null;
  private metCouple = false;
  private shopGreeted = false;
  private indicator!: Phaser.GameObjects.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private bgLayers: Array<{ sprite: Phaser.GameObjects.TileSprite; factor: number }> = [];
  private grade: Phaser.FX.ColorMatrix | null = null;
  private motes?: Phaser.GameObjects.Particles.ParticleEmitter;
  private petals?: Phaser.GameObjects.Particles.ParticleEmitter;
  private lampGlows: Phaser.GameObjects.Image[] = [];
  private playerShadow!: Phaser.GameObjects.Image;
  private lastGroundY = 0;
  private mood!: Mood;
  private levelWidth = 1;
  private dialogue = new DialogueBox();
  private invitation = new InvitationCard();
  private hud!: Hud;
  private touch!: TouchControls;
  private celebrated = false;
  private heartCount = 0;
  private blockedFrames = 0;
  private hintedJump = false;

  constructor() {
    super('world');
  }

  create(): void {
    const level = parseLevel();
    const levelW = level.width * TILE_SIZE;
    const levelH = level.height * TILE_SIZE;
    this.levelWidth = levelW;

    this.physics.world.gravity.y = GRAVITY;
    this.physics.world.setBounds(0, -levelH * 2, levelW, levelH * 3);

    this.createBackground();

    const map = this.make.tilemap({
      data: level.data,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const tileset = map.addTilesetImage('tiles', 'tiles', TILE_SIZE, TILE_SIZE, 0, 0)!;
    const layer = map.createLayer(0, tileset, 0, 0)!;
    // Depth 0 keeps the ground above the parallax bands (negative depths) while
    // leaving room beneath every prop for its contact shadow.
    layer.setDepth(0);
    layer.setCollision(SOLID_TILES);
    // one-way platforms: collide only when landing from above
    layer.forEachTile((tile) => {
      if (ONE_WAY_TILES.includes(tile.index as (typeof ONE_WAY_TILES)[number])) {
        tile.setCollision(false, false, true, false);
      }
    });

    for (const p of level.props) this.addProp(p, level.surfaceY(p.tx));

    this.player = new Player(
      this,
      PLAYER_SPAWN_COL * TILE_SIZE + TILE_SIZE / 2,
      level.surfaceY(PLAYER_SPAWN_COL),
    );
    this.player.setDepth(20);
    this.lastGroundY = this.player.y;
    this.playerShadow = this.addShadow(this.player.x, this.player.y, 26, 19);
    this.physics.add.collider(this.player, layer);

    for (const def of NPCS) {
      const npc = new NPC(this, def, level.surfaceY(def.tx));
      this.npcs.push(npc);
      this.addShadow(npc.x, npc.y, 24, 9);
      // A marker over every villager, not just the nearest one, so you can see
      // who is left to meet from across the screen.
      this.emotes.set(
        npc,
        this.add.image(npc.x, npc.y - npc.displayHeight - 10, 'emote-talk').setDepth(60),
      );
      this.physics.add.collider(this.player, npc);
      npc.setInteractive({ useHandCursor: true });
      npc.on('pointerdown', () => this.tryInteract(npc));
    }

    // heart pickups
    const hearts = this.physics.add.staticGroup();
    for (const h of level.hearts) {
      const s = hearts.create(
        h.tx * TILE_SIZE + TILE_SIZE / 2,
        h.ty * TILE_SIZE + TILE_SIZE / 2,
        'heart',
      ) as Phaser.Physics.Arcade.Sprite;
      s.setDepth(8);
      this.tweens.add({
        targets: s,
        y: s.y - 5,
        duration: 700 + Math.random() * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        onUpdate: () => (s.body as Phaser.Physics.Arcade.StaticBody)?.updateFromGameObject(),
      });
    }
    this.physics.add.overlap(this.player, hearts, (_p, heart) => {
      this.collectHeart(heart as Phaser.Physics.Arcade.Sprite);
    });

    for (const dec of level.decor) {
      const sprite = this.add
        .image(dec.tx * TILE_SIZE + TILE_SIZE / 2, (dec.ty + 1) * TILE_SIZE, dec.kind)
        .setOrigin(0.5, 1)
        .setDepth(dec.kind === 'flowers' ? 7 : 1);
      this.decor.push({ sprite, phase: dec.tx * 0.7 });
    }
    this.placeCouple(level);
    this.placeShopkeeper(level);
    this.spawnButterflies(level.decor);
    this.time.addEvent({ delay: 9000, loop: true, callback: () => this.releaseBirds() });
    this.releaseBirds();
    this.createAmbientParticles();

    this.indicator = this.add.image(0, 0, 'heart').setVisible(false).setDepth(100);

    const cam = this.cameras.main;
    // The global colour grade runs as a camera post-effect rather than a
    // screen-space quad: a scroll-fixed quad is still scaled by camera zoom, so
    // it covers only part of the viewport. A colour matrix grades the finished
    // frame, so it can't fall out of alignment. (WebGL only; on a Canvas
    // fallback the per-band tints still carry the time of day.)
    this.grade = cam.postFX?.addColorMatrix() ?? null;
    cam.setBounds(0, -2000, levelW, 2000 + levelH); // generous sky above
    cam.startFollow(this.player, true, 0.15, 0.12);
    const applyZoom = () => {
      // Integer zoom keeps the pixel art crisp. Pick the one that shows about
      // TARGET_VIEW_H of world vertically, but never so much that the view
      // gets narrower than MIN_VIEW_W (which happens on phones held upright).
      const TARGET_VIEW_H = 260;
      const MIN_VIEW_W = 300;
      const { width, height } = this.scale;
      const zoom = Phaser.Math.Clamp(
        Math.min(Math.round(height / TARGET_VIEW_H), Math.max(1, Math.floor(width / MIN_VIEW_W))),
        1,
        3,
      );
      cam.setZoom(zoom);
      // Sit the player ~70% down the frame: sky and hills above, road and
      // fence below — the framing the reference art leans on.
      cam.setFollowOffset(0, cam.displayHeight * 0.2);
      cam.setDeadzone(cam.displayWidth * 0.14, cam.displayHeight * 0.22);
      this.layoutBackground();
    };
    applyZoom();
    this.scale.on('resize', applyZoom);

    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = kb.addKeys('W,A,S,D') as WorldScene['wasd'];
    kb.on('keydown-E', () => this.onAction());
    kb.on('keydown-ENTER', () => this.onAction());
    // Space & Up jump — but they advance dialogue when it's open
    const jumpOrAdvance = () => {
      if (this.uiOpen) this.onAction();
      else if (this.player.jump()) this.puffDust(this.player.x, this.player.y);
    };
    kb.on('keydown-SPACE', jumpOrAdvance);
    kb.on('keydown-UP', jumpOrAdvance);
    kb.on('keydown-W', jumpOrAdvance);

    this.hud = new Hud();
    this.hud.setProgress(0, NPCS.length);
    this.hud.showToast('Head right! Your neighbors have wedding news 💬 →');
    if (isTouchDevice() && this.scale.height > this.scale.width) {
      this.time.delayedCall(4000, () =>
        this.hud.showToast('Tip: rotate your phone for the best view 📱↻'),
      );
    }
    this.touch = new TouchControls(
      () => {
        if (!this.uiOpen && this.player.jump()) this.puffDust(this.player.x, this.player.y);
      },
      () => this.onAction(),
    );

    // Debug/test hook (also handy in the browser console on previews)
    (window as unknown as Record<string, unknown>).__wq = {
      player: () => ({ x: this.player.x, y: this.player.y }),
      visited: () => this.visitedCount(),
      hearts: () => this.heartCount,
      gift: () => this.gift?.id ?? null,
      /** Test hook: the stall needs hearts, and platforming for them in a
       *  headless browser is slow and beside the point. */
      giveHearts: (n: number) => {
        this.heartCount += n;
        this.hud.setHearts(this.heartCount);
        return this.heartCount;
      },
      mood: () => ({
        progress: +(this.player.x / this.levelWidth).toFixed(3),
        sky: this.mood?.sky.toString(16),
        grade: this.mood?.grade.toString(16),
        glowAlpha: this.mood?.glowAlpha,
        lightsOn: this.mood?.lightsOn,
      }),
      emotes: () =>
        [...this.emotes].map(([n, e]) => ({
          npc: n.def.id,
          tex: e.texture.key,
          x: Math.round(e.x),
          y: Math.round(e.y),
          depth: e.depth,
        })),
      bg: () =>
        this.bgLayers.map((l) => ({
          key: l.sprite.texture.key,
          x: l.sprite.x,
          y: l.sprite.y,
          w: l.sprite.width,
          h: l.sprite.height,
          depth: l.sprite.depth,
          visible: l.sprite.visible,
        })),
    };

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.dialogue.destroy();
      this.invitation.destroy();
      this.hud.destroy();
      this.touch.destroy();
      this.scale.off('resize', applyZoom);
    });
  }

  // ---------------------------------------------------------------- background
  // Parallax layers are plain world objects re-anchored to the camera's
  // worldView every frame (robust under zoom, unlike scrollFactor tricks),
  // oversized by a margin so the one-frame follow lag never shows an edge.
  //
  // Each band is anchored by its *ridge line* — the y inside the art where its
  // horizon sits — placed at a fraction of the view height, so the horizon
  // stack holds together at any zoom or aspect ratio. `fg-grass` uses a factor
  // above 1 so it slides past faster than the world: the foreground depth cue.
  // It is kept low on purpose (see the generator) — the depth comes from the
  // speed it passes at, not from height, and anything taller hides the road.
  private static readonly BG_MARGIN = 64;

  private static readonly LAYERS: Array<{
    key: string;
    factor: number;
    depth: number;
    fill?: boolean;
    ridgeY?: number;
    frac?: number;
    /** px of self-motion per ms, on top of parallax */
    drift?: number;
  }> = [
    { key: 'bg-sky', factor: 0.05, depth: -5, fill: true },
    { key: 'bg-sky-dusk', factor: 0.05, depth: -4, fill: true },
    { key: 'bg-clouds', factor: 0.09, depth: -3.5, ridgeY: 0, frac: 0.02, drift: 0.0026 },
    { key: 'bg-mountains', factor: 0.15, depth: -3, ridgeY: 72, frac: 0.38 },
    { key: 'bg-hills', factor: 0.28, depth: -2, ridgeY: 62, frac: 0.5 },
    { key: 'bg-hedge', factor: 0.45, depth: -1, ridgeY: 40, frac: 0.61 },
    // ridgeY matches FG_RIDGE_Y in scripts/gen_placeholder_assets.py
    { key: 'fg-grass', factor: 1.25, depth: 40, ridgeY: 28, frac: 0.9 },
  ];

  private createBackground(): void {
    for (const def of WorldScene.LAYERS) {
      const sprite = this.add.tileSprite(0, 0, 8, 8, def.key).setOrigin(0, 0).setDepth(def.depth);
      // TileSprites swap in an internal cloned texture, so capture the
      // source image height of the *loaded* texture up front.
      sprite.setData('texH', this.textures.get(def.key).getSourceImage().height);
      sprite.setData('def', def);
      this.bgLayers.push({ sprite, factor: def.factor });
    }
  }

  private layoutBackground(): void {
    const cam = this.cameras.main;
    const m = WorldScene.BG_MARGIN;
    const w = Math.ceil(cam.displayWidth) + m * 2;
    for (const { sprite } of this.bgLayers) {
      const def = sprite.getData('def') as (typeof WorldScene.LAYERS)[number];
      const texH = sprite.getData('texH') as number;
      sprite.setSize(w, def.fill ? Math.min(texH, Math.ceil(cam.displayHeight) + m * 2) : texH);
    }
    this.updateBackground();
  }

  private updateBackground(): void {
    const view = this.cameras.main.worldView;
    const m = WorldScene.BG_MARGIN;
    for (const { sprite, factor } of this.bgLayers) {
      const def = sprite.getData('def') as (typeof WorldScene.LAYERS)[number];
      const y = def.fill ? view.y - m : view.y + view.height * def.frac! - def.ridgeY!;
      sprite.setPosition(view.x - m, y);
      sprite.tilePositionX = view.x * factor + (def.drift ? this.time.now * def.drift : 0);
    }
  }

  // ---------------------------------------------------------------- daylight
  private updateDaylight(): void {
    const mood = moodAt(this.player.x / this.levelWidth);
    this.mood = mood;
    for (const { sprite } of this.bgLayers) {
      const key = sprite.getData('def').key as string;
      sprite.setTint(moodTintFor(mood, key));
      if (key === 'bg-sky-dusk') sprite.setAlpha(mood.duskBlend);
    }
    // 4x5 colour matrix: multiply each channel by the grade colour, then lift
    // the warm channels by the bloom amount so golden hour actually glows
    // rather than just going orange.
    const r = ((mood.grade >> 16) & 0xff) / 255;
    const g = ((mood.grade >> 8) & 0xff) / 255;
    const b = (mood.grade & 0xff) / 255;
    const bloom = mood.glowAlpha;
    for (const glow of this.lampGlows) glow.setAlpha(mood.lightsOn * 0.75);
    if (!this.grade) return;
    this.grade.set([
      r, 0, 0, 0, bloom * 0.18,
      0, g, 0, 0, bloom * 0.09,
      0, 0, b, 0, bloom * 0.02,
      0, 0, 0, 1, 0,
    ]);
  }

  /** Butterflies hang around the flower patches rather than wandering the level. */
  private spawnButterflies(decor: ParsedLevel['decor']): void {
    const patches = decor.filter((d) => d.kind === 'flowers');
    for (let i = 0; i < patches.length; i += 4) {
      const patch = patches[i];
      const x = patch.tx * TILE_SIZE + TILE_SIZE / 2;
      const y = (patch.ty + 1) * TILE_SIZE - 18;
      const b = this.add.sprite(x, y, 'butterfly').setDepth(9).play('butterfly-flit');
      this.tweens.add({
        targets: b,
        x: x + Phaser.Math.Between(-26, 26),
        y: y - Phaser.Math.Between(6, 22),
        duration: Phaser.Math.Between(1800, 3200),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 1500),
      });
    }
  }

  /** A flock crosses the sky every so often, ahead of wherever you are. */
  private releaseBirds(): void {
    const view = this.cameras.main.worldView;
    const startX = view.x - 60;
    const y = view.y + view.height * Phaser.Math.FloatBetween(0.1, 0.34);
    const count = Phaser.Math.Between(3, 6);
    for (let i = 0; i < count; i++) {
      const bird = this.add
        .sprite(startX - i * 18, y + (i % 3) * 9, 'bird')
        .setDepth(-2)
        .setScale(Phaser.Math.FloatBetween(0.8, 1.2))
        .play('bird-fly');
      this.tweens.add({
        targets: bird,
        x: startX + view.width + 160,
        y: bird.y - Phaser.Math.Between(10, 40),
        duration: Phaser.Math.Between(9000, 14000),
        onComplete: () => bird.destroy(),
      });
    }
  }

  /** Pollen everywhere, petals thickening as the mandap gets closer. */
  private createAmbientParticles(): void {
    // The zone reads the camera at emit time, so ambience is always on screen
    // and never wasted off in the level somewhere.
    const zone = new Phaser.GameObjects.Particles.Zones.RandomZone({
      getRandomPoint: (point: Phaser.Types.Math.Vector2Like) => {
        const v = this.cameras.main.worldView;
        point.x = Phaser.Math.Between(v.x - 30, v.x + v.width + 30);
        point.y = Phaser.Math.Between(v.y - 40, v.y + v.height * 0.75);
        return point;
      },
    });

    this.motes = this.add.particles(0, 0, 'mote', {
      speedX: { min: -6, max: 10 },
      speedY: { min: -14, max: -3 },
      lifespan: 5200,
      quantity: 1,
      frequency: 260,
      alpha: { start: 0.85, end: 0 },
      scale: { min: 0.6, max: 1.3 },
      emitZone: zone,
    });
    this.motes.setDepth(12);

    this.petals = this.add.particles(0, 0, 'petal', {
      speedX: { min: -20, max: -4 },
      speedY: { min: 10, max: 26 },
      lifespan: 6200,
      quantity: 1,
      frequency: 420,
      rotate: { start: 0, end: 320 },
      alpha: { start: 0.95, end: 0.25 },
      scale: { min: 0.7, max: 1.15 },
      emitZone: zone,
    });
    this.petals.setDepth(13);
  }

  private updateParticles(): void {
    // Petals are a wedding thing: barely there at the start, a drift by the end.
    const nearness = Phaser.Math.Clamp((this.player.x / this.levelWidth - 0.35) / 0.65, 0, 1);
    this.petals?.setFrequency(Phaser.Math.Linear(1400, 150, nearness));
  }

  private updateDecor(): void {
    // one shared sine keeps the whole meadow moving together, like wind
    const t = this.time.now / 620;
    for (const { sprite, phase } of this.decor) {
      sprite.rotation = Math.sin(t + phase) * 0.055;
    }
  }

  private updateEmotes(): void {
    const bob = Math.sin(this.time.now / 420) * 2;
    for (const [npc, emote] of this.emotes) {
      emote.setTexture(npc.visited ? 'emote-done' : 'emote-talk');
      emote.setPosition(npc.x, npc.y - npc.displayHeight - 10 + bob);
    }
  }

  private puffDust(x: number, y: number): void {
    for (const dir of [-1, 1]) {
      const puff = this.add.image(x + dir * 4, y - 2, 'dust').setDepth(18).setScale(0.7);
      this.tweens.add({
        targets: puff,
        x: puff.x + dir * 12,
        y: puff.y - 4,
        alpha: 0,
        scale: 1.25,
        duration: 320,
        ease: 'Quad.easeOut',
        onComplete: () => puff.destroy(),
      });
    }
  }

  private updateShadow(): void {
    if (this.player.onGround) this.lastGroundY = this.player.y;
    const height = Math.max(0, this.lastGroundY - this.player.y);
    const k = 1 - Math.min(1, height / SHADOW_FADE_HEIGHT) * 0.6;
    this.playerShadow.setPosition(this.player.x, this.lastGroundY);
    this.playerShadow.setDisplaySize(26 * k, 26 * 0.36 * k);
    this.playerShadow.setAlpha(SHADOW_ALPHA * k);
  }

  // ---------------------------------------------------------------- props
  private static readonly PROP_DEPTH: Record<PropType, number> = {
    kolam: 0.4, // painted on the road itself
    pole: 1,
    maypole: 1,
    tree: 2,
    birch: 2,
    cottage: 2,
    mandap: 3,
    banana: 5,
    bush: 6,
    rock: 6,
    cart: 6,
    sign: 6,
    lamp: 6,
    dalahorse: 6,
    toran: 6,
    garland: 6,
    meadow: 7,
  };

  /** Props that don't simply stand on the ground: [originY, y offset]. */
  private static readonly PROP_ANCHOR: Partial<Record<PropType, [number, number]>> = {
    kolam: [0, 3], // lies flat on the road just below the grass line
    garland: [0, -134], // strung overhead between the poles
    toran: [0, -74], // strung along the cottage eaves, above the door
  };

  /** Soft contact shadow. Without one, sprites read as stickers on the road. */
  private addShadow(x: number, y: number, width: number, depth: number): Phaser.GameObjects.Image {
    const s = this.add.image(x, y, 'shadow').setDepth(depth).setAlpha(SHADOW_ALPHA);
    s.setDisplaySize(width, width * 0.36);
    return s;
  }

  private addProp(p: PropDef, surfaceY: number): void {
    const x = p.tx * TILE_SIZE + TILE_SIZE / 2;
    const depth = WorldScene.PROP_DEPTH[p.type];
    const [originY, dy] = WorldScene.PROP_ANCHOR[p.type] ?? [1, 0];
    const img = this.add.image(x, surfaceY + dy, p.type).setOrigin(0.5, originY).setDepth(depth);

    // Lamps carry a halo that fades up with the evening.
    if (p.type === 'lamp') {
      this.lampGlows.push(
        this.add
          .image(x, surfaceY - img.height * 0.72, 'glow')
          .setDepth(depth - 0.1)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setAlpha(0),
      );
    }

    // Narrow-footed props cast a shadow the width of their base, not their art.
    const footprint: Partial<Record<PropType, number>> = {
      tree: 30,
      birch: 26,
      pole: 26,
      maypole: 24,
      cottage: 108,
      mandap: 128,
      banana: 26,
      sign: 26,
      cart: 64,
      bush: 46,
      rock: 34,
      lamp: 26,
      dalahorse: 40,
    };
    const w = footprint[p.type];
    if (w) this.addShadow(x, surfaceY, w, Math.max(0.5, depth - 0.5));
  }

  // ---------------------------------------------------------------- hearts
  private collectHeart(heart: Phaser.Physics.Arcade.Sprite): void {
    if (!heart.active) return;
    heart.disableBody(true, false);
    this.heartCount++;
    this.hud.setHearts(this.heartCount);
    this.tweens.add({
      targets: heart,
      y: heart.y - 24,
      alpha: 0,
      scale: 1.6,
      duration: 350,
      onComplete: () => heart.destroy(),
    });
  }

  // ---------------------------------------------------------------- interaction
  private get uiOpen(): boolean {
    return this.dialogue.isOpen || this.invitation.isOpen || this.shop.isOpen;
  }

  private visitedCount(): number {
    return this.npcs.filter((n) => n.visited).length;
  }

  /**
   * Nearest of everything you can talk to, compared on one footing. Preferring
   * villagers as a class meant a villager 30px away beat the stallholder 23px
   * away, and the stall could not be opened at all.
   */
  private nearestInteractable(): NPC | 'couple' | 'shop' | undefined {
    let best: NPC | 'couple' | 'shop' | undefined;
    let bestDist = INTERACT_RANGE;
    const consider = (candidate: NPC | 'couple' | 'shop', x: number, y: number) => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
      if (d < bestDist) {
        bestDist = d;
        best = candidate;
      }
    };
    for (const npc of this.npcs) consider(npc, npc.x, npc.y);
    consider('couple', this.couple.x + 13, this.couple.y);
    consider('shop', this.shopkeeper.x, this.shopkeeper.y);
    return best;
  }

  private onAction(): void {
    if (this.invitation.isOpen) return;
    if (this.dialogue.isOpen) {
      this.dialogue.advance();
      return;
    }
    const target = this.nearestInteractable();
    if (target === 'couple') this.meetCouple();
    else if (target === 'shop') this.openShop();
    else if (target) this.tryInteract(target);
  }

  /** Every conversation goes through here so the HUD parks itself consistently. */
  private say(name: string, pages: string[], role?: string, onClose?: () => void): void {
    this.hud.setHidden(true);
    this.dialogue.show(
      name,
      pages,
      () => {
        this.hud.setHidden(false);
        onClose?.();
      },
      role,
    );
  }

  private tryInteract(npc: NPC): void {
    if (this.uiOpen) return;
    const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
    if (d > INTERACT_RANGE * 1.5) return;
    this.player.halt();
    npc.faceTowards(this.player.x);
    this.say(npc.def.name, npc.def.pages, npc.def.role, () => {
      if (npc.visited) return;
      npc.visited = true;
      npc.makePassable();
      this.hud.setProgress(this.visitedCount(), this.npcs.length);
      this.checkCompletion();
    });
  }

  /** Stand the couple in the middle of the mandap's flowers. */
  private placeCouple(level: ParsedLevel): void {
    const mandap = level.props.find((p) => p.type === 'mandap')!;
    const cx = mandap.tx * TILE_SIZE + TILE_SIZE / 2;
    const y = level.surfaceY(mandap.tx);
    const groom = this.add.sprite(cx - 13, y, 'char-groom').setOrigin(0.5, 1).setDepth(11);
    const bride = this.add.sprite(cx + 13, y, 'char-bride').setOrigin(0.5, 1).setDepth(11);
    groom.play('char-groom-idle');
    bride.play('char-bride-idle');
    bride.setFlipX(true); // turned toward each other
    this.addShadow(cx - 13, y, 24, 10);
    this.addShadow(cx + 13, y, 24, 10);
    this.couple = groom;
  }

  private placeShopkeeper(level: ParsedLevel): void {
    const cart = level.props.find((p) => p.type === 'cart')!;
    const x = cart.tx * TILE_SIZE + TILE_SIZE / 2 - 46; // clear of the villager beside the cart
    const y = level.surfaceY(cart.tx);
    this.shopkeeper = this.add
      .sprite(x, y, 'char-npc-baker')
      .setOrigin(0.5, 1)
      .setDepth(10)
      .setFlipX(true);
    this.shopkeeper.play('char-npc-baker-idle');
    this.addShadow(x, y, 24, 9);
    this.add.image(x, y - 52, 'emote-talk').setDepth(60);
  }

  private openShop(): void {
    if (this.uiOpen) return;
    this.player.halt();
    if (this.gift) {
      this.say(SHOP.keeper, SHOP.alreadyBought(this.gift.label), SHOP.role);
      return;
    }
    const cheapest = Math.min(...SHOP.gifts.map((g) => g.price));
    if (this.heartCount < cheapest) {
      this.say(SHOP.keeper, this.shopGreeted ? SHOP.broke : [...SHOP.intro, ...SHOP.broke], SHOP.role);
      this.shopGreeted = true;
      return;
    }
    const pages = this.shopGreeted ? [SHOP.intro[1]] : SHOP.intro;
    this.shopGreeted = true;
    this.say(SHOP.keeper, pages, SHOP.role, () => {
      this.hud.setHidden(true);
      this.shop.show(
        SHOP.gifts,
        this.heartCount,
        (gift) => {
          this.gift = gift;
          this.heartCount -= gift.price;
          this.hud.setHearts(this.heartCount);
          this.hud.setGift(gift.label);
          this.hud.setHidden(false);
          this.hud.showToast(`You bought ${gift.label} 🎁`);
        },
        () => this.hud.setHidden(false),
      );
    });
  }

  private meetCouple(): void {
    if (this.uiOpen) return;
    this.player.halt();
    if (this.visitedCount() < this.npcs.length) {
      this.say(COUPLE_SCENE.name, COUPLE_SCENE.waiting, COUPLE_SCENE.role);
      return;
    }
    if (this.metCouple) {
      // already had the moment — just hand the invitation back
      this.invitation.show(INVITATION_LINES);
      return;
    }
    const pages = [
      ...COUPLE_SCENE.greeting,
      ...(this.gift ? [COUPLE_SCENE.giftLine(this.gift.label)] : []),
      ...COUPLE_SCENE.finale,
    ];
    this.say(COUPLE_SCENE.name, pages, COUPLE_SCENE.role, () => {
      this.metCouple = true;
      this.celebrate();
      this.invitation.show(INVITATION_LINES);
    });
  }

  /** Fireworks over the mandap once the invitation is earned. */
  private celebrate(): void {
    const cam = this.cameras.main;
    let launched = 0;
    this.time.addEvent({
      delay: 620,
      repeat: 11,
      callback: () => {
        const view = cam.worldView;
        const x = view.x + Phaser.Math.Between(60, Math.max(80, view.width - 60));
        const peak = view.y + view.height * Phaser.Math.FloatBetween(0.12, 0.38);
        const colour = [0xffd76b, 0xf28bb4, 0xf5a623, 0xfdf9f0, 0x9ad0f5][launched++ % 5];

        const rocket = this.add
          .image(x, view.y + view.height * 0.72, 'spark')
          .setDepth(95)
          .setTint(colour)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setScale(1.4);
        this.tweens.add({
          targets: rocket,
          y: peak,
          duration: 620,
          ease: 'Quad.easeOut',
          onComplete: () => {
            rocket.destroy();
            const burst = this.add.particles(x, peak, 'spark', {
              speed: { min: 40, max: 165 },
              angle: { min: 0, max: 360 },
              lifespan: { min: 700, max: 1400 },
              gravityY: 70,
              quantity: 34,
              scale: { start: 1.5, end: 0 },
              alpha: { start: 1, end: 0 },
              tint: colour,
              blendMode: Phaser.BlendModes.ADD,
              emitting: false,
            });
            burst.setDepth(95);
            burst.explode(34);
            this.time.delayedCall(1600, () => burst.destroy());
          },
        });
      },
    });
  }

  private checkCompletion(): void {
    if (this.celebrated || this.visitedCount() < this.npcs.length) return;
    this.celebrated = true;
    this.hud.showToast('✨ You met everyone! They are waiting under the mandap → ✨', 6000);
    this.add
      .particles(this.couple.x + 13, this.couple.y - 46, 'heart', {
        speed: { min: 20, max: 55 },
        lifespan: 1800,
        quantity: 1,
        frequency: 150,
        scale: { start: 0.8, end: 0 },
        gravityY: -30,
      })
      .setDepth(90);
  }

  // ---------------------------------------------------------------- loop
  update(): void {
    this.updateBackground();
    this.updateDaylight();
    this.updateShadow();

    if (this.uiOpen) {
      this.player.halt();
      this.indicator.setVisible(false);
      this.touch?.setActionVisible(false);
      return;
    }

    let dir = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown || this.touch?.state.left) dir = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown || this.touch?.state.right) dir = 1;
    this.player.moveWith(dir);

    // NPCs are solid so you stop beside them rather than standing inside them.
    // First time someone pushes against one, teach the hop.
    const touching = this.player.body as Phaser.Physics.Arcade.Body;
    if (dir !== 0 && (touching.touching.left || touching.touching.right)) {
      if (!this.hintedJump && ++this.blockedFrames > 40) {
        this.hintedJump = true;
        this.hud.showToast('Hop over with Space / ⤒');
      }
    } else {
      this.blockedFrames = 0;
    }

    // landing: squash and kick up dust
    if (this.player.onGround && !this.wasOnGround) {
      this.player.squash();
      this.puffDust(this.player.x, this.player.y);
    }
    this.wasOnGround = this.player.onGround;

    this.updateEmotes();
    this.updateDecor();
    this.updateParticles();

    const target = this.nearestInteractable();
    this.touch?.setActionVisible(!!target);
    // Villagers and the stall carry their own over-head emotes; the floating
    // heart is reserved for the couple at the end.
    if (target === 'couple') {
      const bob = Math.sin(this.time.now / 220) * 3;
      this.indicator.setVisible(true);
      this.indicator.setPosition(
        this.couple.x + 13,
        this.couple.y - this.couple.displayHeight - 14 + bob,
      );
    } else {
      this.indicator.setVisible(false);
    }
  }
}
