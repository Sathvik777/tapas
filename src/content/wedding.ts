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
  /** shown under the name on the dialogue card, e.g. "the bride's grandmother" */
  role: string;
  sprite: string;
  /** column in the level where this NPC stands (they stand on the ground) */
  tx: number;
  pages: string[];
}

/**
 * The people you meet, in the order you meet them. Names are placeholders —
 * swap in your real family and the dialogue reads as itself. Each one owns one
 * piece of the invitation, so guests can't finish without meeting everybody.
 */
export const NPCS: NpcDef[] = [
  {
    id: 'save-the-date',
    name: `[Mormor's name]`,
    role: `${COUPLE.partner2}'s grandmother`,
    sprite: 'char-npc-mormor',
    tx: 12,
    pages: [
      `Åh, a visitor! You must be here for ${COUPLE.partner2} and ${COUPLE.partner1}. Come, walk with me a while.`,
      `Mark your calendar: ${WEDDING.date}, ${WEDDING.time}. I have been waiting years for this one.`,
    ],
  },
  {
    id: 'venue',
    name: `[Ammamma's name]`,
    role: `${COUPLE.partner1}'s grandmother`,
    sprite: 'char-npc-ammamma',
    tx: 30,
    pages: [
      `So you have met the other grandmother already! Good. We have been planning this together, she and I.`,
      `The wedding is at ${WEDDING.venue} — ${WEDDING.address}. ${WEDDING.mapsHint}`,
    ],
  },
  {
    id: 'story',
    name: `[Cousin's name]`,
    role: 'playing the nadaswaram',
    sprite: 'char-npc-musician',
    tx: 68,
    pages: [
      `I am practising for the procession. Do you want to hear how those two met?`,
      `[Write your how-we-met story here — where you first met, the proposal, a fun fact or two.]`,
      `Two families, one tune. It took some rehearsing. ♪`,
    ],
  },
  {
    id: 'dress-code',
    name: `[Sister's name]`,
    role: 'flowers and garlands',
    sprite: 'char-npc-florist',
    tx: 100,
    pages: [
      `Marigolds from one side, midsummer wildflowers from the other. They look good together, don't they?`,
      `Dress code: ${WEDDING.dressCode}. Wear whatever makes you feel like dancing.`,
    ],
  },
  {
    id: 'food',
    name: `[Friend's name]`,
    role: 'in charge of the sweets',
    sprite: 'char-npc-baker',
    tx: 135,
    pages: [
      `Taste test! There will be prinsesstårta AND a tray of sweets, because nobody could agree.`,
      `[Add a line about the food — the caterer, a family recipe, the thing you're most excited to eat.]`,
    ],
  },
  {
    id: 'rsvp',
    name: `[Little one's name]`,
    role: 'ring bearer',
    sprite: 'char-npc-kid',
    tx: 155,
    pages: [
      `I'm carrying the rings!! I have been practising walking slowly for WEEKS.`,
      `Oh! Grown-up thing: please RSVP by ${WEDDING.rsvpBy} — ${WEDDING.rsvpHow}.`,
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
