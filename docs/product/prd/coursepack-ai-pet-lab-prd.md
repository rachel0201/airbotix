# Course Pack — AI Pet Lab — PRD

> **Status**: Draft v0.1 · 2026-05-25
> **Pack slug**: `ai-pet-lab-v1` · **Version**: `1.0.0` · **Product line**: `line_a_creative`
> **Target ages**: 8–10 · **Estimated Stars**: 14 ⭐ across 4 Missions
> **Author**: Airbotix curriculum (admin-authored — per `learn-missions-prd.md` §9 D-M6, V0/V1 admin-only)
> **Upstream**: `learn-missions-prd.md` (Mission engine spec) · `platform-backend-api-spec.md` §4.3 (`CoursePack` / `Mission` schema)
> **Implementation owner**: Airbotix admin team (seeds at `platform-backend/prisma/seed/missions/ai-pet-lab-v1.yaml`); published via `teacher-console` `/admin/course-packs` (Publish requires TOTP step-up per D-M8 / D-SA4)

---

## 1. Purpose

**AI Pet Lab** is the **reference / launch Course Pack** for Line A (8–11 creative). It exists to:

1. **Be Airbotix's V0 launch curriculum** — first course every new Class can run end-to-end, day one
2. **Prove the Mission engine** — uses 4 of the 6 widget types (`image_create`, `story_write`, `voice_create`, `share_to_class`); validates `acceptance.must_have_kinds` server-side check; triggers the Combine PDF export
3. **Serve as the template** every subsequent Course Pack PRD should mirror — same metadata block, same Mission-by-Mission structure, same curriculum-alignment table

A kid who finishes AI Pet Lab walks out with: **one designed pet image, one short story, one voice clip, one combined PDF storybook, one wall-shared post**. ~30–45 minutes total over 4 sittings.

---

## 2. Learning objectives

Mapped to **Australian Curriculum: Digital Technologies F-10**, Year 3–4 band (closest match to ages 8–10):

| Curriculum strand | What this pack delivers |
|---|---|
| Representation of data | Kid sees how *text prompts* become *visual + audio output* — concrete demo that "data" comes in many forms (text → image, text → voice) |
| Creating digital solutions | Iterating on a prompt to refine an output ("make it more sparkly"); combining multiple artifacts into a single PDF deliverable |
| Digital systems | Implicit: kid uses AI tools responsibly within a Stars budget — first lived experience of resource-bounded computing |

**Soft skills**:
- Iteration ("try again with different words")
- Self-expression (every kid's pet is unique)
- Audience awareness (share-to-class step — "what's good enough to show others")

Not in scope: programming concepts (deferred to Line B / Kids OpenCode, 12+), data analysis, networks.

---

## 3. Pack metadata

```yaml
slug: ai-pet-lab-v1
title: "AI Pet Lab"
description: |
  Make your own AI pet — design it, name it, give it a voice, and show your class.
  Best for kids 8–10 who love animals, robots, and imagining new creatures.
target_age_min: 8
target_age_max: 10
product_line: line_a_creative
mission_count: 4
estimated_stars: 14
version: "1.0.0"
is_published: false   # flip to true via /admin/course-packs Publish (TOTP step-up required)
```

Maps directly to the `CoursePack` Prisma model (`platform-backend-api-spec.md` §4.3). No schema extension needed.

---

## 4. Missions — overview

| # | Slug | Title | Widget(s) | ⭐ | Output |
|---|---|---|---|---|---|
| 1 | `imagine-your-pet` | Imagine your pet | `image_create` · `read_only` | 4 | Image |
| 2 | `name-and-story` | Name and story | `story_write` · `read_only` | 4 | Text (≥40 words) |
| 3 | `hear-it-speak` | Hear it speak | `voice_create` | 3 | Audio (≤8s) |
| 4 | `show-your-class` | Show your class | `read_only` (Combine) · `share_to_class` | 3 | PDF + Class wall post |

**Mission ordering rationale**: image first (most engaging hook for 8-year-olds), then attach a story (writing easier when there's a picture to anchor it), then voice (low-effort, high-delight payoff), then combine + share (the takeaway). Each Mission stands alone if the kid stops — they still have *something*.

---

## 5. Mission 1 — Imagine your pet

```yaml
- slug: imagine-your-pet
  title: "Imagine your pet"
  order_index: 1
  estimated_stars: 4
  content_md: |
    ## Welcome to AI Pet Lab! 🐾

    In this mission you'll design what your pet looks like.
    Think about: What animal? What colour? Where does it live?
  steps:
    - id: step_1
      title: "Pick your pet's vibe"
      instruction_md: |
        Tell the AI what your pet looks like.

        Try things like: "a fluffy purple dragon with sparkles" or
        "a tiny robot puppy made of gold".
      widget: image_create
      widget_config:
        style_presets: [cartoon, painting]
        size: square
        guard_prompt: "Keep it about a friendly imaginary pet"
      completion:
        type: artifact_saved
        kind: image
    - id: step_2
      title: "Pick your favourite"
      instruction_md: |
        Made a few? Save the one you love most —
        that's your pet for the rest of the lab!
      widget: read_only
      completion:
        type: acknowledged
  acceptance:
    must_have_kinds: [image]
```

**Cost model**: 2⭐ per `image_create` invocation; budget assumes 2 attempts (4⭐ total). Kid going over budget hits the standard "ask parent for more" flow — Mission still completes once at least 1 image is saved.

**Safety notes**:
- `guard_prompt` adds a topic guardrail at the proxy layer (`platform-backend` injects it into the DeepRouter system message)
- Standard kid-safe pre-screen + post-screen apply regardless of this config
- No PII risk in this step — kid describes an imaginary creature

---

## 6. Mission 2 — Name and story

```yaml
- slug: name-and-story
  title: "Name and story"
  order_index: 2
  estimated_stars: 4
  content_md: |
    Now your pet needs a name and a little story.
    Where does it come from? What does it love? Is it brave or shy?
  steps:
    - id: step_1
      title: "Name your pet"
      instruction_md: |
        Type a name for your pet. Just one word is OK!
      widget: read_only
      completion:
        type: acknowledged
    - id: step_2
      title: "Write the story"
      instruction_md: |
        Ask the AI to write a short story about your pet.
        Include: your pet's name, where it lives,
        and one thing it loves.
      widget: story_write
      widget_config:
        length: short
        mood_presets: [happy, magical, funny]
      completion:
        type: artifact_saved
        kind: text
        min_words: 40
  acceptance:
    must_have_kinds: [text]
    min_words_total: 40
```

**Cost model**: 3⭐ per `story_write`; budget allows 1 attempt + 1 regen. `min_words: 40` is intentionally low — the goal is *getting one written*, not length.

**Safety notes**:
- Story text post-screen for PII patterns (real names / addresses) — soft warn, audit-flag, don't block (per `learn-projects-prd.md` §10)
- `mood_presets` excludes `spooky` / `sad` at age 8–10 — those exist in other packs (e.g. teen story lab) but felt jarring for the AI Pet emotional arc

---

## 7. Mission 3 — Hear it speak

```yaml
- slug: hear-it-speak
  title: "Hear it speak"
  order_index: 3
  estimated_stars: 3
  content_md: |
    Your pet has a voice! Let's hear it say hello.
  steps:
    - id: step_1
      title: "What does your pet say?"
      instruction_md: |
        Write one sentence your pet would say.
        Example: "Hi! I'm Spark the dragon and I love marshmallows."
      widget: voice_create
      widget_config:
        voice_presets: [friendly_kid, sparkly, robot]
        max_duration_sec: 8
      completion:
        type: artifact_saved
        kind: audio
  acceptance:
    must_have_kinds: [audio]
```

**Cost model**: 1⭐ per `voice_create` (TTS is cheap); budget allows 3 attempts.

**Safety notes**:
- `max_duration_sec: 8` caps server cost + prevents long unguarded utterances
- TTS output doesn't go through content moderation post-screen at V0 (we trust DeepRouter `/v1/audio/speech` output); pre-screen on the text prompt is enough

---

## 8. Mission 4 — Show your class

```yaml
- slug: show-your-class
  title: "Show your class"
  order_index: 4
  estimated_stars: 3
  content_md: |
    Time to put it all together and share with your classmates! 🎉
  steps:
    - id: step_1
      title: "Combine into a tiny storybook"
      instruction_md: |
        Press the magic button to put your image + story + voice together
        into a little PDF you can keep forever.
      widget: read_only
      widget_config:
        show_combine_button: pdf_storybook
      completion:
        type: artifact_saved
        kind: project_export
    - id: step_2
      title: "Send to your class"
      instruction_md: |
        Send your AI pet to your class wall.
        Your teacher will say yes before classmates can see it.
      widget: share_to_class
      completion:
        type: share_request_submitted
  acceptance:
    must_have_kinds: [image, text, audio, project_export]
```

**Cost model**: 2⭐ for the PDF combine (per `learn-projects-prd.md` §6.1), 0⭐ for share. Total 2⭐ — the 1⭐ headroom in `estimated_stars: 3` covers a re-export.

**Safety notes**:
- `share_to_class` creates a `ShareRequest` → teacher review queue (per `learn-classroom-prd.md` §3) — kid sees Mission as "complete" the moment they submit, even before teacher approves
- The PDF combine re-runs content moderation on each input artifact; export fails if any artifact has `audit.flagged=true`

---

## 9. Pack-level acceptance & completion reward

Pack acceptance is the **union of all Mission acceptances** plus an order requirement: kid must complete Missions 1→4 in `order_index` order (no skipping).

Completion of all 4 Missions:
- Awards `+12⭐` (4 × `+3⭐` per Mission completion reward, per `learn-missions-prd.md` §6 / D-M3)
- Emits `coursepack.completed` AuditEvent — first time it appears in `super-admin-prd.md` §5.7.2 funnel as "first-pack completion"
- Surfaces in `teacher-console` `/students/:kid` as a course-completion milestone (V1+ — V0 just shows individual Mission completions)

No physical / external reward at V0 (no badges, no certificates, no merch). V1+ may add a printable certificate template.

---

## 10. Teacher notes — how to run AI Pet Lab in class

**Recommended class shape**:
- 4 sessions × 30 min, one Mission per session — or 1 × 2-hour "AI Pet day"
- 4–6 kids per teacher (per `Class.max_students` default in `platform-backend-api-spec.md` §4.3)
- Teacher should run through the pack themselves before the first class — `/admin/system/impersonate` a test kid account (admin only)

**Per-session script** (teacher facing — lives in teacher-console `/classes/:id` runbook, V1+):
1. **Session 1 (Mission 1)** — discuss what makes a pet feel real; let kids brainstorm 30 seconds before typing. *Teacher watches for*: kids who try to describe themselves or other kids (PII redirect needed).
2. **Session 2 (Mission 2)** — read 2–3 stories aloud as a class warm-up to seed ideas.
3. **Session 3 (Mission 3)** — voice step is fast; use remaining time for kids to redo earlier missions.
4. **Session 4 (Mission 4)** — Live Mode on; teacher approves shares as they come in; end with everyone viewing the wall together.

**Teacher review queue load**: expect 1 ShareRequest per kid at Mission 4 = ~6/class. Each review takes ~30s. Plan for 5 min at end of session.

**Common stuck patterns** (V0 stuck detection per `teacher-console-prd.md` §4.5):
- Kid stuck on Mission 1 step 1 → usually prompt too vague; teacher prompts them with "what colour? what does it eat?"
- Kid stuck on Mission 2 step 2 → re-generate budget ran out; teacher can grant +3⭐ via Approval

---

## 11. Parent notes — what your kid produces

Surfaced in `/portal/audit/project/:id` parent replay (per `parent-portal-prd.md`):
- 1–3 image variations (kid keeps favourite)
- 1 short story (≥40 words; sometimes much more)
- 1 voice clip (≤8 seconds)
- 1 PDF storybook (the takeaway — downloadable forever)
- 1 class-shared post (default invisible outside the class)

**Approximate parent cost**: 14⭐ (`estimated_stars`) ≈ 1 day of typical 20⭐ daily cap. **Net wallet impact**: ~2⭐ refunded via Mission completion rewards (4 × +3⭐ = 12⭐ back), so AI Pet Lab is **near-net-zero** for a well-budgeted kid.

---

## 12. Compliance posture

| Compliance item | How this pack honors it |
|---|---|
| C5 (no open chat) | Every step is a single widget invocation; no free-form chat at any point |
| C7 (full audit) | Every LLM call emits AuditEvent; pack completion emits `coursepack.completed` |
| C8 (Stars budget) | Pack `estimated_stars: 14` fits under default daily cap of 20⭐ even for new accounts |
| C9 (moderated UGC) | Mission 4 share goes through teacher review queue; no auto-publish |
| C10 (no real names) | Pet name is fictional; story text screened for PII patterns |
| C13 (incident response) | Standard wall/safety pipeline applies |

This pack is **safe to launch in V0** without additional compliance review beyond the platform baseline.

---

## 13. Implementation steps

To get AI Pet Lab live in production:

1. **Seed file** — copy the Mission YAML blocks above (§§5–8) into a single file at `platform-backend/prisma/seed/missions/ai-pet-lab-v1.yaml`, prefaced by the §3 pack metadata header
2. **Run seeder** — `pnpm run seed:missions` from `platform-backend/` root (Prisma seeder picks up the YAML, idempotent on `slug + version`)
3. **Verify in editor** — log into `teacher-console` as admin, open `/admin/course-packs`, confirm `ai-pet-lab-v1` appears as `Draft 1.0.0` with 4 missions
4. **Pre-flight test** — admin impersonates a test kid account (per `super-admin-prd.md` §5.4), runs the full pack end-to-end in a sandbox class, verifies acceptance gate fires correctly on Mission 4 submit
5. **Publish** — click **Publish** in `/admin/course-packs` → `<StepUpGate>` prompts for TOTP (D-M8 / D-SA4) → `POST /course-packs/:id/publish` flips `is_published=true`
6. **Assign to a Class** — teacher creates a Class with `course_pack_id=ai-pet-lab-v1` (`teacher-console-prd.md` §4.3)

**Rollback**: if a problem is found post-publish, admin clicks **Unpublish** (also TOTP step-up). Kids mid-pack finish their current Mission and see a polite "this course has been updated" notice. Bump version (`1.0.1`) and re-publish.

---

## 14. Out of Scope (this pack — V0)

- ❌ Branching: every kid does the same 4 missions in the same order
- ❌ Difficulty variants (no `easy` / `hard` toggle)
- ❌ Multi-language: en-AU only at V0
- ❌ Music mission: AI Pet Lab is image+text+voice; music is in a separate pack (`music-maker-v1`, planned)
- ❌ Video mission: too long-running for an intro pack
- ❌ Teacher-customizable steps: admin-authored, locked content per D-M6

---

## 15. Open Questions

| # | Q | Owner | Impact |
|---|---|---|---|
| QPACK-1 | Should Mission 2 `min_words: 40` be lower (30) given some 8-year-olds find 40 words hard? | Curriculum | Affects acceptance pass rate; needs first-cohort data |
| QPACK-2 | Should we offer an "AI Pet Lab v1 — short" (2 missions, image + share) for sub-15-min classroom slots? | Product | Adds catalog entry; not a different schema |
| QPACK-3 | Mission 4 PDF combine — kid downloads it themselves, or does it auto-email to parent? | Product | Engagement vs friction |
| QPACK-4 | When a kid completes AI Pet Lab, should we auto-recommend the next pack on the completion screen? | Product | Cross-sell into Music Maker / Story Lab |

---

## 16. Revision History

- **v0.1 — 2026-05-25** — Initial draft. Reference Course Pack for V0 launch. Validates the Mission engine spec (`learn-missions-prd.md`) end-to-end with 4 real missions, full YAML, curriculum alignment to AU DT F-10, teacher script, parent notes, compliance mapping, and the publish workflow per D-M8 / D-SA4.
