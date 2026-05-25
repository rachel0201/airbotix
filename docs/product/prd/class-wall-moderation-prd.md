# Class Wall — UGC Moderation & Reporting PRD

> **Status**: Draft v0.1 · 2026-05-25
> **Scope**: Moderation workflow for the in-class "Wall" surface — kid-to-kid shared content (project artifacts, comments, reactions). Covers automated pre-publish moderation, peer reports, teacher review queue, escalation to admin, escalation to incident pipeline.
> **Author**: Airbotix engineering + safety
> **Depends on**: `airbotix-app-learn-prd.md` (kid Wall surface), `teacher-console-prd.md` §4.7 (existing review queue framing), `incidents-and-mandatory-reporting-prd.md` (escalation target), `platform-backend-api-spec.md` (ShareRequest model is the seed), `audit-event-schema-prd.md`
> **Sibling**: `learn-classroom-prd.md` §6 (referenced by super-admin-prd §5.7.5 — this PRD owns the moderation contract that surface refers to)
> **Compliance frame**: Online Safety Act 2021 (Cth), Basic Online Safety Expectations, AU eSafety Commissioner guidance on services for children, COPPA equivalent obligations

---

## 1. Purpose

The Class Wall is the social surface where kids share what they made — project thumbnails, short captions, reactions from classmates. It is the **highest UGC-risk feature on the platform**: kid-generated content + kid-visible + class-bounded. The current spec scatters moderation across `learn-classroom-prd.md` §6 (vague "Wall moderation") and `teacher-console-prd.md` §4.7 (admin / teacher review of share_requests), but **no single PRD owns the contract for "what happens between a kid pressing Share and the post being visible — and what happens when another kid reports it"**.

Without this PRD:
1. Engineering doesn't know what auto-checks gate publishing
2. Teachers don't know if they review every post or just reported ones
3. Reports from kids have no spec'd flow
4. Wall posts that escalate to safeguarding incidents have no defined handoff to `incidents-and-mandatory-reporting-prd.md`

This PRD owns that contract.

### 1.1 Non-goals

- DMs between kids — out of scope; the platform has no DM feature, won't add one
- Public sharing beyond class (`share_scope=public_web`) — uses the same ShareRequest model but the heavier flow lives in `teacher-console-prd.md` §4.7; this PRD covers in-class Wall only
- Comment threads of arbitrary depth — V1 = single-level reactions + 1 line caption; threaded comments deferred to V2+
- Real-time chat — never (out of platform philosophy)

---

## 2. What the Wall surfaces

V1 Wall content types, each with its own moderation pipeline:

| Type | Example | Created via | Auto-moderation | Pre-publish review |
|---|---|---|---|---|
| Project share | Kid finishes a story → "Add to class Wall" | `POST /classes/:id/wall/posts` from `/learn/projects/:id` | Yes (image + text classifier) | Default: teacher review for kids <8; auto-publish ≥8 (configurable) |
| Caption | 1-line text accompanying a Project share | Same post | Yes (text classifier) | Same gate |
| Reaction | 6 fixed emoji (`🌟`, `🎉`, `💡`, `🥰`, `🦄`, `🎨`) | `POST /classes/:id/wall/posts/:id/reactions` | No (fixed set) | None |
| Comment | (V2+) free-text reply | n/a | Yes | Manual review only |

Posts are scoped to one class. They expire 30 days after class end (class becomes archived → Wall freezes; super_admin can restore for audit access).

---

## 3. Decision records

| ID | Decision | Rationale |
|---|---|---|
| **D-WALL1** | Auto-moderation **gates publishing for kids under 8**; older kids (8–11) get post-publish review (teacher sees Wall live, can hide retroactively). | Younger kids need higher protection; older kids' Wall-as-classroom-bulletin works better when it doesn't have a publish lag |
| **D-WALL2** | Every post carries a `share_scope` field, but Wall = `share_scope=class_wall` always. Cross-class sharing requires explicit `share_scope=class_wall_other` request (rare, V2+). Never auto-shared cross-class. | Class boundary is the social safety boundary |
| **D-WALL3** | A kid reporting another kid's post never reveals reporter identity to the reported kid. Reporter identity visible only to teacher / admin during review. | Bullying prevention; reporting must be safe |
| **D-WALL4** | A post hidden by teacher remains in the DB; the kid who posted is told "your post was hidden for now" with a short reason from a fixed list (no free-text — avoid teacher-blamer relationships) and the option to revise. **Posts hidden by automation** are softer: kid is told "we couldn't publish this — try a different image / caption" without naming a violation. | Differentiates pedagogical correction (teacher) from policy enforcement (system) |
| **D-WALL5** | Three independent kid reports on the same post **auto-hides** it pending teacher review. One report = banner appears for teacher; doesn't auto-hide. | Balance: false-report defence + speed when something is genuinely bad |
| **D-WALL6** | Wall posts that the system classifies as `safety_disclosure_pattern` (kid expressing distress) **auto-route to `incidents-and-mandatory-reporting-prd.md` §5.1 pipeline**, not the Wall review queue. The post is hidden from all peers and the kid sees a calm message; the panic-button flow is triggered server-side. | Don't waste 8-hour teacher response SLA on safeguarding signals |

---

## 4. Data model

### 4.1 Reuse existing `ShareRequest` (per `platform-backend/prisma/schema.prisma`)

Existing fields: `id`, `project_id`, `requested_by`, `scope` (already an enum), `status`, `teacher_review`, `parent_review`, `created_at`. This PRD extends.

### 4.2 New table — `WallPost`

```prisma
model WallPost {
  id                String              @id @default(cuid())
  class_id          String
  author_kid_id     String
  share_request_id  String?             // link to underlying ShareRequest for projects; null for caption-only
  project_id        String?             // denormalised for fast Wall query
  caption           String?
  image_s3_key      String?             // copy of project thumbnail at post time
  status            WallPostStatus      @default(pending_auto)
  auto_mod_result   Json                @default("{}") // {scores: {nsfw, harassment, ...}, model: 'x', verdict: 'pass'|'flag'|'block'}
  hidden_at         DateTime?
  hidden_by         String?             // teacher/admin user_id, null if auto
  hidden_reason     WallHideReason?
  hidden_reason_detail String?          // freeform note (teacher/admin)
  pinned_by_teacher Boolean             @default(false)
  reaction_counts   Json                @default("{}") // {'🌟': 3, ...} cached
  metadata          Json                @default("{}")
  created_at        DateTime            @default(now())
  updated_at        DateTime            @updatedAt
  deleted_at        DateTime?

  class             Class               @relation(fields: [class_id], references: [id], onDelete: Cascade)
  author_kid        KidProfile          @relation(fields: [author_kid_id], references: [id])
  share_request     ShareRequest?       @relation(fields: [share_request_id], references: [id])
  reactions         WallReaction[]
  reports           WallReport[]

  @@index([class_id, status, created_at])
  @@index([author_kid_id])
}

enum WallPostStatus {
  pending_auto          // queued for auto-mod
  pending_teacher       // auto-mod flagged or kid is <8 — needs teacher review
  published
  hidden_auto           // auto-mod blocked
  hidden_teacher        // teacher hid
  hidden_admin          // admin hid (post-publish)
  escalated_incident    // routed to incidents pipeline; not visible
  archived              // class ended, frozen
}

enum WallHideReason {
  unsafe_content
  off_topic
  privacy_concern       // shows real name / address / school crest
  unkind_to_others
  copyright_concern
  needs_revision
  other
}
```

### 4.3 New table — `WallReaction`

```prisma
model WallReaction {
  id            String          @id @default(cuid())
  wall_post_id  String
  kid_id        String
  emoji         String          // constrained to fixed set in §2
  created_at    DateTime        @default(now())

  wall_post     WallPost        @relation(fields: [wall_post_id], references: [id], onDelete: Cascade)
  kid           KidProfile      @relation(fields: [kid_id], references: [id], onDelete: Cascade)

  @@unique([wall_post_id, kid_id])       // one reaction per kid per post (changeable)
  @@index([wall_post_id])
}
```

### 4.4 New table — `WallReport`

```prisma
model WallReport {
  id              String          @id @default(cuid())
  wall_post_id    String
  reporter_kid_id String
  reason          WallReportReason
  reason_text     String?         // optional, max 200 chars, kid-friendly prompt
  status          WallReportStatus
  resolved_by     String?         // teacher/admin user_id
  resolution      WallReportResolution?
  resolution_note String?
  created_at      DateTime        @default(now())
  resolved_at     DateTime?

  wall_post       WallPost        @relation(fields: [wall_post_id], references: [id], onDelete: Cascade)
  reporter_kid    KidProfile      @relation(fields: [reporter_kid_id], references: [id])

  @@unique([wall_post_id, reporter_kid_id])   // one report per kid per post
  @@index([wall_post_id, status])
  @@index([status, created_at])
}

enum WallReportReason {
  mean_or_unkind
  scary_or_upsetting
  not_school_appropriate
  someone_else_should_see_this    // catch-all for "I don't have words but please look"
}

enum WallReportStatus {
  open
  in_review
  resolved
}

enum WallReportResolution {
  no_action
  post_hidden
  poster_warned
  escalated_incident
  reporter_misuse_warned          // when report was clearly malicious
}
```

---

## 5. Pipelines

### 5.1 Publish flow

```
Kid taps "Share to Wall" on /learn/projects/:id
  └─▶ POST /classes/:id/wall/posts
        ├─▶ create WallPost(status=pending_auto)
        ├─▶ enqueue moderation job
        │     ├─▶ image classifier (NSFW, violence, real-face-of-real-child)
        │     ├─▶ text classifier on caption (toxicity, PII, distress signals)
        │     └─▶ producer of auto_mod_result Json
        │
        ├─▶ if auto_mod = block → status=hidden_auto, kid sees soft message (D-WALL4)
        ├─▶ if auto_mod = flag → status=pending_teacher, banner on teacher's review queue
        ├─▶ if auto_mod = safety_disclosure_pattern → status=escalated_incident, route to incidents (D-WALL6)
        └─▶ if auto_mod = pass AND kid age >= 8 (or class.auto_publish=true) → status=published
            else                                                            status=pending_teacher
```

Auto-moderation runs server-side, target latency p95 < 4 seconds. Beyond 30s, post stays in `pending_auto` with a "Almost ready..." UI; >2 min triggers a system retry, alert to ops.

### 5.2 Teacher review (`/classes/:id/wall/queue`)

Teacher sees:
- Pending posts (auto-flagged or age-gated)
- Reported posts (1 report = banner; 3 reports = auto-hidden, marked urgent)
- Recently published (last 24h scroll for spot-check)

Per-post actions:
- **Approve** → status=published
- **Hide with reason** → status=hidden_teacher (kid gets the soft reason message per D-WALL4)
- **Edit caption** → only allowed for misspellings / PII removal; not for ideological edits; logged
- **Escalate to admin** → admin sees in their queue
- **Open incident** → triggers `incidents-and-mandatory-reporting-prd.md` §5.1 with kind=`harassment` or `safety_disclosure`

Review SLA (V0 commitment):
- `pending_auto` flag → teacher response < 8 hours (class-day) or < 24 hours (off-school-time)
- `WallReport.status=open` → < 4 hours
- Auto-hidden (3-report rule) → < 2 hours

### 5.3 Report flow (kid → teacher)

```
Kid taps "Tell teacher" on a peer's post
  └─▶ Three-screen flow:
        1. "Tell us why" → 4 fixed reasons (kid-friendly copy)
        2. Optional text box (max 200 chars), with reminder "We'll keep this private from the person who posted"
        3. "Thanks for telling us" → no immediate consequence shown
  └─▶ POST /classes/:id/wall/posts/:postId/reports
        ├─▶ create WallReport(status=open)
        ├─▶ increment WallPost.metadata.report_count
        ├─▶ if report_count >= 3 → WallPost.status=hidden_auto, alert teacher (D-WALL5)
        └─▶ teacher notified in /classes/:id/wall/queue
```

Reporter never sees the resolution narrative (privacy of process). They see, in `/learn/notifications`, a soft message: "Thanks for telling us — your teacher looked into it." with no detail on what the teacher decided.

### 5.4 Admin escalation

Teacher's escalation → admin review at `/admin/wall-incidents`:
- Same data model
- Admin can `hide_admin` (visible to teacher as "Admin hid this; reason: ..." — teacher should see context)
- Admin can open formal `Incident` per `incidents-and-mandatory-reporting-prd.md`
- Admin can warn / suspend kid via existing `POST /admin/kids/:id/suspend`

### 5.5 Reporter abuse

If a kid files >5 reports in a week with `resolution=no_action` for ≥4 of them, system flags `WallReport(resolution=reporter_misuse_warned)` — teacher has private conversation. Bias toward kindness (kids are figuring out boundaries) — no automated penalty.

---

## 6. UX (kid surface) — affordances and copy

Per `airbotix-app-learn-prd.md` voice + design system rules (`DESIGN.md`):

### 6.1 Sharing
- Big "Share to Wall" sticker button after project save
- Pre-share screen: thumbnail preview + caption box (max 80 chars, emoji allowed) + "Who'll see it?" badge ("Just our class")
- Post-tap: optimistic UI shows post immediately with "Almost ready..." until auto-mod returns

### 6.2 Wall view
- Card grid (2-up on mobile, 3-up on tablet)
- Reactions: tap → emoji selector, single tap-to-react
- Long-press on a peer's post → "Tell teacher" modal
- No reaction count visible until at least 1 reaction (avoid first-poster anxiety)

### 6.3 If your post is hidden
- Calm yellow card on kid's home: "Your post about [project name] is taking a break. {Reason in kid-friendly language}. Want to update it?"
- Reason mapping (D-WALL4):
  - `unkind_to_others` → "Let's make sure everyone feels okay reading it."
  - `off_topic` → "This wasn't quite about our class topic — fancy revising?"
  - `privacy_concern` → "Looks like there might be personal info in the picture. Let's swap it."
  - `unsafe_content` → "We couldn't share this one. Try a different version?" (no reason detail given to kid for safety reasons)
- Never use words like "violation", "rejected", "banned"

### 6.4 If your report leads to action
- "Thanks for telling us. Your teacher had a look." Nothing more.
- No celebratory tone, no number-of-reports leaderboard, no badge for reporting

---

## 7. Auto-moderation policy

V0 stack:
- Image: AWS Rekognition Moderation API (NSFW + violence + suggestive) OR OpenAI vision endpoint via DeepRouter — TBD V0 ops decision
- Text: OpenAI moderation endpoint via DeepRouter for caption; secondary classifier for distress patterns
- Face detection: any detected face triggers an additional manual review (privacy concern — kid might be sharing their own face accidentally)
- PII regex pass: phone, email, address patterns → soft-block ("Looks like personal info...")

Thresholds (initial; tunable per `SystemConfig.wall_mod_thresholds`):
- `block` if any score ≥ 0.8 (Rekognition / moderation)
- `flag` if any score ≥ 0.4
- otherwise `pass`

Tuning loop: every quarter, super_admin reviews precision/recall vs human verdicts on flagged posts.

---

## 8. Surfaces summary

| Surface | New page / hook | Audience |
|---|---|---|
| `/learn/projects/:id` | "Share to Wall" CTA | Kid |
| `/learn/classes/:id/wall` | Wall view, reactions, report | Kid |
| `/learn/notifications` | Hidden-post calm message, report-thanks | Kid |
| `/classes/:id/wall/queue` | Teacher review queue | Teacher |
| `/admin/wall-incidents` | Escalated cases | Admin |
| `/admin/system/wall-policy` | Threshold tuning, model swap | Super_admin |

---

## 9. RBAC

| Action | Kid | Parent | Teacher (own class) | Admin | Super_admin |
|---|---|---|---|---|---|
| Create WallPost (own project, own class) | ✓ | ✗ | ✗ | ✗ | ✗ |
| React | ✓ | ✗ | ✗ | ✗ | ✗ |
| Report | ✓ | ✗ | ✗ | ✗ | ✗ |
| View Wall (own class) | ✓ | ✓ (parent can see kid's class Wall — read-only) | ✓ | ✓ | ✓ |
| View Wall (other class) | ✗ | ✗ | ✗ (different teacher's class — V2+ federated) | ✓ | ✓ |
| Hide post | ✗ | ✗ | ✓ | ✓ | ✓ |
| Resolve WallReport | ✗ | ✗ | ✓ | ✓ | ✓ |
| Escalate to incident | ✗ | ✗ | ✓ | ✓ | ✓ |
| Edit caption | ✗ | ✗ | ✓ (limited) | ✓ | ✓ |
| Suspend kid from posting | ✗ | ✗ | ✗ | ✓ | ✓ |
| Tune moderation thresholds | ✗ | ✗ | ✗ | ✗ | ✓ |

Note: parents have read-only Wall view because parents are NOT in the kid's social context, but giving them visibility on what their kid is seeing is a safeguarding affordance and matches the parent-portal "I want to know what's happening" pattern.

---

## 10. Endpoints (additions to `platform-backend-api-spec.md` §5)

```
POST   /classes/:id/wall/posts                      kid
GET    /classes/:id/wall                            kid / parent (read-only) / teacher / admin / super_admin
GET    /classes/:id/wall/queue                      teacher / admin / super_admin
PATCH  /classes/:id/wall/posts/:postId              teacher / admin (hide/approve/edit)
POST   /classes/:id/wall/posts/:postId/escalate     teacher / admin
DELETE /classes/:id/wall/posts/:postId              admin / super_admin (soft delete)

POST   /classes/:id/wall/posts/:postId/reactions    kid
DELETE /classes/:id/wall/posts/:postId/reactions    kid

POST   /classes/:id/wall/posts/:postId/reports      kid
GET    /classes/:id/wall/posts/:postId/reports      teacher / admin
PATCH  /classes/:id/wall/posts/:postId/reports/:rid teacher / admin

GET    /admin/wall-incidents                        admin / super_admin
GET    /admin/system/wall-policy                    super_admin
PATCH  /admin/system/wall-policy                    super_admin + step-up
```

---

## 11. Notifications

| Trigger | Channel | Recipient |
|---|---|---|
| Your post was published | In-app calm | Kid (author) |
| Your post is taking a break | In-app calm + soft message | Kid (author) |
| 3 reports on a post | In-app banner | Teacher |
| Auto-hidden post (post-publish) needs review | In-app banner | Teacher |
| Post escalated to admin | In-app + email | Admin |
| Wall report linked to incident | (handled by incidents PRD notification matrix) | per incidents §6.5 |

Reports never notify the post author. Hides notify the post author with the soft reason copy per §6.3.

---

## 12. Compliance & audit

- Every state change on `WallPost` emits an AuditEvent with the audit envelope
- Hidden posts retained for 90 days after class ends; legitimate evidence value for safeguarding
- Auto-hidden posts retained 30 days then soft-purged unless escalated to an Incident
- Reports retained 1 year for trend analysis (kid_id retained; resolution-no-action ones aggregate-anonymised after 30 days)
- AU Online Safety Act compliance: §3.6 ("ensure the service provides safe use") + §4.5 (terms transparently communicated) — `/safety` public page links here per `incidents-and-mandatory-reporting-prd.md` §8.5

---

## 13. Open questions

| Q | Item | Resolution path |
|---|---|---|
| Q1 | Should `pending_teacher` posts be visible to the kid as "waiting" or shown immediately optimistically? | V1: shown to the kid as "Almost ready..." for ≤30s; if still pending, becomes "Your teacher will look at this soon." Don't let kid refresh-spam. |
| Q2 | What if a teacher sits on a pending queue for >24h? | V1: auto-escalate to admin at T+24h with a polite ping to teacher first. Track teacher review latency in `teacher-employment-prd.md` §8 performance. |
| Q3 | Edge case: kid is in two classes; can they share the same project to both Walls? | V1: yes, two distinct WallPost rows. Each class moderates independently. |
| Q4 | Cross-class Wall (school-wide feed) per institution? | V2+ — explicit `share_scope=institution_wall` with institution-admin curation. Not V1. |
| Q5 | Should reactions be visible to the post author by reactor identity (i.e. "🌟 from Mia")? | V1: yes, identity visible (it's a kindness signal). V2 add a setting per class for anonymous reactions if a school requests. |
| Q6 | When kid age crosses 8, do their existing pending-teacher posts retroactively auto-publish? | V1: no — the class's `auto_publish` setting is fixed at the class start; cohort-effect over time. |
| Q7 | Wall posts on kids' birthdays / personal milestones — should we offer a "celebrate" feature that auto-suppresses moderation? | V1: no special-case. Birthdays are still posts; same gates apply. Saves complexity. |
| Q8 | A kid leaves the class mid-term — what happens to their Wall posts? | V1: posts stay (they're class artefacts now); kid's name visible to teacher's audit but greyed in kid-facing view. Parent can request deletion via §10 GDPR/COPPA flow in institution PRD. |

---

## 14. Success criteria (V0 ship)

- Auto-mod p95 latency < 4s on Wall publish path
- Teacher response to flagged posts p95 < 8h during school day (measured in `teacher-employment` performance dashboard)
- 3-report auto-hide rule fires within 30s of the 3rd report
- Kid reporter identity never surfaces to reported kid (verified by E2E)
- Hidden-post soft-message UX legible to a 6-year-old (manual review by safety consultant pre-launch)
- Public `/safety` page references Wall moderation procedure transparently per Online Safety Act §4.5

---

## 15. Cross-PRD updates required when this ships

- `learn-classroom-prd.md` §6 → replace vague "Wall moderation" section with link to this PRD
- `airbotix-app-learn-prd.md` → integrate §6 UX above into the Wall page spec
- `teacher-console-prd.md` §4.7 → split share-request review (existing) from Wall queue (new), cross-link this PRD
- `super-admin-prd.md` §5.7.5 → analytics tab gains Wall metrics (reports per class, false-positive rate, auto-publish vs review split)
- `incidents-and-mandatory-reporting-prd.md` §5.1 observation table → add "Wall UGC report triggered" row
- `parent-portal-prd.md` → parent read-only Wall view per §9 RBAC

---

## 16. References

- AU Online Safety Act 2021, esp. Basic Online Safety Expectations 6 and 8
- eSafety Commissioner — Industry guidance for services used by children
- `airbotix-app-learn-prd.md` (kid Wall surface)
- `incidents-and-mandatory-reporting-prd.md` §5.1 (D-WALL6 routing target)
- `audit-event-schema-prd.md`

---

## Revision history

- **v0.1 — 2026-05-25** — Initial draft. 6 decisions (D-WALL1–D-WALL6: age-gated publish, class-scoped boundary, reporter privacy, hide vs auto-block messaging, 3-report auto-hide, distress signal → incidents handoff), new tables `WallPost` / `WallReaction` / `WallReport`, dual-pipeline auto-mod (image + text classifiers), kid-side calm UX (no rejection language, no leaderboards), teacher review queue SLA, RBAC matrix incl. parent read-only, 8 open questions on edge cases (cross-class shares, age transitions, leaving-class semantics), Online Safety Act compliance hooks.
