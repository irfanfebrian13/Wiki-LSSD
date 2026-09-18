import { rankColor } from "@/lib/ranks";
import type {
  DefItem,
  FlowTrack,
  LegendItem,
  TreeNode,
  WeaponClass,
} from "@/lib/types";

/* ==========================================================================
   Shared presentation primitives
   ========================================================================== */

/** Uppercase micro-label used above grouped content. */
export function MicroLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-text-faint">
      {children}
    </div>
  );
}

/** A panel: flat surface, hairline border, no soft shadow. */
export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded border border-border bg-surface ${className}`}>{children}</div>
  );
}

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
  const accent = tone === "info" ? "var(--accent-2)" : "var(--accent)";
  return (
    <Panel className="px-5 py-4" >
      <div
        className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: accent }}
      >
        {title}
      </div>
      <p className="max-w-[68ch] text-[14.5px] leading-relaxed text-text-dim">
        {text}
      </p>
    </Panel>
  );
}

export function Callout({ text }: { text: string }) {
  return (
    <div className="rounded border border-accent-2/40 bg-accent-2-soft px-5 py-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 font-mono text-sm font-bold text-accent-2"
        >
          !
        </span>
        <p className="text-[14.5px] font-semibold leading-relaxed text-text">
          {text}
        </p>
      </div>
    </div>
  );
}

export function Quote({ title, text }: { title: string; text: string }) {
  return (
    <Panel className="border-l-2 border-l-accent px-5 py-4">
      <div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
        {title}
      </div>
      <p className="max-w-[68ch] text-[14.5px] italic leading-relaxed text-text">
        &ldquo;{text}&rdquo;
      </p>
    </Panel>
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
      {title ? <MicroLabel>{title}</MicroLabel> : null}
      <Panel className="px-5 py-4">
        <ul className="grid gap-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden
                className="mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full bg-accent"
              />
              <span className="text-[14.5px] leading-relaxed text-text-dim">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

export function Steps({ title, items }: { title?: string; items: string[] }) {
  return (
    <div>
      {title ? <MicroLabel>{title}</MicroLabel> : null}
      <ol className="grid gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3.5 rounded border border-border bg-surface px-4 py-3">
            <span
              aria-hidden
              className="grid h-6 w-6 shrink-0 place-items-center rounded-sm bg-accent-soft font-mono text-[11px] font-bold text-accent"
            >
              {i + 1}
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
      {title ? <MicroLabel>{title}</MicroLabel> : null}
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              {head.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className="whitespace-nowrap border-b border-border bg-surface-2 px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-text-faint"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="transition-colors hover:bg-surface">
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={
                      c === 0
                        ? "whitespace-nowrap border-b border-border-soft px-4 py-2 font-mono font-medium text-accent"
                        : "border-b border-border-soft px-4 py-2 text-text-dim"
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
      {title ? <MicroLabel>{title}</MicroLabel> : null}
      <dl className="grid gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-[minmax(88px,128px)_1fr] items-start gap-4 rounded border border-border bg-surface px-4 py-3"
            style={
              item.color ? { borderLeftWidth: 2, borderLeftColor: item.color } : undefined
            }
          >
            <dt
              className="font-mono text-[13px] font-semibold"
              style={{ color: item.color ?? "var(--accent)" }}
            >
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

export function Ranks({ items }: { items: string[] }) {
  return (
    <ol className="grid gap-1.5">
      {items.map((rank, i) => (
        <li
          key={i}
          className="group flex items-center gap-3.5 rounded border border-border bg-surface px-4 py-2.5 transition-transform hover:translate-x-1"
        >
          <span
            aria-hidden
            className="w-6 font-mono text-[11px] text-text-faint"
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span
            className="text-[14px] font-semibold"
            style={{ color: rankColor(rank) }}
          >
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
      <MicroLabel>{title}</MicroLabel>
      <div className="grid gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 rounded border border-border bg-surface px-4 py-2.5">
            <span
              aria-hidden
              className="mt-[5px] h-3.5 w-3.5 shrink-0 rounded-sm"
              style={{ background: item.color }}
            />
            <div className="text-[14px]">
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
        <div key={i} className="rounded border border-border bg-surface px-4 py-3.5">
          <div className="flex items-center gap-2.5 text-[14px] font-semibold text-text">
            <span aria-hidden className="text-accent">
              ▸
            </span>
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
      {title ? <MicroLabel>{title}</MicroLabel> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {tracks.map((track, t) => (
          <div key={t} className="rounded border border-border bg-surface px-4 py-3.5">
            <h4 className="mb-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
              {track.title}
            </h4>

            <ol className="grid gap-0">
              {track.steps.map((step, s) => (
                <li key={s}>
                  <div className="flex items-center gap-2.5 rounded-sm border border-border-soft bg-bg px-3 py-2">
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
                              ? "border-l-accent bg-accent-soft text-text-dim"
                              : "border-l-danger bg-danger-soft text-text-dim"
                          }`}
                        >
                          {branch.label}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      aria-hidden
                      className="mx-auto h-3.5 w-px bg-border"
                    />
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
        <div key={i} className="rounded border border-border bg-surface px-4 py-3.5">
          <h4
            className={`mb-3 border-b border-border-soft pb-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] ${
              illegal ? "text-danger" : "text-accent"
            }`}
          >
            {cls.name}
          </h4>
          <ol className="grid gap-1.5">
            {cls.items.map((item, k) => (
              <li key={k} className="flex gap-2.5 text-[13.5px] text-text-dim">
                <span
                  aria-hidden
                  className="w-4 shrink-0 font-mono text-[11px] text-text-faint"
                >
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
    <Panel className="px-5 py-4">
      <h4 className="text-[16px] font-semibold text-text">{title}</h4>
      <span className="mt-2 mb-3.5 inline-block rounded-sm bg-danger-soft px-2.5 py-1 font-mono text-[12px] font-semibold text-danger">
        {main}
      </span>
      <ul className="grid gap-2">
        {charges.map((charge, i) => (
          <li key={i} className="relative pl-5 text-[14px] leading-relaxed text-text-dim">
            <span aria-hidden className="absolute left-0 font-bold text-accent">
              §
            </span>
            {charge}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
