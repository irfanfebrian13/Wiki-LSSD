"use client";

import type { Chapter } from "./presentation";

/**
 * The book-index tab strip: one tab per category, in the data's own order.
 *
 * A plain `<nav>` of buttons rather than a `role="tablist"`: a tablist needs
 * roving tabindex and arrow-key handling to be correct, and a half-implemented
 * one is worse than none. Buttons are natively focusable and activate on
 * Enter/Space, which is all the brief requires.
 */
export function TabStrip({
  chapters,
  activeSlug,
  onSelect,
}: {
  chapters: Chapter[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <nav aria-label="Kategori" className="tab-strip border-b border-border bg-bg-2">
      <div className="mx-auto flex max-w-[1080px] gap-1 overflow-x-auto px-6 pt-2">
        {chapters.map((chapter) => {
          const active = chapter.slug === activeSlug;
          return (
            <button
              key={chapter.slug}
              type="button"
              onClick={() => onSelect(chapter.slug)}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-t-sm border px-3.5 pt-2 font-cond text-[15px] font-medium uppercase tracking-[0.07em] transition-colors ${
                active
                  ? "-mb-px border-outline bg-bg pb-[9px] text-mint"
                  : "border-border bg-surface-2 pb-[7px] text-text-dim hover:text-text"
              }`}
            >
              {chapter.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
