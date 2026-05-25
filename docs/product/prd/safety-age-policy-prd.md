# Safety — Age-Banded Policy — PRD

> **Status**: Draft v0.1 · 2026-05-25
> **Scope**: Cross-cutting — the **data model + age-band matrix** that the prompt firewall, response moderation, and PII protection PRDs all read from. **Foundation doc** — other safety PRDs depend on this one.
> **Author**: Airbotix engineering
> **Depends on**: `platform-backend-api-spec.md` §4.1 (`KidProfile.age` / `date_of_birth`) · `auth-system-prd.md` (kid auth context)
> **Parallel** (consumers of this PRD):
> - [`safety-prompt-firewall-prd.md`](./safety-prompt-firewall-prd.md) — reads topic blacklist + classifier thresholds
> - [`safety-response-moderation-prd.md`](./safety-response-moderation-prd.md) — reads output content thresholds
> - [`safety-pii-protection-prd.md`](./safety-pii-protection-prd.md) — reads PII WARN-vs-BLOCK mode
> **Implementation owner**: platform-backend (Prisma model + read API + cache) · super-admin UI (`teacher-console-prd.md` §4.16 / `super-admin-prd.md`)

---

## 1. Purpose

Today, **every kid on Airbotix gets the same safety filter** — an 8-year-old and a 14-year-old see identical prompt blacklists and identical output thresholds. This is the single biggest gap surfaced in the safety audit (2026-05-25): a filter calibrated for an 8-year-old will frustrate a 14-year-old building a real coding project; a filter calibrated for a 14-year-old will let through content that's wrong for an 8-year-old.

This PRD specifies the **`SafetyPolicy` data model and the per-age-band matrix** that drives all kid-safety filtering decisions. It does **not** specify the filtering pipelines themselves (those live in the three sibling PRDs above) — it specifies the **config they read**.

**Design principle (D-SP1)**: One source of truth for all age-banded safety thresholds. Magic numbers like "block at score ≥ 0.2" must never appear as constants in code — they read from `SafetyPolicy` at request time.

---

## 2. Age bands

Four bands, derived from `KidProfile.age` at request time:

| Band | Age range | Maps to | Notes |
|---|---|---|---|
| **early** | 6–8 | Pre-Line-A / kindergarten edge | Strictest — kid may be reading at Grade 1–2 |
| **core_a** | 9–11 | Line A — AI Creative Lab default | Our primary launch audience |
| **early_b** | 12–14 | Line B early — first AI coding | Coding context allowed; romance still blocked |
| **late_b** | 15–17 | Line B advanced | Close to adult-tier filter; few hard blocks |

**Band resolution** (D-SP2): always from `KidProfile.date_of_birth` if present (accurate as of request time), else from `KidProfile.age` (stored at registration, may be stale by months). Birthday-day re-classification happens automatically — no manual policy switch needed.

**Edge cases**:
- Kid under 6 → reject account creation entirely (compliance C2; minimum age is 6)
- Kid 18+ → not a kid; route through adult flow (different PRD entirely)
- Age field missing on legacy `KidProfile` → default to `core_a` and surface a "please update your child's age" prompt in parent portal

---

## 3. Data model

> Add to `platform-backend-api-spec.md` §4 (Safety section, sits alongside `Incident` model).

```prisma
model SafetyPolicy {
  id              String   @id @default(cuid())
  band            AgeBand  @unique                  // 'early' | 'core_a' | 'early_b' | 'late_b'
  version         String                            // semver, immutable per release (e.g. "1.0.0")
  is_active       Boolean  @default(true)

  // Topic policy — strings drawn from a closed taxonomy (§5)
  blocked_topics    String[]                        // hard block — never reach LLM
  warned_topics     String[]                        // soft warn — kid sees nudge, allowed if confirmed
  allowed_topics    String[]                        // explicit allowlist (for code/STEM contexts where defaults would over-block)

  // Classifier thresholds (0.0 = strict / 1.0 = loose)
  prompt_classifier_threshold   Float               // reject prompt if classifier score ≥ this
  response_text_threshold       Float               // reject text output if classifier score ≥
  response_image_nsfw_threshold Float               // image NSFW score ≥
  response_image_violence_threshold Float

  // PII handling
  pii_real_name_mode  PiiMode                       // 'warn' | 'block'
  pii_address_mode    PiiMode
  pii_phone_mode      PiiMode
  pii_email_mode      PiiMode
  pii_school_mode     PiiMode

  // Sustained-pattern detection (M rejections in N seconds → escalate to teacher + parent)
  pattern_window_sec  Int                           // 300 (5min) for early; 1800 (30min) for late_b
  pattern_threshold   Int                           // 2 for early; 7 for late_b

  // Daily Stars cap (default — parent can override per-kid up to a ceiling)
  default_daily_stars_cap Int                       // 10 / 20 / 30 / 40 per band
  parent_override_max     Int                       // 50 / 100 / 200 / 500 per band

  // Audit
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  updated_by      String                            // User.id of last editor (admin/super_admin)

  @@index([band, is_active])
}

enum AgeBand   { early core_a early_b late_b }
enum PiiMode   { warn block }
```

**Versioning** (D-SP3): a `SafetyPolicy` row is **immutable once `is_active=true`**. Editing creates a new row with bumped `version`; old row is marked `is_active=false`. This keeps an audit trail of "which policy was live when this prompt got rejected" — critical for compliance evidence and dispute resolution.

**Resolution**: at request time `platform-backend` reads `SafetyPolicy WHERE band=<kid_band> AND is_active=true` — exactly one row per band. Cached in-process 60s; cache busted on policy update via WS event `safety.policy.updated`.

---

## 4. V0 default matrix

> **Editable in production via super-admin UI** (see §6); the values below are the **launch defaults** that ship in seed data (`platform-backend/prisma/seed/safety/policy-v1.yaml`).

| Field | **early (6–8)** | **core_a (9–11)** | **early_b (12–14)** | **late_b (15–17)** |
|---|---|---|---|---|
| **blocked_topics** | violence, weapons, romance, drugs, gambling, scary, body, gore, war, hate, profanity | violence, weapons, romance, drugs, gambling, gore, hate, profanity | weapons (real-world), drugs, gambling, gore, hate, sexually-explicit | sexually-explicit, instructions-for-self-harm, instructions-for-violence |
| **warned_topics** | scary-mild, conflict-mild | scary-mild, conflict-mild, romance-light | conflict, romance-light, mature-themes | mature-themes |
| **allowed_topics** (override) | — | — | code-syscall, code-network, code-fs (when in Code Studio context) | code-syscall, code-network, code-fs, security-research-edu |
| **prompt_classifier_threshold** | 0.10 | 0.20 | 0.40 | 0.60 |
| **response_text_threshold** | 0.10 | 0.20 | 0.40 | 0.60 |
| **response_image_nsfw_threshold** | 0.02 | 0.05 | 0.20 | 0.40 |
| **response_image_violence_threshold** | 0.05 | 0.10 | 0.25 | 0.45 |
| **pii_real_name_mode** | block | block | warn | warn |
| **pii_address_mode** | block | block | block | warn |
| **pii_phone_mode** | block | block | block | warn |
| **pii_email_mode** | block | block | block | warn |
| **pii_school_mode** | block | block | warn | warn |
| **pattern_window_sec** | 300 | 600 | 900 | 1800 |
| **pattern_threshold** | 2 | 3 | 5 | 7 |
| **default_daily_stars_cap** | 10 | 20 | 30 | 40 |
| **parent_override_max** | 50 | 100 | 200 | 500 |

**Reading the matrix**:
- Thresholds get **looser** as age rises (smaller number = stricter; larger = more permissive)
- PII modes flip from `block` → `warn` between `core_a` and `early_b` for real-name (a 12-year-old needs to be able to say "I'm Mia and I built this" in their own code project)
- **Address / phone always blocked for under-15** — no business case for under-15s to type their address into anything
- Pattern detection window *expands* with age (older kids get more time before "sustained pattern" trips)
- Daily Stars cap rises with age (older kids = more ambitious projects)

---

## 5. Topic taxonomy (closed enum)

The strings in `blocked_topics` / `warned_topics` / `allowed_topics` **must** come from this enum. The prompt firewall and response moderation classifiers map their output to these categories.

```typescript
type Topic =
  // Hard categories (commonly blocked)
  | 'violence' | 'weapons' | 'romance' | 'drugs' | 'gambling'
  | 'scary' | 'body' | 'gore' | 'war' | 'hate' | 'profanity'
  | 'sexually-explicit' | 'instructions-for-self-harm' | 'instructions-for-violence'
  // Soft categories (commonly warned)
  | 'scary-mild' | 'conflict' | 'conflict-mild' | 'romance-light' | 'mature-themes'
  // Code-context allowlist (only meaningful when Code Studio is the surface)
  | 'code-syscall' | 'code-network' | 'code-fs' | 'security-research-edu';
```

**Adding a new topic** requires a v0.x bump of this PRD + a coordinated update to:
1. The classifier model's category list (DeepRouter side)
2. All four `SafetyPolicy` rows (super-admin assigns the new topic to one of block/warn/allow per band)
3. `audit-event-schema-prd.md` if the topic gets its own incident kind

---

## 6. Editing policy in production

**Who can edit**: `super_admin` only. Admin role can *view* but cannot edit (D-SP4 — affects every kid on the platform; same blast radius as wallet-defaults).

**Where**: `super-admin-prd.md` §4 capability matrix — add row "Edit SafetyPolicy" → `PATCH /admin/system/safety-policy/:band` → page `/admin/system/safety` → step-up ✓.

**Edit flow** (frontend):
1. Super-admin opens `/admin/system/safety`, selects a band → renders current matrix
2. Edits any field → diff preview rendered
3. "Preview impact" button → runs *test prompts* (a fixed test set per band, ~50 prompts) through the new policy in dry-run mode → shows "would have changed N decisions: X rejections → Y rejections"
4. "Apply" → `<StepUpGate>` TOTP → `PATCH .../safety-policy/:band` → new row inserted with bumped version, old row `is_active=false`
5. WS event `safety.policy.updated` propagates; all platform-backend instances drop their 60s cache and reload

**Rollback**: super-admin can "Reactivate version X" — looks up old row by `(band, version)`, flips it to `is_active=true`, current row → false.

---

## 7. Audit event contract

This PRD itself does not emit per-request safety events (those live in the firewall / moderation / PII PRDs). It emits two **policy-lifecycle** events:

| Event | Actor | Payload |
|---|---|---|
| `safety.policy.published` | super_admin | `{ band, version, diff: {...}, prev_version }` |
| `safety.policy.rollback` | super_admin | `{ band, restored_version, was_version }` |

Both are stored with `retention=permanent` (compliance evidence — we must be able to answer "what policy was active when this 2027 incident happened" in 2030).

---

## 8. Parent visibility

Parents **cannot** view or edit the global `SafetyPolicy` (it's platform-wide, not per-family). What parents see in `/portal/family/:kidId/settings`:

- Read-only summary: "Your child is currently in age band **9–11 (core_a)**. This means [3 bullet plain-English summary]."
- **Per-kid overrides** (within band caps): parent can *tighten* but not loosen. E.g. parent can flip `pii_real_name_mode` from `warn` to `block` for their 13-year-old, but cannot flip `block` to `warn`.
- The override mechanism is a separate model `KidSafetyOverride` (D-SP5) — out of scope V0; tracked here for V1.

**V0 launch posture**: no parent overrides; everyone gets the band default. Parent transparency = a "Safety summary" panel in `/portal/family/:kidId` that renders 6–8 plain-English bullets explaining what gets blocked at this kid's age.

---

## 9. Failure modes

| Scenario | Behavior |
|---|---|
| `SafetyPolicy` row missing for a band (data corruption) | platform-backend **rejects all LLM calls** for kids in that band with 503; pages on-call; never falls back to a more permissive band |
| Cache stale (policy edited but not yet propagated) | Up to 60s of old-policy decisions; not a safety issue (old policy is by definition already vetted) |
| Kid's `KidProfile.age` and `date_of_birth` disagree | Trust `date_of_birth` (it's the legal one); audit-flag the mismatch for parent reconciliation |
| Topic taxonomy mismatch (classifier returns a topic not in our enum) | Treat as `unclassified` → use the band's default `prompt_classifier_threshold` against the raw score; audit-flag for review |

---

## 10. Out of scope (V0)

- ❌ `KidSafetyOverride` per-kid tightening UI (V1+ — parent panel)
- ❌ Per-family base policy ("our family is stricter than default") — too much complexity; revisit V2 if institutional contracts demand
- ❌ Per-Class teacher overrides ("this class is doing a Romeo & Juliet unit, please allow romance-light") — too easy to abuse; teacher can request a CoursePack-level allowlist exception via admin instead
- ❌ Real-time A/B testing of policies (multivariate safety experiments are scientifically + ethically fraught with minors)
- ❌ Multi-region policy variation (when EU comes online, may need stricter band defaults — V2)

---

## 11. Decision Records

| # | Decision | Why |
|---|---|---|
| D-SP1 | One source of truth — no safety thresholds as code constants. | Otherwise super-admin can't fix a problem without a deploy; audit can't tell what was live when. |
| D-SP2 | Band resolution = `date_of_birth` if present else `age`. | DOB is legal source of truth; age field drifts over time. |
| D-SP3 | Immutable policy rows; edits create new versions. | Audit + compliance evidence; "what policy was live in 2027" must be answerable in 2030. |
| D-SP4 | Edit is `super_admin` only; admin is view-only. | Same blast radius as `wallet-defaults`; reuses the step-up + audit posture (`super-admin-prd.md` §3.2). |
| D-SP5 | V0 has NO parent override mechanism. | Ship the platform default; V1 adds `KidSafetyOverride` only if parents ask for tightening (loosening will never be allowed). |
| D-SP6 | Fail-closed on missing policy row. | A missing-config bug must never silently relax safety; better to break the surface than ship without policy. |
| D-SP7 | Topic taxonomy is **closed** — adding a topic needs a PRD bump. | Open taxonomies drift; classifier alignment + per-band assignment must be coordinated. |

---

## 12. Open Questions

| # | Q | Owner | Impact |
|---|---|---|---|
| QSP-1 | The 4 bands (6-8 / 9-11 / 12-14 / 15-17) — is the boundary at 12 right? Some 11-year-olds are doing serious Scratch coding and would chafe at `core_a` restrictions. | Curriculum + Product | Could split `core_a` into 9-10 / 11 |
| QSP-2 | When DeepRouter classifier returns a confidence score, is it linear? `0.10` strict vs `0.20` moderate — is `0.15` halfway between in practice, or does the classifier saturate? | Engineering | Affects whether the threshold values are usable as continuous knobs |
| QSP-3 | Should `parent_override_max` exist at all at V0, or remove until V1 brings the actual override UI? | Engineering | Currently a dead field; could be added in V1 with the override model |
| QSP-4 | If a kid creates a Project in `core_a` then ages up to `early_b` mid-project, does the project's already-saved content get re-screened against the new band? | Product | Probably no (compliance: don't punish past behavior under stricter retroactive rules) but parent might expect yes |
| QSP-5 | Test-prompt set for the "Preview impact" feature (§6 step 3) — does Curriculum or Engineering own maintaining it? Needs ~50 prompts per band. | Curriculum | Quality of preview = quality of the test set |
| QSP-6 | When a parent tightens (V1), does that override become visible to the kid (e.g. "your parent has set stricter rules") or silent? | Product / Safety | Affects kid trust + parent autonomy trade-off |

---

## 13. Revision History

- **v0.1 — 2026-05-25** — Initial draft. Foundation for the safety gateway split. Defines `SafetyPolicy` Prisma model, four age bands, V0 default matrix (block/warn/allow topics + classifier thresholds + PII modes + pattern detection + Stars caps), closed topic taxonomy, super-admin editing flow (TOTP step-up + dry-run preview + versioned immutability), parent read-only visibility, 7 decision records D-SP1…D-SP7.
