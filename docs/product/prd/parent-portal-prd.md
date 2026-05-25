# Parent Portal — airbotix-app `/portal/*` — PRD

> **Status**: Draft v0.2 · 2026-05-25
> **Repo**: `Airbotix-AI/airbotix-app` (React + Vite SPA)
> **Domain**: `app.airbotix.ai`
> **Author**: Airbotix engineering
> **Depends on**: `platform-backend-api-spec.md` (API contract)
>
> **2026-05-25 (v0.2)**: 新增 §4.4.1 自动续充（auto-topup, opt-in, V0 必交付，D-WAL-01）+ §4.4.2 充值反欺诈整体上限（D-WAL-02）+ §4.9 AI 用量统计页 `/portal/usage`（D-USE-01）。IA 与 nav 同步更新。

---

## 1. Purpose

The Parent Portal is **the surface where parents control their kids' AI use**. It's the operationalised version of every "trust mechanism" we promise on the marketing site:
- Audit replay → `/portal/audit`
- Wallet caps → `/portal/wallet`
- Approval queue → `/portal/approvals`
- Multi-kid management → `/portal/family`
- Data export / deletion → `/portal/settings`

Parent Portal is **not** the kid learning surface (that's `/learn/*`, covered in `airbotix-app-learn-prd.md`) and **not** the teacher console (separate repo).

---

## 2. Information Architecture

```
app.airbotix.ai
├── /portal/login              (PUBLIC) — OTP email entry
├── /portal/verify-otp         (PUBLIC) — 6-digit OTP input
├── /portal/register           (PUBLIC) — first-time family setup wizard
│
├── /portal                    [auth] — Dashboard (entry point after login)
├── /portal/family             [auth] — Multi-kid list / add / switch
├── /portal/family/:kidId      [auth] — Single kid settings + activity
├── /portal/family/new         [auth] — Add new kid wizard
│
├── /portal/wallet             [auth] — Balance + transactions + top-up
├── /portal/wallet/topup       [auth] — Stars Pack selection + Airwallex redirect
├── /portal/wallet/auto-topup  [auth] — Auto-topup config + saved payment methods
│
├── /portal/usage              [auth] — Per-kid AI usage analytics
├── /portal/usage/:kidId       [auth] — Single-kid usage drill-down
│
├── /portal/approvals          [auth] — Approval queue (pending + recent)
│
├── /portal/audit              [auth] — Family audit feed
├── /portal/audit/project/:id  [auth] — Single-project replay
│
├── /portal/settings           [auth] — Privacy, notifications, data export, delete account
│
└── /portal/billing            [auth] — Receipts, invoices, refunds
```

### Nav drawer (left, fixed on desktop / drawer on mobile)

```
🏠 Dashboard
👨‍👩‍👧 My Family       (2 kids · 1 needs attention)
⭐ Wallet              42⭐ remaining · 🔁 Auto-topup ON
📊 Usage               340 tokens today
🛎️ Approvals          3 pending  ← red badge
📜 Activity / Audit
⚙️ Settings

[Avatar]  Lightman Wang
          [Log out]
```

Badge shows pending count for Approvals (real-time via WebSocket).

---

## 3. Auth & Onboarding Flows

### 3.1 First-time parent registration

```
Step 1: Email + role
  /portal/login → enter email → request OTP
  
Step 2: Verify
  /portal/verify-otp → 6 digits → JWT + refresh token
  
Step 3: New user? Run setup wizard:
  /portal/register
  ┌──────────────────────────────────────────┐
  │ Welcome to Airbotix.                     │
  │ Let's set up your family in 90 seconds. │
  │                                          │
  │ [1] Your name              [_______]     │
  │ [2] Family name            [_______]     │
  │     (e.g. "The Wang Family")             │
  │ [3] Region (auto: AU)      [AU ▼]        │
  │ [4] How many kids will be using Airbotix?│
  │     ( ) Just one  (•) 2-3  ( ) 4-5       │
  │                                          │
  │ [continue →]                             │
  └──────────────────────────────────────────┘
  
Step 4: Add first kid (mandatory)
  ┌──────────────────────────────────────────┐
  │ Tell us about your first kid             │
  │                                          │
  │ [1] Nickname                [_______]    │
  │     (what they want to be called online) │
  │ [2] Age                     [   ▼ ]      │
  │ [3] Set a 4-digit PIN       [_ _ _ _]    │
  │     (so your kid can log in themselves)  │
  │                                          │
  │ Optional:                                │
  │ [4] Real name (private)     [_______]    │
  │ [5] Date of birth           [____-__-__] │
  │                                          │
  │ [continue →]                             │
  └──────────────────────────────────────────┘
  
Step 5: Privacy + Parental Consent
  Render summarised /parental-consent content inline + 
  3 mandatory checkboxes:
  ☐ I understand the Privacy Policy
  ☐ I consent to Airbotix processing my kid's data
  ☐ I am 18+ and authorised to act on my kid's behalf
  
  [Submit consent → Land on /portal Dashboard]
```

Returning users skip Step 3-5; redirect to `/portal` (Dashboard).

### 3.2 Returning login

```
/portal/login → email → OTP → /portal Dashboard
```

If JWT exists and is fresh → auto-redirect from `/portal/login` to `/portal`.

### 3.3 Session management

- Access token: 15min TTL, refreshed silently on any 401 + valid refresh token
- Refresh token: 30 days, HttpOnly cookie, rotated on each refresh
- "Log out everywhere" in Settings revokes all refresh tokens for the user

---

## 4. Page-by-page Blueprint

### 4.1 `/portal` — Dashboard

**Purpose**: 5-second answer to "what's my kid doing right now and is everything OK?"

```
┌─────────────────────────────────────────────────────────────────┐
│ 👋 Good morning, Lightman                                       │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│ │ This week   │ │ Stars left  │ │ ⚠️ Needs you │                │
│ │   18 sess.  │ │     42 ⭐    │ │   3 approvals│                │
│ │ ↑ 3 vs last │ │ resets Mon  │ │ [review →]  │                │
│ └─────────────┘ └─────────────┘ └─────────────┘                │
│                                                                 │
│ ── Your kids ──                                                 │
│ ┌──────────────────────┐  ┌──────────────────────┐             │
│ │ 🧒 Mia, 10           │  │ 🧑 Leo, 13           │             │
│ │ AI Creative Lab      │  │ Kids OpenCode        │             │
│ │ 🟢 Active 5min ago   │  │ ⚪ Last seen 2 days  │             │
│ │ This week:           │  │ This week:           │             │
│ │  ✓ 3 sessions        │  │  ✓ 1 session         │             │
│ │  ✓ 1 story finished  │  │  ⚠ stuck on Mission2 │             │
│ │  ⭐ 14 used           │  │  ⭐ 8 used            │             │
│ │ [Activity →]         │  │ [Help Leo →]         │             │
│ └──────────────────────┘  └──────────────────────┘             │
│                                                                 │
│ ── Recent activity (family-wide) ──                             │
│ • Mia generated 3 images for "My Cat Story"        2min ago    │
│ • Approval granted: Mia +10 extra Stars            12min ago   │
│ • Leo opened Kids OpenCode (idle)                  2h ago      │
│ • Wallet topped up: Family Pack A$30 (30⭐)        Yesterday    │
│ [See all activity →]                                            │
│                                                                 │
│ ── Quick actions ──                                             │
│ [➕ Add a kid]  [⭐ Top up Stars]  [🎓 Browse classes]          │
└─────────────────────────────────────────────────────────────────┘
```

**Data sources**:
- `GET /auth/me` — user + family + kids
- `GET /families/:id/wallet` — balance + caps
- `GET /families/:id/approvals?status=pending` — pending count
- `GET /families/:id/audit?limit=10` — recent activity (also live via WS)
- `GET /kids/:id/projects?status=in_progress` — per-kid in-flight projects

**Real-time**:
- WS room `family:<family_id>` — incoming `audit.event`, `wallet.update`, `approval.new` updates the cards live without refresh
- "Active 5min ago" indicator driven by latest AuditEvent for that kid

### 4.2 `/portal/family` — Multi-Kid Manager ⭐

> **This is the page the user specifically asked about**. Three states.

#### Empty state (0 kids)

Shouldn't normally happen (registration forces 1 kid), but as a safety net:

```
┌─────────────────────────────────────────────────────────────────┐
│ Your Family                                                     │
│                                                                 │
│         ┌──────────────────────────────────┐                    │
│         │                                  │                    │
│         │   👨‍👩‍👦                              │                    │
│         │                                  │                    │
│         │   You haven't added any kids yet.│                    │
│         │   Let's set up your first one.   │                    │
│         │                                  │                    │
│         │   [+ Add a Kid]                  │                    │
│         │                                  │                    │
│         └──────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

#### Single-kid state (1 kid)

```
┌─────────────────────────────────────────────────────────────────┐
│ Your Family                              [+ Add another kid]    │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ 🧒 Mia, 10 · AI Creative Lab                              │   │
│ │ ────────────────────────────────────────────────────────  │   │
│ │ Family code: WANG          PIN: ••••  [Reset PIN]        │   │
│ │ Daily Stars cap: 20⭐/day   Used today: 14⭐               │   │
│ │ Topic limits: Default (safe for 8-11)                    │   │
│ │                                                          │   │
│ │ ── Current projects ──                                   │   │
│ │ • My Cat Story (in progress · 5 images · 1 story)        │   │
│ │ • Birthday Card for Grandma (finished)                   │   │
│ │                                                          │   │
│ │ [Edit] [Audit] [Projects] [Pause Mia]                    │   │
│ └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### Multi-kid state (2+ kids)

```
┌─────────────────────────────────────────────────────────────────┐
│ Your Family (2 kids)         Sort: [Name ▼]  [+ Add another]    │
│                                                                 │
│ ┌──────────────────────────┐  ┌──────────────────────────┐     │
│ │ 🧒 Mia, 10               │  │ 🧑 Leo, 13               │     │
│ │ AI Creative Lab          │  │ Kids OpenCode            │     │
│ │ 🟢 Active                │  │ ⚪ Idle                  │     │
│ │ 14/20⭐ today             │  │ 8/30⭐ today              │     │
│ │ [Open Mia →]             │  │ [Open Leo →]             │     │
│ └──────────────────────────┘  └──────────────────────────┘     │
│                                                                 │
│ ── Family-wide controls ──                                      │
│ Family Stars cap:  Daily 50⭐  Weekly 200⭐  Monthly 600⭐      │
│ [Adjust caps]                                                   │
│ [⏸ Pause entire family]   [💾 Export all family data]          │
└─────────────────────────────────────────────────────────────────┘
```

**Key UX rules**:
- Card layout switches from horizontal stack (1 kid, full-width) to 2-up grid (2 kids) to 3-up grid (3+)
- Each card shows real-time status: 🟢 active / 🟡 needs help / ⚪ idle / ⚠️ over cap / ⏸ paused
- "Add another kid" button always visible (top right)
- Family-wide caps separate from per-kid caps (per-kid override only goes lower than family cap)
- "Pause entire family" = wallet.paused, all AI calls return 423 FAMILY_PAUSED

#### Add Kid wizard `/portal/family/new`

Same form as registration step 4, but no consent re-prompt (parent already consented; new kid uses existing family consent record). Optional: re-consent if topic limits relaxed.

### 4.3 `/portal/family/:kidId` — Single kid

```
┌─────────────────────────────────────────────────────────────────┐
│ ← My Family                                                     │
│                                                                 │
│ 🧒 Mia Wang, 10                                  [Edit] [⋯ More]│
│ ────────────────────────────────────────────────────────────── │
│                                                                 │
│ ┌─ Login info ────────────────────────────────────────────┐    │
│ │ Family code: WANG     Nickname: Mia    PIN: ••••        │    │
│ │ [Print kid login card] [Reset PIN] [Reset nickname]     │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ┌─ Stars & limits ────────────────────────────────────────┐    │
│ │ Daily cap:    [20] ⭐                                    │    │
│ │ Weekly cap:   [80] ⭐                                    │    │
│ │ Used today:   14/20  ████████░░░░░ 70%                  │    │
│ │ Per-turn max: 5 ⭐ (family default)                      │    │
│ │ [Save changes]                                          │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ┌─ Topic limits ──────────────────────────────────────────┐    │
│ │ Content level:  ● Strict   ○ Standard   ○ Open          │    │
│ │ Specific topics this kid CANNOT discuss:                │    │
│ │ ☑ Violence       ☑ Romance      ☐ Politics              │    │
│ │ ☑ Self-harm      ☐ Sci-fi horror                        │    │
│ │ [Save]                                                  │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ┌─ Recent activity (last 7 days) ─────────────────────────┐    │
│ │ • Apr 14 — generated 3 images for "My Cat Story"        │    │
│ │ • Apr 14 — completed Mission "Make your AI pet"         │    │
│ │ • Apr 13 — requested 10 extra Stars (you granted)       │    │
│ │ • Apr 13 — joined Class "AI Creative Lab Term 1"        │    │
│ │ [See all Mia's activity →]                              │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ── Danger zone ──                                               │
│ [Pause Mia]  [Delete Mia's profile]                             │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 `/portal/wallet` — Stars

```
┌─────────────────────────────────────────────────────────────────┐
│ Wallet                                                          │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │            42 ⭐                                         │    │
│ │            ─────                                         │    │
│ │            Stars remaining                               │    │
│ │                                                          │    │
│ │  Daily:   14/50   ████░░░░░░ 28%                        │    │
│ │  Weekly:  68/200  ███░░░░░░░ 34%                        │    │
│ │  Monthly: 142/600 ██░░░░░░░░ 24%                        │    │
│ │                                                          │    │
│ │  🔁 Auto-topup ON · refills 30⭐ when balance < 10⭐      │    │
│ │     Last auto-topup: yesterday A$30 · Visa ••4242        │    │
│ │     Daily auto-topup cap: A$30/day (A$0 used today)      │    │
│ │                                                          │    │
│ │  [⭐ Top up Stars]    [⏸ Pause family]   [Edit caps]    │    │
│ │  [⚙️ Auto-topup settings]                                │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ── Transactions ──            Filter: [All] [Mia] [Leo] [Topup]│
│ ┌─────────────────────────────────────────────────────────┐    │
│ │  Today                                                  │    │
│ │  -3 ⭐  Mia · Image gen "cat in space"      2min ago   │    │
│ │  -1 ⭐  Mia · TTS "Once upon a time..."      8min ago  │    │
│ │  -2 ⭐  Mia · Image gen "happy cat"          12min ago │    │
│ │                                                         │    │
│ │  Yesterday                                              │    │
│ │  +30 ⭐ Top up: Family Pack A$30           4:23pm      │    │
│ │  -2 ⭐  Leo · Code gen                      11:14am    │    │
│ │  -1 ⭐  Leo · Code review                    11:09am    │    │
│ │                                                         │    │
│ │  [Load more ↓]                                          │    │
│ └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Topup flow (`/portal/wallet/topup`)**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Top up Stars                                                    │
│                                                                 │
│ Pick a Stars Pack:                                              │
│                                                                 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐ │
│ │ Starter      │ │ Family       │ │ Mega         │ │ School  │ │
│ │ A$10         │ │ A$30 ⭐      │ │ A$50         │ │ A$100   │ │
│ │ 10 Stars     │ │ 30+ bonus 5  │ │ 50+ bonus 15 │ │ ...     │ │
│ │              │ │ BEST VALUE   │ │              │ │         │ │
│ │ [Buy]        │ │ [Buy]        │ │ [Buy]        │ │ [Buy]   │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘ │
│                                                                 │
│ Payment by Airwallex (cards accepted: Visa, Mastercard, Amex). │
│ Stars never expire. Refunds within 14 days, contact us.         │
└─────────────────────────────────────────────────────────────────┘
```

Buy click → `POST /families/:id/wallet/topup` → backend creates Airwallex PaymentIntent → redirect to Airwallex hosted checkout → Airwallex webhook → backend credits Stars → parent sees update in real-time (WS `wallet.update` event) → redirected back to `/portal/wallet?topup=success`.

#### 4.4.1 Auto-Topup (`/portal/wallet/auto-topup`)

> **Decision (D-WAL-01, 2026-05-25)**: Auto-topup is the **headline parent feature** of the wallet — kids should never have a session interrupted because "the wallet ran out at 9 pm on a school night". V0 ships **opt-in** auto-topup. Off by default.

**UI**:

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Wallet                                                        │
│                                                                 │
│ Auto-topup                                                      │
│ ─────────────────────────────────────────────────────────────── │
│ Keep your kids' Stars topped up automatically so they're never  │
│ interrupted mid-mission.                                        │
│                                                                 │
│ Auto-topup:        [● ON]   [○ OFF]                             │
│                                                                 │
│ When balance falls below:                                       │
│   [10 ⭐ ▼]   (options: 5 / 10 / 20 / 50)                       │
│                                                                 │
│ Top up by:                                                      │
│   ( ) Starter A$10 (100⭐)                                       │
│   (•) Family  A$30 (350⭐)   ← BEST VALUE                       │
│   ( ) Mega    A$50 (650⭐)                                       │
│                                                                 │
│ Payment method:                                                 │
│   ● Visa ••4242  exp 12/27   [Change] [Remove]                 │
│   [+ Add another card]                                          │
│                                                                 │
│ ── Safety limits ──                                             │
│ Max auto-topup per day:    [A$30 ▼]  (max A$100/day)            │
│ Max auto-topup per month:  [A$200 ▼] (max A$500/month)          │
│ Email me each time:        [✓] Yes                              │
│ Pause auto-topup after:    [3] consecutive failed charges       │
│                                                                 │
│ [Save changes]    [Run a test topup now (A$1, refunded)]        │
│                                                                 │
│ ── Recent auto-topups ──                                        │
│ ✓ 2026-05-24 21:14   A$30 → 350⭐   Visa ••4242                │
│ ✓ 2026-05-20 18:02   A$30 → 350⭐   Visa ••4242                │
│ ✕ 2026-05-15 11:03   A$30   FAILED (insufficient_funds)         │
│   └─ retried 2026-05-15 13:03 ✓                                 │
│ [See all →]                                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Decision rules** (enforced server-side, not client-side):

| Rule | V0 default | Configurable range | Why |
|---|---|---|---|
| Trigger threshold | 10⭐ | 5 / 10 / 20 / 50 | Below 5⭐ a single image gen can't complete; below 50⭐ avoids unnecessary triggers |
| Topup SKU | Family A$30 | any published SKU | Parent picks comfort level |
| **Daily auto-topup cap** | **A$30/day** | **A$10 – A$100/day** | **Hard cap on automated charges per 24h.** Caps damage if device/cookie stolen or kid finds a way to spam triggers. Resets at parent local 04:00 (same job as wallet `daily_used` reset). |
| **Monthly auto-topup cap** | **A$200/month** | **A$50 – A$500/month** | Belt-and-braces. Resets on calendar month boundary in parent local TZ. |
| Notification | email on every charge | on/off (email only — push is opt-in via §4.8) | Audit trail; parent can spot anomalies fast |
| Failure backoff | 3 consecutive fails → pause + email | 1–5 | Avoids hammering a declined card and racking up bank fees |
| Cooldown between auto-topups | 15 min | not configurable V0 | Stops a thrashing trigger from firing 20x in an hour |

**Auto-topup flow (system, not UI)**:

```
[Stars debit completes] → wallet.balance_after < auto_topup_threshold?
   │ no  → done
   │ yes ↓
[Check auto_topup_enabled && payment_method.status='active']
   │ no  → emit wallet.low_balance event (push notification only); done
   │ yes ↓
[Check daily_auto_topup_used + sku_amount <= daily_auto_topup_cap]
[Check monthly_auto_topup_used + sku_amount <= monthly_auto_topup_cap]
[Check now - last_auto_topup_at >= cooldown_minutes]
[Check consecutive_failures < failure_threshold]
   │ any fail → emit wallet.auto_topup_skipped(reason); done
   │ all pass ↓
[POST to Airwallex /payment_intents/confirm with saved payment_method_id]
   │ async webhook → succeeded → credit Stars (same WalletTransaction path as
   │                              manual topup, type='topup_auto'), increment
   │                              daily_auto_topup_used, reset failure counter,
   │                              WS wallet.update + wallet.auto_topup_succeeded,
   │                              email parent
   │ async webhook → failed     → increment consecutive_failures; if ≥
   │                              failure_threshold → set auto_topup_enabled=false,
   │                              email parent "auto-topup paused"
```

**Concurrency rule**: the threshold check + the daily-cap check happen in a single SQL `UPDATE … WHERE … RETURNING` against the wallet row (same atomic pattern as `daily_used` enforcement in [kids-ai-platform-prd.md §9.7](./kids-ai-platform-prd.md#97-跨产品扣减的并发与一致性工程硬约束)). The Airwallex confirm call only happens after the wallet row has reserved the daily-cap slot — so two concurrent debits cannot both fire an auto-topup that breaches the cap.

**Idempotency rule**: every auto-topup attempt is keyed by `wallet_id + minute-bucket(now)` (or an explicit idempotency key passed to Airwallex). Retries from a NestJS job runner never produce duplicate charges.

**Manual override**: parent can hit `[Pause auto-topup]` anywhere on `/portal/wallet`. State is `auto_topup_enabled=false`; reversible with one click. Pausing the family (`POST /wallet/pause`) implicitly disables auto-topup until family is resumed.

#### 4.4.2 Topup limits & anti-fraud

**Applies to both manual and automated topup**. Enforced at `POST /wallet/topup` and at the auto-topup decision step.

| Limit | Default | Override | Why |
|---|---|---|---|
| Single topup max | A$100 | School Pack only; A$200 with email verification | One stolen-card incident cap |
| **Manual topups per day** | **10 per day** | Not user-configurable | Anti-card-testing |
| **Manual topups per hour** | **3 per hour** | Not user-configurable | Anti-card-testing |
| **Total topup (manual + auto) per day** | **A$200/day** | A$500/day after verified phone | **Hard ceiling regardless of auto-topup settings** — prevents a compromised account from running up unlimited charges |
| **Total topup (manual + auto) per month** | **A$1,000/month** | A$3,000/month after verified phone | Same |
| New payment method 24h hold | A$50 cap on auto-topup in first 24h | Off after 24h | Card-testing window |

When a limit is hit, parent sees:

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  Daily topup limit reached                                    │
│                                                                 │
│ You've topped up A$200 today, which is the daily safety limit. │
│ This protects your card if your account is ever accessed by     │
│ someone else.                                                   │
│                                                                 │
│ Limit resets at midnight (your local time).                    │
│                                                                 │
│ Need a higher limit? [Verify your phone →]                     │
│                                                                 │
│ [OK]                                                            │
└─────────────────────────────────────────────────────────────────┘
```

Backend returns `429 TOO_MANY_REQUESTS` with `{ code: 'TOPUP_DAILY_LIMIT', resets_at, current_aud_cents, limit_aud_cents }`.

**Audit**: every topup attempt — success, failure, or rejected-by-limit — writes a row to `WalletTransaction` (success/refund) or to `audit_events` (rejection). Visible in `/portal/audit`.

**Refund interaction**: refunds (whether parent-requested via Settings → Billing, or admin-issued) reduce the day/month topup counters proportionally so the parent isn't blocked from legitimate topups after a refund.

### 4.5 `/portal/approvals` — Approval Queue ⭐

```
┌─────────────────────────────────────────────────────────────────┐
│ Approvals                              3 pending  · 7 today     │
│                                                                 │
│ ── Pending (3) ── needs your attention ───                      │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ 🧒 Mia · 10 extra Stars                  ⏱ 4min ago     │    │
│ │ ─────────────────────────────────────────                │    │
│ │ "I want to make a longer story please!"                  │    │
│ │                                                          │    │
│ │ Today's spend: 14/20 ⭐                                   │    │
│ │ Mia's reason: She's working on "My Cat Story"            │    │
│ │ ⓘ Granting allows up to 10 extra Stars today only        │    │
│ │                                                          │    │
│ │ [Note for Mia (optional)]                                │    │
│ │ [────────────────────────]                               │    │
│ │                                                          │    │
│ │ [✓ Grant]  [✕ Deny]                                      │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ 🧑 Leo · Make project "Pet Game" public                  │    │
│ │ Teacher (Sarah) already approved 2h ago                  │    │
│ │ [View project] [Grant] [Deny]                            │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ 🧒 Mia · Relax "violence" topic limit                    │    │
│ │ Reason: "I want to make a comic with sword fights"       │    │
│ │ ⓘ This loosens Mia's content limits permanently          │    │
│ │ [Grant] [Deny]                                           │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ── Recently resolved (7) ──                                     │
│ ✓ Apr 14 — Mia · +5 extra Stars (granted)                       │
│ ✕ Apr 13 — Leo · Romance topic relax (denied)                   │
│ ...                                                             │
└─────────────────────────────────────────────────────────────────┘
```

**UX rules**:
- Pending count badge in nav drawer
- Approvals show timeline (kid request time, parent decision time)
- Topic-limit changes show ⓘ warning ("permanently affects content")
- Approve/deny is one-click; optional note auto-saves
- Push notification (browser + email) for new approval when family.push_notifications_enabled
- Auto-expire pending approvals after 24 hours (configurable)

### 4.6 `/portal/audit` — Activity / Audit Replay

```
┌─────────────────────────────────────────────────────────────────┐
│ Activity                                                        │
│                                                                 │
│ Filter:                                                         │
│ Who:  [All kids ▼]   What: [All events ▼]   When: [Last 7d ▼] │
│                                                                 │
│ ── Today ───────────────────────────────────────                │
│                                                                 │
│ ┌─ 14:32  🧒 Mia · session in AI Creative Lab ──────────┐      │
│ │ Mission: "Make your AI pet"                            │      │
│ │                                                        │      │
│ │  14:32 🧒 Asked: "Can you draw my cat doing magic?"   │      │
│ │  14:32 🤖 Generated image  (-2⭐, cat-magic.png)       │      │
│ │  14:33 🧒 Asked: "Make her wear a wizard hat"         │      │
│ │  14:33 🤖 Generated image  (-2⭐, cat-magic-v2.png)    │      │
│ │  14:34 🤖 Suggested: "Want me to add stars sparkle?"  │      │
│ │  14:34 🧒 Approved                                     │      │
│ │  14:34 🤖 Generated image  (-2⭐, cat-magic-v3.png)    │      │
│ │  14:35 🧒 Saved to project "My Cat Story"             │      │
│ │                                                        │      │
│ │ [View full transcript →]  [Open project →]            │      │
│ └────────────────────────────────────────────────────────┘      │
│                                                                 │
│ ┌─ 13:18  🧑 Leo · joined class "AI Coding Studio T1" ─┐        │
│ │ Teacher: Sarah                                       │        │
│ └──────────────────────────────────────────────────────┘        │
│                                                                 │
│ ── Yesterday ───────────────────────────────────────            │
│ ...                                                             │
└─────────────────────────────────────────────────────────────────┘
```

**Key features**:
- Events grouped into "sessions" (continuous activity, no >5min gap)
- Filterable by kid / event type / date
- Each session can be expanded to full transcript
- Click into project → `/portal/audit/project/:id` shows project-scoped replay including every file diff agent made
- Live-tail mode: pinned to top, new events appear in real-time (WS `audit.event`)
- Export: per-month CSV / PDF (compliance & teacher meetings)

### 4.7 `/portal/audit/project/:id` — Project-scoped replay

> The Kids OpenCode-specific deep dive. Renders every agent turn + every file change.

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back to Activity                                              │
│                                                                 │
│ 🧑 Leo's project: "Pet Hamster Game"                            │
│ Started Apr 12 · 4 sessions · 8⭐ spent · in_progress           │
│                                                                 │
│ ── Session 4 · Apr 14, 16:22 (15min) ───── [▶ Play] [Pause]   │
│                                                                 │
│ 🧑 Leo: "Add a leaderboard to the game"                         │
│                                                                 │
│   🤖 Plan: I'll create a leaderboard.js file and update         │
│      index.html to show top scores. Shall I start?              │
│   🧑 Leo: Yes                                                   │
│   🤖 Wrote leaderboard.js (43 lines)  [diff]                    │
│      ```js                                                      │
│      function getTopScores() {                                  │
│        return localStorage.getItem('scores')...                 │
│      ```                                                        │
│   🤖 Edited index.html  [diff] +6 -2 lines                      │
│   🧑 Leo: "What if the score doesn't save?"                     │
│   🤖 Plan: Add fallback to in-memory storage. Shall I?         │
│   🧑 Leo: Yes                                                   │
│   🤖 Edited leaderboard.js  [diff] +8 -1 lines                  │
│                                                                 │
│ ── Files at end of session ──                                   │
│ • index.html (modified)                                         │
│ • style.css                                                     │
│ • game.js                                                       │
│ • leaderboard.js (NEW)                                          │
│ • hamster.png                                                   │
│                                                                 │
│ [📥 Download full session log]  [▶ Watch screen recording]      │
└─────────────────────────────────────────────────────────────────┘
```

Diff click expands inline diff view (red/green standard).

### 4.8 `/portal/settings` — Privacy, Notifications, Account

Tabbed:

```
[Profile] [Notifications] [Privacy & Data] [Billing] [Danger Zone]
```

**Profile**: name, email, locale, time zone, photo.

**Notifications**: 
- Push (browser): on / off
- Email digests: daily / weekly / off
- Per-event opt-in/out: new approval / over cap / weekly summary / mission completed

**Privacy & Data**:
- View privacy policy (link to /privacy)
- Re-render parental consent (link to /parental-consent)
- "Download my family data" → triggers backend job → email with S3 zip link (24h expiry)
- Region info (data residency)

**Billing**: receipts, invoices, payment methods saved.

**Danger Zone**:
- "Log out everywhere" (revokes all refresh tokens)
- "Delete my account" → 30-day grace period, can undo via /portal/login during grace, hard-delete after

### 4.9 `/portal/usage` — AI Usage Analytics ⭐

> **Decision (D-USE-01, 2026-05-25)**: Parents must be able to see *what* the AI did for their kid, not just *what it cost*. Audit feed (§4.6) answers "what happened"; this page answers "how much, on what, and is it growing". Required for parent trust + informed consent renewal.

**Family overview** (`/portal/usage`):

```
┌─────────────────────────────────────────────────────────────────┐
│ AI Usage                            Range: [Last 7 days ▼]      │
│                                                                 │
│ ┌─ This week ─────────────────────────────────────────────┐    │
│ │  142 ⭐ spent          8,420 tokens         34 sessions   │    │
│ │  -3% vs last week     -8% vs last week     +12%          │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ── By kid ──                                                    │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ 🧒 Mia (10) · AI Creative Lab                            │    │
│ │   84 ⭐  ·  4,820 tokens  ·  22 sessions  ·  3h 14m     │    │
│ │   ████████████░░░░░░░  (59% of family weekly)            │    │
│ │   Top use: image gen (62%), TTS (18%), tutor chat (20%) │    │
│ │   [Open Mia's usage →]                                   │    │
│ └─────────────────────────────────────────────────────────┘    │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ 🧑 Leo (13) · Kids OpenCode                              │    │
│ │   58 ⭐  ·  3,600 tokens  ·  12 sessions  ·  2h 02m     │    │
│ │   ███████░░░░░░░░░░░░  (41% of family weekly)            │    │
│ │   Top use: code gen (78%), code review (22%)             │    │
│ │   [Open Leo's usage →]                                   │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ── Trend (last 28 days) ──                                      │
│ Stars/day                                                       │
│  30 ┤                                ▆                          │
│  20 ┤              ▆     ▆     ▆▆   ▆▇   ▆                    │
│  10 ┤  ▂  ▃▄  ▄▅▆▇▆▇  ▇█▇▆▇▇█  ▇▇  ▇▇▇  ▇▇                  │
│   0 └──────────────────────────────────────────                │
│      Apr 28                                  May 25             │
│                                                                 │
│ [📥 Export CSV (7d)]   [📅 Custom range]                        │
└─────────────────────────────────────────────────────────────────┘
```

**Single-kid drill-down** (`/portal/usage/:kidId`):

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Usage                                                         │
│                                                                 │
│ 🧒 Mia's AI usage              Range: [Last 7 days ▼]           │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ ── Summary ──                                                   │
│ Stars spent:        84⭐         (avg 12⭐/day)                  │
│ Tokens in/out:      1,820 / 3,000                               │
│ Sessions:           22           (avg 3.1/day)                  │
│ Active time:        3h 14m       (avg 28 min/day)               │
│ Approvals asked:    2 (1 granted, 1 denied)                    │
│                                                                 │
│ ── By task type ──                                              │
│ Image generation    52⭐  ████████████░░  62%   18 images       │
│ Text-to-speech      15⭐  ███░░░░░░░░░░  18%   12 clips         │
│ AI tutor chat       17⭐  ███░░░░░░░░░░  20%   46 turns         │
│                                                                 │
│ ── By model (via DeepRouter) ──                                 │
│ image/sdxl-lite          18 calls  ·  36⭐  ·  0 flags          │
│ image/sdxl-hd             3 calls  ·  16⭐  ·  0 flags          │
│ tts/standard-en          12 calls  ·  15⭐  ·  0 flags          │
│ tutor/claude-haiku-kid   46 turns  ·  17⭐  ·  0 flags          │
│                                                                 │
│ ── Daily trend ──                                               │
│ [bar chart, 7 days, Stars stacked by task type]                 │
│                                                                 │
│ ── Top projects this week ──                                    │
│ • "My Cat Story"          34⭐ · 12 images · 4 sessions         │
│ • "Birthday card"          8⭐ ·  3 images · 1 session          │
│ • Free play (no project)  42⭐ ·  3 images · 17 sessions        │
│                                                                 │
│ [📥 Export Mia's usage CSV]   [View Mia's audit feed →]         │
└─────────────────────────────────────────────────────────────────┘
```

**Data sources**: All numbers come from `usage_daily` aggregate rollups (one row per kid per day; see [platform-backend-api-spec.md §4.2 Wallet & Payments](./platform-backend-api-spec.md#42-wallet--payments-stars)). Real-time `wallet.update` WS events refresh the current-day row only; historical days are read-through from the aggregate.

**Privacy rules**:
- Parent only sees their own family's kids. Enforced at API by `family_id` scoping.
- **No prompt text or response text on this page** — that's the audit feed's job (§4.6). Usage page is metrics-only to avoid normalising surveillance.
- Token counts are exposed because they're cost-relevant; prompts are not.
- Flagged-content count is shown ("0 flags") so parents can see if anything tripped moderation; details require clicking through to audit feed.

**Ranges**: 24h / 7d / 28d / custom (max 365 days). Older than 365 days is in cold storage; export-only.

**Export**: `GET /kids/:id/usage/export.csv?from=&to=` returns one row per session with: timestamp, task_type, model, tokens_in, tokens_out, stars_spent, project_id, flagged (bool). Parent can use this for tax (if homeschool), school accountability, or just personal records.

**Performance target**: page p50 < 400ms server-side at 4× current cohort size. Aggregates pre-computed nightly + incrementally updated by `/llm/*` proxy.

**Empty state** (new family, no usage yet):
```
"Your kids haven't used any AI yet — once they start a session,
 you'll see what they're working on here."
[Browse Course Packs →]
```

---

## 5. Cross-cutting Concerns

### 5.1 State Management

**Approach**: TanStack Query (React Query v5) for server state + lightweight `useState`/`useReducer` for UI state. **No Redux, no Zustand** — Query handles caching, refetching, optimistic updates natively.

Key queries:
```typescript
useFamily()                       // GET /auth/me + /families/:id
useKid(kidId)
useWallet(familyId)
useTransactions(familyId, filters)
useApprovals(familyId, status='pending')
useAuditFeed(familyId, filters)
useProjects(kidId)
```

Mutations:
```typescript
useUpdateKid(kidId)
useTopupStars(familyId)
useApproveRequest(approvalId)
useDenyRequest(approvalId)
useUpdateCaps(familyId)
usePauseFamily(familyId)
```

### 5.2 WebSocket integration

Single connection on portal mount (after auth). Auto-joins family room. Updates trigger Query cache invalidation:

```typescript
useEffect(() => {
  ws.on('audit.event', (event) => {
    queryClient.invalidateQueries(['audit', familyId])
    queryClient.invalidateQueries(['dashboard', familyId])
  })
  ws.on('wallet.update', (delta) => {
    queryClient.setQueryData(['wallet', familyId], (old) => ({
      ...old,
      stars_balance: delta.balance,
      daily_used: delta.daily_used,
    }))
  })
  ws.on('approval.new', () => {
    queryClient.invalidateQueries(['approvals', familyId])
    showToast('New approval needed')
  })
})
```

### 5.3 Empty states

Each page has a designed empty state (no kids, no transactions, no approvals, no audit). Empty states must:
- Explain what this page is for
- Show the next action
- Use the design system tone (encouraging, not blame-y)

### 5.4 Error states

- 401 → silently refresh; if refresh fails → redirect to `/portal/login` preserving `?returnTo=`
- 402 WALLET_INSUFFICIENT → toast + "Top up Stars" deeplink
- 423 FAMILY_PAUSED → banner + "Resume family" CTA
- 500 → fall back to last cached state + toast + retry button
- WS disconnect → reconnect with exponential backoff up to 1min

### 5.5 Loading states

- Skeleton screens (use Tailwind `animate-pulse`) for all initial data loads
- Optimistic updates for: kid caps changes, approval decisions, pause/resume — rollback on error
- "Loading…" spinners only for explicit user actions (form submit, top-up redirect)

### 5.6 Accessibility

- All interactive elements keyboard-navigable
- ARIA labels on stat tiles
- Focus rings visible
- Color contrast ≥ 4.5:1 (DESIGN.md compliant)
- Approval queue and audit replay are critical, screen-reader-friendly

---

## 6. Mobile

- All pages responsive down to 360px
- Bottom tab nav on mobile (Dashboard / Family / Wallet / Approvals / Audit)
- Approve / deny on approvals page = full-width buttons (thumb reach)
- Tables horizontally scrollable on mobile

---

## 7. Design System Touch Points

- Colors: DESIGN.md 5-color palette
- Pilot snapshot section: NOT used (removed per "from zero" decision)
- Stat tiles: reuse `stat-tile` class
- Cards: reuse `card-base` class
- Eyebrows: `eyebrow eyebrow-{tone}`
- Sticky badges: `sticker-{tone}`
- Forms: TailwindCSS forms plugin + custom focus ring `focus:border-brand-coral`

---

## 8. Out of Scope (V0)

- ❌ Multiple parent users per family (V1+)
- ❌ Co-parent permissions (V1+)
- ❌ Native mobile app (V1+; PWA works for V0)
- ❌ In-portal kid chat with parent (V1+)
- ❌ Push notifications via SMS (V1; email + browser push only V0)
- ❌ Parent-to-parent referrals (V1+)
- ❌ Family-to-family playdates / cross-family classroom invites (V2+)

---

## 9. Open Questions

| # | Q | Impact |
|---|---|---|
| Q1 | Approval auto-expiry — 24h or longer? Risk: kid gets blocked, parent forgets to act. | Affects ApprovalRequest.expires_at default |
| Q2 | Kid login PIN — 4 digits or 6? Short = easier for 8-year-olds; long = more secure. | UX impact on registration step 4 |
| Q3 | Print "kid login card" — physical paper? PDF download? both? | Affects /portal/family/:kidId UI |
| Q4 | Audit retention — keep events forever, or auto-purge after N days? | Storage cost vs compliance / "right to be forgotten" |
| Q5 | Cap warnings — at 80% notify, or only at 100%? | Annoyance vs informedness |
| Q6 | Topic limit changes — require fresh parental consent (re-render and click)? Or just save? | Compliance question |
| Q7 | Default Stars caps — 20⭐/day per kid is generous; should we be more conservative for trust? | Affects unit economics |

---

## 10. Implementation Notes

### Scaffold commands

```bash
cd ~/Documents/sites/kidsinai/airbotix-app
npm create vite@latest . -- --template react-ts
npm i @tanstack/react-query react-router-dom react-hook-form zod
# Use @tanstack/react-query-devtools in dev
```

### Folder layout

```
src/
├── auth/                  # OTP form, JWT handling
├── portal/
│   ├── Dashboard.tsx
│   ├── Family.tsx
│   ├── Kid.tsx
│   ├── Wallet.tsx
│   ├── Topup.tsx
│   ├── Approvals.tsx
│   ├── Audit.tsx
│   ├── AuditProject.tsx
│   ├── Settings.tsx
│   └── Billing.tsx
├── learn/                 # /learn/* — see airbotix-app-learn-prd.md
├── components/
│   ├── PortalLayout.tsx   # nav drawer + header
│   ├── KidCard.tsx
│   ├── StatTile.tsx
│   ├── ApprovalCard.tsx
│   ├── AuditEntry.tsx
│   └── TopupPackCard.tsx
├── hooks/
│   ├── useApi.ts
│   ├── useWebSocket.ts
│   └── useToast.ts
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── ws.ts
└── App.tsx
```

### Auth handling

JWT in HttpOnly cookie (refresh) + memory only (access). Access token attached to fetch requests via `lib/api.ts` interceptor. Silent refresh on 401.

---

## 11. References

- `platform-backend-api-spec.md` — every endpoint used here defined there
- `airbotix-app-learn-prd.md` — sibling kid surface (shares same SPA + auth)
- `marketing-site-refresh-prd.md` §4.6.3 — 5 trust mechanisms operationalised here
- `docs/legal/privacy-policy.md` — data export endpoint, deletion flow
- `docs/legal/parental-consent.md` — consent capture text (registration step 5)
