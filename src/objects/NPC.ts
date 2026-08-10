import Phaser from 'phaser';
import type { NpcDef } from '../content/wedding';
import { TILE_SIZE } from '../world/map';

export class NPC extends Phaser.Physics.Arcade.Sprite {
  readonly def: NpcDef;
  visited = false;

  constructor(scene: Phaser.Scene, def: NpcDef) {
    const x = def.tx * TILE_SIZE + TILE_SIZE / 2;
    const y = def.ty * TILE_SIZE + TILE_SIZE;
    super(scene, x, y, def.sprite, 0);
    this.def = def;
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0.5, 1);
    (this.body as Phaser.Physics.Arcade.StaticBody).setSize(12, 10);
    (this.body as Phaser.Physics.Arcade.StaticBody).setOffset(2, 10);
    this.setDepth(y);

    // gentle idle bob so the village feels alive
    scene.tweens.add({
      targets: this,
      scaleY: { from: 1, to: 0.97 },
      duration: 900 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** Turn to face the player when spoken to. */
  faceTowards(x: number): void {
    const dx = x - this.x;
    if (Math.abs(dx) > 6) {
      this.setFrame(dx < 0 ? 3 : 6);
    } else {
      this.setFrame(0);
    }
  }
}
