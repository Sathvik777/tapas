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

      this.add.rectangle(cx, height / 2, width, height, 0x2a4a3a);
      this.add.rectangle(cx, height - 40, width, 80, 0x223d30);

      this.add.image(cx, height * 0.38, 'arch').setScale(4);

      this.add
        .text(cx, height * 0.52, `${COUPLE.partner1} ♥ ${COUPLE.partner2}`, {
          fontFamily: 'Georgia, serif',
          fontSize: '34px',
          color: '#f7f3ea',
          stroke: '#1a1423',
          strokeThickness: 5,
        })
        .setOrigin(0.5);

      this.add
        .text(cx, height * 0.52 + 34, 'a tiny adventure invitation', {
          fontFamily: 'Georgia, serif',
          fontSize: '16px',
          fontStyle: 'italic',
          color: '#e8d9c0',
        })
        .setOrigin(0.5);

      const start = this.add
        .text(cx, height * 0.72, '— tap to start —', {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#f5d76b',
        })
        .setOrigin(0.5);
      this.tweens.add({ targets: start, alpha: 0.25, duration: 700, yoyo: true, repeat: -1 });

      this.add
        .text(cx, height - 14, 'walk with WASD / arrows or the joystick · talk with E / ❤', {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#9fb89f',
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
