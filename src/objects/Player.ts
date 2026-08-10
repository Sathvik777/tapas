import Phaser from 'phaser';

const SPEED = 90;

export type Facing = 'down' | 'left' | 'right' | 'up';

export class Player extends Phaser.Physics.Arcade.Sprite {
  facing: Facing = 'down';
  private spriteKey: string;

  // spriteKey is a parameter so the future character-select stage
  // (groom vs bride) only needs to pass 'char-bride' here.
  constructor(scene: Phaser.Scene, x: number, y: number, spriteKey = 'char-groom') {
    super(scene, x, y, spriteKey, 0);
    this.spriteKey = spriteKey;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.body!.setSize(10, 8);
    this.body!.setOffset(3, 12);
    this.setCollideWorldBounds(true);
  }

  /** vx/vy are a normalized input vector (-1..1). */
  moveWith(vx: number, vy: number): void {
    this.setVelocity(vx * SPEED, vy * SPEED);
    if (vx !== 0 || vy !== 0) {
      this.facing =
        Math.abs(vx) >= Math.abs(vy) ? (vx < 0 ? 'left' : 'right') : vy < 0 ? 'up' : 'down';
      this.anims.play(`${this.spriteKey}-walk-${this.facing}`, true);
    } else {
      this.anims.play(`${this.spriteKey}-idle-${this.facing}`, true);
    }
    this.setDepth(this.y);
  }

  halt(): void {
    this.setVelocity(0, 0);
    this.anims.play(`${this.spriteKey}-idle-${this.facing}`, true);
  }
}
