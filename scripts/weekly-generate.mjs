// Stage 2 of the Weekly Mashup pipeline: pick items, read them, write the edition.
//
// Reads .weekly/collected.json (from weekly-collect.mjs), then:
//   1. SELECT: one small Claude call picks ~9 items from titles and snippets.
//   2. READ:   fetches the full text of only the picked articles.
//   3. WRITE:  one Claude call writes the edition and a LinkedIn version.
//
// Output:
//   src/content/weekly/YYYY-MM-DD.md   the edition (YYYY-MM-DD = the Tuesday it goes out)
//   .weekly/linkedin.txt               LinkedIn-ready text (not committed)
//   .weekly/review.md                  notes and warnings for the reviewer (not committed)
//
// Usage:
//   node scripts/weekly-generate.mjs [--date YYYY-MM-DD] [--dry-run]
//
// Needs credentials (never commit them). In GitHub Actions it uses Workload
// Identity Federation: a short-lived GitHub OIDC token is exchanged for a
// short-lived Anthropic token, so no API key is stored anywhere. For local runs,
// set ANTHROPIC_API_KEY instead. --dry-run builds the prompts and prints their
// size without calling the API.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { htmlToText, USER_AGENT } from "./weekly-lib.mjs";

const MODEL = process.env.WEEKLY_MODEL ?? "claude-sonnet-5-5";
// USD per million tokens, from the Anthropic pricing page. Used only to print an estimate.
const PRICE_IN = 2;
const PRICE_OUT = 10;

const SITE = "https://pavanturlapati.com";
const COLLECTED = ".weekly/collected.json";
const MAX_ARTICLE_CHARS = 7000;
const WORDS_PER_MINUTE = 220;

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const dateArg = args.includes("--date") ? args[args.indexOf("--date") + 1] : null;

// ---------------------------------------------------------------- dates

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const shortDate = (iso) => {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
};
const longDate = (iso) => `${shortDate(iso)}, ${iso.slice(0, 4)}`;

// The edition goes out on the next Tuesday (New York time). Run on Monday: tomorrow.
function nextTuesday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
  const d = new Date(`${parts}T12:00:00Z`);
  const ahead = (2 - d.getUTCDay() + 7) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + ahead);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------- Anthropic

const GITHUB_AUDIENCE = "https://api.anthropic.com";

const hasFederation = () =>
  Boolean(
    process.env.ANTHROPIC_FEDERATION_RULE_ID &&
      process.env.ANTHROPIC_ORGANIZATION_ID &&
      process.env.ANTHROPIC_SERVICE_ACCOUNT_ID &&
      process.env.ACTIONS_ID_TOKEN_REQUEST_URL &&
      process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN,
  );

// Returns the auth headers for one API call. An API key (local runs) wins if
// set. Otherwise swap a fresh GitHub OIDC token for a short-lived Anthropic
// token. GitHub tokens carry a jti, so each exchange needs a new one.
async function authHeaders() {
  if (process.env.ANTHROPIC_API_KEY) return { "x-api-key": process.env.ANTHROPIC_API_KEY };
  if (!hasFederation()) {
    throw new Error(
      "No credentials. Set ANTHROPIC_API_KEY (local), or run in GitHub Actions with id-token: write and the ANTHROPIC_FEDERATION_* variables.",
    );
  }
  const env = process.env;
  const jwtRes = await fetch(
    `${env.ACTIONS_ID_TOKEN_REQUEST_URL}&audience=${encodeURIComponent(GITHUB_AUDIENCE)}`,
    { headers: { Authorization: `Bearer ${env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}` } },
  );
  if (!jwtRes.ok) throw new Error(`Could not get a GitHub OIDC token (HTTP ${jwtRes.status}).`);
  const { value: assertion } = await jwtRes.json();

  const exchange = {
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
    federation_rule_id: env.ANTHROPIC_FEDERATION_RULE_ID,
    organization_id: env.ANTHROPIC_ORGANIZATION_ID,
    service_account_id: env.ANTHROPIC_SERVICE_ACCOUNT_ID,
  };
  if (env.ANTHROPIC_WORKSPACE_ID) exchange.workspace_id = env.ANTHROPIC_WORKSPACE_ID;
  const res = await fetch("https://api.anthropic.com/v1/oauth/token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(exchange),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Anthropic token exchange failed (HTTP ${res.status}). The reason is on the Authentication history page in the Claude Console (Settings > Workload identity).`,
    );
  }
  return { authorization: `Bearer ${data.access_token}` };
}

async function callClaude({ system, user, schema, effort, maxTokens }) {
  const body = {
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
    output_config: { effort, format: { type: "json_schema", schema } },
  };
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(await authHeaders()),
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(300_000),
    });
    if (res.status === 429 || res.status >= 500) {
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 5000 * attempt));
        continue;
      }
    }
    const data = await res.json();
    if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${JSON.stringify(data.error ?? data)}`);
    if (data.stop_reason === "max_tokens") throw new Error("Model output was cut off (max_tokens).");
    if (data.stop_reason === "refusal") throw new Error("Model refused the request.");
    const text = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    return { json: JSON.parse(text), usage: data.usage };
  }
}

const cost = (u) => (u.input_tokens * PRICE_IN + u.output_tokens * PRICE_OUT) / 1_000_000;

// ---------------------------------------------------------------- reading articles

async function readArticle(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(20_000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    let html = await res.text();
    const region = html.match(/<article[\s\S]*?<\/article>/i) ?? html.match(/<main[\s\S]*?<\/main>/i);
    html = (region ? region[0] : html)
      .replace(/<(nav|header|footer|aside|form|noscript|svg)[\s\S]*?<\/\1>/gi, " ");
    const text = htmlToText(html);
    return text.length > 400 ? text : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- prompts

const SELECT_SYSTEM = `You are the editor of a weekly tech bulletin read by one senior software quality and delivery leader, then shared publicly. Topics, in this order of priority: AI, QSR (quick-service restaurant) technology and business, and software testing / engineering practice. The reader has about 30 minutes a week.

From the numbered candidate list, choose 8 to 10 items. Prefer:
- things that change what a practitioner should know or do, over press releases and promotions;
- one clear item per story (no duplicates of the same news);
- a mix across sections, led by AI, roughly 4 AI, 3 QSR, 2 Testing, but let quality decide. Fewer than 8 is fine if the week is thin.
Skip: ads, event or ticket promotions, job and layoff deal pitches, pure menu or store-opening items, personal quotes without substance, and anything you cannot tell is worth reading from the title and snippet.
Items marked catchup=true are older than a week; include one only if it is clearly worth it.
Also pick the "big three": the three picked items a busy reader should not miss.
Return ids exactly as given.`;

const WRITE_SYSTEM = `You write a weekly tech bulletin ("Weekly Mashup") for a senior software quality and delivery leader, published on his personal site and shared on LinkedIn. It must be readable in under 30 minutes, including the links.

TRUTH RULES (most important):
- State only what the supplied article text says. Do not add facts, numbers, names, dates or context from your own knowledge.
- Company statements, forecasts and performance numbers are claims. Attribute them ("X says", "according to X"), and where a figure comes from the company itself, say so.
- If the supplied text is thin or ambiguous, say less. If an article was only available as a short snippet (fullText=false), write one or two cautious sentences and say it is based on a summary.
- Do not invent opinions, personal experiences or quotes for the author. Do not name the author's employer or clients.
- Use the exact URLs provided. Never invent or alter a URL.

FORMAT (Markdown body only, no front matter, no H1):
## The big three
A numbered list of three one-sentence summaries, each starting with a bolded short phrase.

## AI
## QSR
## Testing
Under each section heading, one "### Headline" per item, in a sensible order (most important first). Omit a section that has no items.
Each item is:
- 2 to 4 sentences summarizing what happened, in plain language.
- A line starting "**Why it matters:**" with one sentence of practical significance for a practitioner. This is your analysis; keep it modest and clearly an inference, not a new fact.
- A source line in italics, exactly: *Source: [Publisher name](url) · N min read · Mon D*
  using the readMinutes and publishedLabel values supplied for that item.
- For catchup items, say in the summary that it is a catch-up item from an earlier date.

## Takeaway
Two or three sentences tying the week together, restrained and without hype.

STYLE: plain, concrete, no hype, no emoji, no filler. Avoid words like "game-changer", "revolutionary", "landscape", "delve". Use normal punctuation; do not use long dashes. Keep the whole body under about 1,300 words.

ALSO RETURN:
- description: one sentence (under 160 characters) for the page and search results, naming the top themes.
- linkedin: a LinkedIn post in plain text (no Markdown), under 2,600 characters. First line is a plain hook that states what is in the edition. Then the big three as short lines starting with a hyphen, then one sentence saying the full edition has the rest with sources, then the edition URL on its own line. Then a final line: "AI-assisted, reviewed by me." Write in the first person only for that last line and for neutral framing; do not invent personal experience.
- review_notes: a short Markdown list of things a human reviewer should double-check: items based on a snippet only, company claims, anything uncertain. Write "None" if nothing.

Here is the previous edition, as an example of the format and tone only. Do not reuse its content:

`;

// ---------------------------------------------------------------- main

const collected = JSON.parse(await readFile(COLLECTED, "utf8").catch(() => {
  console.error(`Missing ${COLLECTED}. Run: node scripts/weekly-collect.mjs`);
  process.exit(1);
}));

const editionDate = dateArg ?? nextTuesday();
if (!/^\d{4}-\d{2}-\d{2}$/.test(editionDate)) {
  console.error("--date must look like 2026-10-06");
  process.exit(1);
}

const candidates = collected.items.map((item, i) => ({ id: i + 1, ...item }));
const example = (await readFile("scripts/weekly-example.md", "utf8")).replace(/^---[\s\S]*?---\s*/, "");

const selectUser = candidates
  .map(
    (c) =>
      `[${c.id}] (${c.section}) ${c.source}, ${c.published}${c.catchup ? ", catchup=true" : ""}\n    ${c.title}\n    ${c.snippet}`,
  )
  .join("\n");

const selectSchema = {
  type: "object",
  properties: {
    big_three: { type: "array", items: { type: "integer" } },
    picks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          section: { type: "string", enum: ["AI", "QSR", "Testing"] },
        },
        required: ["id", "section"],
        additionalProperties: false,
      },
    },
  },
  required: ["big_three", "picks"],
  additionalProperties: false,
};

const writeSchema = {
  type: "object",
  properties: {
    description: { type: "string" },
    body: { type: "string" },
    linkedin: { type: "string" },
    review_notes: { type: "string" },
  },
  required: ["description", "body", "linkedin", "review_notes"],
  additionalProperties: false,
};

if (DRY_RUN) {
  const approx = (s) => Math.round(s.length / 4);
  console.log(`Dry run. Edition date ${editionDate}, model ${MODEL}`);
  console.log(`SELECT prompt: about ${approx(SELECT_SYSTEM + selectUser)} tokens (${candidates.length} candidates)`);
  console.log(`WRITE prompt:  about ${approx(WRITE_SYSTEM + example) + 9 * 1800} tokens (estimate with 9 articles)`);
  process.exit(0);
}

if (!process.env.ANTHROPIC_API_KEY && !hasFederation()) {
  console.error(
    "No credentials. Set ANTHROPIC_API_KEY for a local run, or run the GitHub Action (uses identity federation).",
  );
  process.exit(1);
}

// 1. SELECT
console.log(`Selecting from ${candidates.length} candidates with ${MODEL}...`);
const selected = await callClaude({
  system: SELECT_SYSTEM,
  user: selectUser,
  schema: selectSchema,
  effort: "low",
  maxTokens: 2000,
});
const byId = new Map(candidates.map((c) => [c.id, c]));
const picks = selected.json.picks.filter((p) => byId.has(p.id));
const bigThree = selected.json.big_three.filter((id) => picks.some((p) => p.id === id));
if (picks.length < 3) throw new Error(`Selection returned only ${picks.length} usable items.`);
console.log(`  picked ${picks.length} items, cost ~$${cost(selected.usage).toFixed(3)}`);

// 2. READ
console.log("Reading the picked articles...");
const articles = [];
for (const p of picks) {
  const c = byId.get(p.id);
  const full = await readArticle(c.url);
  const text = full ? full.slice(0, MAX_ARTICLE_CHARS) : c.snippet;
  const words = (full ?? c.snippet).split(/\s+/).length;
  articles.push({
    id: c.id,
    section: p.section,
    publisher: c.source,
    title: c.title,
    url: c.url,
    publishedLabel: shortDate(c.published),
    catchup: c.catchup,
    bigThree: bigThree.includes(c.id),
    fullText: Boolean(full),
    // Estimated from the page text. Feeds without a full page are treated as a 3 minute read.
    readMinutes: full ? Math.max(1, Math.round(words / WORDS_PER_MINUTE)) : 3,
    text,
  });
  console.log(`  ${full ? "full text" : "snippet  "}  ${c.source}: ${c.title.slice(0, 60)}`);
}

// 3. WRITE
console.log("Writing the edition...");
const writeUser = `Edition date (the Tuesday it is published): ${editionDate}
Edition URL: ${SITE}/weekly/${editionDate}/

Items (JSON). "bigThree": true marks the items the editor chose for the big three.

${JSON.stringify(articles, null, 2)}`;

const written = await callClaude({
  system: WRITE_SYSTEM + example,
  user: writeUser,
  schema: writeSchema,
  effort: "medium",
  maxTokens: 12000,
});
console.log(`  cost ~$${cost(written.usage).toFixed(3)}`);

// ---------------------------------------------------------------- checks

const { description, body, linkedin, review_notes } = written.json;
const warnings = [];

const allowed = new Set(articles.map((a) => a.url));
for (const [, url] of body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
  if (!allowed.has(url)) warnings.push(`Link not in the supplied items: ${url}`);
}
for (const a of articles) {
  if (!body.includes(a.url)) warnings.push(`Missing from the edition: ${a.title}`);
  if (!a.fullText) warnings.push(`Based on a feed snippet only: ${a.title}`);
}
let at = -1;
for (const h of ["## The big three", "## AI", "## QSR", "## Testing", "## Takeaway"]) {
  const idx = body.indexOf(h);
  if (idx === -1) {
    if (h === "## The big three" || h === "## Takeaway") warnings.push(`Missing heading: ${h}`);
    continue;
  }
  if (idx < at) warnings.push(`Section out of order: ${h}`);
  at = idx;
}
if (/[\u2013\u2014]/.test(body)) warnings.push("Body contains long dashes (style rule: avoid).");
const words = body.split(/\s+/).length;
if (words > 1500) warnings.push(`Edition is long: about ${words} words.`);
if (linkedin.length > 2800) warnings.push(`LinkedIn text is ${linkedin.length} characters (limit 3,000).`);
if (!linkedin.includes(`${SITE}/weekly/${editionDate}/`)) warnings.push("LinkedIn text does not include the edition URL.");

// ---------------------------------------------------------------- write files

const yamlString = (s) => JSON.stringify(s.replace(/\s+/g, " ").trim());
const file = `---
title: ${yamlString(`Weekly Mashup: ${longDate(editionDate)}`)}
description: ${yamlString(description)}
date: ${editionDate}
---

${body.trim()}
`;

await mkdir(".weekly", { recursive: true });
await writeFile(`src/content/weekly/${editionDate}.md`, file);
await writeFile(".weekly/linkedin.txt", linkedin.trim() + "\n");

const totalCost = cost(selected.usage) + cost(written.usage);
const review = `## Review checklist

Edition: \`src/content/weekly/${editionDate}.md\` (about ${words} words, ${articles.length} items)

### Model notes

${review_notes.trim()}

### Automatic checks

${warnings.length ? warnings.map((w) => `- ${w}`).join("\n") : "- All checks passed."}

### Run

Model \`${MODEL}\`, estimated cost $${totalCost.toFixed(3)}.

## LinkedIn text

\`\`\`text
${linkedin.trim()}
\`\`\`
`;
await writeFile(".weekly/review.md", review);
await writeFile(".weekly/edition-date.txt", editionDate + "\n");

console.log(`\nWrote src/content/weekly/${editionDate}.md`);
console.log("Wrote .weekly/linkedin.txt and .weekly/review.md");
console.log(`Estimated cost this run: $${totalCost.toFixed(3)}`);
if (warnings.length) {
  console.log("\nWarnings:");
  for (const w of warnings) console.log(`  - ${w}`);
}
