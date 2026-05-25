# Safety — Response Moderation (Output Side) — PRD

> **Status**: Draft v0.1 · 2026-05-25
> **Scope**: Cross-cutting — what happens to **every LLM output** between DeepRouter returning a response and the kid seeing it. All 5 `/llm/*` modalities (text / image / audio / video / code) route through this.
> **Author**: Airbotix engineering
> **Depends on**: [`safety-age-policy-prd.md`](./safety-age-policy-prd.md) (per-band thresholds) · `platform-backend-api-spec.md` §5.11 (`/llm/*` proxy) · [`safety-prompt-firewall-prd.md`](./safety-prompt-firewall-prd.md) (the mirror, input side) · [`safety-pii-protection-prd.md`](./safety-pii-protection-prd.md) (PII leak in output)
> **Parallel**: `audit-event-schema-prd.md` (audit event envelope) · `incidents-and-mandatory-reporting-prd.md` (when output rejection becomes an Incident)
> **Implementation owner**: platform-backend (orchestration + text/code modality screens) · DeepRouter (image/audio/video classifier endpoints)

---

## 1. Purpose

The prompt firewall (sibling PRD) is necessary but not sufficient — even with a clean prompt, an LLM can produce harmful output:
- Story generator slips a violent scene into a "happy ending" prompt
- Image generator surfaces unsafe content from training data
- Code generator emits a real exploit pattern for a benign-sounding question
- TTS reads back a slur the kid typed inadvertently
- Video generator includes a frame with realistic violence

This PRD specifies the **post-generation moderation pipeline** for all 5 modalities. Kids never see unmoderated output. **Failure mode is fail-closed**: if moderation can't run, the output is withheld and Stars are refunded.

**Design principle (D-RM1)**: Moderation runs *after* DeepRouter's own internal moderation but *before* response is returned to the kid. Defense in depth — platform-backend doesn't trust DeepRouter to be the only line of defense.

---

## 2. Pipeline overview

```
DeepRouter LLM returns ─────▶ platform-backend `/llm/*` proxy
                                       │
                                       ▼
                              moderateResponse(output, kid, surface)
                                       │
                          ┌────────────┼────────────┐
                          ▼            ▼            ▼
                       Text         Image        Audio/Video
                       screen       screen       screen
                          │            │            │
                          ▼            ▼            ▼
                  PII-leak +    NSFW + violence  Frame sample +
                  topic class.  classifier       transcript scan
                          │            │            │
                          └────────────┼────────────┘
                                       ▼
                                  decision
                                       │
                          ┌────────────┴────────────┐
                          ▼                         ▼
                       PASS                     REJECT
                          │                         │
                  - Return output           - Withhold output
                  - Charge Stars            - Refund Stars (best-effort)
                  - Audit: passed           - Audit: rejected + reason
                  - Save Artifact           - Friendly message to kid
                                            - Maybe escalate (if pattern)
```

**Modality routing**: by `response.kind` (the modality the kid invoked — `text` / `image` / `audio` / `video` / `code`). Each gets its own screen pipeline; only the relevant screen runs.

**Latency budget**:
- Text / code: **300ms p95**
- Image: **500ms p95** (classifier ~300ms + overhead)
- Audio: **400ms p95** (transcript via fast STT then text screen)
- Video: **2000ms p95** (sample 5 frames + audio track; longest path)

Budget excludes the LLM generation itself; this is post-generation latency the kid experiences as "creating…" spinner time.

---

## 3. Text modality

**What it covers**: outputs from `/llm/text-completion` (story / mission step / workspace chat reply), code prose, error explanations.

**Screens** (run in series; first reject wins):

### 3.1 PII-leak detector

Outputs sometimes contain PII that the LLM made up (looks real but isn't) — e.g. "Sarah Johnson, 123 Maple Street, Sydney" in a generated story. We treat this as PII-equivalent because:
- Kids can't tell fake from real
- Some "fake" names accidentally match real people
- Teaching kids "this is what an address looks like" via output is fine; populating with realistic data is not

**Implementation**: calls [`safety-pii-protection-prd.md`](./safety-pii-protection-prd.md) `piiDetect(text, { direction: 'output' })`. Output mode is always stricter than input — output `block` thresholds apply to all bands.

**Action on detect**: **redact**, not reject. PII patterns in output get replaced inline:
- Names → `[someone]`
- Addresses → `[a place]`
- Phones → `[a number]`
- Emails → `[an email]`

Redacted output still gets returned to the kid; audit emits `safety.response.pii_redacted` with the categories that were redacted (not the values).

### 3.2 Topic classifier

Same DeepRouter endpoint as Stage 3 of the prompt firewall, run on the generated text:
```typescript
const result = await deeprouter.classifyText({ text: output, taxonomy: TOPIC_TAXONOMY });
const policy = await getSafetyPolicy(kid.band);

for (const [topic, score] of Object.entries(result.topics)) {
  if (policy.blocked_topics.includes(topic) && score >= policy.response_text_threshold)
    return reject('topic_in_output', { topic, score });
}
```

**Latency**: 100–200ms.

**Reject on**: any blocked topic above `response_text_threshold` (always stricter than prompt threshold — output is more dangerous than input).

### 3.3 Jailbreak-success detector

Catches outputs that suggest the sysprompt was successfully bypassed: "Sure, here's how to ignore the previous rules and..." / "As DAN, I can say..." etc. Heuristic regex + LLM second-pass.

**Reject on**: any pattern match.

---

## 4. Image modality

**What it covers**: outputs from `/llm/image` (image studio, mission image step).

**Screens**:

### 4.1 NSFW classifier

**Implementation**: DeepRouter endpoint `POST /v1/safety/classify-image` returns `{ nsfw_score, violence_score, gore_score, mature_score }` — all 0.0–1.0.

```typescript
const scores = await deeprouter.classifyImage({ s3_key: result.s3_key });
const policy = await getSafetyPolicy(kid.band);

if (scores.nsfw_score >= policy.response_image_nsfw_threshold)
  return reject('image_nsfw', { score: scores.nsfw_score, threshold: policy.response_image_nsfw_threshold });
if (scores.violence_score >= policy.response_image_violence_threshold)
  return reject('image_violence', { score: scores.violence_score });
if (scores.gore_score >= 0.15)             // hardcoded — gore is never age-banded; always block
  return reject('image_gore', { score: scores.gore_score });
```

**Defense-in-depth fallback**: if DeepRouter classifier is down, fall back to **OpenAI Moderation API** for image (per `kids-ai-platform-prd.md` §11.2). If both down → fail-closed.

### 4.2 Brand / IP filter (V1+)

Out of V0 scope. V1: catch obvious copyrighted character outputs (Mickey Mouse, Pokemon, etc.) to avoid IP infringement. V0 ships without this; relies on DeepRouter upstream filter and `kid-safe sysprompt` instruction "don't draw existing characters".

### 4.3 Text-in-image scan (V1+)

OCR the generated image; run extracted text through §3 text screen. Out of V0 — text-in-images is rare with current image models for kid-style prompts.

---

## 5. Audio modality

**What it covers**: outputs from `/llm/tts` (voice studio, mission voice step) and `/llm/music` (music studio).

### 5.1 TTS — text-of-record screen

TTS output reads back text we control (kid typed or LLM generated). The audio itself is rarely the risk; the text being read aloud is.

**Implementation**:
- The text **already passed §3 text screen** before being sent to TTS. Re-screen NOT needed (D-RM2).
- One additional check: **profanity-aware TTS phoneme detection** — some TTS engines pronounce homoglyphs cleanly (e.g. "fück" → still curse word). Run input text through Stage 1 regex (per `safety-prompt-firewall-prd.md` §3.1) with band-specific profanity list.

**Reject on**: profanity hit. Refund Stars; friendly message: "Hmm, let's pick different words for your pet to say."

### 5.2 Music — instrumental + lyrics

Music PRD currently routes most music to `/llm/music-score` (Tone.js instrumental, no lyrics) — these are zero-risk for content.

`/llm/music` with vocals: lyrics get screened via §3 text screen pre-generation; audio output gets a 5-sec sample run through automated content detection (V1+).

V0: only `/llm/music-score` ships. `/llm/music` with vocals deferred.

---

## 6. Video modality

**What it covers**: outputs from `/llm/video` (short video / animation studio).

**Screens** (run after async generation completes):

### 6.1 Frame sampling

```typescript
// Sample 5 frames evenly across video duration
const frames = await extractFrames(videoUrl, { count: 5 });

for (const frame of frames) {
  const scores = await deeprouter.classifyImage({ image_data: frame.bytes });
  if (anyThresholdExceeded(scores, policy)) {
    return reject('video_frame_unsafe', { frame_index: frame.index, scores });
  }
}
```

Threshold per-frame uses the same `response_image_*` policy values; one bad frame fails the whole video.

### 6.2 Audio track

If video has audio: extract, STT-transcribe, run through §3 text screen. Reject on any text screen failure.

### 6.3 Frame count adequacy

Why 5 frames? Empirically catches >95% of policy-violating videos in our test set (V0; revisit when we have production data). For videos >30s, scale to 1 frame per 6 seconds, max 10.

---

## 7. Code modality

**What it covers**: outputs from `/llm/code-completion` (Code Studio, V0.4).

**Screens**:

### 7.1 Malicious code pattern detector

Static patterns that indicate harmful intent regardless of context:
```typescript
const MALICIOUS_PATTERNS = [
  /rm\s+-rf\s+\/(?!\w)/,                       // rm -rf /
  /fork\s*\(\s*\)\s*;.*while\s*\(\s*1\s*\)/,   // fork bomb
  /eval\s*\(\s*(?:atob|fromCharCode|Buffer\.from)/, // obfuscated eval
  /\bexploit\b.*\b(?:cve|kernel|root|escalat)/i,
  /(?:keylogger|stealer|trojan|backdoor)/i,
  // ~80 patterns version-controlled at safety/code-malicious-v1.yaml
];
```

**Reject** if any match. Latency < 1ms.

### 7.2 Network / filesystem destructive intent (LLM second pass)

For code that's not pattern-matched but semantically suspicious (e.g. "loop that hits this URL 1000 times"), use a small LLM second pass:
```typescript
const judgement = await deeprouter.classifyCode({
  code: output,
  intent_categories: ['dos', 'exfil', 'destructive_fs', 'unauth_access', 'malware'],
});

for (const [intent, score] of Object.entries(judgement.intents)) {
  if (score >= 0.6) return reject('code_malicious_intent', { intent, score });
}
```

### 7.3 Real-secret leak detector

LLM sometimes invents API keys / passwords / tokens that *look* real. If output contains:
- Strings matching common API key patterns (AWS / Stripe / OpenAI / GitHub)
- AWS account IDs (12-digit)
- Private key headers (`-----BEGIN PRIVATE KEY-----`)

→ **redact** (replace with `[redacted-key]`) and audit. Don't reject (a code tutorial about API keys is legitimate); just don't expose realistic-looking fake secrets.

### 7.4 Code-context PII

Same exception as input-side (PII PRD): emails matching `*@example.{com,org}` and phones matching `555-01XX` pass; everything else PII gets redacted.

---

## 8. Partial-success / streaming output handling

Some endpoints stream output token-by-token (text completion via SSE). **Moderation strategy** (D-RM3):

| Strategy | When | Trade-off |
|---|---|---|
| **Buffer & screen** (V0 default) | Mission steps, short generations (< 200 tokens expected) | +200-400ms perceived latency; safer |
| **Stream + post-screen** | Workspace chat replies, long stories (> 500 tokens expected) | Lower perceived latency; risk of kid seeing 3 paragraphs then "this got rejected" |
| **Stream + per-chunk screen** | Never at V0 | Too expensive (200ms × chunks) |

For streaming with post-screen: kid sees output appear live; if final screen fails, output is **frozen, message replaced** with friendly rejection, audit emits `safety.response.rejected_post_stream` with the partial bytes for super-admin review.

**Refund logic on stream rejection**: full refund (the kid didn't "get" the value even if they saw some text).

---

## 9. Refund & accounting

| Outcome | Stars action | Wallet event |
|---|---|---|
| Response passes all screens | Charge as estimated | `wallet.spend` `tx_type=debit_llm` |
| Response rejected at any screen | **Refund all reserved Stars** (best-effort; idempotent) | `wallet.refund` `tx_type=safety_refund` |
| Response partially passed (text generated, frame rejected in video) | Refund | Same as above |
| Internal moderation system error (fail-closed) | Refund | Same |
| Response redacted (PII / secrets) | Charge as estimated (kid got value) | `wallet.spend` with `metadata.redacted=true` |

**Best-effort refund**: if WalletService is unavailable, the refund attempt enqueues to a retry queue (BullMQ); kid sees "we owe you ⭐2 — will return shortly". Eventual consistency over hard failure.

**Anti-gaming**: per-kid daily refund cap = 30⭐ × pattern_threshold. Beyond that, refunds still happen but auto-open an `Incident kind=safety_pattern` for super-admin review (likely abuse or upstream model regression, not a kid problem).

---

## 10. Friendly rejection messages

Like input side, keyed by `(modality, reason, age_band)`. Examples for `core_a` band:

| Modality | Reason | Message |
|---|---|---|
| text | topic_in_output | "Oops, that story got a little too [topic]. Let's try again with a happier vibe!" |
| text | jailbreak_success | "Something went sideways — let's start fresh." |
| image | image_nsfw | "Hmm, the picture didn't come out right. Let's try a different idea." |
| image | image_violence | "That picture had some scary stuff. Want to try [SUGGESTION]?" |
| image | image_gore | "Whoa — that one's not for here. New idea? 🌈" |
| audio | profanity | "Hmm, let's pick different words for your pet to say." |
| video | video_frame_unsafe | "The video had a not-great moment — let's redo it!" |
| code | code_malicious_intent | "That code does something we can't help with. Want help with a [SUGGESTION] project instead?" |
| code | redacted_secrets | (no kid-facing message — output returned with `[redacted-key]` inline) |

**No reveal of which classifier / score / pattern**. Same rule as input side: would teach circumvention.

---

## 11. Audit event contract

Every response produces exactly one terminal event:

```json
// Pass
{ "event_type": "safety.response.passed",
  "actor": "system", "kid_id": "...", "payload": {
    "surface": "image", "modality": "image", "request_id": "req_xyz",
    "policy_version": "1.0.0", "screen_durations_ms": { "nsfw": 280, "violence": 280 },
    "redactions": []
  }}

// Reject
{ "event_type": "safety.response.rejected",
  "actor": "system", "kid_id": "...", "payload": {
    "surface": "image", "modality": "image", "request_id": "req_xyz",
    "screen": "image_nsfw", "score": 0.42, "threshold": 0.05,
    "classifier_model": "deeprouter-image-safety-v2.1",
    "refunded_stars": 2, "policy_version": "1.0.0",
    "output_s3_key_quarantine": "fam_xxx/quarantine/req_xyz.png"  // for super-admin review only
  }}

// Redact (text/code only)
{ "event_type": "safety.response.redacted",
  "actor": "system", "kid_id": "...", "payload": {
    "surface": "workspace", "modality": "text", "request_id": "req_xyz",
    "redactions": [
      { "kind": "pii_name", "count": 3 },
      { "kind": "secret_apikey", "count": 1 }
    ],
    "policy_version": "1.0.0"
  }}
```

**Quarantine bucket** (D-RM4): rejected image/video/audio outputs are stored at `s3://airbotix-quarantine/...` for **30 days**, then purged. Super-admin can review (TOTP step-up) for false-positive analysis. Kid + parent **never** see the quarantined bytes.

---

## 12. Parent visibility

| Event | Parent sees in `/portal/audit` | Push? |
|---|---|---|
| `safety.response.passed` | Nothing (normal happy path) | — |
| `safety.response.redacted` (PII redact) | Tiny card: "We removed some made-up names from your child's story" | No |
| `safety.response.redacted` (secret redact) | Tiny card: "We removed some fake passwords from your child's code" | No |
| `safety.response.rejected` (single) | Card with modality icon + reason category (no thumbnail / preview) + "you can ask AI to try again" | No (single events silent) |
| Pattern: 5 rejections in 1 day from same kid | Incident card via `safety.pattern.escalated` (per prompt firewall §5) | Yes |

**No previews of rejected output ever shown to parent**. Rationale: by definition the bytes are unsafe — showing them to parents recreates the harm. Category labels are enough for parent action.

---

## 13. Failure modes & SLOs

| Scenario | Modality | Behavior | Alert |
|---|---|---|---|
| Text/code screen timeout > budget | text, code | Fail-closed; refund; friendly message | Page if > 1% over 5min |
| DeepRouter image classifier 5xx | image | Fall back to OpenAI Moderation API; if also down, fail-closed | Page on fallback usage |
| Video frame extraction error | video | Fail-closed; refund | Page if > 5% over 10min |
| TTS profanity check error | audio | Fail-open (TTS output already low-risk); audit-flag | Audit-only; no page |
| Refund attempt fails | any | Queue retry; eventual consistency | Page if retry queue > 100 |
| Quarantine S3 upload fails | image, video, audio | Reject still proceeds (kid blocked); failed quarantine logged | Audit-only |

**SLOs**:
- Text/code total p95 ≤ **300ms**
- Image total p95 ≤ **500ms**
- Audio total p95 ≤ **400ms**
- Video total p95 ≤ **2000ms**
- Overall moderation pipeline error rate ≤ **0.5%**
- False-positive rate ≤ **2%** (kid-acceptable output rejected; measured via parent appeal queue, V1)

---

## 14. Out of scope (V0)

- ❌ Brand / IP infringement detection in images (V1)
- ❌ Text-in-image OCR + re-screen (V1)
- ❌ Music with vocals (`/llm/music`) — V0 ships `/llm/music-score` only
- ❌ Real-time per-token streaming moderation (too expensive at scale)
- ❌ Kid / parent appeal UI for false-positive rejections (V1; would need `/portal/audit/:eventId/appeal` + `/teacher/reviews/safety-appeals`)
- ❌ Cross-modality consistency (e.g. catching a story + image combo that's individually safe but together unsafe) — V2
- ❌ Watermarking AI outputs for downstream tracing — V2 compliance push

---

## 15. Decision Records

| # | Decision | Why |
|---|---|---|
| D-RM1 | Defense in depth — moderate after DeepRouter's own moderation, before kid sees output. | Either side can be compromised; both must agree. |
| D-RM2 | TTS does NOT re-screen text (it already passed input text screen). Only re-checks profanity at the phoneme level. | Avoid duplicate latency; input screen is authoritative. |
| D-RM3 | Buffer-and-screen by default for short outputs; stream-and-post-screen for long. Per-chunk screen never. | Kid UX vs safety vs cost; the two-tier rule matches the empirical 200/500-token threshold. |
| D-RM4 | Rejected outputs quarantined 30d in dedicated S3 bucket; never shown to kid or parent. | Super-admin needs FP analysis material; showing to parent recreates harm. |
| D-RM5 | PII / secrets in output get **redacted** (not rejected). Topic / NSFW / violence get **rejected** (not redacted). | Redaction preserves value where surgical edit is possible; rejection is for whole-output failures. |
| D-RM6 | Image gore threshold is **hardcoded 0.15 across all bands**, not in `SafetyPolicy`. | Some content has no legitimate use case at any age (severed limbs etc). |
| D-RM7 | Full refund on any rejection, even partial-success streaming. | Charging for blocked value erodes trust; per-kid daily refund cap (§9) handles abuse. |
| D-RM8 | Video screen samples 5 frames (or 1/6s, max 10). | Empirically catches > 95% of policy violations; cost-tractable. Revisit with production data. |

---

## 16. Open Questions

| # | Q | Owner | Impact |
|---|---|---|---|
| QRM-1 | Video frame sampling — 5 frames feels low. Should we go to dense sampling (1/sec) at higher cost? | Engineering / Safety | Latency + cost vs FN rate |
| QRM-2 | When DeepRouter image classifier and OpenAI fallback disagree, which wins? | Engineering | Currently DeepRouter; OpenAI as fallback. Should we always run both and take max-score? |
| QRM-3 | Streaming text rejection — kid sees 3 paragraphs then "rejected". Do we leave the partial bytes visible (and add the error banner) or replace entirely? | Product | UX trade-off — partial is "honest", replacement is "clean" |
| QRM-4 | Should `redacted` events trigger any parent notification, or stay silent? | Product / Compliance | Currently silent for both PII and secret redactions |
| QRM-5 | Code modality: is the LLM second-pass for "destructive intent" worth the 200ms when the pattern detector already catches 80%? | Engineering / Safety | Latency vs missed-malicious |
| QRM-6 | Quarantine bucket review — does super-admin need a dedicated UI (`/admin/system/safety/quarantine`) or can they pull S3 keys from audit and view via signed URL? | Engineering | V1 nice-to-have |

---

## 17. Revision History

- **v0.1 — 2026-05-25** — Initial draft. Per-modality post-generation moderation (text / image / audio / video / code); fail-closed posture; PII + secret redaction (D-RM5); rejected-output quarantine (D-RM4); streaming vs buffer strategy (D-RM3); refund-on-reject with anti-gaming cap; defense-in-depth fallback to OpenAI Moderation for images; 8 decision records D-RM1…D-RM8.
