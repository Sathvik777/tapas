/**
 * Who this particular link was sent to.
 *
 * The name rides in the URL — `?to=Anders%20%26%20Eva` — rather than living in
 * a guest list in the repo. The repo is public, so a list of everyone invited
 * would be published along with it; a link only ever knows about the person it
 * was sent to. It also means a new invitation is a new URL and nothing else.
 */

/** Long enough for "Anders & Eva Lindqvist", short enough not to wreck a card. */
const MAX_LENGTH = 60;

export function readGuestName(): string | null {
  try {
    const raw = new URLSearchParams(window.location.search).get('to');
    if (!raw) return null;
    // This string is whatever was in the address bar, and it goes straight onto
    // the invitation. It only ever reaches the page through textContent, so the
    // tidying here is about layout, not safety: no control characters, no runs
    // of whitespace, no essay.
    const name = raw
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_LENGTH)
      .trim();
    return name || null;
  } catch {
    return null;
  }
}
