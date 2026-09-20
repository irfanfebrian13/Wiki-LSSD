# Task 09: Section view and block renderer

## Status

complete

## Wave

4

## Description

Rebuild `components/SectionView.tsx` as the chapter's section: a 26px heading with a bottom hairline,
a content column, and a 220px right margin column holding that section's notes and warnings as
callouts. Then repoint `components/BlockRenderer.tsx` at the new dedicated components from task-04 and
task-06, and make it filter the margin blocks out of the content flow so nothing renders twice.

This is the task where the brief's "chapter page" layout is actually realised.

## Dependencies

**Depends on:** task-02-presentation-helpers, task-03-ui-and-readonly-blocks,
task-04-dedicated-components, task-06-transmission-block
**Blocks:** task-10-shell-rewrite

**Why this is wave 4 and not wave 3:** this task is the only one that edits `BlockRenderer.tsx`, and it
must import `Transmission` from task-06. Both constraints mean it has to run after task-06, so it sits
one wave later. Task-06 deliberately leaves `RadioCall.tsx` in place for this task to delete.

**Context from dependencies:**

- **From task-02:** `components/presentation.tsx` exports `takesMargin(block)` — `true` for `note`,
  `example` and `callout` blocks, `false` otherwise.
- **From task-03:** `components/blocks.tsx` has restyled `Intro`, `TitledCard`, `Callout`, `Quote`,
  `Bullets`, `Steps`, `Table`, `DefList`, `Ranks`, `Legend`, `Tree`, `Flow`, `Weapons`, `Penal`.
  `TitledCard` and `Callout` now render as 3px-left-rule callouts with a mono label and no filled box,
  which is exactly what the margin column wants.
- **From task-04:** `components/TenCodes.tsx` exports `TenCodes({ rows })`; `components/Ladder.tsx`
  exports `Ladder({ ranks, legend })`; `components/Procedures.tsx` exports `Procedures({ title, items })`;
  `components/FlowDiagram.tsx` exports `FlowDiagram({ tracks })`.
- **From task-06:** `components/Transmission.tsx` exports `Transmission({ title, phrase, phrase_id, note })`
  and `LanguageToggle`. `components/RadioCall.tsx` is deleted.

## Files to Create

None. Modify `components/SectionView.tsx` in place rather than adding a second component — the file name
is not referenced by the brief, and one component is simpler than two.

## Files to Modify

- `components/SectionView.tsx` — the section heading, the two-column grid, and the margin column.
- `components/BlockRenderer.tsx` — route the dedicated block types to their new components.

## Files to Delete

- `components/RadioCall.tsx` — superseded by `components/Transmission.tsx`, which task-06 creates. Delete
  it here, in the same task that repoints `BlockRenderer.tsx`'s `radiocall` case, so the import and the
  file never disagree. Task-06 deliberately leaves this file in place — see its file list.

## Technical Details

### 1. `components/SectionView.tsx`

Today this renders a group chip, a 28px title and a flat block stack, and takes an `onMount` callback for
the deleted scroll-spy. The new shape:

```tsx
import { memo } from "react";
import type { Section } from "@/lib/types";
import { takesMargin } from "./presentation";
import { BlockRenderer } from "./BlockRenderer";
import { Callout, TitledCard } from "./blocks";

export const SectionView = memo(function SectionView({ section }: { section: Section }) {
  const content = section.blocks.filter((b) => !takesMargin(b));
  const margin = section.blocks.filter(takesMargin);

  return (
    <section id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-[88px]">
      <h2
        id={`${section.id}-heading`}
        className="border-b border-border pb-2 font-display text-[26px] font-semibold text-text"
      >
        {section.title}
      </h2>

      <div className="chapter-grid mt-5 grid gap-12 min-[980px]:grid-cols-[minmax(0,1fr)_220px]">
        <div className="reveal-stack grid gap-[18px]">
          {content.map((block, i) => (
            <BlockRenderer key={i} block={block} />
          ))}
        </div>

        {margin.length ? (
          <aside className="grid gap-5 self-start">
            {margin.map((block, i) => (
              <BlockRenderer key={i} block={block} />
            ))}
          </aside>
        ) : null}
      </div>
    </section>
  );
});
```

**Key decisions in this markup:**

- **The heading is `h2`, not `h3`.** The chapter header (task-10) is the `h1` for the category page, so
  the sections inside it sit at `h2`. That gives each category page a correct outline: one `h1`, then one
  `h2` per section. Task-10 uses the same scheme — do not diverge.
- **`takesMargin` filtering, not mutation.** `section.blocks` is never spliced — two `filter` calls
  produce the two columns. This is what keeps the frozen data untouched.
- **`min-[980px]:grid-cols-[...]`** implements the brief's ">980px" breakpoint. Tailwind v4 supports the
  arbitrary `min-[980px]:` variant. Below that the grid is one column, so the margin content flows
  beneath the section — which is what the brief asks for.
- **`scroll-mt-[88px]`** clears the sticky header band and tab strip when jumping to an anchor. Verify
  the real combined height in task-10 and adjust; too small and the heading hides under the band.
- **`self-start`** on the aside keeps it from stretching to the content column's height.
- **`reveal-stack`** stays on the content column so the entrance animation ladder still applies.
  **Do not put `reveal-stack` on the aside** — the margin column is supplementary and animating it
  separately would draw the eye away from the content.

**The `onMount` prop is removed.** It existed only for the scroll-spy, which is deleted. If task-10 has
not yet removed the `onMount` call site, `tsc` will fail on the extra prop — **either** keep the prop in
the signature and ignore it, **or** remove it and let task-10 fix the call site. Prefer removing it and
fixing the call site here if `Shell.tsx` is small enough to touch safely; otherwise keep it as an unused
optional prop with a deprecation comment. **Do not leave the build broken.**

### 2. `components/BlockRenderer.tsx`

This file's job is unchanged: map a `Block` to a component. Two changes:

**Route the dedicated types to their new components:**

```tsx
import { TenCodes } from "./TenCodes";
import { Ladder } from "./Ladder";
import { Procedures } from "./Procedures";
import { FlowDiagram } from "./FlowDiagram";
import { Transmission } from "./Transmission";
```

The routing rules, all derived from the data rather than from new fields:

| Block | Component | How the component's props are derived |
|---|---|---|
| `table` **in the `ten-codes` section** | `TenCodes` | `rows={block.rows}` |
| `table` elsewhere | `Table` | unchanged |
| `ranks` | `Ladder` | `ranks={block.items}`, plus the section's `legend` block's `items` |
| `steps` | `Procedures` | `items={block.items}`, `title={block.title}` |
| `flow` | `FlowDiagram` | `tracks={block.tracks}` |
| `radiocall` | `Transmission` | `title`, `phrase`, `phrase_id`, `note` |

**The `ranks` case needs the legend from a sibling block.** `BlockRenderer` receives only one block, but
`Ladder` needs both the `ranks` block and the `legend` block from the same section. Two options:

- **Pass the section through** — change `BlockRenderer`'s signature to accept the parent `section`, so
  the `ranks` case can find its sibling legend. This is the cleaner approach and is what the data's shape
  requires.
- **Precompute the legend in `SectionView`** and pass it down.

Prefer the first: add an optional `section` prop to `BlockRenderer` and have `SectionView` pass it. Then:

```tsx
case "ranks": {
  const legend = section?.blocks.find((b) => b.type === "legend");
  return (
    <Ladder
      ranks={block.items}
      legend={legend && legend.type === "legend" ? legend.items : []}
    />
  );
}
```

If no legend is present the ladder renders no groups — but the only `ranks` block in the data is in
`chain-of-command`, which does have a legend, so this is a defensive branch. **Do not invent a fallback
legend.**

**The `table` case needs to know its section.** The ten-code table is identified by
`section?.id === "ten-codes"`. That is a presentation-only discrimination on an existing section id, not
a data change — the brief's "use the closest presentation-only fallback" instruction covers exactly this.
Alternatively, identify it by shape (`block.rows.length === 48`), which is fragile; **prefer the section
id**.

```tsx
case "table":
  if (section?.id === "ten-codes") return <TenCodes rows={block.rows} />;
  return <Table title={block.title} head={block.head} rows={block.rows} />;
```

**Remove the `steps` fallback concern.** All 9 `steps` blocks go to `Procedures`; the restyled `Steps`
in `blocks.tsx` becomes unused by the renderer but stays available. That is fine — do not delete it.

**Keep the comment about escaping.** The file's existing doc comment explains that content is passed as
JSX children rather than injected HTML, because several entries contain raw `<` and `>`. That comment is
load-bearing documentation — keep it and keep the behaviour.

### 3. What NOT to do

- **Do not change `lib/data.ts`** to add a `variant` field, a category field, or anything else that would
  make this routing easier. The routing is derived; that is the point.
- **Do not reorder blocks.** The content column renders `section.blocks` in order with the margin blocks
  filtered out; the margin column renders them in their original relative order.
- **Do not add `dangerouslySetInnerHTML`.** All content stays JSX text.

## Acceptance Criteria

- [ ] `SectionView` renders the section title as a heading at `text-[26px]` in `font-display` with a
      `border-b border-border` hairline.
- [ ] The heading level is consistent with the chapter header's level in task-10 — they are not both `h1`.
- [ ] Above 980px the layout is a two-column grid with a 220px right column; below 980px it is one column
      and the margin content flows beneath the section.
- [ ] The margin column renders exactly the section's `note`, `example` and `callout` blocks, in their
      original relative order, and **nothing else**.
- [ ] The content column renders every other block, in order — no margin block appears twice.
- [ ] `section.blocks` is never mutated; the split is done with two `filter` calls.
- [ ] The section has `id={section.id}` so existing anchors resolve, and a scroll margin that clears the
      sticky header.
- [ ] `BlockRenderer` routes `radiocall` to `Transmission`, `flow` to `FlowDiagram`, `steps` to
      `Procedures`, and `ranks` to `Ladder`.
- [ ] The `ten-codes` section's table routes to `TenCodes`; every other table routes to `Table`.
- [ ] `Ladder` receives the sibling `legend` block's items from the same section.
- [ ] `BlockRenderer` still passes content as JSX children — no `dangerouslySetInnerHTML` anywhere.
- [ ] The existing doc comment about escaping raw `<` and `>` is preserved.
- [ ] `npx tsc --noEmit` passes and `npm run lint` is clean.
- [ ] `git diff --stat lib/` is empty.

## Notes

**The `section` prop threading is the one real design change here.** It is needed because two of the
brief's components (`TenCodes`, `Ladder`) need information from a sibling block or from the section's own
identity. Threading the section is preferable to duplicating that lookup in every component, and it is
strictly presentation — the data is untouched.

**Breakpoint syntax.** The brief says ">980px". Tailwind's stock `lg` is 1024px, which is not 980px.
Use the arbitrary variant `min-[980px]:` to hit the brief's number exactly. Note that the existing app
uses `lg:` (1024px) for its mobile/desktop split; the new layout deliberately uses 980px for the margin
column, and 760px for the bottom nav (task-08). Keep those three distinct — they are different concerns
(margin column, sidebar replacement, mobile nav).

**Do not add a table of contents or breadcrumb here.** The TOC lives on the cover (task-09) and the tabs
are the category nav (task-08). A section is just a heading and its content.
