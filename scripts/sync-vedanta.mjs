#!/usr/bin/env node
/**
 * Pulls the RSS feed of vedanta.pavanturlapati.com and merges it into
 * data/vedanta.json so new Vedanta posts show up in "Latest" on the home page.
 *
 * Merges rather than overwrites: entries that later drop out of the feed are
 * kept, and entries that reappear are refreshed.
 *
 * No dependencies; needs Node 18+ (built-in fetch).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const FEED_URL = "https://vedanta.pavanturlapati.com/feed_rss_created.xml";
const OUT_FILE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../data/vedanta.json",
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
  return (cdata ? cdata[1] : decode(match[1])).trim();
}

function parseItem(itemXml) {
  const url = tag(itemXml, "link");
  const title = tag(itemXml, "title");
  if (!url || !title) return null;
  const published = new Date(tag(itemXml, "pubDate") ?? "");
  return {
    id: url,
    title,
    description: tag(itemXml, "description") ?? "",
    url,
    publishedAt: Number.isNaN(published.getTime())
      ? new Date().toISOString()
      : published.toISOString(),
  };
}

async function main() {
  const response = await fetch(FEED_URL, {
    headers: { "User-Agent": "pt-site-vedanta-sync/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Vedanta feed returned HTTP ${response.status}`);
  }
  const xml = await response.text();

  const fresh = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map(([, item]) => parseItem(item))
    .filter(Boolean);
  if (fresh.length === 0) {
    throw new Error("No entries found in the feed; refusing to continue.");
  }

  let previous = null;
  let existing = [];
  try {
    previous = await readFile(OUT_FILE, "utf8");
    existing = JSON.parse(previous);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const byId = new Map(existing.map((entry) => [entry.id, entry]));
  for (const entry of fresh) {
    const old = byId.get(entry.id);
    // Keep the first-seen publish date so later feed edits don't reorder posts.
    byId.set(entry.id, old ? { ...entry, publishedAt: old.publishedAt } : entry);
  }

  const merged = [...byId.values()].sort(
    (a, b) =>
      b.publishedAt.localeCompare(a.publishedAt) || b.id.localeCompare(a.id),
  );
  const output = JSON.stringify(merged, null, 2) + "\n";

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
