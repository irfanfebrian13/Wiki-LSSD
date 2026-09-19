"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { LucideProps } from "lucide-react";
import { SearchX } from "lucide-react";

import { sectionIcon, groupIcon, GROUP_CHEVRONS } from "@/lib/section-icons";
import type { NavGroup } from "@/lib/types";

import { useNavHighlight } from "./motion";

/** Sections worth one-tap access — the ones deputies reach for mid-shift.
    `target` is the section to scroll to; `label` identifies the chip. They are
    separate fields because two chips may point at the same section. */
const QUICK_JUMPS = [
  { label: "Penal Generator", target: "penal-generator" },
  { label: "Patrol Generator", target: "patrol-report" },
  { label: "Weapons Class", target: "senjata-illegal" },
  { label: "10-Codes", target: "ten-codes" },
  { label: "Radio", target: "radio-basics" },
  { label: "Penal Code", target: "penal-robbery" },
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

/**
 * The group colours: a fixed cycle so every group reads as a distinct category.
 * Applied to each group's icon now that the marker is drawn rather than a dot.
 */
const GROUP_COLORS = ["text-gold", "text-mint", "text-coral"];

/**
 * Every nav icon is drawn with these props, so the column reads as one set:
 * one optical size, one stroke weight. Defined once here rather than per icon
 * so the sidebar cannot drift out of alignment one entry at a time.
 */
const NAV_ICON_PROPS: LucideProps = {
  size: 16,
  strokeWidth: 2,
  "aria-hidden": true,
};

/** The group header's icon and disclosure chevron are a touch smaller than the
    section icons, matching the 10.5px label they sit beside. */
const GROUP_ICON_PROPS: LucideProps = {
  size: 13,
  strokeWidth: 2,
  "aria-hidden": true,
};

interface SidebarProps {
  groups: NavGroup[];
  /** Ids currently matching the search query. */
  visibleIds: Set<string>;
  activeId: string | null;
  /** The search query. The input itself lives in the main content area; this
      component only reads the value — to hide the quick-jump chips while a
      search is active, and to re-measure the sliding pill when a filter hides
      entries. */
  query: string;
  onNavigate: (id: string) => void;
}

export function Sidebar({
  groups,
  visibleIds,
  activeId,
  query,
  onNavigate,
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

  /* One absolutely-positioned pill slides between nav entries, rather than the
     active background being swapped from link to link. `query` is part of the
     key so a search that hides entries re-measures. */
  const pillRef = useNavHighlight({
    container: navRef,
    activeId,
    remeasureKey: query,
  });

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
          <div className="mt-0.5 text-[10.5px] text-text-faint">
            Handbook by Brian Putra
          </div>
        </div>
      </div>

      {!isSearching ? (
        <div className="mb-1 px-4 pb-3.5">
          {/* The chips are shortcuts, not a second navigation list — most of
              them point at sections already in the nav below. Labelling them
              is what keeps that from reading as a duplicate nav. */}
          <div className="mb-2 px-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-faint">
            Quick Access
          </div>
          <div className="flex flex-wrap gap-1.5">
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
        </div>
      ) : null}

      {/* Navigation */}
      <nav
        ref={navRef}
        aria-label="Bagian pocketbook"
        className="relative flex-1 px-3 pb-4"
      >
        {/* The sliding highlight. `aria-hidden` because it duplicates the state
            `aria-current` already carries on the link itself. It sits behind the
            links, which carry `z-10` and are positioned, so no link needs a
            background of its own. */}
        <div
          ref={pillRef}
          aria-hidden
          className="nav-pill pointer-events-none absolute left-3 right-3 top-0 rounded-sm bg-gold-soft opacity-0"
          style={{ height: 0 }}
        />

        {/* A search that matches nothing leaves every group filtered out, so
            without this the nav would collapse to empty space with no
            explanation. The message names the query, matching the main column's
            empty state. */}
        {isSearching && visibleIds.size === 0 ? (
          <div className="px-3 py-6 text-center">
            <SearchX
              aria-hidden
              size={20}
              strokeWidth={2}
              className="mx-auto mb-2 text-text-faint"
            />
            <p className="text-[12px] leading-relaxed text-text-faint">
              Tidak ada hasil untuk &ldquo;
              <span className="font-mono text-text-dim">{query.trim()}</span>
              &rdquo;
            </p>
          </div>
        ) : null}

        {groups.map((group, gi) => {
          const items = group.items.filter((s) => visibleIds.has(s.id));
          if (items.length === 0) return null;

          const isCollapsed = collapsed.has(group.name);
          const panelId = `${baseId}-${group.name}`;
          const GroupIcon = groupIcon(group.name);
          const Chevron = isCollapsed
            ? GROUP_CHEVRONS.collapsed
            : GROUP_CHEVRONS.expanded;

          return (
            <div key={group.name} className="mt-4 first:mt-0">
              <button
                type="button"
                onClick={() => toggleGroup(group.name)}
                aria-expanded={!isCollapsed}
                aria-controls={panelId}
                className="mb-1.5 flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-faint transition-colors hover:text-text-dim"
              >
                <GroupIcon
                  {...GROUP_ICON_PROPS}
                  className={`shrink-0 ${GROUP_COLORS[gi % GROUP_COLORS.length]}`}
                />
                {group.name}
                <Chevron {...GROUP_ICON_PROPS} className="ml-auto shrink-0" />
              </button>

              <ul id={panelId} hidden={isCollapsed} className="flex flex-col gap-px">
                {items.map((section) => {
                  const active = section.id === activeId;
                  const Icon = sectionIcon(section.id);
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        data-nav-id={section.id}
                        aria-current={active ? "true" : undefined}
                        onClick={() => navigateTo(section.id)}
                        /* The active background is the sliding pill behind
                           this row, so the link itself only carries colour and
                           weight. Hover nudges the row right and grows its icon
                           a touch — both transitioned, and both cheap (transform
                           and opacity only, no layout). */
                        className={`group relative z-10 flex w-full min-w-0 items-center gap-2.5 rounded-sm px-3 py-[9px] text-[13.5px] font-medium transition-[color,transform] duration-150 hover:translate-x-0.5 ${
                          active
                            ? "font-semibold text-gold"
                            : "text-text-dim hover:text-text"
                        }`}
                      >
                        <span
                          className={`grid w-4 shrink-0 place-items-center transition-transform duration-150 group-hover:scale-110 ${
                            active ? "text-gold" : "opacity-70"
                          }`}
                        >
                          <Icon {...NAV_ICON_PROPS} />
                        </span>
                        <span className="min-w-0">
                          {section.title}
                        </span>
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
