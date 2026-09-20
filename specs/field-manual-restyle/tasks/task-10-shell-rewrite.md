# Task 10: Shell rewrite

## Status

complete

## Wave

5

## Description

Rewrite `components/Shell.tsx` as the Field Manual shell: the sticky header band, category routing via
the URL hash, and the assembly of the cover, tab strip, chapter sections, bottom nav and command
palette. Then delete the two components the new structure replaces — the accordion `Sidebar` and the
stat-box `Hero` — and finish the motion trim that task-05 deferred.

This is the integration task: it is the first point at which the whole restyle is visible end to end.

## Dependencies

**Depends on:** task-06-transmission-block, task-09-section-view-and-renderer, task-08-chrome-components
**Blocks:** task-11-verification

**Context from dependencies:**

- **From task-06:** `components/Transmission.tsx` exports `Transmission` and `LanguageToggle`.
  `components/RadioCall.tsx` was deleted by task-09.
- **From task-09:** `components/SectionView.tsx` now takes only `{ section }` (or an unused optional
  `onMount`), renders the 26px heading and the two-column chapter grid, and reads `takesMargin` from
  `presentation.tsx`. `components/BlockRenderer.tsx` takes an optional `section` prop and routes the
  dedicated block types to `TenCodes`, `Ladder`, `Procedures`, `FlowDiagram` and `Transmission`.
- **From task-08:** `TabStrip({ chapters, activeSlug, onSelect })`,
  `Cover({ chapters, onSelect })`, `BottomNav({ activeSlug, onSelect })`, and
  `CommandPalette({ open, onClose, sections, chapters, onNavigate })` all exist and are prop-driven.
- **From task-05:** `components/pocketbook-context.tsx` exports `PocketbookProvider` and
  `usePocketbook()` → `{ callsign, setCallsign, lang, setLang, substitute, plain }`.
- **From task-02:** `CHAPTERS`, `resolveHash(hash)` → `{ chapter, sectionId }`, `chapterOfSection(id)`.

## Files to Modify

- `components/Shell.tsx` — the full rewrite.
- `components/motion.ts` — remove `useNavHighlight` and `useCountUp` if task-05 deferred it.
- `app/page.tsx` — wrap the shell in `PocketbookProvider` if the provider is not inside `Shell`.

## Files to Delete

- `components/Sidebar.tsx` — the accordion sidebar, which the brief forbids.
- `components/Hero.tsx` — the stat-box hero, which the brief forbids.

## Technical Details

### 1. Routing model

**Stay on the single route `/`.** No new routes. The active category lives in the URL hash, and every
existing deep link must keep working.

The resolution rule comes from `resolveHash(hash)` in `presentation.tsx`:

- A hash naming a **section id** (e.g. `#ten-codes`) → that section's chapter becomes active, **and** the
  page scrolls to that section.
- A hash naming a **category slug** (e.g. `#penal-code`) → that chapter becomes active.
- An empty or unknown hash → the cover.

This is what keeps `#patrol-report` and `#penal-generator` working: both are section ids in the
`Form Helper` chapter, so they open the Tools tab and scroll to the generator.

```tsx
const [activeSlug, setActiveSlug] = useState<string | null>(null);
const [pendingSection, setPendingSection] = useState<string | null>(null);
const [paletteOpen, setPaletteOpen] = useState(false);

/* Read the hash on mount and on every hashchange. Using useSyncExternalStore
   keeps the server snapshot ("") and the hydration pass identical. */
const hash = useSyncExternalStore(subscribeToHash, readHash, readHashOnServer);

useEffect(() => {
  const { chapter, sectionId } = resolveHash(hash);
  if (chapter) setActiveSlug(chapter.slug);
  else setActiveSlug(null);          // no hash → cover
  if (sectionId) setPendingSection(sectionId);
}, [hash]);
```

**Scrolling to a section after the category renders.** When a section id resolves, the section is not in
the DOM until the category's page has rendered. Scroll in an effect that runs after the render, and clear
the pending value so it fires once:

```tsx
useEffect(() => {
  if (!pendingSection) return;
  const el = document.getElementById(pendingSection);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  replayReveal(el);
  setPendingSection(null);
}, [pendingSection, activeSlug]);
```

**Writing the hash on tab change.** Use `history.replaceState`, matching the prototype, so tabs are
shareable without piling up history entries:

```tsx
const selectChapter = useCallback((slug: string) => {
  setActiveSlug(slug);
  try { history.replaceState(null, "", `#${slug}`); } catch { /* ignore */ }
  window.scrollTo(0, 0);
}, []);
```

**Preserve the existing `useSyncExternalStore` hash store.** `Shell.tsx` already has
`subscribeToHash`, `readHash` and `readHashOnServer` for exactly this purpose — keep them, with their
existing comment explaining why the server snapshot is `""`.

### 2. The header band

The brief: "Sticky header (respect safe-area-inset-top): band `#12161d` with a six-point star badge in
amber, 'LSSD Pocketbook' in Fraunces, and the existing 'Handbook by Brian Putra' credit as small
subtitle. Right side: 'Cari' button with Ctrl K hint, a Callsign text input, theme toggle."

`#12161d` is the existing `--bg-2`, so the band is `bg-bg-2`.

```tsx
<header className="app-header sticky top-0 z-40 bg-bg-2 pt-[env(safe-area-inset-top,0px)]">
  <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-4 px-6 py-2.5">
    <button type="button" onClick={() => selectChapter("")} className="flex items-center gap-3 text-left">
      <StarBadge />
      <span>
        <b className="block font-display text-[19px] font-semibold leading-tight text-text">
          LSSD Pocketbook
        </b>
        <small className="block text-[12px] text-text-dim">Handbook by Brian Putra</small>
      </span>
    </button>

    <div className="flex items-center gap-2.5">
      <label className="hidden items-center gap-2 font-mono text-[12px] text-text-dim min-[760px]:flex">
        Callsign
        <input
          type="text"
          value={callsign}
          onChange={(e) => setCallsign(e.target.value)}
          placeholder="61-Robert-210"
          autoComplete="off"
          spellCheck={false}
          className="w-[128px] border-b border-border-strong bg-transparent px-0.5 py-1 font-mono text-[13px] text-text placeholder:text-text-faint focus:border-gold focus:outline-none"
        />
      </label>

      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        aria-label="Cari"
        className="inline-flex items-center gap-2 rounded-sm border border-border-strong px-2.5 py-1.5 font-mono text-[12px] font-medium text-text-dim transition-colors hover:border-gold hover:text-gold"
      >
        Cari
        <kbd className="hidden font-mono text-[11px] opacity-70 min-[760px]:inline">Ctrl K</kbd>
      </button>

      <ThemeToggle />
    </div>
  </div>

  <TabStrip chapters={CHAPTERS} activeSlug={activeSlug} onSelect={selectChapter} />
</header>
```

**The "existing credit"** is "Handbook by Brian Putra". Today it appears in `Sidebar.tsx` as a third line
under the brand. Since the sidebar is deleted, this is where it moves — preserve the wording exactly.

**The header is one sticky unit containing the band and the tab strip**, so both stay pinned. The
`TabStrip` has its own `border-b`, which is the rule the active tab overlaps.

**The callsign input is hidden below 760px** in the header, because the brief's mobile rules hide the
tab strip and the header is tight; the value is still used for substitution everywhere. If a mobile
callsign entry point is wanted, the radio section can render one bound to the same context value —
note it rather than adding it here.

**The star badge.** The prototype draws it as an inline SVG with a six-pointed star of six circles. Use
it, in amber, at ~34px:

```tsx
function StarBadge() {
  return (
    <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden className="shrink-0 text-gold">
      <g fill="currentColor">
        <polygon points="32,6 38.5,20.7 54.5,19 45,32 54.5,45 38.5,43.3 32,58 25.5,43.3 9.5,45 19,32 9.5,19 25.5,20.7" />
        <circle cx="32" cy="5" r="3.4" /><circle cx="55.5" cy="18.5" r="3.4" />
        <circle cx="55.5" cy="45.5" r="3.4" /><circle cx="32" cy="59" r="3.4" />
        <circle cx="8.5" cy="45.5" r="3.4" /><circle cx="8.5" cy="18.5" r="3.4" />
      </g>
      <circle cx="32" cy="32" r="8.5" fill="none" stroke="var(--bg-2)" strokeWidth="2" />
      <circle cx="32" cy="32" r="3" fill="var(--bg-2)" />
    </svg>
  );
}
```

The inner circles use `--bg-2` so they punch through to the band colour, exactly as the prototype does.

### 3. Keyboard shortcuts

The existing shell already binds `/` to focus search and `Escape` to clear it. Replace that with the
brief's behaviour:

```tsx
useEffect(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target?.isContentEditable;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setPaletteOpen(true);
      return;
    }
    if (e.key === "/" && !typing && !paletteOpen) {
      e.preventDefault();
      setPaletteOpen(true);
    }
  };

  document.addEventListener("keydown", onKeyDown);
  return () => document.removeEventListener("keydown", onKeyDown);
}, [paletteOpen]);
```

Note both `ctrlKey` and `metaKey` so Cmd+K works on macOS, and the `!typing` guard so `/` still types
normally inside the callsign field and the form fields.

**`Escape` is handled inside `CommandPalette`**, not here, since it only applies while the dialog is open.

### 4. Rendering the page

```tsx
<main id="content">
  {activeSlug === null ? (
    <Cover chapters={CHAPTERS} onSelect={selectChapter} />
  ) : (
    CHAPTERS.filter((c) => c.slug === activeSlug).map((chapter) => (
      <div key={chapter.slug}>
        <ChapterHeader chapter={chapter} />
        {chapter.sections.map((section) => (
          <SectionView key={section.id} section={section} />
        ))}
      </div>
    ))
  )}
</main>
```

**Only the active chapter is rendered.** This is a change from today's model, where all 37 sections are
always in the DOM and search filters them with `hidden`. The tab model means a category's page is
rendered on demand, which keeps the DOM small and makes each category a genuine "page".

**Consequence: the command palette must search across ALL sections**, not just the active chapter. That
is why `CommandPalette` receives `sections={POCKETBOOK.sections}` (the full list) while the page renders
only the active chapter's sections. Do not pass the filtered list to the palette.

**The chapter header** — the brief's `68px` numeral, `38px` title, and `3px double` rule:

```tsx
function ChapterHeader({ chapter }: { chapter: Chapter }) {
  return (
    <div className="mb-6 flex items-start gap-5 border-b-[3px] border-double border-border pb-4">
      <span className="font-display text-[68px] font-extrabold leading-[0.9] tracking-[-0.03em] text-gold">
        {String(chapter.index).padStart(2, "0")}
      </span>
      <h1 className="font-display text-[38px] font-semibold leading-[1.15] tracking-[-0.01em] text-text">
        {chapter.name}
      </h1>
    </div>
  );
}
```

**Heading levels:** the chapter header is `h1` and task-09's section headings are `h2`. Keep them
consistent — this is the one cross-task coupling on heading levels, and task-09 notes the same. A
category page with one `h1` and several `h2`s is the correct outline.

**The generators' category** — the `Form Helper` chapter holds only the two form blocks, so its page is
just the two generators under one chapter header. That is correct; the brief's "Tools" tab maps to it.

### 5. Keep the chrome the user chose to retain

The three extras that survived the restyle decision:

- **Reading-progress bar** — keep the existing `ReadingProgress` component and its comment verbatim. It
  is a `scaleX` transform written straight to the element, coalesced into one `requestAnimationFrame`;
  do not reroute it through state. Add the `reading-progress` class so the print stylesheet hides it.
- **Back-to-top button** — keep the existing `BackToTop` component and its visibility logic. Add the
  `back-to-top` class for print. Note it must sit above the mobile bottom nav: use
  `bottom-[calc(80px+env(safe-area-inset-bottom,0px))]` below 760px and `bottom-5` above.
- **Entrance reveal animations** — keep `replayReveal` calls on deliberate navigation, and keep
  `reveal-stack` on the section content column (task-09).

**Do not add a `prefers-reduced-motion` override.** The repo's policy is unconditional motion; this was
confirmed with the user. Keep the existing comment blocks that document it.

### 6. The provider

`usePocketbook` is consumed by `Transmission` and the callsign input, so `PocketbookProvider` must wrap
them. Wrap inside `Shell` rather than in `app/page.tsx`, so `app/page.tsx` stays a trivial Server
Component:

```tsx
export function Shell({ sections }: { sections: Section[] }) {
  return (
    <PocketbookProvider>
      <ShellInner sections={sections} />
    </PocketbookProvider>
  );
}
```

Splitting the provider from the consumer avoids the mistake of calling `usePocketbook` in the same
component that renders the provider, which would read the context before it exists.

### 7. Finish the motion trim

If task-05 deferred removing `useNavHighlight` and `useCountUp` (it was advised to, since `Sidebar.tsx`
and `Hero.tsx` still imported them), remove them now — both importers are deleted in this task.

Then grep to confirm nothing references them:

```bash
grep -rn "useNavHighlight\|useCountUp" components/ app/    # must return nothing
```

### 8. Delete the replaced components

```bash
rm components/Sidebar.tsx components/Hero.tsx
```

Then confirm nothing imports them:

```bash
grep -rn "Sidebar\|Hero" components/ app/    # only unrelated matches should remain
```

**`lib/section-icons.ts` stays.** It maps section ids to Lucide icons and is pinned by
`lib/section-icons.test.ts`, which asserts every section has an icon and every group has an icon. Even
though the new shell may not use every icon, deleting the module would fail the test suite. **Do not
touch it.**

## Acceptance Criteria

- [ ] The header band is sticky, respects `safe-area-inset-top`, uses `bg-bg-2`, and carries the amber
      six-point star badge, "LSSD Pocketbook" in Fraunces, and "Handbook by Brian Putra" as a subtitle.
- [ ] The band's right side has a "Cari" button with a `Ctrl K` hint, a callsign input bound to the
      shared context, and the theme toggle.
- [ ] The tab strip sits inside the sticky header and one tab per chapter is rendered in `CHAPTERS` order.
- [ ] Clicking a tab activates that chapter, writes `#<slug>` via `history.replaceState`, and scrolls to
      the top.
- [ ] A hash naming a section activates that section's chapter **and** scrolls to the section after it
      renders; `#patrol-report` and `#penal-generator` both open the Tools chapter at the right generator.
- [ ] An empty hash renders the cover.
- [ ] The existing `subscribeToHash` / `readHash` / `readHashOnServer` store is preserved with its comment.
- [ ] Only the active chapter's sections are rendered; the command palette receives **all** sections.
- [ ] The chapter header renders a 68px amber numeral (zero-padded), a 38px Fraunces title, and a
      `3px double` bottom rule.
- [ ] The chapter header is `h1` and the section headings are `h2` — consistent with task-09.
- [ ] `Ctrl/Cmd+K` and `/` both open the palette; `/` does not fire while typing in a field.
- [ ] The reading-progress bar, back-to-top button and entrance reveal animations are all preserved, and
      the progress bar and back-to-top carry the `reading-progress` and `back-to-top` classes.
- [ ] The back-to-top button clears the mobile bottom nav.
- [ ] Below 760px the tab strip is hidden and the bottom nav is shown; above 760px the reverse.
- [ ] `components/Sidebar.tsx` and `components/Hero.tsx` are deleted and nothing imports them.
- [ ] `useNavHighlight` and `useCountUp` are removed from `motion.ts` and nothing references them.
- [ ] `lib/section-icons.ts` is untouched and `npm test` still passes its icon-coverage assertions.
- [ ] No `prefers-reduced-motion` override and no `motion-safe:`/`motion-reduce:` variants were added.
- [ ] `npx tsc --noEmit` passes, `npm run lint` is clean, and `npm run build` succeeds.
- [ ] `git diff --stat lib/` is empty.

## Notes

**The biggest behavioural change in the whole restyle is here:** sections are no longer always mounted.
Today `Shell.tsx` renders all 37 and hides the non-matching ones; the tab model renders one category at a
time. Two things follow:

1. **The palette must search the full section list**, or search would only find results in the visible
   category. Pass `POCKETBOOK.sections`, not the rendered chapter's sections.
2. **Anchors to a section in another category work through the hash**, because `resolveHash` switches the
   chapter first and then scrolls. Verify `#senjata-illegal` (Senjata chapter) and `#mdt-process`
   (Prosedur) both work from the cover.

**`next.config.ts` must not change.** It pins the Turbopack workspace root, which is required for correct
module resolution — see `specs/ship-nextjs-rebuild/requirements.md`.

**Do not delete `lib/section-icons.ts` or `lib/search.ts`** even if the new UI no longer uses every
export. `section-icons.test.ts` pins the former, and the palette depends on the latter.

**The `scroll-mt` on sections must clear the sticky header.** The header is the band (~59px) plus the tab
strip (~41px), so `scroll-mt-[100px]` is a safe starting point; task-09 uses `scroll-mt-[88px]`. Measure
the real heights and make the two agree — a section heading hidden under the band is the most likely
cosmetic bug in this task.
