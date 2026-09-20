# Task 03: UI primitives and read-only blocks

## Status

pending

## Wave

2

## Description

Restyle the shared presentation primitives and every read-only content block from the charcoal-card
language into the "Field Manual" language: 2–3px radii, hairline rules instead of rounded cards,
double rules under chapter headings, and a hard offset shadow reserved for the charge sheet alone.

This is the largest single task in the spec but also the most mechanical: every block renders data
straight out of `lib/data.ts` and passes it through verbatim, so the work is entirely markup and class
changes. **No wording, ordering or content may change.**

## Dependencies

**Depends on:** task-01-tokens-and-fonts
**Blocks:** task-09-section-view-and-renderer, task-07-generators-restyle, task-08-chrome-components

**Context from dependencies:** task-01 adds the tokens `--tx`, `--outline`, `--on-tx`, their Tailwind
mappings `text-tx` / `border-outline` / `text-on-tx`, the `font-cond` utility, and collapses the radius
scale to 2–3px so `rounded-sm` is 2px and `rounded-md`/`rounded-lg` are 3px. It also repoints
`--display` to Fraunces, `--font` to IBM Plex Sans and `--mono` to IBM Plex Mono. All of that is
available to this task — use the existing utility class names, do not introduce literal pixel radii.

## Files to Create

None.

## Files to Modify

- `components/ui.tsx` — the shared primitives: `Card`, `CardTitle`, `MicroLabel`, `CodeChip`, the
  `BTN_*` class strings, `FIELD`, `Field`, `CheckField`, `OutputBox`.
- `components/blocks.tsx` — every read-only content block: `Intro`, `TitledCard`, `Callout`, `Quote`,
  `Bullets`, `Steps`, `Table`, `DefList`, `Ranks`, `Legend`, `Tree`, `Flow`, `Weapons`, `Penal`.

**Do not touch `components/BlockRenderer.tsx` in this task** — task-07 owns it.

## Technical Details

### The design language

The brief's style rules, in one place:

- **Max 2–3px border radius.** Use `rounded-sm` (2px) and `rounded-md`/`rounded-lg` (3px) — the scale
  was collapsed in task-01, so these already produce the right values.
- **Hairline rules instead of rounded cards.** The `border border-border` hairline stays; what goes is
  the large radius and the padded-card feel. Prefer a top rule, a bottom hairline, or a left rule to a
  fully boxed surface where the content allows.
- **A hard offset shadow (`6px 6px 0`, border colour) only on the charge sheet.** Nowhere else. This is
  task-08's concern; do not add it here.
- **Double rules (`3px double var(--border)`) under chapter headings.** Task-07 owns the chapter
  header; if any block needs the same treatment it uses the same declaration.
- **Do not use:** gradient glows, small pill "eyebrow" labels above headings, a row of stat boxes,
  uniform rounded-xl cards.

### Step 1 — `components/ui.tsx`

This file has no `"use client"` directive and must keep it that way: both the Server Component block
renderer and the client-side tools import from it.

**`CONTENT_ICON_PROPS` — leave exactly as it is.** It is a shared optical size for inline icons.

**`Card`** — the primary container. Today it is `rounded-lg border border-border bg-surface px-[26px] py-6`
with an optional 2px accent top rule. Keep the structure but tighten it to the new language: the accent
top rule becomes 2px (already is), the radius collapses via the scale, and the `card-lift` hover class
should be **removed** — a lifting card with a shadow is not part of a printed-manual language, and the
brief reserves the offset shadow for the charge sheet. Replace it with a plain border-colour hover if
any hover is wanted at all.

```tsx
export function Card({ children, accent, className = "" }: { ... }) {
  const accentClass =
    accent === "gold" ? "border-t-2 border-t-gold"
    : accent === "mint" ? "border-t-2 border-t-mint"
    : accent === "coral" ? "border-t-2 border-t-coral"
    : "";

  return (
    <div
      data-accent={accent}
      className={`rounded-sm border border-border bg-surface px-6 py-5 ${accentClass} ${className}`}
    >
      {children}
    </div>
  );
}
```

Note the `data-accent` attribute exists only so the `card-lift` hover rule in `globals.css` could
re-assert the accent colour. If `card-lift` is dropped from this component, the attribute becomes
inert — either remove it here or leave it harmlessly. The `card-lift` CSS rule itself is in
`globals.css`; removing the class from all call sites is sufficient and this task need not delete the
rule (task-01 owns that file).

**`CardTitle`** — today a `font-display text-[16.5px] font-semibold` with an optional pill-shaped tag.
Change the tag from a `rounded-full` pill to a `rounded-sm` mono chip, since the brief forbids pills
outside their defined uses. Keep the Fraunces display face.

```tsx
<h3 className={`mb-3 flex items-center gap-2 font-display text-[16.5px] font-semibold leading-snug text-text ${className}`}>
  {children}
  {tag != null ? (
    <span className="rounded-sm border border-border bg-surface-2 px-2 py-[2px] font-mono text-[10.5px] font-medium text-text-dim">
      {tag}
    </span>
  ) : null}
</h3>
```

**`MicroLabel`** — today a `rounded-full bg-gold-soft px-3 py-[5px]` pill used as an "eyebrow" label
above headings. **The brief explicitly forbids "small pill eyebrow labels above headings."** Convert it
to a plain uppercase mono label with no fill, no border and no pill, and make sure call sites pass no
`rounded-full`. It is used to label grouped content (e.g. above a bullets list), which is legitimate —
only the pill styling is forbidden.

```tsx
export function MicroLabel({ children, className = "" }) {
  return (
    <div className={`font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-dim ${className}`}>
      {children}
    </div>
  );
}
```

**`CodeChip`** — the pill used for codes and callsigns. The brief allows chips for codes (the ten-code
row's mono teal code, the placeholder chips in a transmission). Change `rounded-full` to `rounded-sm`
and keep the mono face. The teal/mint role for codes means `text-mint` is the right colour here rather
than `text-gold` — the brief assigns "teal accent (secondary: codes, links, checkbox accent)". Since the
palette is unchanged, that role maps to the existing `--mint` token.

```tsx
export function CodeChip({ children, className = "" }) {
  return (
    <span className={`inline-block rounded-sm border border-border bg-surface-2 px-[7px] py-[2px] font-mono text-[12px] font-semibold text-mint ${className}`}>
      {children}
    </span>
  );
}
```

**The `BTN_*` strings** — all currently `rounded-full`. Convert to `rounded-sm` and drop the pill shape.
The brief specifies the primary button as amber background with dark text, which `BTN_GOLD` already is
(`bg-gold text-on-accent`). Keep the existing `transform` transitions — **do not** wrap them in
`motion-safe:` (see the Notes).

```tsx
export const BTN_GOLD =
  "inline-flex items-center justify-center rounded-sm bg-gold px-4 py-[9px] text-[13px] font-semibold text-on-accent transition-[opacity,transform] duration-150 hover:opacity-[0.88] active:scale-[0.98] disabled:opacity-40";

export const BTN_OUTLINE =
  "inline-flex items-center justify-center rounded-sm border border-outline bg-transparent px-4 py-[9px] text-[13px] font-semibold text-text transition-[color,border-color] duration-150 hover:border-gold hover:text-gold disabled:opacity-40";
```

Keep `BTN_MINT`, `BTN_DANGER`, `BTN_LINK` with the same treatment (rounded-sm, no pill). Note
`border-outline` is new from task-01 and is the brief's "stronger outline" role.

**`FIELD`** — the form field. The brief wants inputs on `#1d232d` (the existing `--surface-2`) with the
existing border. Today it is `rounded-sm border-border-strong bg-surface-2` with a mint focus ring.
Keep it, but change the focus ring from mint to the amber accent to match "visible amber focus rings":

```tsx
export const FIELD =
  "w-full rounded-sm border border-border-strong bg-surface-2 px-3 py-2 text-[13.5px] text-text placeholder:text-text-faint transition-[border-color,box-shadow] focus:border-gold focus:shadow-[0_0_0_3px_var(--gold-soft)] focus:outline-none disabled:opacity-50";
```

**Caution:** `components/ui.tsx` is currently the file that references `var(--mint-soft)` in a literal
string. If that reference is removed, the token is no longer load-bearing from this file — but
`--mint-soft` remains defined in `globals.css` and nothing else depends on it, so this is safe.
**Do not remove `--mint-soft` from `globals.css`** (task-01 owns that file).

**`Field`** and **`CheckField`** — keep as they are structurally. `CheckField`'s `accent-gold` should
become the brief's "checkbox accent" role, which is teal/mint: change `accent-gold` to `accent-mint`.

**`OutputBox`** — the dark output panel for generated BBCode. Keep it, but the brief assigns generated
output the mono treatment. It currently renders `text-mint`; that is consistent with the codes role.
Keep `rounded-sm` and the border.

### Step 2 — `components/blocks.tsx`

This file is also a Server Component file (no `"use client"`). Every block passes `lib/data.ts` content
through verbatim — **change only markup and classes.**

**`Intro`** — a lede paragraph. The brief's chapter page has a lede under the chapter title, but this
block is the section's own intro. Keep it as muted prose at a comfortable measure:
`max-w-[66ch] text-[15px] leading-relaxed text-text-dim`. The prototype's `.lede` uses `--ink2`, which
maps to `--text-dim`.

**`TitledCard`** (`note` and `example`) — **these now render in the margin column**, not the content
column. They must become the callout shape the brief specifies: a 3px left rule in amber, a mono label
in the same colour, and **no filled box**.

```tsx
/** note + example share a shape; both are informational, so both take amber. */
export function TitledCard({ title, text, tone }: { title: string; text: string; tone: "info" | "ok" }) {
  return (
    <div className="border-l-[3px] border-l-gold py-[2px] pl-3.5">
      <b className="mb-0.5 block font-mono text-[12px] font-semibold text-gold">{title}</b>
      <p className="text-[14px] leading-relaxed text-text-dim">{text}</p>
    </div>
  );
}
```

The `tone` prop currently distinguishes `info` (gold) from `ok` (mint). In the margin column both read
as informational, so both take amber. Keep the prop in the signature to avoid changing the call site
in `BlockRenderer` — task-07 owns that file.

**`Callout`** — the warning shape. Today a filled coral box with a `TriangleAlert` icon. The brief
requires a 3px left rule in red, a mono label in the same colour, and **no filled box**.

The complication: a `callout` block's data is a single `text` string with no title, while the brief
wants a "mono label" above the text. Use the existing label the site already has for this concept. The
callout texts in `lib/data.ts` begin with the substance directly (e.g. "Ingat — Chain of Command adalah
RANTAI KOMANDO!!! Bukan LINE PURSUIT!!!"). Render a fixed mono label of "Peringatan" above it — that is
a presentation label, not content, and it matches the "red for warnings" role. **Alternatively** render
no label and let the red rule carry the meaning; either is acceptable, but do not invent a *content*
label. Prefer the label, since the brief explicitly asks for one.

```tsx
export function Callout({ text }: { text: string }) {
  return (
    <div className="border-l-[3px] border-l-coral py-[2px] pl-3.5">
      <b className="mb-0.5 block font-mono text-[12px] font-semibold text-coral">Peringatan</b>
      <p className="text-[13.5px] font-semibold leading-relaxed text-text">{text}</p>
    </div>
  );
}
```

The `TriangleAlert` icon is no longer needed here; remove the import if it becomes unused (check
`Penal` still uses `Gavel`).

**`Quote`** — the brief: "Miranda and other quoted blocks: bordered block on `#171c24` with Fraunces
17px text." `#171c24` is the existing `--surface`.

```tsx
export function Quote({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-sm border border-outline bg-surface px-[18px] py-4">
      <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-text-dim">
        {title}
      </div>
      <p className="font-display text-[17px] leading-relaxed text-text">{text}</p>
    </div>
  );
}
```

Note the brief drops the quotation marks the current implementation wraps around the text. The quotes
were presentation, not content, so removing them is correct — but keep the `title` visible, since it
distinguishes "Miranda Right (English)" from "(Indonesia)".

**`Bullets`** — keep the list, restyle the marker. The brief's `.cslist` uses a hairline rule between
rows rather than a filled card. Replace the gold dot with a hairline-separated row, or keep the dot but
drop the surrounding card. The prototype's pattern for a bullet list is a two-column grid with
`border-bottom: 1px solid var(--rule)` per row. A simple single-column version with hairline separators
is the closest faithful reading for the general case:

```tsx
export function Bullets({ title, items }: { title?: string; items: string[] }) {
  return (
    <div>
      {title ? <MicroLabel className="mb-3">{title}</MicroLabel> : null}
      <ul className="border-t border-border">
        {items.map((item, i) => (
          <li key={i} className="border-b border-border py-2.5 text-[14px] leading-relaxed text-text-dim">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**`Steps`** — **this block becomes the interactive `Procedures` component in task-04.** Do not restyle
it here; leave `Steps` as a simple non-interactive fallback (it is still reachable for any `steps`
block task-04 does not claim, though task-04 claims all 9). Restyle it minimally to match the language:
mono amber numerals with a hanging indent, hairline separators, no card. Keep it a plain `<ol>` with no
click behaviour — the interactive version lives in task-04.

```tsx
export function Steps({ title, items }: { title?: string; items: string[] }) {
  return (
    <div>
      {title ? <MicroLabel className="mb-3">{title}</MicroLabel> : null}
      <ol className="border-t border-border">
        {items.map((item, i) => (
          <li key={i} className="flex gap-4 border-b border-border py-3">
            <span aria-hidden className="w-8 shrink-0 font-mono text-[18px] font-semibold text-gold">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[14px] leading-relaxed text-text-dim">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

**`Table`** — the brief: wide tables must scroll inside their own container, never the page body. Today
it already wraps in `overflow-x-auto`. Keep that. Restyle: drop the card radius, use hairline rules,
mono for the first column (codes), and make the header uppercase mono in the muted colour. The ten-code
table is rendered by the dedicated `TenCodes` component (task-04), so this generic `Table` still serves
`callsign`, `radio-abbr`, `radio-basics` (1.3) and `radio-responding`.

```tsx
export function Table({ title, head, rows }: { title?: string; head: string[]; rows: string[][] }) {
  return (
    <div>
      {title ? <MicroLabel className="mb-3">{title}</MicroLabel> : null}
      <div className="overflow-x-auto rounded-sm border border-border bg-surface px-4 py-1">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={i} scope="col"
                  className="whitespace-nowrap border-b border-outline px-2.5 py-2 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-dim">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c}
                    className={c === 0
                      ? "whitespace-nowrap border-b border-border px-2.5 py-[9px] font-mono text-[12.5px] font-medium text-mint"
                      : "border-b border-border px-2.5 py-[9px] text-text"}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**`DefList`** — used by `response-code` and `priority-threat`. The brief's penal pages want
definition-list rows: term in Fraunces, description in muted text. `DefList` is the same shape, and its
`DefItem` has an optional `color` which the priority-threat data uses for its three priority levels.
Keep the colour as a left rule (it is content — a priority level's colour — not decoration).

```tsx
export function DefList({ title, items }: { title?: string; items: DefItem[] }) {
  return (
    <div>
      {title ? <MicroLabel className="mb-3">{title}</MicroLabel> : null}
      <dl className="border-t border-border">
        {items.map((item, i) => (
          <div key={i}
            className="grid grid-cols-[minmax(88px,150px)_1fr] items-baseline gap-4 border-b border-border py-3"
            style={item.color ? { borderLeftWidth: 3, borderLeftColor: item.color, paddingLeft: 12 } : undefined}>
            <dt className="font-display text-[17px] font-semibold text-text">{item.term}</dt>
            <dd className="text-[14px] leading-relaxed text-text-dim">{item.desc}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
```

**`Ranks`** — **this block becomes the `Ladder` component in task-04.** Leave `Ranks` as a minimal
fallback and do not invest in it. The ladder's real styling (6px tier band, Barlow uppercase tier name,
mono rank number, Fraunces 21px rank name) is task-04's work.

**`Legend`** — the tier/colour legend. Keep the swatch but make it a 2–3px square, and lay it out as
hairline rows rather than cards.

```tsx
export function Legend({ title, items }: { title: string; items: LegendItem[] }) {
  return (
    <div>
      <MicroLabel className="mb-3">{title}</MicroLabel>
      <div className="border-t border-border">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 border-b border-border py-2.5">
            <span aria-hidden className="mt-[5px] h-3 w-3 shrink-0 rounded-sm" style={{ background: item.color }} />
            <div className="text-[13.5px]">
              <span className="font-semibold text-text">{item.label}</span>
              <span className="text-text-dim"> — {item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**`Tree`** — used only by `divisi-biro`. Keep the structure; drop the card radius and the gold chevron
fill. Hairline rows, mono branch connector as today.

**`Flow`** — **this block becomes the inline SVG `FlowDiagram` in task-04.** Leave `Flow` as-is
functionally (it currently renders a vertical chain per track with side-by-side branches). Task-04
replaces it with the SVG version; do not restyle it here beyond removing `rounded-lg` in favour of
`rounded-sm`, since it may remain as a fallback.

**`Weapons`** — the brief: "three-column grid per group (single column on mobile), class heading in
Fraunces with a strong bottom border, items separated by hairlines." Today it is a 3-column grid of
cards with a mono uppercase class name. Change the class heading to Fraunces, the container to hairline
rows, and keep the 3-column grid (`sm:grid-cols-2 lg:grid-cols-3` gives single column on mobile, which
matches "single column on mobile").

```tsx
export function Weapons({ classes, variant }: { classes: WeaponClass[]; variant?: "illegal" }) {
  const illegal = variant === "illegal";
  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {classes.map((cls, i) => (
        <div key={i}>
          <h4 className={`border-b-2 pb-1.5 font-display text-[18px] font-semibold ${illegal ? "border-b-coral text-coral" : "border-b-gold text-text"}`}>
            {cls.name}
          </h4>
          <ol className="border-t border-border">
            {cls.items.map((item, k) => (
              <li key={k} className="border-b border-border py-[5px] text-[15px] text-text-dim">
                {item}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
```

The `illegal` variant's coral heading is the existing signal that these are contraband weapons; keep it.

**`Penal`** — the `penal` blocks in `penal-robbery` and `penal-violence`. Today a gold-accent card with
the `main` charge as a coral chip and the `charges` as a `Gavel`-marked list. The brief's penal
treatment is definition-list rows with a red mono tag on Court Verdict articles. Restyle toward that,
keeping `title`, `main` and every charge verbatim.

```tsx
export function Penal({ title, main, charges }: { title: string; main: string; charges: string[] }) {
  return (
    <div className="border-t border-border pt-4">
      <h4 className="font-display text-[19px] font-semibold text-text">{title}</h4>
      <div className="mt-1.5 font-mono text-[13px] font-semibold text-coral">{main}</div>
      <ul className="mt-3 border-t border-border">
        {charges.map((charge, i) => (
          <li key={i} className="flex gap-2.5 border-b border-border py-2 text-[14px] leading-relaxed text-text-dim">
            <Gavel aria-hidden size={13} strokeWidth={2} className="mt-1 shrink-0 text-gold" />
            {charge}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Step 3 — Do not change the content

Every string in this file comes from `lib/data.ts` and must be rendered verbatim. In particular:

- Several penal bullets contain raw `<` and `>` (e.g. `"membawa < 300 butir"`). These render as JSX
  text and React escapes them. **Never** switch any of this to `dangerouslySetInnerHTML`.
- No `.toUpperCase()`, no `.slice()`, no trimming of data strings for display. The only transformation
  allowed is `String(i + 1).padStart(2, "0")` for ordinals, which is presentation.

## Acceptance Criteria

- [ ] `components/ui.tsx` and `components/blocks.tsx` both still have no `"use client"` directive.
- [ ] No `rounded-full` remains in either file except where the brief sanctions it (there should be
      none — the charge sheet's shadow is task-08's concern, and no pill is needed here).
- [ ] No `rounded-xl` remains anywhere in either file.
- [ ] No `card-lift` class remains in either file.
- [ ] `MicroLabel` renders no background, no border and no pill — it is a plain uppercase mono label.
- [ ] `Callout` and `TitledCard` both render as a 3px left rule with a mono label and **no filled box**.
- [ ] `Quote` renders on `bg-surface` with `font-display text-[17px]` and its `title` visible.
- [ ] `Weapons` renders its class heading in `font-display` with a 2px bottom border, in a
      `sm:grid-cols-2 lg:grid-cols-3` grid.
- [ ] `Table` and `Weapons`' containers keep their `overflow-x-auto` / grid behaviour so nothing forces
      page-body horizontal scroll at 360px.
- [ ] `DefList` renders its term in `font-display` and keeps `item.color` as a left rule where present.
- [ ] `FIELD`'s focus ring uses `--gold-soft` (amber), not `--mint-soft`.
- [ ] `CheckField` uses `accent-mint`.
- [ ] Every content string is rendered verbatim — no truncation, no case changes, no summarising.
- [ ] No `dangerouslySetInnerHTML` is introduced in either file.
- [ ] `npx tsc --noEmit` passes and `npm run lint` is clean.
- [ ] `git diff --stat lib/` is empty.

## Notes

**Do not introduce `motion-safe:` or `motion-reduce:` variants.** The repo runs its animation set
unconditionally — `app/globals.css` documents this and commit `722b380` enforces it. Existing
`transition-*` and `hover:` classes stay as they are; simply do not gate them on the OS preference.

**`components/ui.tsx` is imported by client components** (`PenalCodeGenerator`, `PatrolReportForm`)
**and by the Server Component block renderer.** That is why it has no `"use client"` directive and must
keep none: adding one would drag the whole block tree into the client bundle.

**The `Flow` and `Steps` blocks are superseded by task-04's `FlowDiagram` and `Procedures`.** Restyle
them only lightly here; task-04 builds the real components and task-07 wires them in. Leaving a
functional fallback is correct.

**`--surface-2` and `--border` must not be renamed** — `lib/bbcode.ts` emits them as literal strings into
the report preview and 6 test fixtures pin them. If you change `FIELD`'s background away from
`bg-surface-2`, that is fine (the class still exists for other uses), but never rename the token.
