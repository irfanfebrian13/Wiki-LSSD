import { memo } from "react";

import { sectionIcon } from "@/lib/section-icons";
import type { Section } from "@/lib/types";

import { BlockRenderer } from "./BlockRenderer";
import { CONTENT_ICON_PROPS } from "./ui";

interface SectionViewProps {
  section: Section;
  /** Registration callback so the shell can observe this section for scroll-spy. */
  onMount: (id: string, el: HTMLElement | null) => void;
  /** 0-based position, used only to stagger the reveal animation. */
  index: number;
}

/**
 * One section: the reference's page header (category chip, large title) plus
 * its blocks.
 *
 * Memoised because search filtering re-renders the shell on every keystroke,
 * and only the sections whose visibility actually changed need to re-render —
 * not every block in the pocketbook.
 */
export const SectionView = memo(function SectionView({
  section,
  onMount,
  index,
}: SectionViewProps) {
  const Icon = sectionIcon(section.id);

  return (
    <section
      id={section.id}
      ref={(el) => onMount(section.id, el)}
      aria-labelledby={`${section.id}-heading`}
      className="section-reveal scroll-mt-[68px]"
      style={{ animationDelay: `${Math.min(index * 0.03, 0.36)}s` }}
    >
      <header className="mb-6">
        <span className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-[5px] text-[11.5px] font-semibold text-gold">
          <Icon {...CONTENT_ICON_PROPS} />
          {section.group}
        </span>
        <h2
          id={`${section.id}-heading`}
          className="font-display text-[28px] font-bold leading-[1.15] tracking-[-0.01em] text-text"
        >
          {section.title}
        </h2>
      </header>

      <div className="grid gap-[18px]">
        {section.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>
    </section>
  );
});
