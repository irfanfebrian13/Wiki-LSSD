# Requirements: Field Manual Restyle

## Summary

`Wiki-LSSD` is a live static wiki: the *LSSD Deputy Pocketbook*, a Los Santos Sheriff Department
roleplay handbook written in Indonesian and credited "Handbook by Brian Putra". It is a Next.js 16
App Router application (React 19, TypeScript, Tailwind v4) built on a single route `/`.

Today the site is one long scrolling page. Navigation is a 264px left sidebar of collapsible accordion
groups with a scroll-spy; search is a sticky top bar; a hero block opens the page with three stat
boxes; all 37 sections are stacked in a single column and search filters them by toggling `hidden`.
The visual language is charcoal cards with generous 12–18px radii, gold for identity, mint for
secondary, coral for warnings.

This feature replaces **only the presentation layer** with a "Field Manual" structure: a title-page
cover, a book-index tab strip, chapter pages with a 220px margin-note column, restyled read-only
components, a command palette, a mobile bottom nav, and restyled generators. The intended outcome is
that the pocketbook reads like a printed field manual — hairline rules instead of rounded cards,
numbered chapters, margin callouts, typewriter-style codes and scripts — while remaining exactly the
same document, with the same content, routes and generator behaviour.

The central structural decision: **a "chapter" is a category.** The data holds 7 categories
containing 37 sections, so chapters are numbered `01`–`07` in category order and each category's
sections render as 26px headings inside their chapter. This is the only reading under which the
brief's table of contents (chapter number + category title + section count) lines up with the chapter
headers. The alternative — a chapter per section — was considered and rejected.

## Goals

- Restructure the site from a sidebar-and-scroll-spy page into a cover + tab strip + chapter pages.
- Replace the visual language: 2–3px radii, hairline rules, double rules under chapter headings, and
  a hard offset shadow reserved for the charge sheet.
- Switch typography to Fraunces (headings), IBM Plex Sans (body 16px/1.6), IBM Plex Mono (codes,
  labels, scripts) and Barlow Condensed (tabs, tier names).
- Build the brief's components from the existing data using presentation-only fallbacks, without
  restructuring `lib/data.ts`.
- Preserve every existing route, hash anchor, meta tag and deploy config.
- Keep the logic of the Penal Code Generator and Patrol Report Generator untouched.

## Non-Goals

- **No content changes.** Every section, Ten Code, radio script, procedure, weapon, penal article,
  rank and callsign stays exactly as it is. No renaming, reordering, translating, summarising or
  adding content.
- **No changes to `lib/` at all.** `data.ts`, `types.ts`, `penal.ts`, `bbcode.ts`, `search.ts`,
  `ranks.ts` and `section-icons.ts` are frozen. This is the enforcement mechanism for the point above.
- **No new dependencies.** No component library, no animation library, no icon set beyond the
  existing `lucide-react`, no SVG library — the flow diagram is hand-written inline SVG.
- **No new routes.** The single route `/` is kept; category state is carried in the URL hash.
- **No `prefers-reduced-motion` override.** The repo deliberately runs its full animation set
  regardless of the OS setting. See Technical Constraints.
- **No new palette.** The brief's new hex values are not adopted. See Technical Constraints.
- **No changes to the BBCode output or penal thresholds.** Both are pinned by tests.
- **No unit or e2e tests are added by this spec.** The existing 42 tests must keep passing.

## Acceptance Criteria

- [ ] Home is a title-page cover: large Fraunces title, "Los Santos Sheriff Department", the existing
      intro copy, two plain text-links to the generators, and a "Daftar isi" table of contents with
      chapter number, category title, dotted leader, and a section count computed from the data.
- [ ] No stat boxes appear in the cover, and no pill "eyebrow" label sits above any heading.
- [ ] A sticky header band carries a six-point star badge in gold, "LSSD Pocketbook" in Fraunces, the
      "Handbook by Brian Putra" credit as a subtitle, a "Cari" button with a `Ctrl K` hint, a Callsign
      input, and the theme toggle.
- [ ] A tab strip below the band shows one tab per category in the data's own order; the active tab
      uses the page background with a strong border and overlaps the strip's bottom border by 1px.
- [ ] Each tab opens that category's page containing all of its existing sections as chapters.
- [ ] Chapter headers show a 68px Fraunces amber numeral, a 38px Fraunces title, and a 3px double rule.
- [ ] Section headings inside a chapter are 26px with a bottom hairline.
- [ ] Above 980px a 220px right margin column holds that section's notes/warnings/tips as callouts
      (3px left rule, mono label, no filled box); below 980px they flow beneath the section.
- [ ] Ten Codes renders a filter input, an "n dari 48 kode" counter, a two-column list, click-to-copy
      with a toast, and a faint "salin" hint on hover/focus.
- [ ] Radio scripts render as transmission blocks with a `--tx` header strip, a mono body, placeholder
      chips, and a working EN/ID toggle.
- [ ] `[CALLSIGN]` is substituted from the header input wherever it appears; the copy button copies the
      substituted plain text.
- [ ] Quick Radio Flow renders as an inline SVG flow diagram inside a container with `overflow-x: auto`
      and `min-width: 640px`.
- [ ] The rank ladder is grouped by the existing colour classification, each group with a 6px left band
      in its tier colour and the group's existing label in Barlow uppercase.
- [ ] Long procedures use large mono amber numerals with a hanging indent and a session-only
      done-toggle with an "n dari N langkah ditandai" counter.
- [ ] Weapons render as a three-column grid per group, single column on mobile.
- [ ] Penal reference pages render definition-list rows, with "Court Verdict" articles carrying a small
      red mono tag.
- [ ] The Penal Code Generator keeps every field, group and rule, with a sticky charge sheet showing a
      live count, dotted separators, Reset and an amber "Salin daftar pasal" button.
- [ ] The Patrol Report Generator keeps its logic and output, with Output and Preview as tabs.
- [ ] `Ctrl/Cmd+K` and `/` open a centred command palette that reuses the existing search index, lists
      results with their category label, supports arrow keys / Enter / Esc, and navigates on select.
- [ ] Below 760px the tab strip is hidden and a fixed bottom nav shows 5 items (Codes, Radio, Prosedur,
      Penal, Tools) with an amber top indicator, respecting `safe-area-inset-bottom`.
- [ ] WCAG AA contrast holds in both themes, focus rings are visible, and tabs, rows, the palette and
      toggles are all fully keyboard-operable.
- [ ] The layout works at 360px, 768px and 1280px; wide tables and the flow diagram scroll inside their
      own container, never the page body.
- [ ] A print stylesheet hides navigation.
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm test` (42 tests) and `npm run build` all pass.
- [ ] `git diff --stat lib/` is empty, and `/#ten-codes`, `/#patrol-report` and `/#penal-generator` all
      open the correct category and section.

## Assumptions

- **The design reference is authoritative for structure, not colour.**
  `design-reference/lssd-pocketbook-preview.html` is a working vanilla-JS prototype containing the CSS
  token sheet, spacing and component markup to mirror. Its *content* is sample data and its *colours*
  are not adopted — see Technical Constraints. It is already gitignored and is not part of the build.
- **The 7 categories and 37 sections are the authoritative taxonomy** and are not to be reordered,
  renamed or merged.
- **The `radiocall` data separates English and Indonesian cleanly** via its `phrase` and `phrase_id`
  fields, so the EN/ID toggle is fully supported and needs no fallback.
- **The `legend` block's `desc` field supplies the rank tier labels** ("Field Staff", "Command Staff",
  "Executive Staff", "Supervisory Staff") — wording the site already states, so no label is invented.
- **Penal reference bullets use a `" — "` separator** between term and description; a bullet without it
  renders as a bare term.
- **Google Fonts is reachable at build time.** next/font downloads and self-hosts the font files during
  `next build`. A fully offline build would fail; CI and Vercel have network access.
- **`.claude/` is machine-local and gitignored**, so the spec folder is the durable record of this work.

## Technical Constraints

- **Stack is fixed:** Next `16.3.5`, React `19.2.8`, TypeScript `5.9.3`, Tailwind `4.3.3`,
  `lucide-react` `^1.47.0`. No new runtime or dev dependencies.
- **`lib/` is frozen.** Every task's file list must exclude it. The existing test files
  (`lib/penal.test.ts`, `lib/bbcode.test.ts`, `lib/section-icons.test.ts`) must keep passing unchanged,
  which is what pins the generator logic and the section-icon coverage.
- **Four token names are load-bearing by name and must not be renamed or re-valued:**
  `--surface-2` and `--border` are emitted as literal strings into the report preview by
  `lib/bbcode.ts` (and pinned by 6 test fixtures); `--gold` is referenced at `components/blocks.tsx`
  and `--mint-soft` at `components/ui.tsx`. The Tailwind `@theme inline` mapping for
  `--color-surface-2` and `--color-border` must stay in lockstep.
- **The palette and background are unchanged.** Today's tokens stay exactly as they are:
  `--bg #0d1015` with the existing 32px technical grid, `--bg-2`/`--sidebar` `#12161d`,
  `--surface` `#171c24`, `--surface-2` `#1d232d`, `--gold` `#ffc65c`, `--mint` `#5eead4`,
  `--coral` `#ff6b6b`, and the existing light theme (`--bg #f3f4f7`, gold `#8a6314`, mint `#0d6e64`,
  coral `#b3242a`). The brief's hexes (amber `#fdc45b`, teal `#5de8d2`, the cream "paper" light theme)
  are **not** adopted. Only three genuinely new structural tokens are added, chosen in the same family:
  `--tx` (transmission header / selected row fill), `--outline` (strong border), `--on-tx` (text on `--tx`).
- **Rank and tier hexes are content, not theme.** `lib/ranks.ts` and the `legend` blocks carry them;
  they are passed through to inline styles exactly as today and are never swapped for theme tokens.
- **No `prefers-reduced-motion` override is added.** `app/globals.css` documents an unconditional motion
  system at length and commit `722b380` exists to enforce it. The new work must not reintroduce a
  reduced-motion block, and no `motion-safe:`/`motion-reduce:` variants may be introduced.
- **Theme model is unchanged.** `:root` defaults to dark, `[data-theme="light"]` overrides, the
  pre-paint `THEME_INIT` script in `app/layout.tsx` reads `localStorage` under the key `lssd-theme`
  inside `try/catch`, and `ThemeToggle` writes it back. No `prefers-color-scheme` guard is added.
- **Routing stays on the single route `/`.** No path routes are added. The active category is derived
  from the URL hash: a hash matching a section id activates that section's category and scrolls to the
  section; a hash matching a category slug activates the category. This keeps every existing deep link
  working, including `#patrol-report` and `#penal-generator`.
- **`dangerouslySetInnerHTML` stays confined to the report preview**, where the input is the user's own
  form data. All `lib/data.ts` content continues to render as JSX text so React escapes the raw `<` and
  `>` characters several entries contain (e.g. `"membawa < 300 butir"`).
- **`next.config.ts` must not change** — it pins the Turbopack workspace root, which is required for
  correct module resolution.
- **Metadata is preserved:** title, description, `applicationName`, the `/sheriff.png` icon and the
  `theme-color` meta, plus `lang="id"` and `suppressHydrationWarning` on `<html>`.

## The frozen interface contract

Every task in waves 2–5 depends on these exact names. They are defined in task-01 and task-02 and must
not be changed afterwards.

### New CSS custom properties (task-01, `app/globals.css`)

| Token | Dark | Light | Purpose |
|---|---|---|---|
| `--tx` | `#2b3444` | `#2a3340` | Transmission header strip, selected palette row. **Dark in both themes.** |
| `--outline` | `#313843` | `rgba(12, 14, 18, 0.22)` | Strong border: charge sheet, active tab, palette box |
| `--on-tx` | `#edeff3` | `#edeff3` | Text on `--tx`. **Cream in both themes** — the one token that does not flip. |

Radius scale collapses to: `--radius: 3px`, `--radius-sm: 2px`, `--radius-md: 3px`, `--radius-lg: 3px`.
Font families: `--display` (Fraunces), `--font` (IBM Plex Sans), `--mono` (IBM Plex Mono), and a new
`--cond` (Barlow Condensed), all with explicit fallback stacks.

### New Tailwind theme mappings (task-01, `app/globals.css`)

```
--color-tx: var(--tx);
--color-outline: var(--outline);
--color-on-tx: var(--on-tx);
--font-cond: var(--cond);
```

### Module interfaces

| Module | Export | Signature |
|---|---|---|
| `components/presentation.tsx` | `CHAPTERS` | `Chapter[]` — `{ slug, name, index, sections, count }[]` |
| | `chapterOfSection` | `(sectionId: string) => Chapter \| undefined` |
| | `resolveHash` | `(hash: string) => { chapter: Chapter \| null; sectionId: string \| null }` |
| | `tierGroups` | `(ranks: string[], legend: LegendItem[]) => TierGroup[]` |
| | `TierGroup` | `{ label: string; color: string; ranks: string[] }` |
| | `splitPenalBullet` | `(text: string) => { term: string; desc: string \| null; court: boolean }` |
| | `isCourtVerdict` | `(text: string) => boolean` |
| | `takesMargin` | `(block: Block) => boolean` |
| `components/pocketbook-context.tsx` | `PocketbookProvider` | `({ children }) => JSX.Element` |
| | `usePocketbook` | `() => { callsign, setCallsign, lang, setLang, substitute, plain }` |
| `components/CommandPalette.tsx` | `CommandPalette` | `({ open, onClose, sections, chapters }) => JSX.Element` |
| `components/TabStrip.tsx` | `TabStrip` | `({ chapters, activeSlug, onSelect }) => JSX.Element` |
| `components/BottomNav.tsx` | `BottomNav` | `({ activeSlug, onSelect }) => JSX.Element` |
| `components/Cover.tsx` | `Cover` | `({ chapters, onSelect }) => JSX.Element` |
