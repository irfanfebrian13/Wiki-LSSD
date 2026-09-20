"use client";

/* ============================================================================
   The two pieces of motion that cannot be expressed in CSS.

   Everything else in this app animates from a class in `globals.css`. These two
   need real information CSS does not have: the nav highlight needs the active
   link's measured geometry, and the count-up needs a frame loop.

   Kept here rather than in the components so the replay helper has one home.
   ========================================================================= */

import { useEffect, useRef } from "react";

/**
 * Replay the entrance animation on every element in `root` that carries one.
 *
 * The elements are always in the DOM — a section is hidden, never unmounted, and
 * search filtering only toggles `hidden`. That means a CSS animation has already
 * run and finished (`fill-mode: both`) by the time the section is shown again, so
 * unhiding it alone would show a static section. Clearing the animation, forcing
 * a reflow, then clearing the override restarts it from the top.
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

interface NavHighlightOptions {
  /** The scrollable/list container the pill is positioned within. */
  container: React.RefObject<HTMLElement | null>;
  /** Currently active nav entry, or null when nothing is active. */
  activeId: string | null;
  /** Changing this re-measures — pass the filter query so a search that hides
      entries moves the pill. */
  remeasureKey?: unknown;
}

/**
 * Position a single highlight pill behind the active nav entry.
 *
 * Returns the ref to attach to the pill element. The hook creates that ref
 * itself rather than taking it as an argument, so the pill it writes to is
 * unambiguously its own.
 *
 * The geometry comes from `getBoundingClientRect` rather than `offsetTop` so the
 * measurement is independent of which ancestor happens to be the offset parent
 * and of the sidebar's own scroll position — the difference of two viewport
 * rects is already scroll-corrected.
 *
 * Re-measured on every layout change that can move the entry: the active id, the
 * search query, a window resize, a group expanding or collapsing (a `hidden`
 * attribute on the group's list), and any change to the list's own size.
 */
export function useNavHighlight({
  container,
  activeId,
  remeasureKey,
}: NavHighlightOptions): React.RefObject<HTMLDivElement | null> {
  const pill = useRef<HTMLDivElement>(null);
  const placed = useRef(false);

  useEffect(() => {
    const box = container.current;
    const marker = pill.current;
    if (!box || !marker) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      const link = activeId
        ? box.querySelector<HTMLElement>(`[data-nav-id="${activeId}"]`)
        : null;

      const linkRect = link?.getBoundingClientRect();

      /* A link inside a collapsed group is still in the DOM but has no box, so
         its rect is all zeros — measuring that would place the pill at a large
         negative offset. Treat "no box" as "nothing to highlight" and hide. */
      if (!linkRect || linkRect.height === 0) {
        marker.style.opacity = "0";
        return;
      }

      const boxRect = box.getBoundingClientRect();

      // Only the vertical position and height vary between entries; the pill's
      // horizontal extent is fixed by its own classes, so it is never written
      // here.
      marker.style.transform = `translateY(${linkRect.top - boxRect.top}px)`;
      marker.style.height = `${linkRect.height}px`;
      marker.style.opacity = "1";
    };

    // Coalesce bursts of mutations into one measurement per frame.
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    /* The first placement must not animate: the pill has no meaningful previous
       position, so transitioning from its default 0 would slide it down the
       whole list on load. Suppress the transition for that one write. */
    if (!placed.current) {
      marker.style.transition = "none";
      update();
      // Read back to flush, then hand the transition back to CSS.
      void marker.offsetHeight;
      marker.style.transition = "";
      placed.current = true;
    } else {
      update();
    }

    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(box);

    /* Group collapse writes `hidden` on the list; search filtering adds and
       removes group wrappers. Both are subtree changes, and both move the
       entries below them. */
    const mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(box, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["hidden"],
    });

    window.addEventListener("resize", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [container, activeId, remeasureKey]);

  return pill;
}

/**
 * Count a number up from zero with ease-out cubic, on `requestAnimationFrame`.
 *
 * Writes straight to the element's `textContent` rather than holding the value
 * in state: a 900ms animation at 60fps would otherwise be ~54 re-renders of the
 * stat row. React still renders the final value on the server, so the number is
 * correct without JavaScript and the animation is a pure enhancement.
 */
export function useCountUp(
  value: number,
  duration = 900,
): React.RefObject<HTMLSpanElement | null> {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const final = String(value);

    // A no-op count settles immediately — the point of the number is the
    // number, not the ticking. Motion itself is never gated on the OS setting.
    if (value === 0) {
      el.textContent = final;
      return;
    }

    /* Drop to zero before the observer's first callback. The server rendered the
       final value, and the callback lands a frame or two later — without this,
       that frame would show the finished number and then snap back to zero to
       start counting. */
    el.textContent = "0";

    let frame = 0;

    const step = (start: number) => (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic: fast off the line, settling at the end.
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(eased * value));
      if (progress < 1) frame = window.requestAnimationFrame(step(start));
      else el.textContent = final;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        // Each re-entry restarts the count, so scrolling back replays it. The
        // observer keeps running; only the frame loop is reset.
        if (frame) window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(step(performance.now()));
      },
      { threshold: 0.4 },
    );

    observer.observe(el);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      // Leave the true value behind, not a half-counted one.
      el.textContent = final;
    };
  }, [value, duration]);

  return ref;
}
