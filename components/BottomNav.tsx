"use client";

import { CHAPTERS } from "./presentation";

/**
 * The mobile bottom navigation.
 *
 * Five items for seven categories — the brief's own design. `Struktur` and
 * `Senjata` stay reachable from the home table of contents and the search
 * palette.
 *
 * The slugs are asserted against `CHAPTERS` in development: a slug that does
 * not match would make the tab never activate and the button do nothing, which
 * is a silent failure.
 */
const ITEM_ORDER = ["komunikasi", "radio", "prosedur", "penal-code", "form-helper"];

const ITEM_LABELS: Record<string, string> = {
  komunikasi: "Codes",
  radio: "Radio",
  prosedur: "Prosedur",
  "penal-code": "Penal",
  "form-helper": "Tools",
};

if (process.env.NODE_ENV !== "production") {
  const known = new Set(CHAPTERS.map((c) => c.slug));
  for (const slug of ITEM_ORDER) {
    if (!known.has(slug)) {
      console.warn(
        `BottomNav: "${slug}" is not a chapter slug — that item will never activate.`,
      );
    }
  }
}

export function BottomNav({
  activeSlug,
  onSelect,
}: {
  activeSlug: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <nav
      aria-label="Navigasi cepat"
      className="bottom-nav fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-bg-2 pb-[env(safe-area-inset-bottom,0px)] min-[760px]:hidden"
    >
      {ITEM_ORDER.map((slug) => {
        const active = slug === activeSlug;
        return (
          <button
            key={slug}
            type="button"
            onClick={() => onSelect(slug)}
            aria-current={active ? "page" : undefined}
            className={`flex-1 px-1 py-3.5 font-cond text-[15px] font-medium uppercase tracking-[0.06em] transition-colors ${
              active ? "text-text shadow-[inset_0_3px_0_var(--gold)]" : "text-text-dim"
            }`}
          >
            {ITEM_LABELS[slug]}
          </button>
        );
      })}
    </nav>
  );
}
