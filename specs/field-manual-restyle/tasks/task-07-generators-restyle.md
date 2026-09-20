# Task 07: Generators restyle

## Status

complete

## Wave

3

## Description

Restyle the two generators into the Field Manual language while keeping every field, group, rule and
byte of output exactly as they are. The Penal Code Generator gains a sticky charge sheet; the Patrol
Report Generator's Output and Preview become tabs.

**This task must not change a single calculation or generated string.** Both generators' logic lives in
`lib/penal.ts` and `lib/bbcode.ts`, which are frozen and pinned by 42 tests — the work here is entirely
markup and layout.

## Dependencies

**Depends on:** task-03-ui-and-readonly-blocks
**Blocks:** None

**Context from dependencies:** task-03 restyled `components/ui.tsx` — `Card`, `CardTitle`, `MicroLabel`,
`CodeChip`, the `BTN_*` strings, `FIELD`, `Field`, `CheckField` and `OutputBox` all now use the 2–3px
radius scale, hairline rules, no pills and an amber focus ring. It also removed `card-lift` from `Card`.
This task builds the generators out of those primitives.

## Files to Modify

- `components/PenalCodeGenerator.tsx` — layout into form + sticky charge sheet.
- `components/PatrolReportForm.tsx` — Output and Preview as tabs.

## Technical Details

### 1. `components/PenalCodeGenerator.tsx`

**What must not change:**

- `PenalInput` and `EMPTY_PENAL_INPUT` come from `lib/penal.ts` and are untouched.
- `computePenalCode(input)`, `countCharges(groups)`, `describeCharge(name)` and `formatPenalCode(groups)`
  are called exactly as they are today.
- Every field, every group, every option label and every threshold stays. There are 8 groups (Robbery,
  Kekerasan, Properti, Senjata Api, Amunisi & Vest, Narcotics, Traffic, Lainnya) and the numbered tags
  1–8 are part of how the tool reads — keep them.
- The `NumberField` component's careful behaviour stays exactly as it is: the string-backed text state,
  the `editing` ref that suppresses the echo of the user's own change, the leading-zero strip, the
  select-all on focus when the value is `"0"`, and the restore-to-`"0"` on blur. **This was the subject
  of a recent fix (commit `97085cc`) and must not be regressed.**
- The clipboard write of `formatPenalCode(groups)` and the copied confirmation stay.

**The new layout.** The brief: "form groups on the left (each group has a Fraunces h3 with a hairline),
and on the right a sticky 'Pasal yang dikenakan' charge sheet (`#171c24`, strong border, hard 6px offset
shadow, dotted separators between charges in mono, count, Reset and amber 'Salin daftar pasal' buttons)
that updates live from the existing logic, with a friendly empty state. On mobile the sheet stacks under
the form and a floating amber 'n pasal' button (above the bottom nav) scrolls to it."

```tsx
<div className="grid items-start gap-10 min-[980px]:grid-cols-[minmax(0,1fr)_340px]">
  <div className="reveal-stack grid gap-8">
    {/* the eight groups, unchanged in content */}
  </div>

  <aside
    id="charge-sheet"
    aria-live="polite"
    className="charge-sheet rounded-sm border border-outline bg-surface p-4 shadow-[6px_6px_0_var(--border)] min-[980px]:sticky min-[980px]:top-[132px]"
  >
    ...
  </aside>
</div>
```

**The charge sheet:**

- **Sticky below 980px only.** `min-[980px]:sticky min-[980px]:top-[132px]`. The `132px` clears the
  sticky header band plus the tab strip; **verify the real combined height in task-10** and adjust, or
  the sheet will tuck under the header.
- **The hard offset shadow** is `shadow-[6px_6px_0_var(--border)]` — the brief's "hard offset shadow
  (6px 6px 0, border color) only on the charge sheet". This is the **only** place that shadow appears.
- **`charge-sheet` class** is what the print stylesheet (task-01) uses to drop the shadow when printing.
- **Dotted separators** between charges: `border-b border-dotted border-text-dim` on each `li`, in mono.
- **The empty state** is friendly and non-alarming, and must keep the existing wording's meaning. Today
  it reads "Isi form di atas — daftar pasal muncul di sini secara otomatis." That wording is good; keep
  it or an equivalent, but **do not invent new content** — it is UI copy, so a light rewording is
  acceptable, but prefer leaving it as it is.
- **The count** renders as `{total} pasal` in mono, as today.
- **Reset and the amber copy button**: Reset stays a secondary/ghost button, "Salin daftar pasal" is the
  amber primary (`BTN_GOLD`). Today the copy button reads "Copy Daftar Pasal"; the brief names it "Salin
  daftar pasal". **Use the brief's wording** — this is a UI label, not handbook content.
- **Group headings inside the sheet.** Today the sheet groups charges under their category name. The
  brief's sheet is a flat list with dotted separators. Keep the group headings if they fit — they carry
  real information from `computePenalCode`'s `group` field — but render them as small mono labels rather
  than the current uppercase text. Do not drop them: they are derived from the logic, not decoration.

**The floating "n pasal" button (mobile only):**

```tsx
<button
  type="button"
  onClick={() => document.getElementById("charge-sheet")?.scrollIntoView({ behavior: "smooth", block: "center" })}
  className="charge-fab fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px))] right-3.5 z-30 rounded-sm border border-outline bg-gold px-3.5 py-2 font-mono text-[13px] font-semibold text-on-accent min-[760px]:hidden"
>
  {total} pasal
</button>
```

The `bottom-[calc(64px+...)]` clears the mobile bottom nav from task-08. The `charge-fab` class is what
the print stylesheet hides. `min-[760px]:hidden` keeps it mobile-only, matching the brief.

**Use `scrollIntoView` with `behavior: "smooth"`** — the prototype does the same, and the repo's
`scroll-behavior: smooth` is already unconditional.

### 2. `components/PatrolReportForm.tsx`

**What must not change:**

- `buildFullReport(input)`, `bbToHtml(output)`, `EMPTY_REPORT` and the `ReportInput`/`ReportEntry` shapes
  come from `lib/bbcode.ts` and are untouched.
- The generated BBCode must stay byte-identical. `lib/bbcode.test.ts` pins it; do not touch the
  generation path.
- Every field stays: the four deputy fields (Name, Station, Rank, Badge), the two report entries each
  with Title, Date, Details and Evidence links, and the add/remove-evidence behaviour.
- The `dangerouslySetInnerHTML` preview stays — it is the one sanctioned use, and the input is the
  deputy's own form data.

**The new layout.** The brief: "same logic and output, restyled as fields on the panel colour; Output
and Preview become tabs; keep the existing 'live' preview behavior."

The change is that Output and Preview are no longer two stacked cards but two tabs over one panel.

```tsx
const [tab, setTab] = useState<"output" | "preview">("output");

<div className="rounded-sm border border-border bg-surface">
  <div role="tablist" aria-label="Hasil laporan" className="flex border-b border-border">
    <button
      role="tab"
      type="button"
      id="report-tab-output"
      aria-selected={tab === "output"}
      aria-controls="report-panel-output"
      onClick={() => setTab("output")}
      className={`px-4 py-2.5 font-mono text-[12.5px] font-semibold uppercase tracking-[0.06em] transition-colors ${
        tab === "output" ? "border-b-2 border-b-gold text-text" : "text-text-dim hover:text-text"
      }`}
    >
      Output
    </button>
    {/* the same for Preview */}
  </div>

  <div
    role="tabpanel"
    id="report-panel-output"
    aria-labelledby="report-tab-output"
    hidden={tab !== "output"}
    className="p-4"
  >
    {output ? <OutputBox>{output}</OutputBox> : <p className="text-[12.5px] text-text-faint">…</p>}
  </div>
  {/* the preview panel */}
</div>
```

**Accessibility requirements for the tabs:**

- `role="tablist"` on the container, `role="tab"` on each button, `role="tabpanel"` on each panel.
- `aria-selected` on the tabs, `aria-controls` pointing at the panel id, `aria-labelledby` on the panel
  pointing back at the tab id.
- Use the `hidden` attribute on the inactive panel so it is removed from the accessibility tree and the
  tab order — do not merely style it invisible.
- **Arrow-key navigation between tabs** is required for a real tablist: `ArrowLeft`/`ArrowRight` move the
  selection. Either implement it or use plain buttons with `aria-pressed` instead of the `tab` roles. The
  brief demands "full keyboard support (tabs, rows, palette, toggles)", so implement the arrow keys.

**The live preview must keep working.** `preview` is derived with `useMemo` from `output`, so it updates
whenever `output` changes. Generating a report while the Preview tab is open must show the new preview
without a manual switch — that is the "live" behaviour and it comes for free from the `useMemo`. Do not
convert it to a snapshot taken at generate time.

**The buttons** (Generate, Copy BBCode, Clear) keep their behaviour and their existing labels.

### 3. Field styling

The brief: "restyled as fields on the panel colour". The `FIELD` string from task-03 already renders on
`bg-surface-2` with a hairline border and an amber focus ring. Use it everywhere the current file uses
`FIELD` — no change to the field set, only what `FIELD` resolves to.

### 4. Do not touch the logic

Both files import from `lib/`. **Verify no edit to either file changes an import from `lib/` or the
arguments passed to a `lib/` function.** The safest check after editing:

```bash
git diff --stat lib/          # must be empty
npm test                      # 42 tests, including the penal boundaries and BBCode fixtures
```

## Acceptance Criteria

- [ ] `PenalCodeGenerator` keeps all 8 groups, every field, every option label and the numbered tags
      1–8, with each group heading in `font-display` over a hairline.
- [ ] `NumberField`'s behaviour is unchanged: string-backed state, the `editing` ref, leading-zero
      stripping, select-on-focus for `"0"`, and restore-to-`"0"` on blur.
- [ ] The charge sheet is sticky above 980px at a top offset that clears the sticky header, and stacks
      under the form below 980px.
- [ ] The charge sheet carries the **only** `6px 6px 0` hard offset shadow in the codebase and the
      `charge-sheet` class.
- [ ] Charges are separated by dotted hairlines and rendered in mono; the count reads `{n} pasal`.
- [ ] The sheet's empty state is friendly and appears when `total === 0`.
- [ ] The sheet has "Reset" and an amber "Salin daftar pasal" button; the copy writes
      `formatPenalCode(groups)` to the clipboard and is disabled when the count is 0.
- [ ] A mobile-only floating amber `{n} pasal` button with the `charge-fab` class sits above the bottom
      nav and scrolls to the sheet.
- [ ] `PatrolReportForm` keeps every field and the add/remove-evidence behaviour.
- [ ] Output and Preview are tabs with correct `tablist`/`tab`/`tabpanel` roles, `aria-selected`,
      `aria-controls`, `aria-labelledby`, the `hidden` attribute on the inactive panel, and
      ArrowLeft/ArrowRight navigation.
- [ ] The preview remains live — regenerating while the Preview tab is open updates it.
- [ ] `dangerouslySetInnerHTML` remains confined to the preview.
- [ ] `npm test` passes all 42 tests, including the penal boundaries and the BBCode fixtures.
- [ ] `npx tsc --noEmit` passes and `npm run lint` is clean.
- [ ] `git diff --stat lib/` is empty.

## Notes

**The two generators are the highest-risk files in this restyle** because they are the only ones with
logic adjacent to their markup. Read them fully before editing, change only JSX and class names, and
re-run `npm test` afterwards. If a change feels like it needs a tweak to `lib/penal.ts` or
`lib/bbcode.ts`, stop — that is out of scope and the data is frozen.

**The `shadow-[6px_6px_0_var(--border)]` arbitrary value** is the brief's exact specification. In light
mode `--border` is `rgba(12,14,18,0.08)`, which is a very faint shadow — acceptable and consistent with
the hairline language, but if it reads as invisible, the fallback is to use `--outline` instead. Note the
choice rather than silently substituting.

**Do not add a "live update" subscription or an effect to the charge sheet.** `computePenalCode` is
already called with `useMemo` on every input change, so the sheet is live by construction. Adding an
effect would be redundant and could introduce a render loop.
