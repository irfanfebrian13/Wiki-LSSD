import { ChevronRight, Gavel } from "lucide-react";

import { rankColor } from "@/lib/ranks";
import type {
  DefItem,
  FlowTrack,
  LegendItem,
  TreeNode,
  WeaponClass,
} from "@/lib/types";

import { splitPenalBullet } from "./presentation";
import { CONTENT_ICON_PROPS, MicroLabel } from "./ui";

/* ==========================================================================
   Content blocks.

   Every one of these renders data straight out of `lib/data.ts` — the markup
   changed for the restyle, the content did not. Wording, codes, ranks and
   charges are passed through verbatim.
   ========================================================================== */

/* ==========================================================================
   Prose blocks
   ========================================================================== */

export function Intro({ text }: { text: string }) {
  return (
    <p className="max-w-[66ch] text-[15px] leading-relaxed text-text-dim">
      {text}
    </p>
  );
}

/**
 * note + example share a shape; both are informational, so both take amber.
 *
 * `tone` stays in the type because the block renderer still passes it, but it
 * no longer changes the rendering: in the margin column both read as
 * informational.
 */
export function TitledCard(props: {
  title: string;
  text: string;
  tone: "info" | "ok";
}) {
  return (
    <div className="border-l-[3px] border-l-gold py-[2px] pl-3.5">
      <b className="mb-0.5 block font-mono text-[12px] font-semibold text-gold">
        {props.title}
      </b>
      <p className="text-[14px] leading-relaxed text-text-dim">{props.text}</p>
    </div>
  );
}

/**
 * A warning.
 *
 * The brief wants a 3px left rule in red with a mono label and no filled box.
 * A `callout` block carries only its text, so the label is the site's own word
 * for the concept rather than an invented content title.
 */
export function Callout({ text }: { text: string }) {
  return (
    <div className="border-l-[3px] border-l-coral py-[2px] pl-3.5">
      <b className="mb-0.5 block font-mono text-[12px] font-semibold text-coral">
        Peringatan
      </b>
      <p className="text-[13.5px] font-semibold leading-relaxed text-text">
        {text}
      </p>
    </div>
  );
}

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

export function Bullets({
  title,
  items,
  penalRows = false,
}: {
  title?: string;
  items: string[];
  /** Penal reference bullets are definition-list rows with a court tag. */
  penalRows?: boolean;
}) {
  if (penalRows) {
    return (
      <div>
        {title ? <MicroLabel className="mb-3">{title}</MicroLabel> : null}
        <dl className="border-t border-border">
          {items.map((item, i) => {
            const row = splitPenalBullet(item);
            return (
              <div
                key={i}
                className="grid gap-1.5 border-b border-border py-3 sm:grid-cols-[minmax(0,270px)_1fr] sm:gap-[18px]"
              >
                <dt className="font-display text-[17px] font-semibold text-text">
                  {row.term}
                  {row.court ? (
                    <span className="ml-2 inline-block rounded-sm border border-coral px-[5px] align-middle font-mono text-[11px] font-semibold text-coral">
                      Court Verdict
                    </span>
                  ) : null}
                </dt>
                {row.desc ? (
                  <dd className="text-[15px] leading-relaxed text-text-dim">
                    {row.desc}
                  </dd>
                ) : null}
              </div>
            );
          })}
        </dl>
      </div>
    );
  }

  return (
    <div>
      {title ? <MicroLabel className="mb-3">{title}</MicroLabel> : null}
      <ul className="border-t border-border">
        {items.map((item, i) => (
          <li
            key={i}
            className="border-b border-border py-2.5 text-[14px] leading-relaxed text-text-dim"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A plain, non-interactive step list.
 *
 * The interactive version — with the session-only done toggle — is
 * `components/Procedures.tsx`, which the renderer routes every `steps` block
 * to. This stays as a functional fallback in the same visual language.
 */
export function Steps({ title, items }: { title?: string; items: string[] }) {
  return (
    <div>
      {title ? <MicroLabel className="mb-3">{title}</MicroLabel> : null}
      <ol className="border-t border-border">
        {items.map((item, i) => (
          <li key={i} className="flex gap-4 border-b border-border py-3">
            <span
              aria-hidden
              className="w-8 shrink-0 font-mono text-[18px] font-semibold text-gold"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[14px] leading-relaxed text-text-dim">
              {item}
            </span>
          </li>
        ))}
      </ol>
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
      <div className="overflow-x-auto rounded-sm border border-border bg-surface px-4 py-1">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              {head.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className="whitespace-nowrap border-b border-outline px-2.5 py-2 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-dim"
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
                        ? "whitespace-nowrap border-b border-border px-2.5 py-[9px] font-mono text-[12.5px] font-medium text-mint"
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
      <dl className="border-t border-border">
        {items.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-[minmax(88px,150px)_1fr] items-baseline gap-4 border-b border-border py-3"
            style={
              item.color
                ? {
                    borderLeftWidth: 3,
                    borderLeftColor: item.color,
                    paddingLeft: 12,
                  }
                : undefined
            }
          >
            <dt className="font-display text-[17px] font-semibold text-text">
              {item.term}
            </dt>
            <dd className="text-[14px] leading-relaxed text-text-dim">
              {item.desc}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * The plain rank list.
 *
 * The real ladder — tier bands, Barlow tier names, mono rank numbers — is
 * `components/Ladder.tsx`, which the renderer routes the `ranks` block to. This
 * stays as a minimal fallback.
 */
export function Ranks({ items }: { items: string[] }) {
  return (
    <ol className="border-t border-border">
      {items.map((rank, i) => (
        <li
          key={i}
          className="flex items-center gap-3.5 border-b border-border py-2.5"
        >
          <span aria-hidden className="w-6 font-mono text-[11px] text-text-dim">
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
      <div className="border-t border-border">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 border-b border-border py-2.5">
            <span
              aria-hidden
              className="mt-[5px] h-3 w-3 shrink-0 rounded-sm"
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
    <div className="border-t border-border">
      {items.map((node, i) => (
        <div key={i} className="border-b border-border py-3.5">
          <div className="flex items-center gap-2.5 text-[14px] font-semibold text-text">
            <ChevronRight {...CONTENT_ICON_PROPS} className="shrink-0 text-gold" />
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
 * The real diagram — hand-written inline SVG — is
 * `components/FlowDiagram.tsx`, which the renderer routes the `flow` block to.
 * This stays as a functional fallback.
 */
export function Flow({ title, tracks }: { title?: string; tracks: FlowTrack[] }) {
  return (
    <div>
      {title ? <MicroLabel className="mb-3">{title}</MicroLabel> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {tracks.map((track, t) => (
          <div key={t} className="rounded-sm border border-border bg-surface px-4 py-3.5">
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
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {classes.map((cls, i) => (
        <div key={i}>
          <h4
            className={`border-b-2 pb-1.5 font-display text-[18px] font-semibold ${
              illegal ? "border-b-coral text-coral" : "border-b-gold text-text"
            }`}
          >
            {cls.name}
          </h4>
          <ol className="border-t border-border">
            {cls.items.map((item, k) => (
              <li
                key={k}
                className="border-b border-border py-[5px] text-[15px] text-text-dim"
              >
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
    <div className="border-t border-border pt-4">
      <h4 className="font-display text-[19px] font-semibold text-text">{title}</h4>
      <div className="mt-1.5 font-mono text-[13px] font-semibold text-coral">
        {main}
      </div>
      <ul className="mt-3 border-t border-border">
        {charges.map((charge, i) => (
          <li
            key={i}
            className="flex gap-2.5 border-b border-border py-2 text-[14px] leading-relaxed text-text-dim"
          >
            <Gavel
              aria-hidden
              size={13}
              strokeWidth={2}
              className="mt-1 shrink-0 text-gold"
            />
            {charge}
          </li>
        ))}
      </ul>
    </div>
  );
}
