import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getArticles, getNotes } from "../lib/content";
import { excerpt, plainText } from "../lib/format";
import { site } from "../config";

/** Articles and notes: the things written in my own voice. */
export async function GET(context: APIContext) {
  const [articles, notes] = await Promise.all([getArticles(), getNotes()]);

  const items = [
    ...articles.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: `/writing/${entry.id}/`,
    })),
    ...notes.map((entry) => ({
      title: excerpt(entry.body ?? "", 70),
      description: plainText(entry.body ?? ""),
      pubDate: entry.data.date,
      link: `/notes/${entry.id}/`,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: site.name,
    description: site.description,
    site: context.site!,
    items,
  });
}
