"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUp, Search, SearchX } from "lucide-react";

import { buildSearchIndex, matchSections } from "@/lib/search";
import type { NavGroup, Section } from "@/lib/types";

import { Hero } from "./Hero";
import { SectionView } from "./SectionView";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { replayReveal, prefersReducedMotion } from "./motion";

/**
 * Below this width the sidebar becomes an overlay drawer.
 *
 * Deliberately the same 1024px as Tailwind's `lg` breakpoint, which every
 * `lg:` class below uses. The two must agree: if the media query and the CSS
 * disagreed, there would be a band of widths where the topbar is hidden but the
 * sidebar is still off-canvas — leaving no navigation at all.
 */
const MOBILE_QUERY = "(max-width: 1023px)";

/* The URL hash, read as an external store. Using a server snapshot of "" keeps
   the server HTML and the hydration pass identical; the real hash is adopted
   immediately after, so `/#ten-codes` highlights the right nav entry before the
   IntersectionObserver has had a chance to fire. */
function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function readHash() {
  return window.location.hash.slice(1);
}

const readHashOnServer = () => "";

function groupSections(sections: Section[]): NavGroup[] {
  const groups: NavGroup[] = [];
  for (const section of sections) {
    let group = groups.find((g) => g.name === section.group);
    if (!group) {
      group = { name: section.group, items: [] };
      groups.push(group);
    }
    group.items.push(section);
  }
  return groups;
}

export function Shell({ sections }: { sections: Section[] }) {
  const [query, setQuery] = useState("");
  const [scrollActiveId, setScrollActiveId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const sectionEls = useRef(new Map<string, HTMLElement>());

  const hash = useSyncExternalStore(subscribeToHash, readHash, readHashOnServer);

  const groups = useMemo(() => groupSections(sections), [sections]);
  const searchIndex = useMemo(() => buildSearchIndex(sections), [sections]);
  const visibleIds = useMemo(
    () => matchSections(sections, searchIndex, query),
    [sections, searchIndex, query],
  );

  const isSearching = query.trim().length > 0;

  // The active nav entry is derived, not stored: the scroll observer supplies a
  // candidate, and this picks whichever is still valid for the current view.
  // Deriving it means a filter that hides the active section immediately falls
  // back to the first visible one, instead of briefly highlighting a link that
  // is no longer rendered.
  const activeId = useMemo(() => {
    if (scrollActiveId && visibleIds.has(scrollActiveId)) return scrollActiveId;
    if (hash && visibleIds.has(hash)) return hash;
    return isSearching ? ([...visibleIds][0] ?? null) : null;
  }, [scrollActiveId, visibleIds, hash, isSearching]);

  const heroStats = useMemo(() => {
    const tenCodes = sections.find((s) => s.id === "ten-codes");
    const table = tenCodes?.blocks.find((b) => b.type === "table");
    return {
      sections: sections.length,
      tenCodes: table && table.type === "table" ? table.rows.length : 0,
      groups: groups.length,
    };
  }, [sections, groups]);

  /* ---------- Section registration for scroll-spy ---------- */
  const registerSection = useCallback((id: string, el: HTMLElement | null) => {
    if (el) sectionEls.current.set(id, el);
    else sectionEls.current.delete(id);
  }, []);

  /* ---------- Scroll-spy ---------- */
  useEffect(() => {
    if (isSearching) return;

    // Track every intersecting section with its viewport position, then pick
    // the topmost. The naive "last entry wins" approach is non-deterministic:
    // a fast scroll can deliver several entries in one callback batch, and the
    // winner becomes callback order rather than document order.
    const intersecting = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            intersecting.set(id, entry.boundingClientRect.top);
          } else {
            intersecting.delete(id);
          }
        }

        // At the very bottom of the page the last section can sit below the
        // activation band and never intersect, leaving the nav stuck on the
        // second-to-last item. Force the final visible section active there.
        const atBottom =
          window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 2;
        if (atBottom) {
          const last = [...visibleIds].at(-1);
          if (last) {
            setScrollActiveId(last);
            return;
          }
        }

        const topmost = [...intersecting.entries()].sort(
          (a, b) => a[1] - b[1],
        )[0];
        if (topmost) setScrollActiveId(topmost[0]);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    for (const el of sectionEls.current.values()) observer.observe(el);
    return () => observer.disconnect();
  }, [isSearching, visibleIds]);

  /* ---------- Keyboard shortcuts ---------- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (target === searchInputRef.current) {
          setQuery("");
          searchInputRef.current?.blur();
        }
        setDrawerOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ---------- Close the drawer when leaving mobile width ---------- */
  useEffect(() => {
    if (!drawerOpen) return;
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => {
      if (!mql.matches) setDrawerOpen(false);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [drawerOpen]);

  /* ---------- Lock body scroll while the drawer is open ---------- */
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const handleNavigate = useCallback((id: string) => {
    setDrawerOpen(false);
    // Highlight immediately rather than waiting for the smooth scroll to bring
    // the section into the observer's activation band.
    setScrollActiveId(id);

    /* Replay the destination's staggered entrance. This fires only on a
       deliberate jump (nav entry, quick-jump chip, hash link) — never on
       scroll-spy, so scrolling past a section does not re-animate it, and never
       on a keystroke, so typing in the search box does not restart the page. */
    replayReveal(sectionEls.current.get(id) ?? null);
  }, []);

  return (
    <>
      <ReadingProgress />

      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-sm focus:border focus:border-gold focus:bg-surface focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:text-text"
      >
        Lompat ke konten
      </a>

      {/* Mobile topbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-bg/90 px-4 py-2.5 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen((v) => !v)}
          aria-expanded={drawerOpen}
          aria-controls="sidebar"
          aria-label="Buka navigasi"
          className="flex flex-col gap-1 rounded-sm border border-border-strong bg-surface p-2"
        >
          <span className="block h-px w-4 bg-text" />
          <span className="block h-px w-4 bg-text" />
          <span className="block h-px w-4 bg-text" />
        </button>

        <div className="flex items-center gap-2 font-display text-[13px] font-bold text-text">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />
          LSSD Pocketbook
        </div>

        <ThemeToggle />
      </header>

      {/* Desktop theme toggle — the mobile one lives in the topbar. */}
      <div className="fixed right-5 top-5 z-30 hidden lg:block">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex">
        {/* Sidebar — off-canvas drawer below `lg`, a flush full-height column
            from `lg` up. The right border is the only edge rule at every width. */}
        <aside
          id="sidebar"
          className={`sidebar-enter fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto rounded-none border-r border-border bg-surface transition-transform duration-300 lg:sticky lg:bottom-auto lg:top-0 lg:z-10 lg:h-screen lg:w-[264px] lg:translate-x-0 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            groups={groups}
            visibleIds={visibleIds}
            activeId={activeId}
            query={query}
            onNavigate={handleNavigate}
          />
        </aside>

        {drawerOpen ? (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
        ) : null}

        <main id="content" className="min-w-0 flex-1">
          {/* Search — sticky, top-center. Owned here rather than in the sidebar
              because this is where `query`/`setQuery` live: the same state still
              drives both the section filter below and the sidebar nav's own
              filtering, so relocating the input changed nothing about what it
              filters. The wrapper spans the content column so its frosted
              backdrop covers the full width, while the field itself stays
              centered and capped. On mobile it parks directly under the sticky
              topbar; from `lg` up there is no topbar, so it pins to the top. */}
          <div className="sticky top-[59px] z-20 bg-bg/90 px-[18px] py-3 backdrop-blur lg:top-0 lg:px-11">
            <div className="relative mx-auto w-full max-w-[500px]">
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari materi…"
                aria-label="Cari di pocketbook"
                autoComplete="off"
                className="w-full rounded-sm border border-border bg-surface-2 py-[9px] pl-3 pr-11 text-[13px] text-text placeholder:text-text-faint focus:border-gold focus:outline-none"
              />
              <Search
                aria-hidden
                size={14}
                strokeWidth={2}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-faint"
              />
            </div>
          </div>

          <div className="mx-auto w-full max-w-[900px] px-[18px] pb-[60px] pt-5 lg:px-11 lg:pb-20 lg:pt-7">
            {!isSearching ? <Hero meta={heroStats} /> : null}

            {isSearching && visibleIds.size === 0 ? (
              <div className="py-20 text-center">
                <SearchX
                  aria-hidden
                  size={30}
                  strokeWidth={2}
                  className="mx-auto mb-3 text-text-faint"
                />
                <p className="text-text-dim">
                  Tidak ada hasil untuk &ldquo;
                  <span className="font-mono text-text">{query.trim()}</span>
                  &rdquo;
                </p>
              </div>
            ) : null}

            <div className="grid gap-16">
              {sections.map((section) => (
                <div key={section.id} hidden={!visibleIds.has(section.id)}>
                  <SectionView
                    section={section}
                    onMount={registerSection}
                  />
                </div>
              ))}
            </div>

            <footer className="mt-12 border-t border-border pt-[18px]">
              <p className="text-[11.5px] text-text-faint">
                LSSD Deputy Pocketbook — disusun dari dokumen internal.
              </p>
            </footer>
          </div>
        </main>
      </div>

      <BackToTop />
    </>
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
      /* Above the sticky topbar and the drawer scrim, below the sidebar drawer
         itself, so it is never hidden behind the header it sits on. */
      className="fixed inset-x-0 top-0 z-[45] h-[3px] bg-transparent"
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
          // Honor the OS setting here too: the CSS rule that disables smooth
          // scrolling covers anchor jumps, but not this programmatic call.
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        })
      }
      aria-label="Kembali ke atas"
      /* Hidden by `visibility` as well as opacity so it is out of the tab order
         and unreachable by screen readers while off-screen — an invisible but
         focusable button is a real trap for keyboard users. */
      className={`fixed bottom-5 right-5 z-30 grid h-10 w-10 place-items-center rounded-full border border-border-strong bg-surface text-text transition-[opacity,transform,visibility] duration-200 hover:border-gold hover:text-gold ${
        shown
          ? "visible translate-y-0 opacity-100"
          : "invisible pointer-events-none translate-y-2.5 opacity-0"
      }`}
    >
      <ArrowUp aria-hidden size={16} strokeWidth={2} />
    </button>
  );
}
