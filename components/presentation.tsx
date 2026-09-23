/* ============================================================================
   Presentation helpers.

   Every function here derives the Field Manual's concepts — chapters, tier
   groups, penal rows — from `lib/data.ts` as it already is. Nothing in `lib/`
   is restructured to suit the new UI; the new UI is derived from the data.

   Pure functions and precomputed constants only: no React, no state, no
   "use client", so both Server Components and client components can import it.
   ========================================================================= */

import { POCKETBOOK } from "@/lib/data";
import { rankColor } from "@/lib/ranks";
import type { Block, LegendItem, Section } from "@/lib/types";

/* ==========================================================================
   Chapters
   ========================================================================== */

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
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * A chapter is a category.
 *
 * The data holds 7 groups holding 37 sections, so the chapters are numbered
 * 01–07 in the data's own first-appearance order and the sections inside each
 * render as headings. That is the only reading under which the brief's table of
 * contents (chapter number + category title + section count) lines up with the
 * chapter headers.
 */
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

const SECTION_TO_CHAPTER = new Map<string, Chapter>();
for (const chapter of CHAPTERS) {
  for (const section of chapter.sections) SECTION_TO_CHAPTER.set(section.id, chapter);
}

export function chapterOfSection(sectionId: string): Chapter | undefined {
  return SECTION_TO_CHAPTER.get(sectionId);
}

/* ==========================================================================
   View chapters
   ========================================================================== */

/**
 * The chapters that render as one page per section instead of stacking every
 * section on a single scrolling page, keyed by chapter slug.
 *
 * The Form Helper chapter holds two self-contained tools, each with its own
 * form state, so it shows one tool at a time behind a sub-navigation. Every
 * other chapter keeps the stacked page it has always had — this is the only
 * chapter whose sections are pages in their own right.
 */
const VIEW_CHAPTER_SLUGS = new Set(["form-helper"]);

/** Whether a chapter splits into separate per-section pages. */
export function isViewChapter(chapter: Chapter): boolean {
  return VIEW_CHAPTER_SLUGS.has(chapter.slug);
}

/**
 * The active view of a view chapter: the section the hash named, or the
 * chapter's first section when the hash named only the chapter — which is what
 * the category tab writes (`#form-helper`), so that tab always lands on the
 * first tool.
 *
 * The section ids are the published deep links (`#patrol-report`,
 * `#penal-generator`), so a view is addressed by the section it shows and the
 * existing links keep working unchanged.
 */
export function resolveView(sectionId: string | null, chapter: Chapter): Section {
  return (
    chapter.sections.find((section) => section.id === sectionId) ??
    chapter.sections[0]
  );
}

/* ==========================================================================
   Hash resolution
   ========================================================================== */

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
 *
 * This is what keeps `/#ten-codes`, `/#patrol-report` and `/#penal-generator`
 * working unchanged.
 */
export function resolveHash(hash: string): HashTarget {
  const key = hash.replace(/^#/, "").trim();
  if (!key) return { chapter: null, sectionId: null };

  const chapter = chapterOfSection(key);
  if (chapter) return { chapter, sectionId: key };

  const bySlug = CHAPTERS.find((c) => c.slug === key);
  return { chapter: bySlug ?? null, sectionId: null };
}

/* ==========================================================================
   Rank tiers
   ========================================================================== */

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
      ranks: ranks.filter(
        (rank) => rankColor(rank).toLowerCase() === item.color.toLowerCase(),
      ),
    }))
    .filter((group) => group.ranks.length > 0);
}

/* ==========================================================================
   Penal rows
   ========================================================================== */

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

/* ==========================================================================
   Margin column
   ========================================================================== */

/**
 * Whether a block belongs in the chapter's right margin column rather than the
 * content column.
 *
 * `callout` is the data's warning shape, so it takes the red rule; `note` and
 * `example` are informational and take amber. Everything else stays in the
 * content column.
 *
 * Because these blocks move out of the content flow, the content column's
 * rendered block list must filter them out — otherwise they render twice. The
 * split is done with two `filter` calls at render time; `section.blocks` is
 * never mutated.
 */
export function takesMargin(block: Block): boolean {
  return block.type === "note" || block.type === "example" || block.type === "callout";
}
