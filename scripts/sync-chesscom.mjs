#!/usr/bin/env node
/**
 * Pulls ratings and recent games for ptspam from the public Chess.com API
 * (https://www.chess.com/news/view/published-data-api) into data/chesscom.json.
 *
 * Unlike the Letterboxd sync this overwrites rather than merges: the API keeps
 * the full history, so there is nothing to lose. We keep the latest ratings
 * and the last GAME_LIMIT games.
 *
 * No dependencies; needs Node 18+ (built-in fetch).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const USER = "ptspam";
const API = `https://api.chess.com/pub/player/${USER}`;
const GAME_LIMIT = 20;
const OUT_FILE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../data/chesscom.json",
);

// Chess.com asks API users to identify themselves.
const headers = {
  "User-Agent": "pt-site-chesscom-sync/1.0 (https://pavanturlapati.com)",
};

async function get(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

const DRAWS = new Set([
  "agreed",
  "repetition",
  "stalemate",
  "insufficient",
  "50move",
  "timevsinsufficient",
]);

const outcome = (result) =>
  result === "win" ? "win" : DRAWS.has(result) ? "draw" : "loss";

/** "…/openings/Caro-Kann-Defense-2.Nf3-d5" -> "Caro-Kann Defense". */
function openingName(url) {
  const slug = url?.split("/openings/")[1];
  if (!slug) return null;
  const words = slug.split(/-?\d+\./)[0].replace(/-/g, " ").trim();
  return words || null;
}

function parseGame(game) {
  if (game.rules !== "chess") return null;
  const mine = game.white.username.toLowerCase() === USER ? "white" : "black";
  const theirs = mine === "white" ? "black" : "white";
  return {
    url: game.url,
    endedAt: new Date(game.end_time * 1000).toISOString(),
    timeClass: game.time_class,
    color: mine,
    result: outcome(game[mine].result),
    rating: game[mine].rating,
    opponent: game[theirs].username,
    opponentRating: game[theirs].rating,
    opening: openingName(game.eco),
  };
}

const rating = (mode) =>
  mode?.last
    ? {
        rating: mode.last.rating,
        best: mode.best?.rating ?? null,
        win: mode.record.win,
        loss: mode.record.loss,
        draw: mode.record.draw,
      }
    : null;

async function main() {
  const [profile, stats, { archives }] = await Promise.all([
    get(API),
    get(`${API}/stats`),
    get(`${API}/games/archives`),
  ]);

  // Walk archives newest-first until we have enough games.
  const games = [];
  for (const url of [...archives].reverse()) {
    const month = await get(url);
    const parsed = month.games.map(parseGame).filter(Boolean);
    games.push(...parsed.sort((a, b) => b.endedAt.localeCompare(a.endedAt)));
    if (games.length >= GAME_LIMIT) break;
  }

  const output =
    JSON.stringify(
      {
        username: USER,
        profileUrl: profile.url,
        followers: profile.followers,
        joinedAt: new Date(profile.joined * 1000).toISOString(),
        ratings: {
          rapid: rating(stats.chess_rapid),
          blitz: rating(stats.chess_blitz),
          bullet: rating(stats.chess_bullet),
          daily: rating(stats.chess_daily),
        },
        tactics: stats.tactics?.highest?.rating ?? null,
        games: games.slice(0, GAME_LIMIT),
      },
      null,
      2,
    ) + "\n";

  let previous = null;
  try {
    previous = await readFile(OUT_FILE, "utf8");
  } catch {}
  if (previous === output) {
    console.log("No changes.");
    return;
  }
  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, output);
  console.log(`Wrote stats and ${Math.min(games.length, GAME_LIMIT)} games.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
