// Stage 3 of the Weekly Mashup pipeline: post the edition to LinkedIn.
//
// Reads data/linkedin/YYYY-MM-DD.txt (written by weekly-generate.mjs), waits
// until the edition page is live on the site, posts it to LinkedIn as the
// member, then records the post URL in the edition's `linkedin:` frontmatter
// (which also marks the edition as posted, so a re-run never double-posts).
//
// Usage:
//   node scripts/weekly-linkedin.mjs --date YYYY-MM-DD [--dry-run] [--no-wait]
//
// Environment:
//   LINKEDIN_ACCESS_TOKEN    member token with the w_member_social scope (secret)
//   LINKEDIN_AUTHOR_URN      urn:li:person:<id>  (see scripts/linkedin-whoami.mjs)
//   LINKEDIN_TOKEN_EXPIRES   optional YYYY-MM-DD; used to warn before the token expires
//   LINKEDIN_API_VERSION     optional YYYYMM, default below
//
// Without a token the script prints a notice and exits 0, so the rest of the
// pipeline works before LinkedIn is set up.

import { readFile, writeFile, mkdir } from "node:fs/promises";

const SITE = "https://pavanturlapati.com";
const API = "https://api.linkedin.com/rest/posts";
const VERSION = process.env.LINKEDIN_API_VERSION || "202608";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const NO_WAIT = args.includes("--no-wait");
const date = args.includes("--date") ? args[args.indexOf("--date") + 1] : null;
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error("Usage: node scripts/weekly-linkedin.mjs --date YYYY-MM-DD");
  process.exit(1);
}

const editionPath = `src/content/weekly/${date}.md`;
const textPath = `data/linkedin/${date}.txt`;
const pageUrl = `${SITE}/weekly/${date}/`;

const edition = await readFile(editionPath, "utf8").catch(() => null);
if (!edition) {
  console.error(`No edition at ${editionPath}.`);
  process.exit(1);
}
if (/^linkedin:/m.test(edition)) {
  console.log(`${date} already has a LinkedIn URL. Nothing to post.`);
  process.exit(0);
}
if (/^draft:\s*true\s*$/m.test(edition)) {
  console.log(`${date} is a draft. Not posting.`);
  process.exit(0);
}
const text = await readFile(textPath, "utf8").catch(() => null);
if (!text) {
  console.log(`No LinkedIn text at ${textPath}. Nothing to post.`);
  process.exit(0);
}

const token = process.env.LINKEDIN_ACCESS_TOKEN;
const author = process.env.LINKEDIN_AUTHOR_URN;
if (!DRY_RUN && (!token || !author)) {
  console.log("::warning::LinkedIn is not set up (LINKEDIN_ACCESS_TOKEN or LINKEDIN_AUTHOR_URN missing). Skipping the post.");
  process.exit(0);
}

// ---------------------------------------------------------------- token expiry

const expires = process.env.LINKEDIN_TOKEN_EXPIRES;
if (expires && /^\d{4}-\d{2}-\d{2}$/.test(expires)) {
  const daysLeft = Math.floor((new Date(`${expires}T00:00:00Z`) - Date.now()) / 86_400_000);
  if (daysLeft < 0) {
    console.error(`::error::The LinkedIn token expired on ${expires}. Create a new one (see README, "LinkedIn").`);
    process.exit(1);
  }
  if (daysLeft <= 14) {
    console.log(`::warning::The LinkedIn token expires in ${daysLeft} days (${expires}). Create a new one soon.`);
  }
}

// ---------------------------------------------------------------- text

// The Posts API reads "commentary" in LinkedIn's little-text format, where
// these characters are syntax. Unescaped, they truncate or mangle the post.
const escapeLittleText = (s) => s.replace(/[\\|{}@[\]()<>#*_~]/g, (c) => `\\${c}`);

const frontmatter = (key) => edition.match(new RegExp(`^${key}:\\s*(.*)$`, "m"))?.[1]?.trim();
const title = JSON.parse(frontmatter("title") ?? '""');
const description = JSON.parse(frontmatter("description") ?? '""');

// The article card carries the link, so drop the bare URL line from the text.
// Removing it leaves a double blank line, so collapse those.
const commentary = text
  .split("\n")
  .filter((line) => line.trim() !== pageUrl)
  .join("\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const post = (body) => ({
  author,
  commentary: escapeLittleText(body),
  visibility: "PUBLIC",
  distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
  lifecycleState: "PUBLISHED",
  isReshareDisabledByAuthor: false,
});

const card = (thumbnail) => ({
  ...post(commentary),
  content: { article: { source: pageUrl, title, description, ...(thumbnail ? { thumbnail } : {}) } },
});
const asPlainLink = post(`${commentary}\n\n${pageUrl}`);

if (DRY_RUN) {
  console.log(`Dry run for ${date}. Would post:\n`);
  console.log(JSON.stringify({ ...card("urn:li:image:<uploaded from public/og-image.png>"), author: author ?? "urn:li:person:<id>" }, null, 2));
  process.exit(0);
}

// ---------------------------------------------------------------- wait for the page

async function waitForPage() {
  const deadline = Date.now() + 15 * 60_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${pageUrl}?cb=${Date.now()}`, { redirect: "follow" });
      if (res.ok) return true;
    } catch {
      // keep waiting
    }
    console.log("  edition page is not live yet, waiting 30s...");
    await new Promise((r) => setTimeout(r, 30_000));
  }
  return false;
}

if (!NO_WAIT) {
  console.log(`Waiting for ${pageUrl} ...`);
  if (!(await waitForPage())) {
    console.error(`The edition page did not go live within 15 minutes. Not posting. Re-run the workflow with date ${date} once the deploy finishes.`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------- post

const headers = () => ({
  Authorization: `Bearer ${token}`,
  "Linkedin-Version": VERSION,
  "X-Restli-Protocol-Version": "2.0.0",
  "Content-Type": "application/json",
});

async function send(payload) {
  return fetch(API, { method: "POST", headers: headers(), body: JSON.stringify(payload) });
}

// LinkedIn does not fetch the page's og:image for API posts. The card image
// has to be uploaded first. This returns an image URN, or null on any failure
// (the post then goes out without an image rather than not at all).
async function uploadThumbnail() {
  try {
    const image = await readFile("public/og-image.png");
    const init = await fetch("https://api.linkedin.com/rest/images?action=initializeUpload", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ initializeUploadRequest: { owner: author } }),
    });
    if (!init.ok) throw new Error(`initializeUpload returned ${init.status}: ${(await init.text()).slice(0, 200)}`);
    const { value } = await init.json();
    const put = await fetch(value.uploadUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/octet-stream" },
      body: image,
    });
    if (!put.ok) throw new Error(`image upload returned ${put.status}: ${(await put.text()).slice(0, 200)}`);
    return value.image;
  } catch (err) {
    console.log(`::warning::Could not upload the card image, posting without it. ${err.message}`);
    return null;
  }
}

const thumbnail = await uploadThumbnail();
if (thumbnail) console.log(`Uploaded card image ${thumbnail}`);

let res = await send(card(thumbnail));
if ((res.status === 400 || res.status === 422) && thumbnail) {
  console.log(`Card with image rejected (${res.status}): ${(await res.text()).slice(0, 300)}`);
  console.log("Retrying the card without the image.");
  res = await send(card(null));
}
if (res.status === 400 || res.status === 422) {
  console.log(`Article card rejected (${res.status}): ${(await res.text()).slice(0, 300)}`);
  console.log("Retrying as a plain text post with the link.");
  res = await send(asPlainLink);
}

if (res.status === 401) {
  console.error("::error::LinkedIn returned 401. The token is expired or revoked. Create a new one (see README, \"LinkedIn\").");
  process.exit(1);
}
if (res.status !== 201) {
  console.error(`::error::LinkedIn returned ${res.status}: ${(await res.text()).slice(0, 500)}`);
  process.exit(1);
}

const urn = res.headers.get("x-restli-id");
if (!urn) {
  console.error("::error::LinkedIn accepted the post but returned no post id, so the URL was not recorded.");
  process.exit(1);
}
const url = `https://www.linkedin.com/feed/update/${urn}/`;
console.log(`Posted: ${url}`);

// Record the URL. This also marks the edition as posted.
const updated = edition.replace(/^(date:.*)$/m, `$1\nlinkedin: ${JSON.stringify(url)}`);
await writeFile(editionPath, updated);
await mkdir(".weekly", { recursive: true });
await writeFile(".weekly/linkedin-url.txt", url + "\n");
