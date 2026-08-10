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
    this.load.image('tree', 'assets/tree.png');
    this.load.image('house', 'assets/house.png');
    this.load.image('arch', 'assets/arch.png');
    this.load.image('signpost', 'assets/signpost.png');
    this.load.image('heart', 'assets/heart.png');
    for (const key of CHAR_SHEETS) {
      this.load.spritesheet(key, `assets/${key}.png`, { frameWidth: 16, frameHeight: 20 });
    }
  }

  create(): void {
    // Frames are laid out in rows of 3: down, left, right, up.
    for (const key of CHAR_SHEETS) {
      const dirs = ['down', 'left', 'right', 'up'];
      dirs.forEach((dir, row) => {
        const base = row * 3;
        this.anims.create({
          key: `${key}-walk-${dir}`,
          frames: this.anims.generateFrameNumbers(key, { frames: [base + 1, base, base + 2, base] }),
          frameRate: 8,
          repeat: -1,
        });
        this.anims.create({
          key: `${key}-idle-${dir}`,
          frames: [{ key, frame: base }],
        });
      });
    }
    this.scene.start('title');
  }
}
