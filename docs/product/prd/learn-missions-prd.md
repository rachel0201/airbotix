# Missions — `/learn/missions/*` — PRD

> **Status**: Draft v0.1 · 2026-05-25
> **Repo**: `Airbotix-AI/airbotix-app` (React + Vite SPA — `/learn/*` surface)
> **Domain**: `app.airbotix.ai`
> **Author**: Airbotix engineering
> **Upstream**: `kids-ai-platform-prd.md` (platform vision) · `airbotix-app-learn-prd.md` §5.2 / §6 (origin, now superseded by this doc)
> **Depends on**: `platform-backend-api-spec.md` §4.3 (`CoursePack` / `Mission`) · §5.6 (`/course-packs`) · `auth-system-prd.md` (kid auth)
> **Parallel**: `learn-projects-prd.md` (Mission outputs land here) · `learn-classroom-prd.md` (Mission completion can trigger a class share)
> **Implementation owner**: airbotix-app frontend + platform-backend (content authoring later moves to teacher-console)

---

## 1. Purpose

A **Mission** is the *structured backbone* of the kid Learn surface: a step-by-step guided project with explicit acceptance criteria, a budget in ⭐, and a known set of widgets (image / story / music / voice / video / share). Missions live inside **Course Packs**; Course Packs are what teachers and admins assign to a `Class`.

Missions exist because:
- Kids 8-11 don't self-direct well; "go make something" is too open
- Schools and parents need a *curriculum*, not a toy
- Audit + Stars budgeting + safety filters all become predictable when each step has a known shape

Missions **don't**:
- ❌ Run free-form chat (each step is a single widget invocation; see `/learn/workspace` for bounded multi-turn)
- ❌ Generate themselves from kid prompts (V0 — V1+ may add AI-generated remix missions)
- ❌ Block kids permanently — "go back to a previous step" always works; "skip ahead" is gated until acceptance passes
- ❌ Award ⭐ for time spent — only for `Mission.completed` per `acceptance_yaml`

---

## 2. Information Architecture

```
app.airbotix.ai/learn/

├── /learn/missions                   Browse Course Packs, age-banded
└── /learn/missions/:slug             Mission detail / run (slug = Mission.slug, scoped to assigned Course Pack)
```

**Out of this surface but adjacent:**
- `/learn/projects/:id` — auto-created Project that backs a Mission run (see [`learn-projects-prd.md`](./learn-projects-prd.md))
- `/learn/classroom` — where Mission outputs surface after `share_to_class` step (see [`learn-classroom-prd.md`](./learn-classroom-prd.md))
- `teacher.airbotix.ai/courses` — Mission *authoring* lives here from V1; V0 admin-only via seed scripts

---

## 3. Mission Engine — Data Contract

> Authoritative schema: `platform-backend-api-spec.md` §4.3 (`Mission` model). This PRD describes the *shape of `content_md` + `acceptance_yaml`* — the mini-DSL the frontend renders against.
>
> **Worked example**: see [`coursepack-ai-pet-lab-prd.md`](./coursepack-ai-pet-lab-prd.md) for a complete reference Course Pack (4 missions, full YAML, all widget types in use, end-to-end safety + compliance mapping). Use that as the template when authoring a new pack.

### 3.1 Mission JSON envelope (returned by `GET /course-packs/:slug`)

```json
{
  "mission_id": "mission_make-your-ai-pet",
  "slug": "make-your-ai-pet",
  "course_pack_id": "cp_ai-creative-lab-v1",
  "title": "Make your AI pet",
  "order_index": 1,
  "estimated_stars": 12,
  "content_md": "...intro paragraph rendered above step 1...",
  "steps": [
    {
      "id": "step_1",
      "title": "Imagine your pet",
      "instruction_md": "Think about what kind of pet you want…",
      "widget": "image_create",
      "widget_config": { "style_presets": ["cartoon","painting"], "size": "square" },
      "completion": { "type": "artifact_saved", "kind": "image" }
    },
    { "id": "step_2", "title": "Name it",       "widget": "story_write", "completion": { "type": "artifact_saved", "kind": "text", "min_words": 30 } },
    { "id": "step_3", "title": "Hear it speak", "widget": "voice_create","completion": { "type": "artifact_saved", "kind": "audio" } },
    { "id": "step_4", "title": "Show your class","widget": "share_to_class","completion": { "type": "share_request_submitted" } }
  ],
  "acceptance": {
    "must_have_kinds": ["image", "text", "audio"],
    "min_words_total": 50
  }
}
```

### 3.2 Step `widget` registry (V0)

| Widget | Wraps endpoint | Typical ⭐ | Completion kinds |
|---|---|---|---|
| `image_create` | `POST /llm/image` | 2 | `artifact_saved kind=image` |
| `story_write` | `POST /llm/text-completion` | 3 | `artifact_saved kind=text` (with optional `min_words`) |
| `voice_create` | `POST /llm/tts` | 1 | `artifact_saved kind=audio` |
| `music_create` | `POST /llm/music` or `/llm/music-score` | 3 / 3 | `artifact_saved kind=audio` |
| `video_create` | `POST /llm/video` | 8 | `artifact_saved kind=video` |
| `share_to_class` | `POST /projects/:id/share-request target_visibility=class` | 0 | `share_request_submitted` |
| `read_only` | — | 0 | `acknowledged` (kid clicks "Got it") |

Adding a new widget = (a) frontend renderer (b) backend endpoint with Stars metering (c) entry in this registry. **Do not** invent widget names that aren't in this table.

### 3.3 `completion.type` enum

| Type | Passes when |
|---|---|
| `artifact_saved` | Any `Artifact` of the configured `kind` is attached to the Mission's Project. Optional sub-filters: `min_words`, `min_duration_sec`, `min_dimensions`. |
| `share_request_submitted` | A `ShareRequest` exists for the Project with `target_visibility=class` and `status≠rejected`. |
| `acknowledged` | Kid clicks the step's confirm button (used for tutorial / safety steps). |
| `tag_present` | Latest AI output for the step contains a configured tag (set via DeepRouter response metadata). |

Frontend re-evaluates completion on (a) any new `Artifact` for this Project (b) WS `agent.stream.done` (c) explicit click. Backend never auto-marks; client is the source of "step done" UI but `Mission.acceptance` is re-checked server-side at `POST /projects/:id/submit` (V0.2) before awarding completion ⭐.

### 3.4 Acceptance gate (Mission complete)

When the kid presses **"I'm done"** on the last step:
1. Client POSTs `/projects/:id/submit` with the `mission_id`
2. Backend reads `Mission.acceptance` and the Project's artifacts
3. If pass → `Project.status = accepted`, emit `mission.completed` audit event, credit completion ⭐ (Q4 below — fixed vs scaled)
4. If fail → return `{ missing: ["audio"], reason: "..." }`; client shows friendly nudge ("You're nearly there — add a voice clip!")

Server-side re-check is the trust boundary; do not let the client lie about completion.

---

## 4. Browser — `/learn/missions` (age-banded)

> Source: `airbotix-app-learn-prd.md` §5.2. Reproduced here as the canonical version.

```
┌─────────────────────────────────────────────────────────────────┐
│ 🎯 Missions                                         ⭐ 14 / day │
│                                                                 │
│ ── Just right for age 9 ──                                      │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐                    │
│ │ AI Pet     │ │ Story Lab  │ │ Music Maker│                    │
│ │ 8 missions │ │ 6 missions │ │ 5 missions │                    │
│ │ ages 8-10  │ │ ages 8-11  │ │ ages 9-12  │                    │
│ └────────────┘ └────────────┘ └────────────┘                    │
│                                                                 │
│ ── A little harder ── (stretch)                                 │
│ ── Easier warm-ups ── (collapsed by default)                    │
└─────────────────────────────────────────────────────────────────┘
```

**Banding rule** (client-side; backend returns *all* published packs, no per-kid filter):
- Pull all visible packs via `GET /course-packs` (visibility=published)
- For each pack, compare kid's `KidProfile.age` to `target_age_min` / `target_age_max`:
  - `age ∈ [min, max]` → **Just right** (top, full saturation)
  - `age < min` → **A little harder** (middle, slightly muted)
  - `age > max` → **Easier warm-ups** (bottom, collapsed, lower saturation)
- Sort within band by `created_at desc`
- Empty "Just right" → `"Ask your teacher for new missions →"`

**Why client-side banding** (D-M1, below): static + explainable; no cold-start; no behavioral profile; easy to swap for a learned model later without changing the API.

---

## 5. Mission run — `/learn/missions/:slug`

> Source: `airbotix-app-learn-prd.md` §5.2bis.

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Missions                                          ⭐ 12 / day │
│ Mission 1 of 8 — Make your AI pet                               │
│                                                                 │
│ Step 2 of 5:  Design your pet's look                            │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │  Right now, ask the AI to draw your pet.                │    │
│ │  ┌──────────────────────────────────────┐               │    │
│ │  │  My pet is a fluffy purple dragon …  │               │    │
│ │  │  [Imagine it!  ⭐2]                  │               │    │
│ │  └──────────────────────────────────────┘               │    │
│ └─────────────────────────────────────────────────────────┘    │
│ Progress:   [✓ Step 1]  [● Step 2]  [○ Step 3]  [○ Step 4]    │
└─────────────────────────────────────────────────────────────────┘
```

**Run lifecycle:**
1. Click "Start" on a Mission card → backend `POST /projects` with `{ mission_id, title: Mission.title }` → returns `project_id`; frontend navigates to `/learn/missions/:slug?project=<id>`
2. Each step renders its `widget` with `widget_config`; outputs auto-save as `Artifact` rows on this Project
3. "Back" allowed any time; "Next" only when current step's `completion` passes (client gate; server re-checks on submit)
4. Final step's submit → `/projects/:id/submit` (see §3.4)
5. On accept → confetti screen (§6) + deep link into `/learn/projects/:id` (see [`learn-projects-prd.md`](./learn-projects-prd.md))

**Resume**: opening a Mission whose kid already has an `in_progress` Project for it picks up where they left off (no duplicate Projects per `(kid_id, mission_id)`; enforced unique-ish at API).

---

## 6. Mission completion reward

```
🎉 You did it!  Mission "Make your AI pet" complete!
⭐⭐⭐  +3 Stars reward    Now you have 17 Stars
[See my pet →]   [Next mission →]
```

V0 reward policy (Q4, open question carry-over from learn PRD): **fixed +3⭐ per mission** regardless of length. Rationale: easiest to communicate ("every mission gives you 3 stars"); scaled rewards bias kids toward long missions and confuse parents reading `WalletTransaction`. Revisit at V1 once we have engagement data.

Reward emits `wallet.credit` (`tx_type=mission_reward`) + `mission.completed` audit events.

---

## 7. Backend integration (cross-ref)

| Action | Endpoint | Note |
|---|---|---|
| List packs | `GET /course-packs` | Client filters by age band |
| Get one + missions | `GET /course-packs/:slug` | Returns full `steps` envelope (§3.1) |
| Start mission | `POST /projects` `{ mission_id }` | Idempotent per `(kid_id, mission_id)` while `status=in_progress` |
| Per-step LLM calls | `POST /llm/*` | See §3.2 widget registry |
| Submit for acceptance | `POST /projects/:id/submit` | Server re-checks `Mission.acceptance` |
| Award completion ⭐ | Auto on accept | `WalletTransaction tx_type=mission_reward` |

WS events the run subscribes to:
- `agent.stream.done` (per-step result ready)
- `wallet.spend` / `wallet.credit` (to update the ⭐ badge live)
- `approval.resolved` (only if kid asked for extra ⭐ mid-mission)

---

## 8. Safety hooks

| Concern | Implementation |
|---|---|
| Kid types something off-topic for the step | Backend pre-screen + step's `widget_config.guard_prompt` (optional); friendly redirect, no ⭐ charged |
| Kid spams "Imagine it" to farm artifacts | Stars metering is the rate limit; ⭐ cap hits before artifact spam matters |
| Stuck on a step | "I'm stuck" button → ApprovalRequest `type=help`, teacher gets notification (`auth-system-prd.md` reuses this path) |
| Mission has bad content (admin error) | Admin can mark `Mission` as `is_published=false` mid-day; kids in progress finish their current step then see a polite "this mission has been updated — restart?" |

Compliance items C7 (audit) and C8 (Stars budget) are satisfied by reusing `/llm/*` proxy + AuditEvent emission — no Mission-specific compliance work needed.

---

## 9. Authoring path (V0 → V3+)

Strong principle (**D-M7**): **curriculum is Airbotix-owned at V0/V1**. We don't open Mission authoring to teachers or schools until we have the moderation tooling to keep our content quality / safety promise. The phasing below is the trust-build path.

| Phase | Who authors | How | Why this phase, not earlier |
|---|---|---|---|
| **V0** | Admin only | Seed scripts in `platform-backend` (`prisma/seed/missions/*.yaml`); deploy required to change | No authoring UI yet; ship the engine first |
| **V0.2** | Admin via teacher-console | `/admin/course-packs` editor (see `teacher-console-prd.md` §4.14); admin role; YAML form + preview | Decouples content release from code release |
| **V1** | Teacher **selects only — no authoring** | Teacher picks a published `CoursePack` from the platform catalog when creating a Class (`teacher-console-prd.md` §4.3). Teachers **cannot** create, edit, or fork Missions. | Quality + safety review of Mission content is a hard problem; we don't have the content classifier or review queue yet. Letting teachers author without it transfers all moderation cost onto Airbotix admin per-pack. |
| **V2** | Institution composes **Curriculum Bundles** | A school admin can assemble a `CurriculumBundle` by picking + reordering + skipping Missions from the platform catalog. **Cannot author new Missions.** See `institution-prd.md` when the institution surface ships. | First B2B contract will demand differentiation; "pick + reorder" gives schools 80% of what they want with 0% of the content moderation risk. |
| **V3+** | Teacher authors Missions | Open authoring gated by admin pre-publish review queue. Requires (a) automated content classifier, (b) teacher training / certification, (c) per-pack moderation SLA. | Not viable until V2 institutional adoption proves the surface; need real volume + moderation tooling before opening to long-tail authors. |

`content_md` is sanitized Markdown (allow: headings, bold, italic, lists, code, image refs to S3; deny: HTML, scripts, external links). Same allowlist as kid chat output rendering. Sanitization rule is identical across all authoring tiers — admin doesn't get an HTML escape hatch either.

**Pack publish is a sensitive action** (affects every kid using it). Per `super-admin-prd.md` §3.2, `POST /course-packs/:id/publish` requires a fresh TOTP step-up — even for admin role.

---

## 10. Out of Scope (V0)

- ❌ AI-generated remix missions ("make me a new mission like this one")
- ❌ Branching missions (choose your own adventure) — `steps` is a flat array
- ❌ Multi-kid co-op missions (one Project = one kid)
- ❌ Per-kid difficulty scaling
- ❌ Mission analytics dashboard for teachers beyond completion counts (see `teacher-console-prd.md`)
- ❌ Re-do a single step without redoing the whole mission (V1+: per-step "redo" with ⭐ cost)

---

## 11. Decision Records

| # | Decision | Why |
|---|---|---|
| D-M1 | Age banding is **client-side**, backend returns the full list. | Banding is presentational; behavior changes (kid's birthday) shouldn't require a backend roundtrip; lets us swap to ML later without a contract change. |
| D-M2 | `acceptance` re-checked **server-side** on submit. | Client is allowed to lie; backend is the trust boundary for the ⭐ reward. |
| D-M3 | **Fixed +3⭐** mission completion reward (V0). | Simplicity for kid + parent; revisit with data. |
| D-M4 | Widget registry is **closed** — no arbitrary widgets in `content_md`. | Each widget maps to a metered backend endpoint; arbitrary widgets break ⭐ + audit guarantees. |
| D-M5 | One `Project` per `(kid_id, mission_id)` while `in_progress`. | Resume-friendly; avoids artifact fragmentation; kids who want a fresh try can archive and restart. |
| D-M6 | Authoring **stays admin-only at V0/V1**; teachers **select** but don't author. | Safety review burden too high to open to teachers before we have the content moderation tooling. Earlier version of this PRD had teachers authoring at V1 — corrected in v0.2. |
| D-M7 | V2 introduces `CurriculumBundle` for **school composition** (pick/reorder/skip), NOT Mission authoring. | First B2B contracts will demand differentiation; composition gives 80% of the value with 0% of the moderation risk. |
| D-M8 | `CoursePack.publish` requires **TOTP step-up** even for admin. | Affects every kid on the platform; same blast radius as a wallet defaults change. |

---

## 12. Open Questions

| # | Q | Owner | Impact |
|---|---|---|---|
| QM-1 | Should `min_words` / `min_duration_sec` thresholds be enforced strictly, or "soft" with a friendly nudge? | Product | Friction vs quality |
| QM-2 | Do we let kids preview a Mission's steps before starting (spoilers)? | Product | Discoverability vs surprise |
| QM-3 | When a Course Pack version bumps (semver) and a kid is mid-mission, freeze them on old or migrate? | Engineering | Data migration cost |
| QM-4 | Confetti animation — accessibility opt-out (reduced motion)? | Engineering | Should default to `prefers-reduced-motion` |
| QM-5 | Should completion ⭐ scale with `estimated_stars` after all (e.g. `ceil(estimated_stars * 0.25)`)? | Product | Re-litigate D-M3 with V1 data |

---

## 13. Revision History

- **v0.2 — 2026-05-25** — Corrected §9 authoring roadmap: V1 is teachers **selecting only** (not authoring); added V2 `CurriculumBundle` composition phase + V3 teacher authoring (gated). Added D-M7 (Bundle, not Mission, authoring at V2), D-M8 (publish requires TOTP step-up). Updated D-M6 to reflect the correction.
- **v0.1 — 2026-05-25** — Promoted from `airbotix-app-learn-prd.md` §5.2 / §5.2bis / §6 / §8.4 into a standalone PRD. Added widget registry (§3.2), acceptance gate server-side re-check (§3.4 / D-M2), authoring roadmap (§9), and decision records D-M1…D-M6.
