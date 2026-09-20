"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { buildSearchIndex, matchSections } from "@/lib/search";
import type { Section } from "@/lib/types";

import { chapterOfSection, type Chapter } from "./presentation";

const MAX_RESULTS = 12;

/**
 * The command palette.
 *
 * Reuses `lib/search.ts` unchanged — the brief is explicit that it "must reuse
 * the site's existing search index and logic", so there is no second matcher
 * here. An empty query matches everything, which gives a sensible "browse" list
 * of the first 12 sections rather than a curated one.
 *
 * The open state and the global key listener live in the shell, because the
 * listener has to work whether or not the palette is mounted.
 */
export function CommandPalette({
  open,
  onClose,
  sections,
  chapters,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  sections: Section[];
  chapters: Chapter[];
  onNavigate: (sectionId: string | null, slug: string) => void;
}) {
  // A closed dialog should not be in the accessibility tree at all, and
  // unmounting the body is also what resets the query and the selection: the
  // panel below is mounted fresh on every open, so its initial state is the
  // reset. Doing it with an effect would be a synchronous setState during
  // render-adjacent work, which the lint rules rightly reject.
  if (!open) return null;

  return (
    <PaletteDialog
      onClose={onClose}
      sections={sections}
      chapters={chapters}
      onNavigate={onNavigate}
    />
  );
}

function PaletteDialog({
  onClose,
  sections,
  chapters,
  onNavigate,
}: {
  onClose: () => void;
  sections: Section[];
  chapters: Chapter[];
  onNavigate: (sectionId: string | null, slug: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const index = useMemo(() => buildSearchIndex(sections), [sections]);

  const results = useMemo(() => {
    const matched = matchSections(sections, index, query);
    return sections.filter((s) => matched.has(s.id)).slice(0, MAX_RESULTS);
  }, [sections, index, query]);

  // Focus after the paint rather than during it, so the caret lands once the
  // dialog is actually in the document.
  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, []);

  const pick = useCallback(
    (i: number) => {
      const section = results[i];
      if (!section) return;
      onClose();
      onNavigate(section.id, chapterOfSection(section.id)?.slug ?? chapters[0]?.slug ?? "");
    },
    [results, onClose, onNavigate, chapters],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      pick(selected);
      return;
    }
    if (e.key === "Tab") {
      /* A modal dialog should trap focus. The dialog holds exactly one
         focusable control (the input) plus the list's rows, so cycling between
         the first and last focusable element is enough. */
      const focusable = boxRef.current?.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div
      className="command-palette fixed inset-0 z-50 flex justify-center bg-black/60 px-4 pt-[12vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={onKeyDown}
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label="Cari di handbook"
        className="h-fit w-[min(620px,100%)] rounded-sm border border-outline bg-bg shadow-[8px_8px_0_rgba(0,0,0,0.25)]"
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(0);
          }}
          placeholder="Cari kode, prosedur, atau pasal"
          aria-label="Kata kunci pencarian"
          autoComplete="off"
          spellCheck={false}
          className="w-full border-b border-outline bg-transparent px-4 py-3.5 text-[18px] text-text placeholder:text-text-faint focus:outline-none"
        />

        <ul role="listbox" aria-label="Hasil pencarian" className="max-h-[50vh] overflow-auto p-0">
          {results.length === 0 ? (
            <li className="cursor-default px-4 py-2.5 text-[15px] text-text-dim">
              Tidak ada hasil untuk &ldquo;{query}&rdquo;. Coba &ldquo;10-4&rdquo;,
              &ldquo;miranda&rdquo;, atau &ldquo;felony&rdquo;.
            </li>
          ) : (
            results.map((section, i) => {
              const chapter = chapterOfSection(section.id);
              return (
                <li
                  key={section.id}
                  role="option"
                  aria-selected={i === selected}
                  onClick={() => pick(i)}
                  onMouseEnter={() => setSelected(i)}
                  className={`flex cursor-pointer justify-between gap-3 px-4 py-2.5 text-[15px] ${
                    i === selected ? "bg-tx text-on-tx" : "text-text"
                  }`}
                >
                  <span>{section.title}</span>
                  <span className="shrink-0 font-mono text-[12px] opacity-75">
                    {chapter?.name ?? section.group}
                  </span>
                </li>
              );
            })
          )}
        </ul>

        <p className="m-0 border-t border-border px-4 py-2 font-mono text-[12px] text-text-dim">
          Panah atas/bawah untuk memilih, Enter untuk membuka, Esc untuk menutup
        </p>
      </div>
    </div>
  );
}
