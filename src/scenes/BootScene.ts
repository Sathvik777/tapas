import Phaser from 'phaser';

const CHAR_SHEETS = [
  'char-groom',
  'char-bride',
  'char-npc-elder',
  'char-npc-baker',
  'char-npc-florist',
  'char-npc-musician',
  'char-npc-kid',
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload(): void {
    const { width, height } = this.scale;
    const bar = this.add.rectangle(width / 2, height / 2, 4, 8, 0xf28bb4);
    this.load.on('progress', (p: number) => {
      bar.width = Math.max(4, 160 * p);
    });

    this.load.image('tiles', 'assets/tiles.png');
    for (const bg of ['bg-sky', 'bg-mountains', 'bg-hills', 'bg-hedge', 'fg-fence']) {
      this.load.image(bg, `assets/${bg}.png`);
    }
    for (const prop of [
      'tree',
      'house',
      'arch',
      'signpost',
      'cart',
      'sign',
      'rock',
      'bush',
      'pole',
      'heart',
    ]) {
      this.load.image(prop, `assets/${prop}.png`);
    }
    for (const key of CHAR_SHEETS) {
      this.load.spritesheet(key, `assets/${key}.png`, { frameWidth: 32, frameHeight: 40 });
    }
  }

  create(): void {
    // Frames per sheet (facing right; left is flipX): 0 idle, 1-3 walk, 4 jump.
    for (const key of CHAR_SHEETS) {
      this.anims.create({
        key: `${key}-walk`,
        frames: this.anims.generateFrameNumbers(key, { frames: [1, 2, 3, 2] }),
        frameRate: 10,
        repeat: -1,
      });
    }
    this.scene.start('title');
  }
}
