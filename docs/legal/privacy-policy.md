# Privacy Policy

> Airbotix Pty Ltd (ACN [ACN]) — Privacy Policy for **Kids OpenCode**, **Airbotix Workshops**, and any other product or service operated under the Airbotix or Kids in AI brands (collectively, the "Services").
>
> This is a kid-aware Privacy Policy. We aim to explain what we do in plain English so that a 12-year-old and their parent both understand it.
>
> **Last updated**: 2026-05-15 · **Version**: 0.1 (engineering-side draft pending qualified-AU-lawyer review)

---

## In one paragraph

Airbotix collects the smallest amount of information we need to give you a safe coding experience. We never sell your data. We never use your kid's data or code to train AI models. We never show ads. Kid project files stay on your family's own computer — they don't come to our servers. The AI conversations get routed through our gateway (DeepRouter) which adds safety filters, and we keep a record of which tools the AI used in your sessions so you (the parent) can see exactly what happened. You can ask for your data, delete it, or close the account at any time. We respond within 14 days.

---

## 1. Who we are

| | |
|---|---|
| Legal entity | Airbotix Pty Ltd, an Australian proprietary company (ACN [ACN], ABN [ABN]) |
| Registered office | [REGISTERED ADDRESS, NSW Australia] |
| Operator-of-record for kids' data | Airbotix Pty Ltd |
| Privacy Officer | Lightman [SURNAME], Founder · privacy@airbotix.ai · +61 [PHONE] |
| Australian Privacy Act 1988 covered? | Yes. We are an APP entity. |

We operate the website airbotix.ai, the Kids in AI brand at kidsinai.org, the `kids-opencode` command-line tool, and related software.

---

## 2. What information we collect, and why

We collect different information depending on who you are and how you interact with us.

### 2.1 If you are a parent who creates a Family Account

| Information | Why we need it | How long we keep it |
|---|---|---|
| Your email address | To send you account-related messages and to log you in | Until you close your account |
| Your phone number (optional) | Two-factor authentication and account recovery | Until you close your account |
| Your billing details (handled by Airwallex, not stored by us) | To process Stars Pack purchases | We hold a payment reference only, not card numbers |
| The country and timezone you live in | To bill you correctly, route to a nearby server, and apply the right legal regime | Until you close your account |

We do **not** collect: your full home address, your date of birth, your real name (unless you choose to provide it), your government identifiers, or your social-media handles.

### 2.2 If you are a child whose parent has set up a Kid Profile

| Information | Why we need it | How long we keep it |
|---|---|---|
| Age band ("12+", not your birthday) | To choose AI behaviour appropriate to your age | Until your parent closes the profile |
| Display nickname (your choice; not your real name) | So the AI can address you and so your work has your label on it | Until you change it or your parent closes the profile |
| Course Pack progress | So you can pick up where you left off | Until your parent closes the profile |
| AI audit log (what tools the AI used and when, summarised) | So your parent can see what happened in your sessions and so we can investigate any safety incident | 90 days fully accessible, then 3 years in encrypted archive, then deleted |

We do **not** collect: your real name, your birthday, your school, your address, your phone, your photo, your voice, your fingerprint, or anything else that could uniquely identify you in the physical world (unless your parent specifically adds it to a project, which we discourage).

### 2.3 If you (parent or child) use the Kids OpenCode CLI

Kids OpenCode runs on your own computer. The kid's code and project files **stay on your computer** — they never come to our servers.

The only data that leaves your computer is:

| Data | Where it goes | Why |
|---|---|---|
| The text you type into the AI ("I want a portfolio website about dragons") | DeepRouter, our gateway → the AI model (Anthropic / OpenAI / etc.) | So the AI can respond. Stripped of personal identifiers. |
| The AI's response | Back to your computer | So you see it |
| A summary of which AI tool was used (e.g., "wrote a file called index.html") | Our audit-log endpoint | So your parent can see what the AI did. We do not log the file contents. |
| The number of tokens consumed | Our billing endpoint | So we can deduct the right number of Stars from your wallet |

### 2.4 If you visit airbotix.ai or kidsinai.org

We keep server-side request logs (IP, user-agent, URL, timestamp) for 30 days for security and abuse-prevention purposes. We do not use cookies for tracking. We do not embed third-party analytics or advertising scripts on pages targeted at kids.

### 2.5 If you contact us by email or phone

We keep the message text in our support system for as long as needed to handle your question, then no more than 24 months.

---

## 3. What we DO NOT do with your data

To be explicit:

- ❌ We do not sell your data to anyone. Not for advertising, not for analytics, not for any reason.
- ❌ We do not use your kid's project files, AI conversations, or audit log to train any AI model. Not ours, not anyone else's.
- ❌ We do not share your data with advertisers, data brokers, or social-media platforms.
- ❌ We do not embed third-party tracking pixels (Facebook, Google Analytics, etc.) on pages for kids.
- ❌ We do not let anyone outside Airbotix read your kid's audit log, except: when legally required (court order, regulator subpoena) or when investigating a safety incident affecting that specific kid.
- ❌ We do not send marketing communications to children. Adult-parent email accounts may receive product-update emails; opt out anytime.

---

## 4. Where your data lives

| Data type | Where stored | Region |
|---|---|---|
| Family / Kid Profile data | Neon Serverless PostgreSQL | AWS ap-southeast-2 (Sydney, Australia) |
| Audit log (90-day hot) | Postgres above | AWS ap-southeast-2 |
| Audit log (3-year cold archive) | AWS S3 with at-rest encryption (AES-256) | AWS ap-southeast-2 |
| AI conversation pipeline | DeepRouter `/v1` | DeepRouter operates Singapore + Sydney pop-of-presence |
| Provider data (Anthropic / OpenAI / Doubao) | Their own servers | Per their respective privacy policies — see §6 |

**Australian families**: your data stays in Australia (Sydney region) for all data we directly control. For AI provider round-trips, the prompt is sent to the provider's region (typically US for OpenAI/Anthropic, China for Doubao); for Anthropic and OpenAI we force Zero Data Retention so they do not keep your data after responding.

---

## 5. AI providers and Zero Data Retention

When you use Kids OpenCode, your prompts are sent to a large language model run by Anthropic, OpenAI, Doubao, or another provider we work with. We route every request through our gateway (DeepRouter) which:

- **Strips identifying information** about you from the request metadata
- **Forces Zero Data Retention** mode on OpenAI requests (their strictest privacy mode — the data is not retained by OpenAI after the response is sent)
- **Forwards a kid-safe system prompt** that constrains what the AI will discuss
- **Filters content** at the input and output (blocks harmful content categories)

The current providers are listed at [airbotix.ai/compliance#providers](https://airbotix.ai/compliance) and the list will be kept current.

Each provider has its own privacy policy:
- Anthropic: https://www.anthropic.com/legal/privacy
- OpenAI: https://openai.com/policies/privacy-policy
- Doubao: [provider URL]
- DeepSeek: [provider URL]
- DeepRouter (our gateway): https://deeprouter.ai/legal/privacy

---

## 6. Your rights and your kid's rights

### 6.1 Right to access

You can ask us what personal information we hold about you (or your kid). We will provide it within 14 days. Free of charge. Email `privacy@airbotix.ai` from the parent email on the account.

### 6.2 Right to correction

If something we hold is wrong, you can ask us to correct it. We will correct within 14 days, or explain why if we disagree.

### 6.3 Right to delete

You can ask us to delete:
- Your entire family account (all data deleted, full deletion within 30 days)
- A specific kid profile (all that kid's data deleted within 30 days)
- A specific audit-log range
- A specific session

Once deleted, we cannot recover the data. Anonymised aggregate metrics (e.g., "we had 1000 active families this month") may be retained.

### 6.4 Right to export

You can ask us for a machine-readable export (JSON) of all your data. Provided within 14 days. Useful if you want to leave the platform and take your records with you.

### 6.5 Right to withdraw consent

You can pause AI processing for a kid profile at any time without deleting it. Take a break, come back later.

### 6.6 Right to complain

If you think we have not handled your data correctly:

1. Email us first at `privacy@airbotix.ai` — we want to fix things
2. If you are still unsatisfied, you can complain to the Office of the Australian Information Commissioner (OAIC) at https://www.oaic.gov.au/privacy/privacy-complaints
3. For online-safety concerns specifically about kid content, you can also contact the eSafety Commissioner at https://www.esafety.gov.au

---

## 7. Special protections for children

We follow stricter rules for kids than for adults:

- **Default-private**: kid projects stay on your family's device. Sharing requires explicit parent + kid action.
- **No targeted advertising**: ever. To kids or adults.
- **No nudge techniques**: no streaks, no infinite scroll, no engagement-optimised notifications, no social-comparison metrics.
- **No profile-building for advertising**: we do not build behavioural profiles of kids.
- **AI disclosure**: the AI is always clearly identified as AI to the kid.
- **Self-harm response**: if the AI detects signs of self-harm, it stops the coding conversation and refers the kid to Kids Helpline (Australia: 1800 55 1800).
- **Audit logging**: parents can see what the AI did, in plain English, in the audit log.

We comply with:
- The Australian Privacy Act 1988 and the Australian Privacy Principles
- The Children's Online Privacy Code 2026 (when it takes effect on 10 December 2026; we have engaged with the OAIC consultation)
- The Online Safety Act 2021 and the Basic Online Safety Expectations
- Anthropic's "Organizations Serving Minors" guidelines
- OpenAI's Under-18 API Guidance
- The Voluntary AI Safety Standard's 10 guardrails

If you live outside Australia, additional local laws may apply. Our public Compliance Statement (airbotix.ai/compliance) summarises which.

---

## 8. Data breaches

If we have a data breach that could seriously harm you, we notify you within 30 days (often much sooner) and also notify the OAIC. We do this under the Notifiable Data Breaches scheme (Part IIIC of the Privacy Act 1988).

For kid-related breaches, we presume serious harm — meaning we err on the side of notifying you even when the law might not strictly require it.

Our incident response runbook is documented at [github.com/kidsinai/kids-opencode/blob/main/docs/runbook/ndb-incident.md](https://github.com/kidsinai/kids-opencode/blob/main/docs/runbook/ndb-incident.md) for transparency.

---

## 9. Cookies and tracking

The airbotix.ai marketing website uses only essential cookies (login session, language preference). We do not use third-party analytics or tracking pixels.

The Kids OpenCode CLI does not use cookies; it is not a web product.

The Airbotix-AI/airbotix-app dashboard (for parents) uses essential cookies only.

---

## 10. Changes to this policy

We may update this policy from time to time. When we do:

- Material changes (anything affecting what we collect, share, or how long we retain): we email all active family accounts at least 30 days before the change takes effect
- Minor clarifications: we update the policy and the "last updated" date

The current version of this policy is always at airbotix.ai/privacy. Older versions are at airbotix.ai/privacy/archive/v0.X.

---

## 11. Contact

If you have any question about this Policy or your privacy with Airbotix:

| Channel | Contact |
|---|---|
| Email | privacy@airbotix.ai |
| Phone | +61 [PHONE] (Australian business hours) |
| Mail | Privacy Officer · Airbotix Pty Ltd · [REGISTERED ADDRESS] · NSW Australia |
| OAIC complaint | https://www.oaic.gov.au/privacy/privacy-complaints |

---

## 12. Jurisdiction

This Privacy Policy is governed by the laws of New South Wales, Australia, and the Commonwealth of Australia. For users in other jurisdictions, local consumer-protection and privacy laws may grant additional rights that this Policy cannot waive.

---

## Revision history

| Version | Date | Note |
|---|---|---|
| 0.1 | 2026-05-15 | Engineering-side draft. Awaiting AU privacy lawyer confirmation. |

---

## Notes for Lightman (delete before publishing)

Bracketed placeholders to fill before publication:
- `[ACN]` and `[ABN]` — Airbotix Pty Ltd identifiers
- `[REGISTERED ADDRESS, NSW Australia]` — current registered office of Airbotix Pty Ltd
- `[PHONE]` — published support line
- `[SURNAME]` — Lightman's surname (if you want it published)
- DeepSeek / Doubao privacy policy URLs once those providers are formally onboarded

Lawyer-review checklist items (from `kids-opencode/docs/compliance/au-lawyer-pass.md` §AU-3):
- Confirm the 14-day deletion response window is enforceable
- Confirm AWS Sydney data-residency claim is accurate given actual deployment
- Confirm no over-promises ("never use kid data for training" needs to remain literally true)
- Confirm AU Privacy Act references are current as of date of publication
- Confirm OAIC + eSafety complaint routes are correctly cited
