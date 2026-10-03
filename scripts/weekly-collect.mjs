// Stage 1 of the Weekly Mashup pipeline: collect candidate items.
//
// Fetches the feeds in weekly-sources.mjs, keeps recent items, drops
// duplicates and writes a compact JSON file. No AI is involved here.
//
// Usage:
//   node scripts/weekly-collect.mjs [--days 7] [--out .weekly/collected.json]

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { XMLParser } from "fast-xml-parser";
import { sources } from "./weekly-sources.mjs";
import { htmlToText, USER_AGENT } from "./weekly-lib.mjs";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const DAYS = Number(arg("days", "7"));
const OUT = arg("out", ".weekly/collected.json");
const MAX_PER_SOURCE = 15;
const SNIPPET_CHARS = 300;
const TIMEOUT_MS = 20_000;
const DAY_MS = 24 * 60 * 60 * 1000;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
});

const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

// Feed fields can be a string, or an object with attributes / a text node.
const text = (v) => {
  if (v == null) return "";
  if (typeof v === "object") return text(v["#text"] ?? "");
  return String(v);
};

const clean = (v) => htmlToText(text(v));

const linkOf = (item) => {
  if (item.link == null) return text(item.guid);
  const links = asArray(item.link);
  // Atom: <link rel="alternate" href="..."/>. RSS: <link>url</link>.
  const alt = links.find((l) => typeof l === "object" && (!l["@_rel"] || l["@_rel"] === "alternate"));
  if (alt?.["@_href"]) return alt["@_href"];
  return text(links[0]).trim();
};

const parseFeed = (xml) => {
  const doc = parser.parse(xml);
  const rssItems = asArray(doc.rss?.channel?.item);
  if (rssItems.length) {
    return rssItems.map((i) => ({
      title: clean(i.title),
      link: linkOf(i),
      date: i.pubDate ?? i["dc:date"],
      snippet: clean(i.description ?? i["content:encoded"] ?? ""),
    }));
  }
  const atomEntries = asArray(doc.feed?.entry);
  return atomEntries.map((e) => ({
    title: clean(e.title),
    link: linkOf(e),
    date: e.published ?? e.updated,
    snippet: clean(e.summary ?? e.content ?? ""),
  }));
};

const normalizeUrl = (u) => {
  try {
    const url = new URL(u);
    url.hash = "";
    for (const k of [...url.searchParams.keys()]) {
      if (k.startsWith("utm_") || k === "ref") url.searchParams.delete(k);
    }
    return url.href.replace(/\/$/, "").toLowerCase();
  } catch {
    return u;
  }
};

const normalizeTitle = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const matchesKeywords = (item, keywords) => {
  const hay = ` ${normalizeTitle(`${item.title} ${item.snippet}`)} `;
  return keywords.some((k) => hay.includes(` ${k} `));
};

async function fetchFeed(source) {
  const res = await fetch(source.url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseFeed(await res.text());
}

const now = Date.now();
const report = [];
const collected = [];

for (const source of sources) {
  const windowDays = source.catchupDays ?? DAYS;
  const cutoff = now - windowDays * DAY_MS;
  try {
    const items = await fetchFeed(source);
    let kept = items
      .map((i) => ({ ...i, time: Date.parse(i.date) }))
      .filter((i) => i.title && i.link && Number.isFinite(i.time) && i.time >= cutoff && i.time <= now + DAY_MS);
    if (source.keywords) kept = kept.filter((i) => matchesKeywords(i, source.keywords));
    kept.sort((a, b) => b.time - a.time);
    kept = kept.slice(0, source.catchupDays ? 1 : MAX_PER_SOURCE);
    for (const i of kept) {
      collected.push({
        section: source.section,
        source: source.name,
        title: i.title,
        url: i.link,
        published: new Date(i.time).toISOString().slice(0, 10),
        // An item older than the normal window is a catch-up item.
        catchup: i.time < now - DAYS * DAY_MS,
        snippet: i.snippet.slice(0, SNIPPET_CHARS),
      });
    }
    report.push({ source: source.name, fetched: items.length, kept: kept.length, error: null });
  } catch (err) {
    report.push({ source: source.name, fetched: 0, kept: 0, error: String(err.message ?? err) });
  }
}

// Drop duplicates by URL, then by title, keeping the first (sources are listed by priority).
const seenUrls = new Set();
const seenTitles = new Set();
const items = collected.filter((i) => {
  const u = normalizeUrl(i.url);
  const t = normalizeTitle(i.title);
  if (seenUrls.has(u) || seenTitles.has(t)) return false;
  seenUrls.add(u);
  seenTitles.add(t);
  return true;
});

const output = {
  generated: new Date(now).toISOString(),
  windowDays: DAYS,
  items,
  report,
};

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(output, null, 2) + "\n");

console.log(`Window: last ${DAYS} days`);
for (const r of report) {
  const status = r.error ? `FAILED (${r.error})` : `${r.kept} kept of ${r.fetched}`;
  console.log(`  ${r.source.padEnd(30)} ${status}`);
}
console.log(`Collected ${items.length} items (${collected.length - items.length} duplicates dropped) -> ${OUT}`);

// Fail only if nothing was collected at all, so one broken feed does not stop the run.
if (items.length === 0) {
  console.error("No items collected.");
  process.exit(1);
}
