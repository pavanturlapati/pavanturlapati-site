const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const monthFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** Dates are treated as UTC so output never depends on the build machine. */
export const formatDate = (date: Date) => dateFormat.format(date);
export const formatMonth = (date: Date) => monthFormat.format(date);
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/** 4.5 -> "★★★★½" */
export function stars(rating: number | null): string {
  if (rating === null) return "";
  const full = Math.floor(rating);
  return "★".repeat(full) + (rating - full >= 0.5 ? "½" : "");
}

/** Rough Markdown-to-text for previews and feed descriptions. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** First N characters of Markdown as plain text, cut at a word boundary. */
export function excerpt(markdown: string, max = 80): string {
  const flat = plainText(markdown);
  if (flat.length <= max) return flat;
  return flat.slice(0, max).replace(/\s+\S*$/, "") + "…";
}
