# Teacher Employment & Payroll — PRD

> **Status**: Draft v0.1 · 2026-05-25
> **Scope**: Casual / contractor teacher lifecycle (recruit → verify → contract → pay → offboard), Working with Children Check (WWCC) evidence + expiry tracking, ABN/TFN capture, hourly-rate config, class-by-class payroll, Airwallex Beneficiary payouts, performance / compliance documentation
> **Author**: Airbotix engineering + ops + finance
> **Depends on**: `auth-system-prd.md` (teacher invite + OTP), `teacher-console-prd.md` (teacher profile + class management), `platform-backend-api-spec.md` (extends User + Class models), `audit-event-schema-prd.md`, `institution-prd.md` (school_teacher employment differs)
> **Sibling**: `incidents-and-mandatory-reporting-prd.md` (teacher misconduct → incident pipeline), `teacher-console-prd.md` §3 (invite flow this PRD specifies)
> **Compliance frame**: AU Fair Work Act, AU casual employment definition (Fair Work Amendment 2021), state WWCC statutes (NSW Child Protection Workers Check Act, VIC WWCC Act 2005, etc.), ATO TFN/ABN obligations, AU Privacy Act on employee records

---

## 1. Purpose

`BP.md` commits to a contractor-led delivery model — "we use casual/contractor teachers, paid per session, scaling roster as enrolment grows". This is operationally vague today: there's a `teacher` role, an invite endpoint, a profile page. **What's missing is everything that turns a person into a payable, compliant, scheduled, performance-tracked contractor**.

Without this PRD:

1. Ops can't onboard a 10th teacher without spreadsheets
2. Finance can't run end-of-month payroll automatically
3. Legal can't show evidence of WWCC compliance to a school auditor
4. We can't fulfil B2B school contracts that require attestation of teacher qualifications

This PRD specifies the **employment data model, lifecycle, surfaces, payroll math, and compliance evidence**. It is **not** the teacher-console UX deep-dive — that's `teacher-console-prd.md`. It is the layer that backs that UX.

### 1.1 Non-goals (V0/V1)

- Full HRIS (use this PRD's surfaces as the system of record for contractor data; if we hire FT staff, layer Employment Hero / Deputy on top — V2+)
- Time-tracking via timesheets the contractor enters freely (V1: time = scheduled-class-confirmed-delivered, computed not entered)
- Teacher performance LLM-generated narratives — V2+
- Cross-currency payroll for non-AU contractors — V2+ (V1 = AUD only)
- Equity / RSU tracking — never (we don't grant equity to contractors)

---

## 2. Employment model

V0/V1 = **casual independent contractors with ABN**, paid per class delivered. Future shapes (employees, retainers, partnership-based teachers) deferred.

| Attribute | V1 default | Configurable per-teacher? |
|---|---|---|
| Engagement type | Independent contractor (with ABN) | ✓ — `casual_no_abn` allowed in edge cases, subject to PAYG withholding |
| Pay shape | Per-class hourly rate × delivered class hours | ✓ rate per teacher tier |
| Payment cadence | Monthly, on the 5th business day of next month | ✗ fixed |
| Currency | AUD | ✗ V1 |
| Tax handling | Contractor self-manages; we record ABN + GST status; we generate Recipient-Created Tax Invoice (RCTI) when teacher opts in | — |
| Superannuation | 12% paid to contractor's nominated fund IF contractor is treated as employee per ATO contractor-vs-employee test (some are) | per-teacher flag |

Schools' own teachers (`school_teacher` role from `institution-prd.md`) are **NOT in Airbotix payroll** — they're paid by their employing school. We track them for compliance / scheduling / WWCC but the payroll flow short-circuits at `payroll_managed_by=institution`.

---

## 3. Decision records

| ID | Decision | Rationale |
|---|---|---|
| **D-EMP1** | Pay = (scheduled class duration × hourly rate) × delivery confirmation status. We do **not** trust contractor-entered "I worked from 14:00–16:30" timesheets. | Casual industry has high disputes around hours. Pay anchored to deliverable (class delivered = paid) is auditable and uncontroversial. |
| **D-EMP2** | WWCC verification is a **hard block** on class assignment. A teacher whose WWCC is missing, expired, or invalid cannot be assigned to a class. Expiry warnings start at T-90 days. | Compliance — single line item in any school audit. |
| **D-EMP3** | Payroll runs are **batch + approved**, never auto-disbursed. Finance reviews the monthly batch, signs off, then triggers Airwallex disbursement. | Liability + dispute window. |
| **D-EMP4** | Teacher rates / contract terms are **append-only history** — we never overwrite a rate, we add a new `RateHistory` row with effective_at date. | For backpay disputes and rate-change audit. |
| **D-EMP5** | RCTI (Recipient-Created Tax Invoice) generation is **opt-in per teacher** at onboarding. Default = teacher invoices us. | RCTI agreements have specific ATO requirements; not every contractor wants them. |

---

## 4. Data model

Additions to existing `User` for teachers; new dedicated tables for employment artefacts.

### 4.1 `User` additive fields (teachers only — null on non-teacher rows)

| Field | Type | Notes |
|---|---|---|
| `legal_name` | `String?` | Full legal name (separate from `display_name`) |
| `dob` | `Date?` | Required for WWCC verification |
| `tier` | `enum TeacherTier?` | `lead` / `senior` / `standard` / `trainee` — drives default hourly rate |
| `engagement_type` | `enum EngagementType?` | `contractor_with_abn` / `casual_no_abn` / `school_employed` |
| `payroll_managed_by` | `enum PayrollManager?` | `airbotix` (we pay them) / `institution` (school pays them; we don't) |
| `abn` | `String?` | 11-digit AU Business Number |
| `gst_registered` | `Boolean?` | If true, RCTI lines include GST |
| `tfn_hashed` | `String?` | One-way hash; raw never stored (`bcrypt` 12 rounds) |
| `rcti_consent_at` | `DateTime?` | Set if teacher signed RCTI agreement |
| `payee_email` | `String?` | Defaults to login email; can override |
| `is_active_for_assignment` | `Boolean @default(false)` | Derived: WWCC valid + contract signed + bank details on file |

### 4.2 New table — `TeacherProfileExtended`

For richer pedagogical metadata kept separate from auth-critical `User`:

```prisma
model TeacherProfileExtended {
  id                String          @id @default(cuid())
  user_id           String          @unique
  bio               String?
  spoken_languages  String[]        // ISO-639-2 codes
  expertise_topics  String[]        // matches Mission.topic taxonomy
  age_range_min     Int?            // youngest kid age comfortable teaching
  age_range_max     Int?
  delivery_modes    DeliveryMode[]  // weekly / holiday_intensive / school_partnership / workshop
  qualifications    Json            @default("[]") // [{name, issuer, year, evidence_s3_key}]
  intro_video_s3_key String?
  hero_image_s3_key  String?
  metadata          Json            @default("{}")
  updated_at        DateTime        @updatedAt

  user              User            @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

### 4.3 New table — `WwccRecord`

```prisma
model WwccRecord {
  id                String          @id @default(cuid())
  user_id           String
  state             String          // 'NSW' / 'VIC' / 'QLD' / 'WA' / 'SA' / 'TAS' / 'NT' / 'ACT'
  wwcc_number       String          // state-issued check number
  issued_at         DateTime
  expires_at        DateTime
  verified_at       DateTime?       // null until ops staff verifies
  verified_by       String?         // admin user_id
  verification_method String?       // 'direct_check_portal' | 'document_review'
  evidence_s3_key   String?         // scanned card / portal screenshot
  status            WwccStatus

  user              User            @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([expires_at])
}

enum WwccStatus {
  pending_verification
  active
  expiring_soon      // computed view, T-90 to T-0
  expired
  revoked            // teacher's WWCC was withdrawn (notified by state register)
}
```

Per D-EMP2, `User.is_active_for_assignment` derives from `EXISTS(WwccRecord status=active AND expires_at > now())` for the states where the teacher operates.

### 4.4 New table — `TeacherRateHistory` (append-only per D-EMP4)

```prisma
model TeacherRateHistory {
  id                String          @id @default(cuid())
  user_id           String
  hourly_rate_aud   Decimal         @db.Decimal(8,2)
  effective_at      DateTime
  set_by_admin_id   String
  reason            String?
  created_at        DateTime        @default(now())

  user              User            @relation(fields: [user_id], references: [id])

  @@index([user_id, effective_at])
}
```

### 4.5 New table — `ClassDelivery`

Maps to a delivered (or no-show / cancelled) class instance for payroll. One row per actual scheduled occurrence — recurring classes generate one `ClassDelivery` per occurrence.

```prisma
model ClassDelivery {
  id                  String                  @id @default(cuid())
  class_id            String
  teacher_id          String
  scheduled_starts_at DateTime
  scheduled_ends_at   DateTime
  delivery_status     DeliveryStatus
  actual_starts_at    DateTime?               // recorded when teacher hits "Start class"
  actual_ends_at      DateTime?               // recorded at "End class"
  confirmed_by_admin_id String?               // ops sign-off for ambiguous cases
  payable_minutes     Int?                    // resolved per rules in §6
  payroll_run_id      String?                 // null until included in a batch
  notes               String?
  created_at          DateTime                @default(now())

  class               Class                   @relation(fields: [class_id], references: [id])
  teacher             User                    @relation(fields: [teacher_id], references: [id])
  payroll_run         PayrollRun?             @relation(fields: [payroll_run_id], references: [id])

  @@index([teacher_id, scheduled_starts_at])
  @@index([payroll_run_id])
}

enum DeliveryStatus {
  scheduled
  delivered          // teacher and kids attended
  no_show_teacher    // teacher didn't show — class cancelled
  no_show_kids       // teacher attended, no kids — payable per §6
  cancelled_by_admin // pre-class admin cancel
  cancelled_late     // < 24h notice — partial payable per §6
  delivered_disputed // delivered but flagged by ops
}
```

### 4.6 New table — `PayrollRun`

```prisma
model PayrollRun {
  id                  String              @id @default(cuid())
  period_start        DateTime
  period_end          DateTime
  status              PayrollRunStatus
  prepared_by         String              // admin user_id
  approved_by         String?             // finance admin user_id (separate person from preparer per §7)
  disbursed_at        DateTime?           // airwallex batch confirmed
  total_aud           Decimal             @db.Decimal(12,2)
  teacher_count       Int
  metadata            Json                @default("{}") // run-level notes, dispute summary
  created_at          DateTime            @default(now())

  deliveries          ClassDelivery[]
  line_items          PayrollLineItem[]

  @@index([period_end, status])
}

enum PayrollRunStatus {
  draft
  in_review
  approved
  disbursing
  disbursed
  partial_failed      // some line items failed at Airwallex — manual retry
}

model PayrollLineItem {
  id                  String              @id @default(cuid())
  payroll_run_id      String
  teacher_id          String
  gross_aud           Decimal             @db.Decimal(10,2)
  super_aud           Decimal             @db.Decimal(10,2) @default(0)
  withholding_aud     Decimal             @db.Decimal(10,2) @default(0) // PAYG for casual_no_abn
  net_aud             Decimal             @db.Decimal(10,2)
  delivery_count      Int
  payment_method      String              // 'airwallex_bank' / 'manual'
  payment_ref         String?             // Airwallex disbursement id
  status              PayrollLineItemStatus
  payee_email_snapshot String             // captured at run-prep, not live-fetched (audit)
  bsb_last4_snapshot   String?
  rcti_pdf_s3_key      String?            // generated if teacher has RCTI consent
  invoice_pdf_s3_key   String?            // attached by teacher otherwise

  payroll_run         PayrollRun          @relation(fields: [payroll_run_id], references: [id])
  teacher             User                @relation(fields: [teacher_id], references: [id])

  @@unique([payroll_run_id, teacher_id])
}

enum PayrollLineItemStatus {
  draft
  approved
  disbursing
  paid
  failed
  reissued
}
```

### 4.7 `BankAccount` (separate from payment-method for kids; this is for outbound payroll)

```prisma
model TeacherBankAccount {
  id              String          @id @default(cuid())
  user_id         String          @unique
  bsb             String          // AU bank routing — stored cleartext (low-sensitivity)
  account_number_hashed String    // hash; raw stored encrypted in vault, not DB
  airwallex_beneficiary_id String?
  verified_at     DateTime?
  created_at      DateTime        @default(now())
  updated_at      DateTime        @updatedAt

  user            User            @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

---

## 5. Lifecycle

### 5.1 Onboarding flow

```
1. Admin "Invite teacher" → form: name, email, tier, engagement_type, payroll_managed_by
2. System creates User row (role=teacher), TeacherProfileExtended, InviteToken
3. Email → teacher accepts → /auth/accept-invite → OTP enrolment
4. /onboarding/teacher wizard (in teacher-console):
   a. Personal: legal_name, dob, country, state-of-operation
   b. Compliance: WWCC upload (number + scan + state) → status=pending_verification
   c. Tax: ABN (lookup against ATO ABN registry), GST status, optional TFN if no ABN
   d. Banking: BSB + account number → Airwallex Beneficiary create call
   e. RCTI consent (optional checkbox)
   f. Profile: bio, languages, expertise, intro video upload
   g. Rate: shown read-only (admin-set; can request change later)
5. WWCC review queue → ops admin verifies → WwccRecord.status=active
6. Contract: PDF generated from teacher's data + Airbotix terms; admin and teacher e-sign
7. is_active_for_assignment computed; teacher receives "you can now be assigned to classes" email
```

### 5.2 Operating loop

| Event | Outcome |
|---|---|
| Teacher views own profile | `/profile/teacher` page |
| Teacher updates bank | Goes back through Airwallex Beneficiary update + admin verify |
| Teacher uploads new WWCC (renewal) | New WwccRecord; old superseded |
| Admin changes rate | New TeacherRateHistory row (D-EMP4) |
| Teacher delivers class | `ClassDelivery.delivery_status=delivered`, `actual_*_at` captured |
| Teacher no-show | Admin flags; affects performance score (§8) |
| Month-end | System auto-creates `PayrollRun` in `draft` |

### 5.3 Offboarding

- Admin clicks "Offboard": pending classes reassigned; teacher's `is_active_for_assignment=false`, `User.deactivated_at=now`
- Outstanding deliveries roll into final payroll run
- WWCC + tax records retained 7 years per ATO + Privacy Act employee-records exemption
- Account access revoked after 30-day grace (login blocked but PII not erased)

---

## 6. Payroll math — `ClassDelivery` → `PayrollLineItem`

Per D-EMP1, pay = delivery × rate. The mapping:

```
payable_minutes calculation:
  delivered                    → scheduled duration (cap at 1.5× scheduled in case of overrun)
  no_show_kids                 → scheduled duration × 0.5  (we paid the teacher's reservation; we want them to keep showing up)
  cancelled_late (< 24h)       → scheduled duration × 0.5  (compensate booking)
  cancelled_by_admin (>= 24h)  → 0
  no_show_teacher              → 0  (no-pay)
  delivered_disputed           → resolved manually; ops fills payable_minutes
```

```
gross_aud = (payable_minutes / 60) × hourly_rate_aud
            (hourly_rate looked up via TeacherRateHistory at delivery.scheduled_starts_at, NOT at run prep)

super_aud  = if engagement_type='contractor_with_abn' AND treated_as_employee=false → 0
             else                                                                     gross × 0.12

withholding_aud = if engagement_type='casual_no_abn' → gross × 0.47 (no-TFN rate)
                  else if engagement_type='casual_no_abn' AND tfn_provided → gross × tax_table(gross)
                  else                                                       0

net_aud    = gross + super_aud (if paid as part of net) − withholding_aud
```

Edge cases:
- A teacher with multiple class-tier qualifications (lead vs standard) on different classes → rate is per-class delivery, not per-teacher; `Class.delivery_rate_override_aud` allows this. Default = teacher's tier rate.
- Multi-state WWCC and delivery in a different state than usual — payroll-neutral; compliance check uses WwccRecord matching state.

---

## 7. Approval & disbursement (D-EMP3)

```
Day-1 of month: cron creates PayrollRun(draft) for previous month
Days 1-3: ops admin reviews — closes disputes, attaches RCTI / invoices
Day 4: ops admin moves run to in_review, finance admin notified
Days 4-5: finance admin (separate person) reviews each line, signs off → status=approved
Day 5 PM: system disburses via Airwallex batch → status=disbursing
T+1h: Airwallex confirms → status=disbursed; emails to teachers
```

Approval gates:
- A single admin can both prepare AND approve only if `SystemConfig.payroll_solo_approval=true` (default false). For solo-founder ops, allow with super_admin step-up.
- Disbursement uses Airwallex Batch Beneficiary Pay API
- Failed line items → status=partial_failed; manual retry per item with note

---

## 8. Performance & rating

Not for terminating contractors casually (Fair Work casual rules), but for:

- Class reassignment decisions
- Rate review (next-tier promotion)
- Internal CS coordination

Tracked per teacher:
- Delivery rate (delivered / scheduled, rolling 90d)
- Kid completion rate (their classes' avg completion %)
- Parent satisfaction (V1.5+ from in-portal mini-survey)
- Incidents involving them as teacher (count + severity from `incidents-prd`)
- Late-arrival rate (actual_starts_at vs scheduled_starts_at)

Surface: `/admin/teachers/:id/performance` (admin only). Teacher can see their own delivery + rating (not other teachers').

V0 explicitly does NOT compute a single composite "score" — too easy to game / unfair. Multiple raw metrics.

---

## 9. Surface map

| Surface | Audience | Key pages |
|---|---|---|
| `teacher-console/onboarding/*` | New teacher | 7-step wizard per §5.1 |
| `teacher-console/profile` | Teacher (self) | View / edit (limited fields), request rate review, upload new WWCC |
| `teacher-console/payslips` | Teacher (self) | List of past PayrollLineItems with PDF download |
| `teacher-console/deliveries` | Teacher (self) | Their delivery log with payable_minutes per row |
| `teacher-console/admin/teachers` | Airbotix admin | Roster, search, status, bulk actions |
| `teacher-console/admin/teachers/:id` | Airbotix admin | Full profile, edit, manage rate, view performance |
| `teacher-console/admin/wwcc-queue` | Compliance admin | Verification queue |
| `teacher-console/admin/payroll` | Ops + finance admin | Run list, run detail, line-item review, approve, disburse |
| `teacher-console/admin/payroll/:id` | Ops + finance admin | Per-run detail, line items, anomalies, disbursement status |

(All exist as new pages — `teacher-console-prd.md` v0.1 has none of these specified.)

---

## 10. Endpoints (additions to `platform-backend-api-spec.md` §5)

```
POST   /admin/teachers/invite                       admin
GET    /admin/teachers                              admin
PATCH  /admin/teachers/:id                          admin
POST   /admin/teachers/:id/rate                     admin (creates RateHistory row)
POST   /admin/teachers/:id/wwcc                     admin (uploads / verifies)
POST   /admin/teachers/:id/offboard                 admin

GET    /me/teacher-profile                          teacher
PATCH  /me/teacher-profile                          teacher (whitelist)
POST   /me/teacher-profile/wwcc                     teacher (upload new evidence)
POST   /me/teacher-profile/bank                     teacher (initiate beneficiary)
GET    /me/payslips                                 teacher
GET    /me/payslips/:id                             teacher
GET    /me/deliveries                               teacher

GET    /admin/payroll/runs                          admin
POST   /admin/payroll/runs/:id/prepare              admin (assemble line items)
PATCH  /admin/payroll/runs/:id/move-to-review       admin
POST   /admin/payroll/runs/:id/approve              finance_admin (sub-role of admin per §11)
POST   /admin/payroll/runs/:id/disburse             finance_admin + super_admin co-sign optional V1+
POST   /admin/payroll/runs/:id/line-items/:lid/retry finance_admin

POST   /admin/class-deliveries/:id/mark             admin (set delivery_status + payable_minutes)
GET    /admin/class-deliveries?teacher_id=&period=  admin
```

---

## 11. Sub-roles within `admin`

V1 adds two sub-flags on `User` for admins (no new top-level role):
- `admin_is_ops` — can prepare payroll, manage teachers, verify WWCC
- `admin_is_finance` — can approve + disburse payroll runs

Defaults: founders get both; new admin invites default to ops-only until super_admin promotes.

(Alternative considered: separate `finance_admin` role — rejected for V1 because the team is too small to justify a 4th admin tier. Sub-flag pattern is reversible.)

---

## 12. Compliance evidence package

For school audits and Fair Work checks, ops can export a per-teacher PDF bundle containing:
- Identity confirmation (legal_name + dob + redacted ID)
- Active WWCC (number + state + expiry)
- Contract PDF
- Last 6 months payslips
- Performance summary (no opinionated narrative)
- Incident history (with the teacher as subject)

Export endpoint: `POST /admin/teachers/:id/compliance-bundle` → background job → S3 zip → signed URL 24h. Audited.

---

## 13. Open questions

| Q | Item | Resolution path |
|---|---|---|
| Q1 | If contractor is treated-as-employee per ATO test, super becomes mandatory. Who flags this? | V1 manual: admin sets `treat_as_employee=true` after consulting accountant. V2: surface a self-assessment tool. |
| Q2 | Should we offer Single Touch Payroll (STP) Phase 2 reporting via a payroll API integration? | V1: no (we're contractor-only, contractors handle their own STP via personal ABN). Re-evaluate if we hire FT. |
| Q3 | How do we handle a teacher who fails their WWCC verification during a running engagement? | V1: immediate is_active_for_assignment=false; classes reassigned within 24h; status notified; case logged as compliance_complaint incident. |
| Q4 | Casual loading (25% per Fair Work) — do contractors get it? | Only if we mis-classify a contractor as casual employee (it's a casual-employee right, not a contractor right). Currently no. |
| Q5 | Multi-state operations — a teacher resides in NSW but delivers school_partnership class in VIC. WWCC must be valid in both? | V1: yes (state-by-state); WwccRecord per state. Bundle compliance evidence shows both. |
| Q6 | Should teacher payslips be visible to school_admin when the teacher delivers a school class? | V1: NO. School_admin sees scheduled deliveries + actual delivery status, never payslip amount. Different employment relationship. |
| Q7 | What does the teacher see if their rate is reduced? | V1: notification + 14-day notice; rate change effective_at >= today + 14 days. Append-only history retained. |

---

## 14. Success criteria (V1 ship)

- Admin can onboard a new teacher end-to-end (invite → wizard → WWCC verify → contract → bank verify → activate) in < 60 minutes of admin time
- WWCC expiry blocks class assignment automatically (verified by integration test)
- Monthly payroll runs prepare on day-1 of the month with zero manual work for >=80% of teachers (only disputes need touching)
- Two-person approval gate (D-EMP3) enforced — single admin cannot disburse a run (unless config explicitly allows + step-up)
- Rate history is append-only — verified by Prisma extension test
- Compliance bundle exports pass a mock school-audit checklist

---

## 15. Cross-PRD updates required when this ships

- `teacher-console-prd.md` §3 → invite + onboarding aligned to §5.1
- `teacher-console-prd.md` §4 → add Profile, Payslips, Deliveries, Admin Teachers, Admin WWCC Queue, Admin Payroll pages
- `auth-system-prd.md` §6 → teacher onboarding wizard mounted post-OTP
- `platform-backend-api-spec.md` §5 → add §11 endpoints
- `super-admin-prd.md` §4 → admin sub-flags (ops/finance) noted
- `institution-prd.md` §4.3 → school_teacher with `payroll_managed_by=institution` short-circuits payroll
- `audit-event-schema-prd.md` → add event kinds: teacher.invited, teacher.wwcc_verified, payroll.run_prepared, payroll.run_approved, payroll.run_disbursed, rate.changed
- `docs/product/compliance/minors-compliance.md` → add C19 WWCC enforcement, C20 employment-record retention

---

## 16. References

- AU Fair Work Act 2009, esp. Part 2-2 Division 4A (Casual employment)
- ATO Contractor vs Employee decision tool
- AU State WWCC statutes (per state)
- ATO Recipient-Created Tax Invoices (GSTR 2000/10)
- Airwallex Batch Beneficiary Pay API
- `auth-system-prd.md` §6 (Invite flow)
- `incidents-and-mandatory-reporting-prd.md` (teacher-as-subject pipeline)
- `institution-prd.md` §4 (school_teacher employment carve-out)

---

## Revision history

- **v0.1 — 2026-05-25** — Initial draft. Contractor-led employment model (D-EMP1 delivery-anchored pay), 5 decisions, additive `User` fields + 6 new tables (`TeacherProfileExtended`, `WwccRecord`, `TeacherRateHistory`, `ClassDelivery`, `PayrollRun`, `PayrollLineItem`, `TeacherBankAccount`), 7-step onboarding wizard, WWCC hard-block (D-EMP2), two-person payroll approval (D-EMP3), append-only rate history (D-EMP4), RCTI opt-in (D-EMP5), Airwallex Beneficiary disbursement, compliance bundle export, admin sub-flags (ops/finance), 7 open questions tagged for finance/legal review.
