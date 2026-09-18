import assert from "node:assert/strict";
import { test } from "node:test";

import { POCKETBOOK } from "./data.ts";
import {
  FALLBACK_SECTION_ICON,
  GROUP_CHEVRONS,
  GROUP_ICONS,
  SECTION_ICONS,
  groupIcon,
  sectionIcon,
} from "./section-icons.ts";

/**
 * The sidebar draws a Lucide icon for every section. If a section were added
 * without one, its nav entry would fall back to a neutral dot — visually
 * correct but semantically empty — so the gap is caught here instead.
 */
test("every section in the pocketbook has a sidebar icon", () => {
  const missing = POCKETBOOK.sections
    .map((section) => section.id)
    .filter((id) => !SECTION_ICONS[id]);

  assert.deepEqual(missing, [], `sections with no icon: ${missing.join(", ")}`);
});

test("the icon map has no entries for sections that no longer exist", () => {
  const ids = new Set(POCKETBOOK.sections.map((section) => section.id));
  const stale = Object.keys(SECTION_ICONS).filter((id) => !ids.has(id));

  assert.deepEqual(stale, [], `stale icon entries: ${stale.join(", ")}`);
});

test("no two sections share an icon", () => {
  const seen = new Map<string, string>();
  const collisions: string[] = [];

  for (const [id, icon] of Object.entries(SECTION_ICONS)) {
    const name = icon.displayName ?? icon.name ?? String(icon);
    const previous = seen.get(name);
    if (previous) collisions.push(`${previous} and ${id} both use ${name}`);
    else seen.set(name, id);
  }

  assert.deepEqual(collisions, [], collisions.join("; "));
});

test("sectionIcon falls back to the neutral dot for an unknown id", () => {
  assert.equal(sectionIcon("does-not-exist"), FALLBACK_SECTION_ICON);
});

test("every nav group has an icon", () => {
  const groups = [...new Set(POCKETBOOK.sections.map((s) => s.group))];
  const missing = groups.filter((name) => !GROUP_ICONS[name]);

  assert.deepEqual(missing, [], `groups with no icon: ${missing.join(", ")}`);
});

test("the group icon map has no entries for groups that no longer exist", () => {
  const names = new Set(POCKETBOOK.sections.map((s) => s.group));
  const stale = Object.keys(GROUP_ICONS).filter((name) => !names.has(name));

  assert.deepEqual(stale, [], `stale group icon entries: ${stale.join(", ")}`);
});

test("groupIcon falls back to the neutral dot for an unknown group", () => {
  assert.equal(groupIcon("No Such Group"), FALLBACK_SECTION_ICON);
});

test("the group disclosure chevrons point right when closed and down when open", () => {
  assert.notEqual(GROUP_CHEVRONS.collapsed, GROUP_CHEVRONS.expanded);
  assert.equal(GROUP_CHEVRONS.collapsed.displayName, "ChevronRight");
  assert.equal(GROUP_CHEVRONS.expanded.displayName, "ChevronDown");
});
