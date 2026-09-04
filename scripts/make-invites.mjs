#!/usr/bin/env node
/**
 * Turns guest names into addressed invitation links.
 *
 *   node scripts/make-invites.mjs "Veeru & Sowjanya" "Sasank"
 *   node scripts/make-invites.mjs --file guests.txt          (one name per line)
 *   node scripts/make-invites.mjs --base https://…/ "Mormor"
 *
 * The whole job is `encodeURIComponent`, which is easy to get wrong by hand:
 * an unescaped `&` ends the parameter and the second half of a couple silently
 * disappears from the card. This does it once, correctly, and prints a line you
 * can paste into a message.
 *
 * Names are arguments, never a file in this repo. The repo is public and a
 * committed guest list would be published with it — see the README.
 */

import { readFileSync } from 'node:fs';

/** The preview deployment from the README; override with --base. */
const DEFAULT_BASE = 'https://tapas-git-claude-wedding-game-poc-n3638n-sathvik777s-projects.vercel.app';

/** Matches MAX_LENGTH in src/guest.ts — longer names are cut on the card. */
const MAX_LENGTH = 60;

const args = process.argv.slice(2);
let base = DEFAULT_BASE;
const names = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--base') base = args[++i] ?? base;
  else if (arg === '--file') names.push(...readFileSync(args[++i], 'utf8').split('\n'));
  else names.push(arg);
}

const cleaned = names.map((n) => n.replace(/\s+/g, ' ').trim()).filter(Boolean);

if (!cleaned.length) {
  console.error('usage: node scripts/make-invites.mjs [--base URL] [--file names.txt] "Name" ...');
  process.exit(1);
}

const origin = base.replace(/\/+$/, '');
for (const name of cleaned) {
  if (name.length > MAX_LENGTH) {
    console.error(`! "${name}" is ${name.length} characters; the card keeps the first ${MAX_LENGTH}.`);
  }
  console.log(`${name}\n  ${origin}/?to=${encodeURIComponent(name)}`);
}
