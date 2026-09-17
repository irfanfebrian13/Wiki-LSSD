# Action Required: Ship the Next.js Rebuild

Manual steps that must be completed by a human. These cannot be automated.

## Before Implementation

None. All three tasks can be implemented automatically.

## During Implementation

None.

## After Implementation

- [ ] **Connect the repository to Vercel** — Sign in to [vercel.com](https://vercel.com), choose "Add New… → Project", and import `terhalangkasta/lssd-pocketbook`. Vercel auto-detects Next.js; accept the detected settings and deploy. No `vercel.json` is needed — the app is fully static and the build output already shows `/` and `/_not-found` prerendered.

- [ ] **Verify the deployed URL** — Once deployed, open the production URL and confirm the page renders. Then hard-refresh a deep link (`https://<deployment>/` followed by `#ten-codes`) to confirm the anchor scrolls to the Ten Codes section and the sidebar highlights it. This is the one behaviour that depends on client-side JS running after load.

- [ ] **Confirm the CI workflow runs** — Open the repository's **Actions** tab and confirm the `CI` workflow triggered on the push to `main` and completed green. If it did not trigger, check that Actions is enabled under **Settings → Actions → General**.

- [ ] **Disable the old GitHub Pages deployment if it is still active** — The Pages workflow was deleted in the rebuild, but the Pages site itself may still be enabled under **Settings → Pages**. If so, set Source to "None" so the stale vanilla-JS build stops serving at the old URL.

---

> These tasks are also referenced in context within the relevant task files.
