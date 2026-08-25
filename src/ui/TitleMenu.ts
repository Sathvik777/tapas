import { el, injectStylesOnce } from './dom';

/**
 * The two doors on the title screen.
 *
 * A guest who opened this to find out when and where should not have to play a
 * platformer first — most won't, and the ones who do should be choosing it. So
 * the details are one tap away and the walk is the other tap, side by side,
 * neither hidden behind the other.
 */
export class TitleMenu {
  private root?: HTMLElement;

  show(onInvitation: () => void, onPlay: () => void): void {
    injectStylesOnce();
    this.destroy();
    this.root = el('div', 'wq-doors');

    const invitation = el('button', 'wq-door', this.root);
    invitation.textContent = 'The invitation';
    invitation.addEventListener('click', onInvitation);

    const play = el('button', 'wq-door wq-door-go', this.root);
    play.textContent = 'Take the walk →';
    play.addEventListener('click', onPlay);
  }

  destroy(): void {
    this.root?.remove();
    this.root = undefined;
  }
}
