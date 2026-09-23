"use client";

import { sectionIcon } from "@/lib/section-icons";
import type { Section } from "@/lib/types";

/**
 * The Form Helper sub-navigation.
 *
 * The two generators are separate pages, so the chapter carries its own
 * switcher between them: one segmented button per section, the active one
 * filled gold. It sits below the chapter header, distinct from the category
 * `TabStrip` above it (which switches chapters) and from a form's own
 * Output/Preview tabs (which switch panels inside one page) — three different
 * jobs, three different looks.
 *
 * A plain `<nav>` of buttons, not a `role="tablist"`, for the same reason the
 * `TabStrip` is: a real tablist needs roving tabindex and arrow-key handling,
 * and a half-implemented one is worse than none. Buttons are natively
 * focusable and activate on Enter/Space.
 *
 * Labels are the section titles read from the data, never invented, so the
 * switcher and the page heading always agree. Below 560px the two buttons
 * stack, so the longest title never overflows the viewport.
 */
export function SubNav({
  views,
  activeId,
  onSelect,
}: {
  /** The chapter's sections, in data order. */
  views: Section[];
  /** The id of the section currently shown. */
  activeId: string;
  onSelect: (sectionId: string) => void;
}) {
  return (
    <nav
      aria-label="Pilih tool"
      className="mb-7 grid grid-cols-1 gap-1 rounded-sm border border-outline bg-surface-2 p-1 min-[560px]:inline-grid min-[560px]:grid-cols-2"
    >
      {views.map((view) => {
        const Icon = sectionIcon(view.id);
        const active = view.id === activeId;

        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onSelect(view.id)}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 font-cond text-[15px] font-medium uppercase tracking-[0.06em] transition-colors duration-150 ${
              active
                ? "bg-gold text-on-accent"
                : "text-text-dim hover:bg-surface hover:text-text"
            }`}
          >
            <Icon size={15} strokeWidth={2} aria-hidden />
            {view.title}
          </button>
        );
      })}
    </nav>
  );
}
