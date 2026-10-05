import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getArticles, getJournal, getNotes } from "../lib/content";
import { excerpt, plainText } from "../lib/format";
import { site } from "../config";

/** Articles, journal entries and opinions: the things written in my own voice. */
export async function GET(context: APIContext) {
  const [articles, journal, notes] = await Promise.all([
    getArticles(),
    getJournal(),
    getNotes(),
  ]);

  const items = [
    ...articles.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: `/articles/${entry.id}/`,
    })),
    ...journal.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: `/journal/${entry.id}/`,
    })),
    ...notes.map((entry) => ({
      title: excerpt(entry.body ?? "", 70),
      description: plainText(entry.body ?? ""),
      pubDate: entry.data.date,
      link: `/opinion/${entry.id}/`,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: site.name,
    description: site.description,
    site: context.site!,
    items,
  });
}
