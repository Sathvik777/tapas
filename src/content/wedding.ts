/**
 * ALL wedding text lives in this one file.
 * Replace the [bracketed] placeholders with your real details when ready.
 * (Remember: this repo is public — only commit details you're happy to share.)
 */

import { readGuestName } from '../guest';

/**
 * Who this link was sent to, from `?to=` — see `src/guest.ts`. Null for a link
 * with no name on it, and every line below has to still read properly then,
 * because that is the link anyone forwards to anyone else.
 */
export const GUEST = readGuestName();

/**
 * `partner1` / `partner2` are the everyday names — villagers use them in
 * conversation, so they should read the way a grandmother would say them.
 * The `*Full` forms are for the invitation card, where the full name belongs.
 */
export const COUPLE = {
  partner1: 'Sathvik',
  partner2: 'Samina',
  partner1Full: 'Sathvik Katam',
  partner2Full: 'Samina Dahlberg',
  hashtag: '#[YourWeddingHashtag]',
};

/**
 * The haldi, two days before, at his parents' house. It has its own map link
 * because the address is a landmark rather than a street — "near the government
 * hospital" is how you say where a village house is, and it is not something a
 * guest can type into a phone.
 */
export const HALDI = {
  date: 'Monday, October 12, 2026',
  time: '9:00 AM onwards',
  venue: `${COUPLE.partner1}'s family home`,
  address: 'Near Cherial Government Hospital, Close to BD Colony, Cherial',
  mapsUrl: 'https://maps.app.goo.gl/SRhkB7F6FoQvq9vu7',
};

export const WEDDING = {
  date: 'Wednesday, October 14, 2026',
  time: '8:30 AM onwards',
  venue: 'Pawar Convention',
  // Maps lists the locality twice, once per spelling ("Vishwanathapalle,
  // Viswanathapalle") — the village and the mandal it names. Printed on a card
  // that reads as a typo, so the line carries it once. The map link is what
  // anyone actually navigates by.
  address: 'Vishwanathapalle, Telangana 502277, India',
  mapsHint: '[e.g. "10 min from the airport, parking on site"]',
  /** Tapped from the invitation card. Empty string hides the link. */
  mapsUrl: 'https://maps.app.goo.gl/v8kZeBMn2J93YpNi9',
  dressCode: '[Festive / Traditional / Pastels]',
  rsvpBy: '[Month DD, YYYY]',
  rsvpHow: '[RSVP link or phone number]',
};

/**
 * A page of dialogue. Give one a `link` and a tappable button appears under the
 * text once it has finished typing — which is how both venues are handed over,
 * since neither address is one a guest could navigate by on its own.
 *
 * A page with a link does not move on by itself; it waits for a tap, so the
 * button cannot slide away while someone is reaching for it.
 */
export type Page = string | { text: string; link: { text: string; href: string } };

export interface NpcDef {
  id: string;
  name: string;
  /**
   * Shown after the name on the dialogue card, e.g. "the bride's grandmother".
   * Optional: a name that already says the relationship doesn't need it.
   */
  role?: string;
  sprite: string;
  /** column in the level where this NPC stands (they stand on the ground) */
  tx: number;
  pages: Page[];
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
    // Not a placeholder, and no role after it: Pedhamma is what you call her,
    // and it already says who she is.
    name: 'Pedhamma',
    sprite: 'char-npc-pedhamma',
    tx: 30,
    pages: [
      `So you have met Mormor already! Good. She and I have been planning this between us — one wedding, two families' worth of opinions.`,
      {
        text: `We begin at our house — the haldi, ${HALDI.date}, ${HALDI.time}. ${HALDI.address}. Little lanes out there, so take the map with you.`,
        link: { text: 'Haldi in Maps 🗺️', href: HALDI.mapsUrl },
      },
      {
        text: `Then the wedding itself, at ${WEDDING.venue} — ${WEDDING.address}. ${WEDDING.mapsHint}`,
        link: { text: 'Venue in Maps 🗺️', href: WEDDING.mapsUrl },
      },
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

/**
 * The finale. The two of you are standing under the mandap — talking to you is
 * what completes the invitation, so this is the last thing a guest reads.
 */
export const COUPLE_SCENE = {
  name: `${COUPLE.partner1} & ${COUPLE.partner2}`,
  role: 'the couple',
  /** Before every villager has been met. */
  waiting: [
    `You made it all this way! But you have not met everyone yet — they would never forgive us.`,
    `Go on, say hello to the rest. We are not going anywhere. 💐`,
  ],
  greeting: [
    // Named here too — being recognised by the couple at the end of the walk is
    // worth more than being named again on the way in.
    GUEST
      ? `You found us, ${GUEST}. Thank you for walking all this way to get here.`
      : `You found us. Thank you for walking all this way to get here.`,
    `[Write the line you would want every single guest to read — the two of you, in your own words.]`,
  ],
  /** Only shown if the guest bought something at the stall. */
  giftLine: (gift: string) => `And you brought ${gift}! You really did not have to. We love it.`,
  finale: [`Everything you need is on the invitation. See you on the day. ♥`],
};

/** The gift stall, roughly two thirds of the way along. Hearts are the currency. */
export interface GiftDef {
  id: string;
  label: string;
  price: number;
  /** the shopkeeper's pitch, shown under the gift in the stall */
  note: string;
}

export const SHOP = {
  keeper: `[Stallholder's name]`,
  role: 'gift stall',
  /** Said the first time you come by. */
  intro: [
    `Buying for the couple, are you? Sensible. Turning up empty-handed is a whole conversation with the aunties.`,
    `Hearts along the road are as good as coin here. Pick something they will actually keep.`,
  ],
  broke: [
    `Come back when you have found a few more hearts — they are scattered all along the road, some up on the ledges.`,
  ],
  alreadyBought: (gift: string) => [
    `${gift} — good choice. They will love it.`,
    `Now go on, they are waiting for you under the mandap.`,
  ],
  gifts: [
    {
      id: 'garland',
      label: 'a marigold garland',
      price: 3,
      note: 'Nobody in the history of weddings has regretted more marigolds.',
    },
    {
      id: 'laddus',
      label: 'a box of laddus',
      price: 5,
      note: "Pedhamma's recipe. Bring two boxes if you want to be popular.",
    },
    {
      id: 'dalahorse',
      label: 'a painted dala horse',
      price: 8,
      note: 'Carved and painted in Dalarna. It will sit on their shelf for forty years.',
    },
  ] as GiftDef[],
};

/**
 * A line on the invitation card: plain text, a section heading, or a tappable
 * link. Each event ends in a link, because "which turning was it again" is a
 * question you want a guest's phone to answer, not you.
 */
export type InvitationLine = string | { heading: string } | { text: string; href: string };

export const INVITATION_LINES: InvitationLine[] = [
  `${COUPLE.partner1Full} ♥ ${COUPLE.partner2Full}`,
  // The named line is the whole point of a personal invitation, so the name
  // goes where a printed card would put it — inside the sentence, not in a
  // "Dear ..." bolted on above it.
  GUEST ? `joyfully invite ${GUEST} to their wedding` : 'joyfully invite you to their wedding',
  '',
  // Both events, in the order a guest lives them.
  { heading: 'Haldi' },
  `📅  ${HALDI.date}`,
  `🕓  ${HALDI.time}`,
  `📍  ${HALDI.venue}`,
  `${HALDI.address}`,
  ...(HALDI.mapsUrl ? [{ text: 'Open in Maps 🗺️', href: HALDI.mapsUrl }] : []),
  '',
  { heading: 'Wedding' },
  `📅  ${WEDDING.date}`,
  `🕓  ${WEDDING.time}`,
  `📍  ${WEDDING.venue}`,
  `${WEDDING.address}`,
  ...(WEDDING.mapsUrl ? [{ text: 'Open in Maps 🗺️', href: WEDDING.mapsUrl }] : []),
  '',
  `👗  Dress code: ${WEDDING.dressCode}`,
  `💌  RSVP by ${WEDDING.rsvpBy}`,
  `${WEDDING.rsvpHow}`,
  '',
  `${COUPLE.hashtag}`,
];
