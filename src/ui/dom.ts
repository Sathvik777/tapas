/** Tiny helpers for the DOM-based UI layer (crisp text + easy mobile layout). */

const STYLE_ID = 'wq-styles';

export function injectStylesOnce(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
  .wq-hud {
    position: fixed; top: max(10px, env(safe-area-inset-top)); right: 12px; z-index: 25;
    background: #fdf9f0; color: #4a3428;
    border: 3px solid #4a3428; border-radius: 999px;
    box-shadow: 0 3px 0 rgba(74, 52, 40, 0.35);
    padding: 6px 16px; font: 16px/1 Georgia, serif;
    pointer-events: none;
  }
  .wq-toast {
    position: fixed; top: 58px; left: 50%; transform: translateX(-50%);
    z-index: 25; background: #fdf9f0; color: #4a3428;
    border: 3px solid #4a3428; border-radius: 14px;
    box-shadow: 0 4px 0 rgba(74, 52, 40, 0.35);
    padding: 9px 18px; font: italic 15px Georgia, serif;
    opacity: 0; transition: opacity 0.4s; pointer-events: none;
    max-width: 80vw; text-align: center;
  }
  .wq-dialogue {
    /* Top half: on a phone the bottom of the screen is thumbs and controls,
       and a card down there covers the person who is speaking. */
    position: fixed; left: 50%; transform: translateX(-50%);
    top: max(14px, env(safe-area-inset-top));
    width: min(560px, calc(100vw - 28px));
    z-index: 30; box-sizing: border-box;
    background: #fdf9f0; color: #4a3428;
    border: 4px solid #4a3428; border-radius: 18px;
    box-shadow: 0 5px 0 rgba(74, 52, 40, 0.4);
    padding: 26px 20px 16px; font: 17px/1.5 Georgia, serif;
    min-height: 78px;
    /* Taps fall through to the full-screen catcher underneath, so the card —
       right where a thumb rests — advances the dialogue instead of eating it. */
    pointer-events: none;
  }
  .wq-dialogue .wq-name {
    /* In flow rather than absolute: a long name wraps to two lines and pushes
       the text down instead of sitting on top of it. */
    display: inline-block;
    margin: -36px 0 10px;
    background: #4a3428; color: #fdf9f0;
    border-radius: 999px; padding: 5px 16px;
    font-size: 13px; line-height: 1.35; letter-spacing: 1px; text-transform: uppercase;
  }
  .wq-dialogue .wq-maps {
    display: inline-block; margin: 11px 0 1px; padding: 6px 15px;
    color: #4a3428; text-decoration: none;
    background: #fff4e2; border: 2px solid #4a3428; border-radius: 999px;
    box-shadow: 0 2px 0 rgba(74, 52, 40, 0.35);
    font: 15px/1.3 Georgia, serif;
    /* The single exception to the card's pointer-events: none. It is small,
       sits in the text rather than where a thumb rests, and only appears once
       its page has finished typing — and that page then waits for a tap, so
       the button cannot vanish mid-reach. Everywhere else on the card, taps
       still fall through to the catcher and advance the dialogue. */
    pointer-events: auto;
  }
  .wq-dialogue .wq-maps:active { transform: translateY(2px); box-shadow: none; }
  .wq-dialogue .wq-more {
    display: block; text-align: right; margin-top: 10px;
    color: #8c7460; font-size: 13px; animation: wq-blink 1.1s infinite;
  }
  @keyframes wq-blink { 50% { opacity: 0.2; } }
  .wq-tapcatcher { position: fixed; inset: 0; z-index: 29; }
  .wq-btn {
    position: fixed; z-index: 12; border-radius: 50%;
    width: 64px; height: 64px;
    display: flex; align-items: center; justify-content: center;
    background: #fdf9f0; border: 3px solid #4a3428;
    box-shadow: 0 4px 0 rgba(74, 52, 40, 0.45);
    color: #4a3428; font-size: 26px;
    user-select: none; -webkit-user-select: none; touch-action: none;
    bottom: max(22px, env(safe-area-inset-bottom));
  }
  .wq-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(74, 52, 40, 0.45); }
  .wq-btn-left { left: 16px; }
  .wq-btn-right { left: 94px; }
  .wq-btn-jump { right: 16px; width: 72px; height: 72px; font-size: 32px; }
  .wq-btn-talk {
    right: 26px; bottom: max(120px, calc(env(safe-area-inset-bottom) + 98px));
    background: #e0576f; color: #fff;
  }
  .wq-doors {
    position: fixed; left: 50%; top: 68%; transform: translateX(-50%);
    z-index: 26; display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;
    width: max-content; max-width: calc(100vw - 32px);
  }
  .wq-door {
    padding: 11px 22px; border-radius: 999px;
    border: 3px solid #4a3428; background: #fdf9f0; color: #4a3428;
    box-shadow: 0 4px 0 rgba(74, 52, 40, 0.45);
    font: 17px Georgia, serif; cursor: pointer;
  }
  .wq-door-go { background: #e0576f; color: #fff; }
  .wq-door:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(74, 52, 40, 0.45); }
  .wq-overlay {
    position: fixed; inset: 0; z-index: 40;
    background: rgba(20, 14, 28, 0.6);
    display: flex; align-items: center; justify-content: center;
  }
  .wq-card {
    background: #fdf9f0; color: #4a3428;
    width: min(420px, calc(100vw - 40px)); max-height: 88vh;
    overflow-y: auto; overflow-x: hidden;
    border: 4px solid #4a3428; border-radius: 20px; box-sizing: border-box;
    box-shadow: 0 8px 0 rgba(74, 52, 40, 0.45), 0 18px 44px rgba(0, 0, 0, 0.4);
    padding: 22px 24px 16px; text-align: center; font: 16px/1.55 Georgia, serif;
  }
  .wq-card h1 { font-size: 27px; margin: 4px 0 2px; color: #c9455c; font-weight: normal; }
  .wq-card h1 .wq-name { white-space: nowrap; }
  .wq-card .wq-events { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 26px; }
  /* Column, so the map buttons line up along the bottom of the row even when
     one address wraps to two lines and the other doesn't. */
  .wq-card .wq-event { flex: 1 1 236px; min-width: 236px; display: flex; flex-direction: column; }
  .wq-card .wq-event .wq-maps { margin-top: auto; align-self: center; }
  /* Wide enough for two events abreast: widen the invitation and let the row
     split. Narrower than this the blocks stack, which is what a phone wants. */
  @media (min-width: 720px) {
    .wq-invite { width: min(680px, calc(100vw - 40px)); }
  }
  .wq-card .wq-sec {
    margin: 2px 0 7px; color: #c9455c; font-weight: normal;
    font: 13px Georgia, serif; letter-spacing: 2px; text-transform: uppercase;
  }
  .wq-card .wq-maps {
    display: inline-block; margin: 8px 0 2px; padding: 5px 13px;
    color: #4a3428; text-decoration: none;
    border: 2px solid #4a3428; border-radius: 999px;
    box-shadow: 0 2px 0 rgba(74, 52, 40, 0.35);
    font: 15px/1.3 Georgia, serif;
  }
  .wq-card .wq-maps:active { transform: translateY(2px); box-shadow: none; }
  .wq-card .wq-sub { font-style: italic; color: #8a7a6a; margin-bottom: 14px; }
  .wq-card p { margin: 4px 0; }
  /* Blank lines in the invitation group the card into blocks. A full empty
     line each costs more height than the grouping is worth on a short screen. */
  .wq-card p.wq-gap { margin: 0; height: 11px; }
  .wq-shop { text-align: left; }
  .wq-shop h1, .wq-shop .wq-sub { text-align: center; }
  .wq-gift {
    display: block; width: 100%; text-align: left; box-sizing: border-box;
    margin: 10px 0 0; padding: 12px 14px;
    background: #fff9ec; color: #4a3428;
    border: 3px solid #4a3428; border-radius: 12px;
    box-shadow: 0 3px 0 rgba(74, 52, 40, 0.35);
    font: 15px/1.4 Georgia, serif; cursor: pointer;
  }
  .wq-gift:disabled { opacity: 0.5; cursor: default; box-shadow: none; }
  .wq-gift:not(:disabled):active { transform: translateY(3px); box-shadow: none; }
  .wq-gift-head { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; }
  .wq-gift-name { font-size: 17px; }
  .wq-gift-price { color: #c9455c; white-space: nowrap; }
  .wq-gift-note { margin-top: 4px; font-size: 13.5px; font-style: italic; color: #8a7a6a; }
  /* The footer sticks, so the card can always be dismissed. The invitation is
     taller than a phone held sideways — which is how the game asks to be
     played — and a button in the flow sits below the fold, on a card most
     people won't think to scroll. It is the band rather than the button that
     sticks: the band spans the full width, so the lines still to be scrolled
     pass behind the whole row instead of appearing either side of the pill. */
  .wq-card .wq-foot {
    position: sticky; bottom: -16px; z-index: 1;
    margin: 14px -24px -16px; padding: 10px 24px 14px;
    background: #fdf9f0;
  }
  .wq-card .wq-close {
    padding: 10px 24px; border-radius: 999px;
    border: 3px solid #4a3428; background: #e0576f; color: #fff;
    box-shadow: 0 4px 0 rgba(74, 52, 40, 0.45);
    font: 16px Georgia, serif; cursor: pointer;
  }
  .wq-card .wq-close:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(74, 52, 40, 0.45); }
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
