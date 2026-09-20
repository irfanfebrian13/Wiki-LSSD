"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "lssd-theme";

/**
 * Theme toggle.
 *
 * Deliberately self-contained: it owns its state and talks to the document
 * directly, so toggling the theme never re-renders the content tree. If this
 * state lived in `Shell`, every switch would re-render all 45 blocks.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  /* Half-turns taken so far. The transform is cumulative rather than a fixed
     180deg so each switch rotates the same way and the transition always has a
     changed value to animate between — remounting the icon instead would not
     work, since a new element has no previous transform to transition from.
     This is presentation state only; the theme itself stays owned by the
     document attribute below. */
  const [turns, setTurns] = useState(0);

  // The header band is dark in both themes, so the button wears the band's own
  // ink rather than a theme-relative surface colour. Watching the attribute
  // also picks up whatever the pre-paint script in layout.tsx already applied.
  useEffect(() => {
    const read = () => {
      const current = document.documentElement.getAttribute("data-theme");
      if (current === "light" || current === "dark") setTheme(current);
    };

    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTurns((t) => t + 1);
    document.documentElement.setAttribute("data-theme", next);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "light" ? "#f3f4f7" : "#0c0e12");
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage can be unavailable (private mode, blocked site data).
    }
    // No local setState: the MutationObserver above picks the change up, which
    // keeps this the single source of truth.
  };

  const label = `Ganti ke tema ${theme === "dark" ? "terang" : "gelap"}`;

  // The icon shows the theme the button switches *to*, matching `label`, so the
  // control reads the same way whether it is seen or announced.
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-sm border border-[color:rgba(237,239,243,0.4)] text-[15px] text-[var(--band-ink,var(--text))] transition-[border-color] duration-200 hover:border-[var(--band-ink,var(--text))] ${className}`}
    >
      {/* Half a turn per switch, with an overshoot easing. Inline because the
          angle is runtime state; the transition itself lives in `theme-spin`. */}
      <Icon
        aria-hidden
        size={16}
        strokeWidth={2}
        className="theme-spin"
        style={{ transform: `rotate(${turns * 180}deg)` }}
      />
    </button>
  );
}
