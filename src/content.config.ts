import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { articleTags, journalTags, quoteCategories } from "./config";

/**
 * `strictObject` rejects unknown frontmatter keys, so a misspelled field
 * (for example `drafft: true`) fails the build rather than publishing a draft.
 */

/** Professional writing: src/content/articles/<slug>.md */
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

/** Personal writing, including stories: src/content/journal/<slug>.md */
const journal = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/journal" }),
  schema: z.strictObject({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.coerce.date(),
    tags: z.array(z.enum(journalTags)).default([]),
    /** URL of the LinkedIn post, if this entry was also shared there. */
    linkedin: z.url().optional(),
    draft: z.boolean().default(false),
  }),
});

/**
 * The quote archive: src/content/quotes.json. The author's own words, so there
 * is deliberately no author field.
 */
const quotes = defineCollection({
  loader: file("./src/content/quotes.json"),
  schema: z.strictObject({
    id: z.string().min(1),
    text: z.string().min(1),
    category: z.enum(quoteCategories).optional(),
    favorite: z.boolean().optional(),
    date: z.coerce.date().optional(),
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

/** Project write-ups: src/content/projects/<slug>.md */
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.strictObject({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.coerce.date(),
    /** URL of the LinkedIn post, if this write-up was also shared there. */
    linkedin: z.url().optional(),
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

export const collections = { articles, journal, quotes, notes, projects, weekly };
