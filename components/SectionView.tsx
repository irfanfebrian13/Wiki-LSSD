import { memo } from "react";

import type { Section } from "@/lib/types";

import { BlockRenderer } from "./BlockRenderer";

interface SectionViewProps {
  section: Section;
  /** Registration callback so the shell can observe this section for scroll-spy. */
  onMount: (id: string, el: HTMLElement | null) => void;
  /** 0-based position, used only to stagger the reveal animation. */
  index: number;
}

/**
 * One section: header plus its blocks.
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
  return (
    <section
      id={section.id}
      ref={(el) => onMount(section.id, el)}
      aria-labelledby={`${section.id}-heading`}
      className="section-reveal scroll-mt-[68px]"
      style={{ animationDelay: `${Math.min(index * 0.03, 0.36)}s` }}
    >
      <div className="mb-5 flex items-center gap-3.5 border-b border-border pb-3.5">
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-surface text-[15px] text-accent"
        >
          {section.icon}
        </span>
        <div className="min-w-0">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-text-faint">
            {section.group}
          </div>
          <h2
            id={`${section.id}-heading`}
            className="text-[21px] font-bold leading-tight tracking-tight text-text"
          >
            {section.title}
          </h2>
        </div>
      </div>

      <div className="grid gap-4">
        {section.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>
    </section>
  );
});
