/* ============================================================================
   Shared presentation primitives.

   The design language of `lssd-wiki-modern.html`: charcoal cards with hairline
   borders and generous radii, gold for identity and primary action, mint for
   positive/secondary, coral for warnings and danger.

   Presentational only — no state, no "use client", so both the Server Component
   block renderer and the client-side tools can share one definition.
   ========================================================================= */

import type { LucideProps } from "lucide-react";

/**
 * Every icon that sits inline with body copy — the section badge, the callout
 * marker, the tree and charge bullets — is drawn with these props.
 *
 * One optical size and one stroke weight, defined once, so the whole content
 * column reads as a single drawn set instead of drifting a few pixels per
 * block. `aria-hidden` because each of these decorates text that already
 * carries the meaning.
 */
export const CONTENT_ICON_PROPS: LucideProps = {
  size: 14,
  strokeWidth: 2,
  "aria-hidden": true,
};

/** The card: the reference's primary container. */
export function Card({
  children,
  accent,
  className = "",
}: {
  children: React.ReactNode;
  /** A 2px rule along the card's top edge, as the reference's accent variants. */
  accent?: "gold" | "mint" | "coral";
  className?: string;
}) {
  const accentClass =
    accent === "gold"
      ? "border-t-2 border-t-gold"
      : accent === "mint"
        ? "border-t-2 border-t-mint"
        : accent === "coral"
          ? "border-t-2 border-t-coral"
          : "";

  return (
    <div
      /* `data-accent` lets the hover rule in `globals.css` re-assert the top
         rule's colour — a plain `hover:border-*` utility would repaint it. */
      data-accent={accent}
      className={`card-lift rounded-lg border border-border bg-surface px-[26px] py-6 ${accentClass} ${className}`}
    >
      {children}
    </div>
  );
}

/** A card heading, with an optional trailing metadata chip. */
export function CardTitle({
  children,
  tag,
  className = "",
}: {
  children: React.ReactNode;
  tag?: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`mb-3.5 flex items-center gap-2 font-display text-[16.5px] font-semibold leading-snug text-text ${className}`}
    >
      {children}
      {tag != null ? (
        <span className="rounded-full bg-surface-2 px-2 py-[2px] font-mono text-[10.5px] font-medium text-text-faint">
          {tag}
        </span>
      ) : null}
    </h3>
  );
}

/** Uppercase micro-label used above grouped content and in the sidebar. */
export function MicroLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-faint ${className}`}
    >
      {children}
    </div>
  );
}

/** The pill used for codes, callsigns and other read-off-the-screen values. */
export function CodeChip({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-block rounded-full border border-border-strong bg-surface-2 px-[9px] py-[3px] font-mono text-[12px] font-semibold text-gold ${className}`}
    >
      {children}
    </span>
  );
}

/* Buttons: a 2px lift on hover, a slight press on click. `transform` is in the
   transition list so both read as motion rather than a snap, and `motion-safe`
   keeps the lift out of the way when reduced motion is on. */
export const BTN_GOLD =
  "inline-flex items-center justify-center rounded-full bg-gold px-5 py-[11px] text-[13.5px] font-semibold text-on-accent transition-[opacity,transform] duration-150 hover:opacity-[0.88] motion-safe:hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-40 disabled:hover:opacity-40 disabled:motion-safe:hover:translate-y-0";

export const BTN_OUTLINE =
  "inline-flex items-center justify-center rounded-full border border-border-strong bg-transparent px-5 py-[11px] text-[13.5px] font-semibold text-text transition-[color,border-color,transform] duration-150 hover:border-mint hover:text-mint motion-safe:hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-40";

export const BTN_MINT =
  "inline-flex items-center justify-center rounded-full border border-mint/30 bg-mint-soft px-4 py-2 text-[12.5px] font-semibold text-mint transition-[opacity,transform] duration-150 hover:opacity-[0.85] motion-safe:hover:-translate-y-0.5 active:scale-[0.97]";

export const BTN_DANGER =
  "inline-flex items-center justify-center rounded-full border border-coral/30 bg-coral-soft px-4 py-2 text-[12.5px] font-semibold text-coral transition-[opacity,transform] duration-150 hover:opacity-[0.85] motion-safe:hover:-translate-y-0.5 active:scale-[0.97]";

/* Fields: focus gets a soft translucent ring as well as the border colour, so
   the active field is legible at a glance without a hard outline. The ring uses
   the accent's own soft token, which is already theme-aware. */
export const FIELD =
  "w-full rounded-sm border border-border-strong bg-surface-2 px-3 py-2.5 text-[13.5px] text-text placeholder:text-text-faint transition-[border-color,box-shadow] focus:border-mint focus:shadow-[0_0_0_3px_var(--mint-soft)] focus:outline-none disabled:opacity-50";

/** A labelled form field, matching the reference's `.form-field`. */
export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[12px] font-semibold text-text-dim">
        {label}
      </span>
      {children}
    </label>
  );
}

/** A checkbox row, matching the reference's inline label styling. */
export function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-text-dim transition-colors hover:text-text">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 accent-gold"
      />
      {label}
    </label>
  );
}

/** The dark output panel every generator writes into. */
export function OutputBox({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`max-h-[300px] overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-border bg-bg-2 p-4 font-mono text-[11.5px] text-mint ${className}`}
    >
      {children}
    </div>
  );
}
