/**
 * Selection and layout rules for the Quotes page. Pure functions with an
 * injectable random source, shared by the build-time render and the browser.
 * Keep this file free of Astro and DOM imports.
 */

export type Quote = { id: string; text: string };
export type Size = "lg" | "md" | "sm";
export type Align = "start" | "center" | "end";
export type Placed = Quote & { size: Size; align: Align; offset: number };
export type Rng = () => number;

/** How often each quote has been shown, and the previous set's ids. */
export type Cycle = { counts: Record<string, number>; last: string[] };

export const freshCycle = (): Cycle => ({ counts: {}, last: [] });

/** Size mix for a full set: one large, two medium, two small. */
const SLOTS: readonly Size[] = ["lg", "md", "md", "sm", "sm"];

/** Longer quotes never get the large size, so the page stays calm. */
export const LARGE_MAX_CHARS = 110;

const ALIGNS: readonly Align[] = ["start", "center", "end"];

/** Vertical offset steps (each step is a fixed amount in CSS). */
const OFFSET_STEPS = 4;

const randomInt = (max: number, rng: Rng) => Math.floor(rng() * max);

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, rng);
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/**
 * Pick up to `size` unique quotes, always favouring the least-shown ones, so
 * the whole archive is gone through before anything repeats and no quote gets
 * more than one extra showing. Ties are random, and the previous set is
 * avoided where possible.
 */
export function pickSet(
  quotes: readonly Quote[],
  size: number,
  cycle: Cycle = freshCycle(),
  rng: Rng = Math.random,
): { set: Quote[]; cycle: Cycle } {
  if (quotes.length <= size) {
    // Everything fits, so there is no archive to cycle through.
    return { set: shuffle(quotes, rng), cycle: freshCycle() };
  }

  const shown = (q: Quote) => cycle.counts[q.id] ?? 0;
  const wasLast = new Set(cycle.last);
  // The shuffle makes ties random; sort() is stable, so it is preserved.
  const set = shuffle(quotes, rng)
    .sort(
      (a, b) =>
        shown(a) - shown(b) || Number(wasLast.has(a.id)) - Number(wasLast.has(b.id)),
    )
    .slice(0, size);

  const counts = { ...cycle.counts };
  for (const q of set) counts[q.id] = shown(q) + 1;
  return { set: shuffle(set, rng), cycle: { counts, last: set.map((q) => q.id) } };
}

/**
 * Give each quote a size, alignment and offset. The large slot goes to a short
 * quote and sits first or third, so the hierarchy reads the same way on every
 * visit while the composition changes.
 */
export function assignLayout(
  set: readonly Quote[],
  rng: Rng = Math.random,
): Placed[] {
  const slots = SLOTS.slice(0, set.length);
  const sizes: Size[] = new Array(set.length);

  const indices = set.map((_, i) => i);
  let largeAt = -1;
  if (slots.includes("lg")) {
    const short = indices.filter((i) => (set[i] as Quote).text.length <= LARGE_MAX_CHARS);
    if (short.length > 0) {
      largeAt = short[randomInt(short.length, rng)] as number;
    } else {
      largeAt = indices.reduce((best, i) =>
        (set[i] as Quote).text.length < (set[best] as Quote).text.length ? i : best,
      );
    }
    sizes[largeAt] = "lg";
  }

  const otherSlots = shuffle(slots.filter((s) => s !== "lg"), rng);
  indices
    .filter((i) => i !== largeAt)
    .forEach((i, n) => {
      sizes[i] = otherSlots[n] as Size;
    });

  const placed: Placed[] = set.map((q, i) => ({
    ...q,
    size: sizes[i] as Size,
    align: (sizes[i] === "lg"
      ? "center"
      : ALIGNS[randomInt(ALIGNS.length, rng)]) as Align,
    offset: sizes[i] === "lg" ? 0 : randomInt(OFFSET_STEPS, rng),
  }));

  // Move the large quote to the first or third position.
  const from = placed.findIndex((p) => p.size === "lg");
  if (from > -1) {
    const to = placed.length >= 3 && rng() < 0.5 ? 2 : 0;
    const [large] = placed.splice(from, 1);
    placed.splice(to, 0, large as Placed);
  }

  return placed;
}
