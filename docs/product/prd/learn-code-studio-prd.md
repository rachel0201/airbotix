# Code Studio — `/learn/create/code` + `/learn/code/*` — PRD

> **Status**: Draft v0.1 · 2026-05-25
> **Repo**: `Airbotix-AI/airbotix-app` (React + Vite SPA — `/learn/*` surface)
> **Domain**: `app.airbotix.ai`
> **Author**: Airbotix engineering
> **Upstream**: `kids-ai-platform-prd.md` v0.4 §1.3 / §13.1 (Line B Web V0 = Hosted-first strategy) · `airbotix-app-learn-prd.md` §2 (IA, route table revised in v0.4)
> **Depends on**: `platform-backend-api-spec.md` §4.4 (`Project` / `Artifact`) · §5.11 (`/llm/*` proxy) · §5.7 (S3 artifacts) · `auth-system-prd.md` (kid auth)
> **Parallel**: `learn-projects-prd.md` (Code Studio projects persist via the same My Works pipeline) · `learn-missions-prd.md` (a Mission step of type `code` invokes this Studio in widget mode) · `kids-opencode-client-prd.md` (the **desktop** Line B variant, re-scoped to V1+ power-user mode by this PRD)
> **Implementation owner**: airbotix-app frontend + platform-backend (`code-sessions` new module, `tools` virtual-FS service)

---

## 1. Purpose

The **Code Studio** is the in-browser AI coding surface — the Line B equivalent of `/learn/create/image`. A kid types "make a website that shows my pet drawing" or "add a leaderboard to my game", and an AI agent writes/edits the code, the code runs in a sandboxed iframe right next to the chat, and the kid iterates until they like it.

This PRD exists because:
- `kids-ai-platform-prd.md` v0.4 §1.3 / §13.1 explicitly chose **"V0 Hosted-first, V1+ Local desktop"** for Line B (Kids OpenCode). The hosted surface had no PRD.
- `airbotix-app-learn-prd.md` v0.2 §1 / §11 (out-of-scope list) wrote the opposite: "❌ AI Coding — Kids OpenCode local desktop tool only". This PRD reconciles that conflict in favor of the platform-PRD strategy.
- The marketing claim — *"AI Coding for kids, in your browser, no install"* — has no product behind it today. `kids-opencode-client-prd.md` describes a TUI/GUI desktop client; the airbotix-app web exposes no coding surface at all. The download-and-install model is wrong for the V0 funnel from Workshop → first-week-at-home; a kid who just finished a 2-hour class is not going to install a desktop tool that night.

What the Code Studio **doesn't** do:
- ❌ Run server-side code execution (no Python, no Node, no shell — see §6 Sandbox)
- ❌ Provide `bash` / arbitrary command tool use to the agent (whitelist is `read_file` / `write_file` / `edit_file` / `list_dir` only)
- ❌ Replace the desktop Kids OpenCode (`kids-opencode-client-prd.md`) — the desktop client is repositioned as V1+ power-user mode (bring-your-own API key, larger context, local tool access)
- ❌ Author Course Packs or Missions — content authoring lives in teacher-console; a Mission step of type `code` *invokes* the Studio as a widget but the Studio does not edit Missions

---

## 2. Information Architecture

```
app.airbotix.ai/learn/

├── /learn/create/code                Hub / starting point. Picks template + age mode, lands on a fresh project.
├── /learn/code/:projectId            Full Code Studio (3-pane: Files / Chat / Preview), the daily-driver surface
└── /learn/code/:projectId/run        Standalone iframe preview (full-window; used for "show parent / show class" mode)
```

The Studio is reachable from four places:
1. **`/learn/create` hub** — added as the 5th tile alongside Image / Story / Music / Video
2. **`/learn/workspace`** — `StudioPicker` adds a **Code** tile; selecting it spawns a new code project and routes to `/learn/code/:projectId`
3. **`/learn/missions/:slug`** — a Mission step of type `code` opens the Studio embedded in Mission chrome (no `/learn/code/:id` route navigation; runs in-place)
4. **`/learn/projects/:id`** — opening a project whose `kind = code` routes to `/learn/code/:id` instead of the generic project workspace

### 2.1 Hub (`/learn/create/code`)

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Make                                                           │
│                                                                  │
│ 💻  Code Studio                                                  │
│ Make a website, a game, or a tool — the AI writes the code      │
│ for you, you tell it what you want.                              │
│                                                                  │
│ ── Pick a starting point ──                                      │
│                                                                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ │ 🌐       │ │ 🎮       │ │ ✏️       │ │ 🎵       │             │
│ │ My Pet   │ │ Tiny     │ │ Doodle   │ │ Beat     │             │
│ │ Website  │ │ Game     │ │ Pad      │ │ Box      │             │
│ │ 1⭐ start│ │ 1⭐ start│ │ 1⭐ start│ │ 1⭐ start│             │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│ ┌──────────┐                                                     │
│ │ ✨       │                                                     │
│ │ Blank    │                                                     │
│ │ Project  │                                                     │
│ │ 1⭐ start│                                                     │
│ └──────────┘                                                     │
│                                                                  │
│ ── Your past code projects (3) ──                                │
│ • "Cat website"      yesterday   ▶ open                          │
│ • "Birthday card"    3 days ago  ▶ open                          │
│ • "Number guessing"  last week   ▶ open                          │
└─────────────────────────────────────────────────────────────────┘
```

Templates seed `Project.kind=code` with a starting set of files (typically `index.html` + `style.css` + `script.js`). Picking a template costs 1⭐ (the seed prompt expansion). Blank Project is also 1⭐. Past projects don't recharge.

### 2.2 Studio surface (`/learn/code/:projectId`)

Three modes, **automatically selected from `KidProfile.age`**, manual override locked behind parent approval:

| Age | Mode | Layout |
|---|---|---|
| 8-11 | **Lite** | Single big preview + chat below; file tree hidden by default ("Show files" button to reveal) |
| 12-17 | **Pro** | Three resizable panes: Files (left) · Chat (middle) · Preview (right). Identical mental model to desktop Kids OpenCode TUI |
| Parent / teacher viewing kid's project | **Read-only** | Pro layout, no edit/chat controls, "Make a copy to edit" button |

### 2.3 Pro layout (12-17)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ← My Works   "Cat website"  💾 Auto-saved 2s ago      Mia ▼  ⭐ 12  ⏸ Pause│
├──────────────┬───────────────────────────┬─────────────────────────────────┤
│ 📁 Files     │ 💬 Code Critter           │ 👁  Preview        [▶ Run anew] │
│ ─────────────│ ────────────────────────  │ ──────────────────────────────  │
│ ▼ /          │  🧑 Mia: add a button that│                                 │
│  📄 index.html│      makes the cat dance │  ┌──────────────────────────┐ │
│  📄 style.css│                            │  │                          │ │
│  📄 script.js│  🤖 Plan: I'll add a      │  │     🐱  (animated)        │ │
│  📁 images/  │      <button> in index.html│  │                          │ │
│   🖼 cat.png │      and an onclick in    │  │   [Make me dance!]       │ │
│              │      script.js. Shall I?  │  │                          │ │
│ [+ File]     │      [✓ yes] [✕ no]       │  └──────────────────────────┘ │
│ [+ Upload]   │                            │                                 │
│              │  🧑 Mia: yes               │  Console:                       │
│              │  🤖 ✏️ Edited index.html  │  > ready                        │
│              │      (+3 lines)            │                                 │
│              │      ✏️ Edited script.js  │                                 │
│              │      (+5 lines)            │                                 │
│              │      (−2⭐ this turn)     │                                 │
│              │                            │                                 │
│              │  ▼ Show diff               │                                 │
│              │                            │                                 │
│              │  [What do you want next?]  │                                 │
│              │  [────────────────] [Ask] │                                 │
└──────────────┴───────────────────────────┴─────────────────────────────────┘
```

### 2.4 Lite layout (8-11)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ← My Works   "My Pet Site"   💾  ⭐ 12  [⏸ Pause]                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                                                                      │ │
│  │                       Big live preview                               │ │
│  │                                                                      │ │
│  │              (the website / game / drawing pad)                      │ │
│  │                                                                      │ │
│  │                                                                      │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  🧑 Mia: add a button to make the cat dance                                │
│  🤖 ✅ Added a button! Try it.   (−2⭐)                                    │
│                                                                            │
│  [Tell the AI what to change...                          ] [✨ Ask  −?⭐]  │
│                                                                            │
│  [🔄 Try something else]  [📁 Show files]  [💾 Save & exit]                │
└────────────────────────────────────────────────────────────────────────────┘
```

Lite hides file tree, hides diffs (only renders "Added a button!" plain-language summary). Tapping `📁 Show files` opens a Pro-style file tree drawer; sometimes a 9-year-old wants to see — but the default is *don't make them look at code*.

---

## 3. Project model

A Code Studio project is just a `Project` row (`platform-backend-api-spec.md` §4.4) with `kind = code` and an attached `virtual_fs_prefix`. No new top-level table.

### 3.1 Required additions to existing models

```prisma
// Extend Project (additive)
model Project {
  // ... existing fields ...
  kind                ProjectKind @default(creative)   // NEW — discriminator for routing
  virtual_fs_prefix   String?     @unique              // NEW — S3 key prefix for kind=code projects
                                                       // e.g. "fam_abc123/proj_xyz789/"
  preview_html_artifact_id String?                     // NEW — pointer to current built index.html artifact
                                                       // used for class wall preview / shared link
}

enum ProjectKind {
  creative                                              // image / music / video / voice / story workspace
  code                                                  // Code Studio project
}
```

### 3.2 Virtual FS layout

Files live in S3 under `s3://airbotix-vfs-{env}/family_id/project_id/<path>`. The web app **never** addresses S3 directly for VFS read/write — every operation goes through the backend's `tools` service so that:

1. Path traversal is blocked (no `..`, no absolute paths)
2. File size caps are enforced (per file 500 KB; per project 10 MB V0)
3. File extension allow-list is enforced (V0: `.html` / `.css` / `.js` / `.json` / `.txt` / `.md` / `.png` / `.jpg` / `.gif` / `.svg` / `.webp` — see §6 Sandbox)
4. Every write emits an audit event

### 3.3 Project lifecycle

| Event | Stars | What happens |
|---|---|---|
| Kid picks template at `/learn/create/code` | 1⭐ | Backend creates `Project(kind=code)`, expands template to VFS, records `WalletTransaction(reason='code_studio_template_seed')` |
| Kid asks agent for a change | per-turn cost (§4.3) | LLM proxy runs, agent calls `write_file` / `edit_file` tools, each tool call validated by VFS service |
| Kid hits `[▶ Run anew]` | 0⭐ | Backend serves the current VFS contents into the iframe via signed Blob URLs; no LLM, no cost |
| Kid hits `[💾 Save & exit]` | 0⭐ | No-op — VFS is already persistent; the button just routes to `/learn/projects` |
| Kid shares to class wall | 0⭐ | Backend snapshots VFS → builds a single static `preview.html` → stores under `Artifact(kind=html)`; goes through normal share-request flow (`learn-classroom-prd.md`) |
| Kid downloads project | 0⭐ | Backend zips VFS → signed S3 download URL (5min TTL) |

---

## 4. Agent contract

### 4.1 Model selection

Routed via DeepRouter (`/llm/text-completion` with `kind=code_agent`). V0 single model: **Claude Sonnet 4.5** (per `kids-ai-platform-prd.md` Appendix B). DeepRouter is responsible for cheaper fallback selection per § Margin policy.

System prompt enforces:
- **Output is *always* a tool call sequence + a 1-2 sentence plain-language summary** (NEVER raw code dumped into chat — kids should see *what changed*, not a wall of text)
- For Lite mode (8-11): summary is in *very plain* English ("I added a button that makes the cat dance!"), no jargon
- Refuses to: install dependencies, suggest npm/pip commands, write back-end code, write code that calls external APIs (no fetch to non-localhost), write code that mentions hostnames/IPs
- Never asks the kid to paste API keys, never offers to "save credentials"
- Always proposes a `plan` first when the change touches > 1 file or > 20 lines — kid must click `[✓ yes]` before tool calls execute (mirrors Kids OpenCode TUI's plan/approve flow)

### 4.2 Tool whitelist (V0)

```
read_file(path)           → returns file contents as string
write_file(path, content) → creates or overwrites; size + extension validated
edit_file(path, find, replace, [count]) → in-place edit; find must match
list_dir(path)            → returns array of {name, kind, size}
```

**Not in V0**: `delete_file`, `move_file`, `run_command`, `fetch_url`, `install_dependency`. Each addition needs a security review + parent-visibility design.

### 4.3 Stars cost model

Per turn cost depends on context size + tools fired. V0 published table:

| Turn type | Lite (8-11) | Pro (12-17) |
|---|---|---|
| Pure chat (no file change) | 1⭐ | 1⭐ |
| 1-3 file writes, single shot | 2⭐ | 2⭐ |
| Plan + approve + ≥4 file writes | 3⭐ | 3-5⭐ |
| Per-turn hard cap (§9.3 of platform PRD) | 5⭐ | 5⭐ |

Estimated cost is shown on the `[✨ Ask]` button (`Ask −?⭐` resolves to `Ask −2⭐` after the agent plans). Final debit happens at end of turn (after tool calls complete) — matches §9.7.2 "后扣模式" rule.

### 4.4 Streaming

Server-sent stream via WebSocket (same `agent.stream.delta` event as `airbotix-app-learn-prd.md` §5.1bis). Each tool call emits a discrete event:
- `agent.plan` — `{plan_text, planned_tools: [...]}`
- `agent.tool.start` — `{tool, args}`
- `agent.tool.done` — `{tool, result_summary, bytes_written?}`
- `agent.stream.done` — `{stars_charged, summary}`

The chat pane renders these as rich items (not plain text).

---

## 5. Preview

### 5.1 V0 preview = browser-only iframe

The Preview pane is a single `<iframe sandbox="allow-scripts">` (note: deliberately **no** `allow-same-origin`, **no** `allow-top-navigation`, **no** `allow-forms` for V0). The iframe loads a single-document `srcdoc` built by the frontend from the VFS:

```html
<!doctype html>
<html><head>
  <style>{{ style.css contents inlined }}</style>
</head><body>
  {{ index.html body contents }}
  <script>{{ script.js contents inlined }}</script>
</body></html>
```

External `<img src="images/cat.png">` resolves via a service worker (`/learn/code/:projectId/sw.js`) that intercepts fetches and serves from cached VFS reads.

Why this approach (not a real preview server): keeps V0 100% client-side after VFS sync. No "preview server" hosts kid HTML on a public origin → no CSRF vector, no XSS-into-real-page risk, no DNS cost. Trade-off: kids can't use `fetch()` to external URLs (we don't want that anyway — see §6 Sandbox §4.1 system prompt).

### 5.2 V1+ preview

When the file tree grows past single-page apps (e.g. a kid wants to add a service worker, or a `<canvas>` game with separate audio asset loading needs cross-file fetches), we'll need a dedicated preview origin (e.g. `preview-{project_id}.preview.airbotix.ai`) with proper isolation. Out of scope V0.

### 5.3 Console capture

The iframe's `console.log` is piped to the Console panel under Preview (PostMessage from iframe → parent window → Console pane). Errors auto-highlight; clicking an error opens a chat-prefilled `🤖 Fix this error: …` action button.

---

## 6. Sandbox & safety

> Reuses the kids-ai-platform-prd v0.4 §11.6 framework (Line B agentic safety). Specifics:

### 6.1 Network boundary

The iframe runs with no `allow-same-origin` → it can't read cookies, can't fetch from `app.airbotix.ai`, can't read parent window globals. The service worker that serves VFS files explicitly **rejects any URL outside the project prefix** (returns 404).

The agent's system prompt **forbids** writing code that does `fetch()`, `XMLHttpRequest`, `import()` (dynamic), `new WebSocket`, `navigator.geolocation`, `navigator.mediaDevices`. A pre-write linter (cheap regex pass before `write_file` commits) blocks any of these tokens and returns an error to the agent so it self-corrects.

### 6.2 VFS isolation

Each project's VFS is keyed by `family_id × project_id` (S3 prefix isolation). The tool service rejects any `path` that:
- Starts with `/` or contains `..`
- Resolves outside the project prefix
- Has an extension not in the V0 allow-list (§3.2)
- Would push project size past 10 MB or any single file past 500 KB

Multi-kid isolation: a kid can only address VFS for projects where `Project.kid_id = current_kid_id OR Project.shared_with_class_id IN current_kid.classes` (latter is read-only).

### 6.3 Code-content moderation

Two layers, mirroring `kids-ai-platform-prd.md` §11.1:
1. **Prompt filter** (cheap) — applied to the kid's chat message before it hits the LLM. Same blocklist as other Studios.
2. **Output scan** (cheap) — after the agent's tool-call sequence, the *summary text* and any *string literals in written code* pass through the kid-safety classifier. If flagged: tool calls are rolled back from VFS (S3 versioning), Stars refunded, audit event with `severity=warn`.

V0 does **not** scan code for *semantic* harm (e.g. an agent could write a working drawing app that displays a slur — only the string content is scanned, not the rendered output). V1 will add screenshot-based output moderation (render iframe → screenshot → image moderation) when share-to-class is requested.

### 6.4 Parent visibility

Every turn writes a `code_agent_turn` audit event:
```json
{
  "kind": "code_agent_turn",
  "project_id": "proj_xyz",
  "summary": "Added a dance button to index.html and script.js",
  "tools_fired": ["edit_file:index.html", "edit_file:script.js"],
  "stars_charged": 2,
  "prompt_flagged": false,
  "output_flagged": false
}
```

The audit feed renders this as a single line; clicking expands to show the kid's prompt + the agent's plan + per-file diff (rendered as red/green inline). Parents get the same `/portal/audit/project/:id` replay experience already specced for other project kinds (`parent-portal-prd.md` §4.7).

---

## 7. Mission integration

A Course Pack Mission step of `widget: code` (see `learn-missions-prd.md` §3.x widget registry) embeds the Code Studio in Pro mode (regardless of kid age — Mission authoring decided the right scaffold) inside Mission chrome. Differences:

- `Project` is created with `mission_id` set; the Mission acceptance gate runs against the final VFS (e.g. `assert files.include("index.html") && index.html contains "<button"`)
- Stars are debited from the Workshop Credit Pool when the Mission step runs during a Class session (per `kids-ai-platform-prd.md` §9.5)
- Kid can't navigate away to `/learn/code/:projectId` mid-Mission — the Studio runs in-place

---

## 8. WebSocket events

| Event | Direction | Payload | Notes |
|---|---|---|---|
| `agent.plan` | server → kid | `{plan_text, planned_tools[]}` | New, code-studio-specific |
| `agent.tool.start` | server → kid | `{tool, args}` | New |
| `agent.tool.done` | server → kid | `{tool, result_summary, bytes_written?}` | New |
| `agent.stream.delta` | server → kid | `{delta_text}` | Reused from existing chat |
| `agent.stream.done` | server → kid | `{stars_charged, summary}` | Reused; payload extended with `tools_fired[]` |
| `code.vfs.changed` | server → kid + parent (family room) | `{project_id, files_changed[]}` | Triggers Preview refresh + parent dashboard live tail |

---

## 9. Backend dependencies

| Component | Status | Notes |
|---|---|---|
| `/llm/text-completion` proxy → DeepRouter | ✅ shipped | Add new `kind=code_agent` prompt template |
| Project + Artifact models | ✅ shipped | Need additive migration (§3.1) |
| S3 signed upload/download | ✅ shipped | VFS service is a thin layer on top |
| **`tools` service** (validates + dispatches `read_file` / `write_file` / `edit_file` / `list_dir`) | ⬜ | **New module** `platform-backend/src/tools/`; ~400-600 LOC; reuses S3 client + audit emitter |
| **`code-sessions` module** (session state, plan/approve flow, idempotent tool replay) | ⬜ | **New module** `platform-backend/src/code-sessions/`; ~300-500 LOC |
| Pre-write linter (regex pass for forbidden tokens) | ⬜ | Tiny utility inside `tools` |
| Audit `code_agent_turn` event kind | ⬜ | Add to `audit-event-schema-prd.md` event enum |
| `code.vfs.changed` WS event emit | ⬜ | Wire in `ws.gateway.ts` |

Frontend dependencies: TanStack Query + WS hooks already in place; new components are Studio-specific (file tree, chat with rich tool-call rendering, iframe preview with service-worker swap, diff viewer).

---

## 10. Stars & wallet integration

Stars debit follows the platform's existing "后扣模式" pattern (`kids-ai-platform-prd.md` §9.7.2.3). The Code Studio is multi-turn + multi-tool-call per turn, so the platform's atomic `UPDATE wallets … RETURNING` debit fires once at `agent.stream.done`, after all tool calls have either succeeded or been rolled back from VFS.

Failure modes:
- LLM completes but a tool call fails (e.g. output_flagged) → tool calls rolled back, Stars **refunded** (write `WalletTransaction(type=refund, reason='code_agent_rollback')`).
- LLM errors mid-stream → no debit fires.
- Kid hits the wallet cap mid-multi-step plan (rare — caps checked at plan start) → plan halts gracefully, "You're out of Stars for today, ask a parent" message rendered with the standard approval-request CTA.

---

## 11. Compliance & age policy

Per `docs/product/compliance/minors-compliance.md`:
- **C2 (age-appropriate content)**: code-studio specific moderation prompt + the V0 output-string scan covered in §6.3
- **C4 (no DM / no peer chat in V0)**: the Studio has no kid-to-kid chat; the agent is the only conversational entity
- **C7 (parent audit replay)**: every `code_agent_turn` is fully replayable, including diff
- **C13 (incident bot)**: if `output_flagged=true` fires ≥3 times in 24h for the same kid, auto-open an incident (per existing `IncidentsService.checkOnAuditEvent`)
- **C15 (export / delete)**: kid's VFS files included in the family data export ZIP at `/portal/settings → Privacy & Data`

No new compliance items raised by this Studio that aren't already in the framework.

---

## 12. Open Questions

| ID | Question | Owner | Resolution by |
|---|---|---|---|
| D-CODE-Q1 | V0 supports HTML/CSS/JS only — when does Pyodide (Python in browser) land? Spec'd as V1+ in `kids-ai-platform-prd.md` §13.2 but no concrete trigger | Lightman | V0 ship + 4 weeks of usage data |
| D-CODE-Q2 | Should the Lite mode hide *Show diff* permanently for ages 8-9, or just default-hide? | Design | UX research with cohort 1 |
| D-CODE-Q3 | Class wall preview is a flat `preview.html` snapshot today — do we want interactive preview (run other kids' code) at all, or is screenshot enough? Security review needed before going interactive | Engineering + security | V0 ship → V0+1 month |
| D-CODE-Q4 | Should we expose `[Open in Kids OpenCode desktop]` once the desktop V1 ships, as a one-click "graduate to power mode" handoff? | Product | V1 planning |
| D-CODE-Q5 | Does the agent get any retrieval over the kid's *own past projects*? Could be powerful ("rebuild what I made last week but make it bigger") but adds context cost. Punt to V1 | Engineering | V1 |
| D-CODE-Q6 | Per-project storage cap is 10 MB V0 — is that the right number? Hard data needed after cohort 1 (image assets eat budget fast) | Engineering | V0 ship + 2 weeks |

---

## 13. V0 scope

### 13.1 V0 In Scope (ships with platform V0)

- `/learn/create/code` hub with 4 templates + Blank
- `/learn/code/:projectId` Pro layout (12-17)
- `/learn/code/:projectId` Lite layout (8-11), auto-selected from `KidProfile.age`
- `/learn/code/:projectId/run` standalone iframe preview
- Tool whitelist: `read_file` / `write_file` / `edit_file` / `list_dir` (V0 four tools only)
- Pre-write linter for forbidden tokens (§6.1)
- Iframe sandbox preview with service-worker VFS shim (§5.1)
- Console capture + "Fix this error" CTA (§5.3)
- Stars debit via existing wallet (§10) + audit event `code_agent_turn` (§6.4)
- Mission widget integration (§7)
- Class wall flat-snapshot preview (§3.3)
- Project ZIP download (§3.3)
- Routing: `/learn/projects/:id` for `Project.kind=code` redirects to `/learn/code/:id`
- `Project.kind` + `Project.virtual_fs_prefix` Prisma migration
- `tools` + `code-sessions` backend modules
- New WS events (§8)

### 13.2 V0 Out of Scope

- Pyodide / Python in browser — V1
- `delete_file` / `move_file` / `fetch_url` / `run_command` tools — needs security review per addition
- Multi-kid collab on same project — V2
- Dedicated preview origin (`preview-{project_id}.preview.airbotix.ai`) — V1+ when multi-doc apps land
- Output screenshot moderation — V1 (gates the interactive class wall in D-CODE-Q3)
- Project templates marketplace / kid-shared templates — V2
- IDE features (find-in-files, multi-cursor, syntax-error gutter) — V1 polish
- Mobile-first Pro layout — V0 ships Pro layout desktop-only; Lite layout works on tablets

### 13.3 V0 acceptance

1. A 9-year-old, given the "My Pet Website" template + a parent watching, can ship a working page in ≤ 15 min and ≤ 8⭐ spent
2. A 13-year-old, blank project, can build a working "guess my number" game in ≤ 30 min and ≤ 20⭐ spent
3. 100% of agent turns either succeed atomically (all tool calls land + Stars debited once) or roll back atomically (no partial VFS state)
4. Iframe preview never has same-origin access to `app.airbotix.ai` cookies (verified by red-team probe)
5. `output_flagged=true` → tool calls reverted + Stars refunded + audit event with `severity=warn` — passes red-team injection test on V0 launch
6. Parent at `/portal/audit/project/:id` can replay any code turn including the full diff
7. p50 turn latency < 4s (plan to first tool start), p95 < 10s (single-shot); class-wall snapshot build < 2s
8. Project ZIP download works for projects up to 10 MB

---

## 14. Roadmap

### V0 (0-3 months) — see §13.1

### V1 (3-6 months)
- Pyodide (Python in browser) → unlocks data/algorithm/ML Course Packs
- Dedicated preview origin for multi-doc apps
- Output screenshot moderation → unlocks interactive class wall
- `[Open in Kids OpenCode desktop]` handoff (per D-CODE-Q4) once desktop V1 ships
- IDE polish (find-in-files, syntax-error gutter, multi-cursor select)
- Mobile Pro layout (iPad split view)
- Project import from ZIP

### V2 (6-12 months)
- Multi-kid collab (real-time co-edit; OT or CRDT)
- Kid-shared template marketplace (parent-moderated)
- Server-side runtime for non-HTML targets (Node toy / SQL playground / robot simulator) — re-opens the per-session-container question (§13 of `kids-ai-platform-prd.md` defers this; revisit here)
- Cross-Studio composition (drop a music-studio output as audio asset into a code project)

---

## 15. References

- `kids-ai-platform-prd.md` v0.4 §1.3 / §13.1 / §11.6 — strategic positioning (V0 Hosted-first), Line A/B split, agentic safety framework
- `airbotix-app-learn-prd.md` v0.3 — Kid Learn surface IA (route table extended in v0.4 to include `/learn/create/code` + `/learn/code/:projectId`); §1 / §11 out-of-scope list revised to remove "❌ AI Coding"
- `kids-opencode-client-prd.md` v0.3 — sibling desktop client, repositioned by this PRD as V1+ power-user mode (BYO API key, larger context, local FS access). The hosted Studio is the V0 primary entry; desktop is the graduate path
- `learn-missions-prd.md` — Mission widget contract; `widget: code` step type invokes this Studio in embedded mode
- `learn-projects-prd.md` — My Works; `Project.kind=code` routes to this Studio instead of generic project workspace
- `learn-classroom-prd.md` — Class Wall; flat-snapshot preview for code projects, interactive preview deferred to V1 per D-CODE-Q3
- `platform-backend-api-spec.md` §4.4 (Project / Artifact additive migration) · §5.11 (`/llm` proxy) · §5.7 (S3 artifacts) · §6 (new WS events)
- `audit-event-schema-prd.md` — new event kind `code_agent_turn`
- `docs/product/compliance/minors-compliance.md` C2 / C4 / C7 / C13 / C15

---

## 16. Implementation status snapshot (2026-05-25)

> Symbols: ✅ shipped · 🟡 partial · ⬜ not started · n/a not applicable.

| Area | Backend | Frontend | Notes |
|---|---|---|---|
| §2.1 `/learn/create/code` hub | ⬜ | ⬜ | **Spec only.** No route, no page file |
| §2.2-2.3 `/learn/code/:projectId` Pro layout | ⬜ | ⬜ | **Spec only.** New 3-pane component family |
| §2.4 Lite layout (8-11) | ⬜ | ⬜ | **Spec only.** Auto-selected on `KidProfile.age` |
| §3.1 `Project.kind` + `virtual_fs_prefix` migration | ⬜ | n/a | Additive Prisma migration |
| §4.2 Tool whitelist (`read/write/edit/list_dir`) | ⬜ | n/a | New `platform-backend/src/tools/` module |
| §4.2 Pre-write linter | ⬜ | n/a | Tiny utility inside `tools` |
| §4 Agent plan/approve flow | ⬜ | ⬜ | New code-sessions module + chat rendering |
| §5.1 Iframe sandbox + service-worker VFS shim | n/a | ⬜ | New |
| §5.3 Console capture + "Fix this error" CTA | n/a | ⬜ | New |
| §6.3 Code-content moderation (prompt + output string scan) | ⬜ | n/a | Reuses existing classifier; new code-path wiring |
| §6.4 `code_agent_turn` audit event | ⬜ | n/a | Add event kind |
| §7 Mission `widget: code` integration | ⬜ | ⬜ | Coordinated with `learn-missions-prd.md` widget registry |
| §8 New WS events (`agent.plan/tool.*`, `code.vfs.changed`) | ⬜ | ⬜ | Emit + consume |

**V0 work bundle**: ~1.5 backend sprints (`tools` + `code-sessions` + Prisma migration + audit + WS) + ~2 frontend sprints (hub + Pro layout + Lite layout + iframe sandbox + service worker + diff viewer + chat-with-tool-call renderer). Total ~3-4 weeks team-of-3.

**Critical dependency**: the existing `/llm/text-completion` proxy must accept a new `kind=code_agent` request type and stream tool-use deltas. DeepRouter contract change tracked in `deeprouter-coupling-plan.md` (TODO).

---

## Revision history

- **v0.1 — 2026-05-25** — Initial draft. Creates the missing PRD for the in-browser Code Studio. Reconciles the `kids-ai-platform-prd.md` v0.4 "V0 Hosted-first" strategic decision with `airbotix-app-learn-prd.md`'s out-of-scope "❌ AI Coding" exclusion — this PRD removes the exclusion in favour of the platform strategy. Repositions `kids-opencode-client-prd.md` desktop client as V1+ power-user mode (BYO API key) rather than V0 primary entry.
