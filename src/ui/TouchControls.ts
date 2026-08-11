import { el, injectStylesOnce, isTouchDevice } from './dom';

/**
 * Platformer touch controls: ◀ ▶ on the left, jump on the right,
 * and a contextual ❤ talk button that appears near anyone you can talk to.
 * Only mounted on touch devices.
 */
export class TouchControls {
  /** Held-direction state, read by the world scene every frame. */
  state = { left: false, right: false };

  private nodes: HTMLElement[] = [];
  private actionBtn?: HTMLElement;

  constructor(onJump: () => void, onAction: () => void) {
    if (!isTouchDevice()) return;
    injectStylesOnce();

    const make = (cls: string, label: string): HTMLElement => {
      const btn = el('div', `wq-btn ${cls}`);
      btn.textContent = label;
      this.nodes.push(btn);
      return btn;
    };

    const hold = (btn: HTMLElement, key: 'left' | 'right') => {
      const on = (e: PointerEvent) => {
        e.preventDefault();
        this.state[key] = true;
      };
      const off = () => {
        this.state[key] = false;
      };
      btn.addEventListener('pointerdown', on);
      btn.addEventListener('pointerup', off);
      btn.addEventListener('pointercancel', off);
      btn.addEventListener('pointerleave', off);
    };

    hold(make('wq-btn-left', '◀'), 'left');
    hold(make('wq-btn-right', '▶'), 'right');

    const jump = make('wq-btn-jump', '⤒');
    jump.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      onJump();
    });

    this.actionBtn = make('wq-btn-talk', '❤');
    this.actionBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onAction();
    });
    this.setActionVisible(false);
  }

  /** Show the ❤ talk button only when something is in range. */
  setActionVisible(visible: boolean): void {
    if (this.actionBtn) this.actionBtn.style.display = visible ? 'flex' : 'none';
  }

  destroy(): void {
    for (const n of this.nodes) n.remove();
    this.nodes = [];
  }
}
