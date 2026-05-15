# Parental Consent — Kids OpenCode

> The text and structure of the **Parental Consent** capture step in the Family Account onboarding flow. The consent record is stored immutably in `Airbotix-AI/platform-backend`, is exportable on parent request, and forms the lawful basis for processing each Kid Profile's data.
>
> Designed to satisfy:
> - Privacy Act 1988 (Cth) APP 3, APP 5, APP 6 — informed, specific consent
> - Children's Online Privacy Code 2026 (when in force) — "informed, current, not withdrawn, specific, unambiguous and voluntary" consent
> - Anthropic AUP "Organizations Serving Minors" guideline — explicit parental authorisation
> - OpenAI Under-18 API Guidance — recorded parental consent for any kid under the local age of digital consent
>
> **Last updated**: 2026-05-15 · **Version**: 0.1 (engineering-side draft pending qualified-AU-lawyer review)

---

## 1. When this consent is captured

This consent flow runs:

1. The first time a Parent creates a Kid Profile
2. Once every 12 months thereafter, on the anniversary of the original consent (renewal step)
3. Immediately, if Airbotix makes a **material change** to processing practices (e.g., adds a new provider, changes audit retention)
4. Immediately, if the Kid turns 18 (separate "Adult transition" flow, not covered here)

The consent is captured as an itemised set of explicit affirmative actions, not a single tick-box.

---

## 2. Pre-consent context (shown to the Parent before checkboxes)

> ### Setting up [KID NICKNAME]
>
> Before we start, we want to tell you exactly what happens when [Kid Nickname] uses Kids OpenCode, and ask for your permission for each part.
>
> This page is long because we want to be honest. Please read it. It takes about 4 minutes.
>
> Anything you check below, you can change later from your Family Dashboard. You can also withdraw consent and close [Kid Nickname]'s profile at any time.
>
> If something is unclear, email `privacy@airbotix.ai` — we'll explain.

---

## 3. Itemised consent items

Each item is an independent checkbox. The Parent must affirmatively check each to proceed. Default state: unchecked.

The wording below is verbatim what the Parent reads. Right column is operational notes (not shown to Parent).

| # | Consent item | Operational notes |
|---|---|---|
| C-1 | **I confirm I am the parent or legal guardian of [Kid Nickname], and that [Kid Nickname] is at least 12 years old.** | Hard requirement. Without this, no Kid Profile is created. Backend stores: timestamp, IP at signup, parent email of record. |
| C-2 | **I have read and agree to the [Privacy Policy](./privacy-policy.md) and the [Terms of Service](./terms-of-service.md).** | Standard contract acceptance. Both documents must be visible (link, not just title) before this checkbox is enabled. |
| C-3 | **I consent to Airbotix collecting and storing [Kid Nickname]'s age band ("12+"), display nickname, and Course Pack progress** to provide the Kids OpenCode service. I understand the kid's real name, birthday, school, and address are NOT collected. | Stores in platform-backend Postgres. Region: AWS Sydney. Retention: until Parent closes the profile or deletes data. |
| C-4 | **I consent to Airbotix maintaining an audit log of what AI tools [Kid Nickname]'s session uses (e.g., "wrote a file called index.html") so I can review session activity.** I understand the audit log does **not** include the contents of files [Kid Nickname] writes — those stay on our family's own computer. Retention: 90 days fully accessible to me, then 3 years in encrypted archive, then deleted. | Audit log written to platform-backend Postgres + 3y cold to S3 Sydney with at-rest encryption. Parent dashboard exposes the 90-day window. |
| C-5 | **I consent to [Kid Nickname]'s AI prompts being routed through DeepRouter (Airbotix's AI gateway) and on to a third-party AI provider (currently Anthropic, OpenAI, or another listed at airbotix.ai/compliance/providers).** I understand DeepRouter applies content moderation and forces Zero Data Retention on OpenAI calls. I understand each provider has its own privacy policy. | Stores routing tenant key, family_id binding. DeepRouter enforces kids_mode=true on all of this family's traffic. |
| C-6 | **I understand the AI mentor will explicitly identify itself as an AI to [Kid Nickname] and will not pretend to be human.** | System prompt rule #5. Visible in any session transcript I review. |
| C-7 | **I understand that the AI's responses, while heavily moderated, can occasionally be incorrect, unhelpful, or surprising.** I will supervise [Kid Nickname]'s use, particularly during their first sessions. | Acknowledgement of LLM probabilistic nature. Reinforces parent's supervisory role; relevant to negligence and ACL §13. |
| C-8 | **I confirm Airbotix will NOT use [Kid Nickname]'s data, projects, or AI conversations to train any AI model.** | This is a one-way commitment we make. Recorded so the Parent has a written record. |
| C-9 | **I consent to Airbotix using anonymous, aggregated usage metrics (e.g., "1,000 active families this month") to improve the Service. No metric identifies [Kid Nickname] personally.** | Standard analytics-without-PII. Permits Airbotix to publish growth and engagement figures publicly. |
| C-10 | **I understand that if [Kid Nickname] discloses something the AI's safety layer interprets as a sign of self-harm, harm to others, or being in danger, the AI will stop the coding conversation and refer them to Kids Helpline (Australia: 1800 55 1800).** This is a safety guard; I am responsible for following up with [Kid Nickname]. The event is logged in the audit log. | System prompt rule #10. Critical safety affordance. |
| C-11 | **I understand I can withdraw any of these consents, pause [Kid Nickname]'s account, or delete it entirely at any time** via the Family Dashboard or by emailing `privacy@airbotix.ai`. Airbotix will action my request within 14 days of receipt. | APP 11 + COPC right-to-withdraw. The dashboard surfaces this prominently per "high privacy by default" requirement. |

### Optional consent items (Parent may decline without losing access to the Service)

These are independent and uncheckable without losing the core Service.

| # | Optional consent item | Operational notes |
|---|---|---|
| C-12 | **(Optional) I agree to receive product-update emails about new Course Packs and feature releases.** [Default: unchecked] | Opt-in. Marketing communications to the Parent email only, never to the Kid. Unsubscribe in every email. |
| C-13 | **(Optional) I am willing for Airbotix to contact me for occasional parent surveys (e.g., feature feedback).** [Default: unchecked] | Used to engage with parent community. Max 2x per year per family. |
| C-14 | **(Optional) I am willing to share [Kid Nickname]'s completed Course Pack work as an anonymous showcase on airbotix.ai/showcase**, with no name or identifying details attached. [Default: unchecked] | Marketing showcase. Requires both Parent and Kid affirmative re-consent at sharing time per item. |

---

## 4. After the Parent submits

Upon submission, the platform-backend records:

```
Consent record entry
─────────────────────
- family_id
- kid_profile_id (new)
- timestamp (UTC)
- ip_address_hash (one-way hashed, for fraud / multi-account detection)
- parent_email_at_consent
- consent_items_accepted: [C-1, C-2, C-3, C-4, C-5, C-6, C-7, C-8, C-9, C-10, C-11, ...optional]
- consent_items_declined: [...optional]
- privacy_policy_version_at_consent (e.g., "0.1")
- terms_version_at_consent (e.g., "0.1")
- next_renewal_due (= consent timestamp + 365 days)
- digital_signature (HMAC of all above with platform-backend signing key)
```

This record is **immutable** (insert-only audit table). Subsequent changes to consent (Parent toggles something in the dashboard, or renewal happens) create a **new record**, not an update.

The Parent can email `privacy@airbotix.ai` to receive a copy of their consent records as a PDF.

---

## 5. Withdrawal flow

The Parent's Family Dashboard has a "Manage Consent" page exposing each consent item with a current-state toggle and a "Withdraw" action.

Withdrawing a **required** consent (C-1 through C-11) automatically pauses the Kid Profile (cannot run sessions) and prompts the Parent to either re-consent or close the profile entirely.

Withdrawing an **optional** consent (C-12 through C-14) simply turns off that channel.

Every withdrawal is recorded as a new immutable consent record entry.

---

## 6. Material-change flow

If Airbotix makes a material change to processing practices — e.g.:

- Adding a new LLM provider not previously listed
- Changing audit log retention duration
- Changing data-residency region
- Changing the AI tool whitelist (adding tools is material; removing is not)
- Changing the kid-safe system prompt in a way that materially alters AI behaviour

…all active Family Accounts are emailed at least 30 days before the change, and on next login each Parent must re-affirm consent through a delta page that shows only the items that have changed.

If the Parent does not re-affirm within 30 days of the change taking effect, the Kid Profile is paused (cannot run sessions) until consent is updated or the profile is closed.

---

## 7. Renewal flow

12 months after the last consent record:

- Parent receives an email asking them to confirm consent is still current
- Parent logs in and reviews the full consent page; checkboxes are pre-filled with their current state
- They affirm or update; a new consent record is written
- If they ignore the email for 30 days, the Kid Profile is paused (cannot run sessions) until renewed

---

## 8. Kid turns 18 flow

When the Kid's recorded age band would naturally cross 18:

- 60 days before the assumed birthday (based on the original age band at profile creation + months elapsed; we don't have exact birthdays), the Parent is notified
- On the assumed birthday, the Kid is offered the option to convert to an Adult Account or remain under Family supervision until they actively transition
- Adult conversion requires the Kid (now 18+) to accept the Adult Terms of Service directly; the Parent's consent is no longer the basis for processing
- If they do not convert and do not remain under Family supervision, the profile is paused after a 30-day grace period

---

## 9. Workshop consent

If the Kid is using the Service via a school Workshop, the school operates under a separate Workshop Services Agreement that includes school-side parental consent. The Family-account consent above is still required for any data that returns to the Family Account context (e.g., audit log visibility to the family).

---

## 10. Audit trail for regulators

The full consent record (per §4) is producible on demand to:

- The OAIC under a privacy investigation
- The eSafety Commissioner under a transparency notice
- Anthropic's compliance team under their AUP audit
- The Parent themselves on request

We are happy to demonstrate the flow to any regulator.

---

## Revision history

| Version | Date | Note |
|---|---|---|
| 0.1 | 2026-05-15 | Engineering-side draft. Pending AU lawyer confirmation. |

---

## Notes for Lightman (delete before publishing)

This is the **content** of the consent flow. The platform-backend engineering team owns implementing the actual UI (in `Airbotix-AI/airbotix-app`) and the immutable consent-record schema. They should reference this doc as the canonical source for the wording.

Lawyer-review checklist:
- §3 Confirm the 11 required + 3 optional items have the right scope (some legal regimes might require items we missed — Lawyer to flag)
- §6 Confirm "material change" definition is consistent with APP 5 — what exactly triggers re-consent
- §7 Confirm the 12-month renewal cadence is consistent with COPC draft requirements when finalised
- §8 Confirm the "kid turns 18" handling is correct under AU adult-conversion law
- §10 Confirm the regulator-disclosure list is complete

Platform-backend engineering ownership for implementation:
- Immutable insert-only consent-records table in Postgres
- HMAC signing of each record with the platform-backend signing key (key in AWS Secrets Manager Sydney)
- Parent dashboard Manage Consent UI
- Renewal email cron + 30-day grace logic
- Material-change delta page

Cross-references:
- `airbotix/docs/legal/privacy-policy.md` — gives the Parent the substantive disclosure that consent is given against
- `airbotix/docs/legal/terms-of-service.md` — separately accepted
- `kidsinai/kids-opencode/docs/compliance/au-lawyer-pass.md` AU-3 — broader compliance map this slots into
