# My Quotes (Thought Wall)

## Purpose

Add a new **Quotes** page to the personal website.

The page displays a visual wall of the user's own quotes. It should feel more like a minimalist Pinterest-style wall than a traditional blog, social feed, or list of posts.

The goal is to create a simple, personal, visually interesting place where visitors can discover the user's quotes.

---

## Decisions (supersede anything below that disagrees)

| Topic | Decision |
|---|---|
| Section name | **Quotes** (was "Thoughts") |
| Page title | **My Quotes** |
| URL | `/quotes/` (the site uses `trailingSlash: "always"`) |
| Quotes per set | **5**, held in one constant (`quoteSetSize` in `src/config.ts`) |
| Control label | **More quotes →** (not tied to the set size) |
| Author name | **Never shown.** The field is not part of the data model. |
| Data file | `src/content/quotes.json`, loaded as an Astro content collection with a schema |
| Randomness | Done in the browser. The page also renders 5 quotes at build time, so crawlers and visitors without JavaScript still see content. |
| Small sets | If the collection has 5 quotes or fewer, show them all and hide the "More quotes" control. |
| Repeat rule | "More quotes" cycles through the whole archive before any quote repeats. |
| Opinion | Stays a separate section (`/opinion/`): short, dated, topical takes on current events. Quotes are timeless and undated. |
| Weekly | Unchanged. |

### Navigation and content restructure

Navigation is regrouped to keep the header minimal:

```text
Articles   Projects   Weekly   Résumé   Personal ▾   Vedanta ↗
                                         ├ Journal   (/journal/)
                                         ├ Opinion   (/opinion/)
                                         ├ Quotes    (/quotes/)
                                         └ Hobbies   (/hobbies/)
```

- **Articles** (`/articles/`) holds professional writing. Tags: `technical`, `quality`, `leadership`.
- **Journal** (`/journal/`) holds personal writing. Tags: `vedanta`, `life`, `story`. Stories live here under the `story` tag. If stories grow into a body of work (roughly 5 or more, or serialized), promote them to their own **Stories** item under Personal.
- The old `/blog/*` and `/writing/*` URLs redirect to `/articles/*`, so existing links keep working.
- Existing pages and URLs otherwise stay as they are.

---

## Core Concept

The user maintains a collection of quotes in a local JSON file within the website repository.

The collection may eventually contain 10, 100 or 1,000+ quotes.

The website should **not display the entire collection at once**.

Instead, each visit displays a randomly selected set of **5 unique quotes**, arranged in a visually appealing, randomized layout. The visual prominence of individual quotes varies (large, medium, small), which creates an organic wall while remaining minimalist and literary.

---

# V1 Requirements

## 1. New Website Tab

Add a **Quotes** link under the **Personal** navigation group, at `/quotes/`.

## 2. Quote Source

Store all quotes in a JSON file in the repository: `src/content/quotes.json`.

```json
[
  {
    "id": "q001",
    "text": "Divinity is the core of every person.",
    "category": "Vedanta"
  },
  {
    "id": "q002",
    "text": "Sometimes the answer is simply to observe.",
    "category": "Life"
  }
]
```

- `id` and `text` are required. `id` must be unique.
- `category` is optional and must come from a fixed list in `src/config.ts` (`quoteCategories`), so a typo fails the build.
- Optional future fields: `favorite` (boolean), `date`.
- Unknown fields fail the build.
- There is no `author` field. Every quote is the site owner's.

The JSON file is the **complete archive**. The website selects only a small subset for display.

## 3. Display Only 5 Quotes

Regardless of how large the collection is, the page displays a maximum of **5 quotes** at a time. If fewer exist, all are shown.

## 4. Random Selection

On each page visit:

1. Load the quote collection.
2. Randomly select up to 5 unique quotes.
3. Do not duplicate quotes within the same display.
4. Randomize their visual arrangement.
5. Randomize their typography size within sensible limits.

The randomness should feel **intentional and elegant**, not chaotic.

## 5. "More quotes →"

A subtle control near the bottom of the page. When activated:

1. Choose another set of up to 5 quotes.
2. Favour the quotes shown least so far on this visit, so the whole archive is gone through before any quote repeats. Avoid the immediately previous set where possible.
3. Randomize the new arrangement.
4. Do not reload the page.
5. Keep the interaction lightweight.

If the collection has 5 quotes or fewer, the control is not shown.

## 6. Visual Design

Minimal, literary, spacious, elegant, typography-focused, responsive, and consistent with the existing site (same fonts, colours and dark mode).

Avoid looking like X/Twitter, Instagram, Facebook, a traditional blog, a database/table, or a grid of social-media cards. The page should feel like **a digital wall of personal quotes.**

## 7. Layout

Responsive, free-flowing layout. Quotes sit in a wrapping flow with varied widths, alignment and vertical offsets. Reading order matches the visual order, so keyboard and screen-reader users get the same sequence.

## 8. Typography

Typography is the primary visual element. Size is chosen by the UI, never stored in the JSON.

Each set of 5 uses a fixed mix, shuffled each time:

- 1 large
- 2 medium
- 2 small

The large slot goes to a short quote (long quotes never get the large size). Sizes use `clamp()` so they scale smoothly.

## 9. Quote Metadata

Metadata such as `category` is stored but not shown in V1.

## 10. Categories

Allowed values: Life, Vedanta, Work, Learning, Movies, People, Random. Not displayed in V1.

## 11. No Backend

V1 requires no database, accounts, authentication, server storage, analytics, APIs, paid services or AI services. It works with the existing static deployment.

## 12. No Social Features

No likes, reactions, comments, shares, follower counts, view counts, profiles or submissions.

## 13. No View Tracking

No view counter, visitor tracking, popularity score or engagement calculation. Typography size comes from the layout and randomization only.

## 14. Responsive Behavior

- **Desktop:** use the wide content column for an open composition.
- **Tablet:** fewer quotes per row, adjusted type.
- **Mobile:** a single column.
- No horizontal scrolling. Quote text is never clipped.

## 15. Performance

- Only the selected quotes are rendered into the DOM.
- A small amount of vanilla JavaScript, no libraries.
- No external services.
- The whole archive is embedded in the page as JSON (a 1,000-quote archive is roughly 100 KB before compression).

## 16. Accessibility

- Semantic HTML: a list of `blockquote` elements.
- Sufficient text contrast in light and dark mode.
- "More quotes" is a real `<button>`, keyboard accessible, with a tap target of at least 44px.
- A polite live region announces when the set changes.
- Transitions and animations are disabled under `prefers-reduced-motion`.
- Quote text stays selectable and copyable. Quotes are inserted with `textContent`, never as HTML.

## 17. Randomization Rules

Randomize: quote selection, order, size slot, alignment, vertical offset.

Keep fixed: readable spacing, line lengths, the 1/2/2 size mix, the type scale, responsive behavior. The result should look **curated rather than algorithmically chaotic**.

## 18. Future Ideas (not V1)

Favorites, category filter, featured quote, search, a full archive page, date-based discovery, theme variations, a separate **Stories** section.

---

# V1 Success Criteria

- [ ] **Quotes** appears under the **Personal** navigation group.
- [ ] Quotes are maintained in `src/content/quotes.json`, validated by a schema.
- [ ] Only the author's own quotes are displayed, with no author name.
- [ ] Up to 5 quotes appear at a time, randomly selected and unique within a set.
- [ ] The layout changes between visits.
- [ ] Typography sizes vary tastefully (1 large, 2 medium, 2 small).
- [ ] "More quotes" shows a new set without reloading, and cycles through the archive before repeating.
- [ ] The page works on desktop and mobile, with no clipped text or horizontal scroll.
- [ ] No database, paid services, view tracking or social features.
- [ ] Existing pages and URLs keep working (old `/blog/*` links redirect to `/articles/*`).

---

# Guiding Principle

> **The collection is permanent. The experience is temporary.**

The JSON file is the author's growing archive. The website only reveals a small, changing window into it. The visitor should feel like they have discovered a few quotes rather than browsed a database.
