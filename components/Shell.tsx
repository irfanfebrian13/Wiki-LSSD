"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUp } from "lucide-react";

import type { Section } from "@/lib/types";

import { BottomNav } from "./BottomNav";
import { CommandPalette } from "./CommandPalette";
import { Cover } from "./Cover";
import { SectionView } from "./SectionView";
import { TabStrip } from "./TabStrip";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./Transmission";
import { replayReveal } from "./motion";
import { PocketbookProvider, usePocketbook } from "./pocketbook-context";
import { CHAPTERS, resolveHash, type Chapter } from "./presentation";

/* The URL hash, read as an external store. Using a server snapshot of "" keeps
   the server HTML and the hydration pass identical; the real hash is adopted
   immediately after, so `/#ten-codes` opens the right chapter on first paint
   without a client-only redirect.

   `history.replaceState` does not fire `hashchange`, so selecting a tab also
   dispatches `lssd:navigate` — that is what makes the store re-read and the
   derived chapter follow along. */
const NAVIGATE_EVENT = "lssd:navigate";

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener(NAVIGATE_EVENT, onChange);
  };
}

function readHash() {
  return window.location.hash.slice(1);
}

const readHashOnServer = () => "";

/**
 * The Field Manual shell.
 *
 * The provider is split from the consumer deliberately: calling
 * `usePocketbook` in the same component that renders `PocketbookProvider` would
 * read the context before it exists.
 */
export function Shell({ sections }: { sections: Section[] }) {
  return (
    <PocketbookProvider>
      <ShellInner sections={sections} />
    </PocketbookProvider>
  );
}

function ShellInner({ sections }: { sections: Section[] }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  const hash = useSyncExternalStore(subscribeToHash, readHash, readHashOnServer);

  /* The active chapter is derived, not stored: the hash is the single source of
     truth, so a deep link, a tab click and the palette all take the same path
     and cannot disagree. */
  const { chapter: activeChapter, sectionId } = useMemo(() => resolveHash(hash), [hash]);
  const activeSlug = activeChapter ? activeChapter.slug : null;

  /* Scroll to a section once its chapter has rendered. The section is not in
     the DOM until then, so this runs after the render that the hash caused. */
  useEffect(() => {
    if (!sectionId) return;
    const el = document.getElementById(sectionId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    replayReveal(el);
  }, [sectionId, activeSlug]);

  const selectChapter = useCallback((slug: string) => {
    // replaceState rather than pushState: tabs are shareable without piling up
    // history entries for every category the deputy glances at.
    try {
      history.replaceState(null, "", `#${slug}`);
    } catch {
      // A sandboxed document can refuse this; navigation still works.
    }
    window.dispatchEvent(new Event(NAVIGATE_EVENT));
    window.scrollTo(0, 0);
  }, []);

  const openFromPalette = useCallback((targetSectionId: string | null, slug: string) => {
    try {
      history.replaceState(null, "", `#${targetSectionId ?? slug}`);
    } catch {
      // As above.
    }
    window.dispatchEvent(new Event(NAVIGATE_EVENT));
  }, []);

  /* ---------- Keyboard shortcuts ---------- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (e.key === "/" && !typing && !paletteOpen) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [paletteOpen]);

  return (
    <>
      <ReadingProgress />

      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-sm focus:border focus:border-gold focus:bg-surface focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:text-text"
      >
        Lompat ke konten
      </a>

      {/* The band and the tab strip are one sticky unit, so both stay pinned and
          the active tab overlaps the strip's own bottom border. */}
      <header className="app-header sticky top-0 z-40 bg-bg-2 pt-[env(safe-area-inset-top,0px)]">
        <HeaderBand
          onHome={() => selectChapter("")}
          onSearch={() => setPaletteOpen(true)}
        />
        <TabStrip chapters={CHAPTERS} activeSlug={activeSlug} onSelect={selectChapter} />
      </header>

      <main id="content" className="relative z-10">
        <div className="mx-auto w-full max-w-[1080px] px-4 pb-[100px] pt-6 min-[760px]:px-6 min-[760px]:pb-24 min-[760px]:pt-10">
          {activeChapter === null ? (
            <Cover chapters={CHAPTERS} onSelect={selectChapter} />
          ) : (
            <div>
              <ChapterHeader chapter={activeChapter} />

              {/* One toggle for the whole radio chapter, not one per script —
                  the state is shared, so 21 toggles would only add noise. */}
              {activeChapter.name === "Radio" ? (
                <div className="mb-6">
                  <LanguageToggle />
                </div>
              ) : null}

              <div className="grid gap-14">
                {activeChapter.sections.map((section) => (
                  <SectionView key={section.id} section={section} />
                ))}
              </div>
            </div>
          )}

          <footer className="mt-14 border-t border-border pt-[18px]">
            <p className="text-[11.5px] text-text-faint">
              LSSD Deputy Pocketbook — disusun dari dokumen internal.
            </p>
          </footer>
        </div>
      </main>

      <BottomNav activeSlug={activeSlug} onSelect={selectChapter} />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        /* Every section, not just the rendered chapter's — search has to reach
           across categories, or it would only ever find what is on screen. */
        sections={sections}
        chapters={CHAPTERS}
        onNavigate={openFromPalette}
      />

      <BackToTop />
    </>
  );
}

/** The chapter's page header: 68px amber numeral, 38px title, 3px double rule. */
function ChapterHeader({ chapter }: { chapter: Chapter }) {
  return (
    <div className="mb-6 flex items-start gap-5 border-b-[3px] border-double border-border pb-4">
      <span className="font-display text-[68px] font-extrabold leading-[0.9] tracking-[-0.03em] text-gold">
        {String(chapter.index).padStart(2, "0")}
      </span>
      <h1 className="font-display text-[38px] font-semibold leading-[1.15] tracking-[-0.01em] text-text">
        {chapter.name}
      </h1>
    </div>
  );
}

/** The sticky band: badge, wordmark, credit, callsign, search and theme. */
function HeaderBand({
  onHome,
  onSearch,
}: {
  onHome: () => void;
  onSearch: () => void;
}) {
  const { callsign, setCallsign } = usePocketbook();

  return (
    <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-4 px-4 py-2.5 min-[760px]:px-6">
      <button
        type="button"
        onClick={onHome}
        className="flex items-center gap-3 text-left"
        aria-label="Ke halaman depan"
      >
        <StarBadge />
        <span>
          <b className="block font-display text-[19px] font-semibold leading-tight text-text">
            LSSD Pocketbook
          </b>
          <small className="block text-[12px] text-text-dim">
            Handbook by Brian Putra
          </small>
        </span>
      </button>

      <div className="flex items-center gap-2.5">
        <label className="hidden items-center gap-2 font-mono text-[12px] text-text-dim min-[760px]:flex">
          Callsign
          <input
            type="text"
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            placeholder="61-Robert-210"
            autoComplete="off"
            spellCheck={false}
            className="w-[128px] border-b border-border-strong bg-transparent px-0.5 py-1 font-mono text-[13px] text-text placeholder:text-text-faint focus:border-gold focus:outline-none"
          />
        </label>

        <button
          type="button"
          onClick={onSearch}
          aria-label="Cari"
          className="inline-flex items-center gap-2 rounded-sm border border-border-strong px-2.5 py-1.5 font-mono text-[12px] font-medium text-text-dim transition-colors hover:border-gold hover:text-gold"
        >
          Cari
          <kbd className="hidden font-mono text-[11px] opacity-70 min-[760px]:inline">
            Ctrl K
          </kbd>
        </button>

        <ThemeToggle />
      </div>
    </div>
  );
}

/** The six-point star badge, in amber. The inner circles punch through to the
 *  band colour, exactly as the prototype does. */
function StarBadge() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 64 64"
      aria-hidden
      className="shrink-0 text-gold"
    >
      <g fill="currentColor">
        <polygon points="32,6 38.5,20.7 54.5,19 45,32 54.5,45 38.5,43.3 32,58 25.5,43.3 9.5,45 19,32 9.5,19 25.5,20.7" />
        <circle cx="32" cy="5" r="3.4" />
        <circle cx="55.5" cy="18.5" r="3.4" />
        <circle cx="55.5" cy="45.5" r="3.4" />
        <circle cx="32" cy="59" r="3.4" />
        <circle cx="8.5" cy="45.5" r="3.4" />
        <circle cx="8.5" cy="18.5" r="3.4" />
      </g>
      <circle cx="32" cy="32" r="8.5" fill="none" stroke="var(--bg-2)" strokeWidth="2" />
      <circle cx="32" cy="32" r="3" fill="var(--bg-2)" />
    </svg>
  );
}

/** A hairline bar across the very top of the viewport, filled by scroll depth.
 *
 *  Written straight to the element's `transform` rather than held in state: a
 *  progress bar changes on every scroll frame, and routing that through
 *  `setState` would re-render the shell — and with it the whole section tree —
 *  60 times a second while scrolling. The scroll listener is coalesced into one
 *  `requestAnimationFrame`, so a burst of scroll events costs a single write.
 *
 *  `scaleX` rather than `width` keeps the work on the compositor, so filling it
 *  never triggers layout. */
function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      // The scrollable distance, not the full document height: at the bottom
      // of the page `scrollY` equals this, so the bar lands exactly at 100%.
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? Math.min(doc.scrollTop / max, 1) : 0;
      el.style.transform = `scaleX(${ratio})`;
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
  }, []);

  return (
    <div
      aria-hidden
      className="reading-progress fixed inset-x-0 top-0 z-[45] h-[3px] bg-transparent"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-gold"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/** Appears once the page has scrolled past the first screen or so. */
function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let frame = 0;

    /* Coalesced into one frame like the progress bar: this listener and that
       one both fire on every scroll event, and neither needs to run more than
       once per painted frame. */
    const update = () => {
      frame = 0;
      setShown(window.scrollY > 600);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          // Smooth unconditionally: the pocketbook's motion is not gated on the
          // OS setting, and the CSS smooth-scroll it matches is always on too.
          behavior: "smooth",
        })
      }
      aria-label="Kembali ke atas"
      /* Hidden by `visibility` as well as opacity so it is out of the tab order
         and unreachable by screen readers while off-screen — an invisible but
         focusable button is a real trap for keyboard users.

         Sits above the mobile bottom nav below 760px, and higher still than the
         generator's floating "n pasal" button: the two are both pinned to the
         bottom right, and stacking them at the same offset would let this one
         swallow the other's taps. */
      className={`back-to-top fixed right-5 z-30 grid h-10 w-10 place-items-center rounded-sm border border-border-strong bg-surface text-text transition-[opacity,transform,visibility] duration-200 hover:border-gold hover:text-gold bottom-[calc(132px+env(safe-area-inset-bottom,0px))] min-[760px]:bottom-5 ${
        shown
          ? "visible translate-y-0 opacity-100"
          : "invisible pointer-events-none translate-y-2.5 opacity-0"
      }`}
    >
      <ArrowUp aria-hidden size={16} strokeWidth={2} />
    </button>
  );
}
