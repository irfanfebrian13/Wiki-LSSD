"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const CALLSIGN_KEY = "lssd.cs";
const LANG_KEY = "lssd.lang";

type Lang = "en" | "id";

interface PocketbookState {
  callsign: string;
  setCallsign: (value: string) => void;
  lang: Lang;
  setLang: (value: Lang) => void;
  /** Turn `[CALLSIGN]` into a chip: filled amber when a callsign is set. */
  substitute: (text: string) => React.ReactNode;
  /** The same substitution as plain text, for the clipboard. */
  plain: (text: string) => string;
}

/* ---------------------------------------------------------------------------
   Storage, read as an external store.

   `localStorage` is exactly that: state that lives outside React, is read
   during render, and changes from a non-React source (another tab, the
   pre-paint theme script). `useSyncExternalStore` is the API for it, and it is
   also what keeps the server render honest — the server snapshot is the
   default, and the stored value is adopted immediately after hydration, so the
   server HTML and the first client render agree.
   ------------------------------------------------------------------------- */

/* Storage can be unavailable (private mode, blocked site data), so every access
   is guarded and a failure degrades to the in-memory default. */
function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Blocked. The value still lives in the snapshot for this session.
  }
}

const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Another tab writing the same keys should update this one too.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function emit(): void {
  for (const listener of listeners) listener();
}

/* Primitives, so each snapshot is referentially stable across calls — a
   snapshot that allocated a new object every read would loop forever. */
const getCallsignSnapshot = (): string => read(CALLSIGN_KEY) ?? "";
const getCallsignServerSnapshot = (): string => "";

const getLangSnapshot = (): Lang => (read(LANG_KEY) === "id" ? "id" : "en");
const getLangServerSnapshot = (): Lang => "en";

/**
 * Matches `[CALLSIGN]` and any other `[UPPERCASE]` placeholder the scripts use.
 *
 * Module-level with the `g` flag, so `lastIndex` must be reset before each use
 * — a `g`-flagged regex carries state across calls, and forgetting that is the
 * classic source of a skipped-first-match bug.
 */
const PLACEHOLDER = /\[([A-Z][A-Z ]*)\]/g;

const Ctx = createContext<PocketbookState | null>(null);

/**
 * The callsign and radio-script language.
 *
 * Both are read and written from places that are not in a parent-child
 * relationship — the header input, the radio transmissions, the command
 * palette — so they live in context rather than being threaded through props.
 *
 * The theme deliberately does NOT live here — `ThemeToggle` owns it through the
 * document attribute, so switching themes never re-renders the content tree.
 */
export function PocketbookProvider({ children }: { children: React.ReactNode }) {
  const callsign = useSyncExternalStore(
    subscribe,
    getCallsignSnapshot,
    getCallsignServerSnapshot,
  );
  const lang = useSyncExternalStore(subscribe, getLangSnapshot, getLangServerSnapshot);

  const setCallsign = useCallback((value: string) => {
    write(CALLSIGN_KEY, value);
    emit();
  }, []);

  const setLang = useCallback((value: Lang) => {
    write(LANG_KEY, value);
    emit();
  }, []);

  const substitute = useCallback(
    (text: string): React.ReactNode => {
      const cs = callsign.trim();
      const parts: React.ReactNode[] = [];
      let last = 0;

      PLACEHOLDER.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = PLACEHOLDER.exec(text)) !== null) {
        if (match.index > last) parts.push(text.slice(last, match.index));

        const name = match[1];
        const filled = name === "CALLSIGN" && cs !== "";

        parts.push(
          <span
            key={`${match.index}-${name}`}
            className={
              filled
                ? "rounded-sm border border-gold bg-gold px-1 py-px font-mono text-[0.95em] text-on-accent"
                : "rounded-sm border border-border bg-surface-2 px-1 py-px font-mono text-[0.95em] text-gold"
            }
          >
            {filled ? cs : `[${name}]`}
          </span>,
        );

        last = match.index + match[0].length;
      }

      if (last < text.length) parts.push(text.slice(last));
      return parts.length ? parts : text;
    },
    [callsign],
  );

  /* Only `[CALLSIGN]` is replaced in the copied text: the other placeholders
     are the deputy's to fill in, so they are left intact. */
  const plain = useCallback(
    (text: string) => text.replace(/\[CALLSIGN\]/g, callsign.trim() || "[CALLSIGN]"),
    [callsign],
  );

  const value = useMemo(
    () => ({ callsign, setCallsign, lang, setLang, substitute, plain }),
    [callsign, setCallsign, lang, setLang, substitute, plain],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePocketbook(): PocketbookState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePocketbook must be used inside PocketbookProvider");
  return ctx;
}
