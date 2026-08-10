import Phaser from 'phaser';
import { INVITATION_LINES, NPCS, SIGNPOST } from '../content/wedding';
import { NPC } from '../objects/NPC';
import { Player } from '../objects/Player';
import { DialogueBox } from '../ui/DialogueBox';
import { Hud } from '../ui/Hud';
import { InvitationCard } from '../ui/InvitationCard';
import { TouchControls } from '../ui/TouchControls';
import { parseMap, SOLID_TILES, TILE_SIZE, type PropDef } from '../world/map';

const INTERACT_RANGE = 26;

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private npcs: NPC[] = [];
  private signpost!: Phaser.GameObjects.Image;
  private indicator!: Phaser.GameObjects.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private dialogue = new DialogueBox();
  private invitation = new InvitationCard();
  private hud!: Hud;
  private touch!: TouchControls;
  private celebrated = false;

  constructor() {
    super('world');
  }

  create(): void {
    const parsed = parseMap();
    const map = this.make.tilemap({
      data: parsed.data,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const tileset = map.addTilesetImage('tiles', 'tiles', TILE_SIZE, TILE_SIZE, 0, 0)!;
    const layer = map.createLayer(0, tileset, 0, 0)!;
    layer.setCollision(SOLID_TILES);

    const propBodies: Phaser.GameObjects.Rectangle[] = [];
    for (const p of parsed.props) this.addProp(propBodies, p);

    this.player = new Player(this, 14.5 * TILE_SIZE, 18.5 * TILE_SIZE);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.add.collider(this.player, layer);
    this.physics.add.collider(this.player, propBodies);

    for (const def of NPCS) {
      const npc = new NPC(this, def);
      this.npcs.push(npc);
      this.physics.add.collider(this.player, npc);
      npc.setInteractive({ useHandCursor: true });
      npc.on('pointerdown', () => this.tryInteract(npc));
    }

    this.indicator = this.add.image(0, 0, 'heart').setVisible(false).setDepth(100000);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    cam.startFollow(this.player, true, 0.12, 0.12);
    const applyZoom = () => {
      const minDim = Math.min(this.scale.width, this.scale.height);
      cam.setZoom(minDim >= 1200 ? 4 : 3);
    };
    applyZoom();
    this.scale.on('resize', applyZoom);

    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = kb.addKeys('W,A,S,D') as WorldScene['wasd'];
    kb.on('keydown-E', () => this.onAction());
    kb.on('keydown-SPACE', () => this.onAction());
    kb.on('keydown-ENTER', () => this.onAction());

    this.hud = new Hud();
    this.hud.setProgress(0, NPCS.length);
    this.hud.showToast('Explore the village — the neighbors have news for you! 💬');
    this.touch = new TouchControls(() => this.onAction());

    // Debug/test hook (also handy in the browser console on previews)
    (window as unknown as Record<string, unknown>).__wq = {
      player: () => ({ x: this.player.x, y: this.player.y }),
      visited: () => this.visitedCount(),
    };

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.dialogue.destroy();
      this.invitation.destroy();
      this.hud.destroy();
      this.touch.destroy();
      this.scale.off('resize', applyZoom);
    });
  }

  private addProp(bodies: Phaser.GameObjects.Rectangle[], p: PropDef): void {
    const x = p.tx * TILE_SIZE + TILE_SIZE / 2;
    const y = p.ty * TILE_SIZE + TILE_SIZE;
    const img = this.add.image(x, y, p.type).setOrigin(0.5, 1).setDepth(y);
    if (p.type === 'signpost') this.signpost = img;
    if (p.type === 'arch') return; // walk beneath the arch freely

    // Physics bodies hug the base of each prop so the player can walk "behind" them.
    const sizes: Record<PropDef['type'], [number, number]> = {
      tree: [12, 10],
      house: [60, 24],
      arch: [0, 0],
      signpost: [12, 6],
    };
    const [bw, bh] = sizes[p.type];
    const rect = this.add.rectangle(x, y - bh / 2, bw, bh).setVisible(false);
    this.physics.add.existing(rect, true);
    bodies.push(rect);
  }

  private get uiOpen(): boolean {
    return this.dialogue.isOpen || this.invitation.isOpen;
  }

  private visitedCount(): number {
    return this.npcs.filter((n) => n.visited).length;
  }

  private nearestInteractable(): NPC | 'signpost' | undefined {
    let best: NPC | undefined;
    let bestDist = INTERACT_RANGE;
    for (const npc of this.npcs) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (d < bestDist) {
        bestDist = d;
        best = npc;
      }
    }
    if (best) return best;
    const ds = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.signpost.x,
      this.signpost.y,
    );
    return ds < INTERACT_RANGE ? 'signpost' : undefined;
  }

  private onAction(): void {
    if (this.invitation.isOpen) return;
    if (this.dialogue.isOpen) {
      this.dialogue.advance();
      return;
    }
    const target = this.nearestInteractable();
    if (target === 'signpost') this.openSignpost();
    else if (target) this.tryInteract(target);
  }

  private tryInteract(npc: NPC): void {
    if (this.uiOpen) return;
    const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
    if (d > INTERACT_RANGE * 1.5) return;
    this.player.halt();
    npc.faceTowards(this.player.x);
    this.dialogue.show(npc.def.name, npc.def.pages, () => {
      npc.setFrame(0);
      if (!npc.visited) {
        npc.visited = true;
        this.hud.setProgress(this.visitedCount(), this.npcs.length);
        this.checkCompletion();
      }
    });
  }

  private openSignpost(): void {
    if (this.uiOpen) return;
    this.player.halt();
    const all = this.visitedCount() === this.npcs.length;
    if (!all) {
      this.dialogue.show('Signpost', SIGNPOST.locked);
      return;
    }
    this.dialogue.show('Signpost', SIGNPOST.unlockedIntro, () => {
      this.invitation.show(INVITATION_LINES);
    });
  }

  private checkCompletion(): void {
    if (this.celebrated || this.visitedCount() < this.npcs.length) return;
    this.celebrated = true;
    this.hud.showToast('✨ You met everyone! Read the signpost by the wedding arch. ✨', 6000);
    this.add.particles(this.signpost.x, this.signpost.y - 20, 'heart', {
      speed: { min: 15, max: 45 },
      lifespan: 1800,
      quantity: 1,
      frequency: 160,
      scale: { start: 1, end: 0 },
      gravityY: -25,
    });
  }

  update(): void {
    if (this.uiOpen) {
      this.player.halt();
      this.indicator.setVisible(false);
      return;
    }

    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -1;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = 1;
    if (vx === 0 && vy === 0 && this.touch) {
      vx = this.touch.vector.x;
      vy = this.touch.vector.y;
    }
    const len = Math.hypot(vx, vy);
    if (len > 1) {
      vx /= len;
      vy /= len;
    }
    this.player.moveWith(vx, vy);

    const target = this.nearestInteractable();
    if (target) {
      const obj = target === 'signpost' ? this.signpost : target;
      const bob = Math.sin(this.time.now / 220) * 2;
      this.indicator.setVisible(true);
      this.indicator.setPosition(obj.x, obj.y - obj.displayHeight - 6 + bob);
    } else {
      this.indicator.setVisible(false);
    }
  }
}
