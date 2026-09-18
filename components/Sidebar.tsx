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
    groups.forEach(group => collapsedSet.add(group.name));
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
      <div className="flex items-center gap-3 px-2 pb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sheriff.png"
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 object-contain"
        />
        <div>
          <div className="text-[17px] font-extrabold leading-tight tracking-[0.02em] text-text">
            LSSD
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-faint">
            Deputy Pocketbook
          </div>
        </div>
      </div>

      <div className="relative mb-3.5">
        <input
          ref={searchInputRef}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Cari… (mis. 10-4, miranda)"
          aria-label="Cari di pocketbook"
          autoComplete="off"
          className="w-full rounded-sm border border-border bg-surface py-2 pl-3 pr-11 text-[13.5px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
        />
        <kbd
          aria-hidden
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm border border-border bg-surface-2 px-1.5 py-px font-mono text-[10px] text-text-faint"
        >
          /
        </kbd>
      </div>

      {!isSearching ? (
        <div className="mb-3.5 flex flex-wrap gap-1.5 border-b border-border-soft pb-3.5">
          {QUICK_JUMPS.map((jump) => (
            <a
              key={jump.label}
              href={`#${jump.target}`}
              onClick={() => navigateTo(jump.target)}
              className="rounded-sm border border-border bg-surface px-2.5 py-1 font-mono text-[11px] font-medium text-text-dim transition-colors hover:border-accent hover:text-accent"
            >
              {jump.label}
            </a>
          ))}
        </div>
      ) : null}

      <nav ref={navRef} aria-label="Bagian pocketbook" className="flex-1">
        {groups.map((group) => {
          const items = group.items.filter((s) => visibleIds.has(s.id));
          if (items.length === 0) return null;

          const isCollapsed = collapsed.has(group.name);
          const panelId = `${baseId}-${group.name}`;

          return (
            <div key={group.name} className="mb-3">
              <button
                type="button"
                onClick={() => toggleGroup(group.name)}
                aria-expanded={!isCollapsed}
                aria-controls={panelId}
                className="flex w-full items-center gap-2 px-2 py-1.5 text-left font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-text-faint transition-colors hover:text-text-dim"
              >
                <span aria-hidden className="text-[9px]">
                  {isCollapsed ? "▸" : "▾"}
                </span>
                {group.name}
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
                        className={`flex items-center gap-2.5 rounded-sm border-l-2 px-2.5 py-1.5 text-[13px] transition-colors ${
                          active
                            ? "border-l-accent bg-accent-soft font-medium text-text"
                            : "border-l-transparent text-text-dim hover:bg-surface hover:text-text"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`w-4 shrink-0 text-center text-[12px] ${
                            active ? "text-accent" : "opacity-70"
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

      <div className="mt-2 border-t border-border-soft pt-3">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">
          LSSD · Internal Use
        </p>
      </div>
    </div>
  );
}
