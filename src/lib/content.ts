import { getCollection } from "astro:content";
import films from "../../data/letterboxd.json";

/**
 * Drafts are visible in `npm run dev` for previewing, and always excluded
 * from production builds.
 */
const published = <T extends { data: { draft: boolean } }>(entry: T) =>
  import.meta.env.DEV || !entry.data.draft;

/** Newest first; ties broken by id so same-day entries order predictably. */
const newestFirst = <T extends { id: string; data: { date: Date } }>(
  a: T,
  b: T,
) =>
  b.data.date.getTime() - a.data.date.getTime() || b.id.localeCompare(a.id);

export const getArticles = async () =>
  (await getCollection("articles", published)).sort(newestFirst);

export const getNotes = async () =>
  (await getCollection("notes", published)).sort(newestFirst);

export const getProjects = async () =>
  (await getCollection("projects", published)).sort(newestFirst);

export const getWeekly = async () =>
  (await getCollection("weekly", published)).sort(newestFirst);

export type Film = {
  id: string;
  kind: "review" | "watch";
  title: string;
  year: number | null;
  rating: number | null;
  watchedDate: string | null;
  rewatch: boolean;
  liked: boolean;
  url: string;
  review: string | null;
  publishedAt: string;
};

/** Letterboxd history, kept up to date by scripts/sync-letterboxd.mjs. */
export const getFilms = (): Film[] => films as Film[];
