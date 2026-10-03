import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { articleTags } from "./config";

/**
 * `strictObject` rejects unknown frontmatter keys, so a misspelled field
 * (for example `drafft: true`) fails the build rather than publishing a draft.
 */

/** Long-form posts: src/content/articles/<slug>.md */
const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.strictObject({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.coerce.date(),
    tags: z.array(z.enum(articleTags)).default([]),
    /** URL of the LinkedIn post, if this article was also shared there. */
    linkedin: z.url().optional(),
    draft: z.boolean().default(false),
  }),
});

/** Short opinions, no title: src/content/notes/YYYY-MM-DD-short-slug.md */
const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/notes" }),
  schema: z.strictObject({
    date: z.coerce.date(),
    /** URL of the matching post on X, if shared there. */
    x: z.url().optional(),
    draft: z.boolean().default(false),
  }),
});

/** Curated news feed: src/content/links/YYYY-MM-DD-short-slug.md */
const links = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/links" }),
  schema: z.strictObject({
    title: z.string().min(1),
    url: z.url(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

/** Weekly Mashup, one file per edition: src/content/weekly/YYYY-MM-DD.md */
const weekly = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/weekly" }),
  schema: z.strictObject({
    title: z.string().min(1),
    description: z.string().min(1),
    /** Publication date, the day the edition goes out (New York time). */
    date: z.coerce.date(),
    /** URL of the LinkedIn post, once shared there. */
    linkedin: z.url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles, notes, links, weekly };
