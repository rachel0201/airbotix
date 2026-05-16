# Audit Event Schema — Cross-product PRD v0.1

> Status: Draft v0.1 · Discussion / pre-implementation
> Date: 2026-05-16
> Author: Airbotix (airbotix repo session)
> Owners (cross-repo handoff): `kidsinai/kids-opencode` · `Airbotix-AI/platform-backend` · `Airbotix-AI/teacher-console` · `Airbotix-AI/airbotix-app`
> Supersedes: nothing yet — first attempt at a unified contract

> **One-line problem statement.** Three repos (kids-opencode plugin, platform-backend ingest, teacher-console live channel, airbotix-app parent dashboard) all need to read the same audit events, but no shared schema exists. Today kids-opencode plugin emits ad-hoc JSON to stderr; everyone else is waiting on a contract.

---

## 1. Why this needs to exist now

`kids-opencode-client-prd.md` §5.4 + PLAN.md Phase 5 prescribe a pipeline:

```
plugin audit()  →  stderr + ring buffer
        ↓
client subscribes to serve event stream
        ↓
client batches → platform-backend /api/audit
        ↓
        ├── teacher-console subscribes /api/audit/stream?class=… (live progress)
        └── airbotix-app/portal queries /api/audit?family_id=… (parent dashboard)
```

This only works if all four endpoints agree on:

1. Event field set (shape)
2. Event taxonomy (which event names exist)
3. Identity fields (whose event is this)
4. Schema versioning (how upgrades propagate)
5. Retention + redaction policy (what stays, what hashes, what drops)

Without a written contract, each side will guess differently and the pipeline silently breaks every time one side adds a field. Phase 5 (Workshop integration) literally cannot be acceptance-tested until this exists.

---

## 2. What kids-opencode plugin emits today (factual baseline)

Source: `~/Documents/sites/kidsinai/kids-opencode/packages/kids-plugin/src/index.ts:113-122` (audit fn) + the five emit sites.

Every line on stderr matches the prefix `[kids-audit] ` followed by JSON of shape:

```ts
{
  ts: string             // ISO 8601, set at emit time
  component: "kids-opencode-plugin"
  event: string          // discriminator (see §3)
  ...event-specific fields
}
```

Concrete events emitted in V0.4 (with payload fields):

| Event name | Fields beyond the common base | Emit site |
|---|---|---|
| `plugin.loaded` | `version`, `course_pack`, `mission` | plugin init |
| `course_pack.not_found` | `requested` | plugin init, on bad `KIDS_COURSE_PACK` |
| `tool.blocked.not_whitelisted` | `sessionID`, `tool` | `tool.execute.before` hook |
| `tool.blocked.webfetch_host` | `sessionID`, `tool`, `url` | `tool.execute.before` hook |
| `tool.execute.before` | `sessionID`, `callID`, `tool`, `args_summary`, `stars_estimated` | `tool.execute.before` hook |
| `tool.execute.after` | `sessionID`, `callID`, `tool`, `title`, `stars_charged` | `tool.execute.after` hook |

**Critical gap (motivates §3.2):** none of today's events carry `family_id`, `kid_profile_id`, `workshop_class_id`, or model/token cost — but platform-backend aggregation, teacher-console live view, and Stars wallet reconciliation all need those.

---

## 3. Proposed v1 schema

### 3.1 Common envelope (always present)

```ts
interface AuditEnvelope {
  schema_version: "1"          // bump = consumer must check
  schema_id: "airbotix.audit"  // disambiguates from any future schema
  ts: string                   // ISO 8601 UTC, emitter clock
  emitted_by: AuditEmitter     // see §3.3
  event: AuditEventName        // discriminator, kebab-case dotted (see §3.4)
  category: AuditCategory      // for filtering / retention / alerting (see §3.5)
  identity: AuditIdentity      // see §3.2
  session: AuditSession        // see §3.6
  payload: object              // event-specific, typed per event name
}
```

### 3.2 Identity block (the critical gap)

```ts
interface AuditIdentity {
  family_id: string            // platform-backend Family record
  kid_profile_id: string       // who is acting
  device_id?: string           // optional, set by client at install time; for parent dashboard "which laptop"
  workshop_class_id?: string   // present iff workshop mode
  tenant_id: string            // DeepRouter tenant key owner (typically = family_id, or workshop pool)
}
```

**How these get into events.** The plugin process doesn't know `family_id` / `kid_profile_id` by itself; the client wrapper passes them via env vars (or via `OPENCODE_*` headers on `opencode serve` startup). Existing wrapper env-var pattern (`KIDS_COURSE_PACK`, `KIDS_MISSION`) is the model; we add `KIDS_FAMILY_ID`, `KIDS_PROFILE_ID`, `KIDS_DEVICE_ID`, `KIDS_WORKSHOP_CLASS_ID`. Plugin reads them at init, stamps every emit.

**Privacy stance.** `family_id` and `kid_profile_id` are opaque platform IDs (UUID v7), not names / emails / school. They are not PII by themselves; they only become identifying when joined against platform-backend's `families` / `kid_profiles` tables, which are gated by family-scoped auth. AU Children's Online Privacy Code stance: this is per-message metadata for a legitimate child-safety + parental-visibility purpose; no name/age/address ever appears on the wire.

### 3.3 Emitter block

```ts
interface AuditEmitter {
  component: "kids-opencode-plugin" | "kids-opencode-client" | "platform-backend" | "teacher-console" | "airbotix-app"
  version: string              // semver of that component
  host?: string                // optional: hostname / instance ID (server-side emitters)
}
```

Multiple emitters means: today the plugin emits, tomorrow the client emits its own envelope when it batches to platform-backend, and platform-backend itself emits when it makes an authorization decision. All three speak the same envelope.

### 3.4 Event taxonomy (v1 frozen names)

Names are dotted, kebab-case, **stable**. Adding new names is fine; renaming requires schema_version bump.

```
plugin.loaded
plugin.failed                         // plugin init crashed
course_pack.loaded
course_pack.not_found
course_pack.mission_advanced          // kid finished one mission, moved to next
tool.execute.before
tool.execute.after
tool.blocked.not_whitelisted
tool.blocked.webfetch_host
tool.blocked.path_guard               // future, when path guard lands
session.started
session.ended
session.aborted                       // user pressed Ctrl-C, billing must stop
llm.request                           // outbound DeepRouter call about to fire
llm.response                          // DeepRouter responded; includes usage
prompt_injection.detected             // output classifier hit
dangerous_topic.intercepted           // self-harm / crisis path
stars.charged                         // wallet debit applied
stars.exhausted                       // wallet hit 0, kid blocked
parent.audit_viewed                   // parent dashboard read action
teacher.kill_switch.triggered         // teacher console emergency-stop
```

Each name has a corresponding typed payload (§3.7). Unknown names MUST be tolerated by consumers (forward-compat).

### 3.5 Category (drives retention + alerting)

```ts
type AuditCategory =
  | "activity"      // routine tool / chat events; high volume; 90-day retention
  | "safety"        // anything kid-safety related; 2-year retention; alerts
  | "billing"       // Stars / LLM / tenant usage; 7-year retention for AU tax
  | "system"        // plugin lifecycle, errors; 30-day retention
```

This isn't decoration — it lets platform-backend pick the right storage tier and lets teacher-console subscribe to a stream filtered to `safety` for live overwatch.

### 3.6 Session block

```ts
interface AuditSession {
  session_id: string           // opencode session UUID
  call_id?: string             // present on tool.execute.* events
  course_pack?: string         // e.g. "portfolio-site"
  mission?: string             // e.g. "mission-1"
}
```

### 3.7 Per-event payloads (typed)

The payload is event-specific. Each consumer can have a discriminated-union type. Concrete shapes for the V0-critical events:

```ts
type AuditPayload =
  | { event: "plugin.loaded"; payload: { course_pack: string | null; mission: string | null } }
  | { event: "tool.execute.before"; payload: {
        tool: string
        args_summary: string         // safe summary, NEVER full args (PII risk)
        stars_estimated: number
    } }
  | { event: "tool.execute.after"; payload: {
        tool: string
        title: string
        stars_charged: number
        duration_ms?: number
        result_status?: "success" | "error"
    } }
  | { event: "tool.blocked.not_whitelisted"; payload: { tool: string } }
  | { event: "tool.blocked.webfetch_host"; payload: { tool: string; url: string } }
  | { event: "llm.response"; payload: {
        model: string                // upstream model id from DeepRouter
        prompt_tokens: number
        completion_tokens: number
        duration_ms: number
    } }
  | { event: "stars.charged"; payload: {
        stars: number
        running_balance: number      // post-charge wallet balance
        reason: "llm" | "tool" | "manual_adjustment"
    } }
  | { event: "dangerous_topic.intercepted"; payload: {
        category: "self_harm" | "violence" | "adult" | "other"
        action_taken: "soft_refusal" | "hard_block" | "crisis_card_shown"
    } }
  // ... etc, one variant per event name
```

### 3.8 What MUST NOT appear in the envelope

These are hard prohibitions, enforced by consumer-side validation that rejects events containing them:

- Full kid name, parent name, school name, address, email, phone
- Full tool args (use `args_summary` instead; redactor lives in plugin)
- Full prompt or completion text (the *count* of tokens is fine; the text is not)
- Raw API keys, JWTs, OAuth tokens (any string matching `^(sk-|dr_live_|eyJ)` patterns)
- Source file content beyond a 60-char preview

Where plugin needs to summarise: a redactor utility in `@kidsinai/kids-opencode-plugin` lives at `src/redact.ts` (to be added) and produces `args_summary` deterministically. Consumers can re-run the redactor and check that the supplied summary matches — that's the wire-level redaction proof.

---

## 4. Where the schema lives

A TypeScript types package is the single source of truth, consumed by all three product repos.

**Proposal: `@airbotix/audit-schema`** published to npm under the `@airbotix` scope, source-of-truth in `Airbotix-AI/platform-backend/packages/audit-schema/` (most logical home — platform-backend is the central ingest and longest-lived consumer).

Each consumer depends on the same version:

```jsonc
// kids-opencode plugin package.json
"dependencies": { "@airbotix/audit-schema": "1.x" }

// platform-backend
"dependencies": { "@airbotix/audit-schema": "1.x" }

// teacher-console
"dependencies": { "@airbotix/audit-schema": "1.x" }

// airbotix-app (parent dashboard)
"dependencies": { "@airbotix/audit-schema": "1.x" }
```

Schema bumps follow semver:

- **Patch** (`1.0.0 → 1.0.1`): add an optional field, add a new event name with payload
- **Minor** (`1.0.0 → 1.1.0`): make an optional field required *if the field has been opt-in for one full release cycle*
- **Major** (`1.0.0 → 2.0.0`): rename/remove a field, change `schema_version`, change envelope shape

Consumers MUST tolerate unknown event names and unknown payload fields within a major version. This is the forward-compat invariant.

---

## 5. Wire format

Three serialisations exist, all carrying the same envelope:

| Hop | Format | Notes |
|---|---|---|
| plugin → stderr | `[kids-audit] <single-line JSON>\n` | one envelope per line; line is the unit of atomicity |
| client → platform-backend | HTTPS POST `/api/audit` with body `{ events: AuditEnvelope[] }` | client batches; max 100 events per POST; max 1MB body |
| platform-backend → teacher-console / airbotix-app | Server-Sent Events `text/event-stream` | one envelope per `data: ` line |

All three use the same TS interface; the parsers differ only in framing.

---

## 6. Backward-compat: existing plugin V0.4 events

Migration plan from current ad-hoc shape to v1 envelope:

1. **Don't change plugin output format yet.** First land `@airbotix/audit-schema` v1 in platform-backend with **two parsers**: a v0 (legacy) parser that maps today's flat shape onto v1 envelope (filling unknowns with `null` / `unknown_emitter`), and a v1 parser for new emitters.
2. Plugin V0.5 ships v1-native emit (reads env identity vars, fills envelope). v0 parser stays around 3 months for in-flight installs that haven't auto-updated.
3. Plugin V0.6 drops legacy emit; platform-backend drops v0 parser.

This avoids the "everyone migrates at the same instant" trap. Phase 5 acceptance tests use v1 from day one (we control all stacks then).

---

## 7. Open questions

| # | Question | Who decides | Blocking |
|---|---|---|---|
| Q1 | Should the schema package live in `platform-backend` (proposed §4) or in a standalone `Airbotix-AI/audit-schema` repo? Standalone has cleaner ownership; nested has fewer repos | Lightman | publish setup |
| Q2 | `device_id` derivation: install-time random UUID stored in `~/.config/kids-opencode/device-id`? Or derived from machine-id? The latter is cross-install stable but is itself a fingerprint | Lightman + AU compliance | plugin V0.5 |
| Q3 | Redaction proof (§3.8): worth the wire overhead, or trust the emitter? Argument for: defence-in-depth. Argument against: 30% size increase | Joe (kids-opencode CTO) | plugin V0.5 |
| Q4 | Schema validation: Zod on every consumer? Or one TS-types-only package with runtime validation as opt-in? Zod adds ~50KB minified to clients | Each repo's lead | first integration |
| Q5 | Retention timers (§3.5): are the durations the right ones for AU? Lawyer review | AU lawyer (Phase 4) | Phase 4 close |
| Q6 | SSE vs WebSocket for teacher-console live channel? SSE simpler; WebSocket reusable for other features | platform-backend session | teacher-console Phase 5 |

---

## 8. Cross-repo handoff

This PRD is airbotix-repo-authored. To turn it into shipping code:

1. **`Airbotix-AI/platform-backend` session**: create `packages/audit-schema/` with the TS interfaces from §3, publish `@airbotix/audit-schema@0.1.0`. Stand up `/api/audit` POST endpoint accepting `AuditEnvelope[]` with v0 + v1 parsers (§6). Stand up `/api/audit/stream` SSE endpoint with class / family filters.
2. **`kidsinai/kids-opencode` session**: depend on `@airbotix/audit-schema`; emit v1-native envelopes (read identity from env vars added to wrapper); add `src/redact.ts`. PLAN.md Phase 2.5 already lists "client-side audit upload pipeline" — make it consume this schema.
3. **`Airbotix-AI/teacher-console` session**: depend on `@airbotix/audit-schema`; subscribe SSE; render per-kid progress filtered to `category != "system"`.
4. **`Airbotix-AI/airbotix-app` session**: depend on `@airbotix/audit-schema`; query API for parent-dashboard "Kid Activity" page; respect category retention.
5. **`Airbotix-AI/planning`**: register this PRD as a cross-product contract; downstream PRs in each repo must link back here.

---

## 9. Decisions to lock once we agree

| ID | Decision | Status |
|---|---|---|
| D-AUD1 | Single envelope shape across all emitters | proposed |
| D-AUD2 | Schema lives in `@airbotix/audit-schema` npm package | proposed |
| D-AUD3 | Plugin emits to stderr line-delimited JSON; client batches HTTP POST | proposed |
| D-AUD4 | `family_id` + `kid_profile_id` are mandatory in the envelope; redaction prohibits names/PII | proposed |
| D-AUD5 | Forward-compat: consumers tolerate unknown event names and optional fields within a major | proposed |
| D-AUD6 | Migration path: legacy v0 + v1 parsers coexist for 3 months (Plugin V0.5 → V0.6) | proposed |

---

## 10. References

- `docs/product/prd/kids-opencode-client-prd.md` §5.4 — pipeline architecture
- `docs/product/prd/kids-opencode-spec.md` §4.3 (still-valid section) — Parental Audit Log interface (now this PRD's §3 is the canonical replacement)
- `~/Documents/sites/kidsinai/kids-opencode/packages/kids-plugin/src/index.ts:113-211` — current emit code
- `~/Documents/sites/kidsinai/kids-opencode/PLAN.md` Phase 5 — workshop integration acceptance
