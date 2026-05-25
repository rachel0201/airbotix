# My Works (Projects) — `/learn/projects/*` — PRD

> **Status**: Draft v0.1 · 2026-05-25
> **Repo**: `Airbotix-AI/airbotix-app` (React + Vite SPA — `/learn/*` surface)
> **Domain**: `app.airbotix.ai`
> **Author**: Airbotix engineering
> **Upstream**: `kids-ai-platform-prd.md` · `airbotix-app-learn-prd.md` §5.6 / §5.7 (origin, now superseded by this doc)
> **Depends on**: `platform-backend-api-spec.md` §4.4 (`Project` / `Artifact` / `ShareRequest`) · §5.7 (`/projects` endpoints) · `auth-system-prd.md`
> **Parallel**: `learn-missions-prd.md` (Missions create + write into Projects) · `learn-classroom-prd.md` (Projects flow outward via ShareRequest) · `parent-portal-prd.md` (parents read Projects in `/portal/audit/project/:id`)
> **Implementation owner**: airbotix-app frontend + platform-backend

---

## 1. Purpose

**My Works** is the kid's personal portfolio + workbench. A `Project` is a container that holds every creative artifact a kid made in one cohesive piece of work: images, story text, voice clips, music, video, and the optional *combined* exports (PDF storybook, slideshow video).

Projects exist because:
- Kids 8-11 need *one place* their stuff lives — not a per-tool folder
- A "made it" moment (the takeaway artifact a kid shows mum or the teacher) needs an explicit "combine" step, not an implicit pile of files
- Sharing — to classroom, to parent, to public — must be **per-Project**, not per-artifact, so consent is granular and reviewable

Projects **don't**:
- ❌ Auto-share or auto-publish anywhere; default `visibility=private` (family only)
- ❌ Allow kid-to-kid direct copy/remix at V0 (V1+ feature; needs moderation)
- ❌ Live forever — soft-deleted projects are purged after retention window (see §8)
- ❌ Hold artifacts a kid didn't make in this surface (no upload-from-camera at V0)

---

## 2. Information Architecture

```
app.airbotix.ai/learn/

├── /learn/projects                   My Works — list view
├── /learn/projects/:id               Project Workspace — single Project view
└── /learn/projects/:id/export/:jobId Export status view (modal or page)
```

Adjacent (cross-PRD):
- `/learn/missions/:slug` creates Projects with `mission_id` set (see [`learn-missions-prd.md`](./learn-missions-prd.md))
- `/learn/create/*` single-shot flows create or append to Projects (see `airbotix-app-learn-prd.md` §5.3-5.5)
- `/learn/classroom` reads Projects that have an approved `class` ShareRequest (see [`learn-classroom-prd.md`](./learn-classroom-prd.md))
- `/portal/audit/project/:id` parent view (read-only audit replay)

---

## 3. Data model (cross-ref)

> Authoritative schema: `platform-backend-api-spec.md` §4.4. Summary here:
>
> - `Project` — `family_id`, `kid_id`, optional `mission_id`, `title`, `visibility`, `s3_prefix`, `thumbnail_s3_key`, `star_cost_total`, `status`
> - `Artifact` — belongs to one Project; `kind ∈ {image,audio,video,text,code_file,project_export}`; immutable once uploaded
> - `ShareRequest` — per-Project, requests upgrade to `visibility=class` or `public`; needs teacher and/or parent review
>
> All artifact bytes live in S3 (ap-southeast-2 Sydney), keyed under `s3_prefix` (`fam_xxx/proj_yyy/`).

This PRD adds *no new tables* — it specifies the **client behavior, ⭐ accounting for combine exports, retention, and quotas** that aren't in the API spec.

---

## 4. List view — `/learn/projects`

> Source: `airbotix-app-learn-prd.md` §5.6.

```
┌─────────────────────────────────────────────────────────────────┐
│ 📂 My Works                                         + New Project│
│ Filter: [All]  [In progress]  [Finished]  [Shared with class]   │
│                                                                 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│ │ [thumbnail]  │ │ [thumbnail]  │ │ [thumbnail]  │             │
│ │ My Cat Story │ │ Robot in     │ │ Spark the    │             │
│ │ 5 items      │ │ Space card   │ │ Dragon       │             │
│ │ 🟡 working   │ │ ✓ finished   │ │ 🌟 in class  │             │
│ │ Yesterday    │ │ Last week    │ │ 2 weeks ago  │             │
│ └──────────────┘ └──────────────┘ └──────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

**Filter mapping** to `Project.status` + `Project.visibility`:
- All → no filter
- In progress → `status=in_progress`
- Finished → `status IN (submitted, accepted, archived)`
- Shared with class → `visibility=class`

**Sort**: `updated_at desc` (most recently touched first). Pagination 24 / page, infinite scroll on mobile.

**Empty state**: "Your works will show up here. Try making something on the home page!" with CTA to `/learn`.

**New Project**: opens a small modal asking title + optional starter tile (image / story / music / blank). Creates via `POST /projects` then deep-links to `/learn/projects/:id`.

---

## 5. Project workspace — `/learn/projects/:id`

> Source: `airbotix-app-learn-prd.md` §5.7.

```
┌─────────────────────────────────────────────────────────────────┐
│ ← My Works                                                      │
│ My Cat Story                              ⭐ 8 spent on this    │
│ [Edit title] [Share with class] [Download] [Delete]             │
│                                                                 │
│ ── Pieces of this project ──                                    │
│ Images (5)                              [+ Add image]           │
│ Story  (1)                              [+ Add story]           │
│ Voice  (1)                              [+ Add voice]           │
│ Music  (0)                              [+ Add music]           │
│                                                                 │
│ ── Make a storybook ──                                          │
│ [✨ Combine into PDF]   [📺 Make a video]                       │
└─────────────────────────────────────────────────────────────────┘
```

**Per-kind sections** render the kid's `Artifact[]` filtered by `kind`. Each artifact has:
- Inline preview (`<img>` for image, `<audio controls>` for audio, `<video controls>` for video, expandable for text)
- 3-dot menu: Rename · Replace (re-generate via the same widget) · Delete
- Created date + ⭐ cost badge

**Add buttons** open the corresponding `/learn/create/*` widget in a side panel; on save, the new Artifact attaches to this Project (no navigation away).

**Header actions**:
- **Edit title** — inline; PATCH `/projects/:id`
- **Share with class** — opens consent flow (see [`learn-classroom-prd.md`](./learn-classroom-prd.md) §3)
- **Download** — see §6 (Combine)
- **Delete** — confirm modal; soft delete (`deleted_at` set); recoverable from `/portal/audit` for 30 days

---

## 6. Combine / Export pipeline

This is the *takeaway moment*: the artifact a kid hands to mum or a teacher. **Missing from the source PRD; specified here.**

### 6.1 Two combine targets at V0

| Target | What it produces | ⭐ cost | Inputs required |
|---|---|---|---|
| `pdf_storybook` | PDF, ≤ 20 pages, image + story text auto-paginated | **2⭐** | ≥1 image AND ≥1 text |
| `slideshow_video` | MP4, 720p, ≤ 60s, images + ambient music + optional voice narration | **5⭐** | ≥2 images (audio optional) |

Targets are NOT user-defined templates at V0 — they're hard-coded layouts. V1+ may add themes.

### 6.2 Backend flow

1. Client `POST /projects/:id/export` `{ target: "pdf_storybook" | "slideshow_video" }`
2. Server validates inputs (kind counts), reserves ⭐ (soft hold via WalletTransaction `tx_type=export_hold`)
3. Server enqueues an async job → returns `{ job_id, status: "queued" }`
4. Worker (in `platform-backend`, BullMQ) renders:
   - **PDF**: server-side, headless Chrome → PDF; image fetch from S3 → layout template → PDF stream → upload to S3
   - **MP4**: ffmpeg in Docker; ken-burns on stills + audio mix → MP4 → S3
5. On success: create `Artifact kind=project_export`, finalize ⭐ debit (`tx_type=export_charge`), emit `project.export.done`, WS push to kid + parent
6. On failure: refund ⭐ (`tx_type=export_refund`), emit `project.export.failed`, kid sees friendly retry CTA

### 6.3 Job status UX

Client subscribes to WS event `project.export.<job_id>`; meanwhile shows:
- 0-10s: "Putting it together…" (spinner)
- 10-30s: "Adding the finishing touches…" (progress bar, indeterminate)
- 30s+: "Almost done — you can keep working, we'll ping you" (toast on completion)

Render budget targets (P95): PDF ≤ 15s, MP4 ≤ 45s. Server caps total job time at 120s; over → mark failed, refund.

### 6.4 Download

`POST /projects/:id/artifacts/:artifact_id/download-url` returns a 5-minute signed S3 URL. Click → download. Files are kept indefinitely until Project soft-delete + 30-day purge (see §8).

### 6.5 Re-export

Re-export of the same target on the same Project is a *new* job (charges ⭐ again, creates a new `Artifact`). Old export Artifacts stay until kid deletes them. Rationale: kids iterate on the underlying images/text; previous exports become stale and they want a fresh one.

---

## 7. Quotas & limits

| Resource | V0 limit | Rationale |
|---|---|---|
| Projects per kid | 50 active (non-deleted) | UI scroll + storage cost |
| Artifacts per Project | 100 | Beyond that, kid is clearly making a different thing |
| Single image file | ≤ 8 MB | DeepRouter image gen max output |
| Single audio file | ≤ 10 MB / ≤ 60s duration | TTS + music endpoint output cap |
| Single video file | ≤ 25 MB / ≤ 30s duration | Video gen endpoint cap |
| PDF export size | ≤ 30 MB | Headroom on 20 pages of images |
| Total S3 footprint / family | 5 GB | Triggers parent nudge to archive old projects |

Quota hit on artifact upload → server `413 PAYLOAD_TOO_LARGE` with `{ limit, current }`; client shows friendly "this file is too big — let's try a smaller one" with no ⭐ charge.

---

## 8. Retention & deletion

| Action | What happens to Artifact bytes |
|---|---|
| Kid clicks Delete on a Project | `deleted_at` set; bytes kept 30 days; visible in `/portal/audit` for parent recovery |
| 30 days after `deleted_at` | Background job purges S3 prefix; `Project` and `Artifact` rows hard-deleted; `AuditEvent` rows retain a `project_id` pointer but no replay possible |
| Family deletes account (`DELETE /families/:id`) | All Projects + S3 prefixes purged within 30 days (compliance C12 right-to-erasure) |
| Kid suspended (`POST /admin/kids/:id/suspend`) | Projects retained but invisible to kid; parent can still view + export |

Hard delete is asynchronous via a daily Lambda cron over `Project WHERE deleted_at < now() - interval '30 days'`. Always emits `data.purged` audit event with byte count.

---

## 9. Backend integration (cross-ref)

| Action | Endpoint |
|---|---|
| List family Projects | `GET /families/:id/projects` (parent) / `GET /kids/:id/projects` (parent/teacher) |
| Create Project | `POST /projects` |
| Read Project + artifacts | `GET /projects/:id` + `GET /projects/:id/artifacts` |
| Upload artifact | `POST /projects/:id/artifacts/upload-url` → PUT to S3 signed URL |
| Download artifact | `POST /projects/:id/artifacts/:artifact_id/download-url` |
| **Combine export** | `POST /projects/:id/export` *(new endpoint, this PRD — add to API spec §5.7)* |
| Share to class | `POST /projects/:id/share-request` |
| Delete Project | `DELETE /projects/:id` (soft) |

WS events on this surface:
- `project.export.<job_id>` — combine job progress/completion
- `artifact.created` — when a Mission step or `/learn/create/*` writes a new Artifact (live refresh)
- `share_request.resolved` — visibility upgrade decided

**API spec delta**: §5.7 needs the `POST /projects/:id/export` endpoint added. Backend session: please pick up.

---

## 10. Safety & audit

| Concern | Implementation |
|---|---|
| Kid puts real name / address in story text | Output post-screen for PII patterns; warn kid + audit-flag; do not block (would frustrate creative writing) |
| Kid uploads scraped image | No upload-from-device at V0; all artifacts come from `/llm/*` proxy which audits source |
| Export contains harmful content from earlier session | Re-render goes through same content-moderation gate; export job rejects if any input artifact has `audit.flagged=true` |
| Parent loses access (account deletion) | `DELETE /families/:id` retains 30-day grace; family head can restore via support |
| Cross-family data leak | Every Project query scoped by `family_id`; row-level enforced in NestJS guard; failing test is a release blocker |

All combine exports emit `project.export.done|failed` `AuditEvent` (`actor=system`); ⭐ movements emit standard `wallet.*` audit events. Parent sees both in `/portal/audit/project/:id`.

---

## 11. Out of Scope (V0)

- ❌ Upload artifacts from device (camera, file picker)
- ❌ Edit Markdown story text directly inside Project Workspace (text comes from `/learn/create/story` regen flow)
- ❌ Multi-kid collaborative Projects
- ❌ Custom combine layouts / themes / fonts
- ❌ Direct social share (kid-to-kid messaging, email-to-grandma)
- ❌ Public portfolio at `airbotix.ai/k/<nickname>` (V2+)
- ❌ Versioning / history of edits within a Project (only export Artifacts preserve past state)
- ❌ Project templates ("start from template")

---

## 12. Decision Records

| # | Decision | Why |
|---|---|---|
| D-P1 | Project is the **only** sharing unit. Artifacts cannot be shared individually. | Consent granularity matches the unit kids think in ("my dragon story"), and avoids the moderation nightmare of orphan images. |
| D-P2 | Combine exports cost ⭐ (PDF 2 / MP4 5) instead of being free. | Server compute is non-trivial; explicit ⭐ also signals "this is a real thing you're producing." |
| D-P3 | Combine targets are **closed** (`pdf_storybook` / `slideshow_video`) at V0. | Open templates explode the test matrix; ship V0 then add. |
| D-P4 | Soft-delete with **30-day grace**, then hard purge. | Parent recovery + compliance (C12) right-to-erasure; cron is the auditable purge mechanism. |
| D-P5 | **No upload-from-device** at V0. | Bypassing `/llm/*` proxy bypasses content moderation + audit; whole trust story breaks. |
| D-P6 | Export job is **async, server-rendered**, not client-side. | Deterministic output, server-side moderation re-check, kid can leave the page mid-render. |
| D-P7 | Quotas are **per-family** for storage, **per-kid** for project count. | Family is the billing unit (Stars + Airwallex); project count is a UX guardrail for a single kid. |

---

## 13. Open Questions

| # | Q | Owner | Impact |
|---|---|---|---|
| QP-1 | Should there be a way to *unshare* a Project from class (revoke a granted ShareRequest)? | Product | Likely yes — parent panic button |
| QP-2 | If a parent wants to download "everything for this kid", what's the bundle format? Zip per Project? One mega-zip? | Engineering | Compliance C12 export |
| QP-3 | Do export Artifacts (`kind=project_export`) count against the 100-artifact-per-Project quota? | Product | Should not — they're derived |
| QP-4 | When kid hits 50-Project limit, what's the UX? Block, force archive, soft warn? | Product | First-touch should be soft |
| QP-5 | PDF / MP4 rendering — start on EC2 same as backend or move to dedicated render worker? | Engineering | Cost vs latency |
| QP-6 | Should Mission-backed Projects be visible in `/learn/projects` while `in_progress`, or only after `accepted`? | Product | Affects whether kids see "half-done" cards as stress |

---

## 14. Revision History

- **v0.1 — 2026-05-25** — Promoted from `airbotix-app-learn-prd.md` §5.6 / §5.7 into a standalone PRD. **New content**: Combine/Export pipeline (§6, was 1 sentence in source), quotas (§7), retention & deletion (§8), decision records D-P1…D-P7. Flagged that `platform-backend-api-spec.md` §5.7 needs the new `POST /projects/:id/export` endpoint.
