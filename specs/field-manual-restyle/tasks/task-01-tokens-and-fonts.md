# Task 01: Tokens, fonts and base styles

## Status

pending

## Wave

1

## Description

Establish the foundation the entire restyle builds on: the additive design tokens, the collapsed
border-radius scale, the four new font families, and the print stylesheet. Nothing here changes content
or structure — this task only widens the token sheet and swaps the type system, so that every later
task can reference `--tx`, `--outline`, `--cond` and the new radius scale without each one inventing
its own values.

The palette and background are deliberately **unchanged** from today. The brief proposed a new set of
hex values (amber `#fdc45b`, teal `#5de8d2`, a cream "paper" light theme); those are **not** adopted.
Today's tokens stay exactly as they are, and this task adds only the three genuinely new structural
tokens the new layout needs, chosen to sit in the existing colour family.

## Dependencies

**Depends on:** None (Wave 1)
**Blocks:** task-03-ui-and-readonly-blocks, task-04-dedicated-components, task-05-client-state-theme-motion

**Context from dependencies:** None — this is the root of the dependency graph. Every later task reads
the token names and font variables defined here, so the names in this file are a frozen contract.

## Files to Create

None.

## Files to Modify

- `app/layout.tsx` — replace the three `next/font/google` imports with four new ones; repoint the CSS
  font variables; keep all metadata, `lang="id"`, `THEME_INIT` and `suppressHydrationWarning` intact.
- `app/globals.css` — add the three new tokens (dark + light), add the four new Tailwind mappings,
  collapse the radius scale to 2–3px, repoint the font family variables, add the print stylesheet.
- `package.json` — **only if** fonts are vendored (see Notes). Otherwise untouched.

## Technical Details

### Step 1 — Replace the fonts in `app/layout.tsx`

Today the file imports and configures three fonts. Remove all three and replace them with these four.

```tsx
import { Barlow_Condensed, Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

/* Fraunces for headings, chapter numerals, TOC titles, rank names and quoted
   blocks. Variable font — no explicit weights needed. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

/* IBM Plex Sans for body copy at 16px/1.6. Not a variable font, so every weight
   in use must be listed. */
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/* IBM Plex Mono for codes, labels, scripts and generated output. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/* Barlow Condensed, uppercase and letter-spaced, for the category tabs and the
   rank tier names. */
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});
```

Apply all four variables on the `<html>` element's `className`:

```tsx
className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} ${barlowCondensed.variable}`}
```

**Preserve everything else in this file byte-for-byte:** the `metadata` export (title, description,
`applicationName`, the `/sheriff.png` icon, `other: { "theme-color": "#0c0e12" }`), the `viewport`
export, the `THEME_INIT` script string, `lang="id"`, `data-theme="dark"` and `suppressHydrationWarning`.

`display: "swap"` plus next/font's automatic fallback-metric adjustment is what satisfies the "body and
hero content must not shift when fonts load" requirement. Do not add manual `size-adjust` rules.

### Step 2 — Repoint the font variables in `app/globals.css`

Replace the three font-family declarations in `:root` with four. The **variable names on the left stay
the same** (`--display`, `--font`, `--mono`) so no component's `font-display` / `font-mono` class
changes; only what they resolve to changes. Add `--cond` as a new name.

```css
--display: var(--font-fraunces), Georgia, "Times New Roman", serif;
--font: var(--font-plex-sans), system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--mono: var(--font-plex-mono), ui-monospace, Menlo, Consolas, monospace;
--cond: var(--font-barlow-condensed), "Arial Narrow", Arial, sans-serif;
```

Explicit fallback stacks are required — they are what keeps the layout stable if a font fails to load.

### Step 3 — Add the three new tokens

Add to `:root` (the dark default) and to `[data-theme="light"]`. These are the **only** new colour
values in the entire feature.

```css
/* :root — dark */
/* The transmission header strip and the selected command-palette row. */
--tx: #2b3444;
/* A stronger border than --border-strong: the charge sheet, the active tab and
   the palette box. */
--outline: #313843;
/* Text sitting on --tx. */
--on-tx: #edeff3;
```

```css
/* [data-theme="light"] */
/* The transmission strip stays a DARK band in both themes — the brief describes
   it as a dark fill carrying cream text, and a strip that flipped to pale in
   light mode would stop reading as a transmission header. This value is a
   neutral dark slate chosen from this sheet's family; it introduces no new hue. */
--tx: #2a3340;
--outline: rgba(12, 14, 18, 0.22);
/* Cream in both themes, because --tx is dark in both. */
--on-tx: #edeff3;
```

**`--on-tx` is deliberately cream in both themes.** Because `--tx` stays dark in both, anything sitting
on it must stay light — that is the one token in this sheet that does *not* flip, and it is why the
transmission header reads identically in light and dark mode.

Add the Tailwind mappings inside the existing `@theme inline` block:

```css
--color-tx: var(--tx);
--color-outline: var(--outline);
--color-on-tx: var(--on-tx);
--font-cond: var(--cond);
```

### Step 4 — Collapse the radius scale

Today's scale is `12px / 8px / 12px / 18px`. The brief requires 2–3px everywhere. Because every
component uses `rounded-sm`/`rounded-md`/`rounded-lg` rather than literal values, redefining the scale
collapses all of them without touching a single call site.

```css
/* 2–3px only. Redefining the scale here is what collapses every existing
   rounded-sm/md/lg call site at once — do not chase them individually. */
--radius: 3px;
--radius-sm: 2px;
--radius-md: 3px;
--radius-lg: 3px;
```

Note: `--radius` must keep its exact key — that is the namespace Tailwind's bare `.rounded` reads.

### Step 5 — Add the print stylesheet

Append to `app/globals.css`. It must hide navigation and let the chapter grid collapse to one column.
Use the class names this spec introduces (they are defined in task-09 and task-10):

```css
@media print {
  /* Navigation and interactive chrome have no meaning on paper. */
  .app-header,
  .tab-strip,
  .bottom-nav,
  .charge-fab,
  .command-palette,
  .toast,
  .reading-progress,
  .back-to-top {
    display: none !important;
  }

  /* The chapter's two-column grid becomes a single flow. */
  .chapter-grid {
    display: block !important;
  }

  /* Drop the page texture and the offset shadow, which would print as noise. */
  body::before {
    display: none !important;
  }

  .charge-sheet {
    box-shadow: none !important;
  }
}
```

### Step 6 — Verify the load-bearing names are untouched

Four token names are referenced as **literal strings** outside the stylesheet and must not be renamed
or re-valued:

| Token | Referenced at | Why |
|---|---|---|
| `--surface-2` | `lib/bbcode.ts` | Emitted into the report preview's inline styles |
| `--border` | `lib/bbcode.ts` | Same |
| `--gold` | `components/blocks.tsx` | `style={{ color: item.color ?? "var(--gold)" }}` |
| `--mint-soft` | `components/ui.tsx` | `focus:shadow-[0_0_0_3px_var(--mint-soft)]` |

`lib/bbcode.ts` is frozen by this spec, and 6 fixtures in `lib/bbcode.test.ts` pin the first two by
value, so the tests will catch a mistake here. Keep `--color-surface-2` and `--color-border` in
`@theme inline` in lockstep with them.

### Step 7 — Keep the existing base rules

Do **not** remove or alter:

- the 32px technical grid on `body::before` (the brief's background is unchanged),
- `:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px }`,
- `scroll-behavior: smooth` and `scroll-padding-top`,
- the `::selection` and scrollbar rules,
- the entire motion section at the bottom of the file, including its comment block.

### Step 8 — Do not add a reduced-motion override

The brief asks for `prefers-reduced-motion` to be respected. This repo deliberately does the opposite:
`app/globals.css` documents an unconditional motion system at length and commit `722b380` exists to
enforce it. **Do not add a reduced-motion block, and do not introduce `motion-safe:` or
`motion-reduce:` variants anywhere.** This is a deliberate, user-confirmed deviation from the brief.

## Acceptance Criteria

- [ ] `app/layout.tsx` loads Fraunces, IBM Plex Sans, IBM Plex Mono and Barlow Condensed via
      `next/font/google`, all with `display: "swap"`, and applies all four variables on `<html>`.
- [ ] The three previous font imports are gone; no reference to the old font variables remains anywhere
      in `app/` or `components/`.
- [ ] `metadata`, `viewport`, `THEME_INIT`, `lang="id"`, `data-theme="dark"` and
      `suppressHydrationWarning` are all still present and unchanged in `app/layout.tsx`.
- [ ] `--tx`, `--outline` and `--on-tx` are defined in `:root` and overridden in `[data-theme="light"]`.
- [ ] `--color-tx`, `--color-outline`, `--color-on-tx` and `--font-cond` are mapped in `@theme inline`.
- [ ] The radius scale is `3px / 2px / 3px / 3px`.
- [ ] `--display`, `--font`, `--mono` keep their names and now resolve to the new families, each with an
      explicit fallback stack; `--cond` is new.
- [ ] The print stylesheet hides `.app-header`, `.tab-strip`, `.bottom-nav`, `.command-palette` and
      `.toast`, and collapses `.chapter-grid`.
- [ ] The 32px grid, the focus ring, `scroll-behavior`, the scrollbar rules and the whole motion section
      are still present.
- [ ] No `prefers-reduced-motion` block and no `motion-safe:`/`motion-reduce:` variants exist.
- [ ] `npx tsc --noEmit` passes.
- [ ] `git diff --stat lib/` is empty.

## Notes

**The three previous fonts are removed, not kept as fallbacks.** Nothing outside `app/layout.tsx` and
`app/globals.css` references them by name, so removing them is safe — but verify with a grep for
`space-grotesk`, `inter` and `jetbrains` across `app/` and `components/` before finishing.

**If the build must work offline,** next/font cannot fetch from Google and the four families must be
vendored into `app/fonts/` with `next/font/local` instead. That is a different implementation of this
same task, not a separate one. Confirm before starting — see `action-required.md`. Verified reachable
from this machine at planning time, so the default approach is the remote one.

**Do not add any dependency.** No font-awesome, no `@fontsource`, no CSS framework. `next/font` is
already part of Next.js.

**`--border-soft` and `--color-border-soft` are currently defined but referenced nowhere.** They may be
left alone; removing them is optional and not part of this task's scope.
