import type { LegendItem } from "@/lib/types";

import { tierGroups } from "./presentation";

/**
 * The rank ladder.
 *
 * Source data: the `chain-of-command` section's `ranks` block (13 ranks,
 * highest to lowest) and its sibling `legend` block, whose `desc` fields are
 * the tier labels and whose `color` fields are the tier hexes.
 *
 * `tierGroups` does the grouping, so no group label is invented. The tier
 * colours are content, not theme — `lib/ranks.ts` states that the hex values
 * encode the staff tier and must not be swapped for theme tokens, so they are
 * passed through to inline styles.
 */
export function Ladder({
  ranks,
  legend,
}: {
  ranks: string[];
  legend: LegendItem[];
}) {
  const groups = tierGroups(ranks, legend);

  // Rank numbers continue across groups, 01..13, in the ladder's own order.
  const numbered: Array<{
    label: string;
    color: string;
    ranks: Array<{ rank: string; n: number }>;
  }> = [];
  let offset = 0;
  for (const group of groups) {
    const ranks = group.ranks.map((rank, i) => ({ rank, n: offset + i + 1 }));
    offset += ranks.length;
    numbered.push({ label: group.label, color: group.color, ranks });
  }

  return (
    <div className="border-t border-outline">
      {numbered.map((group) => (
        <div
          key={group.label}
          className="grid border-b border-outline sm:grid-cols-[140px_1fr]"
        >
          <div
            className="border-l-[6px] px-3 py-3 font-cond text-[16px] font-semibold uppercase tracking-[0.07em] text-text"
            style={{ borderLeftColor: group.color }}
          >
            {group.label}
          </div>
          <ol>
            {group.ranks.map(({ rank, n: index }) => (
              <li
                key={rank}
                className="flex items-baseline gap-3.5 border-b border-border px-1.5 py-2.5 last:border-b-0"
              >
                <span className="w-[22px] font-mono text-[13px] text-text-dim">
                  {String(index).padStart(2, "0")}
                </span>
                <span
                  className="font-display text-[21px] font-semibold"
                  style={{ color: group.color }}
                >
                  {rank}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
