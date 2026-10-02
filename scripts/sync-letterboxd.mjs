#!/usr/bin/env node
/**
 * Pulls the public Letterboxd RSS feed and merges it into data/letterboxd.json.
 *
 * The feed only returns the most recent ~50 entries, so this script *merges*
 * rather than overwrites: older entries already saved in the JSON file are
 * kept forever. Entries that appear again in the feed are refreshed, so edited
 * ratings and reviews are picked up.
 *
 * No dependencies; needs Node 18+ (built-in fetch).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const FEED_URL = "https://letterboxd.com/infi56/rss/";
const OUT_FILE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../data/letterboxd.json",
);

const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name) => entities[name.toLowerCase()] ?? m);
}

/** Text of the first <tag>…</tag>, with CDATA unwrapped. Null if absent. */
function tag(xml, name) {
  const match = xml.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`),
  );
  if (!match) return null;
  const cdata = match[1].match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return cdata ? cdata[1] : decode(match[1]);
}

/**
 * Review text lives in <p> tags inside the description. Drop the poster image
 * paragraph and Letterboxd's own "Watched on …" line; what remains, if
 * anything, is the review.
 */
function reviewText(descriptionHtml) {
  if (!descriptionHtml) return null;
  const paragraphs = [...descriptionHtml.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map(([, inner]) => inner)
    .filter((inner) => !/^\s*<img\b/.test(inner))
    .filter((inner) => !/^\s*Watched on /i.test(inner.replace(/<[^>]+>/g, "")))
    .map((inner) =>
      decode(inner.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).trim(),
    )
    .filter(Boolean)
    .filter((text) => !/^This review may contain spoilers\.?$/i.test(text));
  return paragraphs.length ? paragraphs.join("\n\n") : null;
}

function parseItem(itemXml) {
  const id = tag(itemXml, "guid");
  const kind = id?.match(/^letterboxd-(watch|review)-/)?.[1];
  if (!id || !kind) return null; // skips lists and anything else

  const rating = tag(itemXml, "letterboxd:memberRating");
  const year = tag(itemXml, "letterboxd:filmYear");
  const published = new Date(tag(itemXml, "pubDate") ?? "");

  return {
    id,
    kind,
    title: tag(itemXml, "letterboxd:filmTitle") ?? tag(itemXml, "title") ?? "",
    year: year ? Number(year) : null,
    rating: rating ? Number(rating) : null,
    watchedDate: tag(itemXml, "letterboxd:watchedDate"),
    rewatch: tag(itemXml, "letterboxd:rewatch") === "Yes",
    liked: tag(itemXml, "letterboxd:memberLike") === "Yes",
    url: tag(itemXml, "link") ?? "",
    review: kind === "review" ? reviewText(tag(itemXml, "description")) : null,
    publishedAt: Number.isNaN(published.getTime())
      ? new Date().toISOString()
      : published.toISOString(),
  };
}

async function main() {
  const response = await fetch(FEED_URL, {
    headers: { "User-Agent": "pt-site-letterboxd-sync/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Letterboxd feed returned HTTP ${response.status}`);
  }
  const xml = await response.text();

  const fresh = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map(([, item]) => parseItem(item))
    .filter(Boolean);
  if (fresh.length === 0) {
    throw new Error("No film entries found in the feed; refusing to continue.");
  }

  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT_FILE, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const byId = new Map(existing.map((entry) => [entry.id, entry]));
  for (const entry of fresh) byId.set(entry.id, entry);

  const merged = [...byId.values()].sort(
    (a, b) =>
      b.publishedAt.localeCompare(a.publishedAt) || b.id.localeCompare(a.id),
  );
  const output = JSON.stringify(merged, null, 2) + "\n";

  let previous = null;
  try {
    previous = await readFile(OUT_FILE, "utf8");
  } catch {}

  if (previous === output) {
    console.log(`No changes (${merged.length} entries).`);
    return;
  }
  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, output);
  console.log(
    `Wrote ${merged.length} entries (${merged.length - existing.length} new).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
