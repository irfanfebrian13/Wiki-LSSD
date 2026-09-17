# Task 01: Write Project README

## Status

pending

## Wave

1

## Description

The repository has no `README.md`. The project was just rebuilt from a vanilla JS static site into a Next.js application, and without a README a new contributor — or a future agent — has no documented entry point: they cannot tell how to run it, how to test it, what the architecture is, or which properties of the build are deliberate and must not be "cleaned up."

This task writes a `README.md` at the repository root. It is a documentation-only task: create one file, modify nothing else.

## Dependencies

**Depends on:** None (Wave 1)
**Blocks:** task-03-commit-and-push.md

**Context from dependencies:** None. This is a Wave 1 task with no prerequisites.

## Files to Create

- `README.md` — Project documentation at the repository root

## Files to Modify

None.

## Technical Details

### Verified facts to document

Every figure below was measured from the codebase. Use these exact numbers — do not estimate or re-derive them by inspection.

| Fact | Value |
|---|---|
| Sections | 23 |
| Groups | 6 |
| Content blocks | 45 |
| Block types | 16 |
| Ten Codes table rows | 48 |
| Next.js | 16.3.5 |
| React | 19.2.8 |
| TypeScript | 5.9.3 |
| Node (verified) | v24.15.0 |
| npm (verified) | 11.14.1 |

The 6 groups, in document order: `Struktur`, `Komunikasi`, `Prosedur`, `Senjata`, `Penal Code`, `Form Helper`.

### Commands to document

These are the exact `package.json` scripts. All four were verified working from a clean checkout.

```bash
npm install        # install dependencies
npm run dev        # dev server at http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm run lint       # ESLint
npm test           # BBCode parity tests (node --test)
npx tsc --noEmit   # typecheck
```

Note in the README that `npm test` uses Node 24's **native TypeScript type-stripping** — there is no test framework installed, and none is needed. Tests are `.test.ts` files run directly by `node --test`.

### Architecture to describe

The app is a single scrolling page, not per-section routes.

```
app/
  layout.tsx          Fonts (next/font), metadata, pre-paint theme script
  page.tsx            Server Component — imports content, renders <Shell>
  globals.css         @import "tailwindcss" + @theme inline tokens
components/
  Shell.tsx           "use client" — owns query / activeId / theme / drawer state
  Sidebar.tsx         Brand, search, grouped nav, scroll-spy links
  Hero.tsx            Title + stat row
  SectionView.tsx     Section head + block list (React.memo)
  BlockRenderer.tsx   type -> component dispatch
  blocks.tsx          The 16 block components
  PatrolReportForm.tsx "use client" — the report generator
  ThemeToggle.tsx     Self-contained theme toggle
lib/
  types.ts            Discriminated union over the 16 block types
  data.ts             Content (23 sections)
  ranks.ts            Rank -> colour map
  search.ts           Search-index construction
  bbcode.ts           autoBold / bbToHtml / buildReport (verbatim port)
  bbcode.test.ts      Parity fixtures
public/
  sheriff.png         Brand shield + favicon
```

Key architectural points worth stating:

- **`app/page.tsx` is a Server Component.** Content is rendered to HTML on the server; only the interactive shell ships as a client bundle. There are exactly two `"use client"` boundaries: `Shell.tsx` and `PatrolReportForm.tsx` (plus `ThemeToggle.tsx`).
- **The active nav entry is derived, not stored.** The scroll observer supplies a candidate section id; the shell picks whichever is still valid for the current filter. A filter that hides the active section immediately falls back to the first visible one.
- **`next.config.ts` pins the Turbopack workspace root** with `turbopack: { root: __dirname }`. Without it, Turbopack can walk past the repo and pick up an unrelated lockfile from a parent directory, changing module resolution. Do not remove this.

### The BBCode guarantee — document this prominently

The Patrol Report Generator produces BBCode that deputies paste into a game forum. **That output must remain byte-identical to what the original vanilla-JS implementation produced.** `lib/bbcode.ts` is a verbatim port, and `lib/bbcode.test.ts` pins the behaviour with 33 fixtures captured by running the *original* code before it was deleted.

Worth documenting explicitly, because both look like bugs and are in fact the current contract:

1. **`autoBold`'s final reduce uses string replacement,** so a `$` in captured text is treated as a substitution pattern. `"[b]win $& lose[/b]"` really does emit `[b]win @@B0@@ lose[/b]` — the placeholder leaks into the output. The "correct" `.replaceAll(p, () => val)` fix would change what deputies post.
2. **A literal `@@B0@@` in the input collides with the placeholder namespace** and moves text around.

If a change makes a parity test fail, the report output has drifted from what is already being posted. Fix the change, not the fixture.

### Two constraints worth documenting for maintainers

- **CSS custom properties named `--surface-2` and `--border` are load-bearing.** `lib/bbcode.ts` emits inline styles that reference them *by name* for the report preview. They must not be renamed to fit Tailwind's `--color-*` namespace — the Tailwind mapping layer in `globals.css` is additive for exactly this reason.
- **Content contains raw `<` and `>`** (for example `"membawa < 300 butir"`). It is rendered as JSX text so React escapes it. `dangerouslySetInnerHTML` appears in exactly one place — the report preview, where the input is the user's own form data rendered back to their own browser.

### Deployment to document

The app is fully static. `npm run build` prerenders `/` and `/_not-found`, and Vercel auto-detects Next.js — no `vercel.json` is required. Deployment is connected through Vercel's dashboard, not a workflow file.

The previous GitHub Pages workflow was removed in the rebuild. `.github/workflows/ci.yml` (added by task-02) runs lint, typecheck, tests, and build; it does not deploy.

## Acceptance Criteria

- [ ] `README.md` exists at the repository root
- [ ] It states what the project is (LSSD Deputy Pocketbook) and what it is for
- [ ] It lists prerequisites, naming Node 24 as required (for `npm test`)
- [ ] It documents all seven commands from the "Commands to document" section above
- [ ] It includes the architecture tree and names the two client boundaries (`Shell.tsx`, `PatrolReportForm.tsx`)
- [ ] It documents the content model with the verified counts (23 sections, 6 groups, 45 blocks, 16 block types, 48 ten codes)
- [ ] It documents the byte-identical BBCode guarantee, including the two `$` / `@@B0@@` quirks
- [ ] It warns that `--surface-2` and `--border` must not be renamed
- [ ] It states that the app is static and deploys to Vercel with no `vercel.json`
- [ ] No other file is created or modified

## Notes

- Write in the repository's existing voice. The codebase uses British-ish technical prose in comments ("colour", "behaviour") and explains *why* rather than *what*.
- Keep it scannable. This is a reference document for someone joining the project, not an essay.
- Do not document a `vercel.json`, a `server.js`, or a GitHub Pages workflow — none of those exist any more.
- `AGENTS.md` and `CLAUDE.md` are auto-generated by `next dev` and are not part of this task.
