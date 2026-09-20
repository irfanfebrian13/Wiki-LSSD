"use client";

/* ============================================================================
   The one piece of motion that cannot be expressed in CSS.

   Everything else in this app animates from a class in `globals.css`. This one
   needs real information CSS does not have: which elements currently exist in
   the subtree being revealed, and a forced reflow to restart them.
   ========================================================================= */

/**
 * Replay the entrance animation on every element in `root` that carries one.
 *
 * Deliberate navigation now mounts a fresh chapter, so the elements this is
 * called on have just entered the DOM — but a section can also be re-revealed
 * without remounting, and a CSS animation that has already run has nothing left
 * to replay. Clearing the animation, forcing a reflow, then clearing the
 * override restarts it from the top.
 *
 * The reflow read is the whole trick: without it the browser coalesces the
 * removal and the re-add into no change at all.
 */
export function replayReveal(root: HTMLElement | null) {
  if (!root) return;

  const targets = root.querySelectorAll<HTMLElement>(
    ".reveal-item, .reveal-stack > *",
  );
  for (const el of targets) el.style.animation = "none";
  void root.offsetHeight; // force reflow
  for (const el of targets) el.style.animation = "";
}
