# Task 04: Dedicated components

## Status

complete

## Wave

2

## Description

Build the four components the brief specifies in detail, each derived from existing data with no data
restructuring: the Ten Codes list, the rank ladder, the interactive procedures list, and the inline SVG
flow diagram.

These are separated from task-03 because they are genuinely new components rather than restyles — each
has behaviour (filtering, copying, toggling) or non-trivial rendering (hand-written SVG) that the
generic block components do not carry.

## Dependencies

**Depends on:** task-01-tokens-and-fonts, task-02-presentation-helpers
**Blocks:** task-09-section-view-and-renderer

**Context from dependencies:**

- **From task-01:** the tokens `--tx` / `--outline` / `--on-tx` and their Tailwind mappings
  (`bg-tx`, `text-on-tx`, `border-outline`); the `font-cond` utility for Barlow Condensed; the collapsed
  2–3px radius scale; and `--display` → Fraunces, `--font` → IBM Plex Sans, `--mono` → IBM Plex Mono.
- **From task-02:** `components/presentation.tsx` exports `CHAPTERS`, `Chapter`, `tierGroups(ranks, legend)`
  returning `TierGroup[]` (`{ label, color, ranks }`), and `takesMargin(block)`. Import `tierGroups` for
  the ladder; the other three components here do not need it.

Both dependencies are frozen contracts — import by those exact names.

## Files to Create

- `components/TenCodes.tsx` — filterable, copyable ten-code list.
- `components/Ladder.tsx` — the tier-grouped rank ladder.
- `components/Procedures.tsx` — long procedures with a session-only done toggle.
- `components/FlowDiagram.tsx` — the quick radio flow as inline SVG.

## Files to Modify

None.

## Technical Details

### 1. `components/TenCodes.tsx`

**Source data:** the `ten-codes` section holds one `table` block with `head: ["Code", "Arti"]` and
**48 rows**, from `10-1` through `10-99`. Rows are `[code, meaning]` pairs.

The brief: "filter input plus 'n dari 48 kode' counter, two-column list on desktop, each row = mono teal
code + meaning. Clicking a row copies 'code meaning' and shows a small toast. On hover/focus a faint
'salin' hint appears at the row end."

The counter's total must come from `rows.length`, never a hard-coded 48.

```tsx
"use client";

import { useMemo, useState } from "react";

export function TenCodes({ rows }: { rows: string[][] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(([code, meaning]) =>
      `${code} ${meaning}`.toLowerCase().includes(q),
    );
  }, [rows, query]);

  // copy + toast state, see below
}
```

**Copy behaviour.** Copy the string `` `${code} ${meaning}` `` — the brief says "copies 'code meaning'".
Use `navigator.clipboard.writeText` inside `try/catch`; clipboard access can be denied (insecure origin,
blocked permission). The existing `RadioCall.tsx` has the exact pattern to follow, including clearing
the confirmation timer on unmount:

```tsx
const [copied, setCopied] = useState<string | null>(null);
const timer = useRef<number | null>(null);

useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

const copy = async (code: string, meaning: string) => {
  try {
    await navigator.clipboard.writeText(`${code} ${meaning}`);
  } catch {
    return; // the text stays selectable
  }
  setCopied(code);
  if (timer.current !== null) window.clearTimeout(timer.current);
  timer.current = window.setTimeout(() => setCopied(null), 1700);
};
```

**The toast.** The brief wants "a small toast". A toast is a single element at the shell level, not one
per row. Render it from this component as a fixed-position element (`role="status"` and
`aria-live="polite"` so it is announced), styled as the prototype's `#toast` but with this sheet's
tokens: `bg-text text-bg font-mono text-[13px] px-3.5 py-2 rounded-sm`, positioned bottom-centre above
the mobile bottom nav.

Give it the class `toast` so the print stylesheet in task-01 can hide it.

**Row markup.** Each row is a `<button type="button">` so it is keyboard-operable and copy works on
Enter/Space without extra key handling. The "salin" hint is a CSS `::after`-style element that appears
on hover and `:focus-visible`.

```tsx
<div className="grid gap-8 lg:grid-cols-2">
  {filtered.map(([code, meaning]) => (
    <button
      key={code}
      type="button"
      onClick={() => copy(code, meaning)}
      className="group flex items-baseline gap-3.5 border-b border-border px-1.5 py-2.5 text-left text-[15px] transition-colors hover:bg-surface-2 focus-visible:bg-surface-2"
    >
      <span className="min-w-[56px] font-mono text-[14px] font-semibold text-mint">{code}</span>
      <span className="text-text-dim group-hover:text-text">{meaning}</span>
      <span
        aria-hidden
        className="ml-auto shrink-0 font-mono text-[12px] text-text-faint opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        salin
      </span>
    </button>
  ))}
</div>
```

The brief's "two-column list on desktop" maps to `lg:grid-cols-2`; below that it is one column.

**The filter input and counter:**

```tsx
<div className="mb-3.5 flex flex-wrap items-center gap-3.5">
  <input
    type="search"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Filter: ketik 10-55, backup, atau felony"
    aria-label="Filter ten codes"
    className="min-w-[220px] flex-1 rounded-sm border border-border-strong bg-surface-2 px-3 py-2.5 text-[16px] text-text placeholder:text-text-faint focus:border-gold focus:outline-none"
  />
  <span aria-live="polite" className="font-mono text-[13px] text-text-dim">
    {filtered.length} dari {rows.length} kode
  </span>
</div>
```

The counter must read `{filtered.length} dari {rows.length} kode` so it shows "48 dari 48 kode" when
unfiltered — matching the brief's "n dari 48 kode".

**Empty state:** when `filtered.length === 0`, render a muted line naming the query, mirroring the
existing empty state's wording style:
`Tidak ada kode yang cocok dengan "<query>". Coba kata lain, misalnya "backup" atau "10-55".`

### 2. `components/Ladder.tsx`

**Source data:** the `chain-of-command` section holds a `ranks` block (13 ranks, highest to lowest) and
a `legend` block whose `desc` fields are the tier labels and whose `color` fields are the tier hexes.

The brief: "a rank ladder grouped by the existing color classification in the data. Each group is one
row: a 6px left band in the tier color plus the group's existing label in Barlow uppercase, and its
ranks listed with a mono rank number and the rank name in Fraunces 21px. Do not invent group labels."

Use `tierGroups(ranks, legend)` from `components/presentation.tsx` — it does the grouping and guarantees
no label is invented.

```tsx
import { tierGroups } from "./presentation";
import type { LegendItem } from "@/lib/types";

export function Ladder({ ranks, legend }: { ranks: string[]; legend: LegendItem[] }) {
  const groups = tierGroups(ranks, legend);

  // Rank numbers continue across groups, 01..13, in the ladder's own order.
  let n = 0;

  return (
    <div className="border-t border-outline">
      {groups.map((group) => (
        <div key={group.label} className="grid border-b border-outline sm:grid-cols-[140px_1fr]">
          <div
            className="border-l-[6px] px-3 py-3 font-cond text-[16px] font-semibold uppercase tracking-[0.07em] text-text"
            style={{ borderLeftColor: group.color }}
          >
            {group.label}
          </div>
          <ol>
            {group.ranks.map((rank) => {
              n += 1;
              return (
                <li key={rank} className="flex items-baseline gap-3.5 border-b border-border px-1.5 py-2.5 last:border-b-0">
                  <span className="w-[22px] font-mono text-[13px] text-text-dim">
                    {String(n).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[21px] font-semibold" style={{ color: group.color }}>
                    {rank}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
```

**The tier colours are content, not theme.** `lib/ranks.ts` states explicitly that the hex values encode
the staff tier and must not be swapped for theme tokens. Passing `group.color` through to an inline
style is correct and must not be replaced with a token.

Note the rank name is coloured with its tier colour, which preserves today's behaviour (the current
`Ranks` block colours each rank name via `rankColor`).

Below `sm` the grid collapses to one column, so the tier band becomes a top-left accent — acceptable,
and the brief's mobile rules do not specify otherwise.

### 3. `components/Procedures.tsx`

**Source data:** 9 `steps` blocks across 5 sections. The two untitled ones are `prosedur-penangkapan`
(7 items) and `memproses-suspect` (19 items); the rest carry titles. The brief calls these "long
procedures".

The brief: "large mono amber numerals with hanging indent; tapping a step toggles a done state
(strikethrough, session only, no persistence) with a small 'n dari N langkah ditandai' counter."

**Session-only means no `localStorage`.** The state lives in `useState` and is lost on reload — the
brief says explicitly "session only, no persistence". Do not persist it.

```tsx
"use client";

import { useState } from "react";

export function Procedures({ title, items }: { title?: string; items: string[] }) {
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  const count = done.filter(Boolean).length;

  const toggle = (i: number) =>
    setDone((prev) => prev.map((v, k) => (k === i ? !v : v)));
  ...
}
```

**Accessibility.** Each row is a `role="checkbox"` with `aria-checked`, `tabIndex={0}`, and an
`onKeyDown` that treats Enter and Space as a toggle (preventing the default page scroll on Space).
This mirrors the prototype's `.steps li[role=checkbox]`.

```tsx
<li
  key={i}
  role="checkbox"
  tabIndex={0}
  aria-checked={done[i]}
  onClick={() => toggle(i)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(i); }
  }}
  className={`flex cursor-pointer gap-4 border-b border-border px-1 py-3 ${done[i] ? "text-text-dim" : "text-text"}`}
>
  <span aria-hidden className={`min-w-[34px] font-mono text-[22px] font-semibold ${done[i] ? "text-mint" : "text-gold"}`}>
    {String(i + 1).padStart(2, "0")}
  </span>
  <span className={`text-[14px] leading-relaxed ${done[i] ? "line-through decoration-1" : ""}`}>
    {items[i]}
  </span>
</li>
```

The counter above the list:

```tsx
<div className="mb-3 font-mono text-[13px] text-text-dim" aria-live="polite">
  {count} dari {items.length} langkah ditandai
</div>
```

**Hanging indent:** the numeral column is a fixed-width flex child (`min-w-[34px]`), so wrapped text
aligns under the text rather than under the numeral — that is what "hanging indent" means here.

**Reset when the data changes.** If `items` ever changes identity the `done` array would be stale.
Guard with a `useEffect` that resets when `items.length` changes, or key the component on the block.
Since sections are never unmounted in this app (only hidden), a simple `useEffect` on `items.length` is
the safe choice.

### 4. `components/FlowDiagram.tsx`

**Source data:** the `radio-quick-flow` section holds one `flow` block with 5 tracks. Each track has a
`title` and `steps`; a step is `{ label, branches? }` where `branches` is
`{ label, tone: "ok" | "danger" }[]`.

| Track title | Steps |
|---|---|
| Patrol → Traffic Stop | PATROL, 10-8, TRAFFIC STOP, 10-55, CHECK 28 / 29, CODE 4 → 10-8 |
| 10-55 → Pursuit | 10-55, PURSUIT, 10-57, 10-78 BACKUP |
| 10-55 → Felony Stop | 10-55, WARRANT / BOLO, 10-38 FELONY STOP, VEHICLE SEARCH, VEHICLE DISPOSITION (2 branches), 95 SUSPECT, PROCESSING, BREAK OFF / 10-8 |
| Narcotics — 34 → 57 | 34, 57, 10-78, PURSUIT |
| Active Situations | 31A / 31B / 90, 10-76, ON-SCENE REPORT, REQUEST 10-78 IF NEEDED |

The brief: "render the existing flow steps as an inline SVG flow diagram (small rectangular nodes with
2px radius, mono 12px text, 1.5px connector lines with arrowheads, branches for the existing decision
points, 'clear' nodes outlined green and 'not clear / BOLO' nodes outlined red, entry/hot nodes filled
`#2b3444`). Use only the wording that already exists… Put the SVG in a container with `overflow-x: auto`
and a min-width of about 640px."

**Generate the SVG from the data — do not hand-write 5 tracks' coordinates as literals.** A
data-driven layout is what keeps this honest: every label comes from `step.label` and every branch from
`step.branches`, so no wording is invented or dropped.

**Layout approach.** Each track is a horizontal row of nodes with vertical stacking where a track has
branches. A simple, robust scheme that fits the `640px+` container:

- Node width 150px, height 40px, horizontal gap 20px, so a step occupies 170px of pitch.
- Track `t` sits at vertical offset `t * (rowsNeeded) * 60`, where `rowsNeeded` is 2 when the track has
  branches and 1 otherwise.
- A branch step renders its two branches as two nodes on a second row directly beneath the parent, each
  half-width, connected with short elbow paths.

```tsx
const NODE_W = 150;
const NODE_H = 40;
const PITCH = 170;
const ROW_H = 60;

export function FlowDiagram({ tracks }: { tracks: FlowTrack[] }) {
  // Compute each track's y offset, then emit nodes + connectors.
}
```

**Node classes and their colours** (mapping the brief's rules onto this sheet's tokens):

| Node kind | Rule | Class |
|---|---|---|
| Entry / hot | filled `#2b3444` | `fill-[var(--tx)]`, text `fill-[var(--on-tx)]` |
| Branch, `tone: "ok"` | green outline | `stroke-[var(--mint)]` at 2px |
| Branch, `tone: "danger"` | red outline | `stroke-[var(--coral)]` at 2px |
| Default | plain | `fill-[var(--surface)]`, `stroke-[var(--border-strong)]` |

`#2b3444` is exactly the `--tx` token added in task-01, so reference the token rather than the literal.

**"Entry/hot nodes"** means the **first node of each track** — that is the only deterministic reading
that invents no new logic, and it matches the prototype, where the track's starting node is the filled
one. Document this choice in a comment.

**Multi-line labels.** The prototype splits a label on `|` to produce two `<text>` lines. The data has
no `|` characters, so instead wrap on the natural width: render the label as a single `<text>` with
`text-anchor="middle"`, and if it is long, split on the first space after ~16 characters. Keep this
simple and deterministic — a two-line split at most, so the 40px node height holds.

```tsx
function wrapLabel(label: string): string[] {
  if (label.length <= 16) return [label];
  const at = label.indexOf(" ", Math.max(0, Math.floor(label.length / 2) - 4));
  return at === -1 ? [label] : [label.slice(0, at), label.slice(at + 1)];
}
```

**Arrowheads.** One `<marker>` in `<defs>`, referenced by every connector path's `marker-end`:

```tsx
<defs>
  <marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
    <path d="M0,0L8,4L0,8z" className="fill-[var(--text-dim)]" />
  </marker>
</defs>
```

**Connectors.** 1.5px lines. Between consecutive nodes in a track, a straight horizontal path; into a
branch row, an elbow path down then across.

**Wrapper:**

```tsx
<div className="overflow-x-auto rounded-sm border border-outline bg-surface p-3.5">
  <svg
    role="img"
    aria-label="Alur radio dari patroli sampai suspect 95"
    viewBox={`0 0 ${width} ${height}`}
    className="block h-auto w-full min-w-[640px]"
  >
    ...
  </svg>
</div>
```

`min-w-[640px]` plus the `overflow-x-auto` wrapper is exactly what the brief asks for, and it is what
keeps the diagram from forcing page-body horizontal scroll at 360px.

**The `aria-label`** must describe the diagram's content. The prototype's label is a good model:
"Alur radio: patroli, traffic stop, lalu tiga jalur: aman Code 4, kabur pursuit, atau warrant felony
stop sampai suspect 95". Use a label derived from the track titles so it stays accurate if the data
changes.

**Fallback.** The brief says: "if the source steps are too free-form to map reliably, keep the original
list and tell me." The source is **not** too free-form — it is a clean ordered list of labelled steps
with explicit branches — so the SVG is built. Do not silently fall back; if you find a case that does
not map, report it rather than dropping the track.

## Acceptance Criteria

- [ ] `TenCodes` renders a filter input, a counter reading `{n} dari 48 kode` computed from
      `rows.length`, and a `lg:grid-cols-2` list of mono mint codes with their meanings.
- [ ] Clicking or keyboard-activating a ten-code row copies `"<code> <meaning>"` and shows a toast
      with `role="status"` and `aria-live="polite"`, hidden by the `toast` class in print.
- [ ] A faint "salin" hint appears on row hover and on `:focus-visible`.
- [ ] Filtering is case-insensitive and matches against both code and meaning; an empty result renders a
      muted message naming the query.
- [ ] `Ladder` renders 5 tier groups from `tierGroups`, each with a 6px left band in the tier colour, the
      label in `font-cond` uppercase, a mono rank number continuing 01–13 across groups, and the rank name
      in `font-display text-[21px]`.
- [ ] All 13 ranks appear exactly once in the ladder, and no group label is invented (all come from the
      legend's `desc`).
- [ ] `Procedures` renders mono numerals with a hanging indent and a `{n} dari {N} langkah ditandai`
      counter that updates on toggle.
- [ ] Each procedure row is `role="checkbox"` with `aria-checked`, is focusable, and toggles on Enter and
      Space as well as click.
- [ ] A toggled row shows strikethrough on its text and a mint numeral; **nothing is written to
      `localStorage`** and reloading clears all marks.
- [ ] `FlowDiagram` renders all 5 tracks and every one of their labels from the data, with 2px-radius
      nodes, 1.5px connectors with arrowheads, mint outlines on `tone: "ok"` branches and coral on
      `tone: "danger"`.
- [ ] The first node of each track is filled with `--tx`; no other node is.
- [ ] The SVG sits in a container with `overflow-x: auto` and the SVG itself has `min-w-[640px]`.
- [ ] No wording is invented anywhere in the diagram — every label traces to `step.label` or
      `branch.label`.
- [ ] `npx tsc --noEmit` passes and `npm run lint` is clean.
- [ ] `git diff --stat lib/` is empty.

## Notes

**`"use client"` is required on `TenCodes` and `Procedures`** (both hold state). `Ladder` and
`FlowDiagram` are pure renderers and should **not** carry the directive — keeping them server-renderable
means the ladder and the diagram ship as static HTML with no client JS.

**Do not add an SVG library.** The diagram is hand-written inline SVG. No `d3`, no `mermaid`, no
`reactflow`.

**The toast lives in `TenCodes`** for this task, but the shell may want a shared toast later. If task-10
introduces one, migrate this component to it rather than having two. Note this in the handoff.

**The `role="checkbox"` pattern on a `<li>`** is what the prototype uses and what the existing
accessibility model expects. It is not a native checkbox, so the keyboard handler is mandatory — a
`<li>` with `role="checkbox"` and no `onKeyDown` is unreachable by keyboard, which would fail the brief's
"full keyboard support" requirement.
