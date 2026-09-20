# Task 11: Verification

## Status

pending

## Wave

6

## Description

Verify the restyle end to end: the four automated gates, the three proofs that no content or logic
moved, and the manual passes the brief requires (both themes, three widths, keyboard, print).

This task produces evidence, not code. Its output is a report of what was verified and a list of
anything that could not be verified or that required a fallback.

## Dependencies

**Depends on:** task-10-shell-rewrite
**Blocks:** None

**Context from dependencies:** All prior tasks are complete. `lib/` is expected to be untouched by every
one of them — that is the property this task exists to prove.

## Files to Create

None.

## Files to Modify

None, unless a defect is found. If a defect requires a change to `lib/`, **stop and report it** rather
than changing the data.

## Technical Details

### 1. The four automated gates

Run all four and record the output:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Expected: lint clean, typecheck exit 0, **42 tests passing**, and a successful production build with `/`
prerendered as static.

The 42 tests are the load-bearing part. They comprise:

- `lib/penal.test.ts` — pins every threshold boundary in the Penal Code Generator.
- `lib/bbcode.test.ts` — pins the BBCode output byte-for-byte against fixtures from the original build.
- `lib/section-icons.test.ts` — asserts every section and group has an icon, and that no icon collides.

**If any test fails, the restyle has broken content or logic.** Do not adjust a test to make it pass.

### 2. Proof one — no content or data changed

This is the strongest guarantee available, because every word, code, script, rank, weapon and charge
lives under `lib/`:

```bash
git status --short lib/
git diff --stat lib/
```

**Both must be empty.** No file under `lib/` may be added, modified or deleted by this work.

Then confirm the whole change set is confined to presentation:

```bash
git status --short
git diff --stat app/ components/
```

Every changed path must be under `app/` or `components/`. Anything under `lib/` is a failure; anything
under `public/` or at the repo root (other than the spec folder) is unexpected and must be explained.

Then confirm no new dependency crept in:

```bash
git diff package.json package-lock.json
```

The only acceptable change to `package.json` is none. If a font had to be vendored (the offline
fallback), `package.json` still should not change.

### 3. Proof two — routes, anchors and metadata

Start the dev server and verify each of these in a browser:

```bash
npm run dev
```

| URL | Expected |
|---|---|
| `/` | The cover, with the TOC listing 7 chapters and their computed section counts |
| `/#ten-codes` | The Komunikasi chapter, scrolled to Ten Codes |
| `/#patrol-report` | The Tools chapter, scrolled to the Patrol Report Generator |
| `/#penal-generator` | The Tools chapter, scrolled to the Penal Code Generator |
| `/#radio-quick-flow` | The Radio chapter, scrolled to the flow diagram |
| `/#senjata-illegal` | The Senjata chapter (a category **not** in the bottom nav) |
| `/#mdt-process` | The Prosedur chapter |
| `/#penal-code` | The Penal Code chapter (category slug, not a section id) |
| `/#does-not-exist` | The cover (unknown hash falls back gracefully) |

Also verify:

- The page `<title>` is still "LSSD Deputy Pocketbook".
- The description meta is unchanged.
- The `/sheriff.png` favicon still resolves.
- The `theme-color` meta is present.
- `lang="id"` is still on `<html>`.
- **No browser console errors or hydration warnings** on any of the above — a hydration mismatch is the
  most likely failure given the pre-paint theme script and the client-side storage reads.

### 4. Proof three — the generators

**Penal Code Generator.** Fill the form with a case that exercises several boundaries and confirm:

- The charge sheet updates live with every input change.
- The count matches the number of rows.
- The copied text (via "Salin daftar pasal") is byte-identical to what the old build produced. The
  strongest check is to compare against `formatPenalCode` directly, which `npm test` already pins — so
  the manual check is really that the **button copies the same string the tests pin**.
- Reset clears the form and the sheet.
- The empty state appears when nothing is selected.
- On a narrow viewport the sheet stacks under the form and the floating "n pasal" button scrolls to it.

Suggested boundary case: ammo 300 (should give Illegal Distribution, not Unlawful Possession), vest 10
(Felony), weed 60 (Misdemeanor Schedule I), meth 101 (Felony Schedule II), illegal money 400000 (First
Degree, Court Verdict).

**Patrol Report Generator.** Fill both report entries and confirm:

- Generate produces BBCode.
- Copy BBCode puts the exact output on the clipboard.
- The Preview tab renders the same content.
- Regenerating while the Preview tab is open updates the preview (the "live" behaviour).
- Clear resets everything.

### 5. Manual pass — both themes

Toggle the theme and check each of these in **both** light and dark:

- **Contrast is AA** for body text, muted text, codes, the amber accent and the red warning tag. The
  brief requires WCAG AA in both themes.
- **The transmission header strip** stays dark with cream text in both themes (the `--tx`/`--on-tx`
  pair is the one that does not flip).
- **The selected command-palette row** is legible in both themes.
- **The active tab** is distinguishable from the inactive ones.
- **The charge sheet's offset shadow** is visible (it uses `--border`, which is very faint in light
  mode — if it reads as invisible, note it; the documented fallback is `--outline`).
- **Focus rings** are visible on every interactive element: tabs, ten-code rows, procedure rows, palette
  rows, the callsign input, the theme toggle, the generator fields and buttons.

### 6. Manual pass — three widths

At **360px**, **768px** and **1280px**, verify:

- **No horizontal scroll on the page body at any width.** Wide tables and the flow diagram must scroll
  inside their own container. This is the most common failure; check it explicitly by scrolling right.
- At 360px: the tab strip is hidden, the bottom nav is shown, the chapter grid is one column, the
  weapons grid is one column, the charge sheet stacks under the form, and the floating "n pasal" button
  sits above the bottom nav.
- At 768px: the bottom nav is hidden and the tab strip is shown.
- At 1280px: the 220px margin column appears beside each section's content.
- The cover title scales smoothly with `clamp(46px, 8.5vw, 88px)`.

### 7. Manual pass — keyboard

Tab through the page and verify **full keyboard support** for:

- **Tabs** — every tab is reachable and activates on Enter/Space.
- **Ten-code rows** — reachable, activate on Enter/Space, copy the code.
- **Procedure rows** — reachable, toggle on Enter and Space (and Space does not scroll the page).
- **The command palette** — `Ctrl/Cmd+K` and `/` open it, ArrowUp/ArrowDown move the selection, Enter
  opens, Esc closes, the input is focused on open, and focus does not escape the dialog.
- **The EN/ID toggle** — both buttons reachable and operable.
- **The theme toggle** — reachable and operable.
- **The report Output/Preview tabs** — ArrowLeft/ArrowRight move between them.
- **The skip link** — the existing "Lompat ke konten" link still appears on first Tab.

### 8. Manual pass — print

Open the browser's print preview and verify:

- The header band, tab strip, bottom nav, command palette, toast, reading-progress bar and back-to-top
  button are all hidden.
- The chapter grid collapses to a single column.
- The charge sheet's offset shadow is dropped.
- The page texture is gone.
- The content is readable.

### 9. The fallback report

Produce a list of anything that could not be verified or that required a presentation-only fallback.
The known candidates from planning, each of which should be confirmed or corrected:

1. **`prefers-reduced-motion` is not honoured** — a deliberate deviation from the brief, confirmed with
   the user. The repo's unconditional-motion policy wins.
2. **Chapter = category, not section** — the brief's TOC only lines up if the chapter is the category.
3. **Two new colour values** (`--tx`, `--outline`) plus `--on-tx` were added; the brief's full new
   palette was not adopted, per the user's instruction that colours and background stay as before.
4. **Margin columns are per-section**, not per-chapter, because a chapter is a category. The brief's
   "below 980px the margin content flows below the chapter" is implemented as "below the section".
5. **Tier labels come from the `legend` block's `desc`** ("Field Staff", …) — existing wording, not
   invented.
6. **Penal rows split on `" — "`**; a bullet without that separator renders as a bare term.
7. **Flow "entry/hot" nodes are the first node of each track** — the only deterministic choice that
   invents no logic.
8. **The callout's "Peringatan" label is a UI label**, not handbook content, since `callout` blocks carry
   no title of their own.
9. **The cover's intro paragraph was moved from `Hero.tsx`** — it is UI copy, not handbook content, and
   it is preserved verbatim.
10. **The callout copy button label changed from "Copy Daftar Pasal" to "Salin daftar pasal"** to match
    the brief — a UI label, not content.

### 10. Report format

Present the results as:

- **Gates:** the four commands and their outcomes.
- **Proofs:** the three proofs above, with the actual command output for the `lib/` diff.
- **Manual passes:** one line per pass, stating what was checked and the outcome.
- **Fallbacks:** the list above, each confirmed or corrected, plus anything new discovered.
- **Defects:** anything found that was not fixed, with a note on whether it needs a `lib/` change (which
  would be out of scope).

## Acceptance Criteria

- [ ] `npm run lint` is clean.
- [ ] `npx tsc --noEmit` exits 0.
- [ ] `npm test` reports 42 passing, 0 failing.
- [ ] `npm run build` succeeds and `/` is prerendered as static.
- [ ] `git status --short lib/` and `git diff --stat lib/` are both empty.
- [ ] Every changed path is under `app/` or `components/`.
- [ ] `git diff package.json package-lock.json` is empty — no dependency was added.
- [ ] All nine URLs in the routing table resolve to the expected chapter and section.
- [ ] Page title, description, favicon, `theme-color` and `lang="id"` are all unchanged.
- [ ] No console errors or hydration warnings on any checked URL.
- [ ] Both generators behave identically to before, including the copied penal list and the generated
      BBCode.
- [ ] Contrast is AA in both themes; the transmission strip and selected palette row are legible in both.
- [ ] No page-body horizontal scroll at 360px, 768px or 1280px.
- [ ] Tabs, ten-code rows, procedure rows, the palette, both toggles and the report tabs are all fully
      keyboard-operable.
- [ ] The print preview hides all navigation and collapses the chapter grid.
- [ ] The fallback report is produced, with each of the ten known candidates confirmed or corrected.
- [ ] Any defect found is reported, with a note on whether it would require a `lib/` change.

## Notes

**This task must not "fix" a failing test by editing the test.** The 42 tests are the contract that the
generator logic and content are unchanged. A failure means the restyle broke something real.

**If a defect appears to require a change to `lib/`**, that is the signal that a presentation-only
fallback was needed and was missed. Report it rather than changing the data — the whole spec is built on
that constraint.

**The hydration check is worth extra attention.** This app renders on the server and reads
`localStorage` on the client for the theme, the callsign and the language. Three separate mechanisms now
touch storage. A mismatch between the server HTML and the first client render produces a React warning
and a visible flicker. Verify with the console open on a **hard reload**, not just a client-side
navigation.
