# `airbotix.ai/install/kids` — Kids OpenCode install endpoint

> Owner: airbotix repo · Last updated: 2026-05-16

## What it serves

The URL `https://airbotix.ai/install/kids` returns the POSIX shell installer for [`kidsinai/kids-opencode`](https://github.com/kidsinai/kids-opencode). End users run:

```bash
curl -fsSL https://airbotix.ai/install/kids | sh
```

This is referenced in the Kids OpenCode docs, README, and the `kids-opencode --update` subcommand.

## How it's served

Static file at `public/install/kids` in this repo. Vite's `public/` convention copies it verbatim to `dist/install/kids` at build time; the GitHub Actions workflow `.github/workflows/deploy.yml` publishes the `dist/` artifact to GitHub Pages on push to `main`. `npm run deploy` (using the `gh-pages` package) is the manual escape hatch. No extension on purpose — the URL is `/install/kids`, not `/install/kids.sh`.

Content type defaults to `text/plain` from GitHub Pages, which `curl | sh` handles correctly.

The custom domain `airbotix.ai` is pinned by `public/CNAME` (copied verbatim into `dist/CNAME` by Vite). This protects both deploy paths — the GitHub-Actions path preserves the Pages-settings custom domain independently, but the `gh-pages -d dist` path would lose it without the file.

## Keeping it in sync with upstream

The source of truth is `kidsinai/kids-opencode/install.sh`. When that file changes, re-sync this copy:

```bash
npm run sync:kids-installer
```

The script uses `gh api` to fetch the file content. `kidsinai/kids-opencode` is a private repo, so `raw.githubusercontent.com` 404s without auth — `gh api` carries your authenticated token automatically. Requires `gh auth login` to have been run once.

After running, commit + deploy:

```bash
git add public/install/kids
git commit -m "chore(install): sync kids-opencode installer to <sha>"
npm run deploy
```

### When to sync

Manually trigger after a kids-opencode `install.sh` change lands on `main`. There is **no automatic sync** today — intentional, because:

- Installer changes are rare (security baseline ~ once per quarter)
- Auto-pulling from `main` would risk shipping a partial commit
- We want a human review before publishing a `curl ... | sh` payload

Future automation: a GitHub Action that watches kidsinai/kids-opencode's install.sh and opens a PR here. Not built yet.

## SHA-256 verification — current state vs target

**Today (2026-05-16):** `EXPECTED_WRAPPER_SHA` inside the installer is still the literal placeholder `"REPLACED_AT_RELEASE_TAG"`. When end users run `curl ... | sh`, the script's fallback branch fires:

```
ℹ️  dev install (no pinned SHA in this script). Wrapper SHA-256: <computed>
```

That branch only **prints** the wrapper SHA, it does not compare against a pinned value. **End users currently get no wrapper SHA verification.** This is acceptable for the pre-V0 dev-install window but must close before public V0.

**Target state (blocks public V0):** kids-opencode release-tag CI substitutes `EXPECTED_WRAPPER_SHA` with the real SHA before tagging. Our `npm run sync:kids-installer` then pulls the substituted copy and our `public/install/kids` carries a real pin. Once that flow is live, the failure mode "wrapper tampered in transit" becomes detectable.

**Drift detection (this repo's responsibility):** run `npm run check:installer-drift` before any deploy. It compares `public/install/kids` against the local upstream clone (`--remote` mode hits `gh api`). It also warns loudly if the placeholder is still in the file, so the gap above can't be forgotten.

```bash
npm run check:installer-drift           # uses local kidsinai/kids-opencode clone
npm run check:installer-drift -- --remote   # fetches via gh api (CI-friendly)
```

## Failure modes

| Failure | What user sees | Where to look |
|---|---|---|
| GitHub Pages serving stale file | Installer references missing assets / old SHA mismatch | Run `npm run sync:kids-installer` + redeploy |
| GitHub Pages outage | `curl` 5xx | Status: status.github.com; affected ~1-2x/year |
| Cloudflare DNS misconfig | `curl` cannot resolve `airbotix.ai` | Cloudflare DNS dashboard for airbotix.ai |
| Upstream raw.githubusercontent down | `sync:kids-installer` fails | GitHub raw.githubusercontent status |

## Post-deploy smoke test

After a deploy lands, verify the endpoint returns the expected installer end-to-end:

```bash
expected=$(shasum -a 256 < public/install/kids | awk '{print $1}')
served=$(curl -fsSL https://airbotix.ai/install/kids | shasum -a 256 | awk '{print $1}')
[ "$expected" = "$served" ] && echo "✓ live matches repo" || echo "✗ drift between repo and live"
```

Cloudflare caches by URL; if you re-deploy the installer, the live response may lag behind by up to the configured TTL.

## Related

- Kids OpenCode installer source: `~/Documents/sites/kidsinai/kids-opencode/install.sh`
- Client architecture PRD: [`docs/product/prd/kids-opencode-client-prd.md`](../product/prd/kids-opencode-client-prd.md) §7 (Onboarding)
- Marketing site deploy notes: [`docs/infrastructure/`](.)
