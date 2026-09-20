import { memo } from "react";

import type { Section } from "@/lib/types";

import { BlockRenderer } from "./BlockRenderer";
import { takesMargin } from "./presentation";

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

  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-heading`}
      className="scroll-mt-[104px]"
    >
      <h2
        id={`${section.id}-heading`}
        className="border-b border-border pb-2 font-display text-[26px] font-semibold text-text"
      >
        {section.title}
      </h2>

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
