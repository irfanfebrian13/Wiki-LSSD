# Requirements: Ship the Next.js Rebuild

## Summary

`Wiki-LSSD` was a zero-dependency vanilla JS site: `public/index.html`, `app.js`, `data.js`, `styles.css`, plus a hand-rolled `server.js`, deployed to GitHub Pages by a workflow that uploaded `public/`. It has been rebuilt as a Next.js 16 App Router application with React 19, TypeScript, and Tailwind v4, restyled in a "tactical / MDT terminal" direction and retargeted at Vercel.

That rebuild is finished and independently verified:

| Check | Command | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint` | exit 0, clean |
| Parity tests | `npm test` | 7/7 pass |
| Production build | `npm run build` | `/` and `/_not-found` both prerendered static |
| Browser behaviour | 25 Playwright assertions | 25/25 pass |

The problem this spec solves is that **none of it is shipped**. The work exists only as uncommitted changes in the working tree:

- **6 tracked files deleted** — `.github/workflows/deploy.yml`, `public/app.js`, `public/data.js`, `public/index.html`, `public/styles.css`, `server.js`
- **1 tracked file modified** — `package.json`
- **13 untracked paths** — `app/`, `components/`, `lib/`, `public/sheriff.png`, and the config files

Two artifacts are missing entirely. There is **no README**, so a new contributor (or a future agent) has no documented entry point. And because the GitHub Pages workflow was deleted with no replacement, the repository has **no CI at all** — nothing prevents a commit from breaking the build, the typecheck, or the byte-identical BBCode guarantee.

The outcome: the project is documented, guarded by CI, and pushed to `origin/main`, ready to be connected to Vercel.

## Goals

- Document the project so someone with no prior context can install, run, test, and understand the architecture
- Add a CI workflow that runs lint, typecheck, tests, and build on every push and pull request, replacing the removed Pages workflow
- Commit the complete rebuild — deletions included — as one reviewable change, and push it to `origin/main`
- Preserve the byte-identical BBCode guarantee as a CI-gated property, not just a local convention

## Non-Goals

- **No Vercel configuration file.** The app is fully static and Vercel auto-detects Next.js correctly; adding `vercel.json` would duplicate what is already inferred. Connecting the repository to Vercel is a manual dashboard step, documented in `action-required.md`.
- **No content changes.** The 23 sections, 6 groups, 45 blocks, and 16 block types are authoritative and must be committed exactly as they are.
- **No new features, refactors, or visual changes.** The rebuild is verified as-is.
- **No changes to the BBCode output.** `lib/bbcode.ts` is a verbatim port pinned by fixtures captured from the original implementation.
- **No deployment automation beyond CI.** Vercel's own Git integration handles deployment; this spec does not add a deploy workflow.
- **No test framework.** `npm test` uses Node 24's native TypeScript type-stripping and `node --test`. Adding Vitest or Jest is out of scope.
- **`.claude/` is not committed.** It holds 215 files (~1.1MB) of agent tooling — skills, agents, and plans — that was already untracked before the rebuild and is not part of the application. It is gitignored so `git status` ends clean.

## Acceptance Criteria

- [ ] `README.md` exists at the repository root and documents: what the project is, prerequisites, install/dev/test/build commands, the architecture, the content model, the BBCode guarantee, and deployment
- [ ] `.github/workflows/ci.yml` exists and runs on push to `main` and on pull requests
- [ ] The CI workflow installs with `npm ci`, then runs lint, typecheck, tests, and build
- [ ] The CI workflow fails if any of those four steps fail
- [ ] `.gitignore` excludes `.claude/` so the toolkit stays local
- [ ] `git status` is clean after the commit — no deleted, modified, or untracked files remain
- [ ] The 6 legacy files are recorded as deletions in the commit (not merely absent from the working tree)
- [ ] The rebuild is pushed to `origin/main` and `git log origin/main..HEAD` is empty
- [ ] All four verification commands still pass after committing: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`

## Assumptions

- **The GitHub remote is `https://github.com/terhalangkasta/lssd-pocketbook`,** branch `main`, and the user has push access. Verified from `git remote -v`.
- **GitHub Actions is available for this repository.** It was previously enabled for the Pages deploy that this spec replaces.
- **The user will connect the repository to Vercel manually.** No agent action can do this; it requires a Vercel account and dashboard access.
- **Node 24 is available in CI.** `npm test` depends on native TypeScript type-stripping, which Node 24 provides. The workflow pins Node 24 to match the verified local version (`v24.15.0`).
- **The `.claude/worktrees/verify-backend-integration/` directory is a stray build artifact,** not a real git worktree. `git worktree list` shows only the main working tree. It contains a `.next` directory and is already gitignored.
- **`AGENTS.md` and `CLAUDE.md` should be committed.** `next dev` generates them and re-adds `AGENTS.md` if removed; committing them keeps the tree clean.
- **`.claude/` is deliberately excluded from the commit.** It is a machine-local toolkit, not project source. `git status` will report nothing after the commit because `.gitignore` covers it.

## Technical Constraints

- **Stack is fixed:** Next `16.3.5`, React `19.2.8`, TypeScript `5.9.3` (deliberately pinned, not `latest`), Tailwind `4.3.3`.
- **TypeScript is pinned to `5.9.3` on purpose.** `npm view typescript version` returns `7.0.2` — the new native compiler, published very recently. This project does not need it, and Next's generated types have not been proven against it.
- **`next-env.d.ts` is gitignored and is NOT committed.** Verified: `next build` regenerates it, so a clean CI checkout typechecks and builds successfully without it.
- **`next.config.ts` pins the Turbopack workspace root** via `turbopack: { root: __dirname }`. Without it, Turbopack walks past the repo and can pick up an unrelated lockfile from a parent directory, changing module resolution. This must not be removed.
- **The `data-theme` attribute drives theming,** persisted to `localStorage` under the key `lssd-theme`. An inline blocking script in `app/layout.tsx` applies it before first paint to avoid a flash of the wrong theme.
- **CSS custom properties named `--surface-2` and `--border` are load-bearing.** `lib/bbcode.ts` emits inline styles referencing them by name for the report preview. They must not be renamed to fit Tailwind's `--color-*` namespace; the Tailwind mapping layer is additive.
- **Content contains raw `<` and `>` characters** (for example `"membawa < 300 butir"`). It is rendered as JSX text so React escapes it. `dangerouslySetInnerHTML` is used in exactly one place: the report preview, where the input is the user's own form data.
- **Commits in this repository end with the `Co-Authored-By: Claude Code <noreply@anthropic.com>` trailer,** per the project's git attribution convention.
