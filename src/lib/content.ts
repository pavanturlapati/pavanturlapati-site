import { getCollection } from "astro:content";
import films from "../../data/letterboxd.json";
import vedanta from "../../data/vedanta.json";
import chesscom from "../../data/chesscom.json";

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

export const getJournal = async () =>
  (await getCollection("journal", published)).sort(newestFirst);

/** Archive order is the file order; the Quotes page shuffles it anyway. */
export const getQuotes = async () =>
  (await getCollection("quotes")).map((entry) => ({
    id: entry.data.id,
    text: entry.data.text,
  }));

export const getNotes = async () =>
  (await getCollection("notes", published)).sort(newestFirst);

export const getProjects = async () =>
  (await getCollection("projects", published)).sort(newestFirst);

export const getAnimation = async () =>
  (await getCollection("animation", published)).sort(newestFirst);

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

export type ChessRating = {
  rating: number;
  best: number | null;
  win: number;
  loss: number;
  draw: number;
};

export type ChessGame = {
  url: string;
  endedAt: string;
  timeClass: string;
  color: "white" | "black";
  result: "win" | "loss" | "draw";
  rating: number;
  opponent: string;
  opponentRating: number;
  opening: string | null;
};

export type ChessProfile = {
  username: string;
  profileUrl: string;
  followers: number;
  joinedAt: string;
  ratings: Record<"rapid" | "blitz" | "bullet" | "daily", ChessRating | null>;
  tactics: number | null;
  totalGames: number;
  rapidHistory: { date: string; rating: number }[];
  openings: {
    name: string;
    color: "white" | "black";
    games: number;
    win: number;
    loss: number;
    draw: number;
  }[];
  games: ChessGame[];
};

export type VedantaPost = {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
};

/** Posts from vedanta.pavanturlapati.com, kept up to date by scripts/sync-vedanta.mjs. */
export const getVedantaPosts = (): VedantaPost[] => vedanta as VedantaPost[];

/** Chess.com ratings and recent games, kept up to date by scripts/sync-chesscom.mjs. */
export const getChess = (): ChessProfile => chesscom as ChessProfile;

/** Letterboxd history, kept up to date by scripts/sync-letterboxd.mjs. */
export const getFilms = (): Film[] => films as Film[];
