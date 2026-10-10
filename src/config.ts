/**
 * Single source of truth for identity, navigation and social links.
 */

export const site = {
  name: "Pavan Turlapati",
  title: "Pavan Turlapati",
  tagline:
    "Quality engineering and delivery leader. I write about building confidence into digital products, and about Vedanta and life.",
  description:
    "Articles, journal entries, short opinions, quotes, film reviews and résumé of Pavan Turlapati, a Digital Quality Engineering and delivery leader.",
  url: "https://pavanturlapati.com",
  email: "pavanturlapati@gmail.com",
  location: "Atlanta, Georgia",
} as const;

export const vedantaUrl = "https://vedanta.pavanturlapati.com/";

/**
 * Analytics. Leave an ID empty to turn that tool off. Neither is loaded in
 * `npm run dev`, only in production builds.
 *
 * - cloudflareToken: Cloudflare dashboard > Analytics & Logs > Web analytics >
 *   Add a site > the `token` inside the snippet's data-cf-beacon.
 * - googleMeasurementId: Google Analytics 4 > Admin > Data streams > Web >
 *   Measurement ID (looks like G-XXXXXXXXXX).
 */
export const analytics = {
  cloudflareToken: "",
  googleMeasurementId: "",
} as const;

/**
 * Allowed tags. A fixed list means a typo fails the build instead of
 * silently creating a new tag. Add a tag here before using it.
 *
 * Articles are professional writing; the journal is personal writing.
 */
export const articleTags = ["technical", "quality", "leadership"] as const;

export const journalTags = ["vedanta", "life", "story"] as const;

/** Allowed quote categories (optional per quote, not shown on the page). */
export const quoteCategories = [
  "Life",
  "Vedanta",
  "Work",
  "Learning",
  "Movies",
  "People",
  "Random",
] as const;

/** How many quotes the Quotes page shows at a time. */
export const quoteSetSize = 5;

export const socials = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/pavanturlapati/",
  },
  { label: "GitHub", href: "https://github.com/pavanturlapati" },
  { label: "X", href: "https://x.com/ptx56_s56" },
  { label: "Letterboxd", href: "https://letterboxd.com/infi56/" },
  { label: "Instagram", href: "https://www.instagram.com/dpt4u56/" },
] as const;

export type NavLink = {
  label: string;
  href: string;
  /** Links to another site (the Vedanta notes). */
  external?: boolean;
};

export type NavGroup = { label: string; children: readonly NavLink[] };

/** Primary navigation. A group renders as a dropdown. */
export const nav: readonly (NavLink | NavGroup)[] = [
  { label: "Articles", href: "/articles/" },
  { label: "Projects", href: "/projects/" },
  { label: "Weekly", href: "/weekly/" },
  { label: "Résumé", href: "/resume/" },
  {
    label: "Personal",
    children: [
      { label: "Journal", href: "/journal/" },
      { label: "Opinion", href: "/opinion/" },
      { label: "Quotes", href: "/quotes/" },
      { label: "Hobbies", href: "/hobbies/" },
    ],
  },
  { label: "Vedanta", href: vedantaUrl, external: true },
];
