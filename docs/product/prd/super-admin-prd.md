# Super-Admin — Operations & Break-Glass Surface — PRD

> **Status**: Draft v0.3 · 2026-05-25
> **Scope**: `super_admin` role-specific surfaces inside `teacher.airbotix.ai/admin/system/*`
> **Author**: Airbotix engineering
> **Depends on**: `auth-system-prd.md` (TOTP step-up), `platform-backend-api-spec.md` (admin endpoints), `audit-event-schema-prd.md` (audit envelope)
> **Sibling**: `teacher-console-prd.md` §1.1, §4.16, §7 — defines the multi-role console; this PRD is the **deep dive on super-admin only**
> **Supersedes**: `_archived/super-admin-mangement-system-prd.md` (Supabase-era; deprecated 2026-05-14)

---

## 1. Purpose

The `super_admin` role is the **founder / on-call SRE break-glass tier**. It exists to do four jobs that no other role (`teacher`, `admin`, `parent`, `kid`) can do:

1. **System-wide configuration** — change defaults that affect every family (wallet caps, topic limits, LLM model registry, feature flags)
2. **Impersonation & forensics** — investigate incidents by viewing the platform through a specific user's lens, with a fully-audited one-shot session
3. **Manual data correction** — break-glass wallet adjustments, GDPR/COPPA deletion fulfilment, model retirement, super-admin lifecycle
4. **Audit accountability** — see what other super-admins did (admins can't), so the tier can't quietly collude

This PRD specifies **what super-admin can do, the security posture around it, and the UX of `/admin/system/*`**. It does **not** re-spec what super-admin inherits from `admin` (Families, Wallet ops, Incidents, Course packs, Refunds — see `teacher-console-prd.md` §4.6–4.15).

### 1.1 Non-goals (V0)

- Multi-tenant operator dashboard (no white-label / reseller management — Airbotix is single-tenant)
- Customer support chat / ticket system (use external — Linear / Slack)
- Real-time dashboards (Grafana / Datadog handle infra; this surface is for **application-level** ops only)
- Self-service super-admin onboarding by another super-admin without a co-sign (V0: founders create each other manually via Prisma; V1+: in-app invite — see §11 Q3)

---

## 2. Personas

| Persona | Headcount V0 | Primary need |
|---|---|---|
| Founder (engineering co-founder) | 1–2 | Cut new releases, respond to incidents, set platform-wide config |
| On-call SRE | 0–1 (post-Seed) | Break-glass during PagerDuty escalation; should never need to touch raw DB |

Both are **internal staff with TOTP enrolled and a hardware key (V1+)**. Never customers. Never contractors.

---

## 3. Security posture

Super-admin is the largest-blast-radius role on the platform. Hardening is non-negotiable.

### 3.1 Authentication (per `auth-system-prd.md` §6)

| Layer | Requirement |
|---|---|
| Email OTP | Same flow as `admin` / `teacher` (6-digit OTP via SendGrid) |
| **TOTP step-up** | **Required for every login.** Authenticator app (Google Authenticator / 1Password). Backend: `/auth/totp/enroll` + `/auth/verify-totp`. Stored encrypted (`TOTP_ENCRYPTION_KEY`). |
| Refresh token TTL | 30 days, rotating, revoke trip-wire on re-use (same as adult parent) |
| Access token TTL | **15 min** (same as everyone else; super-admin gets no convenience exemption) |
| Session limit | Max 3 active refresh tokens per super-admin; oldest auto-revoked on 4th login |
| Hardware key (V1+) | WebAuthn second factor, replacing TOTP; required before any V1 super-admin lifecycle endpoint goes live |
| IP allowlist (V1+) | Optional per-super-admin allowlist (founder home + office + VPN egress). Soft-warn in V0 (audit-only); hard-block V1+. |

### 3.2 Per-action step-up

Some super-admin actions are too dangerous to authorize with the initial TOTP. They require a **fresh TOTP within last 5 min**:

| Action | Step-up required? |
|---|---|
| Read audit / impersonate / view system health | ✗ (initial TOTP at login is enough) |
| `PATCH /admin/system/wallet-defaults` | ✓ |
| `PATCH /admin/system/topic-defaults` | ✓ |
| `POST /admin/models` / `PATCH` / `DELETE` (LLM registry) | ✓ |
| `POST /admin/impersonate` | ✓ |
| `POST /course-packs/:id/publish` / `POST /course-packs/:id/unpublish` (D-SA4) | ✓ |
| Manual wallet credit/debit ≥ 1000 Stars (V1+) | ✓ |
| GDPR/COPPA deletion fulfilment (V1+) | ✓ |
| Create / revoke another super-admin (V1+) | ✓ + co-sign by another super-admin within 24h |

Frontend: a `<StepUpGate>` HOC intercepts the action, prompts for current TOTP code, calls `/auth/verify-totp?purpose=step_up`, and only then proceeds.

**D-SA4 — Course Pack publish is step-up gated** (added v0.3). Publishing or unpublishing a `CoursePack` affects every kid currently using it (mid-mission migration semantics per `learn-missions-prd.md` §9). Blast radius is comparable to a wallet-defaults change, so the same step-up posture applies. This is enforced for the `admin` role too — not just super-admin — because admin owns Course Pack CRUD per `teacher-console-prd.md` §4.14. Implementation: backend `/course-packs/:id/publish` requires `x-totp-step-up` header (verified within 5 min); frontend `teacher-console` Publish button mounts `<StepUpGate>`.

### 3.3 Audit isolation (D-SA1)

Super-admin AuditEvents are written with `actor=super_admin` and are **redacted from the standard admin audit view**. Only other super-admins can see them. Rationale: prevent an `admin` from observing a founder's break-glass action and inferring sensitive context (e.g. an unannounced refund pattern). Trade-off: blind spot for admin-tier oversight — accepted on the assumption that the super-admin tier is internally policed via §7 (audit + co-sign).

---

## 4. Capability matrix (super-admin only)

Everything `admin` can do is inherited (see `teacher-console-prd.md` §7). The table below is the **super-admin-only delta**:

| Capability | Backend endpoint | Frontend page | Step-up | Status |
|---|---|---|---|---|
| View system health | `GET /admin/system/health` | `/admin/system/health` | ✗ | ✅ Backend done |
| Forensic audit query (filter+export) | `GET /admin/audit?filter=...` | `/admin/system/audit` | ✗ | 🟡 Backend partial (filter ok; export CSV V1+) |
| Impersonate a user (15-min) | `POST /admin/impersonate` | `/admin/system/impersonate` | ✓ | ✅ Backend done; UI pending |
| Edit wallet defaults | `PATCH /admin/system/wallet-defaults` | `/admin/system/wallet-defaults` | ✓ | ✅ Backend done; UI pending |
| Edit topic defaults | `PATCH /admin/system/topic-defaults` | `/admin/system/topic-defaults` | ✓ | ✅ Backend done; UI pending |
| LLM models registry CRUD | `POST/PATCH/DELETE /admin/models` | `/admin/system/models` | ✓ | ✅ Backend done; UI pending |
| View other super-admins' audit | `GET /admin/audit?actor=super_admin` | `/admin/system/audit` (toggle) | ✗ | 🟡 Backend filter ok; UI toggle pending |
| Manual wallet credit/debit (any amount) | `POST /admin/families/:id/wallet/adjust` | `/admin/families/:id` (existing admin page; super-admin can exceed admin cap) | ✓ (≥1000 Stars) | ⬜ Backend cap logic pending |
| GDPR/COPPA deletion fulfilment | `POST /admin/families/:id/erase` | `/admin/system/erasure` | ✓ | ⬜ Not started |
| Create another super-admin | `POST /admin/users/promote` | `/admin/system/staff` | ✓ + co-sign | ⬜ Not started (V0: do via Prisma) |
| Revoke a super-admin | `POST /admin/users/demote` | `/admin/system/staff` | ✓ + co-sign | ⬜ Not started |
| Toggle feature flags (V1+) | `PATCH /admin/system/flags` | `/admin/system/flags` | ✓ | ⬜ Not started |
| Trigger emergency kill-switch (V1+) | `POST /admin/system/kill-switch` | `/admin/system/kill-switch` | ✓ + co-sign | ⬜ Not started |
| Async job pipeline monitor (Combine exports, etc.) — see §5.11 | `GET /admin/system/jobs` | `/admin/system/jobs` | ✗ | ⬜ Not started |
| Cross-family storage quota overview (per-family GB, top-N) | `GET /admin/system/storage` | `/admin/system/storage` | ✗ | ⬜ Not started |
| Overview / business / safety analytics | `GET /admin/analytics/{overview,business,safety}` | `/admin/system/analytics/{overview,business,safety}` | ✗ | 🟡 Schema-ready; only `llm-usage` shipped |
| Financial analytics (revenue / margin / LTV) | `GET /admin/analytics/financial` | `/admin/system/analytics/financial` | ✗ | ⬜ Super-admin only; not started |
| LLM cost & usage analytics | `GET /admin/analytics/llm-usage` | `/admin/system/analytics/llm` | ✗ | ✅ Backend done; UI pending |
| Analytics CSV export (V1+) | `POST /admin/analytics/:tab/export` | inline button on each tab | ✓ | ⬜ Not started |

---

## 5. Page-by-page blueprint — `/admin/system/*`

All pages live under the System nav section in the unified console (per `teacher-console-prd.md` §2 IA). Visible **only** when JWT has `role=super_admin`.

### 5.1 `/admin/system` — Home dashboard

Single page summarizing:
- System health card (Neon, S3, DeepRouter — green/yellow/red with last-checked timestamp)
- Recent super-admin actions (last 20, scoped to `actor=super_admin`)
- Pending dangerous ops (impersonation sessions still active, pending co-signs, recent ≥1000-Star adjustments)
- Quick-links to all sub-pages

Refresh: poll `GET /admin/system/health` every 30s; audit feed via existing WS audit-fanout channel filtered client-side.

### 5.2 `/admin/system/health`

Detailed health board:
- Per-service: status, latency p50/p95, last 5-min error rate
- Neon connection pool stats (active / idle / waiting)
- S3 presign roundtrip ms
- DeepRouter `/v1/models` echo latency + last error
- Read-only "logs since last incident" panel (last 200 lines, server-side ring buffer in NestJS — not stored in DB)

Out of scope: replacing Grafana / CloudWatch. This is a one-screen "is the platform OK right now" view, not infra observability.

### 5.3 `/admin/system/audit`

Forensic audit query:
- Filter: `event_type` (multi), date range, `actor_role`, `actor_id`, `family_id`, `kid_id`, `resource_type`, `resource_id`, free-text on `metadata` JSON
- Toggle "include super-admin actions" (default on for super-admin; not available to admin)
- Results table: time, actor, event_type, target, metadata excerpt, request_id
- Click row → drawer with full AuditEvent JSON + linked records (e.g. WalletTransaction id) + jump-to-resource buttons
- V1+: Export CSV (background job; emailed to requester; itself an AuditEvent)

### 5.4 `/admin/system/impersonate`

Workflow:
1. Search target user (email / family code / kid nickname; never by raw user id — too easy to typo into a wrong account)
2. Confirm modal showing target: email, role, family, last login, "Reason for impersonation" textarea (**required, min 20 chars**)
3. TOTP step-up
4. Backend mints a **15-min, non-refreshable, read-mostly** access token (see §6 below) and returns a one-shot login URL
5. Click URL → new tab opens as target user; orange banner at top: "Impersonating {nickname} — {time remaining} — End impersonation"
6. All actions during impersonation emit AuditEvent with `actor=super_admin (impersonating=target_id)` — both ids logged
7. Banner button "End impersonation" revokes the token and returns to super-admin session

V0 restriction: impersonation tokens **cannot** perform write operations on `/wallet/*`, `/auth/*`, or `/llm/*` endpoints — these reject if `impersonation_session_id` is present in the JWT (belt-and-suspenders; super-admin should do those via direct admin endpoints, never as the user).

### 5.5 `/admin/system/wallet-defaults` & `/admin/system/topic-defaults`

Simple form pages backed by `SystemConfig` table. Each save:
- Step-up TOTP modal
- AuditEvent with `event_type=system_config.update` + before/after JSON diff
- Confirmation toast with affected-family count estimate (e.g. "12,304 families will inherit new daily cap on next session")

### 5.6 `/admin/system/models`

LLM model registry CRUD:
- Table view: id, provider, model_id, display_name, enabled, default-for-role (kid / teacher / system), cost_per_1k_in, cost_per_1k_out, last_updated_by
- Create / edit modal: full DeepRouter model spec
- Toggle `enabled=false` disables for all new sessions (existing sessions finish on the old model)
- Delete is soft-delete (sets `deleted_at`); historical sessions retain their model reference

### 5.7 `/admin/system/analytics/*` — Analytics & insights

A tabbed dashboard surface that surfaces the 12–15 KPIs founders look at daily/weekly. **Not a replacement for a real BI tool.** For ad-hoc deep-slicing, founders use the Metabase sidecar (V1+) wired to a Neon read-replica; this in-app surface exists so the high-frequency questions don't need to leave the console.

All sub-pages are accessible to `admin` + `super_admin` **except** `/financial` (super_admin only — revenue, margin, LTV is sensitive). No PII in any analytics view — only `kid_id` / `family_id` / `class_id`, never email / nickname / prompt content. Every query is server-side cached **5 min** in-memory; UI has a "Refresh" button that forces re-query and emits an AuditEvent.

#### 5.7.1 `/overview` — One-glance daily dashboard

Single scrollable page, no filters. Top half = today's numbers + sparkline; bottom half = 30-day trend strip.

| Card | Metric | Source |
|---|---|---|
| Active families | DAU / WAU / MAU (engaged = had ≥1 LearningSession) | `LearningSession`, `Family` |
| Active kids / parents / teachers | DAU split by role | `User`, `KidProfile`, `LearningSession` |
| New family signups | today / 7d / 30d | `Family.created_at` |
| Stars consumed | today / 7d / 30d | `WalletTransaction` where `tx_type=debit_llm` |
| LLM cost (USD) today | sum of `cost_usd` from session messages | `SessionMessage`, `Model` |
| Live incidents | count by severity | `Incident` open |

#### 5.7.2 `/business` — Growth & retention

Filters: date range (default 30d), product line (`workshop` / `subscription` / `kids_opencode`).

- **Signup → first-kid funnel**: family created → kid added → first session started → first project saved (4-bar funnel + drop-off %)
- **Retention curve**: D1 / D7 / D30 / D90 cohort retention by signup week
- **Class enrollment → completion rate**: per CoursePack
- **Family churn**: % families with 0 sessions in last 30d (was active in prior 30d)
- **Cohort heatmap**: signup week × weeks-since-signup, cell = % retained
- **NPS / CSAT** (V1+ — needs survey infra)

#### 5.7.3 `/financial` — Revenue & cost · **super_admin only**

Filters: date range, region (default AU only).

- **Revenue (AUD)**: today / MTD / YTD, with payment-method split from `AirwallexPayment`
- **Refunds**: count + AUD + ratio (refunded / gross)
- **Stars: purchased vs consumed**: top-up volume vs burn volume, outstanding liability = Σ wallet balances × Star→AUD rate
- **LLM gross margin**: (Stars consumed × Star→AUD rate) − (DeepRouter USD cost × FX). Displayed daily + 30d rolling
- **Per-family LTV bucket**: D30 / D90 / D180 lifetime revenue distribution histogram
- **Top 20 paying families**: family code (no name), total AUD, last payment date — for retention outreach

#### 5.7.4 `/llm` — LLM usage analytics

Backed by existing `GET /admin/analytics/llm-usage`. Extends UI:

- **Token consumption by model**: stacked bar (input vs output) per model, 7d/30d
- **p50/p95 latency by model**: line chart, freshness alarm when p95 > SLA
- **Top 20 kids by token burn**: `kid_id` + age + tokens + Stars debited (no nickname)
- **Per-class avg tokens / session**: bar chart, sort by outlier classes
- **Model failure rate**: DeepRouter 4xx / 5xx as % of calls, per model
- **Cost by topic**: story / music / code / game — pulled from `LearningSession.studio_kind`

#### 5.7.5 `/safety` — Moderation & compliance signals

- **Moderation reject rate**: % of LLM responses rejected by topic, 7d/30d
- **Incident funnel**: by `IncidentKind` × `IncidentSeverity`, daily trend
- **Approval requests**: pending / approved / rejected counts; median time-to-decision
- **Share request stage funnel**: kid submit → teacher review → parent review → approved/rejected
- **Time-to-resolve incidents**: p50 / p95 by severity
- **Compliance pauses**: count of parent-triggered pauses, kid suspensions (incident-driven), TOTP enrollment lapses

**Class Wall sub-section** (per `learn-classroom-prd.md` §6 UGC reports — added v0.3):

- **Wall report rate**: reports per 1k wall views, 7d/30d, by class — outlier classes flag for teacher coaching
- **Report reason breakdown**: `feels_bad` / `mean` / `inappropriate_content` distribution, daily trend
- **Repeat reporters**: kids who reported ≥3 items in 7d (false-report pattern; surfaces to teacher coaching, NOT to the kid)
- **Repeat-reported kids**: kids whose Projects have been reported ≥2 times in 30d (welfare flag, not punitive — triggers teacher conversation)
- **Time-to-teacher-decision** on wall reports: p50 / p95; SLA target 24h (V0), 4h school-hours (V1)
- **Auto-hide → uphold rate**: % of soft-hidden Projects that get `visibility=private` upheld vs dismissed back to the wall (signal of report quality)

All wall metrics are computed from `AuditEvent` + `Incident` rows; no extra schema needed. Drill-down link from each KPI takes admin to `/admin/incidents?kind=ugc_report&...` (existing admin page in `teacher-console-prd.md` §4.13).

#### 5.7.6 Data architecture (D-SA3)

| Phase | Source | Cache | Notes |
|---|---|---|---|
| V0 | Direct Prisma queries against Neon primary | 5 min in-memory per (endpoint, params) | OK at ≤10k families; queries hand-tuned with explicit indexes |
| V1+ | Neon **read-replica** for analytics endpoints (separate connection pool) | 5 min | Add read-replica when primary CPU exceeds 40% from analytics queries |
| V1+ | Daily materialized view rollups (`mv_dau`, `mv_stars_daily`, `mv_llm_cost_daily`) refreshed via cron | n/a (mv is the cache) | Reduces overview page to single-row reads |
| V2+ | ClickHouse / DuckDB sidecar fed by CDC | n/a | Only if business analytics queries grow ≥ 100ms p95 |

**External BI**: Metabase deployed alongside platform-backend (separate EC2, read-replica only) for ad-hoc slicing. Founders get SSO via TOTP-gated link from `/admin/system/analytics/overview` ("Open Metabase →"). Not in V0 — wired in V1+ when first founder asks a question this PRD's pages can't answer.

#### 5.7.7 Export & sharing

- V0: copy table-to-clipboard button per table
- V1+: `POST /admin/analytics/:tab/export` → background job → emailed CSV link, 24h TTL, AuditEvent emitted
- Never auto-email to a non-staff address; never include PII

### 5.8 `/admin/system/staff` (V1+)

Super-admin lifecycle:
- List current super-admins: email, TOTP enrolled date, last login, IP allowlist status
- "Promote user to super-admin" — pick from existing `admin` users only (never promote `parent` or `teacher` directly; must be admin first)
- Two-step: initiator submits → second super-admin co-signs within 24h → promotion fires; otherwise expires
- Demote flow: same, but co-sign within 1h (faster path for incident response)

### 5.9 `/admin/system/erasure` (V1+)

GDPR/COPPA deletion fulfilment queue:
- Pending requests (came in via support email; admin triages then escalates here)
- Each request shows: family_id, requested-by, scope (full-family / single-kid / specific-project), retention window, status
- Action: "Execute erasure" — TOTP step-up + soft-delete cascade across Family / KidProfile / Project / Artifact / WalletTransaction / SessionMessage / Mission rows; hard-delete after 30-day grace window via cron
- All actions emit AuditEvent with high-retention tag (audit log keeps the *fact of erasure* even after data is gone — required by compliance)

### 5.10 `/admin/system/flags` & `/admin/system/kill-switch` (V1+)

Out of scope V0; see `teacher-console-prd.md` §11 Q. Tracked here for completeness.

### 5.11 `/admin/system/jobs` — Async job pipeline monitor (V1)

> Operational dashboard for async background work — Combine exports (PDF storybook + slideshow MP4 per `learn-projects-prd.md` §6), email batches (SendGrid OTP / approval pings), Airwallex webhook retries, materialized-view refreshes.

```
┌─────────────────────────────────────────────────────────────────┐
│ Async Jobs · last 24h                          [Refresh]        │
│                                                                 │
│ Queue          Pending   Running   Done    Failed   P95 dur    │
│ ──────────────────────────────────────────────────────────────  │
│ exports.pdf       3         1       412      8       11s       │
│ exports.mp4       7         2        96      4       38s       │
│ email.otp         0         0      4308      2        1.1s     │
│ webhooks.aw       0         0       182      0        420ms    │
│                                                                 │
│ Recent failures ────────────────────────────────────────────    │
│ 11:32 exports.mp4 job_abc · ffmpeg: codec h264 unsupported      │
│ 11:18 exports.pdf job_xyz · S3 upload 503; retry budget ex…    │
│ [Open failed → triage in /admin/system/audit?type=job.failed]   │
└─────────────────────────────────────────────────────────────────┘
```

| Metric | Threshold | Alert path |
|---|---|---|
| `exports.pdf` P95 dur | ≤ 15s | Slack `#airbotix-oncall` if breached for 10 min |
| `exports.mp4` P95 dur | ≤ 45s | Slack alert + PagerDuty if breached for 30 min |
| Failed jobs / 1k completed | ≤ 1% per queue | Slack alert; ⭐ refunds auto-triggered (per `learn-projects-prd.md` §6.2) |
| Pending queue depth | < 50 per queue | Slack alert if > 100 sustained 10 min |

**Actions** (no step-up — read-only V0/V1):
- Click a failed job → see full payload + error stack + `AuditEvent` lineage
- "Re-enqueue" (V1.1) — re-runs the job; debits ⭐ again only if previously refunded; emits `job.replayed` audit
- "Open in audit" — deep link into `/admin/system/audit?type=job.*&job_id=...`

**Data source**: BullMQ queue introspection (`platform-backend` runs BullMQ on Redis); no new persistent table. Job failure events are also mirrored to `AuditEvent (event_type=job.failed)` for compliance retention.

### 5.12 `/admin/system/storage` — Cross-family storage overview (V1)

> Read-only summary of S3 footprint, surfaced because `learn-projects-prd.md` §7 sets a 5 GB / family soft limit and ops needs to see who's pushing it.

```
┌─────────────────────────────────────────────────────────────────┐
│ Storage overview                                                │
│ Total: 1.4 TB across 8,210 families                             │
│ ──────────────────────────────                                  │
│ Families over 80% of 5GB cap         ▌▌▌▌▌▌▌▌▌  93             │
│ Families over 100%                   ▌▌▌  31                   │
│                                                                 │
│ Top 20 footprints                                               │
│ family_id     GB    kids   last_active   action                 │
│ fam_abc      4.9     2     3 days ago    [Open in /admin/fam.]  │
│ fam_def      4.7     1     today          [Open]                │
│ …                                                               │
└─────────────────────────────────────────────────────────────────┘
```

**Computed nightly** by a cron job that sums `Artifact.size_bytes` per `family_id` and writes a `FamilyStorageRollup` row (denormalized — querying S3 inventory on demand is slow + costly). UI reads the rollup table; "Refresh now" button forces a re-query (rate-limited 1/h).

Drill-down opens `/admin/families/:id` (existing admin page, `teacher-console-prd.md` §4.11) where the per-family quota is shown alongside Wallet + projects. Hard enforcement (block uploads at 100%) lives on the upload path in `platform-backend`, not in this dashboard.

---

## 6. Impersonation token contract (D-SA2)

| Property | Value |
|---|---|
| `sub` | target user id |
| `role` | target user role |
| `impersonated_by` | super-admin user id |
| `impersonation_session_id` | random uuid (also written to `AuditEvent.metadata`) |
| `aud` | `api.airbotix.ai` |
| `iat` / `exp` | issued-at + **15 min** TTL, non-refreshable |
| Refresh token | **not issued** (impersonation is single-session) |

### Backend enforcement
- Any endpoint that mutates wallet, auth, or LLM state checks for `impersonation_session_id` in the JWT and rejects with `403 IMPERSONATION_READ_ONLY`
- The impersonation token can call `GET /portal/*` and `GET /learn/*` data endpoints, and limited writes that are clearly support-shaped (e.g. mark a notification as read)
- Every API call by an impersonation token emits an extra AuditEvent line tagged `impersonated=true`

### Termination
- TTL expiry (silent — frontend banner counts down and force-redirects at 0)
- Explicit revoke via "End impersonation" button → `POST /auth/impersonate/end`
- Super-admin's own session ending revokes outstanding impersonation tokens

---

## 7. Audit & accountability

Per `audit-event-schema-prd.md`, super-admin actions emit AuditEvent. The events ship the same envelope as everyone else; the **redaction is at the query layer** in `audit.service.ts`:

```ts
// Pseudo: only super_admin sees super_admin actions
if (caller.role !== 'super_admin') {
  query.where.actor_role = { not: 'super_admin' };
}
```

### Mandatory `metadata` keys for super-admin events
- `reason` (free text, required — collected at action time)
- `step_up_verified_at` (timestamp of the TOTP step-up that authorized the action)
- `co_signed_by` (id of second super-admin, if action required co-sign)
- `impersonation_session_id` (if action happened during an impersonation)
- `client_ip` + `user_agent` (already part of base envelope)

### Retention
- Audit retention for super-admin actions: **7 years** (vs 90 days for parent/kid). Required because these are the events likely to be subpoenaed.

---

## 8. RBAC implementation hooks

Backend:
- `@Roles('super_admin')` on every route in §4 marked "super_admin only"
- Step-up gate: `@RequireStepUp()` decorator wraps endpoints — checks JWT for `last_totp_verified_at` within 5 min; returns `401 STEP_UP_REQUIRED` if stale, frontend re-prompts
- Co-sign gate: `@RequireCoSign()` decorator — creates a `PendingCoSignRequest` row, returns `202` with request id; second super-admin hits `POST /admin/co-sign/:id` to authorize

Frontend:
- `<RoleGate roles={['super_admin']}>` on the `/admin/system/*` route group (per `teacher-console-prd.md` §2)
- `<StepUpGate purpose="...">` HOC wraps each dangerous form/button (handles modal + re-prompt UX)
- "Super-admin mode" badge in header when current session has `role=super_admin` (so the founder always knows they're in the dangerous tier)

---

## 9. Out of scope (V0)

- Cross-region admin (single region Sydney only — see `CLAUDE.md` hard rules)
- Multi-tenant operator portal
- Sub-roles within super-admin (e.g. "billing-only super-admin") — not enough operators to justify
- Self-service super-admin password / TOTP reset (must contact another super-admin)
- API tokens for super-admin (no automation surface; super-admin actions are always interactive)

---

## 10. Success criteria (V0)

- All §4 "✅ Backend done" rows have a UI shipped under `/admin/system/*`
- Impersonation token contract (§6) is enforced server-side (rejects mutating endpoints with `403 IMPERSONATION_READ_ONLY`)
- Step-up TOTP gate works end-to-end on §3.2 actions
- Audit redaction (§7) confirmed by a test where `admin` cannot see `super_admin` rows
- Every super-admin route emits AuditEvent with the mandatory keys in §7
- Founder can complete a "discover incident → impersonate → diagnose → adjust wallet → log resolution" loop without touching raw DB

---

## 11. Open questions

| Q | Item | Resolution path |
|---|---|---|
| Q1 | Should impersonation be allowed for kid accounts? COPPA-adjacent. | Default V0: yes, but no LLM session can be initiated (kid LLM requires the kid's own login per compliance C7). Revisit with legal pre-Seed. |
| Q2 | Step-up TTL = 5 min vs 15 min? | V0: 5 min (paranoid); revisit after founder feedback if too friction-heavy. |
| Q3 | V1 self-service super-admin invite vs manual Prisma promotion forever? | V0: manual (only 1–2 super-admins, not worth the surface area). V1+ when team grows to 4+: add §5.7. |
| Q4 | Should `admin` see *that* a super-admin action happened (without seeing what)? | Open. Currently full redaction. Argument for "stub row" visible to admin so they don't suspect data inconsistency. Punt to post-V0. |
| Q5 | IP allowlist soft-warn vs hard-block in V0? | V0: audit-only (founders travel). Hard-block V1+ when SRE joins. |
| Q6 | Analytics `/financial` super_admin-only — but founders sometimes delegate revenue review to admin-tier ops. Open the page or stay strict? | V0: strict (super_admin only). Revisit when first non-founder ops hire lands. Soft-mitigation: per-card visibility flag in `SystemConfig` so super-admin can opt-in admin visibility for individual cards. |
| Q7 | Should LLM cost dashboards expose per-kid `kid_id` (no PII) for the top-20 burn list? Compliance C5 says strip kid metadata before LLM forwarding — but this is **observing** consumption, not forwarding. | Tentative yes (kid_id only, no nickname / age band only); confirm with legal before V0 ship. |

---

## 12. Implementation status snapshot (2026-05-25)

| Area | Backend | Frontend | Notes |
|---|---|---|---|
| Auth + TOTP | ✅ | 🟡 enroll UX exists; step-up gate missing | Block on §3.2 |
| Impersonation endpoint | ✅ | ⬜ | `/admin/system/impersonate` UI to build |
| System config (wallet/topic defaults) | ✅ | ⬜ | Forms + step-up |
| Models registry | ✅ | ⬜ | CRUD UI |
| System health | ✅ | ⬜ | Single page polling |
| Audit forensics | 🟡 filter ok | ⬜ | Export CSV V1+ |
| Analytics — `/llm` (existing endpoint) | ✅ | ⬜ | Backend done; UI chart pending |
| Analytics — `/overview`, `/business`, `/safety` | ⬜ | ⬜ | Backend endpoints to add; UI pending |
| Analytics — `/financial` (super_admin only) | ⬜ | ⬜ | Backend + UI pending |
| Analytics — materialized views (D-SA3 V1+) | ⬜ | n/a | Defer until DAU > 1k |
| Erasure / GDPR | ⬜ | ⬜ | V1+ |
| Staff lifecycle | ⬜ | ⬜ | V1+ |
| Feature flags / kill-switch | ⬜ | ⬜ | V1+ |

Conclusion: backend is ~60% there for V0 super-admin surface (analytics expands the gap). **The actual V0 work left is**: 3 new analytics endpoints (`overview` / `business` / `safety` / `financial`) + 7 frontend pages under `/admin/system/*` + the `<StepUpGate>` HOC.

---

## 13. References

- `teacher-console-prd.md` §1.1 (multi-role console scope), §2 (IA), §4.16 (super-admin section sketch), §7 (RBAC summary)
- `auth-system-prd.md` §6 (TOTP), §3 (refresh-rotation trip-wire)
- `platform-backend-api-spec.md` §5 (admin endpoint table)
- `audit-event-schema-prd.md` (event envelope, retention)
- `docs/product/compliance/minors-compliance.md` C1–C15 (impersonation + erasure constraints)

---

## Revision history

- **v0.3 — 2026-05-25** — Picked up deltas from the Missions / Projects / Classroom PRD splits. Added: §3.2 D-SA4 (Course Pack publish requires TOTP step-up — also enforced on admin role) · §4 capability matrix rows for async job monitor + cross-family storage · §5.7.5 Class Wall sub-section (6 new safety KPIs from `learn-classroom-prd.md` §6 UGC reports) · new §5.11 `/admin/system/jobs` for async job pipeline monitoring (Combine exports per `learn-projects-prd.md` §6) · new §5.12 `/admin/system/storage` for cross-family S3 footprint overview (`learn-projects-prd.md` §7). No new persistent schema required.
- **v0.2 — 2026-05-25** — Added §5.7 Analytics & insights (5 sub-pages: overview / business / financial / LLM / safety) + D-SA3 data architecture (Prisma → read-replica → materialized views → ClickHouse) + Metabase sidecar V1+. Bumped §5.7→5.8 (staff), §5.8→5.9 (erasure), §5.9→5.10 (flags). Added §11 Q6 / Q7 around analytics RBAC + kid privacy in cost dashboards.
- **v0.1 — 2026-05-25** — Initial draft, split from `teacher-console-prd.md` §4.16. Documents super-admin-only surfaces, security posture (TOTP + step-up + co-sign), impersonation token contract, audit isolation, V0 vs V1+ scope split.
