#!/usr/bin/env node
/**
 * Pulls ratings and games for ptspam from the public Chess.com API
 * (https://www.chess.com/news/view/published-data-api) into data/chesscom.json.
 *
 * It overwrites rather than merges: the API keeps the full history, so there
 * is nothing to lose. It reads every monthly archive and keeps the latest
 * ratings, a daily rapid rating history (for the chart), opening stats, and
 * the last GAME_LIMIT games (for the form strip).
 *
 * No dependencies; needs Node 18+ (built-in fetch).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const USER = "ptspam";
const API = `https://api.chess.com/pub/player/${USER}`;
const GAME_LIMIT = 30;
const MIN_OPENING_GAMES = 20;
const TOP_OPENINGS = 5;
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

/**
 * "…/openings/Caro-Kann-Defense-2.Nf3-d5" -> "Caro-Kann Defense".
 * Variations are collapsed to the family: the name stops at the first word
 * that ends a family name (Defense, Game, Opening, Gambit, Attack...).
 */
function openingName(url) {
  const slug = url?.split("/openings/")[1];
  if (!slug) return null;
  const words = slug.split(/-?\d+\./)[0].split("-").filter(Boolean);
  const end = words.findIndex((w) =>
    /^(Defense|Defence|Game|Opening|Gambit|Attack|System|Countergambit)$/.test(
      w,
    ),
  );
  const family = end === -1 ? words.slice(0, 2) : words.slice(0, end + 1);
  const name = family.join(" ");
  return name || null;
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

  // Read every month, one at a time (Chess.com asks for serial requests).
  const all = [];
  for (const url of archives) {
    const month = await get(url);
    all.push(...month.games.map(parseGame).filter(Boolean));
  }
  all.sort((a, b) => b.endedAt.localeCompare(a.endedAt));

  // Rapid rating history: the last rating of each day, oldest first.
  const perDay = new Map();
  for (const g of [...all].reverse()) {
    if (g.timeClass === "rapid") perDay.set(g.endedAt.slice(0, 10), g.rating);
  }
  const rapidHistory = [...perDay].map(([date, value]) => ({
    date,
    rating: value,
  }));

  // Opening stats per colour, for openings played often enough to mean something.
  const byOpening = new Map();
  for (const g of all) {
    if (!g.opening) continue;
    const key = `${g.color}|${g.opening}`;
    const entry = byOpening.get(key) ?? {
      name: g.opening,
      color: g.color,
      games: 0,
      win: 0,
      loss: 0,
      draw: 0,
    };
    entry.games++;
    entry[g.result]++;
    byOpening.set(key, entry);
  }
  const openings = ["white", "black"].flatMap((color) =>
    [...byOpening.values()]
      .filter((o) => o.color === color && o.games >= MIN_OPENING_GAMES)
      .sort((a, b) => b.games - a.games)
      .slice(0, TOP_OPENINGS),
  );

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
        totalGames: all.length,
        rapidHistory,
        openings,
        games: all.slice(0, GAME_LIMIT),
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
  console.log(
    `Read ${all.length} games: ${rapidHistory.length} history points, ${openings.length} openings.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
