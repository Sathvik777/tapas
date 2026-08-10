import { el, injectStylesOnce } from './dom';

const CHARS_PER_TICK = 1;
const TICK_MS = 18;

export class DialogueBox {
  private box?: HTMLElement;
  private tapCatcher?: HTMLElement;
  private textEl?: HTMLElement;
  private pages: string[] = [];
  private pageIndex = 0;
  private shown = 0;
  private timer?: number;
  private onClose?: () => void;

  get isOpen(): boolean {
    return !!this.box;
  }

  show(name: string, pages: string[], onClose?: () => void, role?: string): void {
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
    more.textContent = '▾ tap';

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
    this.stopTimer();
    this.timer = window.setInterval(() => {
      const page = this.pages[this.pageIndex];
      this.shown = Math.min(page.length, this.shown + CHARS_PER_TICK);
      if (this.textEl) this.textEl.textContent = page.slice(0, this.shown);
      if (this.shown >= page.length) this.stopTimer();
    }, TICK_MS);
  }

  /** Tap/E: finish the typewriter, then page forward, then close. */
  advance(): void {
    if (!this.box) return;
    const page = this.pages[this.pageIndex];
    if (this.shown < page.length) {
      this.stopTimer();
      this.shown = page.length;
      if (this.textEl) this.textEl.textContent = page;
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
    this.box?.remove();
    this.tapCatcher?.remove();
    this.box = undefined;
    this.tapCatcher = undefined;
    this.textEl = undefined;
    this.onClose = undefined;
  }

  private stopTimer(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
