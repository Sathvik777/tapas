import Phaser from 'phaser';
import { COUPLE } from '../content/wedding';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    const layout = () => {
      const { width, height } = this.scale;
      const cx = width / 2;
      this.children.removeAll(true);

      // Same ridge-anchored stack as the world, back to front.
      const sky = this.textures.get('bg-sky').getSourceImage();
      const skyScale = Math.max(width / sky.width, height / sky.height);
      this.add.tileSprite(0, 0, width, height, 'bg-sky').setOrigin(0, 0).setTileScale(skyScale);

      const band = (key: string, ridgeY: number, frac: number, scale: number) => {
        const texH = this.textures.get(key).getSourceImage().height;
        this.add
          .tileSprite(0, height * frac - ridgeY * scale, width, texH * scale, key)
          .setOrigin(0, 0)
          .setTileScale(scale);
      };
      band('bg-mountains', 72, 0.34, 1.5);
      band('bg-hills', 62, 0.52, 1.5);
      band('bg-hedge', 40, 0.84, 1.6);

      this.add.image(cx, height * 0.5, 'arch').setScale(2.8).setOrigin(0.5, 1);

      this.add
        .text(cx, height * 0.52, `${COUPLE.partner1} ♥ ${COUPLE.partner2}`, {
          fontFamily: 'Georgia, serif',
          fontSize: '36px',
          color: '#fdf9f0',
          stroke: '#3a2b3a',
          strokeThickness: 6,
        })
        .setOrigin(0.5);

      this.add
        .text(cx, height * 0.52 + 36, 'a tiny adventure invitation', {
          fontFamily: 'Georgia, serif',
          fontSize: '17px',
          fontStyle: 'italic',
          color: '#fdf9f0',
          stroke: '#3a2b3a',
          strokeThickness: 3,
        })
        .setOrigin(0.5);

      const start = this.add
        .text(cx, height * 0.72, '— tap to start —', {
          fontFamily: 'monospace',
          fontSize: '19px',
          color: '#fff2c0',
          stroke: '#3a2b3a',
          strokeThickness: 4,
        })
        .setOrigin(0.5);
      this.tweens.add({ targets: start, alpha: 0.25, duration: 700, yoyo: true, repeat: -1 });

      this.add
        .text(cx, height - 14, 'walk → with arrows / buttons · jump with Space / ⤒ · talk with E / ❤', {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#fdf9f0',
          stroke: '#3a2b3a',
          strokeThickness: 3,
        })
        .setOrigin(0.5);
    };

    layout();
    this.scale.on('resize', layout);

    const begin = () => {
      this.scale.off('resize', layout);
      this.scene.start('world');
    };
    this.input.once('pointerdown', begin);
    this.input.keyboard?.once('keydown', begin);
  }
}
