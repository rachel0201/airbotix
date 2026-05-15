# Kid Learn Surface — airbotix-app `/learn/*` — PRD

> **Status**: Draft v0.1 · 2026-05-15
> **Repo**: `Airbotix-AI/airbotix-app` (React + Vite SPA, same as Parent Portal)
> **Domain**: `app.airbotix.ai`
> **Author**: Airbotix engineering
> **Depends on**: `platform-backend-api-spec.md` · `parent-portal-prd.md` (same SPA, shared auth)

---

## 1. Purpose

`/learn/*` is **where kids actually make things**. It's the cloud creative surface for ages 8-11 (Line A AI Creative Lab), plus an on-ramp for 12+ kids who'll eventually graduate to Kids OpenCode desktop.

Key constraints baked into every decision:
- **Kid-safe by design** — no open chat, all flows mission-driven, every action audited to parent dashboard
- **Big, visual, low text** — 8-11 audience can't read dense UIs
- **Always show progress** — kids need feedback every 5 seconds
- **Stars are visible but not scary** — kids see "this will cost 2⭐", but never see balance bottoming out unexpectedly (the soft-stop + approval flow handles that)

What this surface **doesn't** do:
- ❌ AI Coding (Kids OpenCode local desktop tool, separate AI agent)
- ❌ Robotics (workshop/in-school only)
- ❌ Open-ended chat with AI (everything is inside Missions)

---

## 2. Information Architecture

```
app.airbotix.ai (same domain as /portal/*)

Public:
├── /learn/login                    Kid-friendly login (family-code + nickname + PIN)
├── /learn/login/class-code         One-shot login via 6-char class code

Authenticated (kid token):
├── /learn                          Home — today's classes + missions + recent work
├── /learn/missions                 Browse Course Pack + Missions
├── /learn/missions/:slug           Mission detail / start
│
├── /learn/create/image             Image creation flow (in or out of a Mission)
├── /learn/create/story             Story writing flow
├── /learn/create/music             Music generation flow
├── /learn/create/video             Short video / animation flow
├── /learn/create/voice             TTS / voice flow
│
├── /learn/projects                 My Works (portfolio)
├── /learn/projects/:id             Single project workspace
│
├── /learn/classroom                Class Wall (browse class peers' work)
├── /learn/classroom/:classId       Specific class wall
│
└── /learn/help                     Help / how to ask parent / contact teacher
```

### Top navigation (kid-tuned)

```
Logo  · 🎨 Make  · 📂 My Works  · 🏫 Classroom  · ⭐ 14    Mia 🧒 ▼
```

(Stars balance always visible. Avatar opens kid menu: switch profile / logout / ask parent.)

### Mobile / tablet (target ages 8-11 often on iPad)

Bottom tab bar:
```
[🎨 Make] [📂 My Works] [🏫 Class] [⭐ Stars] [🧒 Me]
```

---

## 3. Age-aware UI Rules

| | Ages 8-11 (default) | Ages 12+ (auto-detected from KidProfile.age) |
|---|---|---|
| Type size | 16-20px body, 28-32px headings | 14-16px body, 22-28px headings |
| Icon-to-text ratio | 60/40 icons leading | 40/60 text leading |
| Mission steps | one "card" at a time, big "Next" button | sidebar shows full mission, can jump steps |
| Color saturation | full DESIGN.md saturation (coral / bubblegum / sunshine all dialed up) | slightly muted (more sky / mint / ink) |
| Reading level | Grade 3-4 (Hemingway target) | Grade 6-8 |
| Star cost display | "This will cost ⭐⭐ (2 Stars)" | "Cost: 2⭐" |
| Cancel button | "Oops, never mind" | "Cancel" |
| Error tone | "Hmm, something went wrong — let's try again!" | "Error: please retry" |

UI mode flag derived once on session start from `KidProfile.age`. Stored in client state, never sent back.

---

## 4. Kid Login Flow

### 4.1 Standard login (family at home)

```
/learn/login

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              🐰  Welcome to Airbotix!                           │
│              ─────────────────                                  │
│                                                                 │
│   Family code:    [W][A][N][G]                                  │
│                                                                 │
│   Who are you?    ┌─────┐ ┌─────┐                              │
│                   │ 🧒  │ │ 🧑  │                              │
│                   │ Mia │ │ Leo │   [+ I'm not here]           │
│                   └─────┘ └─────┘                              │
│                                                                 │
│   Type your PIN:  [_][_][_][_]                                  │
│                                                                 │
│              [Let's go! →]                                      │
│                                                                 │
│   Need help? Ask a parent to log in at app.airbotix.ai/portal  │
└─────────────────────────────────────────────────────────────────┘
```

- Family code = 4-char family identifier (parent sets at registration)
- Kid picks own avatar (loaded after family code entered → backend returns list of nickname+avatar)
- PIN = 4 digits (set by parent in /portal/family/:kidId)
- 5 wrong PIN attempts → cooldown 5min + parent notified

### 4.2 Class code login (workshop / classroom)

```
/learn/login/class-code

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   📚  Joining a class?                                          │
│                                                                 │
│   Class code:     [C][L][3][7][2][R]                            │
│                                                                 │
│   Your nickname:  [_______________]                             │
│                                                                 │
│              [Join class →]                                     │
└─────────────────────────────────────────────────────────────────┘
```

- 6-char one-shot code (teacher generates)
- Creates a transient session bound to that class + nickname (no Family Account)
- Workshop-credit Stars seeded from class config (e.g. 20⭐ for the day)
- Session expires when class ends OR after 8 hours
- Parent post-class can claim this session into a Family Account (covered in workshop flow)

### 4.3 Session

- Kid JWT has shorter TTL (8 hours; auto-renew while active; logout on idle 30min)
- Kid session ALWAYS shows nav bar with parent contact ("Ask my parent →")

---

## 5. Page-by-page Blueprints

### 5.1 `/learn` — Kid Home

```
┌─────────────────────────────────────────────────────────────────┐
│ Hi Mia! 👋                                              ⭐ 14   │
│                                                                 │
│ ── Today in class ── ⭐ workshop credits active                  │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │  📚 AI Creative Lab · Term 1                              │   │
│ │  Teacher: Sarah   Class is happening NOW                  │   │
│ │  Mission 3 of 8: "Make your AI pet talk"                  │   │
│ │  [Join class →]                                           │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ── Continue your work ──                                        │
│                                                                 │
│ ┌──────────────┐ ┌──────────────┐                              │
│ │ [thumbnail]  │ │ [thumbnail]  │                              │
│ │ My Cat Story │ │ Birthday Card│                              │
│ │ 5 images     │ │ Almost done  │                              │
│ │ [Continue →] │ │ [Continue →] │                              │
│ └──────────────┘ └──────────────┘                              │
│                                                                 │
│ ── What would you like to make today? ──                       │
│                                                                 │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│ │  🎨    │ │  📖    │ │  🎵    │ │  🎬    │ │  🗣️   │        │
│ │ Image  │ │ Story  │ │ Music  │ │ Video  │ │ Voice  │        │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Mission flow `/learn/missions/:slug`

Missions are the **structured backbone** of /learn. A Mission = step-by-step guided project with acceptance criteria.

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Missions                                          ⭐ 12 / day │
│                                                                 │
│ Mission 1 of 8                                                  │
│ Make your AI pet                                                │
│ ─────────────────                                               │
│                                                                 │
│ Step 2 of 5:  Design your pet's look                            │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │  Right now, ask the AI to draw your pet.                │    │
│ │                                                          │    │
│ │  Try to describe:                                        │    │
│ │   • What kind of animal? (cat, dragon, robot…)           │    │
│ │   • What color or pattern?                               │    │
│ │   • Where is it? (in a forest, on the moon…)             │    │
│ │                                                          │    │
│ │  ┌──────────────────────────────────────┐               │    │
│ │  │  My pet is a fluffy purple dragon    │               │    │
│ │  │  named Spark, sitting on a cloud.    │               │    │
│ │  │  [Imagine it!  ⭐2 ]                  │               │    │
│ │  └──────────────────────────────────────┘               │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ Progress:   [✓ Step 1]  [● Step 2]  [○ Step 3]  [○ Step 4]    │
└─────────────────────────────────────────────────────────────────┘
```

**Mission engine**:
- Steps loaded from `Mission.content_md` + `acceptance_yaml` (see API spec §4.3)
- Each step is a "card" — text instruction + an embedded creation widget (image / story / music / etc.)
- Step completion criteria can be: artifact saved / button clicked / specific tag in AI output / etc.
- Kid can "go back" to previous step but not skip ahead (until Mission complete)
- Mission complete → confetti + Stars reward + invite to share to class wall

### 5.3 `/learn/create/image` — AI Image Creator

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Home                                              ⭐ 12 / day │
│                                                                 │
│ 🎨 Image Maker                                                  │
│                                                                 │
│ ┌──── What should I draw? ────────────────────────────┐         │
│ │                                                      │         │
│ │  A friendly robot watering plants in space         │         │
│ │                                                      │         │
│ │  Make it:  [Cartoon]  [Painting]  [Pixel art]  [Photo]│       │
│ │                                                      │         │
│ │  Size:     ●Square  ○Wide  ○Tall                    │         │
│ │                                                      │         │
│ │  [✨ Make it!  ⭐2]                                  │         │
│ └──────────────────────────────────────────────────────┘        │
│                                                                 │
│ ── Recent ──                                                    │
│                                                                 │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│ │ image1  │ │ image2  │ │ image3  │ │ image4  │                │
│ │ [Save]  │ │ [Save]  │ │ [Save]  │ │ [Save]  │                │
│ │ [Redo]  │ │ [Redo]  │ │ [Redo]  │ │ [Redo]  │                │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
│                                                                 │
│ ✨ Tips:                                                        │
│ • The more you describe, the better!                            │
│ • Try silly things — robots with hats, cats in space            │
└─────────────────────────────────────────────────────────────────┘
```

**Generation flow**:
1. Kid types prompt → "Make it!" button shows cost (`⭐2`)
2. Click → optimistic UI ("creating…") → wait 5-15s
3. Backend: `POST /llm/image` → kid-safe prompt enhancement → DeepRouter → returned image saved to S3
4. Image appears in recent list with [Save to project] and [Redo with changes] buttons
5. "Save to project" → opens dropdown of existing projects + "New project"
6. Audit event auto-emitted

**Safety**:
- If prompt is flagged (NSFW / violence / harmful) → friendly rejection: "Hmm, let's try a different idea. How about a happy version?"
- 3 rejections in a row → soft nudge: "Need help thinking of ideas? Ask your teacher or parent"
- Sustained pattern of harmful prompts → silent audit flag for parent + admin review

### 5.4 `/learn/create/story` — Story Writer

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Home                                              ⭐ 11 / day │
│                                                                 │
│ 📖 Story Writer                                                 │
│                                                                 │
│ Step 1: What's it about?                                        │
│ ┌──────────────────────────────────────────────────────┐       │
│ │ A baby dragon who's afraid of fire but learns to be   │       │
│ │ brave when his friend gets stuck.                     │       │
│ └──────────────────────────────────────────────────────┘       │
│                                                                 │
│ Step 2: Pick a feeling                                          │
│ [😊 Happy] [😢 Sad] [🌟 Magical] [😱 Spooky] [😂 Funny]        │
│                                                                 │
│ Step 3: How long?                                               │
│ [Short (1 page)] [Medium (3 pages)] [Long (5 pages)]            │
│                                                                 │
│ [✨ Write my story!  ⭐3]                                       │
└─────────────────────────────────────────────────────────────────┘
```

Generated story appears as page-by-page reader; kid can edit any sentence + regenerate; can pair each page with images (auto-suggest from `/learn/create/image`).

### 5.5 `/learn/create/music` and `/voice` and `/video`

Same pattern:
1. Simple input form (text + style/length pickers)
2. Show cost upfront
3. Generate → preview → save to project
4. Always show "what you typed", "what AI made", side by side

### 5.6 `/learn/projects` — My Works

```
┌─────────────────────────────────────────────────────────────────┐
│ 📂 My Works                                         + New Project│
│                                                                 │
│ Filter: [All]  [In progress]  [Finished]  [Shared with class]   │
│                                                                 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│ │ [thumbnail]  │ │ [thumbnail]  │ │ [thumbnail]  │             │
│ │ My Cat Story │ │ Robot in     │ │ Spark the    │             │
│ │              │ │ Space card   │ │ Dragon       │             │
│ │ 5 items      │ │ 2 items      │ │ 12 items     │             │
│ │ 🟡 working   │ │ ✓ finished   │ │ 🌟 in class  │             │
│ │ Yesterday    │ │ Last week    │ │ 2 weeks ago  │             │
│ └──────────────┘ └──────────────┘ └──────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### 5.7 `/learn/projects/:id` — Project Workspace

```
┌─────────────────────────────────────────────────────────────────┐
│ ← My Works                                                      │
│                                                                 │
│ My Cat Story                              ⭐ 8 spent on this    │
│ ────────────                                                    │
│ [Edit title] [Share with class] [Download] [Delete]             │
│                                                                 │
│ ── Pieces of this project ──                                    │
│                                                                 │
│ Images (5)                              [+ Add image]           │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│ │ cat1 │ │ cat2 │ │ cat3 │ │ cat4 │ │ cat5 │                  │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                  │
│                                                                 │
│ Story (1)                               [+ Add story]           │
│ ┌────────────────────────────────────────────┐                  │
│ │ Once upon a time, my cat could fly…        │                  │
│ │ [Read full story]                          │                  │
│ └────────────────────────────────────────────┘                  │
│                                                                 │
│ Voice narration (1)                     [+ Add voice]           │
│ ▶ cat-story-narration.mp3                                       │
│                                                                 │
│ Music (0)                               [+ Add music]           │
│                                                                 │
│ ── Make a storybook ──                                          │
│ [✨ Combine into PDF]   [📺 Make a video]                      │
└─────────────────────────────────────────────────────────────────┘
```

"Combine" actions auto-generate exports (PDF storybook, video slideshow) — these are the kid's takeaway artifacts.

### 5.8 `/learn/classroom` — Class Wall

> Default-private. Class wall shows other kids' shared work within the same class.

```
┌─────────────────────────────────────────────────────────────────┐
│ 🏫 My Classes                                                   │
│                                                                 │
│ ┌─ AI Creative Lab · Term 1 ──────────────────────────────┐    │
│ │ Teacher: Sarah · 5 classmates                            │    │
│ │ [Open class wall →]                                      │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ /learn/classroom/:classId — inside a class                      │
│                                                                 │
│ ── Class wall ── (only your classmates can see this)           │
│                                                                 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│ │ Leo's robot  │ │ Tara's story │ │ Sam's song   │             │
│ │ [thumbnail]  │ │ [thumbnail]  │ │ [thumbnail]  │             │
│ │ 🌟 5 likes   │ │ 🌟 8 likes   │ │ 🌟 2 likes   │             │
│ │ [♡ Like]     │ │ [♡ Like]     │ │ [♡ Like]     │             │
│ └──────────────┘ └──────────────┘ └──────────────┘             │
│                                                                 │
│ [✨ Share something of mine to the class →]                    │
└─────────────────────────────────────────────────────────────────┘
```

**Safety on class wall**:
- Default private. Kid must explicitly request share (teacher approves first).
- Only Likes (no free-form comments) at V0 — eliminates a whole class of moderation problems
- Reporting button on every item: "This makes me uncomfortable" → emails teacher

### 5.9 `/learn/help`

Simple page:
- "Talk to my parent" → opens a pre-filled message that becomes ApprovalRequest payload OR direct email to family.primary_email
- "Talk to my teacher" → similar
- "I'm stuck" → ApprovalRequest type=`help`; teacher gets notification
- FAQs (kid-version, simplified)

---

## 6. Mission Engine — Data Driven

Missions are configured (not coded). Backend provides:

```json
{
  "mission_id": "mission_make-your-ai-pet",
  "title": "Make your AI pet",
  "estimated_stars": 12,
  "steps": [
    {
      "id": "step_1",
      "title": "Imagine your pet",
      "instruction_md": "Think about what kind of pet you want…",
      "widget": "image_create",
      "widget_config": { "style_presets": ["cartoon","painting"], "size": "square" },
      "completion": { "type": "artifact_saved", "kind": "image" }
    },
    {
      "id": "step_2",
      "title": "Give it a name and story",
      "instruction_md": "...",
      "widget": "story_write",
      "completion": { "type": "artifact_saved", "kind": "text" }
    },
    {
      "id": "step_3",
      "title": "Hear it speak",
      "widget": "voice_create",
      "completion": { "type": "artifact_saved", "kind": "audio" }
    },
    {
      "id": "step_4",
      "title": "Show your classroom",
      "widget": "share_to_class",
      "completion": { "type": "share_request_submitted" }
    }
  ],
  "acceptance": {
    "must_have": ["image", "text", "audio"],
    "min_words": 50
  }
}
```

Frontend just renders the appropriate widget per step + checks completion.

---

## 7. Backend integration

| Action | Endpoint | Note |
|---|---|---|
| Generate image | POST `/llm/image` | Stars metered, kid-safe prompt injected |
| Generate story | POST `/llm/text-completion` | Same |
| TTS | POST `/llm/tts` | Same |
| Music | POST `/llm/music` | Same |
| Video | POST `/llm/video` | Long-running; returns job_id, listen WS for `agent.stream.done` |
| Save artifact | POST `/projects/:id/artifacts/upload-url` then PUT to S3 | Signed URL, 5min TTL |
| Save project | POST `/projects` then PATCH | Project owned by kid, family-scoped |
| Share to class | POST `/projects/:id/share-request` body `target_visibility=class` | Teacher reviews via teacher-console |
| Request more Stars | POST `/approvals` body `type=extra_stars` | Parent reviews in /portal/approvals |
| Audit event emit | Auto by backend on every action | Visible in /portal/audit + /portal/audit/project/:id |

WebSocket: kid joins `kid:<kid_id>` room. Receives:
- `agent.stream.delta` — for streaming AI text/code output
- `agent.stream.done` — generation complete
- `approval.resolved` — parent acted on kid's request
- `class.kid_progress` — when in a live class

---

## 8. Stars UX

### 8.1 Pre-action display

- Every "Make it" button shows cost upfront: `[Make it ⭐2]`
- If kid has enough → button enabled
- If kid is at cap → button shows greyed + "Ask parent for more"
  - Click → opens approval request form

### 8.2 Insufficient Stars

```
┌─────────────────────────────────────────────────────────────────┐
│  Out of Stars for today!                                        │
│                                                                 │
│  You used 20/20 daily Stars. Resets at midnight.                │
│                                                                 │
│  ● Ask parent for more (right now)                              │
│  ○ Wait until tomorrow                                          │
│  ○ Read someone else's story / browse class wall (free)         │
│                                                                 │
│  [Ask parent for more →]                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Family paused

```
┌─────────────────────────────────────────────────────────────────┐
│  Family Airbotix is on pause                                    │
│                                                                 │
│  Mom or Dad has paused Airbotix for everyone right now.         │
│  Maybe homework time?                                           │
│                                                                 │
│  [💬 Ask why →]                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.4 Reward Stars (Mission completed)

```
┌─────────────────────────────────────────────────────────────────┐
│  🎉 You did it!                                                 │
│                                                                 │
│  Mission "Make your AI pet" complete!                           │
│                                                                 │
│  ⭐⭐⭐ +3 Stars reward                                          │
│  Now you have 17 Stars                                          │
│                                                                 │
│  [See my pet →]   [Next mission →]                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Safety Mechanisms (implementation hooks)

| Concern | Implementation |
|---|---|
| Inappropriate kid prompt | Backend pre-screen (regex blacklist) + LLM classifier; reject with friendly message |
| Inappropriate AI output | Backend post-screen; if rejected, refund Stars, audit emit |
| Prompt injection | Kid-safe system prompt is **DeepRouter server-side** (kid can't see/edit). See `deeprouter-coupling-plan.md` |
| Personal info leak | Forbid Saving real names / addresses / contact info to projects; warn on detect |
| Class wall harassment | No comments, only likes; reporting button; teacher reviews shares |
| Cap circumvention | Server enforces; client UI is a cooperative copy of state |
| Account compromise (kid PIN guessed) | 5 wrong PIN → 5min lockout + parent push notification |
| Time-bombing | Sessions auto-expire on inactivity (30min); idle warning at 25min |

---

## 10. Live Class Mode

When kid joins a class that's currently "live" (teacher in teacher-console put class into Live Mode):

- Banner: "📡 You're in class with Sarah right now"
- Teacher can see kid's current screen in their teacher dashboard (read-only, no spy mode — kid knows)
- Teacher can "highlight" a kid's work to the class wall instantly
- Kid can raise hand: "I need help" → teacher gets notification with kid name + current project

Implementation: WS room `class:<class_id>`. Kid posts `class.heartbeat` every 30s while in class. Teacher receives `class.kid_progress` updates.

---

## 11. Mobile / iPad

Most 8-11 kids will use this on a **tablet** (iPad in particular). UI must:
- Big touch targets (min 44×44px)
- No drag-drop (often fails on touch)
- Landscape & portrait both supported
- One-handed reachability (CTAs on bottom in mobile)

PWA installable. Offline = "limited mode" (read-only access to own works, no generation).

---

## 12. Empty / Onboarding states

| Page | Empty state |
|---|---|
| /learn (no projects yet) | "Welcome! What would you like to make first?" + 5 big creation tiles |
| /learn/projects | "Your works will show up here. Try making something on the home page!" |
| /learn/classroom (no class) | "You haven't joined a class yet. Ask your parent or teacher how to join." |
| /learn/missions (no course) | "Your teacher hasn't assigned a Course Pack yet." |

---

## 13. Out of Scope (V0)

- ❌ AI coding (Kids OpenCode local desktop tool only; web has a "Download Kids OpenCode" CTA for 12+)
- ❌ Free-form chat with AI (everything mission/widget-driven)
- ❌ Comments on class wall (Likes only at V0)
- ❌ Kid-to-kid direct messaging
- ❌ Public profile / sharing outside class
- ❌ Multi-language UI for kids (V1+; en-AU default)
- ❌ Voice input for kids ("speak your prompt") — V1+ accessibility feature
- ❌ Robotics integration (V1+)
- ❌ Adaptive difficulty per kid (V1+ ML personalization)

---

## 14. Open Questions

| # | Q | Impact |
|---|---|---|
| Q1 | Default daily Stars cap for new kid — 10⭐ or 20⭐? | Unit economics + friction |
| Q2 | Should free creation outside a Mission cost less / be free for first N actions? | Engagement vs revenue |
| Q3 | Class wall — can kids see each other's nicknames or just avatars? | Safety / community trade-off |
| Q4 | Mission completion reward — fixed Stars or scaled by mission complexity? | Engagement design |
| Q5 | "Ask parent for more" — direct push notification, or email? Default channel? | Latency vs annoyance |
| Q6 | Video generation V0 (Runway) is expensive — should we gate behind higher cap? | Cost control |
| Q7 | What happens to a project if the kid's account is deleted? Family keeps? Or also deleted? | Compliance / right-to-be-forgotten |

---

## 15. Implementation Notes

### Folder layout (within airbotix-app repo)

```
src/
├── auth/                          # JWT, kid login, family code
├── learn/
│   ├── Home.tsx
│   ├── Missions.tsx
│   ├── MissionDetail.tsx
│   ├── create/
│   │   ├── Image.tsx
│   │   ├── Story.tsx
│   │   ├── Music.tsx
│   │   ├── Video.tsx
│   │   └── Voice.tsx
│   ├── projects/
│   │   ├── List.tsx
│   │   └── Detail.tsx
│   ├── Classroom.tsx
│   ├── ClassroomDetail.tsx
│   └── Help.tsx
├── portal/                        # see parent-portal-prd.md
├── shared/
│   ├── KidLayout.tsx              # nav bar tuned for ages 8-11
│   ├── ParentLayout.tsx
│   └── StarCounter.tsx
├── components/
│   ├── CreationWidget.tsx         # generic widget that mission steps embed
│   ├── ImageCreator.tsx
│   ├── StoryWriter.tsx
│   ├── ProjectCard.tsx
│   ├── ClassWallItem.tsx
│   └── ApprovalRequestModal.tsx
├── hooks/
│   ├── useKidAuth.ts
│   ├── useMission.ts
│   ├── useLlm.ts                  # wraps /llm/* endpoints
│   └── useStars.ts
└── App.tsx                        # routes both /portal/* and /learn/*
```

### State management

Same TanStack Query stack as Parent Portal. Kid surfaces use additional `useLlm` hook that wraps `/llm/*` mutations with optimistic Stars deduction + WS streaming.

### Age-aware UI

```typescript
const isYoung = kidProfile.age < 12
const ui = isYoung ? 'young' : 'older'
// pass to context provider, components can `useUiMode()`
```

### Sound

Mission completion / generation complete / approval granted = friendly chime (single short sound, max 200ms, parent-mutable in /portal/settings). 8-11 kids respond strongly to audio feedback.

---

## 16. References

- `platform-backend-api-spec.md` — every endpoint used here defined there
- `parent-portal-prd.md` — sibling surface in same SPA
- `marketing-site-refresh-prd.md` §4.0 — Teaching capability catalog (what each create surface delivers)
- `kids-ai-platform-prd.md` §7.3 + §10 — overall product flow + course pack concept
- `docs/product/compliance/minors-compliance.md` — C1-C15 compliance checklist (esp. C7/C8 default-private, C12 reporting)
