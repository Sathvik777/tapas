import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { WorldScene } from './scenes/WorldScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#1a1423',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [BootScene, TitleScene, WorldScene],
});

/**
 * Give the page a height it can trust, and keep the canvas matched to it.
 *
 * On a phone the game used to open above a dark band with the bottom of the
 * frame cut off, and backgrounding the browser and returning cleared it. That
 * rules out Phaser: `Scale.RESIZE` already re-measures its parent every half
 * second, so if the parent box were right it would have corrected itself
 * without any help. The box was the thing that was wrong — iOS Safari resolves
 * CSS viewport heights against the viewport the page loaded with, and leaves
 * even `dvh` stale until something forces a re-layout. Returning from the
 * background is exactly such a re-layout, which is why that appeared to fix it.
 *
 * `visualViewport.height` is what iOS reports the *visible* area through, and
 * it updates as the address bar moves. So the height is measured from there and
 * written to `--app-height`, which index.html sizes the page with.
 */
const parent = document.getElementById('game');
if (parent) {
  const sync = () => {
    const h = Math.round(window.visualViewport?.height ?? window.innerHeight);
    if (h > 0) document.documentElement.style.setProperty('--app-height', `${h}px`);

    const { clientWidth: w, clientHeight: boxH } = parent;
    if (w > 0 && boxH > 0 && (w !== game.scale.width || boxH !== game.scale.height)) {
      game.scale.resize(w, boxH);
    }
  };

  const vv = window.visualViewport;
  vv?.addEventListener('resize', sync);
  vv?.addEventListener('scroll', sync);
  window.addEventListener('resize', sync);
  window.addEventListener('orientationchange', sync);
  // Coming back from the background is where this used to correct itself.
  window.addEventListener('pageshow', sync);
  document.addEventListener('visibilitychange', sync);
  // The address bar settles over the first moment of a cold load, and none of
  // the events above necessarily fire while it does.
  sync();
  for (const delay of [50, 250, 600, 1200]) setTimeout(sync, delay);
}
