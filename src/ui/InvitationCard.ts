import { el, injectStylesOnce } from './dom';

/** The final "you collected everything" invitation, styled like a paper invite. */
export class InvitationCard {
  private overlay?: HTMLElement;

  get isOpen(): boolean {
    return !!this.overlay;
  }

  show(lines: string[], onClose?: () => void): void {
    injectStylesOnce();
    this.destroy();
    this.overlay = el('div', 'wq-overlay');
    const card = el('div', 'wq-card', this.overlay);

    el('div', '', card).textContent = '💍';
    const [names, sub, ...rest] = lines;
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
      const p = el('p', '', card);
      p.innerHTML = line === '' ? '&nbsp;' : '';
      if (line !== '') p.textContent = line;
    }

    const close = el('button', 'wq-close', card);
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
