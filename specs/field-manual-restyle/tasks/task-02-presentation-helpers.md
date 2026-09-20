# Task 02: Presentation helpers

## Status

complete

## Wave

1

## Description

Create the pure, data-derived helpers that every later task reads from. This is the mechanism that lets
the brief's components be built from the existing data **without restructuring `lib/data.ts`**: instead
of changing the data to suit the new UI, this module derives the new UI's concepts (chapters, tier
groups, penal rows) from the data as it already is.

Everything here is a pure function or a precomputed constant. No React, no state, no `"use client"`, so
both Server Components and client components can import it.

## Dependencies

**Depends on:** None (Wave 1)
**Blocks:** task-04-dedicated-components, task-09-section-view-and-renderer, task-08-chrome-components

**Context from dependencies:** None. This module reads only `lib/data.ts` and `lib/types.ts`, both of
which are frozen and already exist. Its exports are a frozen contract — every wave-3 task imports from
it by the exact names given below.

## Files to Create

- `components/presentation.tsx` — chapter derivation, hash resolution, tier grouping, penal row
  splitting, and the margin-column predicate.

## Files to Modify

None.

## Technical Details

### The data this reads from

`lib/data.ts` exports `POCKETBOOK` with `meta` and `sections`. Each section is:

```ts
interface Section {
  id: string;      // e.g. "ten-codes"
  icon: string;    // e.g. "✕" — an emoji or glyph, not used by this task
  title: string;   // e.g. "Ten Codes"
  group: string;   // e.g. "Komunikasi" — THE CATEGORY
  blocks: Block[];
}
```

There are **37 sections** across **7 groups**, in this first-appearance order:

| Order | Group | Sections |
|---|---|---|
| 1 | Struktur | 3 |
| 2 | Komunikasi | 4 |
| 3 | Radio | 12 |
| 4 | Prosedur | 6 |
| 5 | Senjata | 2 |
| 6 | Penal Code | 8 |
| 7 | Form Helper | 2 |

`lib/types.ts` exports `Block` (a discriminated union on `type`), `LegendItem`
(`{ color, label, desc }`), and `Section`.

### Step 1 — Chapter derivation

**A chapter is a category.** This is the decision the whole restyle rests on: the brief's table of
contents shows "chapter number, category title, dotted leader, section count", which only lines up with
the chapter headers if the chapter is the group. The alternative — a chapter per section — was
considered and rejected.

Build the chapter list by reducing `sections` on `group`, preserving first-appearance order.

```tsx
import { POCKETBOOK } from "@/lib/data";
import type { Block, LegendItem, Section } from "@/lib/types";

export interface Chapter {
  /** URL-safe id derived from the group name, e.g. "penal-code". */
  slug: string;
  /** The group name exactly as the data states it, e.g. "Penal Code". */
  name: string;
  /** 1-based position in the chapter order. Chapter 01 is "Struktur". */
  index: number;
  /** The group's sections, in data order. */
  sections: Section[];
  /** `sections.length` — computed, never hard-coded. */
  count: number;
}

/** `"Penal Code"` → `"penal-code"`. Lowercase, runs of non-alphanumerics to `-`. */
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const CHAPTERS: Chapter[] = (() => {
  const order: string[] = [];
  const byName = new Map<string, Section[]>();

  for (const section of POCKETBOOK.sections) {
    if (!byName.has(section.group)) {
      byName.set(section.group, []);
      order.push(section.group);
    }
    byName.get(section.group)!.push(section);
  }

  return order.map((name, i) => {
    const sections = byName.get(name)!;
    return {
      slug: slugify(name),
      name,
      index: i + 1,
      sections,
      count: sections.length,
    };
  });
})();
```

The TOC's section count must come from this `count` field. **Never hard-code the counts** — the brief
calls this out explicitly, and a hard-coded list would silently drift if a section were added.

### Step 2 — Section → chapter lookup

```tsx
const SECTION_TO_CHAPTER = new Map<string, Chapter>();
for (const chapter of CHAPTERS) {
  for (const section of chapter.sections) SECTION_TO_CHAPTER.set(section.id, chapter);
}

export function chapterOfSection(sectionId: string): Chapter | undefined {
  return SECTION_TO_CHAPTER.get(sectionId);
}
```

### Step 3 — Hash resolution

The site stays on the single route `/`; the active category is carried in the URL hash. Every existing
deep link must keep working, so a hash that names a **section** must resolve to that section's chapter
and scroll to the section, while a hash that names a **category** just activates it.

This is what makes `/#ten-codes`, `/#patrol-report` and `/#penal-generator` keep working unchanged.

```tsx
export interface HashTarget {
  chapter: Chapter | null;
  /** Set only when the hash named a section, so the shell can scroll to it. */
  sectionId: string | null;
}

/**
 * Resolve a URL hash (with or without the leading `#`) to a chapter, and to a
 * section when the hash named one.
 *
 * Section ids win over category slugs: no section id currently collides with a
 * category slug, but resolving sections first is the safe order, since section
 * ids are the ones already published in the wild.
 */
export function resolveHash(hash: string): HashTarget {
  const key = hash.replace(/^#/, "").trim();
  if (!key) return { chapter: null, sectionId: null };

  const chapter = chapterOfSection(key);
  if (chapter) return { chapter, sectionId: key };

  const bySlug = CHAPTERS.find((c) => c.slug === key);
  return { chapter: bySlug ?? null, sectionId: null };
}
```

### Step 4 — Tier grouping for the rank ladder

The brief requires the ladder to be "grouped by the existing colour classification in the data" with
each group carrying "the group's existing label", and explicitly says: *do not invent group labels; if
a label does not exist in the data, use the colour meaning that the site already states.*

That label exists — it is the `legend` block in the `chain-of-command` section, whose `desc` fields read
"Executive Staff", "Command Staff", "Supervisory Staff", "Field Staff", "Academy Recruit". So the labels
come straight from the data and nothing is invented.

`lib/ranks.ts` exports `rankColor(rank: string): string`, which maps a rank name to its tier hex
(Sheriff/Undersheriff/Assistant Sheriff → `#3b82f6`; Division Chief/Area Commander/Captain → `#22c55e`;
Lieutenant/Sergeant → `#ef4444`; the Deputy Sheriff tiers → `#eab308`; Academy Recruit → `#9ca3af`).

```tsx
import { rankColor } from "@/lib/ranks";

export interface TierGroup {
  /** The `legend` item's `desc`, e.g. "Field Staff". Never invented. */
  label: string;
  /** The tier hex, from the legend item. */
  color: string;
  /** Rank names in the order the `ranks` block lists them. */
  ranks: string[];
}

/**
 * Group a `ranks` block by the tiers the `legend` block declares.
 *
 * The legend's `desc` is the group label and its `color` is the band colour;
 * `rankColor` is the bridge from a rank name to its tier. Ranks are matched to a
 * tier by colour rather than by name so the mapping cannot drift from
 * `lib/ranks.ts`.
 *
 * Groups come out in legend order, and ranks keep their order within a group.
 */
export function tierGroups(ranks: string[], legend: LegendItem[]): TierGroup[] {
  return legend
    .map((item) => ({
      label: item.desc,
      color: item.color,
      ranks: ranks.filter((rank) => rankColor(rank).toLowerCase() === item.color.toLowerCase()),
    }))
    .filter((group) => group.ranks.length > 0);
}
```

**Do not reorder the legend or the ranks.** The legend happens to list the tiers lowest-to-highest
(Abu → Kuning → Merah → Hijau → Biru) while the `ranks` block lists them highest-to-lowest; the ladder
should therefore render groups in legend order, with the ranks inside each group in the ranks block's
order. This keeps every piece of wording and ordering exactly as the data states it.

### Step 5 — Penal row splitting

The penal reference pages hold two different shapes of content:

- **`penal` blocks** (`penal-robbery`, `penal-violence`) have a `title`, a `main` and a `charges[]`
  array. These render as the existing card-like structure, not as definition rows.
- **`bullets` blocks** (`penal-property`, `penal-firearms`, `penal-ammo`, `penal-narcotics`,
  `penal-traffic`, `penal-money`) hold strings that mostly read `"Term — description."`.

The brief asks for definition-list rows (term in Fraunces, description in muted text) with a small red
mono tag on "Court Verdict" articles. So bullets must be split into a term and a description.

```tsx
/** A "Court Verdict" article is tagged in the source text as `(Court Verdict)`. */
export function isCourtVerdict(text: string): boolean {
  return /\(Court Verdict\)/i.test(text);
}

export interface PenalRow {
  term: string;
  /** `null` when the bullet carries no `" — "` separator. */
  desc: string | null;
  court: boolean;
}

/**
 * Split one penal bullet into a term and its description.
 *
 * The bullets use an em-dash separator: "Vandalism — perusakan ringan …". A
 * bullet with no separator keeps its whole text as the term and reports a null
 * description rather than inventing prose the department never wrote.
 *
 * The "(Court Verdict)" marker is stripped from the term and reported as a flag,
 * because it is rendered as a tag beside the term rather than as part of it.
 */
export function splitPenalBullet(text: string): PenalRow {
  const court = isCourtVerdict(text);
  const cleaned = text.replace(/\s*\(Court Verdict\)\s*/i, " ").trim();

  const at = cleaned.indexOf(" — ");
  if (at === -1) return { term: cleaned, desc: null, court };

  return {
    term: cleaned.slice(0, at).trim(),
    desc: cleaned.slice(at + 3).trim(),
    court,
  };
}
```

**Verify this assumption against the real strings before relying on it.** The bullets in
`lib/data.ts` are the source of truth. At planning time the separator is an em-dash surrounded by
spaces, but spot-check a few (`penal-property`, `penal-ammo`, `penal-narcotics`) and adjust the
separator constant if a bullet uses a different dash. Any bullet without the separator degrades
gracefully to a bare term.

Note that `Ammunition Smuggling (Court Verdict) — membawa > 2000 butir.` should yield
`term: "Ammunition Smuggling"`, `court: true`.

### Step 6 — Margin column predicate

The brief puts notes, warnings and tips in a 220px right margin column as callouts. Only three block
types qualify: `note`, `example` (both amber, informational) and `callout` (red, a warning).

```tsx
/**
 * Whether a block belongs in the chapter's right margin column rather than the
 * content column.
 *
 * `callout` is the data's warning shape, so it takes the red rule; `note` and
 * `example` are informational and take amber. Everything else stays in the
 * content column.
 */
export function takesMargin(block: Block): boolean {
  return block.type === "note" || block.type === "example" || block.type === "callout";
}
```

**Important consequence:** because these blocks move out of the content flow, the content column's
rendered block list must filter them out — otherwise they render twice. The shell must not mutate
`section.blocks`; filtering happens at render time in task-07.

## Acceptance Criteria

- [ ] `components/presentation.tsx` exists, has no `"use client"` directive, and imports only from
      `@/lib/data`, `@/lib/types` and `@/lib/ranks`.
- [ ] `CHAPTERS` has exactly 7 entries, in the order Struktur, Komunikasi, Radio, Prosedur, Senjata,
      Penal Code, Form Helper, with counts 3, 4, 12, 6, 2, 8, 2 and indices 1–7.
- [ ] `CHAPTERS[i].count` equals `CHAPTERS[i].sections.length` for every chapter — computed, not
      hard-coded.
- [ ] `slugify` maps "Penal Code" to `"penal-code"` and "Form Helper" to `"form-helper"`.
- [ ] `chapterOfSection("ten-codes")` returns the Komunikasi chapter; an unknown id returns `undefined`.
- [ ] `resolveHash("#ten-codes")` returns the Komunikasi chapter **and** `sectionId: "ten-codes"`.
- [ ] `resolveHash("#penal-code")` returns the Penal Code chapter with `sectionId: null`.
- [ ] `resolveHash("#patrol-report")` returns the Form Helper chapter with `sectionId: "patrol-report"`.
- [ ] `resolveHash("")` and `resolveHash("#")` both return `{ chapter: null, sectionId: null }`.
- [ ] `tierGroups` returns 5 groups for the `chain-of-command` data, labelled from the legend's `desc`
      fields, with every one of the 13 ranks appearing in exactly one group.
- [ ] `splitPenalBullet("Vandalism — perusakan ringan.")` returns
      `{ term: "Vandalism", desc: "perusakan ringan.", court: false }`.
- [ ] `splitPenalBullet("Ammunition Smuggling (Court Verdict) — membawa > 2000 butir.")` returns
      `{ term: "Ammunition Smuggling", desc: "membawa > 2000 butir.", court: true }`.
- [ ] `splitPenalBullet("Drugs Selling — setiap orang …")` splits correctly and reports `court: false`.
- [ ] `takesMargin` returns `true` for `note`, `example` and `callout` blocks and `false` for every
      other block type.
- [ ] `npx tsc --noEmit` passes.
- [ ] `git diff --stat lib/` is empty.

## Notes

**Nothing in this file may modify `lib/`.** If a helper seems to need a change to `lib/data.ts`, that is
the signal to find a presentation-only fallback instead — this is the constraint the whole spec is built
around. Report it rather than changing the data.

**`POCKETBOOK.sections` must never be mutated.** Every helper here is read-only, and task-07 filters at
render time rather than splicing the array.

**The `icon` field on each section is not used by this task.** The existing `lib/section-icons.ts` maps
section ids to Lucide icons and is pinned by `lib/section-icons.test.ts`; it stays exactly as it is and
remains available to any component that wants an icon.
