import Phaser from 'phaser';
import type { NpcDef } from '../content/wedding';
import { TILE_SIZE } from '../world/level';

export class NPC extends Phaser.Physics.Arcade.Sprite {
  readonly def: NpcDef;
  visited = false;

  constructor(scene: Phaser.Scene, def: NpcDef, surfaceY: number) {
    const x = def.tx * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, surfaceY, def.sprite, 0);
    this.def = def;
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0.5, 1);
    this.setDepth(10);
    // Wide enough that the player halts clear of the sprite rather than
    // standing inside it, still trivial to hop over.
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(26, 30);
    body.setOffset(7, 10); // art is centred in a 40px frame

    this.play(`${def.sprite}-idle`);

    // gentle idle bob so the world feels alive
    scene.tweens.add({
      targets: this,
      scaleY: { from: 1, to: 0.97 },
      duration: 900 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Once you have spoken to someone they stop blocking the road: they are there
   * to be noticed, and having to hop over the same grandmother on every pass
   * gets old quickly.
   */
  makePassable(): void {
    const body = this.body as Phaser.Physics.Arcade.StaticBody | null;
    if (body) body.enable = false;
  }

  /** Turn to face the player when spoken to (sprites face right by default). */
  faceTowards(x: number): void {
    this.setFlipX(x < this.x);
  }
}
