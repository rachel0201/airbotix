# Auth System — JWT + Refresh Token + Email OTP — PRD

> **Status**: Draft v0.1 · 2026-05-15
> **Lives in**: `Airbotix-AI/platform-backend` (`src/auth/` module)
> **Consumers**: `airbotix-app` (`/portal/*` parent + `/learn/*` kid), `teacher-console`, `kids-opencode` (service-to-service)
> **Author**: Airbotix engineering
> **Supersedes**: `_archived/teacher-auth-system-prd.md` (Supabase-based, removed 2026-05-14)
> **Depends on**: `platform-backend-api-spec.md` §3 (extracted + expanded here), `parent-portal-prd.md` §3, `teacher-console-prd.md` §3

---

## 1. Purpose

This PRD specifies **everything about how identity works** on the Airbotix platform: who can log in, by what method, what tokens get issued, how they're rotated/revoked, what happens when something goes wrong, and what threats the design is built to resist.

It is the **single source of truth for auth**. Every other PRD that mentions "login" or "OTP" defers to this document.

### 1.1 Why this exists as a standalone PRD

Auth touches 4 frontends, 1 backend, 2 third-party services (SendGrid, Airwallex webhook signing), and ~40% of API endpoints. Keeping the rules in one place prevents drift between Parent Portal, Teacher Console, and the Kid login surface (`/learn/*`).

The old `_archived/teacher-auth-system-prd.md` was Supabase-based and is fully obsolete after the 2026-05-14 Supabase removal.

### 1.2 Hard rules (non-negotiable)

- ❌ **No Supabase Auth** — fully removed; self-built JWT + OTP + Refresh
- ❌ **No social SSO in V0** (Google, Apple, etc.) — V1+ if a B2B school requires
- ❌ **No password-based login for parent/teacher/admin** — OTP only (passwordless)
- ❌ **No third-party auth provider (Auth0, Clerk, Supabase, Cognito)** — keep auth in-house for AU data sovereignty + cost
- ✅ **All adult login flows use email OTP** (parent / teacher / admin / super_admin)
- ✅ **All kid login flows are parent-provisioned** — kids never enter an email or receive OTP codes
- ✅ **All tokens are JWT with rotating refresh** — no opaque session tokens

---

## 2. Identity model

### 2.1 User types

| Type | Logged-in entity | Login method | Auth surface |
|---|---|---|---|
| Parent | `User` row, role=parent | Email OTP | `app.airbotix.ai/portal/login` |
| Teacher | `User` row, role=teacher | Email OTP (admin-provisioned) | `teacher.airbotix.ai/login` |
| Admin | `User` row, role=admin | Email OTP (super-admin-provisioned) | `teacher.airbotix.ai/login` |
| Super-admin | `User` row, role=super_admin | Email OTP + **mandatory 2FA** (V0: TOTP) | `teacher.airbotix.ai/login` |
| Kid | `KidProfile` row (no User row) | Family code + nickname + 4-digit PIN, **or** one-shot class code | `app.airbotix.ai/learn/login` |
| Service | API token (long-lived, scoped) | Header `X-Service-Token: ...` | `kids-opencode`, DeepRouter callbacks, audit emits |

**Key design decision**: `parent`/`teacher`/`admin`/`super_admin` share the `User` table with a `role` enum. `kid` is a **separate** `KidProfile` table — kids are not Users, never have email, never get OTP, and never see the adult login flow. See platform-backend-api-spec.md §4.1 for full schema; Open Question Q6 there debates this split.

### 2.2 Why passwordless OTP for adults

- **No password DB** → no `password_breach` incident class possible
- **Email is already the recovery channel anyway** — collapsing login + recovery into one channel reduces UX surface
- **No "forgot password" flow needed** → simpler frontend, fewer support tickets
- **Compliance-friendly for AU minors context** — fewer auth surfaces for a parent to manage means more likely to actually use multi-kid management

Trade-off: harder to use without email access (corporate firewalls, offline workshops). Mitigations: longer access tokens (15 min, refreshable for 30 days) keep daily-use frictionless; teacher invitations include a one-shot signed link that bypasses OTP for first-login.

### 2.3 Why PIN-based for kids

- Kids 6-11 may not have an email; ones who do shouldn't be using it as a login (parental control intent)
- Family code + nickname + PIN is the same mental model as a school's "log in with your class code"
- PIN is set + reset by parent — kid can't lock themselves out of recovery without involving the parent
- One-shot class code login = airbotix-led workshop scenario where the kid may not yet have a Family Account; teacher hands out the class code on the day

---

## 3. Token model

### 3.1 Access token (JWT)

| Field | Value |
|---|---|
| Algorithm | `HS256` (V0); rotate to `EdDSA` (Ed25519) at V1 when key rotation infra is ready |
| TTL | **15 minutes** |
| Issuer (`iss`) | `airbotix.ai` |
| Audience (`aud`) | `api.airbotix.ai` |
| Subject (`sub`) | `User.id` for adult; `KidProfile.id` for kid |
| Custom claims | `role`, `family_id` (nullable for teacher/admin), `email` (adult only), `nickname` (kid only), `class_id?` (kid via class-code login) |
| Storage on client | **In-memory only** (JS variable in React state). Never `localStorage`, never `sessionStorage` |
| Transport | `Authorization: Bearer <jwt>` header on every API call |

```json
// Sample decoded payload — parent
{
  "iss": "airbotix.ai",
  "aud": "api.airbotix.ai",
  "sub": "usr_01HXYZ...",
  "role": "parent",
  "family_id": "fam_01ABCD...",
  "email": "lightman@example.com",
  "iat": 1746000000,
  "exp": 1746000900
}

// Sample decoded payload — kid (family-code login)
{
  "iss": "airbotix.ai",
  "aud": "api.airbotix.ai",
  "sub": "kid_01HXYZ...",
  "role": "kid",
  "family_id": "fam_01ABCD...",
  "nickname": "Mia",
  "iat": 1746000000,
  "exp": 1746000900
}

// Sample decoded payload — kid (one-shot class-code login)
{
  "iss": "airbotix.ai",
  "aud": "api.airbotix.ai",
  "sub": "kid_01HXYZ...",            // ephemeral / class-scoped
  "role": "kid",
  "family_id": null,                  // not yet linked
  "class_id": "cls_01ABCD...",
  "nickname": "Workshop guest 03",
  "iat": 1746000000,
  "exp": 1746000900,
  "scope": "class_session"            // restricts to /learn/* class-scoped endpoints
}
```

**Why in-memory storage**: XSS-resilient. The cost is that a full page reload requires a silent refresh via the HttpOnly refresh-token cookie (acceptable; happens once per tab-load).

### 3.2 Refresh token

| Field | Value |
|---|---|
| Format | Opaque, 256 bits, base64url (NOT a JWT — keep it short and irrelevant outside our system) |
| TTL | **30 days** (adult); **24 hours** (kid family-code); **end of class session** (kid class-code, max 4 hours) |
| Storage on server | SHA-256 hash only in `RefreshToken` table (never plaintext) |
| Storage on client | **HttpOnly + Secure + SameSite=Strict cookie**, path-scoped to `/auth/*` |
| Rotation | **Rotates on every refresh** — old refresh marked `revoked_at`, new one returned; chain-of-custody recorded |
| Theft detection | If a `revoked_at` refresh token is re-used → **revoke all refresh tokens for that user** + email alert ("we detected a session anomaly, please log in again") |
| Bound metadata | `ip`, `user_agent`, `created_at`, `expires_at`, `revoked_at` |

Cookie attributes:

```
Set-Cookie: airbotix_refresh=<opaque>;
            HttpOnly;
            Secure;
            SameSite=Strict;
            Path=/auth;
            Max-Age=2592000;        # 30 days for adult
            Domain=.airbotix.ai     # so app.airbotix.ai + teacher.airbotix.ai both work
```

**Cross-subdomain refresh**: cookie is set on `.airbotix.ai` so parent at `app.airbotix.ai` and teacher at `teacher.airbotix.ai` both work. Refresh endpoint always lives at `https://api.airbotix.ai/auth/refresh` — same domain on the cookie path = no CORS complications for the refresh itself.

### 3.3 Why 15 min access + 30 day refresh

- 15 min access keeps stolen-JWT blast radius small (no live revocation needed — wait it out)
- 30 day refresh = normal users almost never re-log-in (UX)
- Refresh rotation = stolen refresh has at most 15 min before legitimate user's next refresh nukes the attacker's session
- Re-use detection = any leaked refresh + use after rotation triggers full session purge (defense in depth)

### 3.4 Service tokens (S2S)

Not user-bound. Used by `kids-opencode` desktop, `DeepRouter` callbacks, internal cron jobs.

| Field | Value |
|---|---|
| Format | Random 256 bits, prefix `air_svc_` for human grep-ability |
| Storage | SHA-256 in `ServiceToken` table; plaintext only shown once at creation |
| TTL | **Long-lived** (default 1 year), explicit revoke |
| Scope | Per-token scope list (e.g. `audit:write`, `wallet:read`) |
| Transport | `X-Service-Token: air_svc_xxx` header |
| Rate limit | 1000 req/min per token (configurable per service) |
| Audit | Every service call logged with `actor=service`, `token_id` in metadata |

Service tokens are **out of scope of OTP flow** — admin-only creation via `/admin/system/service-tokens` (super-admin only — see teacher-console-prd.md §4.16).

```prisma
model ServiceToken {
  id          String   @id @default(cuid())
  name        String                                     // 'kids-opencode-prod', 'deeprouter-callback'
  token_hash  String   @unique
  scopes      String[]                                   // ['audit:write', 'wallet:read']
  created_by  String                                     // super_admin user_id
  created_at  DateTime @default(now())
  expires_at  DateTime
  revoked_at  DateTime?
  last_used_at DateTime?

  @@index([expires_at])
}
```

---

## 4. OTP flow

### 4.1 Request OTP

```
POST /auth/request-otp
Content-Type: application/json

{
  "email": "lightman@example.com",
  "role_hint": "parent"        // optional, helps routing; not authoritative
}

→ 204 No Content    (always — prevents email enumeration)
```

**Server behavior**:

1. Validate email format (RFC 5322 minimal subset)
2. Rate limit check: max 5 requests per email per hour, 10 per IP per hour
3. **Always** respond 204 — never reveal whether email exists. Skipping send is silent.
4. If email matches a User row:
   - Generate 6-digit code (cryptographically random, leading-zero preserved)
   - Insert `OtpAttempt` row: `email`, `code_hash = SHA256(code + salt)`, `expires_at = now + 10min`, `attempts = 0`
   - Send via SendGrid (template ID per role — parent vs teacher friendlier copy)
5. If email does **not** match:
   - Insert `OtpAttempt` row with `user_id = null` (so abuse tracking still works)
   - **Do not** send any email (don't tip off the enumerator)
   - Optional: insert a fake "ghost" record so timing matches

**SendGrid email template**:

```
Subject: Your Airbotix sign-in code: 481923

Hi,

Your sign-in code for Airbotix is:

   481923

This code expires in 10 minutes.

If you didn't request this code, you can ignore this email.

— Airbotix
airbotix.ai
```

No magic-link variant in V0 — codes only. Magic links create their own security surface (link previews in email clients can "click" them, prefetched links by some MTAs); we may add as a parallel V1+ option.

### 4.2 Verify OTP

```
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "lightman@example.com",
  "code": "481923"
}

→ 200 OK
   Set-Cookie: airbotix_refresh=...; HttpOnly; ...
   {
     "access_token": "eyJhbG...",
     "expires_in": 900,
     "user": {
       "id": "usr_xxx",
       "email": "lightman@example.com",
       "display_name": "Lightman",
       "role": "parent",
       "family_id": "fam_yyy",
       "is_new_user": false
     }
   }

→ 400 INVALID_OTP                  if code wrong / expired
→ 429 RATE_LIMITED                 if attempts > 5
→ 423 LOCKED                        if account locked (5+ failures across 1h window)
```

**Server behavior**:

1. Look up the most-recent unconsumed `OtpAttempt` row for that email
2. If none → return 400 INVALID_OTP (don't distinguish missing vs wrong)
3. If `attempts >= 5` → return 429 (lock at OTP row level; expires with the row)
4. Increment `attempts`
5. Compare `SHA256(code + salt) === code_hash` (constant-time comparison)
6. If mismatch → return 400 INVALID_OTP
7. If `expires_at < now` → return 400 INVALID_OTP
8. **Success**:
   - Mark `consumed_at = now`
   - If User exists: load it
   - If User doesn't exist AND role_hint=parent: create User row with `role=parent`, `is_new_user=true` → frontend triggers `/portal/register` family setup wizard (see parent-portal-prd.md §3.1)
   - If User doesn't exist AND role_hint=teacher or admin: **reject** (teachers / admins are admin-invited, no self-signup) → return 403 NOT_INVITED
   - Generate access token (15 min) + refresh token (rotated)
   - Update User.last_login_at
   - Return tokens + user

**Brute force protection**:
- Per-OTP-row: 5 attempts max
- Per-email: 5 OTP requests/hr (so attacker can't refresh codes endlessly)
- Per-IP: 10 OTP requests/hr (catches scripted distributed attempts)
- 6-digit space = 1M codes; with 5 attempts per row and rate limit, expected break time >> code TTL

### 4.3 Refresh access token

```
POST /auth/refresh
Cookie: airbotix_refresh=opaque_token_xxx

→ 200 OK
   Set-Cookie: airbotix_refresh=NEW_opaque_xxx; HttpOnly; ...    # rotated
   {
     "access_token": "eyJhbG...",
     "expires_in": 900
   }

→ 401 INVALID_REFRESH      if expired, revoked, or missing
→ 401 REFRESH_REUSE        if a previously-rotated token was re-presented (security incident)
```

**Server behavior**:

1. Read `airbotix_refresh` cookie
2. SHA-256 hash → look up `RefreshToken` row
3. **If not found** → 401 INVALID_REFRESH
4. **If `revoked_at IS NOT NULL`** → **SECURITY INCIDENT**:
   - This token was already rotated; legitimate user wouldn't re-present it
   - Revoke **all** refresh tokens for this user (`UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = X AND revoked_at IS NULL`)
   - Emit AuditEvent with `event_type=auth.refresh_reuse_detected`
   - Send email to user ("we detected unusual activity; please log in again")
   - Return 401 REFRESH_REUSE
5. **If `expires_at < now`** → 401 INVALID_REFRESH (don't auto-rotate expired)
6. **Otherwise (happy path)**:
   - Mark old row `revoked_at = now`
   - Generate new opaque token + insert new row, link to same user
   - Generate new access token
   - Return both (new cookie + access in body)

**Why rotate on every refresh**: limits the value of a stolen refresh to 15 min (one refresh cycle). The reuse-detection trip-wire turns the next legitimate refresh into a global session kill — attacker is locked out.

### 4.4 Logout

```
POST /auth/logout
Authorization: Bearer <jwt>
Cookie: airbotix_refresh=opaque_xxx

→ 204 No Content
   Set-Cookie: airbotix_refresh=; HttpOnly; Max-Age=0     # clear cookie
```

Marks the current refresh `revoked_at = now`. Access token continues to work until natural expiry (≤15 min) — we accept this trade-off rather than maintain a JWT blocklist.

### 4.5 Logout everywhere

```
POST /auth/logout-everywhere
Authorization: Bearer <jwt>

→ 204 No Content
   Set-Cookie: airbotix_refresh=; HttpOnly; Max-Age=0
```

Marks **all** refresh tokens for the user as revoked. Use cases:
- Lost laptop
- Password change at SSO upstream (V1+)
- User-initiated panic ("sign me out of every device")

UI surfaces: Parent Portal `/portal/settings`, Teacher Console `/profile`.

### 4.6 GET /auth/me

```
GET /auth/me
Authorization: Bearer <jwt>

→ 200 OK
{
  "user": { "id": ..., "email": ..., "role": "parent", "display_name": ... },
  "family": { "id": ..., "name": ... },                        // null for teacher/admin/super_admin
  "kid_profiles": [ { "id": ..., "nickname": ..., "age": ... } ],  // parent only
  "role": "parent",
  "permissions": ["family:read", "wallet:write", ...]          // derived from role
}
```

Used by every SPA on app boot to determine "who am I and what can I do".

---

## 5. Kid login flows

Kids never see email or OTP. Two paths:

### 5.1 Family-code + PIN login

The everyday case: parent has provisioned the kid, kid logs in on the family iPad or their own school Chromebook.

```
POST /auth/kid-login
Content-Type: application/json

{
  "family_code": "WANG",          // 4-12 char, parent-set, case-insensitive
  "nickname": "Mia",              // kid-set during onboarding, case-insensitive match
  "pin": "1234"                   // 4-digit
}

→ 200 OK
   Set-Cookie: airbotix_refresh=opaque_xxx; HttpOnly; Max-Age=86400  # 24h for kid
   {
     "access_token": "eyJhbG...",
     "expires_in": 900,
     "kid": {
       "id": "kid_xxx",
       "nickname": "Mia",
       "age": 10,
       "family_id": "fam_yyy"
     }
   }

→ 400 INVALID_CREDENTIALS
→ 429 RATE_LIMITED
→ 423 KID_PAUSED           if KidProfile.is_active=false or family.paused=true
```

**Server behavior**:

1. Rate limit: 10 attempts per family_code per 10 min
2. Look up Family by primary email / explicit family_code field (see Q1 below — schema currently has no explicit family_code, debate whether to use Family.id, a new `code` field, or derive from name)
3. Find KidProfile with `nickname ilike $nickname` in that family
4. `bcrypt.compare(pin, kid.pin_hash)`
5. If KidProfile.deleted_at OR is_active=false → 423
6. Generate access + refresh tokens (24-hour refresh for kids, shorter than adults)
7. Emit AuditEvent `auth.kid_login_success`

**Why bcrypt for PIN**: 4-digit PIN has only 10⁴ space, so we lean on slow-hash + rate limit. With 10 attempts / 10 min and bcrypt at cost factor 10, brute force across all PINs takes ~7 days in the worst case — well within parent's ability to notice (via audit feed) and reset PIN.

**Lockout**: 10 failed attempts → lock kid login for 1 hour, email parent "Mia's login failed too many times".

### 5.2 One-shot class-code login

Workshop scenario: kid shows up to an Airbotix in-school workshop, has never used the platform, no Family Account yet. Teacher shares a 6-char class code, kid types it in.

```
POST /auth/class-code-login
Content-Type: application/json

{
  "class_code": "WANG-T1",
  "display_nickname": "Workshop guest 03"   // optional, defaults to "Guest N"
}

→ 200 OK
   Set-Cookie: airbotix_refresh=opaque_xxx; HttpOnly; Max-Age=14400  # 4 hours max
   {
     "access_token": "eyJhbG...",
     "expires_in": 900,
     "kid": {
       "id": "kid_ephemeral_xxx",
       "nickname": "Workshop guest 03",
       "class_id": "cls_yyy",
       "is_ephemeral": true
     }
   }

→ 400 INVALID_CLASS_CODE
→ 410 CLASS_ENDED            if Class.ends_at < now or Class.is_active=false
→ 429 RATE_LIMITED
```

**Server behavior**:

1. Rate limit: 30 attempts per class_code per hour, 60 per IP per hour
2. Find Class by `class_code`
3. Check `is_active=true`, `starts_at - 2h <= now <= ends_at + 2h` (window)
4. Create ephemeral `KidProfile` row: `family_id=null`, `nickname=<input>`, `pin_hash=null`, `is_active=true`, `metadata.ephemeral=true`
5. Auto-enroll: insert `ClassEnrollment` with `family_id=null` (special-case for ephemeral)
6. Issue access + refresh (4-hour cap, can't outlive class)
7. Emit AuditEvent `auth.class_code_login`

**After-workshop linking flow** (V1+): teacher emails parents a "claim your kid's work" link → parent creates Family Account → ephemeral KidProfile is **claimed** (`UPDATE KidProfile SET family_id = parent's family WHERE id = ephemeral_kid_id`) → projects/artifacts preserved.

V0: ephemeral KidProfile auto-archives after class end + 30 days unless claimed.

### 5.3 Kid logout

Same `/auth/logout` endpoint; kid token has `role=kid`; standard revoke flow.

Parent can force kid logout via `POST /kids/:id/force-logout` (revokes all refresh tokens for that kid).

---

## 6. Teacher invitation flow

Teachers don't self-register. Admin-driven creation:

```
1. Admin → POST /admin/users
   Body: { email, display_name, role: 'teacher', region: 'AU' }
   Server:
     - Creates User row (no password, role=teacher)
     - Generates signed invite token (HMAC-SHA256, 7-day TTL)
     - Stores: hash(token) in invite_tokens table
     - Sends email via SendGrid:

       Subject: You've been invited to Airbotix Teacher Console

       Hi Sarah,

       Lightman has invited you to join Airbotix as a teacher.
       Click the link below to set up your account:

         https://teacher.airbotix.ai/accept-invite?token=<signed>

       This link expires in 7 days.

2. Teacher clicks → /accept-invite?token=<signed>
   Frontend: POST /auth/accept-invite { token }
   Server:
     - Verify HMAC + not expired + not consumed
     - Mark invite consumed
     - Issue access + refresh tokens (standard 15-min + 30-day pair)
     - Return tokens
   Frontend: redirect to /profile to finish setup (timezone, photo)

3. Subsequent logins: standard OTP flow (no invite needed)
```

```prisma
model InviteToken {
  id          String   @id @default(cuid())
  user_id     String
  user        User     @relation(fields: [user_id], references: [id])
  token_hash  String   @unique
  expires_at  DateTime
  consumed_at DateTime?
  created_by  String                                    // admin user_id who issued
  created_at  DateTime @default(now())

  @@index([expires_at])
}
```

Why not just OTP for first-time teacher login? Because the User row already exists (admin created it) and we want to ensure the teacher actually clicked through the email — proves they own the inbox before any session is issued.

---

## 7. Super-admin 2FA (V0 hard requirement)

Super-admin role gets all of the above PLUS mandatory TOTP (RFC 6238 30-sec window).

```
POST /auth/verify-otp           # Step 1: email OTP as normal
→ 200 { access_token, requires_2fa: true, twofa_challenge_id: "tfc_xxx" }

POST /auth/verify-totp          # Step 2: TOTP from authenticator app
Body: { challenge_id, totp: "123456" }
→ 200 { access_token, expires_in: 900 }    # full-power access token
```

Between Step 1 and Step 2, the access token has `scope=2fa_pending` and can ONLY hit `/auth/verify-totp` (everything else returns 403).

```prisma
model TwoFactorEnrollment {
  id              String   @id @default(cuid())
  user_id         String   @unique
  user            User     @relation(fields: [user_id], references: [id])
  totp_secret_hash String                                    // encrypted-at-rest TOTP shared secret
  enrolled_at     DateTime @default(now())
  last_used_at    DateTime?
  recovery_codes_hash String[]                              // 10 one-shot recovery codes, hashed
}
```

Enrollment flow: at first super-admin login, force `/profile/setup-2fa` (QR + recovery codes). Cannot exit until enrolled.

V1+: extend TOTP to admin role; consider WebAuthn / passkeys.

---

## 8. Session management UX

### 8.1 Parent Portal (`/portal/*`)

- **Boot**: app loads → tries silent refresh → if success, render dashboard; if fail, redirect to `/portal/login`
- **Idle**: no special idle timeout; refresh works as long as it's within 30 days
- **401 in flight**: silently retry once after refresh; if still 401, hard logout
- **Active sessions list** in `/portal/settings`: shows all RefreshToken rows for this user (with IP + UA + last-used), revoke per-row or all

### 8.2 Teacher Console (`teacher.airbotix.ai`)

Same as Parent Portal pattern.

### 8.3 Kid surface (`/learn/*`)

- **Kid logout button** always visible in kid header
- **Auto-logout after 4 hours of inactivity** (shorter than refresh TTL — defense in depth for shared devices)
- **No "remember me"** — every browser session is a fresh kid login
- **No silent refresh** for class-code (one-shot) kids — when access expires, kid must re-enter class code

### 8.4 Cross-tab behavior

- Access token is per-tab (in-memory)
- Refresh happens via cookie, so all tabs share the underlying session
- On logout in any tab: emit BroadcastChannel event → other tabs hard-logout

---

## 9. Threat model & mitigations

| Threat | Mitigation |
|---|---|
| **Stolen JWT (XSS, browser malware)** | 15-min TTL caps damage. JWT in memory only (no localStorage) → XSS must hit live runtime, can't dump from storage. CSP headers prevent inline script injection. |
| **Stolen refresh cookie** | HttpOnly = inaccessible to JS. Secure = no MITM downgrade. SameSite=Strict = no CSRF-style misuse. Rotation + reuse detection → stolen refresh has ≤15 min before being detected and revoked. |
| **Refresh token theft → silent persistence** | Reuse detection. Any rotated-but-re-presented token triggers full session kill + user alert. |
| **Email enumeration via OTP request** | Always return 204. Constant time. Insert ghost rows for unknown emails to keep timing symmetric. |
| **OTP brute force** | 6-digit space + 5 attempts/code + 5 codes/email/hr + 10/IP/hr → 1M code space, ≤25 guesses/hr per email. Locking on 5 failures across 1h. |
| **Kid PIN brute force** | bcrypt cost-10 + 10 attempts/10 min + 1-hour lockout + parent email alert. 10⁴ space + slow hash + rate limit = infeasible. |
| **Class-code spam** | 6-char alphanumeric = 36⁶ ≈ 2.2B codes; rate-limited 30/hr per code, 60/hr per IP. Codes tied to Class.starts_at..ends_at window only. |
| **Replay attacks on /auth/verify-otp** | OtpAttempt.consumed_at marks single-use. Rotated refresh prevents replay. |
| **Subdomain takeover / cookie scope abuse** | Cookie path scoped to `/auth` (not `/`). Domain `.airbotix.ai` only — DNS strictly managed via Cloudflare. |
| **JWT key compromise** | V0: HS256 with rotating shared secret (manual rotation procedure documented in `docs/ops/jwt-key-rotation.md`). V1+: move to EdDSA + JWKS endpoint for automated rotation. |
| **Session fixation** | OTP-based login does not exist before verification → no pre-auth session to fixate. |
| **MITM on OTP email** | Out of scope of our threat model — email is the recovery channel; assumption is the user controls their inbox. Counter-mitigation: short OTP TTL (10 min) limits leaked-code value. |
| **Compromised SendGrid account** | Could send OTPs to attacker-controlled addresses → but OTP recipients are determined by our `to:` field, not SendGrid. Worst case: attacker can suppress OTPs (DoS), not redirect them. Monitor SendGrid bounce rate. |
| **Insider (admin) abuse** | All admin actions audited with `actor=admin`. Super-admin actions visible only to other super-admins (audit blind spot mitigated by external SOC, V1+). |
| **Service token leak** | Per-token scope restriction (least privilege). Rotation supported. last_used_at telemetry catches dormant-token abuse. |

---

## 10. Rate limiting reference

| Endpoint | Limit | Window | Key | Failure mode |
|---|---|---|---|---|
| `POST /auth/request-otp` | 5 | 1 hour | email | 204 (silent) |
| `POST /auth/request-otp` | 10 | 1 hour | IP | 429 |
| `POST /auth/verify-otp` | 5 attempts | per OtpAttempt row | row | 429 then row expires |
| `POST /auth/refresh` | 60 | 1 hour | user_id | 429 |
| `POST /auth/kid-login` | 10 | 10 min | family_code + nickname | 429 + email parent on threshold |
| `POST /auth/kid-login` | 30 | 1 hour | IP | 429 |
| `POST /auth/class-code-login` | 30 | 1 hour | class_code | 429 |
| `POST /auth/class-code-login` | 60 | 1 hour | IP | 429 |
| `POST /auth/verify-totp` | 5 attempts | per challenge | challenge_id | 429 then challenge expires |

Backed by Redis (V0 = single-node; V1+ = cluster). All `429` include `Retry-After` header.

---

## 11. Audit events

Every auth-relevant action emits an `AuditEvent` (see platform-backend-api-spec.md §4.5):

| event_type | Actor | Emitted on |
|---|---|---|
| `auth.otp_requested` | system | OTP request received (even if email unknown) |
| `auth.otp_verified` | user | Successful OTP verify → tokens issued |
| `auth.otp_failed` | system | OTP verify failed (wrong code / expired / rate limited) |
| `auth.refresh_success` | user | Refresh token rotated successfully |
| `auth.refresh_reuse_detected` | system | **SECURITY**: revoked refresh re-presented |
| `auth.logout` | user | Single-session logout |
| `auth.logout_everywhere` | user | All sessions revoked |
| `auth.kid_login_success` | kid | Kid family-code + PIN login |
| `auth.kid_login_failed` | system | Kid PIN failed |
| `auth.kid_locked` | system | Kid hit lockout threshold |
| `auth.class_code_login` | kid | One-shot class code login (ephemeral kid) |
| `auth.invite_accepted` | user | Teacher accepted invite |
| `auth.totp_verified` | user | Super-admin 2FA passed |
| `auth.totp_failed` | system | Super-admin 2FA failed |
| `auth.service_token_used` | service | Service token authenticated a request |

Parent dashboard shows `auth.kid_login_success` + `auth.kid_login_failed` for own kids (audit feed).

---

## 12. API surface summary

Reproduced from platform-backend-api-spec.md §5.1, fully expanded:

| Method | Path | Roles | TTL | Purpose |
|---|---|---|---|---|
| POST | `/auth/request-otp` | PUBLIC | — | Send OTP to email |
| POST | `/auth/verify-otp` | PUBLIC | issues 15min + 30d | Exchange OTP for tokens |
| POST | `/auth/verify-totp` | scope=2fa_pending | issues full 15min | Super-admin 2FA step |
| POST | `/auth/refresh` | PUBLIC (cookie) | issues new 15min + rotated 30d | Silent refresh |
| POST | `/auth/logout` | any | — | Revoke current refresh |
| POST | `/auth/logout-everywhere` | any | — | Revoke all refresh tokens for user |
| GET | `/auth/me` | any | — | Current identity + permissions |
| POST | `/auth/kid-login` | PUBLIC | issues 15min + 24h | Family-code + PIN |
| POST | `/auth/class-code-login` | PUBLIC | issues 15min + 4h | One-shot class code |
| POST | `/auth/accept-invite` | PUBLIC (token) | issues 15min + 30d | First teacher / admin login |
| POST | `/auth/setup-2fa` | super_admin (post-OTP) | — | Enroll TOTP |
| POST | `/kids/:id/force-logout` | parent (own), admin | — | Parent kicks kid off |
| GET | `/auth/sessions` | any | — | List active refresh tokens (for `/settings` UI) |
| POST | `/auth/sessions/:id/revoke` | any | — | Revoke a specific session |

---

## 13. Implementation notes (NestJS scaffold)

```
src/auth/
├── auth.module.ts
├── auth.controller.ts        # endpoints above
├── auth.service.ts           # token issuance, OTP send, rate limit checks
├── otp/
│   ├── otp.service.ts        # generate, store, verify
│   └── sendgrid.client.ts    # email transport
├── jwt/
│   ├── jwt.service.ts        # sign + verify, key management
│   └── jwt.strategy.ts       # passport-jwt
├── refresh/
│   ├── refresh.service.ts    # rotation, reuse detection
│   └── cookie.helpers.ts
├── kid/
│   ├── kid-login.service.ts  # family-code path
│   └── class-code-login.service.ts
├── service-token/
│   └── service-token.guard.ts
├── twofa/
│   ├── totp.service.ts       # RFC 6238 verify
│   └── enrollment.service.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   ├── roles.guard.ts        # checks @Roles(...) decorator
│   ├── family-scope.guard.ts # checks resource.family_id == jwt.family_id
│   └── service-token.guard.ts
├── decorators/
│   ├── current-user.decorator.ts
│   ├── roles.decorator.ts
│   └── public.decorator.ts
└── auth.types.ts
```

Recommended packages:

```bash
npm i @nestjs/jwt @nestjs/passport passport passport-jwt \
      bcrypt argon2 \
      @sendgrid/mail \
      otplib qrcode \
      ioredis
npm i -D @types/passport-jwt @types/bcrypt
```

**Why bcrypt + argon2 both**: bcrypt for kid PIN (faster cost-10, kids re-login often), argon2id for any future password use (V1+ if SSO bridges require). Pick one if migration cost matters; for V0 staying bcrypt-only is fine — argon2 line can be deleted.

### 13.1 Env vars (additions to CLAUDE.md list)

```
JWT_SECRET=                 # 256-bit, hex-encoded, rotate quarterly
JWT_PREVIOUS_SECRET=        # accepted during 24h rotation window
JWT_ACCESS_TTL_SEC=900      # 15 min
JWT_REFRESH_TTL_SEC_ADULT=2592000   # 30 days
JWT_REFRESH_TTL_SEC_KID=86400        # 24h
JWT_REFRESH_TTL_SEC_CLASS=14400      # 4h
OTP_CODE_LENGTH=6
OTP_TTL_SEC=600
OTP_MAX_ATTEMPTS=5
SENDGRID_API_KEY=
SENDGRID_FROM=no-reply@airbotix.ai
SENDGRID_OTP_TEMPLATE_PARENT=d-xxx
SENDGRID_OTP_TEMPLATE_TEACHER=d-yyy
REDIS_URL=                  # for rate limit counters
COOKIE_DOMAIN=.airbotix.ai
COOKIE_SECURE=true
TOTP_ISSUER=Airbotix
```

---

## 14. Out of scope (V0)

- ❌ Social SSO (Google / Apple / Microsoft) — V1+
- ❌ SAML / OIDC for school org accounts — V1 when B2B requires
- ❌ Passkeys / WebAuthn — V2+
- ❌ Magic-link login (parallel to OTP) — V1+
- ❌ Hardware key 2FA — V2+
- ❌ Biometric kid login (FaceID etc.) — V2+
- ❌ Password fallback for any role — never (passwordless is a design constraint)
- ❌ Multi-parent per family (co-parents) — V1+, see platform-backend-api-spec.md Q7
- ❌ Account merge (separate emails → one user) — V1+ ops-driven
- ❌ Email change flow — V1+ (V0: manual admin action with audit)
- ❌ Cross-region session replication — V0 single-region (Sydney)

---

## 15. Success criteria (V0)

| # | Metric | Target |
|---|---|---|
| A1 | OTP delivery latency (request → inbox) | p95 <8s |
| A2 | OTP verify success rate (legitimate users) | >98% on first attempt |
| A3 | Kid login success rate | >95% on first attempt |
| A4 | Refresh reuse-detection precision | 100% (no false positives in 30-day window) |
| A5 | Zero plaintext token storage in DB | Required (audit before launch) |
| A6 | Zero JWT in browser localStorage | Required (XSS audit) |
| A7 | Super-admin 2FA enrollment | 100% of super-admins within 24h of role grant |
| A8 | Auth-related incident response time | <4h SLA for confirmed token compromise |

---

## 16. Open questions

| # | Q | Impact |
|---|---|---|
| Q1 | How is `family_code` represented? Family.id (long opaque cuid)? a new short kid-memorable `Family.code` column? derived from Family.name? Current parent-portal-prd.md UI shows "WANG" — implies short human-friendly code. Need schema decision. | Adds `Family.code` column + uniqueness constraint + collision handling |
| Q2 | Should kid PINs be 4-digit or 4-character (allows letters)? 4-char = 36⁴ = 1.7M space, much harder brute force; but harder for 6-year-olds to type. | UX research with 6-11 age cohort |
| Q3 | Magic-link as alternative to OTP code: drop or include in V1? Cost is dual UX paths to maintain. Benefit is some users prefer it on mobile. | Schedule call |
| Q4 | Should we ship CAPTCHA on `/auth/request-otp` if abuse spikes, or rely on rate limit alone? Cloudflare Turnstile is the simple default. | Hold for ops feedback post-launch |
| Q5 | Service tokens: scope syntax — wildcards (`audit:*`) or explicit lists only? Wildcards simpler; explicit safer. | Lean toward explicit V0, wildcards if pain accumulates |
| Q6 | TOTP recovery codes — 10 one-shot codes (Google-style) or backup email-based recovery? Recovery codes are stronger but lose-the-paper risk. | Lean toward recovery codes for V0; admin reset if all lost |
| Q7 | Cross-subdomain cookie on `.airbotix.ai`: ok for V0, but if we ever add `*.partner.airbotix.ai` for white-label, scope needs tightening. | V0 OK; flag for partner program planning |
| Q8 | Token issuance during DR outage: if SendGrid down, can users log in? Today: no. Options: SMS fallback (Twilio), pre-shared backup codes for VIP accounts. | Schedule resilience review |
| Q9 | What's the audit retention for `auth.*` events? Compliance default for AU adult financial is 7 years; for kids' login events under Privacy Act, less clear. | Compliance review needed (see Q3 in platform-backend-api-spec.md) |
| Q10 | Service tokens for `kids-opencode` desktop: bundled with binary or fetched after parent first-login? Bundled = simpler distribution; fetched = revocable per family. | Lean fetched-after-login; affects kids-opencode build pipeline |

---

## 17. References

- `platform-backend-api-spec.md` §3 (extracted into this PRD), §4.1 (User/RefreshToken/OtpAttempt schema)
- `parent-portal-prd.md` §3 (consumer-side flow)
- `teacher-console-prd.md` §3 (consumer-side flow + invitation flow)
- `airbotix-app-learn-prd.md` (kid login surface — `/learn/login`)
- `docs/product/compliance/minors-compliance.md` (PIN + parent control + audit requirements)
- `docs/ops/jwt-key-rotation.md` (TBD — to be written alongside V0 implementation)
- RFC 6238 — TOTP
- RFC 7519 — JWT
- OWASP Authentication Cheat Sheet
- OWASP Session Management Cheat Sheet
