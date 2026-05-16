# `airbotix.ai/install/kids` — Kids OpenCode install endpoint

> Owner: airbotix repo · Last updated: 2026-05-16

## What it serves

The URL `https://airbotix.ai/install/kids` returns the POSIX shell installer for [`kidsinai/kids-opencode`](https://github.com/kidsinai/kids-opencode). End users run:

```bash
curl -fsSL https://airbotix.ai/install/kids | sh
```

This is referenced in the Kids OpenCode docs, README, and the `kids-opencode --update` subcommand.

## How it's served

Static file at `public/install/kids` in this repo. Vite's `public/` convention copies it verbatim to `dist/install/kids` at build time; `gh-pages -d dist` publishes that to GitHub Pages at the matching path. No extension on purpose — the URL is `/install/kids`, not `/install/kids.sh`.

Content type defaults to `text/plain` from GitHub Pages, which `curl | sh` handles correctly.

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

## SHA-256 verification

The installer downloads `bin/kids-opencode` from raw.githubusercontent and verifies it against a SHA pinned inside `install.sh` itself (`EXPECTED_WRAPPER_SHA`). That pin is filled at kids-opencode release-tag time by their CI. Our `public/install/kids` copy carries the same pin transitively — no extra verification needed on the airbotix side.

## Failure modes

| Failure | What user sees | Where to look |
|---|---|---|
| GitHub Pages serving stale file | Installer references missing assets / old SHA mismatch | Run `npm run sync:kids-installer` + redeploy |
| GitHub Pages outage | `curl` 5xx | Status: status.github.com; affected ~1-2x/year |
| Cloudflare DNS misconfig | `curl` cannot resolve `airbotix.ai` | Cloudflare DNS dashboard for airbotix.ai |
| Upstream raw.githubusercontent down | `sync:kids-installer` fails | GitHub raw.githubusercontent status |

## Related

- Kids OpenCode installer source: `~/Documents/sites/kidsinai/kids-opencode/install.sh`
- Client architecture PRD: [`docs/product/prd/kids-opencode-client-prd.md`](../product/prd/kids-opencode-client-prd.md) §7 (Onboarding)
- Marketing site deploy notes: [`docs/infrastructure/`](.)
