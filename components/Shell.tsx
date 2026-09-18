"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { buildSearchIndex, matchSections } from "@/lib/search";
import type { NavGroup, Section } from "@/lib/types";

import { Hero } from "./Hero";
import { SectionView } from "./SectionView";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";

/** Below this width the sidebar becomes an overlay drawer. */
const MOBILE_QUERY = "(max-width: 900px)";

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
  }, []);

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-sm focus:border focus:border-accent focus:bg-surface focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:text-text"
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
          className="flex flex-col gap-1 rounded-sm border border-border bg-surface p-2"
        >
          <span className="block h-px w-4 bg-text" />
          <span className="block h-px w-4 bg-text" />
          <span className="block h-px w-4 bg-text" />
        </button>

        <div className="flex items-center gap-2 font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-text">
          <span aria-hidden className="h-1.5 w-1.5 bg-accent" />
          LSSD Pocketbook
        </div>

        <ThemeToggle />
      </header>

      {/* Desktop theme toggle — the mobile one lives in the topbar. */}
      <div className="fixed right-5 top-5 z-30 hidden lg:block">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex">
        {/* Sidebar — drawer on mobile, fixed column from lg up */}
        <aside
          id="sidebar"
          className={`fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto border-r border-border bg-bg-2 px-3 py-4 transition-transform duration-300 lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:translate-x-0 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            groups={groups}
            visibleIds={visibleIds}
            activeId={activeId}
            query={query}
            onQueryChange={setQuery}
            onNavigate={handleNavigate}
            searchInputRef={searchInputRef}
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
          <div className="mx-auto w-full max-w-[900px] px-5 pb-10 pt-8 lg:px-10 lg:pt-12">
            {!isSearching ? <Hero meta={heroStats} /> : null}

            {isSearching && visibleIds.size === 0 ? (
              <div className="py-20 text-center">
                <div aria-hidden className="mb-3 font-mono text-3xl text-text-faint">
                  ⌕
                </div>
                <p className="text-text-dim">
                  Tidak ada hasil untuk &ldquo;
                  <span className="font-mono text-text">{query.trim()}</span>
                  &rdquo;
                </p>
              </div>
            ) : null}

            <div className="grid gap-12">
              {sections.map((section, index) => (
                <div key={section.id} hidden={!visibleIds.has(section.id)}>
                  <SectionView
                    section={section}
                    index={index}
                    onMount={registerSection}
                  />
                </div>
              ))}
            </div>

            <footer className="mt-14 border-t border-border-soft pt-5">
              <p className="font-mono text-[11px] text-text-faint">
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

/** Appears once the page has scrolled past the first screen or so. */
function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Kembali ke atas"
      className={`fixed bottom-5 right-5 z-30 grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-[16px] text-text transition-all duration-200 hover:border-accent hover:text-accent ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2.5 opacity-0"
      }`}
    >
      ↑
    </button>
  );
}
