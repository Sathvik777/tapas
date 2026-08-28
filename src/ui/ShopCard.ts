import type { GiftDef } from '../content/wedding';
import { el, injectStylesOnce } from './dom';

/**
 * The gift stall. Hearts collected along the road are the currency, which is
 * what finally gives them a purpose beyond being nice to grab.
 */
export class ShopCard {
  private overlay?: HTMLElement;

  get isOpen(): boolean {
    return !!this.overlay;
  }

  show(
    gifts: GiftDef[],
    hearts: number,
    onBuy: (gift: GiftDef) => void,
    onClose: () => void,
  ): void {
    injectStylesOnce();
    this.destroy();
    this.overlay = el('div', 'wq-overlay');
    const card = el('div', 'wq-card wq-shop', this.overlay);

    el('h1', '', card).textContent = 'Gift stall';
    el('div', 'wq-sub', card).textContent = `You have ${hearts} ❤ to spend`;

    for (const gift of gifts) {
      const row = el('button', 'wq-gift', card) as HTMLButtonElement;
      const affordable = hearts >= gift.price;
      row.disabled = !affordable;
      const head = el('div', 'wq-gift-head', row);
      el('span', 'wq-gift-name', head).textContent = gift.label;
      el('span', 'wq-gift-price', head).textContent = `${gift.price} ❤`;
      el('div', 'wq-gift-note', row).textContent = affordable
        ? gift.note
        : `${gift.note} (you need ${gift.price - hearts} more)`;
      row.addEventListener('click', () => {
        if (!affordable) return;
        this.destroy();
        onBuy(gift);
      });
    }

    const close = el('button', 'wq-close', el('div', 'wq-foot', card));
    close.textContent = 'Maybe later';
    close.addEventListener('click', () => {
      this.destroy();
      onClose();
    });
  }

  destroy(): void {
    this.overlay?.remove();
    this.overlay = undefined;
  }
}
