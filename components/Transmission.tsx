"use client";

import { useEffect, useRef, useState } from "react";

import { usePocketbook } from "./pocketbook-context";

/** How long the button shows its "Tersalin" confirmation. */
const COPIED_MS = 1800;

/**
 * One radio script, rendered as a transmission.
 *
 * The header strip is `--tx`, which is deliberately dark in both themes — the
 * brief describes it as a dark fill carrying cream text, and a strip that
 * flipped to pale in light mode would stop reading as a transmission header.
 * Everything inside it therefore uses `--on-tx` and `border-current` rather
 * than theme-relative tokens like `text-text` or `border-border`, which would
 * vanish against the permanently dark fill.
 *
 * The language lives in the shared context, not here, so every transmission on
 * the page switches together.
 */
export function Transmission({
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
  const { lang, substitute, plain } = usePocketbook();
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

  const active = lang === "en" ? phrase : phrase_id;

  /* The section number is the numeric prefix the title already carries
     ("3.1 …", "10.1 …"), extracted rather than hard-coded. */
  const label = title.match(/^(\d+(?:\.\d+)?)/)?.[1] ?? "";

  const copy = async () => {
    /* The brief: the button copies the substituted plain text of the language
       on screen — not the raw phrase, and not the other language. */
    try {
      await navigator.clipboard.writeText(plain(active));
    } catch {
      // Clipboard access can be denied (insecure origin, blocked permission).
      // The script stays selectable, which is the same fallback the generators
      // rely on.
      return;
    }
    setCopied(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <article className="overflow-hidden rounded-sm border border-outline bg-surface">
      <header className="flex items-center gap-3 bg-tx px-3 py-2 font-mono text-[13px] text-on-tx">
        {label ? <span className="shrink-0 opacity-80">Transmisi {label}</span> : null}
        <b className="flex-1 font-medium">{title}</b>
        <button
          type="button"
          onClick={copy}
          aria-label={`Salin transmisi: ${title}`}
          className="shrink-0 rounded-sm border border-current px-2.5 py-[3px] font-mono text-[12px] font-medium opacity-70 transition-opacity hover:opacity-100"
        >
          {copied ? "Tersalin" : "Salin"}
        </button>
      </header>

      <p className="whitespace-pre-wrap px-3.5 pt-3.5 font-mono text-[15px] leading-[1.75] text-text">
        {substitute(active)}
      </p>

      {note ? (
        <p className="px-3.5 pb-3 pt-2 text-[14px] leading-relaxed text-text-dim">
          {note}
        </p>
      ) : null}
    </article>
  );
}

/**
 * The EN / ID segmented toggle.
 *
 * Rendered once per page rather than once per transmission: the state is
 * shared, so 21 toggles would all move together and only add noise. `aria-pressed`
 * on two mutually exclusive buttons is what the prototype uses, and both are
 * natively focusable.
 */
export function LanguageToggle() {
  const { lang, setLang } = usePocketbook();

  return (
    <div
      role="group"
      aria-label="Bahasa skrip"
      className="inline-flex overflow-hidden rounded-sm border border-outline"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`px-3 py-1.5 font-mono text-[13px] font-medium transition-colors ${
          lang === "en" ? "bg-gold text-on-accent" : "text-text-dim hover:text-text"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLang("id")}
        aria-pressed={lang === "id"}
        className={`px-3 py-1.5 font-mono text-[13px] font-medium transition-colors ${
          lang === "id" ? "bg-gold text-on-accent" : "text-text-dim hover:text-text"
        }`}
      >
        Indonesia
      </button>
    </div>
  );
}
