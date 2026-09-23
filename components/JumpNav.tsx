"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ListTree, X } from "lucide-react";

import type { Section } from "@/lib/types";

/* ============================================================================
   The Sub-Chapter / Jump-To navigator.

   One reusable component, driven entirely by the sections the shell already
   has: it is handed the active chapter's `Section[]` and derives its own menu
   from `id` + `title`. Nothing is duplicated for it, no page lists its own
   entries, and it adds no ids — the targets are the `id` on each
   `SectionView`'s `<section>`, which already exist and are already the
   published deep links.

   It is only ever mounted for a *stacked* chapter, where several sections
   share one scrolling page. A view chapter (Form Helper) shows one section at
   a time behind `SubNav`, so there is nothing to jump between — the shell
   simply does not render this there.

   Three shapes, one behaviour:

     ≥1440px  a fixed panel down the right of the content
     <1440px  a small "Loncat ke" button that opens the same list as a drawer

   The breakpoint is set by geometry, not taste. The content column is a
   1080px maximum, centred, so its right edge sits at `W/2 + 540`. The panel is
   anchored to that column rather than to the window edge — `50% + 548px` puts
   its left edge 8px clear of the content at *every* width, so the gutter is
   constant instead of opening into a wide empty gap on a large monitor. Its
   own 168px then runs to `W/2 + 716`, which fits the viewport from W = 1432
   up; 1440 is the first round breakpoint above that. Below it the two would
   overlap, so the list moves behind a button instead — which is also the right
   answer on a tablet, where a floating panel would eat the width the content
   needs.
   ========================================================================= */

/**
 * The scroll-spy's detection line, in px from the viewport top.
 *
 * It has to be the line a jump actually lands a section on, so that a section
 * becomes "current" at the same moment a click would put it there. That
 * position is the document's `scroll-padding-top` plus the section's own
 * `scroll-margin-top` — both already declared (`globals.css` and
 * `SectionView`), and both read at runtime rather than copied here, because a
 * second copy of the number is exactly what would drift out of step. This
 * fallback only applies if neither is set.
 */
const FALLBACK_DETECTION_LINE = 104;

/** A chapter this short gains nothing from a menu of it. */
const MIN_ITEMS = 2;

/**
 * How long a click's own highlight is left alone while its smooth scroll runs.
 *
 * Without this the spy re-reports every section the scroll passes through and
 * the highlight sweeps the whole list before settling. The scroll is a few
 * hundred ms; this covers it with room to spare.
 */
const SCROLL_LOCK_MS = 700;

const HEADING_ID = "jump-nav-heading";

interface JumpItem {
  id: string;
  title: string;
}

export function JumpNav({ sections }: { sections: Section[] }) {
  const items = useMemo<JumpItem[]>(
    () => sections.map((section) => ({ id: section.id, title: section.title })),
    [sections],
  );

  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const [open, setOpen] = useState(false);
  const lockedUntil = useRef(0);

  /* --------------------------------------------------------------------------
     Scroll spy.

     IntersectionObserver is the usual tool for this, but it cannot express the
     one rule that matters here — "the current section is the last one whose top
     has crossed the line" — without extra bookkeeping for the end of the page,
     where a short final section may never enter an observer band at all. So
     this reads the rects directly instead: a dozen cheap reads, coalesced into
     one per painted frame exactly like `ReadingProgress` and `BackToTop`, which
     is the idiom the rest of the shell already uses.
     ------------------------------------------------------------------------ */
  useEffect(() => {
    const els = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    /* Where a jump lands a section: the document's scroll padding plus the
       section's own scroll margin, read from the CSS that already sets them
       rather than restated here. Read once — both are static. */
    const line = (() => {
      const html = getComputedStyle(document.documentElement);
      const pad = parseFloat(html.scrollPaddingTop);
      const margin = parseFloat(getComputedStyle(els[0]).scrollMarginTop);
      const total = (Number.isNaN(pad) ? 0 : pad) + (Number.isNaN(margin) ? 0 : margin);
      return total > 0 ? total : FALLBACK_DETECTION_LINE;
    })();

    let frame = 0;

    const update = () => {
      frame = 0;

      /* A click owns the highlight until its scroll has landed. */
      if (window.performance.now() < lockedUntil.current) return;

      /* `items` is in data order, which is document order, so the last element
         at or above the line is the current one. No early exit: walking all of
         them costs nothing and keeps this correct if the order ever shifts. */
      let current = els[0].id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }

      /* At the very bottom the last section may still sit below the line, so
         the page cannot be scrolled far enough to select it. Pin it by hand. */
      const doc = document.documentElement;
      if (doc.scrollTop + doc.clientHeight >= doc.scrollHeight - 2) {
        current = els[els.length - 1].id;
      }

      setActiveId((prev) => (prev === current ? prev : current));
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [items]);

  const jump = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    /* `scrollIntoView` honours the section's own `scroll-margin-top` on top of
       the document's `scroll-padding-top`, so this lands exactly where the
       shell's own navigation lands — the same 172px the spy counts from. The
       scroll is smooth because `html` carries `scroll-behavior: smooth`. */
    el.scrollIntoView({ behavior: "smooth", block: "start" });

    lockedUntil.current = window.performance.now() + SCROLL_LOCK_MS;
    setActiveId(id);
    setOpen(false);

    /* The hash is updated so the address stays shareable, but with
       `replaceState` and no `lssd:navigate` event: dispatching it would make
       the shell re-resolve the chapter and scroll the page again, and this
       navigation is already done. It also keeps the back button out of it,
       which is the same choice `Shell.navigate` makes for tabs. */
    try {
      history.replaceState(null, "", `#${id}`);
    } catch {
      // A sandboxed document can refuse this; the jump still works.
    }
  }, []);

  /* The drawer is a dialog, so Escape has to close it. */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (items.length < MIN_ITEMS) return null;

  const list = (
    <JumpList items={items} activeId={activeId} onJump={jump} />
  );

  return (
    <>
      {/* ---- Desktop: the panel ----
          Anchored to the content column (`50% + 548px`) rather than the window
          edge, so its gutter is the same 8px on every screen instead of
          ballooning on a wide monitor. */}
      <nav
        aria-label="Loncat ke bagian"
        className="jump-nav fixed left-[calc(50%+548px)] top-[132px] z-30 hidden w-[168px] max-h-[calc(100vh-164px)] flex-col overflow-hidden rounded-sm border border-outline bg-surface min-[1440px]:flex"
      >
        <JumpHeader count={items.length} />
        <div className="overflow-y-auto">{list}</div>
      </nav>

      {/* ---- Below the panel breakpoint: the button ---- */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="jump-nav-drawer"
        /* Sits above `BackToTop` in the same bottom-right corner: that button
           owns `bottom-[132px]` on mobile and `bottom-5` from 760px up, so this
           clears whichever of the two is in play. */
        className="jump-nav fixed right-5 z-30 inline-flex items-center gap-2 rounded-sm border border-outline bg-surface px-3 py-2 font-mono text-[12px] font-medium text-text transition-colors duration-150 hover:border-gold hover:text-gold bottom-[calc(184px+env(safe-area-inset-bottom,0px))] min-[760px]:bottom-[68px] min-[1440px]:hidden"
      >
        <ListTree aria-hidden size={15} strokeWidth={2} />
        Loncat ke
      </button>

      {/* ---- The drawer the button opens ---- */}
      {open ? (
        <div
          className="jump-nav fixed inset-0 z-50 flex justify-end bg-black/50 min-[1440px]:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            id="jump-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby={HEADING_ID}
            className="flex h-full w-[min(320px,86vw)] flex-col border-l border-outline bg-surface"
          >
            <JumpHeader count={items.length} headingId={HEADING_ID} onClose={() => setOpen(false)} />
            <div className="overflow-y-auto">{list}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** The panel's title bar: `LONCAT KE`, the item count, and a close button. */
function JumpHeader({
  count,
  headingId,
  onClose,
}: {
  count: number;
  headingId?: string;
  onClose?: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-outline bg-tx px-3 py-2">
      <b
        id={headingId}
        className="flex-1 font-cond text-[12px] font-medium uppercase tracking-[0.09em] text-on-tx"
      >
        Loncat Ke
      </b>
      <span className="font-mono text-[11px] text-on-tx opacity-60">{count}</span>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="-mr-1 shrink-0 rounded-sm border border-current p-1 text-on-tx opacity-70 transition-opacity hover:opacity-100"
        >
          <X aria-hidden size={13} strokeWidth={2} />
        </button>
      ) : null}
    </div>
  );
}

/** The numbered sub-chapter list, shared by the panel and the drawer. */
function JumpList({
  items,
  activeId,
  onJump,
}: {
  items: JumpItem[];
  activeId: string | null;
  onJump: (id: string) => void;
}) {
  return (
    <ol className="m-0 list-none p-0">
      {items.map((item, i) => {
        const active = item.id === activeId;
        return (
          <li key={item.id} className="border-b border-border last:border-b-0">
            <button
              type="button"
              onClick={() => onJump(item.id)}
              aria-current={active ? "true" : undefined}
              /* The active rule is a 2px left border rather than a filled
                 block: the same accent the content's own notes use, so the
                 highlight reads as one more hairline in the page's language. */
              className={`flex w-full items-baseline gap-2.5 border-l-2 px-3 py-2 text-left transition-colors duration-150 ${
                active
                  ? "border-l-gold bg-gold-soft"
                  : "border-l-transparent hover:bg-surface-2"
              }`}
            >
              <span
                aria-hidden
                className={`w-[18px] shrink-0 font-mono text-[11px] ${
                  active ? "text-gold" : "text-text-faint"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`text-[12.5px] leading-snug ${
                  active ? "font-semibold text-text" : "text-text-dim"
                }`}
              >
                {item.title}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
