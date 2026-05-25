# platform-backend — API Spec & Data Model

> **Status**: Draft v0.2 · 2026-05-25
> **Repo**: `Airbotix-AI/platform-backend` (NestJS + Prisma + Neon + S3 Sydney)
> **Domain**: `api.airbotix.ai`
> **Consumers**: airbotix-app (`/portal/*` + `/learn/*`), teacher-console, kids-opencode (read-only for audit + wallet)
> **Author**: Airbotix engineering
> **Owner**: Airbotix-AI org
>
> **2026-05-25 (v0.2)**: §4.2 Wallet 扩展 auto-topup + anti-fraud topup-cap 字段；新增 `PaymentMethod`、`AutoTopupAttempt`、`UsageDaily` 模型；新增 `PaymentInitiator`、`AutoTopupStatus` 枚举；`TxType` 增加 `topup_auto`。§5.4 Wallet 端点扩展（auto-topup、payment-methods）；§5.10 webhook 增加按 initiator 路由 + MIT 注意事项；新增 §5.13 Usage Analytics 端点。§6 WS 增加 `wallet.low_balance` / `wallet.auto_topup_*` / `wallet.topup_limit_hit` 事件。

---

## 1. Purpose

This document specifies the **complete external API surface** of `platform-backend` — every REST endpoint, every WebSocket event, the full Prisma schema, the auth flow, error codes, and rate-limit policy.

It is the **contract** that all 3 frontends + kids-opencode build against. Backend implementation details (NestJS module structure, internal services, queue jobs) are out of scope here — covered in implementation-side docs once scaffolded.

**Why this exists**: writing the API contract before code prevents the 3 frontend teams from blocking on each other or making divergent assumptions. Schema-first is also Prisma's natural workflow.

---

## 2. Architecture Context

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   airbotix-app          teacher-console     kids-opencode        │
│   (parent + kid web)    (teacher web)       (local desktop)      │
│         │                      │                    │            │
│         └────────────┬─────────┴──────────┬─────────┘            │
│                      │                    │                      │
│                      ▼                    ▼                      │
│            ┌──────────────────────────────────┐                  │
│            │     platform-backend (NestJS)    │                  │
│            │     api.airbotix.ai              │                  │
│            │     REST + WebSocket             │                  │
│            └─────┬───────────┬────────┬───────┘                  │
│                  │           │        │                          │
│                  ▼           ▼        ▼                          │
│           Neon Postgres   AWS S3   DeepRouter /v1                │
│           (ap-se-2)      (Sydney)  (sg)                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Key principles

1. **All client calls hit platform-backend** — no direct LLM calls from frontends, no direct DB access, no direct S3 puts (use signed URLs)
2. **DeepRouter is invoked only by backend** — `platform-backend` is the gatekeeper that injects kid-safe context and meters Stars before forwarding to DeepRouter
3. **RBAC is enforced at NestJS Guard layer** — Postgres has no RLS; all access decisions live in code (testable, debuggable, no recursive policy bugs)
4. **Family-scoped multi-tenancy** — every query implicitly filters by `family_id`; super-admin can break out

---

## 3. Auth & Identity

### 3.1 Roles

| Role | Who | Capabilities |
|---|---|---|
| `parent` | Adult who creates a Family Account | Own family, kids, wallet, audit. Cannot see other families. |
| `kid` | Child profile under a Family | Cannot create accounts. Logs in via family-issued kid-token. Scoped to own projects + class wall (when authorized). |
| `teacher` | Airbotix instructor | Read/write own classes; read kids' progress within own class; cannot see parent contact details or wallet balances. |
| `admin` | Airbotix operations / customer support | All families read; targeted writes (Stars adjustments, refunds, class management); audit log of all admin actions. |
| `super_admin` | Founders / on-call SRE | Everything admin + schema changes + manual DB ops. Used only for incident response. |

### 3.2 Sessions

- **Parent / teacher / admin**: email OTP → 6-digit code → JWT (15min access) + Refresh Token (30 days)
- **Kid**: parent provisions a Kid Profile; kid logs in with either:
  - **Family code + nickname + 4-digit PIN** (set by parent, kid-memorable)
  - **6-digit class code** (one-shot, expires after class, for workshop scenarios)
- All sessions tied to `family_id` claim in JWT

### 3.3 OTP login flow

```
POST /auth/request-otp
  body: { email, role_hint?: 'parent' | 'teacher' }
  → 204 No Content (always, to prevent email enumeration)
  → email sent via SendGrid with 6-digit code, 10min TTL, max 5 attempts

POST /auth/verify-otp
  body: { email, code }
  → 200 { access_token, refresh_token, user, role }
  → 400 INVALID_OTP / 429 RATE_LIMITED

POST /auth/refresh
  cookie/header: refresh_token
  → 200 { access_token }

POST /auth/logout
  → 204, revokes refresh_token

GET /auth/me
  → 200 { user, family_id, role, kid_profiles[] }
```

### 3.4 RBAC enforcement

Every protected endpoint declares a `@Roles(...)` decorator:

```typescript
@Roles('parent')                 // parent only, scoped to own family
@Get('/families/:id/kids')

@Roles('teacher', 'admin')       // teacher within own class OR admin
@Get('/classes/:id/students')

@Roles('admin', 'super_admin')   // ops only
@Post('/admin/wallet/adjust')
```

Guard logic (NestJS):
1. Verify JWT signature + not expired
2. Load user from JWT `sub` claim
3. Check role in `@Roles(...)` matches
4. For family-scoped resources: assert `resource.family_id === user.family_id` (or user is admin)
5. For class-scoped (teacher): assert `class.teacher_id === user.id`
6. Audit-log every admin write action

---

## 4. Data Model (Prisma schema, V0)

> Full Prisma schema; comments indicate the **why**. Indexes specified for hot queries.

### 4.1 Identity & Family

```prisma
model Family {
  id            String   @id @default(cuid())
  name          String                                    // "The Wang Family"
  primary_email String   @unique                          // parent's login email
  region        String   @default("AU")                   // for region-aware compliance
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  deleted_at    DateTime?                                 // soft delete for GDPR / data deletion requests

  parents       User[]   @relation("FamilyParents")
  kids          KidProfile[]
  wallet        Wallet?
  projects      Project[]
  audit_events  AuditEvent[]
  approvals     ApprovalRequest[]
  class_enrolls ClassEnrollment[]

  @@index([deleted_at])
}

model User {
  id              String   @id @default(cuid())
  email           String   @unique
  hashed_password String?                                  // null = OTP-only login
  display_name    String?
  role            UserRole                                 // 'parent' | 'teacher' | 'admin' | 'super_admin'
  family_id       String?                                  // null for teacher/admin/super_admin
  family          Family?  @relation("FamilyParents", fields: [family_id], references: [id])
  phone           String?
  locale          String   @default("en-AU")
  created_at      DateTime @default(now())
  last_login_at   DateTime?
  deleted_at      DateTime?

  refresh_tokens  RefreshToken[]
  otp_attempts    OtpAttempt[]
  classes_teaching Class[] @relation("ClassTeacher")

  @@index([family_id])
  @@index([role])
}

enum UserRole {
  parent
  teacher
  admin
  super_admin
}

model RefreshToken {
  id          String   @id @default(cuid())
  user_id     String
  user        User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  token_hash  String   @unique                              // SHA-256 of token
  expires_at  DateTime
  revoked_at  DateTime?
  ip          String?
  user_agent  String?
  created_at  DateTime @default(now())

  @@index([user_id])
  @@index([expires_at])
}

model OtpAttempt {
  id          String   @id @default(cuid())
  user_id     String?                                      // null if email not yet registered
  user        User?    @relation(fields: [user_id], references: [id])
  email       String
  code_hash   String                                       // SHA-256, never store plaintext
  attempts    Int      @default(0)
  expires_at  DateTime                                     // now + 10min
  consumed_at DateTime?
  created_at  DateTime @default(now())

  @@index([email, created_at])
}

model KidProfile {
  id              String   @id @default(cuid())
  family_id       String
  family          Family   @relation(fields: [family_id], references: [id], onDelete: Cascade)
  nickname        String                                   // displayed name, may be pseudonym
  real_name       String?                                  // optional, never required, never displayed publicly
  age             Int                                      // 8-17
  date_of_birth   DateTime?                                // optional, more accurate than age
  pin_hash        String                                   // bcrypt hash of 4-digit PIN for kid login
  gender          String?                                  // self-disclosed, optional
  topic_limits    Json     @default("{}")                  // { 'violence': false, 'romance': false } parent config
  daily_star_cap  Int?                                     // null = inherit family cap
  is_active       Boolean  @default(true)
  created_at      DateTime @default(now())
  deleted_at      DateTime?

  projects        Project[]
  class_enrolls   ClassEnrollment[]
  audit_events    AuditEvent[]
  approvals       ApprovalRequest[]

  @@index([family_id])
}
```

### 4.2 Wallet & Payments (Stars)

```prisma
model Wallet {
  id              String   @id @default(cuid())
  family_id       String   @unique
  family          Family   @relation(fields: [family_id], references: [id], onDelete: Cascade)
  stars_balance   Int      @default(0)                     // never go negative; reject deduction if insufficient
  daily_used      Int      @default(0)                     // resets at 04:00 local time
  weekly_used     Int      @default(0)
  monthly_used    Int      @default(0)
  daily_cap       Int      @default(50)                    // family-wide; override per-kid via KidProfile.daily_star_cap
  weekly_cap      Int      @default(200)
  monthly_cap     Int      @default(600)
  per_request_cap Int      @default(5)                     // single agent turn max
  paused          Boolean  @default(false)                 // family one-click pause
  last_reset_daily   DateTime @default(now())
  last_reset_weekly  DateTime @default(now())
  last_reset_monthly DateTime @default(now())

  // ── Auto-topup config (D-WAL-01, parent-portal-prd §4.4.1) ──────────────
  auto_topup_enabled          Boolean  @default(false)
  auto_topup_threshold_stars  Int      @default(10)        // refill trigger; 5/10/20/50
  auto_topup_sku              String?                      // 'starter_10' | 'family_30' | 'mega_50'
  auto_topup_payment_method_id String?                     // FK PaymentMethod.id (nullable so disabling doesn't cascade)
  auto_topup_daily_cap_aud_cents   Int  @default(3000)     // A$30/day default, max A$10000
  auto_topup_monthly_cap_aud_cents Int  @default(20000)    // A$200/month default, max A$50000
  auto_topup_daily_used_aud_cents   Int @default(0)        // resets at 04:00 local time, same job as daily_used
  auto_topup_monthly_used_aud_cents Int @default(0)        // resets on calendar month boundary, parent local TZ
  auto_topup_failure_threshold Int    @default(3)          // consecutive fails before auto-pause
  auto_topup_consecutive_failures Int  @default(0)         // reset on success
  auto_topup_cooldown_minutes  Int     @default(15)        // min interval between attempts
  last_auto_topup_at           DateTime?

  // ── Anti-fraud topup limits (D-WAL-02, parent-portal-prd §4.4.2) ────────
  // Total topup (manual + auto). Defaults match parent-portal-prd §4.4.2.
  topup_daily_cap_aud_cents    Int     @default(20000)     // A$200/day; A$500 after phone verify
  topup_monthly_cap_aud_cents  Int     @default(100000)    // A$1000/month; A$3000 after phone verify
  topup_daily_used_aud_cents   Int     @default(0)
  topup_monthly_used_aud_cents Int     @default(0)
  topup_count_today            Int     @default(0)         // manual topups; rate-limit anti-card-testing
  topup_count_this_hour        Int     @default(0)
  last_topup_at                DateTime?
  phone_verified               Boolean  @default(false)    // unlocks higher topup caps

  transactions     WalletTransaction[]
  payment_methods  PaymentMethod[]
  auto_topup_log   AutoTopupAttempt[]
}

model WalletTransaction {
  id          String   @id @default(cuid())
  wallet_id   String
  wallet      Wallet   @relation(fields: [wallet_id], references: [id], onDelete: Cascade)
  family_id   String                                       // denormalized for query speed
  kid_id      String?                                      // null if family-level (top-up)
  type        TxType
  delta_stars Int                                          // positive for credit, negative for debit
  balance_after Int                                        // running balance, for audit
  reason      String                                       // 'topup_starter_pack' | 'agent_image_gen' | 'admin_adjust_refund' | 'workshop_credit' | 'mission_complete_reward' ...
  metadata    Json     @default("{}")                      // { airwallex_payment_id?, project_id?, mission_id?, deeprouter_request_id? }
  created_at  DateTime @default(now())

  @@index([wallet_id, created_at])
  @@index([family_id, created_at])
}

enum TxType {
  topup_card                  // parent buys Stars Pack via Airwallex (manual)
  topup_auto                  // auto-topup triggered by low balance (recurring charge via saved PaymentMethod)
  workshop_credit             // teacher seeds Stars for a workshop session
  agent_spend                 // kid spent on agent / LLM call
  mission_reward              // kid earned for completing a mission
  admin_adjust                // ops adjustment (refund, comp, etc.)
  refund                      // money back to card
}

model AirwallexPayment {
  id                String   @id @default(cuid())          // airwallex payment_intent_id
  family_id         String
  amount_aud_cents  Int
  status            String                                 // 'pending' | 'succeeded' | 'failed' | 'refunded'
  pack_sku          String                                 // 'starter_10' | 'family_30' | 'mega_50' | 'school_100'
  stars_credited    Int                                    // 0 until status=succeeded
  initiator         PaymentInitiator @default(parent_manual)
  payment_method_id String?                                // set for topup_auto and saved-card flows
  idempotency_key   String?  @unique                       // wallet_id + minute-bucket for auto; client UUID for manual
  webhook_received_at DateTime?
  raw_webhook       Json?                                  // for incident debugging
  created_at        DateTime @default(now())

  @@index([family_id, created_at])
  @@index([status])
  @@index([payment_method_id])
}

enum PaymentInitiator {
  parent_manual               // /portal/wallet/topup hosted-checkout flow
  auto_topup                  // server-initiated MIT (Merchant Initiated Transaction)
  admin_adjust                // ops created via /admin/wallet/*/adjust
}

model PaymentMethod {
  id                  String   @id @default(cuid())
  wallet_id           String
  wallet              Wallet   @relation(fields: [wallet_id], references: [id], onDelete: Cascade)
  family_id           String                               // denormalized for auth filtering
  airwallex_pm_id     String   @unique                     // Airwallex tokenized payment_method id
  brand               String                               // 'visa' | 'mastercard' | 'amex'
  last4               String                               // displayed in UI ("••4242")
  exp_month           Int
  exp_year            Int
  cardholder_name     String?                              // optional, captured at tokenization
  status              String   @default("active")          // 'active' | 'expired' | 'removed' | 'failed'
  is_default          Boolean  @default(false)             // exactly one default per wallet (enforced in service layer)
  added_at            DateTime @default(now())
  removed_at          DateTime?
  first_24h_aud_cap   Int      @default(5000)              // A$50 cap on auto-topup in first 24h (card-testing window)
  added_ip            String?                              // for fraud review
  added_user_agent    String?  @db.Text

  airwallex_payments  AirwallexPayment[]                   // via payment_method_id (logical FK)
  auto_topup_attempts AutoTopupAttempt[]

  @@index([wallet_id, status])
  @@index([family_id])
}

model AutoTopupAttempt {
  id                  String   @id @default(cuid())
  wallet_id           String
  wallet              Wallet   @relation(fields: [wallet_id], references: [id], onDelete: Cascade)
  payment_method_id   String
  payment_method      PaymentMethod @relation(fields: [payment_method_id], references: [id])
  triggered_by        String                               // 'low_balance' | 'manual_test' | 'webhook_retry'
  trigger_balance     Int                                  // wallet.stars_balance at trigger time
  sku                 String                               // requested pack at attempt time
  amount_aud_cents    Int
  status              AutoTopupStatus
  airwallex_payment_id String?                             // FK AirwallexPayment.id once created
  skip_reason         String?                              // 'daily_cap_reached' | 'monthly_cap_reached' | 'cooldown'
                                                          // | 'consecutive_failures' | 'card_first_24h_cap' | 'family_paused'
  failure_code        String?                              // Airwallex error code if status='failed'
  idempotency_key     String   @unique                     // wallet_id + minute-bucket; prevents double-charge
  created_at          DateTime @default(now())
  resolved_at         DateTime?

  @@index([wallet_id, created_at])
  @@index([status])
}

enum AutoTopupStatus {
  skipped                     // never sent to Airwallex (cap, cooldown, etc.)
  pending                     // sent to Airwallex, awaiting webhook
  succeeded                   // Stars credited
  failed                      // Airwallex declined
}

// ── Usage analytics aggregate (D-USE-01, parent-portal-prd §4.9) ──────────
// One row per kid per local-date. Populated incrementally by the /llm/* proxy
// (on every successful spend) AND reconciled nightly from consumption_ledger
// for accuracy. Read by /portal/usage and /admin/analytics/llm.
model UsageDaily {
  id                  String   @id @default(cuid())
  family_id           String                               // for parent-portal filtering
  kid_id              String                               // null = family-shared (e.g. workshop credit usage)
  local_date          String                               // 'YYYY-MM-DD' in parent's TZ; matches daily_used reset boundary
  tokens_in           Int      @default(0)                 // sum across all models
  tokens_out          Int      @default(0)
  requests            Int      @default(0)                 // # LLM proxy calls
  sessions            Int      @default(0)                 // # distinct kid sessions (heuristic: idle gap > 10 min)
  active_seconds      Int      @default(0)                 // sum of session durations
  stars_spent         Int      @default(0)                 // == sum of debit transactions for this kid+date
  flagged_count       Int      @default(0)                 // # responses flagged by moderation
  by_task_type        Json     @default("{}")              // { image: {requests, stars, tokens}, tts: {...}, tutor: {...}, code: {...} }
  by_model            Json     @default("{}")              // { 'image/sdxl-lite': {calls, stars, tokens_in, tokens_out, flagged}, ... }
  by_project          Json     @default("{}")              // { project_id: {stars, requests} }; null project_id = 'free-play'
  approvals_asked     Int      @default(0)
  approvals_granted   Int      @default(0)
  updated_at          DateTime @updatedAt

  @@unique([kid_id, local_date])
  @@index([family_id, local_date])
  @@index([local_date])                                    // for admin cross-family analytics
}
```

### 4.3 Courses & Classes

```prisma
model CoursePack {
  id              String   @id @default(cuid())
  slug            String   @unique                         // 'ai-creative-lab-v1'
  title           String
  description     String   @db.Text
  target_age_min  Int                                      // 8
  target_age_max  Int                                      // 11
  product_line    ProductLine                              // 'line_a_creative' | 'line_b_coding'
  mission_count   Int
  estimated_stars Int                                      // average kid spend per course
  is_published    Boolean  @default(false)
  version         String   @default("1.0.0")               // semver, immutable per release
  created_at      DateTime @default(now())

  missions        Mission[]
  classes         Class[]
}

enum ProductLine {
  line_a_creative                                          // 6-11 image/music/story/video
  line_b_coding                                            // 12-17 AI coding (Kids OpenCode)
}

model Mission {
  id              String   @id @default(cuid())
  course_pack_id  String
  course_pack     CoursePack @relation(fields: [course_pack_id], references: [id], onDelete: Cascade)
  slug            String                                   // unique within course
  title           String
  description     String   @db.Text
  order_index     Int                                      // display order within course
  estimated_stars Int                                      // budget guidance
  acceptance_yaml String?  @db.Text                        // auto-grading criteria
  content_md      String   @db.Text                        // mission body (Markdown)

  projects        Project[]

  @@unique([course_pack_id, slug])
  @@index([course_pack_id, order_index])
}

model Class {
  id              String   @id @default(cuid())
  teacher_id      String
  teacher         User     @relation("ClassTeacher", fields: [teacher_id], references: [id])
  course_pack_id  String
  course_pack     CoursePack @relation(fields: [course_pack_id], references: [id])
  name            String                                   // "Term 1 — AI Creative Lab Tuesday 4pm"
  delivery_mode   DeliveryMode                             // 'weekly' | 'holiday_intensive' | 'school_partnership' | 'workshop'
  starts_at       DateTime
  ends_at         DateTime
  class_code      String   @unique                         // 6-char, kid-login shortcut
  qr_payload      String                                   // URL or JSON encoded for QR
  workshop_credit_per_kid Int @default(0)                   // Stars seeded per enrolled kid
  max_students    Int      @default(6)
  is_active       Boolean  @default(true)
  created_at      DateTime @default(now())

  enrollments     ClassEnrollment[]

  @@index([teacher_id])
  @@index([class_code])
}

enum DeliveryMode {
  weekly                                                   // 8-10 week term, weekly online
  holiday_intensive                                        // 3-5 day camp
  school_partnership                                       // year-long, B2B
  workshop                                                 // legacy 1-3 day in-school (kept for back-compat)
}

model ClassEnrollment {
  id              String   @id @default(cuid())
  class_id        String
  class           Class    @relation(fields: [class_id], references: [id], onDelete: Cascade)
  kid_id          String
  kid             KidProfile @relation(fields: [kid_id], references: [id], onDelete: Cascade)
  family_id       String                                   // denormalized for query speed
  family          Family   @relation(fields: [family_id], references: [id])
  enrolled_at     DateTime @default(now())
  status          EnrollStatus @default(active)            // 'pending' | 'active' | 'completed' | 'dropped'

  @@unique([class_id, kid_id])
  @@index([family_id])
  @@index([kid_id])
}

enum EnrollStatus {
  pending
  active
  completed
  dropped
}
```

### 4.4 Projects & Artifacts

> A `Project` is a kid's work output. Could be a Line A creation (image + story + audio) or a Line B Kids OpenCode codebase. Family-scoped; kid-owned; shareable with consent.

```prisma
model Project {
  id              String   @id @default(cuid())
  family_id       String
  family          Family   @relation(fields: [family_id], references: [id], onDelete: Cascade)
  kid_id          String
  kid             KidProfile @relation(fields: [kid_id], references: [id], onDelete: Cascade)
  mission_id      String?
  mission         Mission? @relation(fields: [mission_id], references: [id])
  title           String
  product_line    ProductLine
  visibility      Visibility @default(private)
  s3_prefix       String                                   // e.g. "fam_xxx/proj_yyy/" — bucket key prefix
  thumbnail_s3_key String?                                 // cached preview image
  star_cost_total Int      @default(0)                     // cumulative Stars spent on this project
  status          ProjectStatus @default(in_progress)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  deleted_at      DateTime?

  artifacts       Artifact[]
  audit_events    AuditEvent[]
  share_requests  ShareRequest[]

  @@index([family_id])
  @@index([kid_id])
  @@index([mission_id])
}

enum Visibility {
  private                                                  // family only (default)
  class                                                    // class wall, requires teacher review
  public                                                   // requires teacher + parent double consent
}

enum ProjectStatus {
  in_progress
  submitted                                                // submitted for mission acceptance
  accepted                                                 // mission acceptance passed
  archived
}

model Artifact {
  id          String   @id @default(cuid())
  project_id  String
  project     Project  @relation(fields: [project_id], references: [id], onDelete: Cascade)
  kind        ArtifactKind                                 // 'image' | 'audio' | 'video' | 'text' | 'code_file' | 'project_export'
  s3_key      String                                       // full bucket key
  mime_type   String
  size_bytes  Int
  metadata    Json     @default("{}")                      // dimensions, duration, mission step, etc.
  created_at  DateTime @default(now())

  @@index([project_id])
}

enum ArtifactKind {
  image
  audio
  video
  text
  code_file
  project_export                                           // zip of full project
}

model ShareRequest {
  id          String   @id @default(cuid())
  project_id  String
  project     Project  @relation(fields: [project_id], references: [id], onDelete: Cascade)
  target_visibility Visibility                             // requesting upgrade to 'class' or 'public'
  teacher_review TeacherReview?
  parent_review  ParentReview?
  status      ShareRequestStatus @default(pending)
  created_at  DateTime @default(now())
  resolved_at DateTime?
}

enum TeacherReview { approved rejected }
enum ParentReview  { approved rejected }
enum ShareRequestStatus { pending teacher_approved parent_approved approved rejected }
```

### 4.5 Audit Log

> **The trust mechanism**. Every AI action, every wallet movement, every approval is captured here. Parent dashboard renders this. Compliance team queries this for incident response.

```prisma
model AuditEvent {
  id          String   @id @default(cuid())
  family_id   String
  family      Family   @relation(fields: [family_id], references: [id], onDelete: Cascade)
  kid_id      String?
  kid         KidProfile? @relation(fields: [kid_id], references: [id])
  project_id  String?
  project     Project? @relation(fields: [project_id], references: [id])
  actor       AuditActor                                   // 'kid' | 'agent' | 'parent' | 'teacher' | 'admin' | 'system'
  event_type  String                                       // 'agent.plan' | 'agent.tool.read' | 'agent.tool.write' | 'wallet.spend' | 'approval.granted' | ...
  payload     Json                                         // full event data
  occurred_at DateTime @default(now())
  ip          String?
  user_agent  String?

  @@index([family_id, occurred_at])
  @@index([kid_id, occurred_at])
  @@index([project_id, occurred_at])
  @@index([event_type, occurred_at])
}

enum AuditActor { kid agent parent teacher admin system }
```

### 4.6 Approvals

> Parent-blocking actions (extra Stars, public share, "always allow"). Kid kicks off → parent acts.

```prisma
model ApprovalRequest {
  id          String   @id @default(cuid())
  family_id   String
  family      Family   @relation(fields: [family_id], references: [id], onDelete: Cascade)
  kid_id      String
  kid         KidProfile @relation(fields: [kid_id], references: [id], onDelete: Cascade)
  type        ApprovalType
  payload     Json                                         // type-specific: { extra_stars_requested: 30, reason: "I want to make a longer story" }
  status      ApprovalStatus @default(pending)
  decided_by_user_id String?
  decided_at  DateTime?
  decision_note String?
  created_at  DateTime @default(now())
  expires_at  DateTime?                                    // null = no expiry

  @@index([family_id, status])
}

enum ApprovalType {
  extra_stars                                              // kid hit cap, wants more
  public_share                                             // upgrade visibility to public
  always_allow_command                                     // remember-this-decision (V1+)
  add_kid_profile                                          // adding a 2nd+ kid mid-account-life
  topic_limit_change                                       // kid wants topic_limit relaxed
}

enum ApprovalStatus { pending granted denied expired }
```

### 4.7 Incidents (compliance C13 / launch L6)

> Auto-opened by `IncidentsService.checkOnAuditEvent` (fire-and-forget from `AuditService`) when sliding-window safety rules trip. Also manually openable by admin from teacher-console. Resolved by admin with a note. HIGH severity opens a parent banner via WS.

V0 detection rules:
- **moderation_spike** (HIGH) — ≥3 `safety.content_rejected` events for one kid in 10 min
- **wallet_anomaly** (MEDIUM) — single kid spent >50⭐ in 10 min
- **family_paused** (LOW) — wallet pause toggled (informational, dedup'd to one open per family)

Dedup: never opens a second incident of the same kind while one is still active for the same scope.

```prisma
model Incident {
  id            String           @id @default(cuid())
  kind          IncidentKind
  severity      IncidentSeverity @default(medium)
  family_id     String?
  kid_id        String?
  title         String
  payload       Json             @default("{}")
  opened_at     DateTime         @default(now())
  resolved_at   DateTime?
  resolved_by   String?  // user.id of resolving admin
  resolved_note String?
}

enum IncidentKind {
  moderation_spike
  wallet_anomaly
  family_paused
  deeprouter_errors  // system-level rule (planned, not in V0 rule set)
  manual             // opened by admin
}

enum IncidentSeverity { low medium high }
```

FKs to Family + KidProfile use `onDelete: SetNull` — incidents outlive deleted resources so ops can still investigate post-deletion.

---

## 5. REST API

> Base URL: `https://api.airbotix.ai`
> All responses JSON. All timestamps ISO 8601. All IDs `cuid` strings.
> All endpoints require `Authorization: Bearer <jwt>` unless marked **PUBLIC**.

### 5.1 Auth (`/auth`)

| Method | Path | Roles | Purpose |
|---|---|---|---|
| POST | `/auth/request-otp` | PUBLIC | Email OTP request |
| POST | `/auth/verify-otp` | PUBLIC | Exchange OTP for tokens |
| POST | `/auth/refresh` | PUBLIC (cookie) | Refresh access token |
| POST | `/auth/logout` | any | Revoke refresh token |
| GET | `/auth/me` | any | Current user + family + kids |
| POST | `/auth/kid-login` | PUBLIC | family-code + nickname + PIN → kid token |
| POST | `/auth/class-code-login` | PUBLIC | one-shot kid login by class code |

### 5.2 Family (`/families`)

| Method | Path | Roles | Purpose |
|---|---|---|---|
| POST | `/families` | PUBLIC (after OTP verify) | Create Family Account + first parent user |
| GET | `/families/:id` | parent (own), admin | Get family details |
| PATCH | `/families/:id` | parent (own), admin | Update name / region / settings |
| DELETE | `/families/:id` | parent (own), admin | Soft delete + 30-day grace + data export |
| GET | `/families/:id/export` | parent (own) | Full family data export (JSON + S3 zip URL) |

### 5.3 Kid Profiles (`/kids`)

| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/families/:id/kids` | parent (own family), admin | List family's kids |
| POST | `/families/:id/kids` | parent (own family) | Create new kid profile |
| GET | `/kids/:id` | parent (own), teacher (class member), admin | Get kid details |
| PATCH | `/kids/:id` | parent (own), admin | Update nickname / age / topic_limits / daily_star_cap |
| DELETE | `/kids/:id` | parent (own), admin | Soft delete kid |
| POST | `/kids/:id/reset-pin` | parent (own) | Reset 4-digit PIN |

### 5.4 Wallet (`/wallet`)

| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/families/:id/wallet` | parent (own), admin | Balance + caps + auto-topup state + recent transactions |
| GET | `/families/:id/wallet/transactions` | parent (own), admin | Paginated transaction history (`?from=&to=&kid_id=&type=`; `type=topup_auto` for auto-charges) |
| POST | `/families/:id/wallet/topup` | parent (own) | Initiate Airwallex payment intent for a Stars Pack SKU (manual hosted checkout). Enforces topup daily/monthly/hourly caps; returns `429 TOPUP_DAILY_LIMIT` / `TOPUP_HOURLY_LIMIT` if exceeded |
| PATCH | `/families/:id/wallet/caps` | parent (own) | Update daily/weekly/monthly Stars spend caps |
| POST | `/families/:id/wallet/pause` | parent (own) | One-click pause (also disables auto-topup until resumed) |
| POST | `/families/:id/wallet/resume` | parent (own) | Resume |
| POST | `/admin/wallet/:wallet_id/adjust` | admin | Manual adjustment (refund / comp) — fully audited; decrements `topup_*_used` counters on refund |

**Auto-topup (D-WAL-01, parent-portal-prd §4.4.1)**:

| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/families/:id/wallet/auto-topup` | parent (own), admin | Current auto-topup config + recent attempts (last 20) |
| PUT | `/families/:id/wallet/auto-topup` | parent (own) | Enable/disable + set threshold, sku, payment_method_id, daily_cap, monthly_cap, failure_threshold. Validates ranges; rejects daily_cap > A$100, monthly_cap > A$500 without `phone_verified=true` |
| POST | `/families/:id/wallet/auto-topup/test` | parent (own) | Run a A$1 test charge against saved payment method, refund immediately. Confirms card works before relying on it. Counts toward `topup_count_today` rate limit but not daily AUD cap. |
| GET | `/families/:id/wallet/auto-topup/attempts` | parent (own), admin | Paginated `AutoTopupAttempt` log (`?status=skipped\|pending\|succeeded\|failed&from=&to=`) |

**Payment methods**:

| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/families/:id/payment-methods` | parent (own), admin | List saved tokenized cards (Airwallex `payment_method_id`, brand, last4, exp, status) |
| POST | `/families/:id/payment-methods/setup-intent` | parent (own) | Returns an Airwallex SetupIntent client secret so the browser SDK can tokenize a new card without the PAN ever hitting our servers |
| POST | `/families/:id/payment-methods/:pm_id/set-default` | parent (own) | Make this the default for auto-topup |
| DELETE | `/families/:id/payment-methods/:pm_id` | parent (own) | Remove. If this was the auto-topup card and no fallback exists → auto_topup_enabled set to false + email parent |

**Topup limit semantics** (anti-fraud, parent-portal-prd §4.4.2):

- All counters live on `Wallet` (`topup_daily_used_aud_cents`, `topup_monthly_used_aud_cents`, `topup_count_today`, `topup_count_this_hour`). Single SQL `UPDATE … WHERE … RETURNING` is used to reserve the limit slot before any Airwallex call, same atomic pattern as Stars debit (kids-ai-platform-prd §9.7).
- Daily/hourly counters reset by the existing 04:00-local-time `daily_used` reset job. Monthly counter resets on calendar month boundary in parent local TZ.
- Successful refund via `/admin/wallet/*/adjust` reverses the AUD counters proportionally (refunded amount decrements `topup_daily_used_aud_cents` for the *current* day, capped at 0).
- `phone_verified` is set true after a one-time SMS challenge from `/portal/settings`; unlocks the higher topup ceilings (A$500/day, A$3000/month) but does **not** raise the per-auto-topup daily cap (that's separately governed by `auto_topup_daily_cap_aud_cents`, max A$100/day even with phone verify).

### 5.5 Classes (`/classes`)

| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/classes` | teacher (own), admin | List classes |
| POST | `/classes` | teacher, admin | Create class |
| GET | `/classes/:id` | teacher (own), admin, enrolled-family-parent | Get class details |
| PATCH | `/classes/:id` | teacher (own), admin | Update class |
| GET | `/classes/:id/enrollments` | teacher (own), admin | List enrolled kids |
| POST | `/classes/:id/enroll` | teacher, admin, parent (own family kid) | Enroll a kid |
| DELETE | `/classes/:id/enrollments/:enrollment_id` | teacher (own), admin, parent (own kid) | Drop kid |
| GET | `/classes/:id/live-state` | teacher (own), admin | Snapshot of current kids' progress (also see WS) |

### 5.6 Course Packs (`/course-packs`)

| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/course-packs` | any authenticated | List published course packs |
| GET | `/course-packs/:slug` | any authenticated | Get course pack + missions |
| POST | `/course-packs` | admin | Create (V1+: teachers may create) |
| PATCH | `/course-packs/:id` | admin | Update |
| POST | `/course-packs/:id/publish` | admin | Mark as published |

### 5.7 Projects (`/projects`)

| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/families/:id/projects` | parent (own), admin | List family projects |
| GET | `/kids/:id/projects` | parent (own kid), teacher (kid's class), admin | List kid's projects |
| POST | `/projects` | parent or kid (own kid id) | Create new project |
| GET | `/projects/:id` | parent (own), teacher (if class share), admin | Get project |
| PATCH | `/projects/:id` | parent (own), kid (own) | Update title / status |
| DELETE | `/projects/:id` | parent (own), admin | Soft delete |
| GET | `/projects/:id/artifacts` | parent (own), teacher (if shared) | List artifacts |
| POST | `/projects/:id/artifacts/upload-url` | kid (own), parent (own) | **Get S3 signed upload URL** (5min TTL) |
| POST | `/projects/:id/artifacts/:artifact_id/download-url` | parent (own), teacher (if shared), public (if visibility=public) | **Get S3 signed download URL** |
| POST | `/projects/:id/share-request` | parent (own), kid (own) | Request class/public share |
| POST | `/share-requests/:id/teacher-review` | teacher | Approve/reject |
| POST | `/share-requests/:id/parent-review` | parent (own) | Approve/reject |

### 5.8 Audit Replay (`/audit`)

| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/families/:id/audit` | parent (own), admin | Family-wide audit feed (`?kid_id=&from=&to=&type=&page=`) |
| GET | `/kids/:id/audit` | parent (own kid), admin | Kid-scoped feed |
| GET | `/projects/:id/audit` | parent (own project), teacher (if shared), admin | Project-scoped feed (the "replay" for a single project) |
| POST | `/audit/events` | service-token only (kids-opencode, DeepRouter) | Emit audit event |

### 5.9 Approvals (`/approvals`)

| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/families/:id/approvals` | parent (own), admin | List pending + recent |
| POST | `/approvals` | kid (own) | Create approval request (kid initiates) |
| POST | `/approvals/:id/grant` | parent (own family) | Grant + note |
| POST | `/approvals/:id/deny` | parent (own family) | Deny + note |

### 5.10 Payment Webhooks (`/webhooks/airwallex`)

| Method | Path | Roles | Purpose |
|---|---|---|---|
| POST | `/webhooks/airwallex` | PUBLIC (signature-verified) | Receive Airwallex payment status events, update WalletTransaction + balance |

Webhook signature: HMAC-SHA256 with shared secret. Reject unverified.

**Event routing** (based on `AirwallexPayment.initiator`):

| Initiator | On `payment_succeeded` | On `payment_failed` |
|---|---|---|
| `parent_manual` | Credit Stars, `WalletTransaction(type=topup_card)`, increment `topup_daily_used_aud_cents`, emit `wallet.update` WS | Mark `AirwallexPayment.status=failed`; user is on hosted checkout, Airwallex shows error |
| `auto_topup` | Credit Stars, `WalletTransaction(type=topup_auto)`, increment **both** `topup_daily_used_aud_cents` and `auto_topup_daily_used_aud_cents`, reset `auto_topup_consecutive_failures=0`, update `last_auto_topup_at`, emit `wallet.update` + `wallet.auto_topup_succeeded` WS, queue email | Increment `auto_topup_consecutive_failures`; if ≥ `auto_topup_failure_threshold` → set `auto_topup_enabled=false`, emit `wallet.auto_topup_paused` WS, queue email "auto-topup paused — card declined N times" |
| `admin_adjust` | No double-credit (Stars already credited inline by `/admin/wallet/*/adjust`); just mark status | Mark status; alert ops |

**Idempotency**: every inbound webhook is keyed by Airwallex `event_id`. Re-delivery is detected via a `processed_webhooks` table (event_id, processed_at) and short-circuited. Combined with `AutoTopupAttempt.idempotency_key` on the outbound side, neither client retry nor webhook re-delivery can double-charge or double-credit.

**MIT (Merchant Initiated Transaction) note**: auto-topup uses Airwallex's stored-credential / MIT flow against a tokenized `payment_method_id`. The first card capture (via SetupIntent in `/portal/wallet/auto-topup`) must include `usage='subsequent_usage'` and capture the cardholder's explicit consent text. Consent text is stored on `PaymentMethod` (TODO: add `mit_consent_text`, `mit_consent_accepted_at` fields in a follow-up migration once legal approves the AU copy).

### 5.11 LLM Proxy (`/llm`) — DeepRouter gateway

| Method | Path | Roles | Purpose |
|---|---|---|---|
| POST | `/llm/text-completion` | kid (own), parent (own) | Server-side proxy to DeepRouter — Stars metered, audit emitted, kid-safe prompt injected |
| POST | `/llm/image` | same | Image generation (DeepRouter `/v1/images/generations`) |
| POST | `/llm/tts` | same | Text-to-speech (DeepRouter `/v1/audio/speech`, binary → data: URL) |
| POST | `/llm/music` | same | Music generation (routed to `/v1/audio/speech` in V0 — no native music endpoint) |
| POST | `/llm/music-score` | same | Structured Tone.js score JSON; rendered client-side, 3⭐ — cheaper alt to `/llm/music` |
| POST | `/llm/video` | same | Short video generation (async submit + 60s poll on DeepRouter `/v1/video/generations`) |

All `/llm/*` calls:
1. Auth check
2. Wallet check (`daily_used + estimated_cost <= cap`); reject 402 PAYMENT_REQUIRED with `extra_stars_required` if over
3. Inject kid-safe system prompt + content moderation parameters
4. Forward to DeepRouter `/v1/*` endpoint
5. On success: debit Stars, emit audit event, return result
6. On failure: refund Stars (best-effort), emit audit event

### 5.12 Admin / Internal (`/admin`)

| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/admin/families` | admin | Search families |
| GET | `/admin/audit` | admin | Cross-family audit search (incident response) |
| POST | `/admin/wallet/*/adjust` | admin | Manual Stars credit/debit (above) |
| POST | `/admin/kids/:id/suspend` | admin | Emergency suspend kid (content incident) |
| POST | `/admin/families/:id/refund` | admin | Issue Airwallex refund |
| GET | `/admin/incidents` | admin | List incidents (filters: `status=active|resolved|all`, `kind`, `family_id`, `since`) |
| POST | `/admin/incidents` | admin | Manually open an incident (kind, severity, family/kid scope, title, payload) |
| POST | `/admin/incidents/:id/resolve` | admin | Resolve with a note; idempotent on already-resolved |

All admin actions emit AuditEvent with `actor=admin` and `event_type=admin.*`.

### 5.13 Usage Analytics (`/usage`)

> Parent-facing AI usage stats. Backs [parent-portal-prd §4.9](./parent-portal-prd.md#49-portalusage--ai-usage-analytics-). All endpoints scope by `family_id` from JWT; cross-family reads are admin-only.

| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/families/:id/usage` | parent (own), admin | Family-wide rollup (`?from=&to=&group_by=day\|kid\|model\|task_type`). Returns totals + per-kid breakdown over the range. |
| GET | `/families/:id/usage/summary` | parent (own), admin | Fast top-of-page summary (`?range=24h\|7d\|28d`): totals, week-over-week delta, top model, top kid. Cached 60s. |
| GET | `/kids/:id/usage` | parent (own kid), admin | Per-kid drill-down (`?from=&to=`): tokens, stars, sessions, active_seconds, by_task_type, by_model, by_project, flagged_count, approvals_asked/granted |
| GET | `/kids/:id/usage/trend` | parent (own kid), admin | Daily time series (`?from=&to=&metric=stars\|tokens\|requests\|active_seconds`) for chart rendering |
| GET | `/kids/:id/usage/export.csv` | parent (own kid), admin | Streaming CSV export (`?from=&to=`); one row per session. Async for ranges > 90d (returns 202 + email). |
| GET | `/admin/analytics/usage` | admin, super-admin | Cross-family aggregates (top-N kids by spend, model distribution, flag rate). See [super-admin-prd §5.7](./super-admin-prd.md#57-analytics--insights). |

**Aggregation pipeline**:

1. **Inline** — every successful `/llm/*` call writes a `WalletTransaction` (debit), an `audit_events` row (what happened), and **incrementally upserts** the relevant `UsageDaily` row (`local_date` = `now in parent TZ`) bumping `tokens_in`, `tokens_out`, `requests`, `stars_spent`, the `by_task_type`/`by_model`/`by_project` JSONB counters, and `flagged_count` if moderation flagged the response.
2. **Session bucketing** — `sessions` and `active_seconds` are derived heuristically: a new session = first request after ≥ 10 min idle on the same kid. Service layer keeps a Redis key `usage:session:<kid_id>` with the last request timestamp; bump it on every call.
3. **Nightly reconciliation job** — at 04:30 local TZ (after the daily reset job), a worker re-derives the previous day's `UsageDaily` rows from `consumption_ledger` (kids-ai-platform-prd §9.7.2) and overwrites any drift. This handles late webhooks and failed inline upserts.
4. **Retention** — `UsageDaily` rows retained for 365 days hot in Postgres. Older rows archived to S3 Parquet (ap-southeast-2) and pruned. CSV export from cold storage is async.

**Privacy**: `UsageDaily` stores no prompt text and no response text. Surveillance-relevant fields (prompts/responses) stay in `audit_events`, which is scoped to the family and accessible only via §5.8 audit replay. Usage endpoints are metrics-only by design (D-USE-01 rationale in parent-portal-prd §4.9).

**Performance budget**: p50 < 400ms for `/families/:id/usage?range=7d`, p99 < 1.5s. Indexes on `UsageDaily(family_id, local_date)` and `UsageDaily(kid_id, local_date)` make 28-day queries a single index range scan.

---

## 6. WebSocket Events (`/ws`)

> Single WebSocket endpoint, multiplexed by room. JWT in handshake. Heartbeat every 30s.

### Connection

```
wss://api.airbotix.ai/ws?token=<jwt>
```

Server validates JWT, derives `family_id` + `role`, joins relevant rooms automatically:

| Role | Auto-joined rooms |
|---|---|
| parent | `family:<family_id>`, `family:<family_id>:audit` |
| kid | `kid:<kid_id>`, `family:<family_id>` (read-only) |
| teacher | `teacher:<user_id>`, plus `class:<class_id>` for each owned class |
| admin | `admin:global` (incident feed) |

### Events server → client

| Event | Room | Payload | Use |
|---|---|---|---|
| `audit.event` | family:* | AuditEvent JSON | Parent dashboard live tail |
| `wallet.update` | family:* | `{ balance, daily_used, weekly_used }` | Live wallet UI |
| `wallet.low_balance` | family:* | `{ balance, threshold, auto_topup_enabled }` | Push parent to topup or enable auto-topup |
| `wallet.auto_topup_succeeded` | family:* | `{ amount_aud_cents, stars_credited, balance_after, payment_method_last4 }` | Real-time UI + toast on `/portal/wallet` |
| `wallet.auto_topup_failed` | family:* | `{ failure_code, consecutive_failures, payment_method_last4 }` | Surface inline warning |
| `wallet.auto_topup_paused` | family:* | `{ reason: 'consecutive_failures' \| 'payment_method_removed' \| 'family_paused' }` | Highlight pause banner |
| `wallet.topup_limit_hit` | family:* | `{ scope: 'daily' \| 'monthly' \| 'hourly' \| 'count', resets_at }` | Surface anti-fraud limit message to UI |
| `approval.new` | family:* | ApprovalRequest | Parent push when kid requests |
| `approval.resolved` | family:*, kid:* | ApprovalRequest | Kid sees decision instantly |
| `class.kid_progress` | class:* | `{ kid_id, project_id, status, % }` | Teacher live mode |
| `class.kid_stuck` | class:* | `{ kid_id, project_id, last_action_at }` | Teacher gets a nudge |
| `agent.stream.delta` | kid:* | `{ delta_text, token_count }` | Streaming AI output to kid UI |
| `agent.stream.done` | kid:* | `{ stars_charged, summary }` | End of stream |
| `incident.opened` | admin:global | `{ id, kind, severity, family_id, kid_id, title, opened_at }` | Admin live ops feed (C13 / L6) |
| `family.incident_opened` | family:* | `{ id, kind, severity, title, opened_at }` | HIGH-severity only — parent banner (C13) |

### Events client → server

| Event | Roles | Payload | Use |
|---|---|---|---|
| `class.heartbeat` | kid in class | `{ class_id, project_id, status }` | Teacher live mode signals presence |
| `agent.cancel` | kid | `{ session_id }` | Cancel mid-stream |

---

## 7. Error Format & Codes

All errors return:

```json
{
  "error": {
    "code": "WALLET_INSUFFICIENT",
    "message": "Daily Stars cap exceeded.",
    "details": {
      "daily_used": 50,
      "daily_cap": 50,
      "needs_approval": true,
      "approval_request_id": "appr_xxx"
    },
    "request_id": "req_yyy"
  }
}
```

### Common codes

| HTTP | Code | When |
|---|---|---|
| 400 | `INVALID_INPUT` | Schema / validation fail |
| 401 | `UNAUTHENTICATED` | No/invalid JWT |
| 403 | `FORBIDDEN` | Wrong role or wrong family scope |
| 404 | `NOT_FOUND` | Resource missing or soft-deleted |
| 409 | `CONFLICT` | e.g. duplicate kid enrollment |
| 402 | `WALLET_INSUFFICIENT` | Need more Stars — payload tells if approval can resolve |
| 422 | `MODERATION_REJECTED` | LLM/image moderation blocked |
| 423 | `FAMILY_PAUSED` | Wallet paused by parent |
| 429 | `RATE_LIMITED` | Per-IP or per-user throttling |
| 451 | `COMPLIANCE_BLOCK` | Region or age-gated content blocked |
| 500 | `INTERNAL` | Unhandled — incident alert fires |
| 502 | `UPSTREAM_DEEPROUTER` | DeepRouter failure |
| 503 | `MAINTENANCE` | Planned outage |

Every error response includes `request_id` for support correlation.

---

## 8. Rate Limiting

| Resource | Limit | Window | Key |
|---|---|---|---|
| `/auth/request-otp` | 5 | 1 hour | email |
| `/auth/verify-otp` | 5 attempts | per OTP | email |
| `/llm/*` | 1 concurrent turn | per kid | kid_id |
| `/llm/*` | 60 turns | per hour | kid_id |
| `/llm/*` | configurable | per day | wallet cap |
| `/audit/events` (service emit) | 1000 | per minute | service-token |
| Global REST | 600 | per minute | IP |
| WebSocket connections | 5 | concurrent | user_id |

429 returns include `Retry-After` header.

---

## 9. Pagination & Sorting

Cursor-based pagination on list endpoints. Defaults `limit=20`, max `100`.

Request:
```
GET /families/xyz/audit?cursor=&limit=20&order=desc
```

Response:
```json
{
  "items": [...],
  "next_cursor": "cur_yyy",
  "has_more": true
}
```

---

## 10. Out of Scope (V0)

- ❌ GraphQL — REST + WS only for V0
- ❌ Multi-region read replicas — single Neon AU-SE-2 region
- ❌ End-to-end encryption of project files — at-rest encryption (SSE-S3) only
- ❌ Webhook delivery to 3rd parties (V1+)
- ❌ Bulk import/export of families (V1+ admin tool)
- ❌ SSO / SAML for school accounts (V1 when first school B2B contract requires)

---

## 11. Open Questions

| # | Q | Impact |
|---|---|---|
| Q1 | Should `/llm/*` be sync (block until DeepRouter responds) or async (return job_id, stream via WS)? | **Recommend hybrid**: short prompts (image, text completion) sync; long agent turns async |
| Q2 | Class-code login: how is the class code distributed to kids? QR scan? printed slip? both? | Affects `qr_payload` schema |
| Q3 | Soft-delete TTL — auto-purge after 30 days, or never auto-purge (parent must explicitly request final delete)? | Compliance has nuance here (Privacy Act vs Right to be Forgotten) |
| Q4 | DeepRouter API key rotation — managed at platform-backend level, or each tenant manages its own DR account? | Affects DeepRouter integration spec |
| Q5 | Workshop credit pool: does it expire? what if kid drops out mid-workshop? | Affects WalletTransaction reason taxonomy |
| Q6 | Should `parent` and `kid` be the same User row (with `role=kid`) or separate (User vs KidProfile)? | Current schema treats them as separate (User = adult, KidProfile = child) — re-evaluate if kid needs login email V1+ |
| Q7 | Multiple parents per family? (divorced co-parents both want dashboard access) | V0 single primary parent; V1+ support up to 2 parents per family |

---

## 12. Implementation Hooks (for NestJS scaffold)

When scaffolding starts, suggested module layout:

```
src/
├── auth/                  # JWT, OTP, guards
├── families/
├── kids/
├── wallet/
├── classes/
├── course-packs/
├── projects/
├── artifacts/             # S3 signed URL handlers
├── audit/
├── approvals/
├── llm/                   # DeepRouter proxy
├── webhooks/airwallex/
├── admin/
├── ws/                    # WebSocket gateway
├── common/
│   ├── guards/
│   ├── decorators/        # @Roles, @CurrentUser, @FamilyScope
│   ├── filters/           # error format
│   └── interceptors/      # request_id, audit emit
└── prisma/
    ├── schema.prisma
    └── migrations/
```

Recommended commands when starting:
```bash
nest new platform-backend --strict
npm i @prisma/client prisma @nestjs/jwt @nestjs/passport passport passport-jwt @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @sendgrid/mail bcrypt
npx prisma init --datasource-provider postgresql
# Paste §4 schema into prisma/schema.prisma
npx prisma migrate dev --name init
```

---

## 13. References

- `kids-ai-platform-prd.md` — parent product PRD (data model concepts in §6, wallet rules in §8)
- `marketing-site-refresh-prd.md` — service taxonomy + pricing (Stars Pack SKUs)
- `deeprouter-coupling-plan.md` — kids-completions endpoint contract this backend calls
- `docs/legal/privacy-policy.md` — data export / deletion endpoint requirements
- `docs/product/compliance/minors-compliance.md` — RBAC + audit requirements

---

## 14. Implementation status snapshot (2026-05-25)

> Source of truth: `platform-backend` submodule at `4a2281a`. Re-derive by listing `src/<module>/` and grepping `prisma/schema.prisma` for new models. Refresh this table when bumping the submodule pointer.
>
> Symbols: ✅ shipped · 🟡 partial (built but missing fields/endpoints) · ⬜ not started · n/a not applicable.

### REST modules

| § | Module | Prisma | Controller | Tests | Notes |
|---|---|---|---|---|---|
| 5.1 | `/auth` (OTP, refresh, kid PIN, TOTP) | ✅ | ✅ | 🟡 | All flows shipped: `auth/otp`, `auth/refresh`, `auth/kid`, `auth/totp`, `auth/invite` |
| 5.2 | `/families` | ✅ | ✅ | 🟡 | `families` module wired |
| 5.3 | `/kids` | ✅ | ✅ | 🟡 | `kids` module + KidProfile w/ PIN |
| 5.4 | `/wallet` (manual topup, caps, pause) | ✅ | ✅ | 🟡 | Balance, caps, pause/resume, manual topup, transactions — all shipped |
| 5.4 | `/wallet/auto-topup` (D-WAL-01) | ⬜ | ⬜ | ⬜ | **Spec only.** Need: extend Wallet schema (auto_topup_* fields), add `PaymentMethod` model, add `AutoTopupAttempt` model, add `PaymentInitiator` + `AutoTopupStatus` enums, add `topup_auto` TxType, build `/wallet/auto-topup` GET/PUT/test/attempts controllers, build Airwallex SetupIntent + MIT confirm path, add scheduled job to scan low-balance wallets |
| 5.4 | `/payment-methods` | ⬜ | ⬜ | ⬜ | **Spec only.** Need: GET list, POST setup-intent, set-default, DELETE handlers; Airwallex tokenized PM lifecycle |
| 5.4 | Topup anti-fraud caps (D-WAL-02) | ⬜ | ⬜ | ⬜ | **Spec only.** Need: extend Wallet schema (topup_*_cap, topup_*_used, topup_count_*, phone_verified); add rate-limit checks to `/wallet/topup`; phone-verify flow |
| 5.5 | `/classes` | ✅ | ✅ | 🟡 | Class + ClassEnrollment + DeliveryMode |
| 5.6 | `/course-packs` | ✅ | ✅ | 🟡 | CoursePack + Mission |
| 5.7 | `/projects` + `/artifacts` (S3 signed) | ✅ | ✅ | 🟡 | `projects` + `artifacts` + `storage` modules |
| 5.8 | `/audit` | ✅ | ✅ | 🟡 | AuditEvent with family/kid/project scope |
| 5.9 | `/approvals` | ✅ | ✅ | 🟡 | ApprovalRequest + enums |
| 5.10 | `/webhooks/airwallex` | 🟡 | 🟡 | ⬜ | Existing webhook handles `parent_manual` initiator; **needs routing for `auto_topup` initiator** (Stars credit + `topup_auto` tx + reset failure counter + WS emit) and `admin_adjust` no-op path; MIT consent capture pending |
| 5.11 | `/llm` proxy (DeepRouter) | ✅ | ✅ | 🟡 | All `/llm/*` endpoints shipped: text-completion, image, tts, music, music-score, video; `deeprouter.client.ts` |
| 5.11 | `/llm/*` → UsageDaily inline upsert | ⬜ | ⬜ | ⬜ | **Spec only.** Need: in `LlmService` after successful debit, upsert `UsageDaily` row (tokens_in/out, requests, by_task_type/by_model/by_project JSONB); Redis session bucketing for sessions/active_seconds |
| 5.12 | `/admin` | ✅ | ✅ | 🟡 | `admin` module wired |
| 5.13 | `/usage` analytics (D-USE-01) | ⬜ | ⬜ | ⬜ | **Spec only.** Need: `UsageDaily` model + indexes; controllers for `/families/:id/usage`, `/families/:id/usage/summary`, `/kids/:id/usage`, `/kids/:id/usage/trend`, `/kids/:id/usage/export.csv`; nightly reconcile job from `consumption_ledger` |
| 6 | WebSocket gateway | ✅ | ✅ | n/a | `ws.gateway.ts` + `AppGateway.emitToFamily()` shipped; events `audit.event` / `wallet.update` / `approval.*` working |
| 6 | New WS events (`wallet.low_balance`, `wallet.auto_topup_*`, `wallet.topup_limit_hit`) | ⬜ | ⬜ | ⬜ | **Spec only.** Add emit calls in wallet service + auto-topup job |
| 4.7 | Incidents | ✅ | ✅ | 🟡 | `incidents` module wired |
| 4.x | `system-config` (super-admin) | ✅ | ✅ | 🟡 | Wired; consumed by teacher-console admin pages |
| 4.x | `sessions` (chat session model for /learn/workspace) | ✅ | ✅ | 🟡 | `sessions` module + SessionMessage shipped |
| 4.x | `billing` | ✅ | ✅ | 🟡 | `billing` module wired |

### Prisma schema status

| Model | In schema? | Notes |
|---|---|---|
| Identity (Family, ParentUser, KidProfile, Session, RefreshToken, OtpAttempt, TwoFactorEnrollment) | ✅ | All shipped |
| Wallet (base fields) | ✅ | Base fields shipped (balance, daily_used, caps, paused) |
| Wallet (auto-topup fields, D-WAL-01) | ⬜ | `auto_topup_enabled`, `auto_topup_threshold_stars`, `auto_topup_sku`, `auto_topup_payment_method_id`, `auto_topup_daily_cap_aud_cents`, `auto_topup_monthly_cap_aud_cents`, `auto_topup_*_used`, `auto_topup_failure_threshold`, `auto_topup_consecutive_failures`, `auto_topup_cooldown_minutes`, `last_auto_topup_at` |
| Wallet (anti-fraud fields, D-WAL-02) | ⬜ | `topup_daily_cap_aud_cents`, `topup_monthly_cap_aud_cents`, `topup_*_used_aud_cents`, `topup_count_today`, `topup_count_this_hour`, `last_topup_at`, `phone_verified` |
| WalletTransaction, TxType | ✅ | Base shipped; **need to add `topup_auto` enum value** |
| AirwallexPayment | ✅ | Base shipped; **need to add `initiator`, `payment_method_id`, `idempotency_key`** + `PaymentInitiator` enum |
| **PaymentMethod** (NEW) | ⬜ | **Spec only.** Airwallex tokenized card + lifecycle |
| **AutoTopupAttempt** (NEW) | ⬜ | **Spec only.** Idempotency-keyed attempt log + `AutoTopupStatus` enum |
| Courses + Classes + Missions + Projects + Artifacts | ✅ | All shipped |
| AuditEvent + Approvals | ✅ | Shipped |
| Incidents | ✅ | Shipped |
| **UsageDaily** (NEW, D-USE-01) | ⬜ | **Spec only.** One row per kid per local-date with JSONB rollups |

**V0 backend gap** = **8 schema deltas + 6 new endpoints + 1 webhook router + 4 new WS events**, plus the inline `UsageDaily` upsert hook in `LlmService` and a nightly reconcile job. Bundled, this is ~1 sprint of backend work behind a single Prisma migration. **No work has started on these yet** — `4a2281a` predates the 2026-05-25 PRD additions.
