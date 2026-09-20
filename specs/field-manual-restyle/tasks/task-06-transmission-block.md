# Task 06: Transmission block

## Status

complete

## Wave

3

## Description

Replace `components/RadioCall.tsx` with a "transmission" block: the brief's treatment for the 21
`radiocall` blocks spread across 11 sections in the `Radio` category.

The block gains three behaviours the current implementation does not have: placeholder chips rendered
inline, `[CALLSIGN]` substitution from the shared callsign state, and an EN/ID segmented toggle that
shows one language at a time instead of stacking both.

## Dependencies

**Depends on:** task-05-client-state-theme-motion
**Blocks:** task-10-shell-rewrite

**Context from dependencies:**

- **From task-05:** `components/pocketbook-context.tsx` exports `usePocketbook()`, returning
  `{ callsign, setCallsign, lang, setLang, substitute, plain }`. `substitute(text)` returns React nodes
  with every `[UPPERCASE]` placeholder wrapped in a chip and `[CALLSIGN]` filled gold when a callsign is
  set. `plain(text)` returns the same text with only `[CALLSIGN]` replaced, for the clipboard.
- **From task-01:** `--tx` / `--outline` / `--on-tx` tokens and their utilities `bg-tx`, `text-on-tx`,
  `border-outline`; the collapsed 2–3px radius scale; `--display` → Fraunces, `--mono` → IBM Plex Mono.

## Files to Create

- `components/Transmission.tsx` — the transmission block.

## Files to Modify

None.

## Files to Delete

None in this task.

**Deliberately deferred to task-09:** `components/RadioCall.tsx` is deleted by task-09, not here. Task-09
also repoints `BlockRenderer.tsx`'s `radiocall` case at `Transmission`. Both tasks are in wave 3 and
would otherwise both modify `BlockRenderer.tsx`, which parallel agents cannot do safely. So this task
**creates `Transmission.tsx` and touches nothing else** — `RadioCall.tsx` stays in place and keeps being
rendered until task-09 swaps it. That keeps the tree buildable at every point in the wave.

## Technical Details

### The data

All 21 `radiocall` blocks have this shape:

```ts
{
  type: "radiocall";
  title: string;      // e.g. "3.1 Initiating Traffic Stop"
  phrase: string;     // the English on-air script
  phrase_id: string;  // the Indonesian translation
  note?: string;      // e.g. "Kapan dipakai: saat menghentikan kendaraan. …"
}
```

**The English and Indonesian are cleanly separated** into `phrase` and `phrase_id`, so the EN/ID toggle
is fully supported and no fallback is needed. This was verified against the data at planning time — the
brief's escape hatch ("if the data does not cleanly separate EN and ID text, keep showing both stacked")
does not apply.

The section number the header displays comes from the `title`, which is already prefixed
(`"3.1 …"`, `"10.1 …"`). Extract the leading numeric token for the header strip's "Transmisi <n>" label
rather than hard-coding it.

### The block's anatomy

The brief: "each script is a 'transmission' block: header strip (`#2b3444`, mono, 'Transmisi <section
number>', title, Salin button), body in mono on `#171c24`, and the existing usage explanation below."

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { usePocketbook } from "./pocketbook-context";

const COPIED_MS = 1800;

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
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const active = lang === "en" ? phrase : phrase_id;
  const label = title.match(/^(\d+(?:\.\d+)?)/)?.[1] ?? "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(plain(active));
    } catch {
      return; // clipboard can be denied; the text stays selectable
    }
    setCopied(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
  };
  ...
}
```

**Copy the substituted plain text.** The brief is explicit: "the copy button copies the substituted
plain text." So it is `plain(active)` — not the raw `phrase`, and not the JSX. This differs from today's
`RadioCall`, which copies the raw English phrase.

**Note the current behaviour that changes:** today's component always copies the **English** phrase
regardless of language, with the reasoning that English is what goes out over the radio. The brief now
wants the copy to follow the selected language. Follow the brief — the toggle makes the intent explicit,
so copying what the deputy is looking at is the correct reading.

### The header strip

```tsx
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
    <p className="px-3.5 pb-3 pt-2 text-[14px] leading-relaxed text-text-dim">{note}</p>
  ) : null}
</article>
```

Notes on this markup:

- **`bg-tx` and `text-on-tx`** are the tokens from task-01; `#2b3444` is `--tx`'s dark value.
- **The "Salin" button inherits the strip's ink** via `text-on-tx` and `border-current` at 70% opacity,
  so it works in both themes without hard-coding a colour.
- **`whitespace-pre-wrap`** keeps multi-line scripts' line breaks and wraps long ones.
- The `title` is the `<b>` and the "Transmisi <n>" label is secondary — matching the prototype, where
  the number is a quiet prefix and the title is the emphasised element.

### The EN/ID toggle

The brief: "a segmented EN / Indonesia toggle (amber when selected, persisted) that shows one language
at a time."

The toggle's state lives in the shared context (task-05), so it is persisted and consistent across every
transmission on the page. **Do not hold language state locally in this component** — that would let two
transmissions on the same page disagree.

**Where to render it.** The brief puts the toolbar at the top of the radio page rather than inside each
transmission. Two options:

- **Per-transmission toggle** — every transmission carries its own small toggle. Simple, but 21 toggles
  on a page is noisy and they all move together anyway.
- **One shared toolbar** — a single toggle at the top of the section, controlling all transmissions.

The brief describes "each script is a transmission block" and separately describes the toggle, and the
prototype renders **one** toolbar per page with one toggle. Render the toggle once, in the shell or in a
small toolbar component, and keep `Transmission` purely presentational with respect to language. This
task should therefore **also create the toggle markup** as a small exported component so task-09 can
place it:

```tsx
export function LanguageToggle() {
  const { lang, setLang } = usePocketbook();
  return (
    <div role="group" aria-label="Bahasa skrip" className="inline-flex overflow-hidden rounded-sm border border-outline">
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
```

**Accessibility:** `role="group"` with an `aria-label`, and `aria-pressed` on each button so the selected
state is announced. Both buttons are natively focusable and keyboard-operable. Note `aria-pressed` on
two mutually exclusive buttons is acceptable here and is what the prototype uses.

### Where the callsign input lives

The brief puts the callsign input in the **header band** (task-10), and the prototype additionally
renders one in the radio page's toolbar. Since the state is shared, the header input alone is sufficient
— a second input would be redundant. **Do not add a callsign input to this component**; task-10 owns the
header one. If a page-level input is wanted for discoverability, task-09 can render a second bound input
pointing at the same context value; note it there rather than here.

## Acceptance Criteria

- [ ] `components/Transmission.tsx` exports `Transmission` and `LanguageToggle`.
- [ ] The header strip renders `Transmisi <n>` (the numeric prefix of the title), the full `title` as the
      emphasised element, and a "Salin" button, all in mono on `bg-tx`.
- [ ] The button shows "Tersalin" for ~1.8s after a successful copy and reverts.
- [ ] The clipboard receives the **substituted plain text of the currently selected language**
      (`plain(active)`), not the raw phrase and not the other language.
- [ ] A denied clipboard does not throw — the text stays selectable.
- [ ] The body renders `substitute(active)` in mono with `whitespace-pre-wrap`, so `[CALLSIGN]` becomes a
      gold chip when a callsign is set and every other `[PLACEHOLDER]` becomes an outlined amber chip.
- [ ] Switching language in `LanguageToggle` changes **every** transmission on the page at once (shared
      context state, not local).
- [ ] The selected language button is amber; both buttons carry `aria-pressed` and the group has an
      `aria-label`.
- [ ] The `note` renders below the body in muted text when present.
- [ ] The pending copy timer is cleared on unmount.
- [ ] `components/Transmission.tsx` exists and exports `Transmission` and `LanguageToggle`.
- [ ] `components/RadioCall.tsx` is left untouched — task-07 deletes it when it repoints `BlockRenderer`.
- [ ] `npx tsc --noEmit` passes and `npm run lint` is clean.
- [ ] `git diff --stat lib/` is empty.

## Notes

**`"use client"` is required** — the component reads context and holds copy state.

**The header strip is dark in both themes.** `--tx` is `#2b3444` in dark mode and `#2a3340` in light
mode — deliberately still dark, because the brief describes the strip as a dark fill carrying cream
text. `--on-tx` is therefore cream in both themes. Use `text-on-tx` for the title and the label, and
give the button `border-current` at reduced opacity with `text-on-tx`, so it works in both themes
without hard-coding a colour:

```tsx
className="shrink-0 rounded-sm border border-current px-2.5 py-[3px] font-mono text-[12px] font-medium opacity-70 transition-opacity hover:opacity-100"
```

Do **not** use a theme-relative token like `text-text` or `border-border` for anything inside the strip
— those flip with the theme and would vanish against the permanently dark fill.

**Do not render both languages stacked as a fallback.** The data separates them cleanly, so the toggle
is always used. The brief's fallback exists only for data that cannot be separated, which is not the
case here.
