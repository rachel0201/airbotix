# Teacher Console — `teacher.airbotix.ai` — PRD

> **Status**: Draft v0.1 · 2026-05-15
> **Repo**: `Airbotix-AI/teacher-console` (React 18 + Vite + TS + Tailwind SPA)
> **Domain**: `teacher.airbotix.ai`
> **Hosting**: AWS S3 + CloudFront (ap-southeast-2 Sydney)
> **Author**: Airbotix engineering
> **Depends on**: `platform-backend-api-spec.md` (API contract), `auth-system-prd.md` (login flow)
> **Sibling surfaces**: `parent-portal-prd.md` (`/portal/*`), `airbotix-app-learn-prd.md` (`/learn/*`)

---

## 1. Purpose

The Teacher Console is **the surface where Airbotix instructors and admins run classes and operate the platform**. It exists to deliver three jobs that neither the Parent Portal nor the kid `/learn/*` surface can do:

1. **Run live classes** — the teacher needs a real-time view of every enrolled kid's progress, who's stuck, who's idle, who's burning through Stars
2. **Curate content** — review and approve `share_request`s before kid work reaches the class wall or public web
3. **Operate the business** — admins handle wallet adjustments, refunds, incident response, family search, content suspensions

The Teacher Console is **not** the parent surface (that's `/portal/*` on `app.airbotix.ai`) and **not** where teachers create course packs. Per the authoring roadmap in [`learn-missions-prd.md`](./learn-missions-prd.md) §9 (D-M6 / D-M7): **V0/V1 — Airbotix admin authors only; teachers select published packs when creating a Class. V2 — schools compose `CurriculumBundle`s from the catalog (no Mission authoring). V3+ — teacher authoring only after the moderation tooling lands.**

### 1.1 Scope: teacher + admin + super_admin in one app

The old `super-admin/` Supabase app was removed 2026-05-14. Rather than re-build a separate admin SPA, this console serves **all three operational roles** with route-level RBAC:

| Role | Visible sections | Notes |
|---|---|---|
| `teacher` | Classes, Students (in own classes), Reviews, Schedule, Profile | Default surface |
| `admin` | Everything teacher sees + `/admin/*` section (Families, Wallet ops, Incidents, Course packs) | Ops / customer support |
| `super_admin` | Everything admin sees + `/admin/system/*` (audit dump, super-user impersonation, manual DB ops via tooling) | Founders / on-call SRE only |

One codebase, one deploy. Cheaper than three SPAs and the data overlaps heavily (an admin investigating an incident needs the same class + audit views the teacher uses).

---

## 2. Information Architecture

```
teacher.airbotix.ai
├── /login                       (PUBLIC) — OTP email entry, role auto-detected from User.role
├── /verify-otp                  (PUBLIC) — 6-digit OTP input
│
├── /                            [auth, any role] — Home (role-aware dashboard)
│
├── /classes                     [teacher, admin] — My classes list
├── /classes/new                 [teacher, admin] — Create class wizard
├── /classes/:id                 [teacher (own), admin] — Class detail (enrollments, schedule, code, settings)
├── /classes/:id/live            [teacher (own), admin] — LIVE MODE — real-time kids' progress
├── /classes/:id/students/:kid   [teacher (own), admin] — Per-student detail (progress, projects, audit)
├── /classes/:id/wall            [teacher (own), admin] — Class wall (approved class-share projects)
│
├── /reviews                     [teacher, admin] — Share request queue (teacher review)
├── /reviews/:id                 [teacher, admin] — Single share request decision
│
├── /students                    [teacher, admin] — All students across owned classes (search, filter)
├── /students/:kid               [teacher (class member), admin] — Student detail (across all classes)
│
├── /course-packs                [teacher, admin] — Browse published course packs (read-only V0)
├── /course-packs/:slug          [teacher, admin] — Course pack detail + mission list
│
├── /profile                     [auth] — Teacher profile, notification prefs, sign-out everywhere
│
├── /admin                       [admin, super_admin] — Admin home
├── /admin/families              [admin, super_admin] — Family search + detail
├── /admin/families/:id          [admin, super_admin] — Family detail (wallet, kids, audit, refund)
├── /admin/wallet/adjust         [admin, super_admin] — Manual Stars credit/debit form
├── /admin/incidents             [admin, super_admin] — Global incident feed (paused families, moderation rejects)
├── /admin/kids/:id/suspend      [admin, super_admin] — Suspend kid (content incident response)
├── /admin/course-packs          [admin, super_admin] — Create / edit / publish course packs
├── /admin/refunds               [admin, super_admin] — Airwallex refund issuance
│
└── /admin/system                [super_admin only] — Audit dump, impersonation, system health
```

### Nav drawer (left, fixed on desktop / drawer on mobile)

```
TEACHER section (always visible to teacher/admin/super_admin)
🏠 Home
📚 My Classes               (3 active · 1 today)
🛎️ Reviews                  2 pending   ← red badge
👨‍🎓 Students                 24
📦 Course Packs
⚙️ Profile

ADMIN section (visible only to admin/super_admin)
─────────────────────────
🛠️ Admin Home
👨‍👩‍👧 Families
💰 Wallet Ops
🚨 Incidents               1 active     ← red badge
📦 Course Pack Authoring
💳 Refunds

SYSTEM section (visible only to super_admin)
─────────────────────────
🔧 System

[Avatar]  Sarah (teacher · AU)
          [Sign out]
```

### Visual style

- **Information-dense**, optimised for a teacher running a class on a laptop next to a Chromebook trolley
- Default layout = **3-column grid**: nav drawer | content | live side-panel (live mode only)
- **Light theme by default**; dark mode for live class evening sessions
- No marketing-style hero blocks — this is an operational tool, not a brochure
- All time displays in teacher's local time (auto-detected, override in Profile)

---

## 3. Auth & Onboarding

### 3.1 Teacher invitation flow

Teachers are **created by admins**, not self-registered. There is no public "Sign up as teacher" link.

```
Admin path:
  /admin/families → "Add teacher" → enter email + display_name + region
  Backend:
    POST /admin/users { role: 'teacher', email, display_name, region }
    → creates User row (no password)
    → sends invitation email with one-shot login link (signed token, 7-day TTL)

Teacher path:
  Email link → /login?invite=<token>
  → backend verifies token → issues access + refresh tokens
  → redirect to /profile to finish setup (display name, timezone, photo)
```

### 3.2 Returning login

Standard OTP flow (see `auth-system-prd.md`):

```
/login → email → OTP → / (role-aware home)
```

Role-aware home routing:
- `teacher` → `/` shows class-focused home
- `admin` → `/` shows class-focused home with admin nav visible
- `super_admin` → `/` shows admin home directly

### 3.3 Session management

Same rules as Parent Portal:
- Access token 15min, silent refresh on 401
- Refresh token 30 days, HttpOnly cookie, rotates per refresh
- "Sign out everywhere" in `/profile` revokes all refresh tokens

### 3.4 RBAC on the client

- Routes are gated at the React Router level (`<RoleGate roles={['admin', 'super_admin']}>...</RoleGate>`)
- Server is the source of truth — every fetch hits a guard; client-side gating is **UX only**
- Nav drawer hides sections the role can't access (no broken-link guessing)

---

## 4. Page-by-page Blueprint

### 4.1 `/` — Home (teacher view)

**Purpose**: 5-second answer to "what classes do I have today and what needs me?"

```
┌─────────────────────────────────────────────────────────────────┐
│ Good morning, Sarah                                             │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│ │ Today       │ │ This week   │ │ Needs you   │                │
│ │  2 classes  │ │  6 sessions │ │  2 reviews  │                │
│ │  Next 16:00 │ │  24 kids    │ │  [open →]   │                │
│ └─────────────┘ └─────────────┘ └─────────────┘                │
│                                                                 │
│ ── Today's classes ──                                           │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ 16:00 — AI Creative Lab · Term 1 · Tuesday               │   │
│ │ 6/6 enrolled · code: WANG-T1 · room: Online              │   │
│ │ [Open class] [Live mode →]                               │   │
│ └──────────────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ 18:30 — Kids OpenCode · Term 1 · Tuesday                 │   │
│ │ 4/6 enrolled · code: CODE-T1 · room: Online              │   │
│ │ [Open class] [Live mode →]                               │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ── Reviews waiting ──                                           │
│ • Mia (AI Creative Lab) wants to share "My Cat Story" → class  │
│ • Leo (Kids OpenCode) wants to share "Pet Game" → public       │
│ [Open review queue →]                                           │
│                                                                 │
│ ── Recent class activity ──                                     │
│ • 12 min ago — Mia finished Mission "Make your AI pet"          │
│ • 18 min ago — Leo stuck on Mission "Add scoring"               │
│ • 1 hr ago — Class "AI Creative Lab" wrapped up                 │
└─────────────────────────────────────────────────────────────────┘
```

**Data sources**:
- `GET /auth/me` — teacher + permitted roles
- `GET /classes?teacher_id=me&date=today` — today's classes
- `GET /reviews?status=pending&teacher_id=me` — pending share requests
- `GET /teacher/recent-activity?limit=10` — feed from class:* rooms (server snapshot)

**Real-time**:
- WS rooms `teacher:<user_id>` + `class:<class_id>` for each owned class
- New review → `approval.new` toast + nav badge bump
- Kid stuck → `class.kid_stuck` toast (only when teacher is in /live for that class)

---

### 4.2 `/classes` — My classes list

```
┌─────────────────────────────────────────────────────────────────┐
│ My Classes                              [+ Create class]        │
│                                                                 │
│ Filter:  [All ▼]  [This term ▼]  [All modes ▼]                  │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ AI Creative Lab — Term 1 · Tuesday 16:00                 │   │
│ │ Course: ai-creative-lab-v1   Mode: Weekly (8 weeks)      │   │
│ │ 6/6 enrolled · Started 2026-05-06 · 3 of 8 sessions done │   │
│ │ Class code: WANG-T1   [QR] [Print roster]                │   │
│ │                                                          │   │
│ │ Today's progress: Mia (M2) · Leo (M3) · Ava (M2) · ...   │   │
│ │ [Open] [Live mode] [Wall]                                │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Kids OpenCode — Term 1 · Tuesday 18:30                   │   │
│ │ Course: kids-opencode-v1   Mode: Weekly (8 weeks)        │   │
│ │ 4/6 enrolled · Started 2026-05-06 · 3 of 8 sessions done │   │
│ │ [Open] [Live mode] [Wall]                                │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ── Past classes (collapsed) ──                                  │
│ [Show 4 past classes ↓]                                         │
└─────────────────────────────────────────────────────────────────┘
```

**API**: `GET /classes?teacher_id=me&include=enrollment_count,next_session`

---

### 4.3 `/classes/new` — Create class wizard

```
Step 1 — Pick a course pack
  ┌──────────────────────────────────────────┐
  │ Which course will you teach?             │
  │                                          │
  │ ● ai-creative-lab-v1  (6-11, 8 missions) │
  │ ○ kids-opencode-v1    (12+, 10 missions) │
  │ ○ workshop-bot-day    (10-14, 1 day)     │
  │                                          │
  │ [Next →]                                 │
  └──────────────────────────────────────────┘

Step 2 — Delivery mode + schedule
  ┌──────────────────────────────────────────┐
  │ Delivery mode                            │
  │ ● Weekly term (8-10 weeks)               │
  │ ○ Holiday intensive (3-5 days)           │
  │ ○ School partnership (year-long)         │
  │ ○ One-off workshop (1-3 days)            │
  │                                          │
  │ Schedule                                 │
  │ Start date:  [2026-06-03 ▼]              │
  │ End date:    [2026-07-29 ▼]   (8 weeks)  │
  │ Day:         [Tuesday ▼]                 │
  │ Time:        [16:00 ▼] - [17:30 ▼] AEST  │
  │                                          │
  │ [← Back] [Next →]                        │
  └──────────────────────────────────────────┘

Step 3 — Capacity + Stars
  ┌──────────────────────────────────────────┐
  │ Class capacity                           │
  │ Max students:    [6]                     │
  │                                          │
  │ Workshop Stars per kid                   │
  │ ( ) None — kids use family Stars only    │
  │ (•) Seed [50] ⭐ per enrolled kid         │
  │     (charged to your teacher org budget) │
  │                                          │
  │ [← Back] [Next →]                        │
  └──────────────────────────────────────────┘

Step 4 — Confirm + generate class code
  ┌──────────────────────────────────────────┐
  │ Class summary                            │
  │ Name: [AI Creative Lab — Term 2 Tue ____]│
  │ ...                                      │
  │                                          │
  │ A 6-char class code will be generated.   │
  │ Kids use it (with PIN) for one-shot login│
  │ at workshops or by-invite enrolments.    │
  │                                          │
  │ [← Back] [Create class]                  │
  └──────────────────────────────────────────┘
```

**API**:
- `GET /course-packs?is_published=true` — Step 1
- `POST /classes` — Step 4 with full payload (see Class schema in platform-backend-api-spec.md §4.3)

After creation → redirect to `/classes/:id` with class code visible + "Invite kids" CTA.

---

### 4.4 `/classes/:id` — Class detail

```
┌─────────────────────────────────────────────────────────────────┐
│ ← My Classes                                                    │
│                                                                 │
│ AI Creative Lab — Term 1 · Tuesday 16:00       [Edit] [⋯ More] │
│ ────────────────────────────────────────────────────────────── │
│                                                                 │
│ ┌─ Class essentials ──────────────────────────────────────┐    │
│ │ Class code: WANG-T1     [Copy] [QR] [Print kid cards]   │    │
│ │ Course: ai-creative-lab-v1 (8 missions)                 │    │
│ │ Mode: Weekly · 8 sessions · 3 done · 5 remaining        │    │
│ │ Schedule: Tuesdays 16:00-17:30 AEST                     │    │
│ │ Workshop credit: 50⭐ per kid (300⭐ seeded total)        │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ┌─ Roster (6/6) ──────────────────────────────────────────┐    │
│ │ Name      Age   Family       Status        Progress     │    │
│ │ ────────────────────────────────────────────────────    │    │
│ │ Mia       10    The Wangs    🟢 Active     M3 (38%)     │    │
│ │ Leo       13    The Wangs    ⚪ Idle       M2 (25%)     │    │
│ │ Ava       11    The Smiths   🟢 Active     M3 (40%)     │    │
│ │ Noah      9     The Patels   ⚠ Stuck 12m   M1 (12%)     │    │
│ │ Lily      10    The Chens    🟢 Active     M2 (33%)     │    │
│ │ Sam       11    The Garcias  ⚪ Idle       M2 (30%)     │    │
│ │                                                         │    │
│ │ [+ Add student]  [Drop student]  [Export roster]        │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ┌─ This session ──────────────────────────────────────────┐    │
│ │ Session 4 — Tuesday 2026-05-27 16:00                    │    │
│ │ [Start live mode →]                                     │    │
│ │ Lesson notes: "Today we wrap up Mission 3, kids who     │    │
│ │ finished early can preview Mission 4."                  │    │
│ │ [Edit notes]                                            │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ── Sections ──                                                  │
│ [Live mode]  [Class wall]  [Class audit]  [Session history]    │
└─────────────────────────────────────────────────────────────────┘
```

**API**:
- `GET /classes/:id?include=enrollments,course_pack`
- `GET /classes/:id/enrollments?include=kid,progress`
- `GET /classes/:id/sessions` (V1+ — session model not in V0 schema)

---

### 4.5 `/classes/:id/live` — Live class mode ⭐

> **This is the killer feature**. Teacher opens this 5 min before class, leaves it open for the whole 90 min. Real-time per-kid status, one-glance "who's stuck", one-click intervention.

```
┌─────────────────────────────────────────────────────────────────┐
│ ◀ AI Creative Lab · Term 1 · Session 4                          │
│                                                                 │
│ ⏱ 16:18  ·  Class started 18 min ago  ·  ⏸ [Pause class]       │
│                                                                 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│ │ 🧒 Mia        │ │ 🧑 Leo        │ │ 🧒 Ava        │             │
│ │ 🟢 Working    │ │ ⚪ Idle 3 min │ │ 🟢 Working    │             │
│ │ Mission 3    │ │ Mission 2    │ │ Mission 3    │             │
│ │ "Cat scene"  │ │ "Pet game"   │ │ "Robot art"  │             │
│ │ Step 3 of 5  │ │ Step 2 of 4  │ │ Step 4 of 5  │             │
│ │ 14⭐ used    │ │ 8⭐ used     │ │ 12⭐ used    │             │
│ │ [Peek] [Help]│ │ [Peek] [Help]│ │ [Peek] [Help]│             │
│ └──────────────┘ └──────────────┘ └──────────────┘             │
│                                                                 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│ │ 🧒 Noah       │ │ 🧒 Lily       │ │ 🧒 Sam        │             │
│ │ ⚠ STUCK 14m  │ │ 🟢 Working    │ │ ⚪ Idle 8 min │             │
│ │ Mission 1    │ │ Mission 2    │ │ Mission 2    │             │
│ │ Step 1 of 3  │ │ Step 3 of 4  │ │ Step 2 of 4  │             │
│ │ "image gen   │ │ "Penguin TTS"│ │ "Birthday"   │             │
│ │  rejected ×3"│ │              │ │              │             │
│ │ [Peek] [Help]│ │ [Peek] [Help]│ │ [Peek] [Help]│             │
│ └──────────────┘ └──────────────┘ └──────────────┘             │
│                                                                 │
│ ── Live feed ── (auto-tail)                                     │
│ 16:18 — Mia finished step 3 of Mission 3                        │
│ 16:17 — Noah image gen rejected (moderation: "unsafe content")  │
│ 16:14 — Leo paused, hasn't moved in 3 min                       │
│ 16:13 — Ava generated TTS "robot voice intro"                   │
│ ...                                                             │
└─────────────────────────────────────────────────────────────────┘
```

**Status logic**:
- 🟢 **Working** — last action <60s ago
- ⚪ **Idle** — last action 1-10 min ago
- ⚠ **Stuck** — last action >10 min ago AND last action was a failure/error OR mission hasn't progressed in 15 min
- 🔴 **Moderation** — most recent action was a moderation rejection (clickable to see what)
- 💤 **Offline** — WS disconnected >2 min

**"Peek"**: opens a side-drawer showing the kid's current screen (read-only snapshot of project + recent agent transcript). **No keystroke logging** — only artifacts and Stars events.

**"Help"**: opens a side-drawer with the kid's mission step + last 5 audit events + a "Nudge" button (sends a WS event to kid's UI: "Sarah is nudging you — need help?"). **Not a private chat channel** (V0 keeps comms via the kid's normal class room, no DMs).

**WS subscriptions**:
- `class:<class_id>` — receives `class.kid_progress`, `class.kid_stuck`, `agent.stream.done` (filtered to class kids)
- Heartbeat every 30s

**API**:
- `GET /classes/:id/live-state` — initial snapshot
- WS for live updates (see platform-backend-api-spec.md §6)

---

### 4.6 `/classes/:id/students/:kid` — Per-student detail

```
┌─────────────────────────────────────────────────────────────────┐
│ ◀ AI Creative Lab Roster                                        │
│                                                                 │
│ 🧒 Mia, 10 · The Wang Family                                    │
│ ──────────────────────────────────────────────────────────────  │
│                                                                 │
│ ┌─ Progress in this class ────────────────────────────────┐    │
│ │ ai-creative-lab-v1                                      │    │
│ │ Mission 1 ✓ done       (5⭐ used)                        │    │
│ │ Mission 2 ✓ done       (8⭐ used)                        │    │
│ │ Mission 3 ▸ in progress (step 3/5, 14⭐ used)            │    │
│ │ Mission 4 ○ locked                                      │    │
│ │ ...                                                     │    │
│ │ Total Stars this class: 27⭐                              │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ┌─ Recent projects ───────────────────────────────────────┐    │
│ │ • My Cat Story (in progress · 5 images · 1 audio)       │    │
│ │ • Birthday Card for Grandma (submitted · pending review) │    │
│ │ [Open project] [View artifacts]                         │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ┌─ Audit feed (last 50 events) ───────────────────────────┐    │
│ │ 16:18 — agent.tool.write: cat-scene.png                 │    │
│ │ 16:17 — wallet.spend: -2⭐ (image gen)                   │    │
│ │ 16:14 — agent.plan: "I will generate a cat picture..."  │    │
│ │ 16:12 — mission.step.complete: 2/5                      │    │
│ │ [Show all →]                                            │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ── Teacher actions ──                                           │
│ [Nudge Mia]  [Mark concern]  [Notify parent]                   │
│                                                                 │
│ ⓘ You cannot see Mia's parent contact, wallet balance, or       │
│   topic limits — those live in Parent Portal.                   │
└─────────────────────────────────────────────────────────────────┘
```

**Privacy boundary**: teachers see kid progress + projects + class-scoped audit, **never** see:
- Parent email / phone
- Wallet balance / cap settings
- Topic-limit configuration
- Activity in other classes (unless teacher is also instructor there)
- Family-wide audit feed

Backend enforces this — `GET /kids/:id` with role=teacher returns a redacted view (see platform-backend-api-spec.md §5.3, "RBAC enforcement" §3.4).

---

### 4.7 `/reviews` — Share request queue ⭐

```
┌─────────────────────────────────────────────────────────────────┐
│ Reviews                                  2 pending · 8 this week│
│                                                                 │
│ Filter: [All ▼] [My classes ▼] [Pending ▼]                      │
│                                                                 │
│ ── Pending (2) ── needs your review ──                          │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ Mia (10) — AI Creative Lab · Term 1                      │    │
│ │ Project: "My Cat Story"  →  CLASS visibility             │    │
│ │ ─────────────────────────────────────────                │    │
│ │ Artifacts: 5 images, 1 audio (TTS narration), 1 story    │    │
│ │ Mission acceptance: passed                               │    │
│ │ Auto-moderation: ✓ no issues flagged                     │    │
│ │ [Preview project →]                                      │    │
│ │                                                          │    │
│ │ Approve to make this visible on the class wall.          │    │
│ │ Parent has already pre-consented to class-wall sharing.  │    │
│ │                                                          │    │
│ │ [Optional note to parent + kid]                          │    │
│ │ [────────────────────────────────────]                   │    │
│ │                                                          │    │
│ │ [✓ Approve] [✕ Reject + feedback]                        │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ Leo (13) — Kids OpenCode · Term 1                        │    │
│ │ Project: "Pet Game"  →  PUBLIC visibility (web)          │    │
│ │ ─────────────────────────────────────────                │    │
│ │ ⚠ This requires BOTH teacher AND parent approval.        │    │
│ │ Parent: ⏳ not yet decided                                │    │
│ │ Teacher: ⏳ awaiting your review                          │    │
│ │ [Preview project →]                                      │    │
│ │ [✓ Approve] [✕ Reject]                                   │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ── Resolved this week (8) ──                                    │
│ ✓ Mon — Ava · "Robot Art" → class (approved by you)             │
│ ✕ Mon — Noah · "Scary Story" → class (rejected: violence)       │
│ ...                                                             │
└─────────────────────────────────────────────────────────────────┘
```

**Decision rules**:
- `target_visibility=class` → teacher-only review (parent pre-consents when enrolling kid in class)
- `target_visibility=public` → **double consent** — both teacher AND parent must approve; if either rejects, request closes

**API**:
- `GET /reviews?status=pending&teacher_id=me` (alias for `share-requests` filtered to teacher's classes)
- `POST /share-requests/:id/teacher-review` `{ decision: 'approved'|'rejected', note? }`

**WS**: `approval.new` event when a new share request lands in a teacher's class.

---

### 4.8 `/students` — All my students (across classes)

```
┌─────────────────────────────────────────────────────────────────┐
│ My Students                                Search: [_________]  │
│                                                                 │
│ Filter: [All classes ▼]  [Any status ▼]                         │
│                                                                 │
│ Name    Age  Classes              Status      Last seen         │
│ ──────────────────────────────────────────────────────────      │
│ Ava     11   AI Creative Lab T1   🟢 Active   2 min ago         │
│ Leo     13   Kids OpenCode T1     ⚪ Idle     2 days ago        │
│ Lily    10   AI Creative Lab T1   🟢 Active   5 min ago         │
│ Mia     10   AI Creative Lab T1   🟢 Active   30 sec ago        │
│ Noah    9    AI Creative Lab T1   ⚠ Stuck    14 min ago         │
│ Sam     11   AI Creative Lab T1   ⚪ Idle     8 min ago         │
│ ...                                                             │
│ [Load more]                                                     │
└─────────────────────────────────────────────────────────────────┘
```

Same privacy boundary as 4.6 — no parent contact, no wallet, no topic limits.

---

### 4.9 `/course-packs` — Browse (read-only for teachers)

```
┌─────────────────────────────────────────────────────────────────┐
│ Course Packs                                                    │
│                                                                 │
│ Filter: [All ▼]  [Line A ▼]  [Line B ▼]                         │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ ai-creative-lab-v1     Line A · 6-11 · 8 missions        │   │
│ │ Hands-on AI image / music / story for younger kids.      │   │
│ │ Avg Stars per course: 40⭐                                │   │
│ │ Published v1.0.0                                         │   │
│ │ [Open]                                                   │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ kids-opencode-v1       Line B · 12+ · 10 missions        │   │
│ │ Agentic coding with multi-file projects.                 │   │
│ │ Avg Stars per course: 80⭐                                │   │
│ │ Published v1.0.0                                         │   │
│ │ [Open]                                                   │   │
│ └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

Click → mission list with content preview. **Teachers cannot edit** in V0 — admin-only.

---

### 4.10 `/admin` — Admin home

**Visible only to `admin` + `super_admin`.**

```
┌─────────────────────────────────────────────────────────────────┐
│ Admin Home                                                      │
│                                                                 │
│ ── Today ──                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│ │ Active fams │ │ Stars sold  │ │ Incidents   │                │
│ │    142      │ │  A$ 1,240   │ │     1       │                │
│ │ ↑ 8 wow     │ │ ↑ 12% wow   │ │ [open →]    │                │
│ └─────────────┘ └─────────────┘ └─────────────┘                │
│                                                                 │
│ ── Recent admin actions ──                                      │
│ • 10:14 — admin.wallet.adjust: family fam_xyz +20⭐ (refund)    │
│ • 09:48 — admin.kid.suspend: kid_abc (moderation incident)     │
│ • 09:14 — admin.refund.issued: A$30 to family fam_def          │
│                                                                 │
│ ── Quick actions ──                                             │
│ [🔍 Find a family]  [💰 Adjust wallet]  [💳 Issue refund]      │
│ [🚨 View incidents]  [📦 Course pack authoring]                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.11 `/admin/families` — Family search + detail

```
┌─────────────────────────────────────────────────────────────────┐
│ Families                            Search: [email or name___]  │
│                                                                 │
│ Family           Primary email           Kids  Stars   Region   │
│ ─────────────────────────────────────────────────────────────   │
│ The Wang Family  lightman@example.com    2     42⭐    AU       │
│ The Smith Fam.   smith@example.com       1     18⭐    AU       │
│ ...                                                             │
│ [Load more]                                                     │
└─────────────────────────────────────────────────────────────────┘
```

Click → `/admin/families/:id` (full family view: kids, wallet, audit, payments, support notes). Cross-references same data the parent sees in their Portal, but **read-only** unless admin chooses an action (adjust wallet, suspend kid, issue refund).

**API**: `GET /admin/families?q=...` (admin-scoped search).

Every admin write action emits `AuditEvent` with `actor=admin` (see platform-backend-api-spec.md §3.4, §5.12).

---

### 4.12 `/admin/wallet/adjust` — Manual Stars adjustment

```
┌─────────────────────────────────────────────────────────────────┐
│ Adjust wallet                                                   │
│                                                                 │
│ Family:    [fam_xyz — The Wang Family ▼]                        │
│ Current balance: 42⭐                                            │
│                                                                 │
│ Adjustment:  [+] [20] ⭐                                         │
│                                                                 │
│ Reason (required):                                              │
│ ( ) Refund (paired with Airwallex refund)                       │
│ (•) Comp (apology / customer support)                           │
│ ( ) Workshop credit (manual seeding)                            │
│ ( ) Other                                                       │
│                                                                 │
│ Note (audited):                                                 │
│ [Customer support ticket #1234. Image gen failed 3× on a paid  │
│  request, refunded 20⭐ goodwill.                              ]│
│                                                                 │
│ [Apply adjustment]                                              │
│                                                                 │
│ ⓘ This action is logged with your user ID and reason. Visible  │
│   to the family in their wallet transaction history.            │
└─────────────────────────────────────────────────────────────────┘
```

**API**: `POST /admin/wallet/:wallet_id/adjust { delta_stars, reason, note }`.

---

### 4.13 `/admin/incidents` — Incident feed

```
┌─────────────────────────────────────────────────────────────────┐
│ Incidents                                                       │
│                                                                 │
│ Filter: [Active ▼]  [Last 7 days ▼]  [All severities ▼]         │
│                                                                 │
│ ── Active (1) ──                                                │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ 🚨 Severity HIGH — Moderation spike                      │    │
│ │ Family fam_xyz · kid Noah                                │    │
│ │ 5 moderation rejections in 10 min on "violence" topic.   │    │
│ │ Started 14 min ago.                                      │    │
│ │                                                          │    │
│ │ Actions:                                                 │    │
│ │ [Open family] [View audit] [Suspend kid]                 │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ── Resolved (last 7 days) ──                                    │
│ ✓ Yesterday — Family fam_abc paused by parent (resolved)        │
│ ✓ 2 days ago — DeepRouter 502 spike (resolved by autoscale)     │
└─────────────────────────────────────────────────────────────────┘
```

V0 incident sources (✅ shipped — `IncidentsService.checkOnAuditEvent`):
- ✅ Moderation rejection spike per kid (≥3 in 10 min) → HIGH + parent banner via WS
- 🟡 DeepRouter error rate >5% over 5 min (system-level) — schema supports `deeprouter_errors` kind; detection rule deferred to V0.1
- ✅ Stars wallet anomaly (single kid > 50⭐ in 10 min) → MEDIUM
- ✅ Family `paused=true` set via panic action → LOW (informational, dedup'd)

**API** (✅ V0 live):
- `GET /admin/incidents` — list with `status=active|resolved|all`, `kind`, `family_id`, `since` filters
- `POST /admin/incidents` — manual open
- `POST /admin/incidents/:id/resolve` — resolve with note (idempotent)

**WS**:
- `admin:global` room receives `incident.opened` on every new incident
- `family:<id>` room receives `family.incident_opened` ONLY on HIGH severity (avoids parent banner spam)

---

### 4.14 `/admin/course-packs` — Course pack authoring

> Admin-only. Full CRUD on CoursePack + Mission. Imports content_md from the curriculum repo (see V1+ note).
>
> **Authoring scope** (per `learn-missions-prd.md` §9): V0/V1 — admin only; teachers do not have create/edit access to this page. V2 — institution admins may build `CurriculumBundle`s from this catalog via the institution surface (see `institution-prd.md`); they still cannot edit Missions. V3+ — teacher authoring with a pre-publish review queue rendered above this list.
>
> **Publish requires TOTP step-up** (D-M8 / super-admin-prd.md §3.2) — `POST /course-packs/:id/publish` is gated even for admin role; pressing **Publish** opens the `<StepUpGate>` modal.
>
> **Reference example to clone**: [`coursepack-ai-pet-lab-prd.md`](./coursepack-ai-pet-lab-prd.md) is the V0 launch pack and the canonical template for any new Course Pack. The editor should ship with "Create from template — AI Pet Lab" as the default new-pack flow.

```
┌─────────────────────────────────────────────────────────────────┐
│ Course Pack Authoring                       [+ New course pack] │
│                                                                 │
│ ai-creative-lab-v1     Published 1.0.0   8 missions             │
│ kids-opencode-v1       Published 1.0.0   10 missions            │
│ workshop-bot-day       Draft             1 mission              │
│                                                                 │
│ [Open] [Duplicate] [Publish] [Archive]                          │
└─────────────────────────────────────────────────────────────────┘
```

V0: basic form-driven CRUD. V1+: pipeline-driven sync from curriculum repo (see Open Questions §11).

---

### 4.15 `/admin/refunds` — Airwallex refund

```
┌─────────────────────────────────────────────────────────────────┐
│ Issue refund                                                    │
│                                                                 │
│ Find payment:   [airwallex payment ID or family email_____]     │
│                                                                 │
│ ┌─ Payment found ─────────────────────────────────────────┐    │
│ │ Payment: aw_pi_xxx                                       │    │
│ │ Family: The Wang Family                                  │    │
│ │ Amount: A$30.00   Stars credited: 30⭐                   │    │
│ │ Paid: 2026-05-12 14:23                                   │    │
│ │ Status: succeeded                                        │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ Refund amount:  [● Full A$30.00]  [○ Partial A$_____]           │
│ Reverse Stars:  [☑] yes (deduct 30⭐ from wallet)               │
│                                                                 │
│ Reason (required):                                              │
│ [_____________________________________________]                 │
│                                                                 │
│ [Issue refund via Airwallex]                                    │
│                                                                 │
│ ⓘ Refunds settle 5-10 business days. Stars deducted instantly. │
│   If wallet balance < refund Stars, balance can go negative     │
│   (admin override).                                             │
└─────────────────────────────────────────────────────────────────┘
```

**API**: `POST /admin/families/:id/refund { payment_id, amount_aud_cents, reverse_stars, reason }`.

---

### 4.16 `/admin/system` — Super-admin only

V0 surfaces:
- Raw audit query interface (filter by `event_type`, date range, family, kid)
- "Impersonate" — generate a one-shot login as a specific user (for support diagnosis, 15-min TTL, fully audited)
- System health summary (DeepRouter up, Neon connection, S3 latency)
- Manual `prisma migrate` log viewer (read-only)

Every super-admin action emits AuditEvent with `actor=super_admin` and is **redacted from the standard admin audit view** (only super-admins can see other super-admin actions, prevents collusion exposure).

---

## 5. Live mode state machine

Per-kid status derived from the latest events in the `class:<class_id>` WS feed:

```
                       ┌─────────────┐
                       │  OFFLINE    │  (WS disconnected >2 min)
                       └─────────────┘
                              │ (reconnect)
                              ▼
                       ┌─────────────┐
                       │  CONNECTED  │  initial state on (re)join
                       └─────────────┘
                              │ (first user action)
                              ▼
       ┌──────────────────────────────────────────────────┐
       │                                                  │
       ▼                                                  ▼
┌─────────────┐                              ┌─────────────────┐
│   WORKING   │ ← last action <60s ago →     │   MODERATION    │
└─────────────┘                              │  (latest event  │
       │  no action 1-10 min                 │   was a reject) │
       ▼                                     └─────────────────┘
┌─────────────┐                                       │
│    IDLE     │                                       │
└─────────────┘                                       │
       │  no progress 15 min OR >3 failures 10 min    │
       ▼                                              │
┌─────────────┐                                       │
│   STUCK     │ ←─────────────────────────────────────┘
└─────────────┘  (stuck overrides moderation badge)
```

Backend emits `class.kid_stuck` server-side when the stuck transition fires, so teachers get a push toast even if they're not staring at the grid.

---

## 6. Notifications

| Trigger | Channel | Recipient |
|---|---|---|
| New share request lands in your class | In-app toast + WS | Teacher (class owner) |
| Share request approved/rejected by parent (for public) | In-app toast | Teacher who approved |
| Class starts in 15 min | In-app toast + email (opt-in) | Teacher (class owner) |
| Kid stuck >15 min in your live class | In-app toast | Teacher (only when in /live) |
| Incident escalated to you | Email + in-app | Admin / super_admin |
| Refund issued by another admin | In-app activity feed | All admins (visibility) |

All toggles in `/profile` → Notifications.

---

## 7. Privacy & RBAC summary

| Resource | Teacher | Admin | Super-admin |
|---|---|---|---|
| Own class roster | ✓ | ✓ | ✓ |
| Other teachers' class rosters | ✗ | ✓ | ✓ |
| Kid display name + age + class progress | ✓ | ✓ | ✓ |
| Kid real name / DOB | ✗ | ✓ | ✓ |
| Parent email / phone | ✗ | ✓ | ✓ |
| Wallet balance + caps + transactions | ✗ | ✓ | ✓ |
| Topic limits config | ✗ | ✓ | ✓ |
| Family-wide audit (all kids, all projects) | ✗ | ✓ | ✓ |
| Class-scoped audit | ✓ | ✓ | ✓ |
| Project content (only if visibility ≥ class for own class) | ✓ | ✓ | ✓ |
| Approve share requests | ✓ (own class) | ✓ | ✓ |
| Adjust wallet / issue refund | ✗ | ✓ | ✓ |
| Suspend kid (emergency) | ✗ | ✓ | ✓ |
| Edit course packs | ✗ | ✓ | ✓ |
| Cross-family audit search | ✗ | ✓ | ✓ |
| Impersonate user | ✗ | ✗ | ✓ |
| View other super-admins' actions | ✗ | ✗ | ✓ |

Backend enforces all of the above; client-side gating is for UX only (see §3.4).

---

## 8. Tech stack & dependencies

| Concern | Choice |
|---|---|
| Build | Vite 5 + React 18 + TypeScript strict |
| Styling | Tailwind CSS + shadcn/ui primitives |
| Routing | React Router v6 |
| State (server) | TanStack Query |
| State (client) | Zustand (small, role-aware UI state) |
| Forms | react-hook-form + zod |
| WS client | Native WebSocket + thin reconnect helper |
| Auth client | Bearer token from refresh cookie; silent refresh on 401 |
| Tables / grids | TanStack Table |
| Date / time | date-fns + date-fns-tz (timezone-aware) |
| Charts (admin) | Recharts |
| Testing | Vitest + React Testing Library + Playwright for live mode |

**Bundle target**: <1MB gz initial; admin section lazy-loaded.

**Hosting**: AWS S3 + CloudFront (ap-southeast-2). CloudFront cache behavior: SPA fallback on 404 → `/index.html` with 0-cache; static assets 1-year immutable cache.

---

## 9. Out of scope (V0)

- ❌ Per-kid private chat (DM with teacher) — communications stay class-wide; V1+ if needed
- ❌ Teacher self-signup — admin invitation only
- ❌ Multi-school org accounts — V1 when first B2B school contract requires
- ❌ Lesson plan editor / curriculum authoring inside the console — course-pack content lives in the curriculum pipeline
- ❌ Mobile-app version — responsive web only V0; teachers run live mode on laptops
- ❌ Video conferencing built-in — teachers use their own Zoom / Google Meet, console runs alongside
- ❌ Attendance tracking (separate from class.kid_progress) — V1+
- ❌ Grading / rubrics (beyond mission acceptance) — V1+
- ❌ Export to LMS (Canvas / Google Classroom) — V1+
- ❌ Public marketing pages (teacher landing, sign-up) — those live on `airbotix.ai`

---

## 10. Success criteria (V0)

| # | Metric | Target |
|---|---|---|
| S1 | Teacher can create a class in <2 min from `/classes/new` | 90% of test teachers |
| S2 | Live mode latency from kid action → teacher card update | p95 <2s |
| S3 | Teacher correctly identifies stuck kid within 60s of stuck flag firing | 80% in user test |
| S4 | Share request decision (approve/reject) <30s end-to-end | 90% of cases |
| S5 | Admin can find a family by email and adjust wallet in <60s | 100% |
| S6 | Console initial JS bundle | <1MB gz |
| S7 | Console FCP on cold load (Sydney) | <1.5s |
| S8 | Zero PII leakage to teacher role in penetration test | Required |

---

## 11. Open questions

| # | Q | Impact |
|---|---|---|
| Q1 | Does the teacher need to see a kid's project content (artifacts) when the kid hasn't yet share-requested to class? "Peek" in live mode implies yes, but this leans against minor-privacy norms. | Affects 4.5 "Peek" feature scope |
| Q2 | Should `super_admin` actions be visible to other `super_admin`s but not `admin`? Drafted yes (§4.16) but creates an audit blind spot for admin-tier ops. | Compliance / governance review needed |
| Q3 | Class-code distribution: QR posted in the classroom, printed kid login cards mailed, parent-portal-shared link, or all three? | Affects `qr_payload` schema in Class + Print roster UX (§4.4) |
| Q4 | Workshop credit Stars: charge to which budget? Teacher org account (B2B), or a system "ops" account refunded by an invoice run? | Affects WalletTransaction.reason + admin onboarding flow |
| Q5 | Should course-pack authoring be admin-form-driven (V0 draft above) or pull from the curriculum repo via webhook (cleaner long-term)? Note: the teacher-authoring branch of this question is now **closed** per `learn-missions-prd.md` D-M6 — teachers do not author at V1. | Affects §4.14 design + ops workflow (admin-only scope) |
| Q6 | V0 stuck detection is heuristic (no-progress 15 min). Should we also surface an in-mission "kid clicked Help button" signal? | Requires `/learn/*` UI to add Help button + new audit event type |
| Q7 | Does the teacher need a "rewind class" view (replay first 15 min of last week's class)? Useful for relief teachers picking up a class. | V0 stub with class audit feed; V1+ proper player |
| Q8 | Multi-region: when AU compliance allows DR replicas, do teacher-console reads hit a Sydney read replica or always primary? | Affects live-mode latency on AU east coast vs Perth |

---

## 12. Implementation hooks (for scaffold)

When scaffolding starts in `Airbotix-AI/teacher-console`:

```
src/
├── app/                     # router, providers, role gates
├── auth/                    # OTP login, refresh, RoleGate component
├── pages/
│   ├── home/
│   ├── classes/
│   │   ├── list/
│   │   ├── new/
│   │   ├── detail/
│   │   ├── live/            # the killer feature — isolated for perf testing
│   │   └── student-detail/
│   ├── reviews/
│   ├── students/
│   ├── course-packs/
│   ├── profile/
│   └── admin/
│       ├── home/
│       ├── families/
│       ├── wallet-adjust/
│       ├── incidents/
│       ├── course-packs/
│       ├── refunds/
│       └── system/          # super_admin only
├── components/
│   ├── nav/                 # role-aware drawer
│   ├── kid-card/            # live mode card
│   ├── audit-feed/          # shared with parent portal style
│   └── share-request-card/
├── hooks/
│   ├── useAuth.ts
│   ├── useWebSocket.ts      # class:* + teacher:* room subscriptions
│   ├── useClassLiveState.ts # combines REST snapshot + WS deltas
│   └── useRoleGate.ts
├── lib/
│   ├── api.ts               # typed fetch client (zod-validated responses)
│   ├── ws.ts                # reconnect helper
│   └── time.ts              # tz-aware formatters
└── styles/
```

Recommended bootstrap:

```bash
npm create vite@latest teacher-console -- --template react-ts
cd teacher-console
npm i react-router-dom @tanstack/react-query @tanstack/react-table \
      zod react-hook-form zustand date-fns date-fns-tz \
      tailwindcss postcss autoprefixer recharts
npm i -D vitest @testing-library/react @playwright/test
```

Domain config (CloudFront origin → S3 bucket):
- Bucket: `teacher-console-prod` (ap-southeast-2)
- Distribution: `teacher.airbotix.ai`, ACM cert in us-east-1 covering `*.airbotix.ai`
- DNS: Cloudflare CNAME `teacher` → CloudFront distribution domain

---

## 13. References

- `platform-backend-api-spec.md` — API contract (Classes §5.5, Reviews §5.7, Audit §5.8, Admin §5.12, WS §6)
- `parent-portal-prd.md` — sibling SPA on `app.airbotix.ai/portal/*`; share request flow ends in parent's queue when public visibility
- `airbotix-app-learn-prd.md` — kid surface that emits `class.kid_progress` events the teacher sees in live mode
- `auth-system-prd.md` — login / OTP / refresh / kid-token flow
- `kids-ai-platform-prd.md` §6.4 — class & teacher workflow strategic context
- `docs/product/compliance/minors-compliance.md` — PII redaction rules enforced at teacher role
