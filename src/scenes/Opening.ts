import Phaser from 'phaser';
import { OPENING } from '../content/wedding';

/**
 * The opening flourish on the title screen: the lead-in, the name arriving a
 * letter at a time, and "You're invited" landing under it in a shower of
 * petals. Then it clears and the title is sitting there as before.
 *
 * Three rules it must keep:
 *
 * - **Any tap or key skips it.** A guest who opened this to find out when and
 *   where must never be made to sit through an animation first. It is short,
 *   it runs once, and it gets out of the way on the first touch.
 * - **A rotation ends it.** `TitleScene`'s resize handler rebuilds the whole
 *   display list, this included, so it cannot survive one — the title settles
 *   instead of the flourish half-playing over a fresh layout.
 * - **It reads at any width.** The name comes out of the URL and can be sixty
 *   characters of "Anders & Eva Lindqvist"; the size is fitted to the screen,
 *   over two lines if one won't do.
 * - **It ends on time on any device.** Phaser's clock is driven by frames, and
 *   below 60fps it falls behind the wall clock — measured at roughly half
 *   speed in a software renderer, which turned this into a six-second wait for
 *   a three-second flourish. The beats stay on the scene clock so they stay in
 *   step with each other and with the tweens, and a real-time backstop ends
 *   the whole thing regardless. A guest on a slow phone gets a cut, not a wait.
 */

const CREAM = '#fdf9f0';
const GOLD = '#ffd76b';
const INK = '#3a2b3a';

/** Sum-of-glyphs runs wider than the kerned string; fit against that. */
const UNKERNED = 1.06;
const HERO_FLOOR_1 = 26;
const HERO_FLOOR_2 = 18;

/** A space draws nothing, but still has to push the letters after it along. */
const SPACE = 0.3;

/**
 * Longest the flourish may hold the screen in real time, however badly the
 * frames are going. Comfortably past the settle at 60fps, so on anything
 * healthy this never fires.
 */
const MAX_WALL_MS = 4200;

export class Opening {
  private items: Phaser.GameObjects.GameObject[] = [];
  private timers: Phaser.Time.TimerEvent[] = [];
  private backstop?: number;
  private finished = false;

  constructor(
    private scene: Phaser.Scene,
    /**
     * The title text sitting underneath. The veil dims it but does not hide
     * it, and the couple's names land in the same band as the guest's — so it
     * is held back and faded up as the flourish clears, which reads as the
     * name giving way to the title rather than the two colliding.
     */
    private beneath: () => Phaser.GameObjects.Text[],
    private onSettle: () => void,
  ) {}

  get playing(): boolean {
    return !this.finished;
  }

  play(): void {
    this.backstop = window.setTimeout(() => this.end(true), MAX_WALL_MS);
    for (const text of this.beneath()) text.setAlpha(0);

    const { width, height } = this.scene.scale;
    const cx = width / 2;
    const cy = height * 0.46;
    const maxWidth = Math.max(160, width - 44);

    // Dark enough that cream letters carry, sheer enough that the parallax is
    // still there behind them — the flourish is over the world, not instead
    // of it.
    const veil = this.add(
      this.scene.add.rectangle(0, 0, width, height, 0x1a1423).setOrigin(0, 0).setAlpha(0),
    );
    veil.setDepth(60);
    this.scene.tweens.add({ targets: veil, alpha: 0.62, duration: 380 });

    const { size, lines } = this.fitHero(maxWidth, Math.min(46, width * 0.115));
    const lineHeight = size * 1.15;
    const blockTop = cy - (lines.length * lineHeight) / 2;

    const lead = this.add(
      this.scene.add
        .text(cx, blockTop - 32, OPENING.lead, {
          fontFamily: 'Georgia, serif',
          fontSize: `${Math.max(13, Math.min(18, width * 0.038))}px`,
          fontStyle: 'italic',
          color: CREAM,
          stroke: INK,
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setAlpha(0),
    );
    lead.setDepth(62);
    this.scene.tweens.add({
      targets: lead,
      alpha: 0.9,
      y: blockTop - 26,
      duration: 420,
      delay: 240,
    });

    const sparks = this.add(
      this.scene.add.particles(0, 0, 'spark', {
        speed: { min: 20, max: 90 },
        angle: { min: 0, max: 360 },
        lifespan: { min: 300, max: 700 },
        gravityY: 60,
        scale: { start: 0.9, end: 0 },
        alpha: { start: 0.9, end: 0 },
        tint: [0xffd76b, 0xf28bb4, 0xfdf9f0],
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
      }),
    );
    sparks.setDepth(61);

    const letters = this.layOutLetters(lines, size, cx, blockTop, lineHeight);
    // A long name must not take proportionally longer to say than a short one.
    const step = Math.min(55, 900 / Math.max(1, letters.length));
    const START = 500;

    letters.forEach((letter, i) => {
      this.scene.tweens.add({
        targets: letter,
        scale: 1,
        alpha: 1,
        angle: 0,
        ease: 'Back.easeOut',
        duration: 380,
        delay: START + i * step,
        onStart: () => sparks.emitParticleAt(letter.x, letter.y, 4),
      });
    });

    const spelled = START + letters.length * step + 380;
    const banner = this.add(
      this.scene.add
        .text(cx, blockTop + lines.length * lineHeight + 30, OPENING.banner, {
          fontFamily: 'Georgia, serif',
          fontSize: `${Math.max(17, Math.min(28, width * 0.062))}px`,
          color: GOLD,
          stroke: INK,
          strokeThickness: 5,
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setScale(2.4),
    );
    banner.setDepth(62);

    const petals = this.add(
      this.scene.add.particles(0, 0, 'petal', {
        speed: { min: 60, max: 240 },
        angle: { min: 200, max: 340 },
        gravityY: 220,
        lifespan: { min: 1400, max: 2400 },
        rotate: { start: 0, end: 360 },
        scale: { min: 0.8, max: 1.5 },
        alpha: { start: 1, end: 0.2 },
        emitting: false,
      }),
    );
    petals.setDepth(61);

    this.after(spelled + 110, () => {
      this.scene.tweens.add({
        targets: banner,
        scale: 1,
        alpha: 1,
        ease: 'Back.easeOut',
        duration: 420,
      });
      petals.explode(28, cx, cy);
    });

    // Fade rather than cut, so the title underneath is already in place by the
    // time the veil has gone.
    this.after(spelled + 1000, () => {
      this.scene.tweens.add({
        targets: [veil, lead, banner, ...letters],
        alpha: 0,
        duration: 520,
        onComplete: () => this.end(true),
      });
      this.scene.tweens.add({
        targets: this.beneath(),
        alpha: 1,
        duration: 520,
      });
    });
  }

  /** Straight to the settled title — a tap, a key, or a rotation. */
  skip(): void {
    this.end(true);
  }

  /** Tear down without settling, for a scene shutdown mid-flourish. */
  destroy(): void {
    this.end(false);
  }

  private end(settle: boolean): void {
    if (this.finished) return;
    this.finished = true;
    window.clearTimeout(this.backstop);
    for (const timer of this.timers) timer.remove();
    this.timers = [];
    for (const item of this.items) {
      this.scene.tweens.killTweensOf(item);
      item.destroy();
    }
    this.items = [];
    // However this ended — skipped, rotated away, or played out — the title
    // has to be left visible.
    for (const text of this.beneath()) {
      if (text.active) {
        this.scene.tweens.killTweensOf(text);
        text.setAlpha(1);
      }
    }
    if (settle) this.onSettle();
  }

  /**
   * One line if the name will take it, two if it won't. Measured rather than
   * guessed: the name is whatever was in the address bar.
   */
  private fitHero(maxWidth: number, maxSize: number): { size: number; lines: string[] } {
    const fits = (line: string, size: number) => this.measure(line, size) * UNKERNED <= maxWidth;

    for (let size = maxSize; size >= HERO_FLOOR_1; size -= 2) {
      if (fits(OPENING.hero, size)) return { size, lines: [OPENING.hero] };
    }

    const lines = splitInTwo(OPENING.hero);
    for (let size = maxSize; size >= HERO_FLOOR_2; size -= 2) {
      if (lines.every((line) => fits(line, size))) return { size, lines };
    }
    return { size: HERO_FLOOR_2, lines };
  }

  private measure(text: string, size: number): number {
    const probe = this.scene.add.text(0, 0, text, {
      fontFamily: 'Georgia, serif',
      fontSize: `${size}px`,
    });
    const width = probe.width;
    probe.destroy();
    return width;
  }

  /** Every letter its own object, so each can arrive on its own. */
  private layOutLetters(
    lines: string[],
    size: number,
    cx: number,
    blockTop: number,
    lineHeight: number,
  ): Phaser.GameObjects.Text[] {
    const letters: Phaser.GameObjects.Text[] = [];

    lines.forEach((line, row) => {
      const chars = [...line];
      const widths = chars.map((c) => (c === ' ' ? size * SPACE : this.measure(c, size)));
      const y = blockTop + lineHeight * (row + 0.5);
      let x = cx - widths.reduce((a, b) => a + b, 0) / 2;

      chars.forEach((char, i) => {
        const centre = x + widths[i] / 2;
        x += widths[i];
        if (char === ' ') return;

        const letter = this.add(
          this.scene.add
            .text(centre, y, char, {
              fontFamily: 'Georgia, serif',
              fontSize: `${size}px`,
              color: CREAM,
              stroke: INK,
              strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setAlpha(0)
            .setScale(0)
            .setAngle(Phaser.Math.Between(-14, 14)),
        );
        letter.setDepth(62);
        letters.push(letter as Phaser.GameObjects.Text);
      });
    });

    return letters;
  }

  private add<T extends Phaser.GameObjects.GameObject>(item: T): T {
    this.items.push(item);
    return item;
  }

  private after(delay: number, callback: () => void): void {
    this.timers.push(this.scene.time.delayedCall(delay, callback));
  }
}

/** Split at the space nearest the middle, so neither line is a stub. */
function splitInTwo(text: string): string[] {
  const middle = text.length / 2;
  let best = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ' && (best < 0 || Math.abs(i - middle) < Math.abs(best - middle))) best = i;
  }
  return best < 0 ? [text] : [text.slice(0, best), text.slice(best + 1)];
}
