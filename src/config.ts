/**
 * Single source of truth for identity, navigation and social links.
 */

export const site = {
  name: "Pavan Turlapati",
  title: "Pavan Turlapati",
  tagline:
    "Quality engineering and delivery leader. I write about building confidence into digital products, and about Vedanta and life.",
  description:
    "Articles, short notes, film reviews and résumé of Pavan Turlapati, a Digital Quality Engineering and delivery leader.",
  url: "https://pavanturlapati.com",
  email: "pavanturlapati@gmail.com",
  location: "Atlanta, Georgia",
} as const;

export const vedantaUrl = "https://vedanta.pavanturlapati.com/";

/**
 * Allowed article tags. A fixed list means a typo fails the build instead of
 * silently creating a new tag. Add a tag here before using it.
 */
export const articleTags = [
  "technical",
  "quality",
  "leadership",
  "vedanta",
  "life",
] as const;

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

/** Primary navigation. `external` links open in the same tab (own domain). */
export const nav = [
  { label: "Writing", href: "/writing/" },
  { label: "Notes", href: "/notes/" },
  { label: "Watching", href: "/watching/" },
  { label: "Feed", href: "/feed/" },
  { label: "Résumé", href: "/resume/" },
  { label: "Vedanta", href: vedantaUrl, external: true },
] as const;
