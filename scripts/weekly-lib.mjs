// Shared helpers for the Weekly Mashup scripts.

const decodeEntities = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

// Strip tags and entities from a fragment of HTML and collapse whitespace.
export const htmlToText = (html) =>
  decodeEntities(
    String(html ?? "")
      .replace(/<!\[CDATA\[|\]\]>/g, "")
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();

export const USER_AGENT =
  "pavanturlapati.com weekly-mashup (personal newsletter; contact: pavanturlapati@gmail.com)";
