import type { InvitationLine } from '../content/wedding';
import { el, injectStylesOnce } from './dom';

/** The final "you collected everything" invitation, styled like a paper invite. */
export class InvitationCard {
  private overlay?: HTMLElement;

  get isOpen(): boolean {
    return !!this.overlay;
  }

  show(lines: InvitationLine[], onClose?: () => void): void {
    injectStylesOnce();
    this.destroy();
    this.overlay = el('div', 'wq-overlay');
    const card = el('div', 'wq-card', this.overlay);

    el('div', '', card).textContent = '💍';
    const [names, sub, ...rest] = lines as [string, string, ...InvitationLine[]];
    // Full names are long enough to wrap. Let the heading break between the two
    // names, never inside one — "Samina / Dahlberg" is not a thing you print on
    // an invitation. Each name is one unbreakable run; the ♥ is the hinge.
    const h1 = el('h1', '', card);
    names.split(' ♥ ').forEach((name, i) => {
      if (i) h1.append(' ♥ ');
      el('span', 'wq-name', h1).textContent = name;
    });
    el('div', 'wq-sub', card).textContent = sub;
    for (const line of rest) {
      if (typeof line !== 'string') {
        const a = el('a', 'wq-maps', card) as HTMLAnchorElement;
        a.href = line.href;
        a.textContent = line.text;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        continue;
      }
      if (line === '') {
        el('p', 'wq-gap', card);
        continue;
      }
      el('p', '', card).textContent = line;
    }

    const close = el('button', 'wq-close', el('div', 'wq-foot', card));
    close.textContent = 'Keep exploring ✨';
    close.addEventListener('click', () => {
      this.destroy();
      onClose?.();
    });
  }

  destroy(): void {
    this.overlay?.remove();
    this.overlay = undefined;
  }
}
