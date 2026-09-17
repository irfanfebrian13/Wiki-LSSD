/**
 * Rank colour coding, ported from the `rankColors` map that previously lived
 * inline in `public/app.js`.
 *
 * Colour encodes the staff tier, so the hex values are meaningful content
 * rather than theme decoration — they must not be swapped for theme tokens.
 */
const RANK_COLORS: Record<string, string> = {
  Sheriff: "#3b82f6",
  Undersheriff: "#3b82f6",
  "Assistant Sheriff": "#3b82f6",

  "Division Chief": "#22c55e",
  "Area Commander": "#22c55e",
  Captain: "#22c55e",

  Lieutenant: "#ef4444",
  Sergeant: "#ef4444",

  "Deputy Sheriff 2": "#eab308",
  "Deputy Sheriff 1": "#eab308",
  "Deputy Sheriff": "#eab308",
  "Deputy Sheriff Trainee": "#eab308",

  "Academy Recruit": "#9ca3af",
};

/** Field Staff is the default tier, so an unlisted rank falls back to its yellow. */
const DEFAULT_RANK_COLOR = "#eab308";

export function rankColor(rank: string): string {
  return RANK_COLORS[rank] ?? DEFAULT_RANK_COLOR;
}
