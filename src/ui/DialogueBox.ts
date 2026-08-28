import type { Page } from '../content/wedding';
import { el, injectStylesOnce } from './dom';

const CHARS_PER_TICK = 1;
const TICK_MS = 18;
/** Once a page has finished typing, how long to leave it up before moving on. */
const READ_MS_MIN = 2200;
const READ_MS_PER_CHAR = 55;
const READ_MS_MAX = 7000;

export class DialogueBox {
  private box?: HTMLElement;
  private tapCatcher?: HTMLElement;
  private textEl?: HTMLElement;
  private linkEl?: HTMLElement;
  private pages: Page[] = [];
  private pageIndex = 0;
  private shown = 0;
  private timer?: number;
  private autoTimer?: number;
  private onClose?: () => void;

  get isOpen(): boolean {
    return !!this.box;
  }

  /** Text of the page being typed; the rest of the box only ever needs this. */
  private get text(): string {
    const page = this.pages[this.pageIndex];
    return typeof page === 'string' ? page : page.text;
  }

  private get link(): { text: string; href: string } | undefined {
    const page = this.pages[this.pageIndex];
    return typeof page === 'string' ? undefined : page.link;
  }

  show(name: string, pages: Page[], onClose?: () => void, role?: string): void {
    injectStylesOnce();
    this.destroy();
    this.pages = pages;
    this.pageIndex = 0;
    this.onClose = onClose;

    this.box = el('div', 'wq-dialogue');
    const nameEl = el('div', 'wq-name', this.box);
    nameEl.textContent = role ? `${name} · ${role}` : name;
    this.textEl = el('div', 'wq-text', this.box);
    const more = el('div', 'wq-more', this.box);
    more.textContent = 'tap to continue ▾';

    this.tapCatcher = el('div', 'wq-tapcatcher');
    this.tapCatcher.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.advance();
    });

    this.startPage();
  }

  private startPage(): void {
    this.shown = 0;
    if (this.textEl) this.textEl.textContent = '';
    this.linkEl?.remove();
    this.linkEl = undefined;
    this.stopTimer();
    this.timer = window.setInterval(() => {
      const page = this.text;
      this.shown = Math.min(page.length, this.shown + CHARS_PER_TICK);
      if (this.textEl) this.textEl.textContent = page.slice(0, this.shown);
      if (this.shown >= page.length) {
        this.stopTimer();
        this.finishPage();
      }
    }, TICK_MS);
  }

  /** Page fully typed: show its link, if it has one, and set the timer. */
  private finishPage(): void {
    const link = this.link;
    if (link && this.textEl && !this.linkEl) {
      const a = el('a', 'wq-maps', this.box!) as HTMLAnchorElement;
      a.href = link.href;
      a.textContent = link.text;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      this.textEl.after(a);
      this.linkEl = a;
    }
    // A page carrying a link waits for a tap instead of moving on by itself —
    // a button that slides away while someone reaches for it is worse than no
    // button at all. Every other page still advances hands-free.
    if (!link) this.scheduleAuto(this.text.length);
  }

  /**
   * Dialogue moves on by itself so the game can be watched one-handed; tapping
   * still works and simply gets there sooner. The pause scales with how much
   * there is to read.
   */
  private scheduleAuto(chars: number): void {
    this.clearAuto();
    const wait = Math.min(READ_MS_MAX, Math.max(READ_MS_MIN, chars * READ_MS_PER_CHAR));
    this.autoTimer = window.setTimeout(() => this.advance(), wait);
  }

  private clearAuto(): void {
    if (this.autoTimer !== undefined) {
      clearTimeout(this.autoTimer);
      this.autoTimer = undefined;
    }
  }

  /** Tap/E: finish the typewriter, then page forward, then close. */
  advance(): void {
    if (!this.box) return;
    this.clearAuto();
    const page = this.text;
    if (this.shown < page.length) {
      this.stopTimer();
      this.shown = page.length;
      if (this.textEl) this.textEl.textContent = page;
      this.finishPage();
      return;
    }
    if (this.pageIndex < this.pages.length - 1) {
      this.pageIndex++;
      this.startPage();
      return;
    }
    const done = this.onClose;
    this.destroy();
    done?.();
  }

  destroy(): void {
    this.stopTimer();
    this.clearAuto();
    this.box?.remove();
    this.tapCatcher?.remove();
    this.box = undefined;
    this.tapCatcher = undefined;
    this.textEl = undefined;
    this.linkEl = undefined;
    this.onClose = undefined;
  }

  private stopTimer(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
