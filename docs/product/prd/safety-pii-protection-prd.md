# Safety — PII Protection — PRD

> **Status**: Draft v0.1 · 2026-05-25
> **Scope**: Cross-cutting — detection + handling of personally-identifiable information at **3 checkpoints**: kid's prompt input, LLM output, Project artifact save. Used by the prompt firewall (Stage 2), the response moderator (text/code redaction), and the artifact save path.
> **Author**: Airbotix engineering
> **Depends on**: [`safety-age-policy-prd.md`](./safety-age-policy-prd.md) (per-band `pii_*_mode` flags) · `platform-backend-api-spec.md` §4.1 (`KidProfile`) + §4.4 (`Project` / `Artifact`)
> **Consumers**: [`safety-prompt-firewall-prd.md`](./safety-prompt-firewall-prd.md) §3.2 (Stage 2) · [`safety-response-moderation-prd.md`](./safety-response-moderation-prd.md) §3.1 (text PII redaction) · `learn-projects-prd.md` §10 (artifact save warning)
> **Compliance**: `docs/product/compliance/minors-compliance.md` C7 (data minimization), C10 (real names off-platform), C12 (right to erasure)
> **Implementation owner**: platform-backend (detection service + integration points) · airbotix-app frontend (kid-facing warn UX) · super-admin (PII pattern library editor)

---

## 1. Purpose

"Forbid Saving real names / addresses / contact info to projects; warn on detect" — that's the entire current PII spec, one line in `airbotix-app-learn-prd.md` §9. This PRD makes it real:

- **What counts as PII?** Closed taxonomy with detection rules
- **How do we detect?** Regex (deterministic) + NER (stochastic) + dictionary (school names, suburbs)
- **What do we do?** WARN vs BLOCK decision tree, per age band, per PII category
- **What does the kid see?** Friendly text, never legal jargon
- **What does the parent see?** Sanitized summaries — never raw PII

**Design principle (D-PI1)**: We are **stricter on input than on output**. Kid typing their address into a prompt is a leak in progress (the prompt goes to the LLM provider's logs). LLM *generating* an address in a story is a model hallucination (redactable in place). So: input has stronger BLOCK posture, output preferred to redact.

---

## 2. PII taxonomy

Closed enum. Adding a category requires a PRD bump + classifier update.

```typescript
type PiiCategory =
  // Kid's own data
  | 'kid_real_name'      // real first/last name (vs nickname)
  | 'kid_address'        // street + suburb / postal code
  | 'kid_phone'          // phone number
  | 'kid_email'          // email address
  | 'kid_school'         // school name
  | 'kid_dob'            // exact date of birth
  // Family data
  | 'parent_name'        // parent / guardian real name
  | 'parent_email'       // parent contact email
  | 'parent_phone'       // parent contact phone
  | 'sibling_name'       // brother / sister name
  // Location / geo
  | 'postal_code'        // any postal code (AU 4-digit etc.)
  | 'gps_coordinate'     // lat,lng pairs
  | 'precise_location'   // specific landmark + identifier ("Mum's office at 123 George St")
  // Credentials / secrets (appear in code mostly)
  | 'api_key'            // looks-like-API-key strings
  | 'password'           // labeled passwords or password-shaped strings in context
  | 'private_key'        // PEM-style headers
  // Photo (V1 — currently no upload at V0 per learn-projects D-P5)
  | 'face_photo';
```

**Note**: `kid_real_name` and `kid_school` are *KidProfile fields the family may have set* — we know what to detect. `kid_address`, `parent_email` etc. come from family profile too. For unknown-but-PII-shaped values (some random name in a story), we use NER.

---

## 3. Detection mechanisms

Three layers, run in parallel. Highest-confidence hit wins.

### 3.1 Family-profile dictionary lookup

If kid's family has set values (real name, school, address) in `KidProfile` / `Family`, **those exact strings + close variants** match deterministically.

```typescript
const familyData = await getFamilyPiiDictionary(kid.family_id);
// Returns: { kid_real_name: ['Mia', 'Mia Wang'], parent_name: ['Lightman Wang'],
//            address_tokens: ['10 Smith St', 'Smith St', 'Bondi', '2026'],
//            school: ['Bondi Public School'], ... }

function dictMatch(text: string, dict: FamilyDict): PiiHit[] {
  // Case-insensitive token + substring; minimum 4-char match to avoid false positives on 'Mum'
}
```

**Lowest false-positive rate**, highest confidence. Always block-eligible.

### 3.2 Regex patterns

```typescript
const PATTERNS: Record<PiiCategory, RegExp> = {
  kid_phone:    /\b(?:\+?61\s?)?(?:0?[2-478](?:[\s.-]?\d){8}|\d{4}[\s.-]?\d{3}[\s.-]?\d{3})\b/g, // AU
  kid_email:    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  postal_code:  /\b\d{4}\b/g,        // AU 4-digit; coarse — needs context to confirm
  gps_coordinate: /-?\d{1,3}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}/g,
  api_key:      /(?:sk|pk|api|key)[-_][A-Za-z0-9]{20,}/g,
  password:     /(?:password|passwd|pwd)\s*[:=]\s*['"]?[^\s'"]{6,}/gi,
  private_key:  /-----BEGIN (?:RSA )?PRIVATE KEY-----/,
  kid_dob:      /\b(?:0?[1-9]|[12]\d|3[01])[\/\-.](?:0?[1-9]|1[0-2])[\/\-.]\d{2,4}\b/g,  // AU DD/MM/YYYY
};
```

**Versioned**: `safety/pii-patterns-v1.yaml`; super-admin can update via `/admin/system/safety/pii-patterns` (TOTP step-up).

### 3.3 NER (named-entity recognition)

For unstructured names + addresses not in family dictionary. Uses a small in-process model (spaCy `en_core_web_sm` or equivalent), no external API call required.

```typescript
const entities = await ner.extract(text);
// entities: [{ text: 'Sarah Johnson', label: 'PERSON', start: 12, end: 25, confidence: 0.92 }, ...]

const hits: PiiHit[] = [];
for (const e of entities) {
  if (e.label === 'PERSON' && e.confidence >= 0.8 && !isCommonFictionalName(e.text))
    hits.push({ category: 'kid_real_name', value: e.text, source: 'ner', confidence: e.confidence });
  if (e.label === 'ORG' && isLikelySchool(e.text))
    hits.push({ category: 'kid_school', value: e.text, source: 'ner_dict' });
  if (e.label === 'LOC' && hasStreetPattern(text, e))
    hits.push({ category: 'kid_address', value: e.text, source: 'ner_pattern' });
}
```

**`isCommonFictionalName` allowlist**: exempts famous fictional names (Harry Potter, Elsa, Spider-Man, etc.) — kids should be able to write stories about them. List version-controlled at `safety/fictional-names-v1.yaml`, ~2000 entries, updated quarterly.

**Latency**: 10–30ms per prompt (NER warmed model in-process). Stage 2 of prompt firewall budgets for this.

---

## 4. WARN vs BLOCK decision tree

The **mode** (`warn` / `block`) comes from `SafetyPolicy.pii_<category>_mode` per the kid's age band (see `safety-age-policy-prd.md` §4 default matrix). The **decision** wraps it with direction + occurrence count + special cases.

```
On detect of <category> at <direction> for kid in <band>:
        │
        ├── direction = 'output' ────▶ always REDACT inline (D-PI1)
        │                              never reject the whole output for PII alone
        │
        ├── category = 'parent_email' / 'parent_phone' ────▶ always BLOCK (D-PI3)
        │                              regardless of band; kid can never send parent's contact
        │
        ├── category = 'kid_real_name' AND value matches family dict
        │   ├── direction = 'input' AND surface = 'workspace' or 'story' ──▶ allow with audit
        │   │   (kid saying their own name once in a story is fine)
        │   ├── direction = 'input' AND count_in_session >= 3 ────────────▶ WARN
        │   └── direction = 'input' AND count_in_project >= 5 ────────────▶ BLOCK + audit
        │
        ├── category in (kid_address, postal_code, gps_coordinate)
        │   └── always BLOCK for early / core_a / early_b bands
        │       late_b: WARN per policy
        │
        ├── category = api_key / password / private_key
        │   ├── direction = 'input' ─────▶ BLOCK (and audit-flag — kids should never type these)
        │   └── direction = 'output' ────▶ REDACT inline (see safety-response-moderation §7.3)
        │
        ├── code surface AND value matches *@example.{com,org} or 555-01XX (sample-data exception)
        │   └── ALLOW (NIST/IANA reserved for examples)
        │
        └── default ─────▶ use SafetyPolicy.pii_<category>_mode for the kid's band
```

**Examples** (kid in `core_a` band, age 10):

| Input | Detection | Decision |
|---|---|---|
| "Draw a picture for Mia" (kid's real name = Mia) | dict hit `kid_real_name` | ALLOW + audit (first occurrence in surface) |
| "Mia loves Mia and Mia plays" | dict hit ×3 in one prompt | WARN ("looks like you typed your name a lot — that's okay, but let's keep it private!") |
| "My address is 10 Smith St" | dict hit `kid_address` | BLOCK ("Let's not share where you live — keep it secret! 🤐") |
| "My friend Sarah is 9" | NER hit `kid_real_name` (not in dict) | BLOCK (`core_a.pii_real_name_mode = block`) |
| "draw Hermione Granger" | NER hit `kid_real_name` → fictional allowlist | ALLOW |
| "email is mum@example.com" | regex hit `parent_email` BUT matches example.com | ALLOW (code/sample exception) |
| "call me on 0412345678" | regex hit `kid_phone` | BLOCK |

---

## 5. Friendly kid-facing messages

Keyed by `(category, mode, age_band)`. `core_a` examples:

| Category | Mode | Message |
|---|---|---|
| kid_real_name | block (≥5 occurrences) | "You've typed your name a lot! Let's keep it private from the AI — try 'me' instead?" |
| kid_real_name | warn (≥3 occurrences) | "Looks like you're typing your name a lot — that's okay! But it's safer to say 'me'." |
| kid_address | block | "Let's not share where you live — keep it secret! 🤐 Try a made-up place?" |
| kid_phone | block | "Phone numbers should stay private. Skip that bit?" |
| kid_email | block | "Email addresses should stay private. Try just 'my email'?" |
| kid_school | block | "Let's not name your school — keep it secret! Try 'my school'?" |
| parent_name | block | "Let's keep grown-ups' names out of here — try 'my mum' or 'my dad'?" |
| parent_email/phone | block | "Mum and Dad's contact info is private — let's not share it!" |
| api_key | block | "That looks like a secret password — never share those, even with AI!" |
| password | block | "Looks like a password — keep those secret! Use placeholder text like 'PASSWORD' instead." |

**Suggestions accompanying BLOCK**: where applicable, message includes a *substitution suggestion* ("try 'me' instead", "try 'my mum'") so kid isn't dead-ended.

**For `late_b` (15-17)**: messages drop the 🤐 / 🌈 and friendly tone; use straight phrasing. "Phone numbers should stay out of prompts. They get logged."

---

## 6. WARN flow — kid acknowledgment contract

When mode = `warn`, the prompt is NOT yet sent. UX:

```
┌──────────────────────────────────────────────────────────┐
│  Hmm, that looks like your real name 👀                  │
│                                                          │
│  AI is super cool but everyone can see your prompts.     │
│  Want to use a nickname like 'Star' or 'Z' instead?      │
│                                                          │
│  Your message: "Mia and Mia and Mia play..."             │
│                                                          │
│  [✏️ Let me change it]   [📤 Send anyway (this once)]    │
└──────────────────────────────────────────────────────────┘
```

- **"Let me change it"** → returns kid to compose box; no Stars charged; no audit beyond `safety.pii.warned`
- **"Send anyway"** → audit emits `safety.pii.warn_acknowledged`; prompt proceeds; charge as normal

**Per-session acknowledgment memory**: if kid acknowledged a `kid_real_name` warn 3 minutes ago, the next occurrence in the same session doesn't re-prompt (otherwise it's nag-loop). New session resets. Sustained pattern still applies (3 warn-acks in a row counts toward `pattern_threshold`).

---

## 7. Artifact save checkpoint

In addition to the prompt firewall (Stage 2) and response moderator (text/code redact), PII detection runs **a third time** when a Project artifact is saved:

```typescript
// learn-projects-prd.md §5 — add-text / add-story flows
async function saveArtifact(projectId: string, kind: ArtifactKind, content: string | Buffer) {
  if (kind === 'text' || kind === 'code_file') {
    const pii = await piiDetect(content as string, { kid, direction: 'artifact_save' });
    if (pii.hits.length > 0) {
      // artifact_save direction always uses BLOCK posture
      throw new SafetyError('PII_IN_ARTIFACT', { categories: pii.hits.map(h => h.category) });
    }
  }
  // ... continue with S3 upload + Artifact row insert
}
```

**Why a third checkpoint?**: text artifacts may be edited inline by the kid (story regenerated AND tweaked by hand). Catching at save is the last line of defense.

**Audit event**: `safety.pii.artifact_blocked` — distinct event_type so super-admin can identify the rare cases where input+output screens passed but save caught something.

---

## 8. Parent visibility

| Event | Parent sees in `/portal/audit` | Push? |
|---|---|---|
| `safety.pii.warned` (kid declined to send) | Tiny green card "your child kept some info private 👍" — category icon, no value | No |
| `safety.pii.warn_acknowledged` (kid sent anyway) | Card with category icon + "your child shared their [category] with AI today" — value redacted as `[REDACTED]` | No (single events silent) |
| `safety.pii.blocked` (input) | Card with category icon + "we blocked your child from sharing [category]" — value redacted | No |
| `safety.pii.redacted` (output) | Tiny card "we cleaned up some made-up names from your child's story" | No |
| `safety.pii.artifact_blocked` (save) | Card "couldn't save — your child tried to include [category] in their project" | No |
| Pattern: 3+ PII blocks in 24h | Incident card via `safety.pattern.escalated` | Yes |

**Sanitization rule (D-PI4)**: parent NEVER sees the raw PII string. They see the *category* (📛 name / 🏠 address / ☎️ phone / etc) and a redacted excerpt with the PII replaced by `[REDACTED-NAME]` etc. Rationale: protect the kid from parental over-reaction to single events; protect the kid's own developing identity (12-yr-old experimenting with a chosen name shouldn't be outed to parent via the audit log).

**Exception**: Designated Officer review via `incidents-and-mandatory-reporting-prd.md` when an Incident is opened. DO can unlock raw PII (TOTP step-up) if needed for child welfare assessment.

---

## 9. PII pattern lifecycle

Three artifacts that need updating together:
1. `safety/pii-patterns-v1.yaml` — regex + dictionary entries
2. `safety/fictional-names-v1.yaml` — names to allowlist
3. `SafetyPolicy.pii_*_mode` per band — escalation level

**Editing**:
- Super-admin only (`/admin/system/safety/pii-patterns`, TOTP step-up — D-PI5)
- All edits create a new versioned file (immutable, like `SafetyPolicy`)
- "Test patterns" affordance: paste sample text, see what would match — before publishing

**Cascade refresh**: on publish, push WS event `safety.pii_patterns.updated` → all platform-backend instances drop their cache and reload (60s TTL otherwise).

**Audit**: `safety.pii_patterns.published` event emitted with diff vs prior version.

---

## 10. Failure modes

| Scenario | Behavior | Alert |
|---|---|---|
| NER model fails to load on boot | Service health-check fails; pod refuses traffic | Page on first occurrence |
| NER model timeout on a single prompt (> 30ms) | Skip NER stage; rely on regex + dictionary; audit-flag for review | Audit-only; page if > 5% over 5min |
| Family dictionary load error | Fall back to regex + NER only; audit-flag | Page if > 1% over 5min |
| Pattern file load error | Fail-closed for the kid (reject input/output); page | Page on first |
| `parent_email` / `parent_phone` BLOCK fires but kid genuinely has no parent contact set | Edge case — falls back to NER only; if NER finds an email-shape, treats as `kid_email` | Audit-only |

**SLOs**:
- Detection p95 latency ≤ **30ms** for input/output; ≤ **50ms** for artifact save
- False-positive rate (acceptable input wrongly blocked) ≤ **3%** measured via parent appeal queue (V1)
- False-negative rate (PII slipped through to LLM) ≤ **0.5%** measured via spot-check of LLM provider logs

---

## 11. Special cases

### 11.1 Code sample data exception

Kid in Code Studio types `john@example.com` or `555-0142` — these are NIST/IANA-reserved for examples and sample code. Skip PII detection.

```typescript
const SAMPLE_DATA_EXEMPTIONS = [
  /[a-z0-9._%+-]+@example\.(com|org|net)/i,
  /\b555-0\d{3}\b/,                      // North American sample numbers
  /\b(?:0|01)23[\s-]?456[\s-]?78\d\b/,   // commonly-cited sample formats
];
```

Audit still emits `safety.pii.sample_exempt` so we can review false positives in this list.

### 11.2 Kid's own data in their own Project Workspace

Kid in `/learn/projects/:id` adding a profile-style "about me" page — they may want to put their real first name there. We allow per-Project up to **2 uses of `kid_real_name`** (their own, from family dict) with no warn. Beyond that, normal escalation. Other PII categories still BLOCK regardless.

### 11.3 Teacher in classroom context

When a teacher is reading a kid's prompt in `teacher-console`, PII is **never redacted** in the teacher view (the teacher needs to see what the kid actually said for safeguarding purposes). RBAC enforces: only `teacher` role on the kid's active `Class` + `admin` + `super_admin` can see raw text. Parent always gets sanitized.

### 11.4 Kid disclosure of distress / safeguarding concerns

If a kid types something that looks like a safety disclosure (self-harm, abuse, neglect) — PII handling is **not the primary concern**. The disclosure detector (separate module, lives in `incidents-and-mandatory-reporting-prd.md`) takes precedence; PII PRD defers to it. Disclosure events emit `safety.disclosure.detected` with no parent visibility (D-INC3) — Designated Officer-only.

---

## 12. Audit event contract

```json
// WARN — kid saw, declined
{ "event_type": "safety.pii.warned",
  "actor": "system", "kid_id": "...", "payload": {
    "surface": "story", "direction": "input",
    "categories": ["kid_real_name"], "source": ["family_dict"],
    "kid_ack": false, "policy_version": "1.0.0"
  }}

// WARN — kid acknowledged + sent
{ "event_type": "safety.pii.warn_acknowledged",
  "payload": { ...same..., "kid_ack": true }}

// BLOCK
{ "event_type": "safety.pii.blocked",
  "actor": "system", "kid_id": "...", "payload": {
    "surface": "image", "direction": "input",
    "categories": ["kid_address"], "source": ["family_dict", "ner"],
    "policy_version": "1.0.0",
    "input_hash": "sha256:...", "input_excerpt_redacted": "draw my house at [REDACTED]..."
  }}

// REDACT (output)
{ "event_type": "safety.pii.redacted",
  "payload": { ...same..., "redaction_count": 3, "redacted_categories": ["kid_real_name", "kid_address"] }}

// SAVE BLOCK
{ "event_type": "safety.pii.artifact_blocked",
  "payload": { ..., "project_id": "...", "artifact_kind": "text" }}
```

Retention: 2 years baseline; events linked to an Incident inherit Incident retention.

---

## 13. Out of scope (V0)

- ❌ Photo / video PII (no uploads at V0 per `learn-projects-prd.md` D-P5; face detection for AI-generated images is V1)
- ❌ Voice biometric detection (would need to detect kid's actual voice in TTS samples — not relevant since TTS is synthetic)
- ❌ Cross-language PII (V0 is en-AU only; Mandarin PII patterns are V2 when CN expansion ships)
- ❌ Pseudonymous PII (kid uses a consistent fake name → over time identifies them) — too speculative for V0
- ❌ Steganographic PII (hidden in image metadata, embedded in code comments at unusual positions) — V2
- ❌ Parent-of-friend / friend-of-friend graph PII (kid mentions a classmate by name) — uses the kid_real_name path (NER will hit it) but no special handling
- ❌ Real-time learning of new PII patterns from rejection corpus (privacy fraught with minors)
- ❌ DSAR-style data export of "all PII my kid ever attempted to share" — V2 if requested

---

## 14. Decision Records

| # | Decision | Why |
|---|---|---|
| D-PI1 | Stricter on input than output. Input = BLOCK; output = REDACT. | Input PII leaks to LLM provider (irrevocable); output PII is in our system (redactable in place). |
| D-PI2 | NER allowlist for fictional names. | Kids should be able to write Harry Potter fan fic; NER would otherwise flag every "Harry" and "Hermione". |
| D-PI3 | Parent contact info is **always** BLOCK regardless of band. | No legitimate reason a kid (any age) would type their parent's email/phone into an LLM prompt; almost always a confusion/harm pattern. |
| D-PI4 | Parents see sanitized + categorized only. Raw PII shown to Designated Officer only via Incident review path. | Protects kid identity development from parental overreaction; preserves parent's need-to-know via category labels. |
| D-PI5 | PII pattern editor is super-admin only (TOTP step-up). | Same blast radius as `SafetyPolicy` — affects all kids; mistake = leaks or false-positives at scale. |
| D-PI6 | Sample-data exception (`*@example.com`, `555-01XX`) is global, hardcoded, doesn't read from policy. | These IANA/NIST conventions are universal; making them per-band introduces config errors with no safety benefit. |
| D-PI7 | Third detection checkpoint at artifact save. | Kid may edit text after generation; save is the last chance to catch. |
| D-PI8 | Per-session ack memory for WARN — don't re-nag the same category within a session. | UX; otherwise kids learn to ignore warn modals entirely. |

---

## 15. Open Questions

| # | Q | Owner | Impact |
|---|---|---|---|
| QPI-1 | NER model — spaCy `en_core_web_sm` is small but accuracy on AU names is mediocre. Consider `en_core_web_md` (50MB → 500MB)? | Engineering | Pod RAM + cold start time |
| QPI-2 | When kid in `early_b` is in WARN mode for `kid_real_name`, what's the right occurrence threshold for elevating to BLOCK? Currently `≥5 in project` for all warn-mode bands. | Product / Safety | Affects late_b too |
| QPI-3 | Fictional-names allowlist maintenance — who owns updates? Curriculum suggests quarterly review, but Pokémon ships new characters monthly. | Curriculum | Stale allowlist → blocks legitimate kid creativity |
| QPI-4 | Should we offer kids a one-time "register your nickname" flow at first login, so dictionary-based detection of `kid_real_name` is more robust? | Product | UX impact + privacy implication of storing nickname |
| QPI-5 | When NER returns low-confidence (e.g. 0.5) PERSON hits, should we WARN (treat as suspected) or ignore? Currently `≥0.8` threshold. | Engineering / Safety | False-positive vs false-negative balance |
| QPI-6 | Postal codes are 4-digit in AU which collides with years, prices, scores. Need contextual classifier — V0 risks many false positives. | Engineering | May need to disable `postal_code` regex until V0.2 |
| QPI-7 | Does the WARN ack itself count toward `pattern_threshold` (1 of N rejections)? Current spec: yes (3 ack'd warns in a row = pattern). Is that right? | Product / Safety | Could be too aggressive |

---

## 16. Revision History

- **v0.1 — 2026-05-25** — Initial draft. Closed PII taxonomy (16 categories), 3-layer detection (family dict / regex / NER), 3-checkpoint enforcement (prompt input / LLM output / artifact save), WARN-vs-BLOCK decision tree with bumped rules for occurrence count, full kid-facing message catalog with band variants, sanitized parent visibility (D-PI4), sample-data exception for Code Studio (D-PI6), 8 decision records D-PI1…D-PI8.
