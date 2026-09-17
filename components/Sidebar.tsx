"use client";

import { useId, useState } from "react";

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
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const baseId = useId();

  const toggleGroup = (name: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

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
          className="w-full border border-border bg-surface py-2 pl-3 pr-11 text-[13.5px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
        />
        <kbd
          aria-hidden
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 border border-border bg-surface-2 px-1.5 py-px font-mono text-[10px] text-text-faint"
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
              onClick={() => onNavigate(jump.target)}
              className="border border-border bg-surface px-2.5 py-1 font-mono text-[11px] font-medium text-text-dim transition-colors hover:border-accent hover:text-accent"
            >
              {jump.label}
            </a>
          ))}
        </div>
      ) : null}

      <nav aria-label="Bagian pocketbook" className="flex-1">
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
                        aria-current={active ? "true" : undefined}
                        onClick={() => onNavigate(section.id)}
                        className={`flex items-center gap-2.5 border-l-2 px-2.5 py-1.5 text-[13px] transition-colors ${
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
