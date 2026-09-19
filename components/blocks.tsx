import { ChevronRight, Gavel, TriangleAlert } from "lucide-react";

import { rankColor } from "@/lib/ranks";
import type {
  DefItem,
  FlowTrack,
  LegendItem,
  TreeNode,
  WeaponClass,
} from "@/lib/types";

import { Card, CardTitle, CodeChip, CONTENT_ICON_PROPS, MicroLabel } from "./ui";

/* ==========================================================================
   Content blocks.

   Every one of these renders data straight out of `lib/data.ts` — the markup
   changed for the redesign, the content did not. Wording, codes, ranks and
   charges are passed through verbatim.
   ========================================================================== */

/* ==========================================================================
   Prose blocks
   ========================================================================== */

export function Intro({ text }: { text: string }) {
  return (
    <p className="max-w-[68ch] text-[14.5px] leading-relaxed text-text-dim">
      {text}
    </p>
  );
}

/** note + example share a shape, differing only in accent colour. */
export function TitledCard({
  title,
  text,
  tone,
}: {
  title: string;
  text: string;
  tone: "info" | "ok";
}) {
  return (
    <Card accent={tone === "info" ? "gold" : "mint"}>
      <CardTitle>{title}</CardTitle>
      <p className="max-w-[68ch] text-[14px] leading-relaxed text-text-dim">
        {text}
      </p>
    </Card>
  );
}

/** A callout — the reference's coral warning box. */
export function Callout({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-coral/30 bg-coral-soft px-4 py-[13px]">
      <div className="flex items-start gap-3">
        <TriangleAlert
          {...CONTENT_ICON_PROPS}
          className="mt-0.5 shrink-0 text-coral"
        />
        <p className="text-[13.5px] font-semibold leading-relaxed text-text">
          {text}
        </p>
      </div>
    </div>
  );
}

export function Quote({ title, text }: { title: string; text: string }) {
  return (
    <Card accent="mint">
      <CardTitle>{title}</CardTitle>
      <p className="max-w-[68ch] text-[14px] italic leading-relaxed text-text-dim">
        &ldquo;{text}&rdquo;
      </p>
    </Card>
  );
}

export function Bullets({
  title,
  items,
}: {
  title?: string;
  items: string[];
}) {
  return (
    <div>
      {title ? <MicroLabel className="mb-3">{title}</MicroLabel> : null}
      <Card>
        <ul className="grid gap-3">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden
                className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
              />
              <span className="text-[14px] leading-relaxed text-text-dim">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export function Steps({ title, items }: { title?: string; items: string[] }) {
  return (
    <div>
      {title ? <MicroLabel className="mb-3">{title}</MicroLabel> : null}
      <Card className="py-2">
        <ol>
          {items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3.5 border-b border-border py-[13px] last:border-b-0"
            >
              <span
                aria-hidden
                className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-sm bg-surface-2 font-display text-[13px] font-bold text-gold"
              >
                {i + 1}
              </span>
              <span className="pt-0.5 text-[13.5px] leading-relaxed text-text-dim">
                {item}
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

/* ==========================================================================
   Data blocks
   ========================================================================== */

export function Table({
  title,
  head,
  rows,
}: {
  title?: string;
  head: string[];
  rows: string[][];
}) {
  return (
    <div>
      {title ? <MicroLabel className="mb-3">{title}</MicroLabel> : null}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface px-5 py-2">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              {head.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className="whitespace-nowrap border-b border-border-strong px-2.5 py-2 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.05em] text-text-faint"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="transition-colors hover:bg-surface-2">
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={
                      c === 0
                        ? "whitespace-nowrap border-b border-border px-2.5 py-[9px] font-mono text-[12.5px] font-medium text-gold"
                        : "border-b border-border px-2.5 py-[9px] text-text"
                    }
                  >
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

export function DefList({ title, items }: { title?: string; items: DefItem[] }) {
  return (
    <div>
      {title ? <MicroLabel className="mb-3">{title}</MicroLabel> : null}
      <dl className="grid gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="card-lift grid grid-cols-[minmax(88px,128px)_1fr] items-start gap-4 rounded-lg border border-border bg-surface px-4 py-3"
            style={
              item.color ? { borderLeftWidth: 2, borderLeftColor: item.color } : undefined
            }
          >
            <dt
              className="font-mono text-[12.5px] font-semibold"
              style={{ color: item.color ?? "var(--gold)" }}
            >
              {item.term}
            </dt>
            <dd className="text-[13.5px] leading-relaxed text-text-dim">
              {item.desc}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Ranks({ items }: { items: string[] }) {
  return (
    <ol className="grid gap-1.5">
      {items.map((rank, i) => (
        <li
          key={i}
          /* Same card treatment as every other surface on the page: the
             hairline border, the raised `--surface` fill and the shared
             `card-lift` hover, so these rows read as one design system with the
             stat boxes above rather than as bare list rows. */
          className="card-lift flex items-center gap-3.5 rounded-md border border-border bg-surface px-4 py-2.5 transition-transform duration-150 hover:translate-x-1"
        >
          <span aria-hidden className="w-6 font-mono text-[11px] text-text-faint">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-[14px] font-semibold" style={{ color: rankColor(rank) }}>
            {rank}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Legend({ title, items }: { title: string; items: LegendItem[] }) {
  return (
    <div>
      <MicroLabel className="mb-3">{title}</MicroLabel>
      <div className="grid gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="card-lift flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-2.5"
          >
            <span
              aria-hidden
              className="mt-[5px] h-3.5 w-3.5 shrink-0 rounded-sm"
              style={{ background: item.color }}
            />
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

export function Tree({ items }: { items: TreeNode[] }) {
  return (
    <div className="grid gap-3">
      {items.map((node, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface px-4 py-3.5">
          <div className="flex items-center gap-2.5 text-[14px] font-semibold text-text">
            <ChevronRight
              {...CONTENT_ICON_PROPS}
              className="shrink-0 text-gold"
            />
            {node.name}
          </div>
          <ul className="mt-2.5 grid gap-1.5 pl-5">
            {node.children.map((child, c) => (
              <li
                key={c}
                className="relative pl-4 text-[13.5px] text-text-dim before:absolute before:left-0 before:top-[11px] before:h-px before:w-2 before:bg-text-faint"
              >
                {child}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * A quick-reference flow: one or more routes, each a vertical chain of steps.
 *
 * A step with `branches` is a fork — the vehicle-search outcome, where "clear"
 * and "not clear" lead to different destinations. Branches render side by side
 * and wrap on narrow screens, so the diagram never forces a horizontal scroll.
 */
export function Flow({ title, tracks }: { title?: string; tracks: FlowTrack[] }) {
  return (
    <div>
      {title ? <MicroLabel className="mb-3">{title}</MicroLabel> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {tracks.map((track, t) => (
          <div key={t} className="rounded-lg border border-border bg-surface px-4 py-3.5">
            <h4 className="mb-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
              {track.title}
            </h4>

            <ol className="grid gap-0">
              {track.steps.map((step, s) => (
                <li key={s}>
                  <div className="flex items-center gap-2.5 rounded-sm border border-border bg-bg px-3 py-2">
                    <span
                      aria-hidden
                      className="w-4 shrink-0 text-center font-mono text-[11px] text-text-faint"
                    >
                      {s + 1}
                    </span>
                    <span className="font-mono text-[12.5px] font-semibold text-text">
                      {step.label}
                    </span>
                  </div>

                  {step.branches ? (
                    <div className="grid gap-2 py-2 sm:grid-cols-2">
                      {step.branches.map((branch, b) => (
                        <div
                          key={b}
                          className={`rounded-sm border-l-2 px-3 py-2 font-mono text-[11.5px] leading-relaxed ${
                            branch.tone === "ok"
                              ? "border-l-mint bg-mint-soft text-text-dim"
                              : "border-l-coral bg-coral-soft text-text-dim"
                          }`}
                        >
                          {branch.label}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div aria-hidden className="mx-auto h-3.5 w-px bg-border" />
                  )}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Weapons({
  classes,
  variant,
}: {
  classes: WeaponClass[];
  variant?: "illegal";
}) {
  const illegal = variant === "illegal";
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {classes.map((cls, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface px-4 py-3.5">
          <h4
            className={`mb-3 border-b border-border pb-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] ${
              illegal ? "text-coral" : "text-gold"
            }`}
          >
            {cls.name}
          </h4>
          <ol className="grid gap-1.5">
            {cls.items.map((item, k) => (
              <li key={k} className="flex gap-2.5 text-[13.5px] text-text-dim">
                <span aria-hidden className="w-4 shrink-0 font-mono text-[11px] text-text-faint">
                  {k + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

export function Penal({
  title,
  main,
  charges,
}: {
  title: string;
  main: string;
  charges: string[];
}) {
  return (
    <Card accent="gold">
      <h4 className="font-display text-[16px] font-semibold text-text">{title}</h4>
      <span className="mb-3.5 mt-2 inline-block">
        <CodeChip className="border-coral/30 bg-coral-soft text-coral">{main}</CodeChip>
      </span>
      <ul className="grid gap-2">
        {charges.map((charge, i) => (
          <li key={i} className="relative pl-5 text-[13.5px] leading-relaxed text-text-dim">
            <Gavel
              {...CONTENT_ICON_PROPS}
              className="absolute left-0 top-[3px] text-gold"
            />
            {charge}
          </li>
        ))}
      </ul>
    </Card>
  );
}
