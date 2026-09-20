"use client";

import { useState } from "react";

import { MicroLabel } from "./ui";

/**
 * A long procedure with a session-only done toggle.
 *
 * The state lives in `useState` and is never persisted — the brief says
 * explicitly "session only, no persistence", so reloading clears every mark.
 *
 * Each row is a `role="checkbox"` rather than a native checkbox, matching the
 * prototype, so the keyboard handler is mandatory: a `<li>` with that role and
 * no `onKeyDown` would be unreachable by keyboard.
 *
 * `items` is a frozen data array whose identity never changes, so the `done`
 * array cannot drift out of alignment. The caller keys this component on the
 * block, so a different procedure gets fresh state.
 */
export function Procedures({ title, items }: { title?: string; items: string[] }) {
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));

  const count = done.filter(Boolean).length;

  const toggle = (i: number) =>
    setDone((prev) => prev.map((v, k) => (k === i ? !v : v)));

  return (
    <div>
      {title ? <MicroLabel className="mb-3">{title}</MicroLabel> : null}

      <div className="mb-3 font-mono text-[13px] text-text-dim" aria-live="polite">
        {count} dari {items.length} langkah ditandai
      </div>

      <ol className="border-t border-border">
        {items.map((item, i) => (
          <li
            key={i}
            role="checkbox"
            tabIndex={0}
            aria-checked={done[i] ?? false}
            onClick={() => toggle(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle(i);
              }
            }}
            className={`flex cursor-pointer gap-4 border-b border-border px-1 py-3 ${
              done[i] ? "text-text-dim" : "text-text"
            }`}
          >
            <span
              aria-hidden
              className={`min-w-[34px] font-mono text-[22px] font-semibold ${
                done[i] ? "text-mint" : "text-gold"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className={`text-[14px] leading-relaxed ${
                done[i] ? "line-through decoration-1" : ""
              }`}
            >
              {item}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
