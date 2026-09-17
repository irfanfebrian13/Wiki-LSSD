import type { Section } from "./types";

/**
 * Collect every string value in a section, ignoring the schema keys.
 *
 * The previous implementation indexed `JSON.stringify(section).toLowerCase()`,
 * which also put field names into the haystack — so a query like "items" or
 * "text" matched sections containing no such word. Walking values only drops
 * that whole class of false positive.
 */
function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === "string") {
    out.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, out);
  }
}

/** Build the lowercased haystack used to filter sections as the user types. */
export function buildSearchIndex(sections: Section[]): Map<string, string> {
  const index = new Map<string, string>();

  for (const section of sections) {
    const parts: string[] = [section.title, section.group, section.icon, section.id];
    collectStrings(section.blocks, parts);
    index.set(section.id, parts.join(" ").toLowerCase());
  }

  return index;
}

/** Ids of the sections matching `query`. An empty query matches everything. */
export function matchSections(
  sections: Section[],
  index: Map<string, string>,
  query: string,
): Set<string> {
  const q = query.trim().toLowerCase();

  if (!q) return new Set(sections.map((s) => s.id));

  const matches = new Set<string>();
  for (const section of sections) {
    if (index.get(section.id)?.includes(q)) matches.add(section.id);
  }
  return matches;
}
