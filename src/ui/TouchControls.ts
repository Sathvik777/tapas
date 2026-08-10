import { el, injectStylesOnce, isTouchDevice } from './dom';

const JOY_RADIUS = 44;

/**
 * Floating virtual joystick (left side of the screen) + heart action button.
 * Only mounted on touch devices; keyboard users never see it.
 */
export class TouchControls {
  /** Normalized movement vector, read by the world scene every frame. */
  vector = { x: 0, y: 0 };

  private layer?: HTMLElement;
  private base?: HTMLElement;
  private knob?: HTMLElement;
  private button?: HTMLElement;
  private activePointer?: number;
  private origin = { x: 0, y: 0 };

  constructor(onAction: () => void) {
    if (!isTouchDevice()) return;
    injectStylesOnce();

    this.layer = el('div', 'wq-touch-layer');
    this.base = el('div', 'wq-joy-base');
    this.knob = el('div', 'wq-joy-knob');
    this.button = el('div', 'wq-abtn');
    this.button.textContent = '❤';
    this.button.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onAction();
    });

    this.layer.addEventListener('pointerdown', (e) => {
      if (this.activePointer !== undefined) return;
      this.activePointer = e.pointerId;
      try {
        this.layer!.setPointerCapture(e.pointerId);
      } catch {
        // synthetic pointers (tests) can't be captured — tracking still works
      }
      this.origin = { x: e.clientX, y: e.clientY };
      this.moveKnob(e.clientX, e.clientY);
      this.setVisible(true);
    });
    this.layer.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.activePointer) return;
      let dx = e.clientX - this.origin.x;
      let dy = e.clientY - this.origin.y;
      const len = Math.hypot(dx, dy);
      if (len > JOY_RADIUS) {
        dx = (dx / len) * JOY_RADIUS;
        dy = (dy / len) * JOY_RADIUS;
      }
      this.moveKnob(this.origin.x + dx, this.origin.y + dy);
      const dead = 8;
      this.vector =
        len < dead ? { x: 0, y: 0 } : { x: dx / JOY_RADIUS, y: dy / JOY_RADIUS };
    });
    const end = (e: PointerEvent) => {
      if (e.pointerId !== this.activePointer) return;
      this.activePointer = undefined;
      this.vector = { x: 0, y: 0 };
      this.setVisible(false);
    };
    this.layer.addEventListener('pointerup', end);
    this.layer.addEventListener('pointercancel', end);
  }

  private moveKnob(x: number, y: number): void {
    if (!this.base || !this.knob) return;
    this.base.style.left = `${this.origin.x}px`;
    this.base.style.top = `${this.origin.y}px`;
    this.knob.style.left = `${x}px`;
    this.knob.style.top = `${y}px`;
  }

  private setVisible(v: boolean): void {
    const d = v ? 'block' : 'none';
    if (this.base) this.base.style.display = d;
    if (this.knob) this.knob.style.display = d;
  }

  destroy(): void {
    this.layer?.remove();
    this.base?.remove();
    this.knob?.remove();
    this.button?.remove();
  }
}
