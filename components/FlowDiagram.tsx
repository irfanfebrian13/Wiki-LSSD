import type { FlowStep, FlowTrack } from "@/lib/types";

import { MicroLabel } from "./ui";

/**
 * The quick radio flow, drawn as inline SVG.
 *
 * Every label comes from `step.label` or `branch.label` — nothing is invented
 * and nothing is dropped. The layout is computed from the data rather than
 * hand-placed, so a track gaining a step cannot silently lose a node.
 *
 * Two layout rules worth stating, because they are choices rather than
 * derivations:
 *
 *  - **"Entry / hot" nodes are the first node of each track.** That is the only
 *    deterministic reading of the brief's "entry/hot nodes filled #2b3444" that
 *    invents no new logic, and it matches the prototype, where each track's
 *    starting node is the filled one.
 *  - **A track wraps after `MAX_COLS` steps.** A single horizontal row of eight
 *    steps would make the viewBox so wide that the 12px labels shrink below
 *    legibility once the SVG is scaled to fit. Wrapping keeps the rendered text
 *    near its intended size; the flow continues with an elbow connector down and
 *    back to the left.
 */

/* Node geometry, in viewBox units. */
const NODE_W = 150;
const NODE_H = 40;
const PITCH = 170;
const ROW_GAP = 26;
const TRACK_GAP = 30;
const TITLE_H = 20;
const BRANCH_W = 150;
const BRANCH_GAP = 6;
const PAD = 2;

/* Steps per row. A branch step is never allowed in the final column, so its two
   branch nodes always fit inside the viewBox. */
const MAX_COLS = 5;

const SVG_W = PAD * 2 + (MAX_COLS - 1) * PITCH + NODE_W;

type NodeKind = "hot" | "plain" | "ok" | "danger";

const RECT_CLASS: Record<NodeKind, string> = {
  hot: "fill-[var(--tx)] stroke-[var(--tx)]",
  plain: "fill-[var(--surface)] stroke-[var(--border-strong)]",
  ok: "fill-[var(--surface)] stroke-[var(--mint)]",
  danger: "fill-[var(--surface)] stroke-[var(--coral)]",
};

const RECT_STROKE: Record<NodeKind, number> = {
  hot: 1.2,
  plain: 1.2,
  ok: 2,
  danger: 2,
};

/**
 * Split a label onto at most two lines so the 40px node height holds.
 *
 * The prototype splits on `|`; the data has none, so the break is taken at the
 * first space at or after the midpoint instead. Deterministic and cheap.
 */
function wrapLabel(label: string): string[] {
  if (label.length <= 16) return [label];
  const at = label.indexOf(" ", Math.max(0, Math.floor(label.length / 2) - 4));
  return at === -1 ? [label] : [label.slice(0, at), label.slice(at + 1)];
}

/**
 * Cut a track's steps into rows, closing a row early rather than letting a
 * branch step land in the final column — its branch nodes are two nodes wide
 * and would run past the right edge.
 */
function chunk(steps: FlowStep[]): FlowStep[][] {
  const rows: FlowStep[][] = [];
  let row: FlowStep[] = [];

  for (const step of steps) {
    if (step.branches && row.length >= MAX_COLS - 1) {
      if (row.length) rows.push(row);
      row = [step];
      continue;
    }
    row.push(step);
    if (row.length === MAX_COLS) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length) rows.push(row);
  return rows;
}

interface PlacedNode {
  key: string;
  x: number;
  y: number;
  w: number;
  lines: string[];
  kind: NodeKind;
}

interface PlacedPath {
  key: string;
  d: string;
}

interface PlacedTitle {
  key: string;
  y: number;
  text: string;
}

function buildLayout(tracks: FlowTrack[]) {
  const nodes: PlacedNode[] = [];
  const paths: PlacedPath[] = [];
  const titles: PlacedTitle[] = [];

  let cursor = 0;

  tracks.forEach((track, t) => {
    const rows = chunk(track.steps);
    const rowHeights = rows.map(
      (row) => NODE_H + (row.some((s) => s.branches) ? ROW_GAP + NODE_H : 0),
    );

    titles.push({ key: `title-${t}`, y: cursor + 13, text: track.title });

    const rowY: number[] = [];
    let y = cursor + TITLE_H;
    for (const h of rowHeights) {
      rowY.push(y);
      y += h + ROW_GAP;
    }
    const trackBottom = y - ROW_GAP;

    rows.forEach((row, r) => {
      row.forEach((step, c) => {
        const x = PAD + c * PITCH;
        const top = rowY[r];

        nodes.push({
          key: `n-${t}-${r}-${c}`,
          x,
          y: top,
          w: NODE_W,
          lines: wrapLabel(step.label),
          kind: r === 0 && c === 0 ? "hot" : "plain",
        });

        // Straight connector to the next step on this row.
        if (c < row.length - 1) {
          const cy = top + NODE_H / 2;
          paths.push({ key: `h-${t}-${r}-${c}`, d: `M${x + NODE_W} ${cy}H${x + PITCH}` });
        }

        // The fork: two half-width-ish nodes on the row beneath the parent,
        // joined by short elbows.
        if (step.branches) {
          const parentCx = x + NODE_W / 2;
          const midY = top + NODE_H + ROW_GAP / 2;
          const branchTop = top + NODE_H + ROW_GAP;

          step.branches.forEach((branch, b) => {
            const bx = x + b * (BRANCH_W + BRANCH_GAP);
            const bcx = bx + BRANCH_W / 2;

            nodes.push({
              key: `b-${t}-${r}-${c}-${b}`,
              x: bx,
              y: branchTop,
              w: BRANCH_W,
              lines: wrapLabel(branch.label),
              kind: branch.tone === "ok" ? "ok" : "danger",
            });

            paths.push({
              key: `e-${t}-${r}-${c}-${b}`,
              d: `M${parentCx} ${top + NODE_H}V${midY}H${bcx}V${branchTop}`,
            });
          });
        }
      });

      // Wrap to the next row: down, back to the left, then down into the row's
      // first node.
      if (r < rows.length - 1) {
        const lastCx = PAD + (row.length - 1) * PITCH + NODE_W / 2;
        const midY = rowY[r] + rowHeights[r] + ROW_GAP / 2;
        paths.push({
          key: `w-${t}-${r}`,
          d: `M${lastCx} ${rowY[r] + NODE_H}V${midY}H${PAD + NODE_W / 2}V${rowY[r + 1]}`,
        });
      }
    });

    cursor = trackBottom + TRACK_GAP;
  });

  return { nodes, paths, titles, height: cursor - TRACK_GAP + PAD };
}

export function FlowDiagram({
  tracks,
  title,
}: {
  tracks: FlowTrack[];
  title?: string;
}) {
  const { nodes, paths, titles, height } = buildLayout(tracks);

  // Derived from the track titles so it stays accurate if the data changes.
  const label = `Alur radio — ${tracks.map((t) => t.title).join("; ")}`;

  return (
    /* `min-w-0` on the outer wrapper: a plain block child defaults to
       `min-width: auto`, so the 640px SVG inside would widen this element and
       the scroll container below would never get the chance to scroll. The
       zero minimum is what hands the overflow to `overflow-x-auto`. */
    <div className="min-w-0">
      {title ? <MicroLabel className="mb-3">{title}</MicroLabel> : null}

      {/* `overflow-x-auto` plus the SVG's `min-w-[640px]` is what keeps the
          diagram from forcing page-body horizontal scroll at 360px. */}
      <div className="overflow-x-auto rounded-sm border border-outline bg-surface p-3.5">
        <svg
          role="img"
          aria-label={label}
          viewBox={`0 0 ${SVG_W} ${height}`}
          className="block h-auto w-full min-w-[640px]"
        >
          <defs>
            <marker
              id="flow-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0,0L8,4L0,8z" className="fill-[var(--text-dim)]" />
            </marker>
          </defs>

          {paths.map((path) => (
            <path
              key={path.key}
              d={path.d}
              className="stroke-[var(--text-dim)]"
              fill="none"
              strokeWidth={1.5}
              markerEnd="url(#flow-arrow)"
            />
          ))}

          {titles.map((t) => (
            <text
              key={t.key}
              x={PAD}
              y={t.y}
              className="fill-[var(--text-dim)] font-mono"
              fontSize={11}
              letterSpacing="0.06em"
            >
              {t.text.toUpperCase()}
            </text>
          ))}

          {nodes.map((node) => {
            const cx = node.x + node.w / 2;
            const firstLineY =
              node.y + (node.lines.length === 1 ? NODE_H / 2 + 4 : NODE_H / 2 - 3);

            return (
              <g key={node.key}>
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.w}
                  height={NODE_H}
                  rx={2}
                  className={RECT_CLASS[node.kind]}
                  strokeWidth={RECT_STROKE[node.kind]}
                />
                {node.lines.map((line, i) => (
                  <text
                    key={i}
                    x={cx}
                    y={firstLineY + i * 14}
                    textAnchor="middle"
                    className={`font-mono ${
                      node.kind === "hot"
                        ? "fill-[var(--on-tx)]"
                        : "fill-[var(--text)]"
                    }`}
                    fontSize={12}
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
