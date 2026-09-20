"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * The Ten Codes list.
 *
 * Source data: the `ten-codes` section's single `table` block — 48 rows of
 * `[code, meaning]` pairs. The counter's total comes from `rows.length`, never
 * a hard-coded 48.
 *
 * Rows are buttons, so copying works on Enter/Space with no extra key handling,
 * and each row carries the faint "salin" hint on hover and focus.
 */
export function TenCodes({ rows }: { rows: string[][] }) {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  // A deputy can navigate away inside the confirmation window; clear the
  // pending timer rather than setting state on an unmounted component.
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(([code, meaning]) =>
      `${code} ${meaning}`.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const copy = async (code: string, meaning: string) => {
    try {
      await navigator.clipboard.writeText(`${code} ${meaning}`);
    } catch {
      // Clipboard access can be denied (insecure origin, blocked permission).
      // The row's text stays selectable, which is the same fallback the
      // generators rely on.
      return;
    }
    setCopied(code);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 1700);
  };

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center gap-3.5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter: ketik 10-55, backup, atau felony"
          aria-label="Filter ten codes"
          className="min-w-[220px] flex-1 rounded-sm border border-border-strong bg-surface-2 px-3 py-2.5 text-[16px] text-text placeholder:text-text-faint focus:border-gold focus:outline-none"
        />
        <span aria-live="polite" className="font-mono text-[13px] text-text-dim">
          {filtered.length} dari {rows.length} kode
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-[14px] text-text-dim">
          Tidak ada kode yang cocok dengan &ldquo;{query.trim()}&rdquo;. Coba kata
          lain, misalnya &ldquo;backup&rdquo; atau &ldquo;10-55&rdquo;.
        </p>
      ) : (
        <div className="grid gap-x-8 border-t border-border lg:grid-cols-2">
          {filtered.map(([code, meaning]) => (
            <button
              key={code}
              type="button"
              onClick={() => copy(code, meaning)}
              aria-label={`Salin ${code} ${meaning}`}
              className="group flex items-baseline gap-3.5 border-b border-border px-1.5 py-2.5 text-left text-[15px] transition-colors hover:bg-surface-2 focus-visible:bg-surface-2"
            >
              <span className="min-w-[56px] font-mono text-[14px] font-semibold text-mint">
                {code}
              </span>
              <span className="text-text-dim group-hover:text-text">{meaning}</span>
              <span
                aria-hidden
                className="ml-auto shrink-0 font-mono text-[12px] text-text-faint opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                salin
              </span>
            </button>
          ))}
        </div>
      )}

      {/* One toast for the whole list, not one per row. `role="status"` plus
          `aria-live="polite"` announces the confirmation without stealing
          focus. The `toast` class is what the print stylesheet hides. */}
      <div
        role="status"
        aria-live="polite"
        className={`toast pointer-events-none fixed bottom-[calc(72px+env(safe-area-inset-bottom,0px))] left-1/2 z-50 -translate-x-1/2 rounded-sm bg-text px-3.5 py-2 font-mono text-[13px] text-bg transition-opacity duration-150 ${
          copied ? "opacity-100" : "opacity-0"
        }`}
      >
        {copied ? `Tersalin: ${copied}` : ""}
      </div>
    </div>
  );
}
