import { el, injectStylesOnce } from './dom';

export class Hud {
  private badge: HTMLElement;
  private toast: HTMLElement;
  private toastTimer?: number;

  constructor() {
    injectStylesOnce();
    this.badge = el('div', 'wq-hud');
    this.badge.style.transition = 'opacity 0.2s';
    this.toast = el('div', 'wq-toast');
  }

  private visited = 0;
  private total = 0;
  private heartCount = 0;
  private gift = '';

  setProgress(visited: number, total: number): void {
    this.visited = visited;
    this.total = total;
    this.render();
  }

  setHearts(n: number): void {
    this.heartCount = n;
    this.render();
  }

  setGift(label: string): void {
    this.gift = label;
    this.render();
  }

  private render(): void {
    const carried = this.gift ? ` · 🎁` : '';
    this.badge.textContent = `💌 ${this.visited}/${this.total} · ❤ ${this.heartCount}${carried}`;
  }

  showToast(text: string, ms = 3500): void {
    this.toast.textContent = text;
    this.toast.style.opacity = '1';
    if (this.toastTimer !== undefined) clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toast.style.opacity = '0';
    }, ms);
  }

  /** The dialogue now sits at the top of the screen, where the badge used to. */
  setHidden(hidden: boolean): void {
    this.badge.style.opacity = hidden ? '0' : '1';
    if (hidden) this.toast.style.opacity = '0';
  }

  destroy(): void {
    if (this.toastTimer !== undefined) clearTimeout(this.toastTimer);
    this.badge.remove();
    this.toast.remove();
  }
}
