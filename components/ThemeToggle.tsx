"use client";

import { useEffect, useState } from "react";

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

  // Two instances exist in the DOM (mobile topbar, desktop fixed) and only one
  // is visible at a time. Watching the attribute keeps them in sync when the
  // viewport crosses the breakpoint, and also picks up whatever the pre-paint
  // script in layout.tsx already applied.
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
    document.documentElement.setAttribute("data-theme", next);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "light" ? "#eceeec" : "#0a0b0a");
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage can be unavailable (private mode, blocked site data).
    }
    // No local setState: the MutationObserver above picks the change up, which
    // keeps this the single source of truth.
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Ganti ke tema ${theme === "dark" ? "terang" : "gelap"}`}
      title={`Ganti ke tema ${theme === "dark" ? "terang" : "gelap"}`}
      className={`rounded-sm border border-border bg-surface px-2 py-1 font-mono text-[13px] leading-none text-text-dim transition-colors hover:border-accent hover:text-accent ${className}`}
    >
      <span aria-hidden>{theme === "dark" ? "◐" : "◑"}</span>
    </button>
  );
}
