import Phaser from 'phaser';

const SPEED = 160;
const JUMP_VELOCITY = 400;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private spriteKey: string;

  // spriteKey is a parameter so the future character-select stage
  // (groom vs bride) only needs to pass 'char-bride' here.
  constructor(scene: Phaser.Scene, x: number, y: number, spriteKey = 'char-groom') {
    super(scene, x, y, spriteKey, 0);
    this.spriteKey = spriteKey;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.body!.setSize(16, 34);
    this.body!.setOffset(8, 6);
    this.setCollideWorldBounds(true);
  }

  get onGround(): boolean {
    return (this.body as Phaser.Physics.Arcade.Body).blocked.down;
  }

  /** dir: -1 left, 0 stop, 1 right. */
  moveWith(dir: number): void {
    this.setVelocityX(dir * SPEED);
    if (dir !== 0) this.setFlipX(dir < 0);

    if (!this.onGround) {
      this.anims.stop();
      this.setFrame(4); // jump pose
    } else if (dir !== 0) {
      this.anims.play(`${this.spriteKey}-walk`, true);
    } else {
      this.anims.stop();
      this.setFrame(0);
    }
  }

  jump(): boolean {
    if (!this.onGround) return false;
    this.setVelocityY(-JUMP_VELOCITY);
    return true;
  }

  halt(): void {
    this.setVelocityX(0);
    if (this.onGround) {
      this.anims.stop();
      this.setFrame(0);
    }
  }
}
