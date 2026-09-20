# Task 05: Client state, theme and motion

## Status

complete

## Wave

2

## Description

Create the client-side state store that carries the callsign and the EN/ID language preference across
the whole page, restyle the theme toggle into the new header, and trim the motion helpers down to what
the new shell still needs.

The callsign and language need to be readable and writable from several places that are not in a
parent-child relationship — the header input, the radio transmissions, the command palette — so they
live in a React context rather than being threaded through props.

## Dependencies

**Depends on:** task-01-tokens-and-fonts
**Blocks:** task-06-transmission-block

**Context from dependencies:** task-01 adds the `--tx` / `--outline` / `--on-tx` tokens, collapses the
radius scale, and repoints the font variables. The theme toggle here uses `rounded-sm` and the amber
focus ring, both available after task-01. `--mint-soft` remains defined in `globals.css` (task-01 does
not remove it) but `components/ui.tsx` no longer references it after task-03.

## Files to Create

- `components/pocketbook-context.tsx` — the callsign + language store, and the placeholder substitution
  helpers.

## Files to Modify

- `components/ThemeToggle.tsx` — restyle for the new header band; keep the state model intact.
- `components/motion.ts` — remove `useNavHighlight` and `useCountUp`; keep `replayReveal`.

## Technical Details

### 1. `components/pocketbook-context.tsx`

Two pieces of state, both persisted to `localStorage` inside `try/catch` (storage can be unavailable in
private mode or with blocked site data):

- **callsign** — the deputy's callsign, entered in the header, substituted into `[CALLSIGN]` everywhere.
- **lang** — `"en" | "id"`, the radio script language, defaulting to `"en"`.

The existing app already persists a theme under the key `lssd-theme`. Use `lssd.cs` and `lssd.lang` —
the same keys the design prototype uses, so a user's existing preference carries over.

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

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
```

**Storage read helper** — one place, always guarded:

```tsx
function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* blocked */ }
}
```

**First paint and hydration.** The stored values must be adopted after mount, not during the initial
render, or the server HTML and the first client render would differ and React would warn. Initialise to
the defaults (`""` and `"en"`) and adopt the stored values in a `useEffect`. The prototype does the same
thing synchronously at init, but this app is server-rendered, so the effect is required.

```tsx
const [callsign, setCallsignState] = useState("");
const [lang, setLangState] = useState<Lang>("en");

useEffect(() => {
  const storedCs = read(CALLSIGN_KEY);
  if (storedCs !== null) setCallsignState(storedCs);
  const storedLang = read(LANG_KEY);
  if (storedLang === "en" || storedLang === "id") setLangState(storedLang);
}, []);
```

**Placeholder substitution.** The brief: "Render `[PLACEHOLDERS]` as inline chips (`#1d232d`, amber text,
hairline border). If the header Callsign input has a value… replace `[CALLSIGN]` everywhere with it,
chip filled amber with dark text."

The existing `RadioCall.tsx` renders both the English and Indonesian phrase as plain text with no
placeholder treatment. This is the new behaviour, so implement it fresh.

```tsx
/** Matches `[CALLSIGN]` and any other `[UPPERCASE]` placeholder the scripts use. */
const PLACEHOLDER = /\[([A-Z][A-Z ]*)\]/g;

const substitute = useCallback((text: string): React.ReactNode => {
  const cs = callsign.trim();
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  PLACEHOLDER.lastIndex = 0;
  while ((m = PLACEHOLDER.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));

    const name = m[1];
    const filled = name === "CALLSIGN" && cs !== "";

    parts.push(
      <span
        key={`${m.index}-${name}`}
        className={
          filled
            ? "rounded-sm border border-gold bg-gold px-1 py-px font-mono text-[0.95em] text-on-accent"
            : "rounded-sm border border-border bg-surface-2 px-1 py-px font-mono text-[0.95em] text-gold"
        }
      >
        {filled ? cs : `[${name}]`}
      </span>,
    );
    last = m.index + m[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}, [callsign]);

const plain = useCallback(
  (text: string) => text.replace(/\[CALLSIGN\]/g, callsign.trim() || "[CALLSIGN]"),
  [callsign],
);
```

Note the regex is module-level with the `g` flag, so **`lastIndex` must be reset before each use** —
a `g`-flagged regex carries state across calls, and forgetting this is a classic source of a
skipped-first-match bug. The code above resets it explicitly.

`plain` replaces only `[CALLSIGN]`, matching the prototype's `plain()` — the other placeholders are
left in the copied text, since they are the deputy's to fill in.

**The provider and hook:**

```tsx
const Ctx = createContext<PocketbookState | null>(null);

export function PocketbookProvider({ children }: { children: React.ReactNode }) {
  // ... state, effects and callbacks above
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
```

Setters persist:

```tsx
const setCallsign = useCallback((value: string) => {
  setCallsignState(value);
  write(CALLSIGN_KEY, value);
}, []);
const setLang = useCallback((value: Lang) => {
  setLangState(value);
  write(LANG_KEY, value);
}, []);
```

### 2. `components/ThemeToggle.tsx`

**Keep the state model exactly as it is.** It is already correct and deliberately self-contained: it
owns no theme state, reads the `data-theme` attribute via a `MutationObserver`, writes the attribute
and `localStorage`, and updates the `theme-color` meta. That design exists so toggling the theme never
re-renders the content tree. **Do not move this state into the shell.**

Change only the presentation:

- The button becomes a small square on the header band rather than a floating round button. Since the
  band is dark in both themes, the button needs the band's own colours: a transparent background with a
  hairline border in the band's ink colour at low opacity, and the icon in the band's ink colour.
- Remove `rounded-md` in favour of `rounded-sm` and remove the `hover:border-gold` (gold on the dark
  band is fine, but the prototype's `.tool` uses the band ink).
- **Keep `theme-spin`** and the cumulative `turns * 180` transform — that is existing, deliberate motion
  and the repo's policy is that motion is unconditional.
- **Keep the `aria-label` / `title`** describing the theme being switched to.

The two-instance situation goes away: today there is one toggle in the mobile topbar and one in a
desktop fixed position. In the new shell there is exactly one, in the header band, visible at all
widths. The `className` prop can stay for flexibility but will likely be unused.

```tsx
<button
  type="button"
  onClick={toggle}
  aria-label={label}
  title={label}
  className="grid h-8 w-8 shrink-0 place-items-center rounded-sm border border-[color:rgba(237,239,243,0.4)] text-[15px] text-[var(--band-ink,var(--text))] transition-[border-color] duration-200 hover:border-[var(--band-ink,var(--text))]"
>
  <Icon aria-hidden size={16} strokeWidth={2} className="theme-spin" style={{ transform: `rotate(${turns * 180}deg)` }} />
</button>
```

**The `theme-color` meta update must stay.** The header band is a fixed colour in both themes, so the
existing values (`#f3f4f7` light, `#0c0e12` dark) still make sense — but if the band becomes the top of
the page, the meta should match the band. Use the band colour (`#12161d`) in both themes for a
consistent mobile browser chrome, and update the `THEME_INIT` script in `app/layout.tsx` to match.
**Coordinate this with task-01**, which owns `layout.tsx`: if task-01 has already run, this task updates
the two literals; the simplest approach is to leave both at their current values and let task-10 decide,
since the band is the same colour either way. Prefer **not** changing it — it is existing behaviour and
the brief does not ask for it.

### 3. `components/motion.ts`

This file exports three things. Two are now dead:

| Export | Status | Reason |
|---|---|---|
| `replayReveal` | **Keep** | Replays the entrance animation on deliberate navigation. The shell still calls it. |
| `useNavHighlight` | **Remove** | It positioned the sliding pill behind the active sidebar link. The sidebar is deleted. |
| `useCountUp` | **Remove** | It animated the hero's stat boxes. The hero is deleted and the brief forbids stat boxes. |

After removal the file holds only `replayReveal` and its doc comment. Trim the module doc comment to
match: it currently explains "the two pieces of motion that cannot be expressed in CSS", which will no
longer be accurate.

**`replayReveal` must keep working as it does today.** It clears the animation on `.reveal-item` and
`.reveal-stack > *` elements, forces a reflow, then clears the override — and the reflow read is the
whole trick. Do not "simplify" it. It is called on deliberate navigation (a tab change, a palette
selection, a TOC link), never on scroll.

**Verify no other file imports the two removed hooks.** Today `useNavHighlight` is imported by
`components/Sidebar.tsx` (deleted in task-10) and `useCountUp` by `components/Hero.tsx` (also deleted in
task-10). If task-10 has not run yet, removing them will break the build — so **either** do this removal
in task-10 instead, **or** delete `Sidebar.tsx` and `Hero.tsx` here. Prefer deferring the hook removal to
task-10 if you are running tasks in a different order; the acceptance criteria below assume the normal
wave order where task-10 has not yet run, so **deferring is the safe choice** — see Notes.

## Acceptance Criteria

- [ ] `components/pocketbook-context.tsx` exports `PocketbookProvider` and `usePocketbook` with the
      `callsign`, `setCallsign`, `lang`, `setLang`, `substitute` and `plain` members.
- [ ] `substitute` wraps every `[UPPERCASE]` placeholder in a chip; `[CALLSIGN]` becomes a gold-filled
      chip with dark text when a callsign is set, and stays an outlined amber chip when it is not.
- [ ] `substitute`'s regex resets `lastIndex`, so a phrase with a placeholder at index 0 still matches.
- [ ] `plain` replaces only `[CALLSIGN]` and leaves the other placeholders intact.
- [ ] Both values are read from `localStorage` under `lssd.cs` and `lssd.lang` inside `try/catch`, adopted
      in a `useEffect` (never during the initial render), and written back on change.
- [ ] `usePocketbook` throws a clear error when used outside the provider.
- [ ] `ThemeToggle` keeps its `MutationObserver`-based state model, the `theme-spin` animation and the
      cumulative `turns * 180` transform, and still updates `localStorage` and the `theme-color` meta.
- [ ] `ThemeToggle` no longer uses `rounded-md` or a `rounded-full` shape.
- [ ] `useCountUp` and `useNavHighlight` are gone from `components/motion.ts`, and nothing imports them.
- [ ] `replayReveal` is unchanged and still exported.
- [ ] `npx tsc --noEmit` passes and `npm run lint` is clean.
- [ ] `git diff --stat lib/` is empty.

## Notes

**Sequencing caution.** Removing `useNavHighlight` and `useCountUp` breaks `Sidebar.tsx` and `Hero.tsx`
until task-10 deletes them. In the normal wave order (task-05 in wave 2, task-10 in wave 4) that would
leave the build red for two waves. **Defer the hook removals to task-10** unless you are also deleting
those two files now. The acceptance criteria are written for the end state; if you defer, note it in the
task status so the removals are not forgotten.

**`"use client"` is mandatory on `pocketbook-context.tsx`.** It holds state and uses context, so it must
be a Client Component. Every consumer of `usePocketbook` must therefore be a Client Component too — the
transmissions (task-06) and the palette (task-09) already are.

**Do not persist the procedure done-state here.** The brief says the procedure toggle is "session only,
no persistence", so it stays local to `Procedures` in task-04. This context is only for the callsign and
language, which are explicitly persisted.

**Do not add the theme to this context.** `ThemeToggle` deliberately owns it via the DOM attribute, and
moving it into context would cause every theme switch to re-render the whole page — which is exactly the
problem the current design avoids. This is called out in the component's own doc comment.
