"use client";

import { useEffect, useRef, useState } from "react";

import { BTN_MINT } from "./ui";

/** How long the button shows its "Copied" confirmation. */
const COPIED_MS = 1800;

/**
 * One radio call: the English phrase a deputy reads on air, with the Indonesian
 * translation directly beneath it.
 *
 * Only the English phrase is copied — that is the line that goes out over the
 * radio, and the translation is there to be understood, not transmitted.
 *
 * Both strings render inside `whitespace-pre-wrap`, so a multi-line call keeps
 * its line breaks and a long one wraps rather than widening the page.
 *
 * Self-contained and client-only: it owns its copy state, so tapping Copy never
 * re-renders the section around it. It deliberately does not import the
 * presentational primitives from `blocks.tsx`, which is a Server Component file.
 */
export function RadioCall({
  title,
  phrase,
  phrase_id,
  note,
}: {
  title: string;
  phrase: string;
  phrase_id: string;
  note?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  // A deputy can navigate away inside the confirmation window; clear the
  // pending timer rather than setting state on an unmounted component.
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(phrase);
    } catch {
      // Clipboard access can be denied (insecure origin, blocked permission).
      // The phrase stays selectable, which is the same fallback the report
      // generator relies on.
      return;
    }
    setCopied(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <div className="rounded-lg border border-border bg-surface px-[26px] py-5">
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <h4 className="font-display text-[15.5px] font-semibold leading-snug text-text">
          {title}
        </h4>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy radio call: ${title}`}
          className={`${BTN_MINT} shrink-0 px-3.5 py-1.5 text-[11.5px]`}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="grid gap-2.5">
        <Phrase lang="EN" text={phrase} primary />
        <Phrase lang="ID" text={phrase_id} />
      </div>

      {note ? (
        <p className="mt-3.5 border-t border-border pt-3 text-[12.5px] leading-relaxed text-text-faint">
          {note}
        </p>
      ) : null}
    </div>
  );
}

/**
 * One language row. The English row is the on-air script, so it gets the
 * monospace treatment and the gold rule; the translation sits quieter.
 */
function Phrase({
  lang,
  text,
  primary = false,
}: {
  lang: string;
  text: string;
  primary?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-px shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
          primary ? "bg-gold-soft text-gold" : "bg-mint-soft text-mint"
        }`}
      >
        {lang}
      </span>
      <p
        className={
          primary
            ? "whitespace-pre-wrap rounded-sm border-l-2 border-l-gold bg-bg px-3.5 py-2.5 font-mono text-[12.5px] leading-relaxed text-text"
            : "whitespace-pre-wrap py-1 text-[13px] leading-relaxed text-text-dim"
        }
      >
        {text}
      </p>
    </div>
  );
}
