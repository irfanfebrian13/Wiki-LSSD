import { memo } from "react";
import type { LucideProps } from "lucide-react";

import { SECTION_ICONS } from "@/lib/section-icons";
import type { Section } from "@/lib/types";

import { BlockRenderer } from "./BlockRenderer";
import { takesMargin } from "./presentation";

/**
 * The optical size and stroke weight of a category heading's icon.
 *
 * Larger than `CONTENT_ICON_PROPS` (14px) because this sits beside 28px display
 * type rather than inline with body copy — but the stroke weight is the same 2,
 * so the two sets still read as one drawn family. The icon is drawn on the
 * `gold-soft` tile below rather than on the page, so it keeps its weight there.
 */
const CATEGORY_ICON_PROPS: LucideProps = {
  size: 22,
  strokeWidth: 2,
  "aria-hidden": true,
};

/**
 * One Field Manual section: an `h2` heading, a content column, and a 220px
 * margin column for that section's notes, examples and warnings.
 *
 * The parent chapter supplies the page's `h1`, so sections are `h2`s — one
 * category page has the correct outline: one `h1`, then its sections.
 */
export const SectionView = memo(function SectionView({
  section,
  onMount,
}: {
  section: Section;
  /**
   * @deprecated The scroll-spy this registered sections for was removed with
   * the sidebar. Kept as an ignored optional prop only so the shell that still
   * passes it keeps compiling; the shell rewrite drops the call site and this
   * prop together.
   */
  onMount?: (id: string, el: HTMLElement | null) => void;
}) {
  void onMount;

  /* Derive two arrays at render time; do not mutate the frozen `section.blocks`.
     This matters because a margin block must not appear twice. */
  const content = section.blocks.filter((block) => !takesMargin(block));
  const margin = section.blocks.filter(takesMargin);

  /* A category icon on Penal Code headings only, so each charge family is
     distinguishable at a glance. The icon comes from the section-icon map the
     nav already draws, which keeps one icon per section and one drawn family
     across the app; every other chapter's heading is left exactly as it was. */
  const CategoryIcon =
    section.group === "Penal Code" ? SECTION_ICONS[section.id] : undefined;

  /* A Penal Code category opens a major group of charges, so its heading is
     drawn a step heavier than a plain section title: extra room above it, the
     category icon on a quiet `gold-soft` tile, and a two-part rule closing it
     off from the charges that follow. The treatment is opt-in on `CategoryIcon`;
     every other chapter keeps the plain hairline heading it had. */
  const heading = (
    <h2
      id={`${section.id}-heading`}
      className={
        CategoryIcon
          ? "flex items-center gap-4 font-display text-[28px] font-bold leading-tight tracking-[-0.01em] text-text"
          : "border-b border-border pb-2 font-display text-[26px] font-semibold text-text"
      }
    >
      {CategoryIcon ? (
        <span
          aria-hidden
          className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-gold-soft text-gold"
        >
          <CategoryIcon {...CATEGORY_ICON_PROPS} />
        </span>
      ) : null}
      {section.title}
    </h2>
  );

  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-heading`}
      className="scroll-mt-[104px]"
    >
      {CategoryIcon ? (
        <div className="mt-8">
          {heading}
          {/* The category's own divider: the same hairline as every other rule
              on the page, with a short gold segment marking where the new
              category starts. A sibling of the `h2` rather than a `border-b` on
              it, so the rule can carry the accent without touching the text
              box. The segment is exactly the icon tile's width, so the accent
              lines up under the tile and the two read as one left edge. */}
          <div aria-hidden className="mt-4 h-px w-full bg-border">
            <span className="block h-px w-10 bg-gold" />
          </div>
        </div>
      ) : (
        heading
      )}

      {/* `minmax(0,1fr)` rather than a bare grid: without the explicit zero
          minimum the column is sized to its widest child's min-content, and the
          flow diagram's 640px floor would then widen the whole page instead of
          scrolling inside its own container. */}
      <div className="chapter-grid mt-5 grid grid-cols-[minmax(0,1fr)] gap-12 min-[980px]:grid-cols-[minmax(0,1fr)_220px]">
        <div className="reveal-stack grid gap-[18px]">
          {content.map((block, i) => (
            <BlockRenderer key={i} block={block} section={section} />
          ))}
        </div>

        {margin.length ? (
          <aside className="grid gap-5 self-start">
            {margin.map((block, i) => (
              <BlockRenderer key={i} block={block} section={section} />
            ))}
          </aside>
        ) : null}
      </div>
    </section>
  );
});
