# Classroom (Class Wall) — `/learn/classroom/*` — PRD

> **Status**: Draft v0.1 · 2026-05-25
> **Repo**: `Airbotix-AI/airbotix-app` (React + Vite SPA — `/learn/*` surface) + `Airbotix-AI/teacher-console` (review queue side)
> **Domain**: `app.airbotix.ai` (kid view) · `teacher.airbotix.ai` (teacher review)
> **Author**: Airbotix engineering
> **Upstream**: `kids-ai-platform-prd.md` · `airbotix-app-learn-prd.md` §5.8 (origin, now superseded)
> **Depends on**: `platform-backend-api-spec.md` §4.4 (`ShareRequest`, `Visibility`) · §4.3 (`Class` / `ClassEnrollment`) · `auth-system-prd.md` (class-code login) · `docs/product/compliance/minors-compliance.md` (C1-C15)
> **Parallel**: `learn-projects-prd.md` (the unit being shared) · `teacher-console-prd.md` (review queue UI)
> **Implementation owner**: airbotix-app frontend (kid view + share request UI) + teacher-console frontend (review queue) + platform-backend (ShareRequest state machine, Like model)

---

## 1. Purpose

The **Class Wall** is the kid-safe social layer: a place inside a single `Class` where kids can show their work to *their classmates only* (no public, no cross-class, no parent-network).

Classroom exists because:
- Kids 8-11 are motivated by classmates seeing their work — it's the strongest engagement signal we have
- Teachers need a low-friction "show and tell" surface during and between sessions
- A bounded, teacher-moderated wall is the **only** social pattern compatible with our minors-compliance posture (C5 — no open chat; C9 — moderated UGC)

Classroom **does not**:
- ❌ Allow free-form comments (Likes only at V0)
- ❌ Show kid-to-kid messaging (Approvals/Help channel routes through teacher, not peer)
- ❌ Cross class boundaries — every wall is scoped to one `Class.id`
- ❌ Expose real names; nicknames + avatars only (parent decides nickname at registration)
- ❌ Cache anything publicly accessible by URL (no `og:image`, no public CDN of artifact thumbnails)

**Compliance posture**: see §8. This PRD is the surface that most directly maps to compliance items C5 / C9 / C13. Changes to this PRD that loosen safety constraints must reference the compliance doc and get product sign-off.

---

## 2. Information Architecture

```
app.airbotix.ai/learn/

├── /learn/classroom                  My classes — list of Class cards
├── /learn/classroom/:classId         A single class's wall
└── /learn/classroom/:classId/post/:projectId   Detail view (own work or classmate's)
```

Teacher side (separate repo, separate PRD):
- `teacher.airbotix.ai/classes/:classId/wall` — same wall, with moderation overlays
- `teacher.airbotix.ai/review` — share request queue (cross-class)
- `teacher.airbotix.ai/reports` — incoming "uncomfortable" reports (cross-class)

---

## 3. Sharing flow — ShareRequest state machine

The wall is **opt-in per Project per kid**. A kid's Project becomes wall-visible by going through this gate:

```
Project (visibility=private)
        │
        │   kid clicks "Share with class" in /learn/projects/:id
        ▼
ShareRequest (status=pending, target_visibility=class)
        │
        │   teacher reviews in teacher-console
        ├──── reject ──▶  ShareRequest.status=rejected; kid sees friendly explanation; Project stays private
        │
        ▼
ShareRequest (status=teacher_approved)
        │
        │   no parent review required for target_visibility=class (V0; see D-C1)
        ▼
ShareRequest.status=approved
Project.visibility=class  ──▶  appears on /learn/classroom/:classId
```

> **V0 simplification (D-C1)**: `target_visibility=class` requires teacher review only. `target_visibility=public` (out of scope V0) would require both teacher AND parent review per the existing `ShareRequest` schema.

### 3.1 Kid-initiated share

From `/learn/projects/:id`:
1. Click **Share with class** → modal opens
2. Kid picks which class (if enrolled in multiple) — must be `ClassEnrollment.status=active`
3. Optional: type a one-line caption (sanitized; PII detection same as Project text)
4. Submit → `POST /projects/:id/share-request` `{ target_visibility: "class", class_id, caption }`
5. Confirmation: "Sent to your teacher! You'll get a ⭐ ping when they say yes."

### 3.2 Teacher review (lives in `teacher-console-prd.md`; summarized here)

Teacher sees pending ShareRequests in their console queue with:
- Project thumbnail + full artifact list
- Kid nickname (real name visible to teacher per `teacher-console-prd.md`)
- Caption
- Audit trail of how the project was made (link into `/audit/project/:id`)
- Buttons: **Approve to class** · **Reject** (requires note)

On approve → `POST /share-requests/:id/teacher-review` `{ decision: "approved" }` → backend sets `Project.visibility=class`, emits `share.granted`, WS-pushes to kid.

On reject → status=rejected, kid sees: "Your teacher had a few small things to check first. Try again or ask them in class." Reason note is teacher→admin only, **not shown to kid** (avoids harsh feedback to 9-year-olds; teacher tells kid in person).

### 3.3 Mission auto-share step

Some Missions include a `share_to_class` step (see [`learn-missions-prd.md`](./learn-missions-prd.md) §3.2). Completing that step auto-creates the ShareRequest — but it still goes through teacher review. The Mission can be marked "complete" the moment the request is *submitted* (not approved); approval just upgrades visibility later.

### 3.4 Unshare / revoke (V0.2)

Either kid or parent can revoke a previously-granted share:
- `DELETE /share-requests/:id` (own family scope) → `Project.visibility=private`, removed from wall immediately, emits `share.revoked`
- Likes accumulated on the post are kept in DB but no longer visible

> Open at V0.1: should teacher also be able to revoke? See QC-2.

---

## 4. Wall views

### 4.1 Class list — `/learn/classroom`

```
┌─────────────────────────────────────────────────────────────────┐
│ 🏫 My Classes                                                   │
│                                                                 │
│ ┌─ AI Creative Lab · Term 1 ──────────────────────────────┐    │
│ │ Teacher: Sarah · 5 classmates                            │    │
│ │ [Open class wall →]                                      │    │
│ └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

Lists every `Class` the kid has `ClassEnrollment.status=active` in. If none → friendly empty state with "ask your parent or teacher to join a class".

### 4.2 Single class wall — `/learn/classroom/:classId`

> Source: `airbotix-app-learn-prd.md` §5.8.

```
┌─────────────────────────────────────────────────────────────────┐
│ 🏫 AI Creative Lab · Term 1                                     │
│  (only your classmates can see this)                            │
│                                                                 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│ │ Leo's robot  │ │ Tara's story │ │ Sam's song   │             │
│ │ [thumbnail]  │ │ [thumbnail]  │ │ [thumbnail]  │             │
│ │ 🌟 5 likes   │ │ 🌟 8 likes   │ │ 🌟 2 likes   │             │
│ │ [♡ Like]     │ │ [♡ Like]     │ │ [♡ Like]     │             │
│ │ [⚠ Report]   │ │ [⚠ Report]   │ │ [⚠ Report]   │             │
│ └──────────────┘ └──────────────┘ └──────────────┘             │
│                                                                 │
│ [✨ Share something of mine to the class →]                    │
└─────────────────────────────────────────────────────────────────┘
```

**Visible cards** = all Projects where `Project.visibility=class` AND any artifact's owning Project belongs to a kid currently `ClassEnrollment.active` on this Class. **Sort**: `Project.updated_at desc` (or `share.granted_at desc` — D-C3, V0 picks the latter to make "newly approved" feel immediate).

**Each card** shows: thumbnail (`Project.thumbnail_s3_key` via signed URL, 1hr TTL), kid nickname, like count, Like button (own state), Report button.

**Privacy banner**: "only your classmates can see this" rendered persistently above the grid — kids need the reassurance.

**Empty state**: "No one has shared anything yet. Be the first! [Share something of mine →]" → routes back to `/learn/projects`.

### 4.3 Single post — `/learn/classroom/:classId/post/:projectId`

Read-only Project view: same artifact layout as `/learn/projects/:id` but without edit/delete affordances, and with the Like + Report buttons prominent. Adds an attribution line: "by Leo · age 9 · in AI Creative Lab".

If the viewer **is** the project owner: extra row showing "shared on May 23 · 8 likes from classmates · [Stop sharing]".

---

## 5. Likes — data model

> Not in `platform-backend-api-spec.md` yet — **add this model in the backend session**.

```prisma
model ProjectLike {
  id            String   @id @default(cuid())
  project_id    String
  project       Project  @relation(fields: [project_id], references: [id], onDelete: Cascade)
  kid_id        String                           // who liked it
  kid           KidProfile @relation(fields: [kid_id], references: [id], onDelete: Cascade)
  class_id      String                           // scoped to the class context the like came from
  class         Class    @relation(fields: [class_id], references: [id])
  created_at    DateTime @default(now())

  @@unique([project_id, kid_id])                 // one like per kid per project (toggle)
  @@index([project_id])
}
```

Rules:
- One Like per (Project, Kid). Re-clicking = unlike (toggle).
- Likes are **only countable while** `Project.visibility=class` AND liker is `ClassEnrollment.active` in the project's class context. Stale Likes (kid dropped class, project unshared) are excluded from count.
- A kid **cannot Like their own Project** (UI hides the button; backend rejects with 422).
- No notifications to the project owner per individual Like (privacy — avoids dopamine loops). Owner sees an *aggregated* count when they next open `/learn/projects/:id`.

### 5.1 Endpoints (new, add to API spec §5.7)

| Method | Path | Roles | Purpose |
|---|---|---|---|
| `POST` | `/projects/:id/like` | kid (classmate of project owner) | Toggle Like |
| `GET` | `/projects/:id/likes` | kid (classmate), parent (own), teacher (own class), admin | Like count + (for teacher/admin) liker list |

---

## 6. Reporting — "this makes me uncomfortable"

Every wall card has a `⚠ Report` button. This is **load-bearing for compliance C9** — without it we cannot launch.

### 6.1 Flow

1. Kid clicks Report → modal: "Tell us what's wrong" with 3 kid-friendly reasons (no free text at V0):
   - 😟 "This makes me feel bad"
   - 😠 "This is mean"
   - 🚫 "This shows something it shouldn't"
2. Submit → `POST /projects/:id/report` `{ reason, class_id }`
3. Backend creates an `Incident` row (`kind=ugc_report`, `severity=medium` by default, `payload={ reason, reporter_kid_id, class_id }`); see `audit-event-schema-prd.md` + `platform-backend-api-spec.md` §4.7 Incidents
4. WS push to teacher console + email to teacher within 5 minutes
5. While `Incident.status=active`, the Project is **soft-hidden from the wall** (still visible to owner; not visible to peers, including the reporter — avoids public retaliation)
6. Teacher reviews in console (`teacher-console-prd.md` §reports), can:
   - Dismiss (Project re-appears)
   - Uphold → `Project.visibility=private`, kid + parent notified by teacher offline, Incident resolved
   - Escalate → flag for admin (`super-admin-prd.md` safety queue)

### 6.2 Anti-abuse

- One Report per (kid, project) — re-reporting same item rejected with 409
- Kids who report 3+ times in a week trigger a teacher heads-up notification (false-report pattern detection)
- All Reports audit-emitted (`actor=kid`, `event_type=safety.report.created`)

### 6.3 Endpoint (new)

| Method | Path | Roles | Purpose |
|---|---|---|---|
| `POST` | `/projects/:id/report` | kid (classmate, not owner) | Create UGC report → opens Incident |

---

## 7. Live class mode (cross-ref)

When the class is in **Live Mode** (teacher toggled in teacher-console), the wall surfaces an extra strip at top:

```
📡 Live class right now — Sarah is here
[🙋 Raise hand — I need help]   [✨ Show my work to the class →]
```

The "Show my work to the class" button on a live class is a *teacher highlight* path: bypasses the regular review queue (teacher is already watching) and pins the Project to the wall top until live mode ends. Implemented as: `POST /share-requests` with `target_visibility=class, autobypass_live=true`; backend allows the bypass only when `Class.is_live=true` and the requester is `ClassEnrollment.active`. Teacher can still hard-reject after the fact.

Details of Live Mode itself live in `airbotix-app-learn-prd.md` §10 and `teacher-console-prd.md`.

---

## 8. Compliance hooks

This section maps to `docs/product/compliance/minors-compliance.md`. Every wall feature must keep these guarantees intact.

| Compliance item | How Classroom honors it |
|---|---|
| **C5** — No open kid-to-kid chat | Likes only at V0; no comment field; no DM. The Report button is kid→system, not kid→kid. |
| **C7** — Full audit | `share.requested`, `share.granted`, `share.rejected`, `share.revoked`, `like.toggled`, `safety.report.created` all emit AuditEvent |
| **C9** — Moderated UGC | Teacher approval required for every wall entry; Report → Incident → review loop |
| **C10** — Real names off-platform | Wall uses nicknames + avatars only; real name visible only to teacher (via teacher-console role gate) |
| **C12** — Right to erasure | Unshare immediately removes from wall; Project deletion cascades to ShareRequest + ProjectLike rows; 30-day hard-purge per [`learn-projects-prd.md`](./learn-projects-prd.md) §8 |
| **C13** — Incident response | UGC reports create Incident rows (`kind=ugc_report`); `super-admin-prd.md` analytics surfaces report rate as a KPI |

**Hard rules** (any PR that violates these must be rejected at review):
- No public URL to any wall artifact bytes; all reads via signed S3 URL with ≤ 1 hr TTL
- No `og:image` / Open Graph meta on wall pages (prevents accidental social cards)
- No client-side cache of wall thumbnails in `localStorage` / IndexedDB beyond session
- No analytics events leaving the platform that contain artifact URLs or kid nicknames

---

## 9. Backend integration (cross-ref + new)

| Action | Endpoint | Status |
|---|---|---|
| List class enrollments for kid | `GET /classes/:id/enrollments` (filtered to own row) | existing |
| Get class details | `GET /classes/:id` | existing |
| Submit share request | `POST /projects/:id/share-request` | existing |
| Teacher approve/reject | `POST /share-requests/:id/teacher-review` | existing |
| Revoke share | `DELETE /share-requests/:id` (parent/kid own scope) | **new** — add to §5.7 |
| List wall posts for a class | `GET /classes/:id/wall` (returns Project[] with `visibility=class` for active enrollees) | **new** — add to §5.5 |
| Toggle Like | `POST /projects/:id/like` | **new** — see §5.1 |
| Read Like count | `GET /projects/:id/likes` | **new** — see §5.1 |
| Report UGC | `POST /projects/:id/report` | **new** — see §6.3 |

**WS events** the kid wall subscribes to (`class:<class_id>` room):
- `share.granted` — new post appears (or owner sees their post live)
- `share.revoked` / `share.removed_by_report` — post disappears
- `like.toggled` — count updates in place (no toast — see anti-dopamine rule §5)

**API spec deltas required** in `platform-backend-api-spec.md`:
- §4.4 — add `ProjectLike` model (see §5 above)
- §5.5 — add `GET /classes/:id/wall`
- §5.7 — add `DELETE /share-requests/:id`, `POST /projects/:id/like`, `GET /projects/:id/likes`, `POST /projects/:id/report`

Backend session: please pick up.

---

## 10. UX details / micro-rules

- **No like counts on cards under 3 likes** — shows just "♡" (don't let kids feel bad about low counts; surface only positive social proof). Owner always sees exact count in their own dashboard.
- **No leaderboards** — the wall sort is by recency, never by like count or kid identity.
- **Like animation** is a soft pulse, no celebratory confetti — Likes shouldn't compete with Mission completion as the dopamine peak.
- **Report button** is small and grey, not red — discoverable but not alarming.
- **"Stop sharing"** button on own posts is a single click with a confirm modal; instant effect.
- **Caption rendering** strips emojis nobody can render (custom emoji), trims at 80 chars, no links.

---

## 11. Out of Scope (V0)

- ❌ Comments (free-form text reactions)
- ❌ Emoji reactions beyond a single Like
- ❌ Kid-to-kid DM, group chat, or any peer messaging
- ❌ Cross-class walls / "see what other classes are making"
- ❌ Public sharing (`Visibility.public`) — schema supports it but no UI at V0
- ❌ Featured / staff picks
- ❌ Notifications when somebody likes your post (privacy + dopamine)
- ❌ Teacher-pinned highlights (V1 — separate from Live highlight)
- ❌ Like-back / "follow your classmates" social graph
- ❌ Real-name display ever (architectural ban)

---

## 12. Decision Records

| # | Decision | Why |
|---|---|---|
| D-C1 | `target_visibility=class` requires **teacher only**, not teacher+parent. | Teacher is in the room with the kid; double-review at V0 would kill engagement and the teacher is the operative trust party. Public visibility (when added) will require both. |
| D-C2 | **Likes only**, no comments, ever, at V0. | Single biggest moderation risk surface in any kid product; eliminating comments = ~80% fewer incidents. |
| D-C3 | Wall sort is **recency-based** (`share.granted_at desc`), never popularity. | Avoids leaderboard psychology; new shares feel rewarded; predictable for teachers. |
| D-C4 | Report opens an **Incident**, doesn't just email the teacher. | Compliance C13 requires auditable incident tracking; email-only would lose state. |
| D-C5 | Reported items **soft-hide from peers** (including reporter) but stay visible to owner. | Owner shouldn't be silently shadow-banned without explanation; reporter shouldn't see the item they reported (anti-retaliation). |
| D-C6 | Likes do **not** trigger notifications to the owner. | Anti-dopamine; aggregated count is enough; kid sees it when they choose to look. |
| D-C7 | Real names are **never** rendered on the wall, even between classmates who know each other IRL. | Architectural defense — keeps wall data safe even if exfiltrated. |
| D-C8 | Live-class **highlight bypass** is allowed only while `Class.is_live=true`. | Teacher is actively watching, so the safety review is happening in real time. |

---

## 13. Open Questions

| # | Q | Owner | Impact |
|---|---|---|---|
| QC-1 | Should the wall persist after `Class.ends_at`? Or freeze read-only? | Product | Teachers may want it as a portfolio retro; kids might want to keep liking |
| QC-2 | Can a teacher **revoke** an approved share (in addition to kid/parent)? Currently no. | Product / Compliance | Teacher should probably be able to in case of post-hoc concern |
| QC-3 | Do Likes from kids who later get suspended (`POST /admin/kids/:id/suspend`) get retroactively removed from counts? | Engineering | Affects whether like_count is denormalized or always computed |
| QC-4 | Should there be a "Class wall digest" email weekly to parents showing their kid's shared work? | Product | Engagement boost vs privacy |
| QC-5 | Empty wall in a new class for first 1-2 weeks — does the teacher seed it with an example post? | Product / Curriculum | Onboarding cold-start |
| QC-6 | When a Mission's `share_to_class` step auto-creates a request but teacher rejects, does the Mission stay "complete" or revert? | Product | Currently spec'd to stay complete (Mission step = "submitted", not "approved") |

---

## 14. Revision History

- **v0.1 — 2026-05-25** — Promoted from `airbotix-app-learn-prd.md` §5.8 into a standalone PRD. **New content**: ShareRequest state machine (§3), Like data model (§5, requires new `ProjectLike` Prisma model), Report → Incident flow (§6), compliance hook table (§8 mapping to C5/C7/C9/C10/C12/C13), micro-rules (§10), decision records D-C1…D-C8. Flagged API spec deltas in §9 for backend session pickup.
