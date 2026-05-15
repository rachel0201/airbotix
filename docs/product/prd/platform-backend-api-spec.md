# platform-backend — API Spec & Data Model

> **Status**: Draft v0.1 · 2026-05-15
> **Repo**: `Airbotix-AI/platform-backend` (NestJS + Prisma + Neon + S3 Sydney)
> **Domain**: `api.airbotix.ai`
> **Consumers**: airbotix-app (`/portal/*` + `/learn/*`), teacher-console, kids-opencode (read-only for audit + wallet)
> **Author**: Airbotix engineering
> **Owner**: Airbotix-AI org

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

  transactions    WalletTransaction[]
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
  topup_card                  // parent buys Stars Pack via Airwallex
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
  webhook_received_at DateTime?
  raw_webhook       Json?                                  // for incident debugging
  created_at        DateTime @default(now())

  @@index([family_id, created_at])
  @@index([status])
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
| GET | `/families/:id/wallet` | parent (own), admin | Balance + caps + recent transactions |
| GET | `/families/:id/wallet/transactions` | parent (own), admin | Paginated transaction history (`?from=&to=&kid_id=&type=`) |
| POST | `/families/:id/wallet/topup` | parent (own) | Initiate Airwallex payment intent for a Stars Pack SKU |
| PATCH | `/families/:id/wallet/caps` | parent (own) | Update daily/weekly/monthly caps |
| POST | `/families/:id/wallet/pause` | parent (own) | One-click pause |
| POST | `/families/:id/wallet/resume` | parent (own) | Resume |
| POST | `/admin/wallet/:wallet_id/adjust` | admin | Manual adjustment (refund / comp) — fully audited |

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

### 5.11 LLM Proxy (`/llm`) — DeepRouter gateway

| Method | Path | Roles | Purpose |
|---|---|---|---|
| POST | `/llm/text-completion` | kid (own), parent (own) | Server-side proxy to DeepRouter — Stars metered, audit emitted, kid-safe prompt injected |
| POST | `/llm/image` | same | Image generation |
| POST | `/llm/tts` | same | Text-to-speech |
| POST | `/llm/music` | same | Music generation |
| POST | `/llm/video` | same | Short video generation |

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

All admin actions emit AuditEvent with `actor=admin` and `event_type=admin.*`.

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
| `approval.new` | family:* | ApprovalRequest | Parent push when kid requests |
| `approval.resolved` | family:*, kid:* | ApprovalRequest | Kid sees decision instantly |
| `class.kid_progress` | class:* | `{ kid_id, project_id, status, % }` | Teacher live mode |
| `class.kid_stuck` | class:* | `{ kid_id, project_id, last_action_at }` | Teacher gets a nudge |
| `agent.stream.delta` | kid:* | `{ delta_text, token_count }` | Streaming AI output to kid UI |
| `agent.stream.done` | kid:* | `{ stars_charged, summary }` | End of stream |

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
