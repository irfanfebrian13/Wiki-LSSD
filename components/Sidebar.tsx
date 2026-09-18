"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { NavGroup } from "@/lib/types";

/** Sections worth one-tap access — the ones deputies reach for mid-shift.
    `target` is the section to scroll to; `label` identifies the chip. They are
    separate fields because two chips may point at the same section. */
const QUICK_JUMPS = [
  { label: "Ten Codes", target: "ten-codes" },
  { label: "Radio", target: "radio-basics" },
  { label: "Penal Code", target: "penal-robbery" },
  { label: "Weapons Class", target: "senjata-illegal" },
  { label: "Patrol Generator", target: "patrol-report" },
];

/**
 * Reveal a nav link inside the sidebar's own scroll box.
 *
 * Deliberately not `scrollIntoView`: that walks every scrollable ancestor, so
 * revealing the link would also scroll the page and fight the section jump the
 * click just started. Touching only the container's scrollTop keeps the two
 * movements independent. When the link is already comfortably in view this is
 * a no-op, so it never nudges the list while the deputy is reading it.
 */
function revealInSidebar(el: HTMLElement) {
  let container: HTMLElement | null = el.parentElement;
  while (container && container !== document.body) {
    const { overflowY } = getComputedStyle(container);
    if (overflowY === "auto" || overflowY === "scroll") break;
    container = container.parentElement;
  }
  if (!container || container === document.body) return;

  const pad = 12;
  const elRect = el.getBoundingClientRect();
  const boxRect = container.getBoundingClientRect();

  if (elRect.top < boxRect.top + pad) {
    container.scrollTop -= boxRect.top + pad - elRect.top;
  } else if (elRect.bottom > boxRect.bottom - pad) {
    container.scrollTop += elRect.bottom - (boxRect.bottom - pad);
  }
}

/** The group dots: a fixed cycle so every group reads as a distinct category. */
const GROUP_DOTS = ["bg-gold", "bg-mint", "bg-coral"];

interface SidebarProps {
  groups: NavGroup[];
  /** Ids currently matching the search query. */
  visibleIds: Set<string>;
  activeId: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  onNavigate: (id: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export function Sidebar({
  groups,
  visibleIds,
  activeId,
  query,
  onQueryChange,
  onNavigate,
  searchInputRef,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    const collapsedSet = new Set<string>();
    groups.forEach((group) => collapsedSet.add(group.name));
    return collapsedSet;
  });
  /* `tick` makes every click a distinct value, so re-clicking the same chip
     still re-runs the reveal effect. */
  const [reveal, setReveal] = useState<{ id: string; tick: number } | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const baseId = useId();

  const toggleGroup = (name: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  /** Navigate, expanding the destination's group so its link exists to reveal. */
  const navigateTo = (id: string) => {
    onNavigate(id);

    const group = groups.find((g) => g.items.some((s) => s.id === id));
    if (group) {
      setCollapsed((prev) => {
        if (!prev.has(group.name)) return prev;
        const next = new Set(prev);
        next.delete(group.name);
        return next;
      });
    }

    setReveal((prev) => ({ id, tick: (prev?.tick ?? 0) + 1 }));
  };

  /* Runs after the commit, so the link is in the DOM (and its group expanded)
     by the time we look for it. This only writes to the DOM — the group
     expansion above is a user-event update, never a setState from in here. */
  useEffect(() => {
    if (!reveal) return;
    const el = navRef.current?.querySelector<HTMLElement>(
      `[data-nav-id="${reveal.id}"]`,
    );
    if (el) revealInSidebar(el);
  }, [reveal]);

  const isSearching = query.trim().length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 pb-4 pt-[22px]">
        <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold to-[#e0a83e] font-display text-[15px] font-bold text-on-accent">
          LS
        </div>
        <div className="min-w-0">
          <div className="font-display text-[16.5px] font-bold leading-tight text-text">
            LSSD Pocketbook
          </div>
          <div className="mt-px text-[11px] text-text-dim">Deputy Handbook</div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3.5">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Cari materi… (mis. 10-4, miranda)"
            aria-label="Cari di pocketbook"
            autoComplete="off"
            className="w-full rounded-sm border border-border bg-surface-2 py-[9px] pl-3 pr-11 text-[13px] text-text placeholder:text-text-faint focus:border-gold focus:outline-none"
          />
          <kbd
            aria-hidden
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm border border-border bg-surface px-1.5 py-px font-mono text-[10px] text-text-faint"
          >
            /
          </kbd>
        </div>
      </div>

      {!isSearching ? (
        <div className="mb-1 flex flex-wrap gap-1.5 px-4 pb-3.5">
          {QUICK_JUMPS.map((jump) => (
            <a
              key={jump.label}
              href={`#${jump.target}`}
              onClick={() => navigateTo(jump.target)}
              className="rounded-full border border-border bg-surface-2 px-2.5 py-1 font-mono text-[10.5px] font-medium text-text-dim transition-colors hover:border-gold hover:text-gold"
            >
              {jump.label}
            </a>
          ))}
        </div>
      ) : null}

      {/* Navigation */}
      <nav ref={navRef} aria-label="Bagian pocketbook" className="flex-1 px-3 pb-4">
        {groups.map((group, gi) => {
          const items = group.items.filter((s) => visibleIds.has(s.id));
          if (items.length === 0) return null;

          const isCollapsed = collapsed.has(group.name);
          const panelId = `${baseId}-${group.name}`;

          return (
            <div key={group.name} className="mt-4 first:mt-0">
              <button
                type="button"
                onClick={() => toggleGroup(group.name)}
                aria-expanded={!isCollapsed}
                aria-controls={panelId}
                className="mb-1.5 flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-faint transition-colors hover:text-text-dim"
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${GROUP_DOTS[gi % GROUP_DOTS.length]}`}
                />
                {group.name}
                <span aria-hidden className="ml-auto text-[9px]">
                  {isCollapsed ? "▸" : "▾"}
                </span>
              </button>

              <ul id={panelId} hidden={isCollapsed} className="grid gap-px">
                {items.map((section) => {
                  const active = section.id === activeId;
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        data-nav-id={section.id}
                        aria-current={active ? "true" : undefined}
                        onClick={() => navigateTo(section.id)}
                        className={`flex w-full items-center gap-2.5 rounded-sm px-3 py-[9px] text-[13.5px] font-medium transition-colors ${
                          active
                            ? "bg-gold-soft font-semibold text-gold"
                            : "text-text-dim hover:bg-surface-2 hover:text-text"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`w-4 shrink-0 text-center text-[12px] ${
                            active ? "text-gold" : "opacity-70"
                          }`}
                        >
                          {section.icon}
                        </span>
                        <span className="truncate">{section.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex items-center gap-2.5 border-t border-border px-5 pb-[18px] pt-3.5">
        <div
          aria-hidden
          className="h-[30px] w-[30px] shrink-0 rounded-[9px] bg-gradient-to-br from-mint to-[#3fc7ae]"
        />
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-text">LSSD</div>
          <div className="font-mono text-[11px] text-text-faint">Internal Use</div>
        </div>
      </div>
    </div>
  );
}
