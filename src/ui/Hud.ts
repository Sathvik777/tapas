import { el, injectStylesOnce } from './dom';

export class Hud {
  private badge: HTMLElement;
  private toast: HTMLElement;
  private toastTimer?: number;

  constructor() {
    injectStylesOnce();
    this.badge = el('div', 'wq-hud');
    this.toast = el('div', 'wq-toast');
  }

  setProgress(visited: number, total: number): void {
    this.badge.textContent = `💌 ${visited}/${total}`;
  }

  showToast(text: string, ms = 3500): void {
    this.toast.textContent = text;
    this.toast.style.opacity = '1';
    if (this.toastTimer !== undefined) clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toast.style.opacity = '0';
    }, ms);
  }

  destroy(): void {
    if (this.toastTimer !== undefined) clearTimeout(this.toastTimer);
    this.badge.remove();
    this.toast.remove();
  }
}
