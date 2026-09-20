# Action Required: Field Manual Restyle

Manual steps that must be completed by a human. These cannot be automated.

## Before Implementation

- [ ] **Confirm Google Fonts reachability from the build environment** — `next build` downloads and
      self-hosts Fraunces, IBM Plex Sans, IBM Plex Mono and Barlow Condensed. If the build must work
      fully offline, say so before task-01 starts and the font files will be vendored into the repo
      instead (a different approach to the same task). Verified reachable from this machine.

## During Implementation

- [ ] **Review each wave before the next starts.** The original brief asked for a stop for review after
      each phase; the wave boundaries in this spec match those phases:
      - Wave 1 → tokens, fonts, base styles, presentation helpers
      - Wave 2 → primitives, read-only components, client state
      - Wave 3 → transmission, section view, generators, chrome
      - Wave 4 → the shell rewrite
      - Wave 5 → verification

- [ ] **Visual sign-off on the cover, tab strip and chapter layout (after Wave 4).** These are the
      structural decisions that are hard to reverse cheaply, and they are the ones the brief describes
      most loosely.

## After Implementation

- [ ] **Decide whether to keep or delete `design-reference/`.** It is untracked and gitignored. It was
      the source of truth for this work, but nothing imports it, so it can be removed once the restyle
      is accepted.

- [ ] **Commit the work.** Per the project convention, commit messages end with the trailer:
      `Co-Authored-By: Claude Code <noreply@anthropic.com>`. The `design-reference/` directory is
      untracked and should be excluded, matching the existing `.gitignore` entry.

- [ ] **Confirm the `prefers-reduced-motion` decision still stands.** The brief asked for the motion to
      be gated on that preference; this spec deliberately does not do so, matching the repo's documented
      policy and commit `722b380`. If the brief's requirement should win after all, it is a small,
      isolated change in `app/globals.css` — but it reverses a deliberate earlier decision, so it needs
      an explicit call rather than an assumption.

---

> These tasks are also referenced in context within the relevant task files.
