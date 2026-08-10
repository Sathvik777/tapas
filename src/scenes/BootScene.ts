import Phaser from 'phaser';

const CHAR_SHEETS = [
  'char-groom',
  'char-bride',
  'char-npc-mormor',
  'char-npc-ammamma',
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
    for (const bg of [
      'bg-sky',
      'bg-sky-dusk',
      'bg-clouds',
      'bg-mountains',
      'bg-hills',
      'bg-hedge',
      'fg-fence',
    ]) {
      this.load.image(bg, `assets/${bg}.png`);
    }
    for (const prop of [
      'tree',
      'signpost',
      'cart',
      'sign',
      'rock',
      'bush',
      'pole',
      'heart',
      'glow',
      'cottage',
      'birch',
      'maypole',
      'dalahorse',
      'meadow',
      'mandap',
      'banana',
      'kolam',
      'lamp',
      'toran',
      'garland',
      'shadow',
      'emote-talk',
      'emote-done',
      'dust',
      'tuft',
      'flowers',
      'petal',
      'mote',
    ]) {
      this.load.image(prop, `assets/${prop}.png`);
    }
    for (const key of CHAR_SHEETS) {
      this.load.spritesheet(key, `assets/${key}.png`, { frameWidth: 40, frameHeight: 40 });
    }
    this.load.spritesheet('bird', 'assets/bird.png', { frameWidth: 16, frameHeight: 12 });
    this.load.spritesheet('butterfly', 'assets/butterfly.png', { frameWidth: 12, frameHeight: 10 });
  }

  create(): void {
    // Frames per sheet (facing right; left is flipX):
    // 0 idle, 1-3 walk, 4 jump, 5 blink.
    for (const key of CHAR_SHEETS) {
      this.anims.create({
        key: `${key}-walk`,
        frames: this.anims.generateFrameNumbers(key, { frames: [1, 2, 3, 2] }),
        frameRate: 10,
        repeat: -1,
      });
      // Standing still: hold frame 0, with an occasional blink.
      this.anims.create({
        key: `${key}-idle`,
        frames: [
          { key, frame: 0, duration: 2600 },
          { key, frame: 5, duration: 130 },
          { key, frame: 0, duration: 1700 },
          { key, frame: 5, duration: 120 },
        ],
        repeat: -1,
      });
    }
    this.anims.create({
      key: 'bird-fly',
      frames: this.anims.generateFrameNumbers('bird', { frames: [0, 1, 2, 1] }),
      frameRate: 9,
      repeat: -1,
    });
    this.anims.create({
      key: 'butterfly-flit',
      frames: this.anims.generateFrameNumbers('butterfly', { frames: [0, 1] }),
      frameRate: 11,
      repeat: -1,
    });

    this.scene.start('title');
  }
}
