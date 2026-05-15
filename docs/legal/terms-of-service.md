# Terms of Service

> Airbotix Pty Ltd (ACN [ACN]) — Terms of Service for users of **Kids OpenCode**, **Airbotix Workshops**, and any other product or service operated under the Airbotix or Kids in AI brands (collectively, the "Services").
>
> These Terms form a legal contract between you and Airbotix. You must be 18+ to accept these Terms; if you are setting up a Family Account for a kid under 18, you are accepting on the kid's behalf as well as your own.
>
> **Last updated**: 2026-05-15 · **Version**: 0.1 (engineering-side draft pending qualified-AU-lawyer review)

---

## 1. Who these Terms are between

These Terms are between:

| Party | Definition |
|---|---|
| **"You" / "the Parent"** | The adult (18+) who signs up for a Family Account and accepts these Terms |
| **"Airbotix" / "we" / "us"** | Airbotix Pty Ltd, an Australian proprietary company (ACN [ACN]), at [REGISTERED ADDRESS, NSW Australia] |
| **"Kid"** | A child under 18 for whom you, the Parent, create a Kid Profile |
| **"User"** | Either the Parent or a Kid in a session |

If you are a teacher or school operator setting up a Workshop, additional terms apply — see §15.

---

## 2. What you are agreeing to

By creating an account or using the Services, you agree:

- You are at least 18 years old (or applicable age of contractual capacity in your jurisdiction)
- The information you provide is accurate
- You have parental responsibility for any Kid whose profile you create
- You will follow these Terms and our [Privacy Policy](./privacy-policy.md)
- You will follow our [Acceptable Use](#7-acceptable-use) rules
- You will pay any Stars Pack charges you have authorised
- You understand that the Services involve AI-generated content, which is sometimes wrong, surprising, or unhelpful, and that Airbotix is not responsible for AI-generated content beyond what these Terms specifically warrant

If any of the above is not true, please do not use the Services.

---

## 3. Your account

### 3.1 Family Account

You create one Family Account using your email address. Under that account you can create up to 5 Kid Profiles.

You are responsible for keeping your login credentials safe. Notify us at `security@airbotix.ai` if your account is accessed without your authorisation. We are not liable for losses caused by you sharing credentials.

### 3.2 Kid Profiles

You decide which Kid Profiles to create and what nickname / age band to use for each. We do not require (and prefer that you do not provide) real names or birthdays of kids.

You are responsible for supervising your Kid's use of the Services.

### 3.3 Closing your account

You can close your Family Account at any time. We action account closure (deletion of all Family + Kid data within 30 days) via `privacy@airbotix.ai`.

---

## 4. The Services we provide

We provide:

| Service | What it does |
|---|---|
| **Kids OpenCode CLI** | A command-line AI coding mentor you install on your own computer |
| **Family Dashboard** | A web app where you (the Parent) see audit logs, manage Stars Pack credits, and adjust Kid Profiles |
| **Course Packs** | Curriculum content guiding the AI mentor through specific learning goals |
| **Workshop Mode** | When triggered by a school class code, scopes the Kid's session to a teacher-managed credit pool |

We may add, change, or remove Service features. We will notify you at least 30 days in advance of any **material adverse change** to a feature you actively use. Minor improvements or bug fixes do not require notice.

### 4.1 What the Services rely on

The Services rely on:

- The **upstream `opencode` open-source CLI** ([anomalyco/opencode](https://github.com/anomalyco/opencode), MIT licensed)
- **DeepRouter**, our AI gateway, which routes requests to one or more of: Anthropic, OpenAI, Doubao, DeepSeek, or other large-language-model providers
- **AWS Sydney** for our backend and audit-log storage
- **Airwallex** for payment processing

If any of these third parties has an outage, the Services may be partially or fully unavailable. We will work to restore service promptly.

### 4.2 Beta / experimental features

We may label some features as "beta" or "experimental." These features may change without notice. We do not warrant their reliability. You use them at your own risk.

---

## 5. Stars Pack (billing)

### 5.1 How Stars Pack works

Stars Pack is a prepaid credit balance held in your Family Account.

- One round-trip with the AI (you ask something, the AI plans and acts) costs **1 to 30 Stars** depending on length and complexity. The cost is shown before you confirm the request.
- You buy Stars Pack credits in tiers: Starter ($10), Family ($30), Mega ($50), School ($100). Prices are in **Australian Dollars**.
- Stars **never expire**.
- Stars are **not refundable as cash** but can be reallocated between Kid Profiles in your Family Account.
- Stars are not transferable to a different Family Account.

### 5.2 Payment

We process payments via **Airwallex**. Your card or bank details are handled directly by Airwallex; we hold only a payment reference.

We do not auto-renew or auto-recharge. Each Stars Pack purchase is a one-time transaction you confirm.

### 5.3 Refunds

If you bought Stars Pack in the last 14 days and have not used them, email `support@airbotix.ai` for a refund to your original payment method. We will action within 14 days.

For other refund requests (faulty Service, billing error), contact `support@airbotix.ai`. We will assess each on the merits.

This refund policy does not affect your rights under Australian Consumer Law (see §13).

### 5.4 Workshop Credit Pool

If your Kid is using the Services as part of a school Workshop, the school may have a separate credit pool. In that case, your Family Stars are not consumed for activity within the Workshop.

---

## 6. AI-generated content

The Services include large-language-model AI which generates text and code in response to prompts.

You understand and agree:

- **AI output can be wrong.** Sometimes badly, sometimes subtly. Always review AI-generated code before relying on it.
- **AI output can be unexpected.** Even with our safety layer (kid-safe system prompt, content moderation, tool whitelist), an AI model can produce output we did not anticipate. We work hard to minimise this; we cannot eliminate it.
- **You own the projects your Kid creates.** Your Kid's HTML, CSS, JavaScript, and other files are yours. We claim no rights over them.
- **AI output is not copyrightable to us.** To the extent AI-generated content is included in your Kid's project, that content is provided to you under a permissive license; we do not assert rights over it.
- **We do not use your data to train AI models.** Not yours, not your Kid's. See [Privacy Policy](./privacy-policy.md) §3.

### 6.1 Acceptable use of AI output

You agree not to use AI output to:

- Generate or distribute content that infringes copyrights or other intellectual-property rights
- Harm any person, including but not limited to harassment, exploitation, or grooming
- Produce sexually explicit, hateful, or violent content
- Defraud or deceive anyone
- Bypass legal obligations (e.g., academic-integrity policies at your Kid's school)

---

## 7. Acceptable use

These rules apply to both Parents and Kids using the Services:

You agree NOT to:

- **Use the Services for any unlawful purpose**
- **Attempt to bypass safety measures** (the tool whitelist, the AI moderation layer, the parent audit log)
- **Use the Services to harm any minor** (including but not limited to grooming, harassment, or exposure to age-inappropriate content)
- **Generate or distribute CSAM** — there is no scenario in which we tolerate this. CSAM-related accounts are terminated and reported to authorities immediately.
- **Reverse-engineer the AI's safety prompts to harm a Kid**
- **Use the Services to violate the privacy of any individual**, including by extracting personal information about other Kids or families
- **Resell the Services**, sub-license them, or use them to build a competing AI mentor product without our written agreement
- **Use the Services to send spam** or unsolicited communications
- **Use automated scripts to access the Services** beyond the documented API behaviour
- **Attempt to exceed your Stars balance** or evade billing
- **Misrepresent your age** or the age of a Kid

If you violate these rules, we may suspend or terminate your access immediately (see §10).

### 7.1 Bring-your-own-key mode

If you elect to use the Kids OpenCode CLI in "bring-your-own-key" mode (supplying your own Anthropic / OpenAI key directly instead of using our DeepRouter gateway), you understand:

- Our server-side content moderation does not apply to your Kid's prompts in this mode
- You become directly responsible for compliance with your chosen provider's terms
- Our on-device safety layer (tool whitelist, system prompt) still applies, but is a thinner defence
- We strongly recommend this mode only for power-user families where the Parent is also technically capable

---

## 8. Workshop Mode (B2B school operator terms)

If your school or organisation operates Workshop Mode for multiple Kids:

- The school is the **operator-of-record** for the Workshop session
- A separate Workshop Services Agreement applies to the school
- Family privacy obligations under §6 of our [Privacy Policy](./privacy-policy.md) still apply to individual Kid data
- The school is responsible for obtaining parental consent for school-context use (in addition to anything we collect at Family Account signup)

Contact `partnerships@airbotix.ai` to set up a Workshop deployment.

---

## 9. Intellectual property

| | |
|---|---|
| **Airbotix-owned IP** | All software, designs, course content, AI safety prompts, brand marks (Airbotix, Kids in AI, Kids OpenCode) are owned by Airbotix Pty Ltd. License granted to you is non-exclusive and revocable on termination. |
| **Open-source components** | The Kids OpenCode CLI is built on `opencode` (MIT licensed) and `@opencode-ai/plugin` (MIT licensed). Your use of those components is governed by their respective licenses. |
| **Your projects** | You and your Kid own the content of any project you create using the Services. Airbotix does not claim ownership of your Kid's HTML/CSS/JS files. |
| **AI output** | See §6 |

You may use Airbotix's name and logo to identify the Services in your own communications, but not to imply endorsement of unrelated products without our written permission.

---

## 10. Suspension and termination

### 10.1 Termination by you

You may terminate at any time by closing your Family Account (see §3.3).

### 10.2 Termination by us

We may suspend or terminate your account if:

- You violate these Terms (especially the Acceptable Use rules in §7)
- Your account is implicated in a safety incident affecting a Kid
- You have not paid valid charges within 60 days of their due date
- Continued provision would expose Airbotix to legal liability
- The provider relationship (Anthropic / OpenAI / etc.) requires it

We will give you reasonable notice and an opportunity to fix the problem where this is safe and lawful. For safety-critical reasons (e.g., suspected CSAM, suspected danger to a minor), we may terminate immediately without notice and may notify authorities.

### 10.3 What happens after termination

After termination:
- Your Family + Kid data is deleted within 30 days (some audit-log records may be retained in encrypted archive per the [Privacy Policy](./privacy-policy.md) §2.2)
- Unused Stars Pack credits are forfeited (no cash refund) **except** where Airbotix terminates for reasons other than your breach, in which case we refund the pro-rata unused balance via Airwallex
- Your Kid's project files on your own computer remain on your computer — they were never on our servers
- Your obligations under §6, §7, §9, §11, §12, and §13 survive termination

---

## 11. Disclaimers

### 11.1 The Services are provided "as is"

To the maximum extent permitted by law (and subject to §13 — Australian Consumer Law), the Services are provided **as is** and **as available**, without warranties of any kind, whether express, implied, statutory, or otherwise.

We do not warrant that:
- The Services will be uninterrupted, error-free, or secure
- AI-generated content will be accurate, appropriate, or harmless
- The Services will meet your specific requirements
- Defects will be corrected

### 11.2 Safety layer is best-effort

We invest substantial effort in safety guardrails (kid-safe system prompts, content moderation, tool whitelisting, audit logs). However, large-language-model behaviour is probabilistic. We **cannot guarantee** that the AI will never produce content that you or your Kid finds inappropriate. The audit log gives you visibility; the redress process (§6 of the Privacy Policy) lets you report incidents.

---

## 12. Limitation of liability

To the maximum extent permitted by law (and subject to §13 — Australian Consumer Law):

- Airbotix's total cumulative liability to you for any cause of action arising out of or relating to these Terms or the Services is limited to **the greater of (a) the amount you have paid Airbotix in the 12 months immediately preceding the claim, or (b) A$200**.
- Airbotix is not liable for indirect, incidental, special, consequential, exemplary, or punitive damages, including loss of profits, loss of data, loss of goodwill, or business interruption.
- This limitation applies whether the claim is based on contract, tort (including negligence), statute, or any other legal theory.

These limitations are essential elements of the bargain between you and Airbotix. Without them we could not provide the Services at the prices we do.

---

## 13. Australian Consumer Law

Nothing in these Terms excludes, restricts, or modifies any guarantee, condition, right, or remedy that the Australian Consumer Law (ACL, in Schedule 2 of the Competition and Consumer Act 2010 (Cth)) confers on you, where to do so would contravene that law.

If the ACL applies and we breach a non-excludable guarantee, our liability is limited (where the ACL allows us to do so) to:

- In respect of services: re-supplying the services or paying the cost of re-supplying them
- In respect of goods (where applicable): replacement, repair, or refund

---

## 14. Indemnity

You agree to indemnify and hold harmless Airbotix Pty Ltd, its officers, employees, and contractors from any claims, damages, liabilities, costs, or expenses (including reasonable legal fees) arising out of:

- Your or your Kid's violation of these Terms
- Your or your Kid's violation of any law or third-party right
- Content you or your Kid submit to or generate using the Services (including AI prompts) that violates law or third-party rights
- Your operation in bring-your-own-key mode (per §7.1)

This obligation does not apply where the loss results from Airbotix's negligence or intentional wrongdoing.

---

## 15. Changes to these Terms

We may update these Terms from time to time.

- **Material changes** affecting your rights or obligations: we email all active Family Accounts at least **30 days in advance**. If you do not agree, you may close your account before the effective date and receive a pro-rata refund of unused Stars.
- **Minor clarifications or corrections**: we update the Terms and the "last updated" date; continued use after the change indicates acceptance.

The current version of these Terms is always at airbotix.ai/terms.

---

## 16. Governing law and dispute resolution

### 16.1 Governing law

These Terms are governed by the laws of **New South Wales, Australia** and the Commonwealth of Australia.

### 16.2 Court jurisdiction

For any dispute that cannot be resolved by direct discussion or alternative dispute resolution (see §16.3), you and Airbotix agree to submit to the **non-exclusive jurisdiction of the courts of New South Wales**. "Non-exclusive" means you may also bring proceedings in any other court that has jurisdiction over you under applicable law (relevant for international users).

### 16.3 Alternative dispute resolution

Before commencing court proceedings, both parties agree to:

1. **Notify the other party in writing** of the dispute, including a clear description and the relief sought (email to `legal@airbotix.ai` for notice to Airbotix)
2. **Attempt direct negotiation** for at least 30 days
3. **If unresolved**, attempt mediation through a mediator agreed between the parties (or, failing agreement, appointed by the Australian Mediation Association). Mediation is non-binding.

The above process does not prevent either party from seeking urgent injunctive or interim relief from a court.

---

## 17. Severability

If any provision of these Terms is held by a court to be unenforceable, the remaining provisions remain in full force, and the unenforceable provision is to be replaced by an enforceable provision that closely matches the intent of the original.

---

## 18. No waiver

A delay or failure by Airbotix to enforce a right under these Terms does not waive that right.

---

## 19. Entire agreement

These Terms, together with the [Privacy Policy](./privacy-policy.md), the [Parental Consent](./parental-consent.md), and any product-specific terms you accept at sign-up, constitute the entire agreement between you and Airbotix regarding the Services. They supersede any prior agreement on the same subject.

---

## 20. Contact

| Topic | Email |
|---|---|
| General support | support@airbotix.ai |
| Billing | billing@airbotix.ai |
| Privacy | privacy@airbotix.ai |
| Security / incidents | security@airbotix.ai |
| Partnerships / Workshop deployments | partnerships@airbotix.ai |
| Legal / formal notice | legal@airbotix.ai |
| Postal | Airbotix Pty Ltd · [REGISTERED ADDRESS] · NSW Australia |

---

## Revision history

| Version | Date | Note |
|---|---|---|
| 0.1 | 2026-05-15 | Engineering-side draft. Awaiting AU lawyer confirmation. |

---

## Notes for Lightman (delete before publishing)

Bracketed placeholders to fill before publication:
- `[ACN]` — Airbotix Pty Ltd ACN
- `[REGISTERED ADDRESS, NSW Australia]` — current registered office

Lawyer-review checklist (from AU-6 in `kids-opencode/docs/compliance/au-lawyer-pass.md`):
- §12 Limitation of liability — confirm the A$200 / 12-month-fees cap is the right floor under NSW law for an AU consumer product (probably yes; ACL non-excludable guarantees prevent over-limitation)
- §13 ACL — confirm the carve-out is the standard language; verify ACL definitions are current as of date of publication
- §14 Indemnity — confirm the indemnity is enforceable for consumer-grade contracts; consumer law may carve out parts
- §16 Dispute resolution — confirm the 30-day negotiation + mediation precondition is enforceable and not unconscionable for a kid-product
- §10 Termination — confirm the immediate-termination-for-safety provisions are not over-broad
- §6 AI content — confirm the "AI output is provided under permissive license" claim is the right framing

Optional lawyer additions to discuss:
- Whether to add an arbitration clause for adult-account terms (AU users only — kids cannot waive litigation rights)
- Whether to require Parents to acknowledge §11.2 (safety layer is best-effort) with a separate click in the onboarding flow
- Whether to add a class-action-waiver clause (controversial under ACL)
