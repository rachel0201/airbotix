# `airbotix.ai/install/kids` — install endpoint hosting design

> How the `curl -fsSL https://airbotix.ai/install/kids | sh` command actually works. Where the install script lives. How we sign it. How we version it. What happens when a parent runs it on day 1, day 30, day 365.
>
> **Audience**: the Airbotix-AI/airbotix marketing-site engineering team, and anyone diagnosing why a family's `kids-opencode` install failed.
>
> **Status**: design doc. Implementation pending (V0 launch readiness item).

---

## TL;DR

A parent runs:

```sh
curl -fsSL https://airbotix.ai/install/kids | sh
```

Behind the scenes:

1. CloudFront serves the URL `airbotix.ai/install/kids` from an S3 bucket (`s3://airbotix-installers-public/kids/install.sh`)
2. The S3 file is the **release-tagged** `install.sh` from `kidsinai/kids-opencode`
3. The script then `curl`s the kernel binary from a separate public artifact location
4. The script then `opencode plugin install @kidsinai/kids-opencode-plugin` to bring the plugin from npm
5. Drops the kid-safe config and the `kids-opencode` wrapper

Plus checksum verification at each step.

---

## 1. The user-facing URL

```
https://airbotix.ai/install/kids
```

Always.

This URL is **stable**. We never break it. If we redesign the install flow, we redirect or version under it (e.g., `airbotix.ai/install/kids?v=2`).

Marketing materials, school onboarding PDFs, parent emails, even printed posters in workshop venues — all of these can confidently quote this URL.

---

## 2. The serving stack

```
Parent's terminal
       │
       │  curl -fsSL https://airbotix.ai/install/kids
       ▼
[Cloudflare DNS]              (DNS only; orange-cloud disabled to allow ACM cert)
       │
       ▼
[AWS CloudFront distribution]  (signed by ACM cert in us-east-1)
       │
       ▼
[S3 origin: s3://airbotix-installers-public/kids/install.sh]
       │
       ▼  contents of install.sh
       │
       ▼
   | sh    (executed in parent's shell)
       │
       ▼
   install.sh runs, fetches:
   - upstream opencode binary (curl https://opencode.ai/install | sh)
   - @kidsinai/kids-opencode-plugin (opencode plugin install ...)
   - config template (curl from same airbotix-installers-public bucket)
```

All AU-served. All over TLS.

### 2.1 Why CloudFront + S3, not Cloudflare Workers or Vercel

Per `~/Documents/sites/airbotix/CLAUDE.md`:

> ❌ Do NOT introduce Fly.io / Vercel / Cloudflare Pages for any app — frontends on S3 + CloudFront, backend on AWS EC2

`install.sh` is a static file. S3 + CloudFront is the right pattern. Cloudflare DNS layer stays because we already control DNS there and ACM certificate validation works through Cloudflare DNS without orange-cloud.

### 2.2 Region

CloudFront edge is global, but **the origin is `ap-southeast-2` (Sydney)** to satisfy our "AU user data stays in `ap-southeast-2`" hard rule. Cache hits at the edge are fine; misses go back to Sydney.

---

## 3. Where the install script comes from

The install script's authoritative source is **`kidsinai/kids-opencode/install.sh`** in the main branch.

Whenever we tag a release on `kidsinai/kids-opencode` (`v0.0.1`, `v0.0.2`, etc.), GitHub Actions publishes the install.sh to the S3 bucket.

### 3.1 GitHub Actions deploy workflow

Pseudo-yaml (real implementation belongs in `kidsinai/kids-opencode/.github/workflows/publish-installer.yml`):

```yaml
on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      id-token: write      # OIDC for AWS
      contents: read
    steps:
      - uses: actions/checkout@v4
      - name: Compute SHA-256 of install.sh
        run: |
          sha256sum install.sh > install.sh.sha256
      - name: Compute SHA-256 of bin/kids-opencode
        run: |
          sha256sum bin/kids-opencode > bin/kids-opencode.sha256
      - name: Configure AWS via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::[ACCOUNT]:role/kids-opencode-installer-publisher
          aws-region: ap-southeast-2
      - name: Publish current-stable
        run: |
          aws s3 cp install.sh s3://airbotix-installers-public/kids/install.sh \
            --cache-control "public, max-age=300" \
            --content-type "text/x-shellscript"
          aws s3 cp install.sh.sha256 s3://airbotix-installers-public/kids/install.sh.sha256 \
            --cache-control "public, max-age=300"
          aws s3 cp bin/kids-opencode s3://airbotix-installers-public/kids/bin/kids-opencode \
            --cache-control "public, max-age=300" \
            --content-type "text/x-shellscript"
          aws s3 cp config/opencode.json.template s3://airbotix-installers-public/kids/config/opencode.json.template \
            --cache-control "public, max-age=300" \
            --content-type "application/json"
      - name: Publish versioned copy (for rollback / pinning)
        run: |
          VERSION="${GITHUB_REF#refs/tags/}"
          aws s3 cp install.sh s3://airbotix-installers-public/kids/$VERSION/install.sh \
            --cache-control "public, max-age=31536000"
          aws s3 cp install.sh.sha256 s3://airbotix-installers-public/kids/$VERSION/install.sh.sha256 \
            --cache-control "public, max-age=31536000"
          aws s3 cp bin/kids-opencode s3://airbotix-installers-public/kids/$VERSION/bin/kids-opencode \
            --cache-control "public, max-age=31536000"
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id [DIST_ID] \
            --paths "/install/kids" "/install/kids/*"
```

Notes:
- "current-stable" sits at the top of the bucket prefix; CloudFront's `airbotix.ai/install/kids` URL maps to that
- Each version also gets a **frozen, immutable copy** at `airbotix.ai/install/kids/v0.0.1/install.sh` etc. — never invalidated. For rollback. For audit trail. For schools that want to pin a specific version for the year.
- `--cache-control max-age=300` for current-stable (CloudFront re-fetches every 5 minutes)
- `--cache-control max-age=31536000` (1 year) for versioned copies — they never change

### 3.2 Hash verification flow

`install.sh` itself includes the expected SHA-256 of `bin/kids-opencode`:

```sh
#!/usr/bin/env sh
# install.sh
EXPECTED_WRAPPER_SHA="abc123..."   # set by release pipeline at tag time
...
curl -o /tmp/kids-opencode https://airbotix.ai/install/kids/bin/kids-opencode
ACTUAL=$(shasum -a 256 /tmp/kids-opencode | awk '{print $1}')
if [ "$ACTUAL" != "$EXPECTED_WRAPPER_SHA" ]; then
  echo "kids-opencode: integrity check failed; aborting"
  exit 1
fi
```

The release pipeline injects the SHA at tag time.

Why not verify `install.sh` itself with curl? Because the user is `curl ... | sh`-ing it; chicken and egg. We mitigate by:
- TLS-only (HTTPS enforced at CloudFront with HSTS preload)
- ACM-issued cert for `airbotix.ai`
- We publish the expected SHA of every release at `airbotix.ai/install/kids/install.sh.sha256` so paranoid families can fetch + verify before `| sh`. We document that path in the marketing copy.

For the "verify before pipe" workflow, marketing materials show:

```sh
# Paranoid mode (recommended for tech-savvy parents):
curl -fsSLO https://airbotix.ai/install/kids
curl -fsSLO https://airbotix.ai/install/kids.sha256
shasum -a 256 -c install.sh.sha256
sh ./install.sh
```

---

## 4. Versioning, pinning, rollback

### 4.1 Default user gets current stable

`https://airbotix.ai/install/kids` always serves the current stable version. Parents who paste the standard one-liner get whatever we currently bless.

### 4.2 Pinned versions

`https://airbotix.ai/install/kids/v0.0.1/install.sh` is a permanent immutable URL pointing at a specific release.

**Use cases:**
- Schools / workshops want a stable target for a semester — they pin
- Reproducible workshop environment for an audited course delivery
- Rolling back a bad release in the field — we point the marketing copy at the last good pinned version temporarily

### 4.3 Rollback procedure

If a release ships a regression:

1. Investigate via the audit log + reproduction
2. If urgent (safety-related), update marketing copy to point at the previous pinned URL **and** push a `revert-to-vX.Y.Z` tag on `kidsinai/kids-opencode` that re-publishes the older `install.sh` to the current-stable location
3. CloudFront invalidation (~3 minutes)
4. Notify families via the registered parent emails

### 4.4 Deprecation policy

We support every pinned version for **24 months from release** (older pinned versions still resolve but emit a deprecation warning at install). After 24 months we may remove the pinned URL.

The current-stable URL is never deprecated.

---

## 5. Failure modes & their handling

| Failure | What happens | Fix |
|---|---|---|
| Family is offline | curl times out | "Check your internet connection and try again" message in install.sh |
| `opencode.ai/install` is down | install.sh fails after upstream-opencode step | Custom error message + link to airbotix.ai/help/install-troubleshooting. Possible to bundle a pinned upstream binary in S3 for fallback (V1+) |
| npm scope `@kidsinai` is down | `opencode plugin install` fails | Custom error message. The plugin is small; we could mirror it to our S3 if npm has prolonged outage (V1+) |
| AWS Sydney outage | CloudFront origin fail | CloudFront serves stale content from edge for up to 24h; after that, manual failover to alternate origin |
| Family has bad TLS root certs (rare) | curl fails | Document a workaround in airbotix.ai/help/install-troubleshooting |
| Family is on a corporate / school proxy | curl fails | Document a workaround |
| Mac Gatekeeper / Windows SmartScreen blocks the binary | install fails | V0: provide a manual install path. V1: codesign the binaries (see §7) |
| Family has slow PATH propagation | `kids-opencode` not found after install | install.sh prints the right `export PATH=...` line at the end |

A full troubleshooting page lives at `airbotix.ai/help/install-troubleshooting`.

---

## 6. Security considerations

`curl | sh` has well-known criticisms. We address them.

### 6.1 Risks of `curl | sh`

| Risk | Mitigation |
|---|---|
| Man-in-the-middle injection | HTTPS-only, HSTS preload, ACM cert |
| Compromised origin (someone pushes a bad install.sh) | OIDC-only deploy from GitHub Actions; no human IAM keys with S3 write access; CloudTrail audit; mandatory PR review on `install.sh` changes |
| Compromised upstream opencode | Pin a specific opencode version in `install.sh`; review upstream releases before bumping the pin |
| Compromised npm `@kidsinai/kids-opencode-plugin` package | npm package can only be published from a CI workflow tied to a release tag; 2FA on the npm account; lockfile in repo |
| Compromised CDN edge | CloudFront origin-signed-request would detect this; we operate at "trust CloudFront" level (industry standard) |
| Compromised CA | Out of scope; if a CA is compromised the whole web breaks |
| Family pastes a fake URL from a phishing email | We document the real URL in obvious places. Marketing always points at `airbotix.ai/install/kids` — never link-shortened |

### 6.2 Marketing-page anti-phishing

Marketing materials promoting the install always:
- Use the literal URL `airbotix.ai/install/kids` (no `bit.ly`, no QR codes that could be swapped on a printed flyer)
- Include the current SHA-256 of `install.sh` as text the parent can compare
- Provide a "paranoid mode" path (§3.2) that fetches + verifies before piping

### 6.3 SBOM (Software Bill of Materials)

The install delivers, in this order:
1. `install.sh` itself (~2-3 KB shell script)
2. Upstream `opencode` CLI (its install method)
3. `@kidsinai/kids-opencode-plugin` via opencode's plugin manager
4. Config template

We publish an SBOM at `airbotix.ai/install/kids/sbom.json` (CycloneDX format) listing each component, its version, source URL, and license. Updated per release.

---

## 7. Codesigning (V1+)

Currently `install.sh` and `bin/kids-opencode` are POSIX shell scripts. They don't have a binary-signing surface. The codesigning question applies when we ship platform-native binaries (V1+):

- macOS: developer ID certificate + notarisation
- Windows: Authenticode certificate

V0 ships scripts; V1 may ship a self-contained `kids-opencode` binary for parents who don't want to manage opencode + plugin separately. Codesigning becomes a launch-blocker at V1.

---

## 8. Telemetry (V0: minimal)

The install script emits a single anonymous telemetry beacon on success:

```
POST https://api.airbotix.ai/telemetry/install
Body: { "version": "v0.0.1", "os": "darwin|linux", "arch": "arm64|x64", "outcome": "success|failed-stage-N" }
```

No personal information. No IP correlation (we strip IP server-side immediately). Used to count installs and detect regional / OS-specific install failures.

V1+ may add an opt-in "send error reports" channel for richer diagnostics.

---

## 9. Cost estimate

Steady-state monthly cost at 10,000 active families:
- S3 storage (install.sh + plugins + versioned archive): < $1/month
- CloudFront egress (assume 10 KB per install + 5 KB per stable check, 50,000 installs/month): ~$5/month
- Total: <$10/month

Negligible. No reason to optimise V0 cost.

---

## 10. Implementation owner & timeline

| Item | Owner | Target |
|---|---|---|
| Provision S3 bucket `airbotix-installers-public` + CloudFront distribution + DNS record | Airbotix-AI/airbotix marketing-site engineer | V0 -3w |
| Set up OIDC + GitHub Actions deploy role | Same | V0 -3w |
| Write the publish workflow YAML in `kidsinai/kids-opencode/.github/workflows/publish-installer.yml` | kidsinai/kids-opencode engineer | V0 -2w |
| First tagged release (`v0.0.1`) → end-to-end test of pipeline | Both | V0 -1w |
| SBOM generator | kidsinai/kids-opencode engineer | V0 |
| Troubleshooting page at airbotix.ai/help/install-troubleshooting | Marketing | V0 |
| Codesigning (V1+) | TBD V1 | V1 |

---

## 11. Open questions for Lightman

| Q | Decision needed |
|---|---|
| AWS account: shared with platform-backend or separate? | Suggest: separate AWS sub-account for installers (least-privilege blast radius) |
| npm scope `@kidsinai` ownership: just Lightman, or Lightman + named engineer? | Suggest: Lightman + a named senior engineer; both with 2FA mandatory |
| Codesigning budget: $99/year for Apple Developer + $500-1000 for Windows Authenticode | Suggest: defer to V1 launch; V0 ships unsigned scripts |
| Beta channel: should we offer `airbotix.ai/install/kids/beta` for pre-release testing? | Suggest: yes, but lock behind a flag for first 6 months |

---

## 12. Sources

- [opencode upstream install method (anomalyco/opencode)](https://opencode.ai/docs/install)
- [GitHub Actions OIDC for AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS CloudFront + S3 reference architecture](https://aws.amazon.com/architecture/)
- Internal: `kidsinai/kids-opencode/install.sh`, `kidsinai/kids-opencode/bin/kids-opencode`
- Internal: `airbotix/CLAUDE.md` (hosting hard rules)

---

## Revision history

| Version | Date | Note |
|---|---|---|
| 0.1 | 2026-05-15 | Initial design doc. Implementation pending V0 launch readiness. |
