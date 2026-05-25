# Institution (School / Org) — B2B Tenant Surface — PRD

> **Status**: Draft v0.2 · 2026-05-25
> **Scope**: Institution data model, `school_admin` role, school onboarding & registration, school-scoped RBAC, **course procurement & curriculum design (Entitlements + Bundles)**, B2B billing & seat allocation, SSO, school-side analytics
> **Author**: Airbotix engineering
> **Depends on**: `platform-backend-api-spec.md` (data model + endpoint conventions), `teacher-console-prd.md` (consoles share one SPA), `auth-system-prd.md` (login flows), `parent-portal-prd.md` (family invite via school)
> **Sibling**: `super-admin-prd.md` (super-admin promotes / demotes institution-tier roles)
> **Phasing**: V0 deferred. **V1 = on first signed B2B school contract.** V2 = scaled multi-school operations.

---

## 1. Purpose

The Institution surface is **how Airbotix runs B2B school partnerships at platform scale**. It exists to deliver four jobs that the current `parent` / `teacher` / `admin` model cannot do at all:

1. **Bulk identity & enrollment** — a school onboards 100–500 students in days, not weeks; Year-on-year roster rollover happens once per academic term, not 500 parent invites
2. **School-scoped permissions** — a school's IT lead sees their school's classes, students, Stars consumption, incidents — and **only** their school's data
3. **B2B billing & seat allocation** — invoice the school for N seats per year, school allocates Stars budget to enrolled kids; **never** ask the school's 500 parents to top up individually
4. **Compliance delegation** — when a kid joins through their school, the **school is the legal data controller**, not Airbotix; consent flows, retention policies, and parental rights handoff change accordingly (AU Privacy Act + state-level student-data laws)

This PRD is the contract for what the platform must do **before the first signed B2B contract goes live in production**. It is intentionally deeper than what V0 needs, because school sales conversations move faster when the spec is on the table.

### 1.1 Why a single PRD (not split across surfaces)

Schools cut across every existing surface: `parent-portal` (parents enrolling via school code), `airbotix-app/learn` (kid login may be school SSO), `teacher-console` (school admin needs a console surface), `platform-backend` (Institution data model + endpoints), `super-admin` (institution lifecycle). Rather than scatter requirements into 5 PRDs, this doc owns the *Institution-as-a-domain* contract; each affected surface gets its own §4–8 section saying "what changes here when Institution lands".

### 1.2 Non-goals

- **Multi-tenant white-label** (re-skinning Airbotix as another brand) — never, this is one product
- **District / multi-school org** with cross-school admin (a "regional VP of curriculum") — V2+ when first multi-school district contract requires
- **Microsoft / Apple Classroom integrations** — V2+
- **Free-tier school sandbox** — every Institution is a paid contract; trial seats are `pending_billing` rows, not a separate tier
- **School-direct payment in non-AU regions** — Airwallex AUD invoicing only V1; multi-currency V2+
- **Student-Information-System (SIS) sync** (Sentral / Compass / SEQTA) — V2+, on second school's explicit request

---

## 2. Personas

| Persona | Role in platform | V1 headcount per school | Primary need |
|---|---|---|---|
| **School Admin** (IT lead / Head of Digital / DPO equivalent) | `school_admin` — new role | 1–2 | Roster mgmt, Stars budget oversight, incident escalation, billing portal access |
| **School Teacher** (existing) | `teacher` with `institution_id` foreign-keyed | 1–5 | Same teacher console as Airbotix-employed teachers; sees only their classes |
| **Principal / Head of School** (decision-maker) | `school_admin` with `is_billing_signatory=true` (sub-flag, not a role) | 1 | Read-only access to roster + bills; signs renewal |
| **Parent (via school)** | `parent` with `enrolled_via_school_id` set on `Family` | per family | Reduced friction onboarding (no Stars top-up); same `/portal/*` UI, fewer billing surfaces |
| **Kid (via school)** | `kid` with `KidProfile.family.enrolled_via_school_id` set | 50–500 | Same `/learn/*` UI; may use school SSO instead of family code + PIN |
| **Airbotix Account Manager** (internal, V2+) | `admin` with new `responsible_for_institution_ids` attribution | — | CS surface (out of scope this PRD; covered by `teacher-console-prd.md` §4.6+) |

---

## 3. Data model — new entities & schema changes

All changes additive — V0 Family / Kid / Class records continue to work unchanged with `institution_id = NULL`.

### 3.1 New tables

```prisma
model Institution {
  id                  String              @id @default(cuid())
  name                String                                          // "St Margaret's School"
  short_code          String              @unique                     // "STMARGS" — used in URLs, codes
  country             String                                          // ISO-3166-1, V1 = "AU" only
  state_or_region     String?                                         // "NSW", "VIC" — for AU compliance regimes
  legal_entity_name   String                                          // exact name on invoice
  abn_or_acn          String?                                         // AU business number — V1
  primary_contact_email String
  primary_contact_name  String
  status              InstitutionStatus                                // pending | active | suspended | terminated
  seat_quota          Int                 @default(0)                  // contracted student seats
  stars_pool_balance  Int                 @default(0)                  // bulk-purchased Stars not yet allocated
  topic_overrides     Json                @default("{}")               // institution-wide topic policy
  data_controller     Boolean             @default(false)              // V1 true: school is COPPA/Privacy controller for its kids
  sso_provider        SsoProvider?                                     // null | google_workspace | saml (V2)
  sso_domain          String?                                          // "@stmargs.edu.au" — auto-route logins
  created_at          DateTime            @default(now())
  updated_at          DateTime            @updatedAt
  deleted_at          DateTime?

  enrollments         SchoolEnrollment[]
  staff               SchoolStaff[]
  audit_events        AuditEvent[]                                     // back-ref via metadata.institution_id

  @@index([short_code])
  @@index([status])
}

enum InstitutionStatus {
  pending           // contract signed, not yet provisioned
  active
  suspended         // billing or compliance issue
  terminated        // contract ended; read-only access for data export 90d, then erasure
}

enum SsoProvider {
  google_workspace
  saml              // V2+
}

// Family ↔ Institution membership. A Family CAN belong to multiple Institutions
// over its lifetime (kid changes schools); only one is "active" at a time.
model SchoolEnrollment {
  id                String              @id @default(cuid())
  institution_id    String
  family_id         String
  status            EnrollmentStatus
  enrolled_at       DateTime            @default(now())
  unenrolled_at     DateTime?
  seat_consumed     Boolean             @default(true)                 // counts against Institution.seat_quota
  stars_allocation  Int                 @default(0)                    // institution-allocated stars budget for this family
  metadata          Json                @default("{}")                  // e.g. school year group, class assignment

  institution       Institution         @relation(fields: [institution_id], references: [id], onDelete: Restrict)
  family            Family              @relation(fields: [family_id], references: [id], onDelete: Cascade)

  @@unique([institution_id, family_id, status])
  @@index([institution_id])
  @@index([family_id])
}

enum EnrollmentStatus {
  invited           // school admin added family; family has not yet accepted invite
  active
  paused            // mid-year suspension (kid moved schools, family request)
  unenrolled        // post-end-of-year; stays for analytics, no LLM access via school budget
}

// User ↔ Institution staff relationship (school_admin and teacher).
// A user CAN be staff at multiple institutions (rare but happens with contractor teachers).
model SchoolStaff {
  id                  String              @id @default(cuid())
  institution_id      String
  user_id             String
  role                SchoolStaffRole
  is_billing_signatory Boolean            @default(false)
  invited_at          DateTime            @default(now())
  accepted_at         DateTime?
  revoked_at          DateTime?

  institution         Institution         @relation(fields: [institution_id], references: [id], onDelete: Cascade)
  user                User                @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([institution_id, user_id, role])
  @@index([user_id])
}

enum SchoolStaffRole {
  school_admin        // full school-scope authority
  school_teacher      // same surface as Airbotix teacher; institution_id scopes their default class filter
}

// What courses an Institution has licensed. One row per (institution, course_pack)
// or per (institution, all_access). Drives Bundle composition eligibility.
model InstitutionEntitlement {
  id                String              @id @default(cuid())
  institution_id    String
  scope             EntitlementScope                                   // single_pack | all_access | trial
  course_pack_id    String?                                            // null when scope=all_access
  seats_licensed    Int                 @default(0)                    // student-seats granted under this entitlement
  starts_at         DateTime
  expires_at        DateTime                                           // V1 always annual; no perpetual in V0
  status            EntitlementStatus
  contract_ref      String?                                            // CRM/contract id for audit
  metadata          Json                @default("{}")                  // pricing tier, custom terms summary
  created_at        DateTime            @default(now())
  updated_at        DateTime            @updatedAt

  institution       Institution         @relation(fields: [institution_id], references: [id], onDelete: Cascade)
  course_pack       CoursePack?         @relation(fields: [course_pack_id], references: [id])

  @@index([institution_id, status])
  @@index([course_pack_id])
}

enum EntitlementScope {
  single_pack         // school licensed one named pack (e.g. "AI Foundations — Year 5")
  all_access          // school licensed the whole catalog
  trial               // 30-day evaluation, locked to 1 class / ≤30 kids
}

enum EntitlementStatus {
  active
  expired
  cancelled
}

// School's custom curated sequence of missions drawn from their entitlements.
// A Bundle is what gets assigned to a Class; never raw missions and never raw CoursePacks.
model CurriculumBundle {
  id                String              @id @default(cuid())
  institution_id    String
  name              String                                              // "Year 5 Term 2 — AI Coding Starter"
  description       String?
  cover_color       String?                                             // theme accent for UI
  target_year_group String?                                             // "Year 5", "Year 6-7", or null = mixed
  status            BundleStatus
  is_template       Boolean             @default(false)                 // if true, can be cloned but not assigned directly
  created_by        String                                              // school_admin user_id
  published_at      DateTime?
  archived_at       DateTime?
  created_at        DateTime            @default(now())
  updated_at        DateTime            @updatedAt

  institution       Institution         @relation(fields: [institution_id], references: [id], onDelete: Cascade)
  items             CurriculumBundleItem[]
  classes           Class[]                                              // back-ref via Class.curriculum_bundle_id

  @@index([institution_id, status])
}

enum BundleStatus {
  draft
  published
  archived
}

// Ordered missions inside a Bundle. A mission can appear in multiple Bundles.
// Eligibility enforced at write-time: mission's CoursePack must have an active
// InstitutionEntitlement covering it (single_pack match OR all_access).
model CurriculumBundleItem {
  id              String              @id @default(cuid())
  bundle_id       String
  mission_id      String
  position        Int                                                    // 0-based ordering within bundle
  is_optional     Boolean             @default(false)
  overlay         Json                @default("{}")                     // school-side overlay (display label, hidden flag, intro note)
                                                                          // see §11.4 for what is and isn't overridable

  bundle          CurriculumBundle    @relation(fields: [bundle_id], references: [id], onDelete: Cascade)
  mission         Mission             @relation(fields: [mission_id], references: [id], onDelete: Restrict)

  @@unique([bundle_id, mission_id])
  @@index([mission_id])
}
```

### 3.2 Changes to existing tables

| Table | Field added | Reason |
|---|---|---|
| `Family` | `enrolled_via_school_id String? @index` | Quick filter: families that came via school, for V1 billing logic + compliance flag |
| `Family` | `data_controller Enum(airbotix \| institution \| parent)` | Who owns consent — `parent` for D2C, `institution` for school-onboarded |
| `Class` | `institution_id String? @index` | Class is taught at school X (already implicit via teacher's school; this makes it explicit and queryable) |
| `User` | New enum value `school_admin` on `UserRole` | New role |
| `AuditEvent` | `institution_id String?` (denormalized for fast filter) | Institution-scoped audit slice |
| `WalletTransaction` | New `TxType.institution_allocation` | Stars moved from `Institution.stars_pool_balance` → `Wallet.stars_balance` |
| `WalletTransaction` | New `TxType.institution_reclaim` | Stars returned from family wallet to institution pool (end of year) |
| `CoursePack` | `is_school_eligible Boolean @default(true)` | Some D2C-only packs (e.g. holiday personal projects) can be flagged ineligible for school licensing |
| `CoursePack` | `curriculum_alignments Json @default("{}")` | Maps to external curricula — keys: `au_dt_f10` (Australian Digital Technologies F-10 strand codes), `gcse_cs`, etc. — for school browsing filter |
| `Class` | `curriculum_bundle_id String? @index` | A school-flavoured class is assigned a Bundle (not a CoursePack directly); D2C classes still set `course_pack_id` |
| `Mission` | `curriculum_alignments Json @default("{}")` | Per-mission alignment — granularity matters for schools that filter by syllabus strand |

### 3.3 What does NOT change

- `Family` stays the unit of family identity. A family with a school enrollment is still a family — parents still log in to `/portal/*`, kids still log in to `/learn/*`. **No "school account" as primary identity** — that's how COPPA-friendly platforms work, not how SaaS-tenant platforms work, and Airbotix is the former.
- `Wallet` stays family-scoped. Institution Stars pool funds individual family wallets via `institution_allocation` transactions; once allocated, Stars are family property (with reclaim rules — see §7.3).
- `KidProfile` schema unchanged. Discoverable as "school kid" via `family.enrolled_via_school_id`.
- `CoursePack` + `Mission` content is **authored by Airbotix only**. Schools cannot create or edit missions — they license, bundle (re-order / subset / annotate), and assign. This keeps content quality + compliance review in one team. School-authored content is V2+ at earliest (see §13 Q9).

---

## 4. Roles & RBAC

### 4.1 New role: `school_admin`

`UserRole` enum gains `school_admin`. Capabilities (institution-scoped — never cross-institution):

| Capability | school_admin | school_teacher | airbotix teacher | airbotix admin | super_admin |
|---|---|---|---|---|---|
| View own institution's families | ✓ | ✗ | ✗ | ✓ | ✓ |
| Invite/un-invite families to enrollment | ✓ | ✗ | ✗ | ✓ | ✓ |
| Allocate Stars from school pool to family | ✓ | ✗ | ✗ | ✓ | ✓ |
| Reclaim unused Stars at end of year | ✓ | ✗ | ✗ | ✓ | ✓ |
| Create classes scoped to own institution | ✓ | ✗ (V2+) | ✓ | ✓ | ✓ |
| Browse course catalog (filtered to entitlements) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create / edit / publish CurriculumBundle | ✓ | ✗ (V2+) | ✗ | ✓ | ✓ |
| Assign Bundle to class | ✓ | ✗ | ✗ (D2C only) | ✓ | ✓ |
| Purchase / extend Entitlement | ✓ (signatory only) | ✗ | ✗ | ✓ | ✓ |
| View entitlement utilisation | ✓ | ✗ | ✗ | ✓ | ✓ |
| Trial entitlement self-serve activation | ✓ | ✗ | ✗ | ✓ | ✓ |
| Invite school_teacher (own institution only) | ✓ | ✗ | ✗ | ✓ | ✓ |
| View school-scoped analytics | ✓ | ✗ | ✗ | ✓ | ✓ |
| View school billing & invoices | ✓ (or signatory) | ✗ | ✗ | ✓ | ✓ |
| Cross-institution view | ✗ | ✗ | ✗ | ✓ | ✓ |
| Edit `Institution` metadata | ✗ | ✗ | ✗ | ✓ | ✓ |
| Suspend / terminate institution | ✗ | ✗ | ✗ | ✗ | ✓ |
| Pause / restore kid (own institution) | ✓ | ✗ | ✗ | ✓ | ✓ |
| Impersonate kid (own institution) | ✗ | ✗ | ✗ | ✗ | ✓ only |

### 4.2 Scoping rule (D-INST5)

Every Institution-scoped endpoint enforces:

```ts
@Roles('school_admin', 'admin', 'super_admin')
async someEndpoint(@Param('id') id: string, @CurrentUser() user: AuthPrincipal) {
  if (user.role === 'school_admin') {
    const allowed = await this.institutions.userBelongsTo(user.id, /* derived institution_id */);
    if (!allowed) throw new ForbiddenException('INSTITUTION_SCOPE');
  }
  // admin / super_admin pass through
}
```

The check lives in services, never controllers (matches `platform-backend/CLAUDE.md` §6). A `school_admin` calling any other institution's resource returns `403 INSTITUTION_SCOPE`. Logged as `auth.forbidden.cross_institution` AuditEvent.

### 4.3 Authentication

- school_admin: same as Airbotix admin — email OTP. **No TOTP required in V1** (school IT leads aren't on call; the blast radius is one school). TOTP **encouraged** via in-app prompt after 30 days.
- school_teacher: same flow as Airbotix teacher (email OTP). If institution has SSO configured, login routes through Google Workspace (see §6).
- Kid via school SSO: see §6.2

---

## 5. Onboarding & registration

Two flows that produce different starting states:

### 5.1 Flow A — Airbotix-driven onboarding (V1 default)

When the sales lead signs a contract:

1. **Airbotix `admin`** creates Institution record via `POST /admin/institutions` (status=`pending`, seat_quota set, contract terms recorded)
2. Admin invites the school's primary contact via `POST /admin/institutions/:id/staff` (role=`school_admin`, `is_billing_signatory=true`)
3. Invite email goes to primary contact with magic link → `school_admin` accepts, completes onboarding wizard:
   - Confirm school name + ABN/ACN
   - Set short_code (for URLs) — admin-vetted to avoid squatting
   - Optionally configure SSO domain (`@stmargs.edu.au`)
   - Upload roster CSV (template: `kid_real_name, dob, year_group, parent_email_primary, parent_email_secondary?`)
4. System parses CSV → creates `SchoolEnrollment` rows in `status=invited` + sends parent invite emails (one per family)
5. Parent accepts invite → Family record provisioned with `enrolled_via_school_id` and `data_controller=institution` → kid auto-added with `is_active=false` until parent confirms participation
6. Institution status flips `pending` → `active` after first parent accepts
7. Seat counter ticks up; if exceeds `seat_quota`, system blocks new invites and notifies both school_admin + Airbotix account manager

### 5.2 Flow B — Family-initiated linking (V2+)

A family already on Airbotix (D2C) discovers their kid's school joined. They enter a school code in `/portal/settings` → school_admin gets an approval task → on approval, family becomes `enrolled_via_school_id`, retroactive (no data loss). Skipped V1.

### 5.3 Bulk operations

V1 bulk endpoints accept CSV / JSON arrays. Batch size cap = 500 per call. Server returns per-row status (`created` / `skipped_duplicate_email` / `error_<reason>`). Errors don't fail the whole batch.

```
POST /school/:id/enrollments/bulk
POST /school/:id/enrollments/:enrollment_id/allocate-stars
POST /school/:id/enrollments/bulk/unenroll                 // end-of-year cleanup
```

---

## 6. SSO & domain claim (D-INST4)

### 6.1 Provider phasing

| Phase | Provider | Why |
|---|---|---|
| V1 | Google Workspace (OAuth 2.0 OIDC) | ~70% AU independent schools use Google Workspace for Education |
| V2 | SAML 2.0 | Public-system schools (catholic / state departments) require SAML; defer until specific contract triggers |
| V3+ | Microsoft 365 (Azure AD), Apple Classroom | Volume-justified only |

### 6.2 Domain claim

A school proves ownership of a domain (`@stmargs.edu.au`):
1. school_admin enters domain
2. System generates a TXT DNS record + a verification URL
3. Either path verifies; on success, all signups with that email domain auto-route to this institution's SSO
4. Re-verify quarterly (DNS lookup + email to primary contact)

### 6.3 Kid SSO

Optional V1 — V0 default is family-code + nickname + PIN per `auth-system-prd.md`. If institution opts in:
- Kid clicks "Sign in with Google" on `/learn/login` → Google Workspace tenant returns `email@stmargs.edu.au`
- Backend matches against `KidProfile.school_sso_email` (new field, populated during roster import)
- On match, mints kid JWT with `role=kid`, same shape as PIN login
- **PIN remains the fallback** — never replace it (compliance: kid must have a way to authenticate without depending on a 3rd party they don't control)

### 6.4 Failure modes

- SSO down → fall back to PIN/OTP (banner: "School login unavailable, please use your family code")
- Domain ownership lapses → SSO disabled, school_admin notified, existing sessions valid till expiry
- Compromised SSO tenant → super_admin "Disable SSO for institution" emergency switch (§7 below)

---

## 7. School Admin Console — `/school/*` (D-INST1)

Lives **inside `teacher-console`** as a new route group, gated by `role=school_admin`. Reuses existing components (`<RoleGate>`, `<DataTable>`, `<AuditFeed>`). No new SPA. No `school.airbotix.ai` subdomain — schools log in at `teacher.airbotix.ai` and land directly in `/school/*` if their role is `school_admin`.

### 7.1 IA

```
teacher.airbotix.ai/school/
├── /school                       — Institution home dashboard
├── /school/roster                — Enrolled families & kids
├── /school/roster/import         — CSV upload + per-row preview
├── /school/staff                 — Teachers + co-admins at this institution
├── /school/classes               — Classes scoped to this institution
├── /school/curriculum            — Bundle library (drafts, published, archived)
├── /school/curriculum/catalog    — Browse licensed CoursePacks + missions
├── /school/curriculum/:bundleId  — Bundle editor (sequence, annotations, alignment)
├── /school/curriculum/entitlements — Licenses owned, expiry, seats utilised
├── /school/budget                — Stars pool, allocations, reclaim
├── /school/analytics             — School-scoped analytics (subset of super-admin §5.7)
├── /school/billing               — Invoices, contract terms (signatory only)
├── /school/incidents             — Institution-scoped incident feed
└── /school/settings              — SSO config, domain claim, data controller declarations
```

### 7.2 Page sketches

#### `/school` home
- Seat utilization: 247 of 300 active (with bar)
- Stars: pool balance / allocated / consumed-this-month
- Active kids today / week / month
- Recent incidents (institution-scoped)
- Quick actions: invite family, allocate stars, contact Airbotix

#### `/school/roster`
- Table: family_code, primary parent email, # kids, year group, status, last activity, stars allocated, stars consumed
- Filters: status, year group, has-LLM-activity-in-last-30d
- Per-row actions: pause, unenroll (with reason), top-up stars allocation
- Bulk actions: unenroll selected (end-of-year flow), top-up selected
- Privacy gate: kid nicknames hidden by default; "Show nicknames" requires school's data-controller declaration (see §10) confirmed in current session

#### `/school/budget`
- Stars pool balance + recent purchases (Airwallex receipts)
- Allocation table: family → allocated → consumed → remaining
- Top-up modal: "Add Stars" (charges Institution billing — different from family wallet top-up flow)
- Reclaim policy preview: "Unused stars at year-end return to pool" (with toggle in /school/settings)

### 7.3 Stars allocation contract (D-INST3)

Hybrid model:
1. Institution purchases Stars in bulk → `Institution.stars_pool_balance` increases
2. school_admin allocates to enrolled family → atomic transaction:
   - decrement `Institution.stars_pool_balance` by N
   - increment `Wallet.stars_balance` by N
   - emit `WalletTransaction(tx_type=institution_allocation, institution_id, family_id, amount=N)`
3. Family uses Stars normally (LLM debits via existing `debit_llm` tx type) — once allocated, Stars are family property
4. **End-of-year reclaim** (optional, controlled by `Institution.settings.reclaim_unused = true`):
   - On `SchoolEnrollment.status=unenrolled`, any `Wallet.stars_balance` originating from `institution_allocation` (tracked via `WalletTransaction.metadata.source_institution_id`) returns to pool
   - Emit `WalletTransaction(tx_type=institution_reclaim)`
   - Family's own (D2C top-up) Stars are **never** reclaimed
5. Stars never have a hard expiry per platform rule (`kids-ai-platform-prd.md` §3); reclaim is the school-equivalent of "expire unused"

Race-safety: allocation uses the same conditional-decrement pattern as wallet debit (per `platform-backend/CLAUDE.md` §1). Reclaim batch is non-atomic across families but each per-family op is atomic.

---

## 8. Cross-surface impact

### 8.1 Changes to `parent-portal-prd.md`

When `Family.enrolled_via_school_id` is set:
- "School: St Margaret's" badge in header
- Top-up flow shows: "Your school has allocated X Stars. Need more? You can purchase additional Stars personally, or request more from your school."
- Settings → new "School data sharing" section showing what the school admin can see about this family
- Billing tab hidden if school is sole funder; reveal if family has any personal top-ups

### 8.2 Changes to `airbotix-app-learn-prd.md`

When kid's family is school-enrolled:
- Login screen shows institution branding (logo + name) under family code field
- "Sign in with School" button if SSO configured
- Topic catalog filtered to `Institution.topic_overrides` first, platform defaults second
- Incident escalation includes school_admin in notification chain (in addition to parent)

### 8.3 Changes to `teacher-console-prd.md`

- `/school/*` route group added (new section §5 entry below; not yet written in teacher-console-prd v0.1)
- Teacher's default class filter respects `school_teacher.institution_id` (sees own institution's classes first)
- Approval requests gain `institution_context` field so reviewers see school policy

### 8.4 Changes to `super-admin-prd.md`

New §5.8 candidate: `/admin/system/institutions` — super_admin lifecycle for institutions (create, suspend, terminate, SSO disable emergency switch, contract renewal tracking). To be appended when this PRD reaches v0.2.

### 8.5 Changes to `auth-system-prd.md`

New §X "Institution SSO" — Google Workspace OIDC flow, domain claim verification, kid SSO with PIN fallback. Cross-reference §6 of this PRD.

### 8.6 Changes to `platform-backend-api-spec.md`

§5 endpoint table gains:
```
POST   /admin/institutions                           super_admin / admin
GET    /admin/institutions                           super_admin / admin
PATCH  /admin/institutions/:id                       super_admin / admin
POST   /admin/institutions/:id/suspend               super_admin
POST   /admin/institutions/:id/entitlements          super_admin / admin
PATCH  /admin/institutions/:id/entitlements/:eid     super_admin / admin
GET    /admin/institutions/:id/entitlements          super_admin / admin
GET    /school                                       school_admin (own institution implicit)
GET    /school/roster                                school_admin
POST   /school/roster/bulk-invite                    school_admin
POST   /school/roster/:id/unenroll                   school_admin
POST   /school/budget/topup                          school_admin (signatory only)
POST   /school/budget/allocate                       school_admin
POST   /school/budget/reclaim                        school_admin
GET    /school/analytics/{overview,classes,kids,curriculum} school_admin
GET    /school/billing/invoices                      school_admin (signatory)
POST   /school/staff/invite                          school_admin
GET    /school/curriculum/catalog                    school_admin / school_teacher
GET    /school/curriculum/entitlements               school_admin
GET    /school/curriculum/bundles                    school_admin / school_teacher
POST   /school/curriculum/bundles                    school_admin
PATCH  /school/curriculum/bundles/:id                school_admin
POST   /school/curriculum/bundles/:id/publish        school_admin
POST   /school/curriculum/bundles/:id/archive        school_admin
POST   /school/curriculum/bundles/:id/clone          school_admin
POST   /school/curriculum/bundles/:id/items          school_admin
PATCH  /school/curriculum/bundles/:id/items/:itemId  school_admin
DELETE /school/curriculum/bundles/:id/items/:itemId  school_admin
POST   /school/classes                               school_admin (requires published bundle_id)
GET    /auth/sso/google/start?institution=:code      public
GET    /auth/sso/google/callback                     public
POST   /auth/sso/domain/claim                        school_admin
```

---

## 9. Billing & contracts

### 9.1 Pricing model (V1)

Per `BP.md` and `kids-ai-platform-prd.md` §4:
- Annual contract, A$150–300 per enrolled student
- Includes baseline Stars allocation (typically 100 Stars / student / year ≈ enough for weekly LLM usage)
- Top-up Stars purchasable at School pricing tier (current SKU: `school_100` — $100 = 1500 Stars, ~50% bonus vs D2C)
- Optional add-ons: live teacher hours, custom CoursePacks, school-specific topic curation

### 9.2 Invoicing

- Airwallex business invoicing (NOT card top-up like D2C)
- Quarterly or annual billing cadence (signed at contract time)
- Invoices generated in `Institution.legal_entity_name`, sent to primary contact + signatory
- AUD-only V1; multi-currency requires Airwallex multi-FX setup — V2+
- Late payment grace: 30 days, then `Institution.status=suspended` automatically (LLM blocked, read-only access preserved)

### 9.3 Renewal & termination

- 60 days before contract end: account manager notified, school_admin sees renewal banner
- On termination: status → `terminated`, kid login disabled at next session boundary, parent portal shows "Your school's subscription has ended — your family Stars remain available"
- 90-day grace period: full data export available (CSV roster, project artifacts) → after 90d, soft-delete; hard-delete cron at 1 year per retention policy

---

## 10. Compliance & data controller

The single biggest legal difference between D2C and B2B-school flows.

### 10.1 Data controller delegation

When a Family has `data_controller = institution`:
- The **school**, not Airbotix, is the legal controller of the kid's personal data (real name, DOB, school records)
- Airbotix acts as processor under a written Data Processing Agreement (DPA) signed at contract time
- Parental consent for AI processing flows through the school's existing consent regime (school's privacy policy + opt-in form), **not** Airbotix's parent portal consent flow
- AU Privacy Act 1988 + state-level student data laws (e.g. NSW DoE policy on AI use in schools) apply

### 10.2 Compliance hooks already in place

- C5 (kid metadata stripped before LLM forwarding) — unchanged; Institution context doesn't loosen this
- C7 (kid auth) — Institution SSO is permitted only as **additional** factor; PIN fallback always available
- C12 (data export on request) — Institution-onboarded family export requests go to school_admin first, with Airbotix support

### 10.3 New compliance items C16–C18 (to add to `minors-compliance.md`)

- **C16** Data processing agreement signed before Institution status flips to `active`
- **C17** kid real_name visible to school_admin only after explicit "data controller acknowledgement" in current session; nickname-only view by default
- **C18** Institution termination triggers data retention countdown (export 90d, soft 1y, hard delete 7y or per state requirement); audit log retention overrides per `audit-event-schema-prd.md`

---

## 11. Course procurement & curriculum design

This is the primary value the platform delivers to a school: **buy curriculum once, compose flexibly, assign per class, see what worked**. It's also the most operationally distinct B2B flow from D2C — a parent picks a course pack; a school licenses content, then has a curriculum lead design a programme.

### 11.1 Procurement model (D-INST6)

Two purchase shapes, both annual, both seat-priced. Sales chooses based on school size + scope at contract signing; the data model supports both without code branches.

| Shape | When to sell | Pricing anchor | Maps to |
|---|---|---|---|
| **Single-pack license** | School wants a specific programme (e.g. "AI Foundations — Year 5–6") for one cohort | Per-seat × pack list price | `InstitutionEntitlement.scope=single_pack` + `course_pack_id` |
| **All-access license** | Whole-school adoption, multiple year groups, school wants curriculum flexibility year-on-year | Per-seat at a premium (~1.6× single-pack equivalent) | `InstitutionEntitlement.scope=all_access` + `course_pack_id=null` |
| **Trial** | Pre-contract evaluation, 30 days | Free (or token AUD for invoice trail) | `InstitutionEntitlement.scope=trial`, hard-capped to 1 Class / ≤30 kids |

Rules:
- An Institution can hold **multiple concurrent entitlements** — e.g. all-access + a specialty pack add-on that's not in the catalog yet
- `seats_licensed` is a soft cap for enrollment + a hard cap for bundle assignment count of new classes — exceeding triggers a warning to school_admin and an alert to Airbotix account manager
- Expired entitlements are **read-only**: existing assigned bundles continue to work for the remainder of the academic year; new bundle composition from the expired pack is blocked, with a clear "Renew to keep building" CTA
- V0 has no perpetual / lifetime entitlements — every contract renews; this protects revenue and lets us improve catalog without grandfathering content

### 11.2 Browsing the catalog (`/school/curriculum/catalog`)

A school_admin or school_teacher browses the catalog filtered to **what their institution can use**:

- Top-level filter: "My licensed packs" (default) / "All packs" (read-only preview, with "Request access" CTA → opens a sales conversation)
- Within licensed scope, filters: year group, topic (AI / robotics / music / story / code), session length, **curriculum alignment** (AU Digital Technologies F-10 strand, ACARA general capability), creator (Airbotix / partner)
- Card view per pack: cover, target age band, mission count, est. total session time, alignment badges, "Open" + "Add to bundle" actions
- Drill-in: pack detail page lists all missions with per-mission alignment, est. duration, prerequisite chain, sample artifact thumbnails, content rating (per `kids-ai-platform-prd.md` compliance C tags)
- **Search**: full-text on mission title + alignment strand code (e.g. "ACTDIK008")

### 11.3 Bundle composition (`/school/curriculum/:bundleId`)

A school designs a **CurriculumBundle** — an ordered sequence of missions drawn from their licensed packs. This is what gets assigned to classes; raw packs are not assignable directly to school classes (only D2C self-serve classes link straight to a pack).

UX:
- Left rail: catalog browser (same filters as §11.2) with checkboxes to add missions
- Right rail: bundle outline — drag-to-reorder missions, per-row "optional" toggle, per-row annotation (school's intro note), per-row "hide for now" (kept in bundle but invisible to kids until unhidden)
- Top: bundle metadata (name, target year group, cover color, alignment summary auto-aggregated from picked missions)
- Status flow: `draft` → `published` (assignable) → optionally → `archived` (kept for historical class records, not selectable for new classes)
- Validation on publish:
  - All missions must be from active entitlements (re-checked on publish — entitlement may have expired since drafting)
  - At least 1 mission
  - Name unique within institution
- Templates: school can save a published bundle as `is_template=true`; clones inherit items but reset metadata + start as `draft`

### 11.4 What schools can / can't customise (D-INST7)

V1 is **deliberately narrow** on customisation to protect content quality and compliance review. The bundle overlay layer is the only allowed customisation surface.

| Customisation | V1 | Stored in | Rationale |
|---|---|---|---|
| Re-order missions across the bundle | ✓ | `CurriculumBundleItem.position` | School-level pedagogy decision |
| Mark mission as optional | ✓ | `CurriculumBundleItem.is_optional` | Differentiation for advanced/struggling cohorts |
| Hide mission temporarily (still in bundle) | ✓ | `overlay.hidden=true` | "We'll get to it next term" use case |
| Add school-side intro note before mission | ✓ | `overlay.intro_note` | Connect mission to school's existing scheme of work |
| Rename mission display title (school-side only) | ✓ | `overlay.display_label` | Match school's local terminology |
| Subset a pack (use 5 of 10 missions) | ✓ | Just don't add the other 5 to bundle | Trivial via composition |
| Combine missions from multiple packs | ✓ (if all licensed) | Just add cross-pack | Core value of bundles |
| Edit mission **content** (prompts, instructions, kid-facing copy) | ✗ V1 | n/a | Content quality + LLM prompt audit lives with Airbotix |
| Replace illustrations / videos | ✗ V1 | n/a | Asset rights + brand integrity |
| Add school-authored missions | ✗ V1, V2+ candidate | n/a | Requires content review pipeline + LLM safety review per `minors-compliance.md` |
| Custom rubrics / grade integration | ✗ V1, V2+ candidate | n/a | Belongs in a future SIS-integration story |

### 11.5 Assigning a Bundle to a Class

When school_admin or school_teacher creates a Class scoped to their institution:
- Mandatory: pick a `published` Bundle from their institution
- Optional: override start/end dates, max enrollment, delivery_mode (existing Class fields)
- On save, system snapshots `bundle.items[]` → individual `MissionAssignment` rows on the class (so later bundle edits don't retroactively change a running class — explicit "Pull latest from bundle" button does that)

This snapshot-at-assign behaviour matters: a teacher partway through Term 2 doesn't want curriculum order shuffling beneath them because someone edited the bundle template.

### 11.6 Curriculum alignment metadata

Curriculum-alignment metadata on every Mission + CoursePack:

```json
{
  "au_dt_f10": ["ACTDIK008", "ACTDIP021"],     // AU Digital Technologies F-10
  "au_general_capability": ["critical_creative_thinking", "digital_literacy"],
  "year_group_recommended": ["5", "6", "7"],
  "uk_computing_ks2": ["KS2.AL.1"],            // V2+ for UK market
  "gcse_cs": []                                  // V2+
}
```

This drives:
- Catalog filter ("show me missions aligned to ACTDIK008")
- Bundle outline auto-summary ("This bundle covers 4 ACTDIK strands")
- A school-facing **alignment report** in `/school/analytics/curriculum` (V1.5): "Your published bundles cover N% of the Year 5–6 Digital Technologies strands"

Source of truth for the strand codes lives in a new `curriculum/` directory at the airbotix repo root (`docs/product/curriculum/au-dt-f10.json` etc.) — same maintenance regime as `rules/`. Strand definitions reviewed quarterly by Airbotix curriculum lead.

### 11.7 Entitlements page (`/school/curriculum/entitlements`)

Single-screen visibility for the school's procurement:
- Table per entitlement: scope, pack name (or "All-access"), seats licensed / used / remaining, starts / expires, status, contract reference
- Per-row actions: "View pack details", "Renew" (handoff to billing — only signatory sees), "Add seats" (mid-year top-up, prorated, again signatory only)
- Trial entitlements have a countdown banner: "Trial ends in N days — convert to keep your bundles working"
- Expiry warnings at T-60 / T-30 / T-7 days (email + in-app)

### 11.8 Sales-side workflow (Airbotix admin)

To complete the loop, here's what admin does to create an Entitlement:

```
POST /admin/institutions/:id/entitlements
{
  "scope": "single_pack",
  "course_pack_id": "ai-foundations-y5",
  "seats_licensed": 60,
  "starts_at": "2026-01-28",        // start of AU school year
  "expires_at": "2026-12-15",
  "contract_ref": "AB-2026-014"
}
```

Auto-triggers:
- AuditEvent (`institution.entitlement.granted`)
- Email to all school_admins at the institution
- Banner on `/school/curriculum/catalog` next visit: "New entitlement available — N missions unlocked"

Mid-contract changes (seat top-up, pack swap) follow the same pattern, all audited.

### 11.9 Out-of-scope V1 (deferred to V2+)

- School-authored missions (requires content review + LLM safety review pipeline)
- Per-kid differentiation overlays (one bundle, multiple kid-specific versions)
- Cross-institution bundle sharing (school A shares a bundle template with school B)
- Branded co-marketing packs (e.g. "St Margaret's × Airbotix Year 6 Programme")
- LMS integration (Canvas, Google Classroom assignment publishing)
- Marketplace where Airbotix partner teachers sell packs

---

## 12. School-scoped analytics

Cross-references `super-admin-prd.md` §5.7. Same architecture (Prisma direct V0, read-replica + MV V1+), filtered to single institution.

`/school/analytics` tabs:
- **Overview**: active families today/7d/30d, Stars consumed, recent incidents (institution-scoped)
- **Classes**: per-class completion rate, average tokens per session, top-performing Bundles
- **Kids**: kid_id + age band + Stars consumed + sessions count (no nicknames unless §10.2 unlock active)
- **Curriculum** (V1.5): per-bundle adoption (classes using it), per-mission completion %, drop-off heatmap, **curriculum-alignment coverage** ("Your published bundles cover 12 of 14 Year 5 ACTDIK strands")
- **Budget burn rate**: Stars consumed per week vs allocation, projected runway
- **Entitlement utilisation**: seats licensed vs used per entitlement, expiry runway, recommendation cues for renewal/upsell ("Class X is using 90% of all-access content")

No financial (revenue / margin) tab for school_admin — that's Airbotix-internal data.

---

## 13. Migration plan

### V0 → V1 (first signed B2B contract)

| Step | Owner | Outcome |
|---|---|---|
| 1 | Engineering | Ship Prisma migration adding `Institution`, `SchoolEnrollment`, `SchoolStaff`, `InstitutionEntitlement`, `CurriculumBundle`, `CurriculumBundleItem`; role enum update; additive fields on `Family` / `Class` / `User` / `Mission` / `CoursePack` / `AuditEvent` / `WalletTransaction` |
| 2 | Engineering | Ship `school_admin` role + RBAC scoping middleware + `<RoleGate roles={['school_admin']}>` in teacher-console |
| 3 | Engineering | Ship `/school/*` route group with §7.1 pages, minimum: home, roster (manual entry), staff, classes, budget |
| 4 | Curriculum | Backfill `curriculum_alignments` JSON on existing missions + course packs (AU DT F-10 strand codes, year groups) |
| 5 | Engineering | Ship `/school/curriculum/*`: catalog browse, bundle CRUD + drag-to-reorder, publish flow, entitlement page |
| 6 | Engineering | Ship `/admin/institutions/:id/entitlements` CRUD + audit hooks; sales runbook for granting entitlements |
| 7 | Engineering | Ship Google Workspace SSO (school_admin login + kid SSO with PIN fallback) |
| 8 | Engineering | Ship bulk roster CSV import (§5.3) |
| 9 | Account Manager | Onboard first school manually via super_admin + write runbook (Entitlement grant → school_admin invite → CSV roster → bundle composition → class creation → kid login) |
| 10 | Engineering V1.5 | Ship `/school/analytics` (incl. curriculum tab + alignment coverage), `/school/billing`, end-of-year reclaim job |

Cycle estimate: ~8–9 engineer-weeks for V1 (was 6; curriculum module added 2-3 weeks), before first paying-school production rollout.

### V1 → V2 (5+ schools, when first specific need lands)

- SAML 2.0 (specific contract trigger)
- SIS integration (Sentral / Compass / SEQTA — pick one based on first request)
- Multi-school district aggregation (if district contract signed)
- Account manager attribution layer (`responsible_for_institution_ids`)
- Per-institution custom CoursePack authoring

---

## 14. Open questions

| Q | Item | Resolution path |
|---|---|---|
| Q1 | Does a school_admin who is *also* a parent at the same school see both surfaces, or only the role they're logged in as? | V1 proposal: single login, role chooser on landing ("Continue as parent" / "Continue as school admin"). JWT carries active role. Switch requires re-OTP. |
| Q2 | Should kid SSO be allowed without PIN fallback if school's privacy policy explicitly allows it? | V1: no exceptions; PIN fallback always available. Revisit V2 with legal review per state. |
| Q3 | Stars reclaim — does it apply mid-year if a kid moves schools, or only at year-end? | V1 default: only at end-of-academic-year batch process. Mid-year mover keeps stars (family-property argument). |
| Q4 | If a school is `suspended` for non-payment, do kids retain D2C-purchased Stars? | Yes — D2C Stars are family property, not Institution-allocated. Only institution-allocated Stars are gated. |
| Q5 | Does Institution support overlap with Class entity? A Class has `institution_id` (§3.2) but Class also has its own teacher list. Are there cases where a school_teacher teaches a class but the class is owned by another institution? | V1: no. Class.institution_id MUST match teacher's school_teacher.institution_id. Cross-institution teaching deferred. |
| Q6 | What's the privacy posture on a school_admin viewing kid project artifacts (drawings, music, code)? | V1 proposal: school_admin sees only metadata (project name, timestamps); content viewing requires explicit family approval per project. Revisit when first school requests broader access. |
| Q7 | Single-sign-out — if a kid logs out of Google Workspace at school, should Airbotix invalidate their session? | V1: no (it's invasive; PIN is the platform's source of identity). V2: opt-in per institution. |
| Q8 | All-access pricing premium — 1.6× single-pack is a default; should sales have flexibility to negotiate down for anchor accounts? | V1: cap discount at 20% off list, requires super_admin approval. Track outcomes in `InstitutionEntitlement.metadata.discount_pct` for retro pricing analysis. |
| Q9 | When does school-authored content become V2? | Trigger: 3rd school explicitly requests it AND we've hired a content moderation lead. Soft commit V2 H2 2027. Don't promise pre-Seed. |
| Q10 | Mid-bundle changes during a running class — current model snapshots at assign-time (§11.5). What if a content fix is critical (typo, errata, safety patch)? | V1 add an "Apply errata to running classes" admin-side override that pushes patches; logs each affected class. Differentiate cosmetic-vs-safety errata in metadata. |
| Q11 | A bundle uses missions from 2 entitlements. One entitlement expires mid-year. Behaviour? | V1: assigned classes continue with snapshot; bundle becomes un-editable until renewal; new classes can't pick this bundle. Banner on `/school/curriculum/:id`: "Renew Pack X to continue editing." |
| Q12 | Should school_teachers be able to compose bundles (V2+ row in matrix), or strictly school_admin? | V1: school_admin only (concentrates curriculum decisions). V2 trigger: first school asks for delegated lead-teacher composing rights. Add `school_curriculum_designer` sub-role then. |

---

## 15. Success criteria (V1 ship)

- First signed school can be fully provisioned by an Airbotix admin in < 1 hour, with 100+ kids invited via CSV
- school_admin completes onboarding (CSV import → first family accepted → first kid login) in < 30 minutes without engineering support
- school_admin builds and publishes a CurriculumBundle from licensed catalog and assigns it to a Class in < 20 minutes
- `school_admin` cannot read **any** other institution's data (verified by integration test)
- `school_admin` cannot add missions to a bundle from a CoursePack their institution doesn't have an active entitlement on (verified by integration test)
- Bundle snapshot at class-assign time isolates running classes from later bundle edits (verified by E2E test)
- Stars allocation + reclaim flows close cleanly at end-of-year without manual intervention
- Compliance items C16–C18 are enforced in code (not just policy)
- AuditEvent feed for an institution shows every meaningful action (entitlement grants, bundle publishes, class assignments) with `institution_id` populated

---

## 16. References

- `BP.md` (commercial context: 2→20 schools by Year 2, A$150-300/student annual)
- `kids-ai-platform-prd.md` §3.6 (school customer persona), §4 (V2 admin scope)
- `teacher-console-prd.md` §1.1 (multi-role console pattern, this PRD extends it), §9 (out-of-scope note this PRD addresses)
- `super-admin-prd.md` §5 (admin-system pattern); needs §5.8 addendum when this PRD ships
- `parent-portal-prd.md` (changes per §8.1)
- `airbotix-app-learn-prd.md` (kid SSO impact per §8.2)
- `platform-backend-api-spec.md` §5 (endpoint conventions; this PRD adds endpoints per §8.6)
- `auth-system-prd.md` (SSO addition per §6)
- `audit-event-schema-prd.md` (institution_id field added per §3.2)
- `docs/product/compliance/minors-compliance.md` (C16–C18 to add per §10.3)

---

## Revision history

- **v0.2 — 2026-05-25** — Added §11 Course procurement & curriculum design (Entitlements as license unit, Bundles as school-composed curricula, snapshot-on-assign, AU DT F-10 alignment). New data model: `InstitutionEntitlement`, `CurriculumBundle`, `CurriculumBundleItem`; additive fields on `CoursePack` / `Mission` / `Class`. New decisions D-INST6 (single-pack vs all-access vs trial) + D-INST7 (overlay-only customisation, no content edit). Bumped §11–§15 → §12–§16. Added Q8–Q12 around pricing flex, V2 school authoring, errata, partial-entitlement bundles, school_teacher composing rights. Migration cycle revised 6 → 8–9 engineer-weeks.
- **v0.1 — 2026-05-25** — Initial draft. Establishes Institution data model (`Institution`, `SchoolEnrollment`, `SchoolStaff` + enum / field additions), `school_admin` role with scoped RBAC, two-flow onboarding (Airbotix-driven V1, family-initiated V2), Google Workspace SSO with PIN fallback for kids, `/school/*` route group inside teacher-console (D-INST1), hybrid family-wallet + institution-pool Stars model with end-of-year reclaim (D-INST3), data-controller delegation under DPA (compliance C16–C18), V1 / V2 phasing tied to first signed contract.
