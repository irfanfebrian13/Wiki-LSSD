# Task 08: Chrome components

## Status

pending

## Wave

3

## Description

Build the four new navigation and discovery components: the book-index tab strip, the title-page cover
with its table of contents, the mobile bottom nav, and the command palette.

These are pure presentation components — they take the active category and a selection callback as props
and render. They do not read the URL or hold routing state; task-10's shell owns that and wires them
together. Keeping them prop-driven is what makes them independently testable and keeps the shell's
routing logic in one place.

## Dependencies

**Depends on:** task-02-presentation-helpers, task-03-ui-and-readonly-blocks
**Blocks:** task-10-shell-rewrite

**Context from dependencies:**

- **From task-02:** `components/presentation.tsx` exports `CHAPTERS`, the `Chapter` interface
  (`{ slug, name, index, sections, count }`), `resolveHash(hash)` returning
  `{ chapter, sectionId }`, and `chapterOfSection(sectionId)`.
- **From task-03:** `components/ui.tsx` has restyled primitives — `BTN_GOLD`, `BTN_OUTLINE`, `FIELD`,
  `MicroLabel` (now a plain label, not a pill). The `font-cond` utility (Barlow Condensed) is available
  from task-01.
- **From task-01:** `--tx`, `--outline`, `--on-tx` and their utilities; the 2–3px radius scale.

## Files to Create

- `components/TabStrip.tsx` — the book-index tab strip.
- `components/Cover.tsx` — the title page and table of contents.
- `components/BottomNav.tsx` — the mobile bottom navigation.
- `components/CommandPalette.tsx` — the Ctrl+K search overlay.

## Files to Modify

None.

## Technical Details

### 1. `components/TabStrip.tsx`

The brief: "a tab strip styled like book index tabs, one tab per existing category (same categories and
order as the current sidebar). Inactive tab `#1d232d`, active tab uses page background with a strong
border and overlaps the strip's bottom border by 1px."

`#1d232d` is the existing `--surface-2`, so inactive tabs use `bg-surface-2`; the active tab uses
`bg-bg` with `border-outline`.

```tsx
"use client";

import type { Chapter } from "./presentation";

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
              className={`shrink-0 rounded-t-sm border px-3.5 pb-[7px] pt-2 font-cond text-[15px] font-medium uppercase tracking-[0.07em] transition-colors ${
                active
                  ? "border-outline bg-bg text-mint"
                  : "border-border bg-surface-2 text-text-dim hover:text-text"
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
```

**The 1px overlap.** The prototype achieves this with `margin-bottom: -1px` on the active tab and
`padding-bottom: 9px` (2px more than the inactive 7px). Reproduce it:

```tsx
active
  ? "-mb-px border-outline bg-bg pb-[9px] text-mint"
  : "border-border bg-surface-2 text-text-dim hover:text-text"
```

The `-mb-px` pulls the active tab down over the strip's own `border-b`, so the tab appears to open into
the page — which is what "book index tabs" means.

**The active tab's text colour.** The brief assigns teal to "codes, links", and the prototype colours
the active tab with `--forest` (its teal). With this sheet's tokens that is `text-mint`. This is a
reasonable reading; if it reads oddly against the dark background, `text-text` is the safe alternative.
Prefer `text-mint`.

**Keyboard.** Each tab is a `<button>`, so it is natively focusable and Enter/Space activate it. A
`role="tablist"` with roving tabindex is the stricter ARIA pattern, but a plain `<nav>` of buttons is
simpler and fully keyboard-accessible, and the brief only requires that tabs be keyboard-operable. Use
the plain `<nav>` pattern and **do not** add `role="tab"` without implementing the full roving-tabindex
behaviour — a half-implemented tablist is worse than none.

**Overflow.** `overflow-x-auto` on the inner container lets 7 tabs scroll horizontally on a narrow
desktop; the strip itself never causes page-body horizontal scroll. Below 760px the whole strip is hidden
by the shell (task-10) in favour of the bottom nav.

### 2. `components/Cover.tsx`

The brief: "Home = title-page cover: big Fraunces title, 'Los Santos Sheriff Department', the existing
intro copy, two plain text-links to the generators. Then a 'Daftar isi' table of contents: chapter
number, category title in Fraunces, dotted leader, and section count computed from the data (not
hard-coded). No stat boxes."

**The intro copy is the existing copy.** `lib/data.ts` has no separate cover copy — the closest existing
text is `meta.subtitle` ("Los Santos Sheriff Department") and the hero paragraph that currently lives
hard-coded in `components/Hero.tsx`:

> "Los Santos Sheriff Department — semua yang kamu butuhkan sebelum turun patroli: kode radio, SOP
> taktis, penal code, sampai tool bikin laporan otomatis."

That paragraph is UI copy, not handbook content, so carrying it over to the cover is correct. Take it
from `Hero.tsx` before deleting that file (task-10 owns the deletion) so the wording is preserved
verbatim.

**The two links** are plain text links to the two generators, matching the brief's "two plain text-links".
The prototype renders them as underlined buttons:

```tsx
<div className="mt-6 flex flex-wrap gap-6">
  <a href="#patrol-report" onClick={...} className="font-semibold text-mint underline decoration-2 underline-offset-4">
    Buka Patrol Report Generator
  </a>
  <a href="#penal-generator" onClick={...} className="font-semibold text-mint underline decoration-2 underline-offset-4">
    Buka Penal Code Generator
  </a>
</div>
```

They are real anchors (`href="#..."`) so they work without JavaScript, and the shell's hash listener
handles the navigation. **Do not** make them buttons.

**The cover title.** The brief: `clamp(46px, 8.5vw, 88px)` at weight 800. Use an arbitrary value:

```tsx
<h1 className="font-display font-extrabold leading-[0.98] tracking-[-0.025em] text-text text-[clamp(46px,8.5vw,88px)]">
  LSSD Deputy<br />Pocketbook
</h1>
```

**The table of contents.** This is where the section count must be computed from the data — never
hard-coded:

```tsx
<ol className="mt-9 max-w-[680px] list-none">
  <h2 className="mb-2.5 font-display text-[26px] font-semibold text-text">Daftar isi</h2>
  {chapters.map((chapter) => (
    <li key={chapter.slug}>
      <a
        href={`#${chapter.slug}`}
        onClick={() => onSelect(chapter.slug)}
        className="flex w-full items-baseline gap-3 py-2.5 text-left"
      >
        <span className="w-[26px] shrink-0 font-mono text-[13px] text-gold">
          {String(chapter.index).padStart(2, "0")}
        </span>
        <span className="font-display text-[23px] font-semibold text-text">{chapter.name}</span>
        <span aria-hidden className="min-w-[20px] flex-1 translate-y-[-5px] border-b-2 border-dotted border-border" />
        <span className="font-mono text-[13px] text-text-dim">
          {chapter.count} bagian
        </span>
      </a>
    </li>
  ))}
</ol>
```

**The count wording.** The prototype renders e.g. "3 bagian". Since `chapter.count` is a section count
and the brief calls it "section count", render `{chapter.count} bagian` (Indonesian for "parts"), which
matches the existing UI language. For the `Form Helper` chapter the count is 2 and the prototype renders
"2 tool" — do not special-case that; "2 bagian" is accurate and consistent. **Do not hard-code any
count.**

**The dotted leader** is the `border-b-2 border-dotted` span with `flex-1`, which stretches between the
title and the count. The `translate-y-[-5px]` aligns it to the text baseline as the prototype does.

**No stat boxes, no eyebrow pill.** The brief explicitly forbids both, and the current `Hero.tsx` has
exactly those — do not carry them over.

**The star badge.** The prototype puts a large badge beside the cover title. The brief describes the
badge only in the header band ("a six-point star badge in amber"), not on the cover. Keep the cover
text-only; task-10 owns the header badge. If a cover badge is wanted, reuse the same SVG from task-10 —
but it is not required.

### 3. `components/BottomNav.tsx`

The brief: "Mobile (<760px): hide the tab strip and show a fixed bottom nav with 5 items (Codes, Radio,
Prosedur, Penal, Tools) with amber top indicator for the active one (respect safe-area-inset-bottom);
other categories stay reachable from the home table of contents and the search palette."

**Five items, but seven categories.** The five labels map onto existing category slugs:

| Label | Category slug | Chapter |
|---|---|---|
| Codes | `komunikasi` | Komunikasi |
| Radio | `radio` | Radio |
| Prosedur | `prosedur` | Prosedur |
| Penal | `penal-code` | Penal Code |
| Tools | `form-helper` | Form Helper |

`Struktur` and `Senjata` are **not** in the bottom nav — that is the brief's explicit design ("other
categories stay reachable from the home table of contents and the search palette"). Do not add a sixth
item.

```tsx
"use client";

const ITEMS = [
  { label: "Codes", slug: "komunikasi" },
  { label: "Radio", slug: "radio" },
  { label: "Prosedur", slug: "prosedur" },
  { label: "Penal", slug: "penal-code" },
  { label: "Tools", slug: "form-helper" },
];

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
      {ITEMS.map((item) => {
        const active = item.slug === activeSlug;
        return (
          <button
            key={item.slug}
            type="button"
            onClick={() => onSelect(item.slug)}
            aria-current={active ? "page" : undefined}
            className={`flex-1 px-1 py-3.5 font-cond text-[15px] font-medium uppercase tracking-[0.06em] transition-colors ${
              active ? "text-text shadow-[inset_0_3px_0_var(--gold)]" : "text-text-dim"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
```

The amber top indicator is `shadow-[inset_0_3px_0_var(--gold)]`, exactly as the prototype does it.

**The slugs must match `CHAPTERS`.** They are derived by `slugify` in task-02: "Komunikasi" →
`komunikasi`, "Radio" → `radio`, "Prosedur" → `prosedur`, "Penal Code" → `penal-code`, "Form Helper" →
`form-helper`. **Verify against `CHAPTERS` at runtime rather than trusting this table** — if a slug does
not match, the tab simply never activates, which is a silent failure. A cheap guard is to assert in
development that every `ITEM.slug` exists in `CHAPTERS`.

**Only the `bottom-nav` class is required** by the print stylesheet (task-01) and the shell (task-10),
which hides it above 760px via `min-[760px]:hidden`.

### 4. `components/CommandPalette.tsx`

The brief: "Ctrl+K (or Cmd+K) and '/' open a centered overlay (max 620px, strong border, hard shadow). It
must reuse the site's existing search index and logic, listing results with their category label at the
right; arrow keys move, Enter opens, Esc closes; selected row uses `#2b3444` with cream text. Opening a
result navigates to the correct category page and section. Replace the old top search bar with this."

**Reuse the existing search index.** `lib/search.ts` exports `buildSearchIndex(sections)` and
`matchSections(sections, index, query)`. Both are frozen and must be used as-is — do not write a new
matcher.

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildSearchIndex, matchSections } from "@/lib/search";
import type { Section } from "@/lib/types";
import { CHAPTERS, type Chapter } from "./presentation";

export function CommandPalette({
  open,
  onClose,
  sections,
  chapters,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  sections: Section[];
  chapters: Chapter[];
  onNavigate: (sectionId: string | null, slug: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo(() => buildSearchIndex(sections), [sections]);

  const results = useMemo(() => {
    const matched = matchSections(sections, index, query);
    return sections.filter((s) => matched.has(s.id)).slice(0, 12);
  }, [sections, index, query]);
  ...
}
```

**Result rows show the category label at the right**, which comes from `chapterOfSection(section.id)`:

```tsx
{results.map((section, i) => {
  const chapter = chapterOfSection(section.id);
  return (
    <li
      key={section.id}
      role="option"
      aria-selected={i === selected}
      onClick={() => pick(i)}
      className={`flex cursor-pointer justify-between gap-3 px-4 py-2.5 text-[15px] ${
        i === selected ? "bg-tx text-on-tx" : "text-text"
      }`}
    >
      <span>{section.title}</span>
      <span className="shrink-0 font-mono text-[12px] opacity-75">{chapter?.name ?? section.group}</span>
    </li>
  );
})}
```

**The selected row uses `bg-tx` with `text-on-tx`** — `#2b3444` is `--tx`'s dark value, and `--on-tx` is
cream in both themes, so the selected row reads correctly in light mode too.

**An empty query must still show something useful.** `matchSections` returns every section for an empty
query, so `results` would be the first 12 sections — a reasonable "browse" state. The prototype instead
starts with a curated index. Either is acceptable; showing the first 12 sections is simpler and reuses
the existing logic unchanged, so prefer that. **Do not build a second index.**

**Keyboard handling.** This is the component's core behaviour and must be complete:

```tsx
const onKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setSelected((s) => Math.min(s + 1, results.length - 1));
    return;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    setSelected((s) => Math.max(s - 1, 0));
    return;
  }
  if (e.key === "Enter") {
    e.preventDefault();
    pick(selected);
  }
};
```

**Opening and closing.** The shell (task-10) owns the open state and the global key listener, because the
listener must work whether or not the palette is mounted. The palette itself should:

- Focus its input when it opens (`useEffect` on `open`, with a `setTimeout(..., 0)` or a ref callback so
  focus lands after the paint).
- Reset `query` and `selected` to their initial values each time it opens.
- Render `null` when `open` is false, **or** stay mounted with `hidden`. Prefer rendering `null` — a
  closed dialog should not be in the accessibility tree.

**Focus trap.** A modal dialog should trap focus. Implement a simple trap: on `Tab`, cycle within the
dialog's focusable elements (the input and the list). At minimum, ensure the dialog has `role="dialog"`
and `aria-modal="true"` and an `aria-label`, and that `Esc` closes it. **Do not skip `aria-modal`** — it
is what tells a screen reader the rest of the page is inert.

**Clicking the scrim closes the dialog**, matching the prototype. Attach the click to the scrim and check
`e.target === e.currentTarget` so a click inside the box does not close it.

```tsx
<div
  className="command-palette fixed inset-0 z-50 flex justify-center bg-black/60 px-4 pt-[12vh]"
  onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
>
  <div role="dialog" aria-modal="true" aria-label="Cari di handbook"
       className="h-fit w-[min(620px,100%)] rounded-sm border border-outline bg-bg shadow-[8px_8px_0_rgba(0,0,0,0.25)]">
    ...
  </div>
</div>
```

**The `command-palette` class** is what the print stylesheet hides.

**Navigating on select.** `pick(i)` calls `onClose()` then
`onNavigate(section.id, chapterOfSection(section.id)!.slug)`. The shell activates the category and scrolls
to the section. The brief: "Opening a result navigates to the correct category page and section."

**A hint line** at the bottom, as the prototype has, telling the user the keys:
"Panah atas/bawah untuk memilih, Enter untuk membuka, Esc untuk menutup".

**The old top search bar is removed** — that is task-10's job, since it lives in `Shell.tsx`. This task
only builds the palette.

## Acceptance Criteria

- [ ] `TabStrip` renders one tab per chapter in `CHAPTERS` order, with inactive tabs on `bg-surface-2`
      and the active tab on `bg-bg` with `border-outline` and a `-mb-px` overlap.
- [ ] The active tab is marked with `aria-current="page"`; every tab is a `<button>` and keyboard-operable.
- [ ] The strip scrolls horizontally on narrow widths and never causes page-body horizontal scroll.
- [ ] `Cover` renders the Fraunces title at `clamp(46px, 8.5vw, 88px)` weight 800, the "Los Santos
      Sheriff Department" subtitle, the existing hero intro copy verbatim, and two plain underlined
      anchors to the generators.
- [ ] The TOC renders one row per chapter with a two-digit mono chapter number, the category name in
      Fraunces, a dotted leader, and a count read from `chapter.count` — **no hard-coded counts**.
- [ ] `Cover` contains no stat boxes and no pill eyebrow label.
- [ ] `BottomNav` renders exactly 5 items (Codes, Radio, Prosedur, Penal, Tools) mapping to the slugs
      `komunikasi`, `radio`, `prosedur`, `penal-code`, `form-helper`, and is hidden at 760px and above.
- [ ] The active bottom-nav item carries `aria-current="page"` and an amber top indicator
      (`inset 0 3px 0`), and the nav respects `env(safe-area-inset-bottom)`.
- [ ] `CommandPalette` reuses `buildSearchIndex` and `matchSections` from `lib/search.ts` — no second
      matcher is written.
- [ ] Results list the section title with its category name at the right, capped at 12.
- [ ] The selected row renders on `bg-tx` with `text-on-tx`.
- [ ] ArrowUp/ArrowDown move the selection within bounds, Enter opens the selected result, Esc closes.
- [ ] Selecting a result closes the palette, activates the right category and navigates to the section.
- [ ] The palette is `role="dialog"` with `aria-modal="true"`, an `aria-label`, and focuses its input on
      open; clicking the scrim closes it but clicking inside does not.
- [ ] The palette and bottom nav carry the `command-palette` and `bottom-nav` classes the print stylesheet
      and the shell rely on.
- [ ] `npx tsc --noEmit` passes and `npm run lint` is clean.
- [ ] `git diff --stat lib/` is empty.

## Notes

**These components are prop-driven on purpose.** None of them reads `window.location` or holds routing
state — the shell owns that. If a component needs the active category it receives `activeSlug`; if it
needs to navigate it calls `onSelect`/`onNavigate`. This keeps routing in one place and makes the
components independent of the URL scheme.

**`"use client"` is required on `CommandPalette` and `BottomNav`** (both hold or receive handlers and
`CommandPalette` holds state). `TabStrip` and `Cover` also receive handlers, so they need it too if they
are imported from a Server Component — but they will be imported by `Shell.tsx`, which is already a
Client Component, so the directive is optional for them. Adding it is harmless and consistent; prefer
adding it to all four.

**The five bottom-nav slugs are the one place this spec could silently break.** If a slug does not match
`CHAPTERS`, the corresponding tab never shows as active and the button does nothing. Verify against
`CHAPTERS` before finishing, and prefer deriving the items from `CHAPTERS` where possible:

```tsx
const ITEM_ORDER = ["komunikasi", "radio", "prosedur", "penal-code", "form-helper"];
const ITEM_LABELS: Record<string, string> = {
  komunikasi: "Codes", radio: "Radio", prosedur: "Prosedur",
  "penal-code": "Penal", "form-helper": "Tools",
};
```

**Do not add a second search index or a curated result list.** The brief says the palette "must reuse the
site's existing search index and logic" — `lib/search.ts` is that index, and it is already good enough
(it matches on title, group, icon, id and every string in the blocks).
