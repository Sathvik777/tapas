import Phaser from 'phaser';
import { COUPLE, INVITATION_LINES } from '../content/wedding';
import { InvitationCard } from '../ui/InvitationCard';
import { TitleMenu } from '../ui/TitleMenu';
import { Opening } from './Opening';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    /** Rebuilt by every layout; the flourish holds these back while it runs. */
    let heading: Phaser.GameObjects.Text[] = [];

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

      this.add.image(cx, height * 0.5, 'mandap').setScale(2.2).setOrigin(0.5, 1);

      const couple = this.add
        .text(cx, height * 0.52, `${COUPLE.partner1} ♥ ${COUPLE.partner2}`, {
          fontFamily: 'Georgia, serif',
          fontSize: '36px',
          color: '#fdf9f0',
          stroke: '#3a2b3a',
          strokeThickness: 6,
        })
        .setOrigin(0.5);

      const tagline = this.add
        .text(cx, height * 0.52 + 36, 'a tiny adventure invitation', {
          fontFamily: 'Georgia, serif',
          fontSize: '17px',
          fontStyle: 'italic',
          color: '#fdf9f0',
          stroke: '#3a2b3a',
          strokeThickness: 3,
        })
        .setOrigin(0.5);

      heading = [couple, tagline];

      // A phone held upright is barely 360px across and this line is ~540px
      // wide, so on portrait it used to run off both edges — the first and last
      // control were simply missing. It wraps to fit the width instead, growing
      // upward from the bottom edge (origin 1) so a second line stays on screen.
      const hint = this.add
        .text(cx, height - 10, 'walk → with arrows / buttons · jump with Space / ⤒ · talk with E / ❤', {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#fdf9f0',
          stroke: '#3a2b3a',
          strokeThickness: 3,
          align: 'center',
          wordWrap: { width: width - 16 },
        })
        .setOrigin(0.5, 1);
      // Wrapping breaks at spaces, so a viewport narrower than the longest word
      // can still overflow. Shrink to fit as the backstop.
      if (hint.width > width - 16) hint.setScale((width - 16) / hint.width);
    };

    layout();

    const menu = new TitleMenu();
    const card = new InvitationCard();

    // The flourish clears the display list on a rotation, so it ends first and
    // the title lays out underneath as usual.
    const onResize = () => {
      opening.skip();
      layout();
    };

    const begin = () => {
      this.scale.off('resize', onResize);
      opening.destroy();
      menu.destroy();
      card.destroy();
      this.scene.start('world');
    };

    // The doors wait for the name to have been said — until then there is
    // nothing to press, which is what makes the flourish skippable rather than
    // something to press through.
    const opening = new Opening(
      this,
      () => heading,
      () =>
        menu.show(
          // Reading the invitation and then walking is the natural order, so
          // the card's own button carries on into the game rather than
          // dead-ending.
          () => card.show(INVITATION_LINES, begin, 'Take the walk →'),
          begin,
        ),
    );

    this.scale.on('resize', onResize);
    opening.play();

    // Any key still starts the walk, the way "tap to start" used to — except
    // during the flourish, where it skips to the title rather than launching
    // the game out from under it, and while the card is up, where a keypress
    // would start the game underneath it.
    this.input.keyboard?.on('keydown', () => {
      if (opening.playing) opening.skip();
      else if (!card.isOpen) begin();
    });
    this.input.on('pointerdown', () => {
      if (opening.playing) opening.skip();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', onResize);
      opening.destroy();
      menu.destroy();
      card.destroy();
    });
  }
}
