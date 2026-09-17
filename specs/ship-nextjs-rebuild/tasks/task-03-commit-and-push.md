# Task 03: Commit and Push the Rebuild

## Status

pending

## Wave

2

## Description

The Next.js rebuild exists only as uncommitted changes in the working tree. This task stages everything, records the 6 legacy-file deletions, commits the rebuild as one reviewable change, and pushes it to `origin/main` — which is what lets the repository be connected to Vercel.

This is the final task. It is serialized into its own wave because git operations cannot run in parallel and because it must include the artifacts produced by Wave 1.

## Dependencies

**Depends on:** task-01-write-readme.md, task-02-add-ci-workflow.md
**Blocks:** None

**Context from dependencies:** task-01-write-readme.md creates `README.md` at the repository root. task-02-add-ci-workflow.md creates `.github/workflows/ci.yml`. Both are new untracked files that this task must include in the commit — a plain `git add -A` picks them up automatically. Neither task modifies anything this task does, apart from `.gitignore` handling described below.

## Files to Create

None.

## Files to Modify

- `.gitignore` — consolidate the `.claude/` rules into a single `.claude/` entry

## Technical Details

### Step 1: Consolidate the `.claude/` ignore rules

`.gitignore` currently ends with three narrow rules added during the rebuild:

```gitignore
# claude code local state (worktrees are build output; settings.local.json is machine-local)
.claude/worktrees/
.claude/settings.local.json
*.Zone.Identifier
```

Replace those with a single broader rule, keeping the `Zone.Identifier` line (those are WSL artefacts that appear on many files):

```gitignore
# claude code local state (skills, agents, plans — machine-local toolkit)
.claude/
*.Zone.Identifier
```

The decision is to keep `.claude/` out of the repository: it is 215 files (~1.1MB) of agent tooling — skills, agents, and plans — that was already untracked before this rebuild and is not part of the application. Gitignoring it means `git status` ends clean rather than permanently showing an untracked directory.

### Step 2: Verify the tree is in the expected state

Before staging, confirm the working tree matches this expectation:

```bash
git status --porcelain
```

Expected — 6 deletions, 1 modification, 14 untracked paths:

```
 D .github/workflows/deploy.yml
 M package.json
 D public/app.js
 D public/data.js
 D public/index.html
 D public/styles.css
 D server.js
?? .gitignore
?? AGENTS.md
?? CLAUDE.md
?? README.md                 <- from task-01
?? app/
?? components/
?? eslint.config.mjs
?? lib/
?? next.config.ts
?? package-lock.json
?? postcss.config.mjs
?? public/sheriff.png
?? specs/                    <- this spec folder
?? tsconfig.json
?? .github/                  <- from task-02
```

If `.claude/` still appears as untracked, Step 1 was not applied.

### Step 3: Run the full verification suite before committing

Do not commit a tree that does not pass. Run all four and confirm each exits 0:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

`npm test` must report `7/7` passing. This is the byte-identical BBCode guarantee — the report output deputies paste into the forum. If it fails, stop and fix the cause; never adjust the fixtures in `lib/bbcode.test.ts`.

### Step 4: Stage everything

```bash
git add -A
git status --short
```

`git add -A` records the deletions as well as the additions. Confirm the output shows `D` for the 6 legacy files, `M` for `package.json`, and `A` for the new paths — not `??` for any of them.

Note that `public/app.js`, `public/data.js`, `public/index.html`, and `public/styles.css` are deleted while `public/sheriff.png` is newly added. That is correct: the brand shield was vendored into the repo because the original site hotlinked it from a *different* GitHub Pages repository that could disappear.

### Step 5: Commit

Use this message. It follows the repository's existing conventional-commit style (`feat:`, `chore:`, `tweak:`) and ends with the required attribution trailer.

```
feat: rebuild pocketbook in Next.js, React and TypeScript

Replaces the vanilla JS static site with a Next.js 16 App Router
application, restyled in a tactical / MDT terminal direction and
retargeted from GitHub Pages to Vercel.

- Single page preserved: 23 sections, 6 groups, scroll-spy sidebar,
  live cross-section search, #anchor deep links
- 16 block types as typed React components
- Tailwind v4 with @theme inline tokens and a dark-first palette
- BBCode output pinned byte-identical by 33 fixtures captured from
  the original implementation before it was removed
- Removes server.js and the GitHub Pages workflow; adds CI
  (lint, typecheck, test, build) and a README

Co-Authored-By: Claude Code <noreply@anthropic.com>
```

Commit with a heredoc so the multi-line body survives intact:

```bash
git commit -F - <<'EOF'
feat: rebuild pocketbook in Next.js, React and TypeScript

Replaces the vanilla JS static site with a Next.js 16 App Router
application, restyled in a tactical / MDT terminal direction and
retargeted from GitHub Pages to Vercel.

- Single page preserved: 23 sections, 6 groups, scroll-spy sidebar,
  live cross-section search, #anchor deep links
- 16 block types as typed React components
- Tailwind v4 with @theme inline tokens and a dark-first palette
- BBCode output pinned byte-identical by 33 fixtures captured from
  the original implementation before it was removed
- Removes server.js and the GitHub Pages workflow; adds CI
  (lint, typecheck, test, build) and a README

Co-Authored-By: Claude Code <noreply@anthropic.com>
EOF
```

### Step 6: Verify the commit and the clean tree

```bash
git show --stat HEAD
git status --porcelain
```

`git status --porcelain` must print **nothing**. If `.claude/` or anything else still shows, the ignore rule from Step 1 is missing or was written after staging — in that case re-run `git add -A` and `git commit --amend --no-edit`.

Confirm the commit contains the deletions, not just the additions:

```bash
git show --stat HEAD | grep -E "server\.js|public/(app|data|index|styles)" 
```

All 6 should appear with `-` (deleted) markers.

### Step 7: Push

The remote is `https://github.com/terhalangkasta/lssd-pocketbook`, branch `main`. It is already configured as the upstream for the current branch.

```bash
git push origin main
```

Do not force-push. Do not push to a different branch. If the push is rejected because the remote has moved, stop and report it — do not rebase or force anything without checking what landed upstream first.

### Step 8: Confirm the push

```bash
git log origin/main..HEAD --oneline
```

This must print nothing — meaning local `main` and `origin/main` are identical.

## Acceptance Criteria

- [ ] `.gitignore` contains a single `.claude/` entry replacing the two narrower `.claude/...` rules
- [ ] All four verification commands pass immediately before the commit
- [ ] `npm test` reports 7/7 passing
- [ ] The commit records all 6 legacy files as deletions: `.github/workflows/deploy.yml`, `public/app.js`, `public/data.js`, `public/index.html`, `public/styles.css`, `server.js`
- [ ] The commit includes `README.md` and `.github/workflows/ci.yml`
- [ ] The commit includes `public/sheriff.png` as an addition
- [ ] The commit includes the `specs/ship-nextjs-rebuild/` folder (this spec) as an addition
- [ ] The commit message ends with the `Co-Authored-By: Claude Code <noreply@anthropic.com>` trailer
- [ ] `git status --porcelain` prints nothing after the commit
- [ ] `git push origin main` succeeds without force
- [ ] `git log origin/main..HEAD --oneline` prints nothing

## Notes

- **Never edit `lib/bbcode.test.ts` fixtures to make a test pass.** Those expected values were generated by running the original implementation before it was deleted. They are the contract for what deputies already post to the forum. If a test fails, the change is wrong.
- **`next-env.d.ts` is intentionally absent from the commit.** It is gitignored and `next build` regenerates it. Seeing it missing is correct.
- **`AGENTS.md` and `CLAUDE.md` should be committed.** `next dev` generates them and re-adds `AGENTS.md` if it is removed, so committing them keeps the tree clean.
- **`specs/` is intentionally part of the commit.** It is this spec folder — the plan for the work being committed — and it is ordinary tracked project documentation. `git add -A` picks it up; leave it in.
- **Do not run `git add -f` on anything under `.claude/`.** That directory is deliberately excluded.
- If `git push` requires credentials and fails, that is a human step — report it rather than attempting to work around it.
