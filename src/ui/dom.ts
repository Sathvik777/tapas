/** Tiny helpers for the DOM-based UI layer (crisp text + easy mobile layout). */

const STYLE_ID = 'wq-styles';

export function injectStylesOnce(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
  .wq-hud {
    position: fixed; top: 10px; right: 10px; z-index: 25;
    background: rgba(26, 20, 35, 0.85); color: #f7f3ea;
    border: 2px solid #f2c9a1; border-radius: 999px;
    padding: 6px 14px; font: 15px/1 Georgia, serif;
    pointer-events: none;
  }
  .wq-toast {
    position: fixed; top: 52px; left: 50%; transform: translateX(-50%);
    z-index: 25; background: rgba(26, 20, 35, 0.9); color: #f5d76b;
    border: 2px solid #f5d76b; border-radius: 10px;
    padding: 8px 16px; font: italic 15px Georgia, serif;
    opacity: 0; transition: opacity 0.4s; pointer-events: none;
    max-width: 80vw; text-align: center;
  }
  .wq-dialogue {
    position: fixed; left: 50%; transform: translateX(-50%);
    bottom: max(14px, env(safe-area-inset-bottom));
    width: min(560px, calc(100vw - 28px));
    z-index: 30; box-sizing: border-box;
    background: rgba(26, 20, 35, 0.94); color: #f7f3ea;
    border: 2px solid #f2c9a1; border-radius: 12px;
    padding: 10px 16px 14px; font: 17px/1.45 Georgia, serif;
    min-height: 86px;
  }
  .wq-dialogue .wq-name {
    color: #f5d76b; font-size: 14px; letter-spacing: 1px;
    text-transform: uppercase; margin-bottom: 4px;
  }
  .wq-dialogue .wq-more {
    position: absolute; right: 14px; bottom: 6px;
    color: #f2c9a1; font-size: 13px; animation: wq-blink 1s infinite;
  }
  @keyframes wq-blink { 50% { opacity: 0.2; } }
  .wq-tapcatcher { position: fixed; inset: 0; z-index: 29; }
  .wq-touch-layer { position: fixed; inset: 0; z-index: 10; touch-action: none; }
  .wq-joy-base, .wq-joy-knob {
    position: fixed; border-radius: 50%; pointer-events: none;
    transform: translate(-50%, -50%); z-index: 11; display: none;
  }
  .wq-joy-base {
    width: 96px; height: 96px;
    background: rgba(247, 243, 234, 0.12); border: 2px solid rgba(247, 243, 234, 0.35);
  }
  .wq-joy-knob {
    width: 44px; height: 44px;
    background: rgba(247, 243, 234, 0.45); border: 2px solid rgba(247, 243, 234, 0.7);
  }
  .wq-abtn {
    position: fixed; right: 18px; bottom: max(24px, env(safe-area-inset-bottom));
    width: 68px; height: 68px; border-radius: 50%; z-index: 12;
    background: rgba(224, 87, 111, 0.85); border: 3px solid #f7f3ea;
    color: #fff; font-size: 30px; line-height: 62px; text-align: center;
    user-select: none; -webkit-user-select: none; touch-action: none;
  }
  .wq-abtn:active { transform: scale(0.92); }
  .wq-overlay {
    position: fixed; inset: 0; z-index: 40;
    background: rgba(20, 14, 28, 0.6);
    display: flex; align-items: center; justify-content: center;
  }
  .wq-card {
    background: #fdf9f0; color: #3a2b3a;
    width: min(420px, calc(100vw - 40px)); max-height: 82vh; overflow-y: auto;
    border: 2px solid #d9b878; border-radius: 6px; box-sizing: border-box;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45), inset 0 0 0 6px #fdf9f0, inset 0 0 0 7px #d9b878;
    padding: 30px 26px; text-align: center; font: 16px/1.55 Georgia, serif;
  }
  .wq-card h1 { font-size: 26px; margin: 4px 0 2px; color: #a85a48; font-weight: normal; }
  .wq-card .wq-sub { font-style: italic; color: #8a7a6a; margin-bottom: 14px; }
  .wq-card p { margin: 5px 0; }
  .wq-card .wq-close {
    margin-top: 18px; padding: 9px 22px; border-radius: 999px;
    border: 2px solid #a85a48; background: #e0576f; color: #fff;
    font: 16px Georgia, serif; cursor: pointer;
  }
  `;
  document.head.appendChild(style);
}

export function el(tag: string, className: string, parent: HTMLElement = document.body): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  parent.appendChild(node);
  return node;
}

export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
