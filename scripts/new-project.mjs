// Starts a new project write-up from templates/project.md.
//
// Usage:
//   npm run new:project -- my-project-name
//
// Creates src/content/projects/my-project-name.md as a draft (visible in
// `npm run dev`, never in a production build). Replace every TODO, then remove
// `draft: true` to publish.

import { readFile, writeFile, access } from "node:fs/promises";

const slug = process.argv[2];
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error("Usage: npm run new:project -- lowercase-words-with-hyphens");
  process.exit(1);
}

const target = `src/content/projects/${slug}.md`;
const exists = await access(target).then(() => true, () => false);
if (exists) {
  console.error(`${target} already exists.`);
  process.exit(1);
}

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
const template = await readFile("templates/project.md", "utf8");
await writeFile(target, template.replace("__DATE__", today));
console.log(`Created ${target} (draft). Replace every TODO, then remove "draft: true".`);
