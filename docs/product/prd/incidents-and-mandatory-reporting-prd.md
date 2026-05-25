# Incidents & Mandatory Reporting — Cross-Surface PRD

> **Status**: Draft v0.1 · 2026-05-25
> **Scope**: End-to-end incident workflow from observation (teacher / kid / parent / system) → triage (admin) → resolution and, where statute requires, **mandatory reporting** to external authorities (AU eSafety Commissioner, state child-safety departments, NSW Police, etc.)
> **Author**: Airbotix engineering + compliance
> **Depends on**: `audit-event-schema-prd.md` (audit envelope), `auth-system-prd.md` (step-up on legally privileged actions), `platform-backend-api-spec.md` (Incident model + endpoints), `docs/product/compliance/minors-compliance.md` C13 + C14
> **Sibling**: `teacher-console-prd.md` §4.13 (admin incidents page), `super-admin-prd.md` §5.7.5 (safety analytics), `airbotix-app-learn-prd.md` (kid-side panic flow), `parent-portal-prd.md` (parent-side notification + override), `class-wall-moderation-prd.md` (Wall UGC reports)
> **Compliance frame**: AU Privacy Act 1988, Notifiable Data Breaches (NDB) scheme, Online Safety Act 2021, state-by-state child-protection statute (NSW Children & Young Persons Act, VIC Children Wellbeing & Safety Act, etc.)

---

## 1. Purpose

Today the platform has an `Incident` Prisma model + `IncidentsService` + an admin-side incident feed in `teacher-console`. **What's missing is the contract for the rest of the loop**: who triggers, who triages, who escalates to a human authority, what gets recorded, and **what must be reported to whom by law**. Without this PRD:

1. Teachers don't know what to do when a kid types a self-harm disclosure in chat
2. Admins don't have a runbook for distinguishing "moderation reject" from "statutory reportable incident"
3. Compliance team can't prove to the eSafety Commissioner that we have an end-to-end response procedure
4. The Notifiable Data Breaches scheme has hard 72-hour clocks that we currently have no system for

This PRD specifies that loop **end-to-end across all surfaces**, plus the data-model and notification primitives the loop relies on.

### 1.1 Non-goals

- Replacing external case-management systems used by counsellors / DPOs (handoff, don't duplicate)
- Real-time content moderation (handled by DeepRouter + topic-policy at session time — see `airbotix-app-learn-prd.md`)
- Threat-intel / fraud detection on adult accounts (out of scope — separate `security-incidents-prd.md` candidate, V2+)
- Generic customer-support ticketing (use Linear / external)

---

## 2. Incident taxonomy

Existing Prisma `IncidentKind` enum is reused and extended. Every incident gets exactly one kind; sub-tags via `Incident.metadata.tags[]`.

| Kind | Source | Statutory implication |
|---|---|---|
| `moderation_reject` | Auto — DeepRouter or topic-policy filter | None per se; aggregates feed §7.1 thresholds |
| `safety_disclosure` | Kid utterance flagged by safety classifier OR manual teacher escalation | **Mandatory reporting trigger** if disclosure indicates risk of harm |
| `harassment` | Wall UGC report + teacher confirmation | May trigger eSafety reporting under Online Safety Act if cyberbullying confirmed |
| `account_compromise` | Auth signals (revoked-refresh trip-wire, IP anomaly), or parent report | NDB clock starts if any kid data accessed by attacker |
| `data_breach` | System-detected unauthorised access OR security research disclosure | **NDB scheme**: 72-hour assessment + 30-day notification |
| `payment_dispute` | Airwallex chargeback / dispute webhook | Operational, not statutory |
| `content_quality` | Teacher or parent reports content error / age-inappropriate | Operational |
| `compliance_complaint` | Parent / school formal complaint about platform conduct | May trigger OAIC notification if Privacy breach claimed |
| `system_outage` | Detected by health probe; tracked here for postmortem linkage | Not in this PRD's primary flow but reuses Incident envelope |

### 2.1 Severity

`IncidentSeverity` enum (existing): `low` / `medium` / `high` / `critical`. **`critical` triggers immediate page** to the on-call admin + super_admin via PagerDuty (V0: email + Slack webhook). Severity is auto-assigned at creation by kind × confidence; admin can override during triage.

### 2.2 Reportable flag

New field `Incident.is_reportable Boolean @default(false)` — gates the §6 reporting workflow. Set true only by admin during triage, after applying the §6.1 decision tree. Setting `is_reportable=true` requires step-up TOTP (D-INC1) — see §3.

---

## 3. Decision records

| ID | Decision | Rationale |
|---|---|---|
| **D-INC1** | Marking an Incident `is_reportable=true` requires `<StepUpGate>` (fresh TOTP within 5 min) and a freeform `reason` ≥ 50 chars | Once marked, downstream notifications fire to legal counsel + start statutory clocks. Cannot be undone silently — only super_admin can revert, also step-up gated. |
| **D-INC2** | Mandatory-reporting submissions to external authorities are **prepared inside the platform** (forms pre-filled, evidence bundle generated, audit-signed) but **submitted outside the platform** by a named human officer (the Designated Officer per Privacy Act). The platform never auto-files reports. | Liability: a human must sign legal disclosures. Platform is the evidence + workflow tool, not the agent of submission. |
| **D-INC3** | Kid-side panic-escalate ("I need help") is a one-button surface in `/learn/*`, never gated behind LLM moderation, never charges Stars, never logs to LLM transcript with parent visibility (privacy: kid's first disclosure is not for parents to read unless DO authorises) | First-disclosure privacy is essential to safe-disclosure design (per AU Mandatory Notifiers Handbook). |
| **D-INC4** | Notifiable Data Breach 72-hour assessment clock starts at `account_compromise` or `data_breach` creation, **not** at confirmation. Platform shows countdown to all super_admins. | NDB scheme requires "as soon as practicable" assessment; we choose conservative reading. |
| **D-INC5** | Incident records are **immutable** post-creation — every state change is an append-only `IncidentEvent` row referencing the parent Incident. No UPDATE on `Incident.status` directly. | Audit integrity for legal evidence. Mirrors `audit-event-schema-prd.md` immutability. |

---

## 4. Data model

### 4.1 Existing `Incident` (already in Prisma) — fields used

```
Incident {
  id, kind (IncidentKind), severity (IncidentSeverity),
  family_id?, kid_id?, class_id?, teacher_id?,
  status: open | triaged | resolved | escalated,
  metadata Json,
  created_at, resolved_at?, deleted_at?
}
```

### 4.2 Additive fields

| Field | Type | Purpose |
|---|---|---|
| `is_reportable` | `Boolean @default(false)` | Gates §6 reporting workflow |
| `report_status` | `enum ReportStatus?` | `null` until reportable; then `pending_designated_officer` → `evidence_assembled` → `submitted_external` → `closed` |
| `assigned_admin_id` | `String?` | Admin currently triaging — only one at a time |
| `designated_officer_id` | `String?` | Named statutory officer for reportable cases |
| `external_authority` | `String?` | Which authority received the report (`esafety` / `nsw_police` / `oaic` / `dcj_nsw` / etc.) |
| `external_reference` | `String?` | Their case number once filed externally |
| `evidence_bundle_s3_key` | `String?` | S3 key of zipped evidence (transcripts, audit logs, screenshots) — signed-URL access only |
| `institution_id` | `String? @index` | Institution scope (per institution-prd) |
| `ndb_clock_started_at` | `DateTime?` | NDB 72-h countdown anchor for `data_breach` / `account_compromise` kinds |
| `confidentiality` | `enum IncidentConfidentiality @default(standard)` | `standard` / `safeguarding_restricted` (only DO + 2 super_admins can read) |

### 4.3 New table — `IncidentEvent`

Append-only state log per D-INC5:

```prisma
model IncidentEvent {
  id            String           @id @default(cuid())
  incident_id   String
  event_kind    IncidentEventKind
  actor_id      String?           // null for system events
  actor_role    String?
  payload       Json              // type-discriminated; see §4.4
  note          String?           // human note attached to event
  created_at    DateTime          @default(now())

  incident      Incident          @relation(fields: [incident_id], references: [id], onDelete: Restrict)

  @@index([incident_id, created_at])
}

enum IncidentEventKind {
  created
  assigned
  reassigned
  status_changed
  severity_changed
  marked_reportable
  designated_officer_assigned
  evidence_added
  evidence_finalised
  external_submitted
  external_reference_recorded
  parent_notified
  school_notified
  internal_note
  reopened
  resolved
  redacted          // by super_admin only, with high-bar reason
}
```

### 4.4 Evidence bundle structure (S3)

A zip at `s3://airbotix-incidents-{region}/{incident_id}/{utc_iso}.zip` containing:

- `incident.json` — full incident record + event log (hashed line-by-line so tampering is detectable)
- `audit-window.json` — AuditEvents from T-30min to T+2h around incident time, scoped to involved family/kid/class
- `messages/` — LearningSession transcript excerpts (only the involved kid; redacted of co-kids' content)
- `screenshots/` — admin-uploaded screenshots
- `notes/` — admin / DO notes (immutable, appended only)
- `manifest.json` — SHA-256 of every file + signing super_admin + timestamp

Encrypted at rest (S3 SSE-KMS, regional CMK). Read access requires `super_admin` or `designated_officer` role and emits AuditEvent.

---

## 5. End-to-end workflow

The same Incident moves through up to five surfaces depending on kind + severity. The default flow:

```
┌─────────────┐    ┌───────────┐    ┌────────────┐    ┌───────────────────┐
│  Observation │──▶│  Triage   │──▶│  Action     │──▶│  Resolution / Close│
│  (any user)  │   │  (admin)  │   │  (varies)   │   │  (admin + DO)      │
└─────────────┘    └───────────┘    └────────────┘    └───────────────────┘
                          │
                          ▼  if reportable
                   ┌─────────────────────┐
                   │  External reporting │
                   │  (DO outside system)│
                   └─────────────────────┘
```

### 5.1 Observation surfaces (POST `/incidents` or system-triggered)

| Trigger | Surface | Auto-fields |
|---|---|---|
| Kid panics in `/learn/*` ("I need help" button) | airbotix-app/learn | kind=`safety_disclosure`, severity=`high`, confidentiality=`safeguarding_restricted`, kid_id, class_id, transcript T-10min snapshot |
| Teacher clicks "Escalate" on a live class card | teacher-console `/live` | kind picked by teacher (`safety_disclosure` / `harassment` / `content_quality`), teacher_id, kid_id, class_id |
| Wall UGC report received | `/learn/wall` report button → backend (see `class-wall-moderation-prd.md`) | kind=`harassment`, kid_id (reporter), target_kid_id (reported), class_id |
| Parent reports issue | parent-portal `/portal/support` | kind by parent select, family_id |
| Auth trip-wire fires (refresh-token reuse) | system | kind=`account_compromise`, severity=`high`, ndb_clock_started_at=now |
| Health monitor → 5xx spike | system | kind=`system_outage`, severity=`medium` |
| Topic-policy hard reject N≥3 in 10 min on one kid | system | kind=`moderation_reject`, severity=`low`, **aggregated** (1 incident covers the burst) |
| Airwallex chargeback webhook | system | kind=`payment_dispute`, family_id |
| Compliance complaint email parsed by Zapier (V1+) | system | kind=`compliance_complaint`, severity=`medium`, manual fields |

All paths POST to `/incidents` with role-appropriate scope. Backend validates that kid_id / family_id / class_id are within actor's scope (or actor is admin+).

### 5.2 Triage (admin in teacher-console `/admin/incidents`)

PagerDuty fires on `severity ∈ {high, critical}`. Admin opens the incident, sees:

- Auto-extracted context: who, when, last 10 min of session transcript, relevant audit events, parent contact info, kid age + topic limits, family wallet state
- Suggested classification: ML-derived likelihood per `IncidentKind` (V1+; V0 is keyword + heuristic)
- Decision tree (UI prompt — see §6.1) to determine `is_reportable`
- Actions: assign self, change severity, add note, request evidence, mark reportable

Triage SLAs (V0 commitment, surfaced in dashboard):
- `critical` — acknowledge < 15 min, first action < 1 hr
- `high` — acknowledge < 1 hr, first action < 4 hr
- `medium` — first action < 24 hr
- `low` — best-effort

### 5.3 Action paths by kind

- **`safety_disclosure`** → admin opens "Care path" template: contact parent + (if school) school_admin + (if reportable) Designated Officer. Kid's account temp-muted in moderation-sensitive features per parent advice; full lock requires parent consent.
- **`harassment`** → review evidence; quarantine offending Wall posts; teacher-led restorative conversation; if confirmed cyberbullying meeting eSafety Act thresholds → mark reportable
- **`account_compromise`** → force `POST /auth/logout-everywhere`, rotate JWT_SECRET cohort, notify family, start NDB clock if any data accessed
- **`data_breach`** → §7 NDB workflow
- **`moderation_reject`** burst → review burst pattern, decide if topic-policy needs adjustment or kid needs different content; rarely escalates
- **`payment_dispute`** → handoff to billing workflow in `parent-portal-prd.md`
- **`compliance_complaint`** → assign DO, route to formal response template

### 5.4 Resolution

`status=resolved` requires:
- Final note (≥ 30 chars)
- If `is_reportable=true`: `report_status ∈ {submitted_external, closed}`
- All parent/school notifications confirmed sent
- Evidence bundle finalised + S3 lifecycle policy applied (7 years for reportable; 1 year for ops)

Resolution emits a `resolved` IncidentEvent + AuditEvent. Reopening (within 30 days) requires admin reason + creates a child Incident linking back via `metadata.reopened_from`.

---

## 6. Mandatory reporting workflow

When triage marks `is_reportable=true`, the loop diverges.

### 6.1 Decision tree (UI-prompted, recorded as `marked_reportable` event payload)

Admin walks through questions. Each branch is logged:

```
Q1: Does the content indicate risk of harm to a child?
  ├─ Yes ──▶ Q2
  └─ No  ──▶ NOT reportable; resolve via standard path
Q2: What jurisdiction is the child in? (from family.region)
  ├─ AU NSW ──▶ DCJ NSW Child Protection Helpline + eSafety
  ├─ AU VIC ──▶ DHHS + eSafety
  ├─ ...
  └─ Outside AU ──▶ super_admin escalation (V1+ international expansion)
Q3: Is the disclosure about ongoing abuse or imminent danger?
  ├─ Yes ──▶ Police path (NSW Police 000 if imminent; non-urgent line otherwise)
  └─ No  ──▶ Statutory child-safety authority only
Q4: Is a personal data breach involved?
  ├─ Yes ──▶ ALSO NDB scheme (see §7)
  └─ No  ──▶ proceed
```

Each yes/no captured into `IncidentEvent.payload.decision_tree`. Wrong answer is later auditable.

### 6.2 Designated Officer assignment

The platform has named Designated Officers (DOs) registered in `SystemConfig.designated_officers[]` (super_admin maintained). On marking reportable, admin picks one DO from the list. DO must be a real human with:

- Australian residency
- WWCC valid (verified file in `SystemConfig.designated_officer_evidence`)
- Trained on mandatory-reporting per state requirements
- Their email / phone is in the config

On assign, DO receives an automated notification with:
- Read-only link to the Incident dashboard
- Pre-filled draft of the relevant external report form (eSafety, DCJ NSW Child Protection portal CRR, etc.)
- Evidence bundle S3 link (signed, 24h TTL)

### 6.3 Evidence assembly

Admin clicks "Assemble evidence". Backend:
1. Generates the zip per §4.4
2. Computes SHA-256 manifest
3. Stores S3 key on Incident
4. Emits `evidence_finalised` event
5. Notifies DO

Re-generation is allowed before submission (creates a new dated zip; old kept for audit). After `external_submitted=true`, evidence bundle is **frozen** — no regeneration. Future patches go into a `supplementary_evidence/` prefix.

### 6.4 External submission (off-platform)

DO uses pre-filled forms + evidence to submit to authority. **Platform doesn't auto-submit** (per D-INC2). DO returns to the platform, clicks "Record external submission":
- External authority dropdown (eSafety / DCJ NSW / VIC DHHS / NSW Police / OAIC / etc.)
- External reference number (case ID)
- Submission timestamp
- Attach acknowledgement PDF (PDF goes into evidence bundle as supplementary)

This emits `external_submitted` + `external_reference_recorded` events.

### 6.5 Notification matrix during reportable flow

| Audience | Channel | When |
|---|---|---|
| Parent | Email + portal notification | Only after admin confirms (some safeguarding scenarios prohibit informing parent — see Q1 §10) |
| School (if school-enrolled) | Email to school_admin | After admin confirms; not before |
| Designated Officer | Email + SMS | At assign |
| Super-admin | In-app + email | At creation (severity ≥ high) AND at marked_reportable |
| Other admins | In-app | At creation; redacted view if `confidentiality=safeguarding_restricted` |
| Kid (the subject) | Nothing direct from system | Communications via parent / DO / counsellor only |
| Other kids in same class | Nothing | Privacy-first |

### 6.6 Confidentiality scoping

`Incident.confidentiality=safeguarding_restricted` (set automatically for `safety_disclosure` of severity ≥ high) reduces visibility to:
- The assigned admin
- The Designated Officer
- 2 nominated super_admins (`SystemConfig.safeguarding_super_admins[]`)
- The platform records cross-admin access attempts as AuditEvent (without revealing content)

Other admins see a redacted row (kind + severity + assigned_admin + status) only.

---

## 7. Notifiable Data Breaches (NDB) workflow

Triggered by `Incident.kind ∈ {data_breach, account_compromise}` when admin confirms personal data accessed.

### 7.1 72-hour assessment clock

`ndb_clock_started_at = Incident.created_at`. Surface a countdown on the Incident page. At T+48h, system pages super-admin if status still un-triaged. At T+72h, NDB obligates a decision: notify or document why not.

### 7.2 Assessment template (Privacy Act § 26WC)

System provides a fillable template:

```
- Date of breach discovery
- Nature of personal information involved (list categories)
- Number of affected individuals (count from query)
- Was access malicious? confidence level?
- Has unauthorised access continued?
- Mitigation actions taken
- Risk of serious harm to individuals (assessment)
- Decision: notify OR document non-notification with reason
```

The "number of affected individuals" pre-fills from a system query (e.g. count of kid_ids touched by the compromised token). Pre-fill is editable but logged.

### 7.3 Notification path

If decision = notify, the platform prepares:
- Per-family email draft (templated, includes incident summary at appropriate granularity)
- OAIC notification draft (their notifiable-data-breach statement template)
- Public statement draft (only if widespread)

DO sends; platform records `external_submitted` + per-family `parent_notified` events.

### 7.4 30-day deadline

After NDB notify decision, 30-day countdown to actually send notifications. System surfaces overdue items in super-admin home dashboard.

---

## 8. Surface-by-surface integration

### 8.1 `airbotix-app/learn` (kid surface)

- New "I need help" button persistent in `/learn/*` shell (top-right, 56px tap target, never animated — calm UX)
- Tap → confirm screen ("Is something wrong? Tell us in a few words.") → POST to `/incidents` with kind=`safety_disclosure`, severity=`high`, confidentiality=`safeguarding_restricted`
- Kid-facing copy: "We'll let your grown-up know you asked for help. You're not in trouble." — no "we'll tell your parents" because that's not always true (DO may delay parent notify per §6.5 Q1)
- After tap, kid lands on a calm interstitial: optional message field (max 200 chars), three quick reasons (`feeling unsafe` / `mean messages` / `something hard happened`), Submit / Cancel
- Submitted incidents pause LLM access until admin reviews ("Your friend Airbo will be back soon" copy)
- No history of "I need help" usage shown to parent in the regular usage view (it's safeguarding-restricted)
- **D-INC3** rationale: kid's first disclosure must reach a trusted adult that isn't necessarily their parent — this is the AU Mandatory Notifiers stance

### 8.2 `teacher-console`

New §4.13a "Incident detail page" (extension of existing §4.13 list):

- Header: incident summary card (kind, severity, status, ages of affected kid(s), assigned admin)
- Tabs:
  - Context: transcript excerpts, audit window, kid topic-limits, family wallet snapshot
  - Decision tree (§6.1) — only enabled for admin role
  - Care path: template per kind, checklist of actions
  - Notifications: who has been notified when, with channel + delivery receipt
  - Evidence bundle: file list + manifest + "Assemble" / "Refresh" buttons; signed-URL download for super_admin only
  - Event log: full `IncidentEvent` history, append-only
- Footer actions: assign self, reassign, change severity, mark reportable (`<StepUpGate>`), resolve, reopen, redact (super_admin only)

Teacher-side surface (§4.13 already exists for "your class") gets:
- Personal incident shortlist on `/classes/:id`: "Active incidents in this class"
- Single-click "Escalate" button on live class card (pre-populates kid + class context)

### 8.3 `parent-portal`

- `/portal/notifications` shows incident notifications scoped to family (never to other families)
- If `Incident.kind=safety_disclosure` and parent_notified event has been emitted, parent sees a respectful, plain-language summary + DO contact details — never raw transcript
- Override path: parent can request to read full transcript via support flow (admin gates; granted only after DO consults)

### 8.4 `super-admin`

- `/admin/system/incidents` (new entry under §5.7.5 of `super-admin-prd.md`) shows all incidents incl. safeguarding-restricted (with permission)
- NDB clock dashboard on `/admin/system` home
- Re-open closed reportable incidents (last-resort capability; emits high-bar AuditEvent)

### 8.5 `airbotix.ai` (marketing / public)

Public-facing safety page at `airbotix.ai/safety` linking to:
- Plain-English explanation of how reports are handled
- Designated Officer contact (named individual, public)
- eSafety / Kids Helpline / 13YARN external resources
- This is a **statutory requirement** under Online Safety Act for any service "primarily for children" — not optional

---

## 9. RBAC summary

| Action | Kid | Parent | Teacher | school_admin | admin | super_admin |
|---|---|---|---|---|---|---|
| POST `/incidents` panic button | ✓ (own) | ✓ (own family) | ✓ (own class) | ✓ (own school) | ✓ | ✓ |
| View own-class incidents (non-restricted) | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| View own-family incidents (non-restricted, redacted) | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Triage / change status | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Mark reportable | ✗ | ✗ | ✗ | ✗ | ✓ + step-up | ✓ + step-up |
| Assemble evidence | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Read full evidence bundle | ✗ | ✗ | ✗ | ✗ | ✗ (only via signed URL on demand) | ✓ |
| Read safeguarding-restricted detail | ✗ | ✗ | ✗ | ✗ | ✓ if assigned | ✓ if in `safeguarding_super_admins` |
| Redact event log | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (high bar) |
| Reopen closed reportable | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (high bar) |

---

## 10. Open questions

| Q | Item | Resolution path |
|---|---|---|
| Q1 | When does parent notification get delayed? AU Mandatory Notifiers state parents should NOT be informed if disclosure suggests in-home abuse. How is this decision made? | V1: explicit "Hold parent notification" toggle on the safety_disclosure triage screen, requires DO concurrence within 24h. Default = notify; conservative on safeguarding. |
| Q2 | What if a teacher escalates an incident they're personally implicated in? | V1: teacher-initiated escalations on classes they own are flagged for admin review with a `self_involved` tag; admin sees it. Long-term: cross-admin assignment auto-rotated. |
| Q3 | Should the platform auto-mute LLM access for kids during a safety_disclosure incident? Pro: protects kid; Con: signals to kid that something's wrong | V0: yes (pause + calm message; better than continuing as normal). Revisit with safeguarding consultant. |
| Q4 | Cross-jurisdiction kids (e.g. family in NSW with grandparent in VIC supervising) — which state's law applies? | V1: use `family.address.state` as primary; allow DO override. |
| Q5 | NDB scheme threshold — "serious harm" is judgement. Do we publish our threshold heuristics, or treat as legal advice? | V1: internal threshold heuristics in `SystemConfig.ndb_thresholds`; super_admin can edit; not published externally. |
| Q6 | If a reportable incident involves a school-enrolled kid, does the school's data-controller relationship change who notifies whom? (per `institution-prd.md` §10) | Compliance review needed; V1 plan: school_admin notified within same window as parent; school's DPO may be additional named DO. |
| Q7 | Retention of evidence bundle for reportable cases — 7 years is current target. Specific state laws may require longer (e.g. NSW Royal Commission cohort = until age 25). | V1: 7 years default + per-state override table in `SystemConfig.evidence_retention`. |

---

## 11. Success criteria (V0 ship — compliance gate)

- Every Incident has an immutable `IncidentEvent` log; no `UPDATE` of `Incident.status` ever happens (verified by Prisma extension test)
- Kid panic button → admin notification round-trip < 60 seconds end-to-end
- Reportable marking requires step-up TOTP (D-INC1) — bypass rejected by integration test
- Evidence bundle SHA-256 manifest verifies after download
- Default safeguarding-restricted scoping enforced — non-assigned admin gets redacted view (verified by E2E test)
- NDB countdown surfaced on super-admin home dashboard within 60s of incident creation
- Public `/safety` page passes legal review for Online Safety Act compliance before V0 launch

---

## 12. Implementation hooks

Backend:
- Extend existing `IncidentsService` with `markReportable()`, `assembleEvidence()`, `recordExternalSubmission()` methods
- Append-only enforcement via Prisma extension hook (`incident:update` denied unless on `assigned_admin_id` allowlist of fields)
- New `EvidenceBundleService` in `src/incidents/evidence/`
- Add `safeguarding_restricted` scope check to `IncidentsAccessGuard`
- New `ndb-clock.cron.ts` (every 5 min) for countdown alerts

Frontend (teacher-console):
- New `<IncidentDetail>` page extending the existing list view
- `<StepUpGate purpose="incident.mark_reportable">` on the reportable toggle
- `<EvidenceBundleViewer>` with signed-URL refresh
- NDB countdown chip component

Frontend (airbotix-app/learn):
- `<PanicButton>` component persistent across `/learn/*` shell
- `<DisclosureFlow>` 3-step modal (situation → reason → submit)
- LLM access pause hook in session context

Frontend (parent-portal):
- New `/portal/notifications/incidents` view (read-only, plain language)
- Override-to-read-transcript request flow (form to admin, audited)

---

## 13. Cross-PRD updates required when this ships

- `teacher-console-prd.md` §4.13 → split into §4.13 (list) + §4.13a (detail page); add §3 invite of `<StepUpGate>`
- `airbotix-app-learn-prd.md` → add §X "Panic button & disclosure flow"
- `parent-portal-prd.md` → add §4.X "Safety notifications & override requests"
- `super-admin-prd.md` §5.7.5 → cross-ref this PRD's confidentiality model
- `institution-prd.md` §10 → add C16-C18 dependency on this PRD's DO list per school
- `audit-event-schema-prd.md` → add IncidentEvent kinds to schema; add retention rules for reportable (7y) vs ops (1y)
- `docs/product/compliance/minors-compliance.md` → C13 / C14 link to this PRD's §5–§7 as the canonical implementation

---

## 14. References

- AU Privacy Act 1988, esp. Part IIIC (Notifiable Data Breaches Scheme)
- Online Safety Act 2021 (Cth) — basic online safety expectations
- AU Mandatory Notifiers Handbook (DCJ NSW / equivalents per state)
- eSafety Commissioner — service provider obligations
- ACMA Statutory Industry Codes
- `audit-event-schema-prd.md` — append-only event design pattern reused here
- `super-admin-prd.md` §3.2 — step-up TOTP pattern
- `institution-prd.md` §10 — data-controller delegation interaction

---

## Revision history

- **v0.1 — 2026-05-25** — Initial draft. Cross-surface incident workflow (observe → triage → resolve, with reportable branch), 5 decisions D-INC1–D-INC5 (step-up gate on reportable, human-in-loop submission, kid panic privacy, NDB clock semantics, append-only event log), Incident additive fields + new `IncidentEvent` table + Evidence bundle S3 contract, panic button UX for kids, NDB 72h + 30d countdown workflow, DO assignment, RBAC matrix, public `/safety` page mandate, 7 open questions tagged for compliance review.
