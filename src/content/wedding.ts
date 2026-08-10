/**
 * ALL wedding text lives in this one file.
 * Replace the [bracketed] placeholders with your real details when ready.
 * (Remember: this repo is public — only commit details you're happy to share.)
 */

export const COUPLE = {
  partner1: '[Groom]',
  partner2: '[Bride]',
  hashtag: '#[YourWeddingHashtag]',
};

export const WEDDING = {
  date: 'Saturday, [Month] [DD], [YYYY]',
  time: '[4:00 PM] onwards',
  venue: '[Venue Name]',
  address: '[Street, City, State]',
  mapsHint: '[e.g. "10 min from the airport, parking on site"]',
  dressCode: '[Festive / Traditional / Pastels]',
  rsvpBy: '[Month DD, YYYY]',
  rsvpHow: '[RSVP link or phone number]',
};

export interface NpcDef {
  id: string;
  name: string;
  sprite: string;
  /** column in the level where this NPC stands (they stand on the ground) */
  tx: number;
  pages: string[];
}

export const NPCS: NpcDef[] = [
  {
    id: 'save-the-date',
    name: 'Granny Rosa',
    sprite: 'char-npc-elder',
    tx: 12,
    pages: [
      `Oh, a visitor! You must be here for the big day. ${COUPLE.partner1} and ${COUPLE.partner2} are getting married!`,
      `Mark your calendar: ${WEDDING.date}, ${WEDDING.time}. Don't be late — I certainly won't be!`,
    ],
  },
  {
    id: 'venue',
    name: 'Baker Bo',
    sprite: 'char-npc-baker',
    tx: 30,
    pages: [
      `Smell that? I'm baking the wedding cake! The celebration is at ${WEDDING.venue}.`,
      `That's ${WEDDING.address}. ${WEDDING.mapsHint}`,
    ],
  },
  {
    id: 'story',
    name: 'Melody',
    sprite: 'char-npc-musician',
    tx: 68,
    pages: [
      `I'm rehearsing their first-dance song! Want to hear how they met?`,
      `[Write your how-we-met story here — where you first met, the proposal, a fun fact or two.]`,
      `Every love song I know, and theirs is still my favorite. ♪`,
    ],
  },
  {
    id: 'dress-code',
    name: 'Fern the Florist',
    sprite: 'char-npc-florist',
    tx: 100,
    pages: [
      `These flowers are for the wedding arch! Between you and me, the theme is lovely.`,
      `Dress code: ${WEDDING.dressCode}. You'll fit right into the photos!`,
    ],
  },
  {
    id: 'rsvp',
    name: 'Little Pip',
    sprite: 'char-npc-kid',
    tx: 135,
    pages: [
      `I'm the ring bearer!! I've been practicing walking slowly for WEEKS.`,
      `Oh! Important grown-up stuff: please RSVP by ${WEDDING.rsvpBy} — ${WEDDING.rsvpHow}.`,
    ],
  },
];

export const SIGNPOST = {
  locked: [
    'The signpost is covered in ribbons... it looks like an invitation, but some parts are missing.',
    'Maybe the villagers know more. Talk to everyone first! 💌',
  ],
  unlockedIntro: [
    'You gathered every detail! The invitation is complete... ✨',
  ],
};

export const INVITATION_LINES = [
  `${COUPLE.partner1} ♥ ${COUPLE.partner2}`,
  'joyfully invite you to their wedding',
  '',
  `📅  ${WEDDING.date}`,
  `🕓  ${WEDDING.time}`,
  `📍  ${WEDDING.venue}`,
  `${WEDDING.address}`,
  '',
  `👗  Dress code: ${WEDDING.dressCode}`,
  `💌  RSVP by ${WEDDING.rsvpBy}`,
  `${WEDDING.rsvpHow}`,
  '',
  `${COUPLE.hashtag}`,
];
