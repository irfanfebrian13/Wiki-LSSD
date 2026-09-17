# Task 02: Add CI Workflow

## Status

pending

## Wave

1

## Description

The rebuild deleted `.github/workflows/deploy.yml` — the GitHub Pages workflow that uploaded `public/`. Because that was the only file in `.github/`, the whole directory is now gone. The repository therefore has **no CI and no automation at all**: nothing stops a commit from breaking the build, the typecheck, or the byte-identical BBCode guarantee.

This task adds `.github/workflows/ci.yml`, which runs lint, typecheck, tests, and build on every push to `main` and on every pull request. It replaces the deleted Pages workflow. It does **not** deploy anything — Vercel's own Git integration handles deployment.

This is a single-file task: create `.github/workflows/ci.yml` (and the `.github/workflows/` directories along with it). Modify nothing else.

## Dependencies

**Depends on:** None (Wave 1)
**Blocks:** task-03-commit-and-push.md

**Context from dependencies:** None. This is a Wave 1 task with no prerequisites.

## Files to Create

- `.github/workflows/ci.yml` — CI workflow running lint, typecheck, tests, and build

## Files to Modify

None.

## Technical Details

### Commands to run in CI — all verified

Every command below was run locally and its exit code confirmed. Use exactly these.

| Step | Command | Verified exit code |
|---|---|---|
| Install | `npm ci` | 0 (lockfile is v3 and in sync with `package.json`) |
| Lint | `npm run lint` | 0 |
| Typecheck | `npx tsc --noEmit` | 0 |
| Test | `npm test` | 0 on pass, **1 on failure** |
| Build | `npm run build` | 0 |

The test step genuinely gates: mutating a template literal in `lib/bbcode.ts` makes `npm test` exit 1. Do not add `continue-on-error` to any step.

### Node version

**Pin Node 24.** `npm test` runs `.test.ts` files directly via `node --test`, which relies on Node's native TypeScript type-stripping — introduced in Node 22.6 and stable in Node 24. On an older Node the test step fails to parse TypeScript at all.

The rebuild was verified on Node `v24.15.0`. Use `node-version: 24` in the workflow.

Do not add a matrix. One Node version is sufficient and keeps the check fast.

### The `next-env.d.ts` detail

`next-env.d.ts` is gitignored and is **not** committed. This was verified: `next build` regenerates it, so a clean CI checkout typechecks and builds fine without it.

This matters for step ordering. Run the build **after** the typecheck is not required — but if a future change ever makes the typecheck depend on generated types, running `npm run build` before `npx tsc --noEmit` would be the fix. As it stands, either order works. Keep the order below for readability.

### Recommended workflow

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

# Cancel a run that is superseded by a newer push to the same ref.
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm

      - name: Install
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
```

**Pin the actions to `v7`, not the more familiar `v4`.** Both `actions/checkout@v4` and `actions/setup-node@v4` declare `using: node20` — they execute on Node 20, which GitHub is actively deprecating. The `v7` majors declare `using: node24` and are the current releases (verified: `actions/checkout@v7.0.1`, `actions/setup-node@v7.0.0`). Using `v4` works today but invites a deprecation warning and eventual breakage.

### Why no deploy job

Deployment moved from GitHub Pages to Vercel, whose Git integration builds and deploys on push without a workflow file. The app is fully static — `npm run build` prerenders `/` and `/_not-found` — so Vercel needs no configuration. Adding a deploy job here would duplicate it and require a Vercel token as a repository secret.

### Why no `permissions` block

The default `GITHUB_TOKEN` permissions are sufficient for a checkout-and-run job. The deleted Pages workflow needed `pages: write` and `id-token: write`; this one does not, and requesting them would be unnecessary privilege.

## Acceptance Criteria

- [ ] `.github/workflows/ci.yml` exists
- [ ] The workflow triggers on push to `main` and on pull requests
- [ ] It pins Node 24
- [ ] It uses `actions/checkout@v7` and `actions/setup-node@v7` (not `v4`, which runs on the deprecated Node 20 runtime)
- [ ] It uses `npm ci` (not `npm install`) for a reproducible install
- [ ] It runs all four checks: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`
- [ ] No step sets `continue-on-error: true`
- [ ] The workflow contains no deploy step and no Pages actions
- [ ] The YAML is valid and the file parses as a GitHub Actions workflow
- [ ] No other file is created or modified

## Notes

- `.github/` does not currently exist — it was removed when its only file was deleted. Create the full path.
- The npm cache key is handled by `actions/setup-node` with `cache: npm`, which reads `package-lock.json`. Do not hand-roll a `actions/cache` step.
- Keep the job name simple (`check`). Nothing depends on it.
