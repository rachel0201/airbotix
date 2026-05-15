# Compliance Statement

> Airbotix Pty Ltd's public statement of how we keep your kid safe and how we comply with the laws and supplier requirements that apply to a kid-AI product. This page satisfies the Anthropic AUP "Organizations Serving Minors" public-disclosure requirement.
>
> **Page lives at**: airbotix.ai/compliance
>
> **Last updated**: 2026-05-15 · **Version**: 0.1 (engineering-side draft pending qualified-AU-lawyer review)

---

## Reading time: 5 minutes

This page is for parents, regulators, partners, and curious kids. We avoid jargon. We also write more than a marketing page usually does, because we believe families deserve to know exactly what we do.

If you only have 30 seconds, skip to [§10 — the short version](#10-the-short-version).

---

## 1. Who we are

Airbotix Pty Ltd is an Australian company. We make AI-assisted coding curriculum and tools for K-12 kids. We run AI Workshops in schools (live since 2024) and we are now launching **Kids OpenCode**, a kid-safe command-line AI coding mentor for kids 12 and older, distributed through this website.

We operate in Australia. Our backend, database, and audit-log storage all live in AWS Sydney (`ap-southeast-2`). We are an APP entity under the Privacy Act 1988 (Cth).

---

## 2. What Kids OpenCode does

Kids OpenCode is a command-line program your family installs on your own computer. You start it in a terminal:

```
kids-opencode
```

A patient AI coding mentor wakes up. It asks what your kid wants to build. It plans the steps. Before every action (writing a file, reading a file, looking at MDN docs), it **asks for permission**. Your kid approves each step.

The mentor's job is to teach, not to do the work for the kid. It uses guided questions, not "here's the code, copy it." After three real attempts where the kid is genuinely stuck, it offers small fragments with explanations.

It does not run shell commands. It does not touch files outside the project folder. It does not fetch random URLs from the internet. It only reaches out to four documentation sites: MDN, web.dev, the W3C specs, and our own docs.

It never pretends to be a human. It never introduces adult topics. If the kid says something that sounds like self-harm, it stops the coding conversation and points them to Kids Helpline (1800 55 1800).

---

## 3. The safety layers, in plain English

There are three layers of safety. We rely on all three.

### Layer 1 — the kid-safe system prompt

Every conversation begins by telling the AI a set of rules about how to behave with a kid. We've published the actual rules at [github.com/kidsinai/kids-opencode/blob/main/config/system-prompt.md](https://github.com/kidsinai/kids-opencode/blob/main/config/system-prompt.md). It's about a page long. Read it.

### Layer 2 — the tool restrictions

Even if the AI tried to do something it shouldn't, our plugin (open-source, [github.com/kidsinai/kids-opencode/blob/main/packages/kids-plugin/](https://github.com/kidsinai/kids-opencode/blob/main/packages/kids-plugin/)) won't let it:
- Shell / command execution is removed entirely
- File access is restricted to the kid's project folder
- Web fetches are limited to 4 documentation sites
- Every tool use gets logged for the parent to see

### Layer 3 — the gateway

All AI prompts go through our gateway (DeepRouter). The gateway adds **server-side moderation** — input filters, output filters, and safety constraints that the AI model providers enforce server-side. We force "Zero Data Retention" on OpenAI calls (their strictest mode).

Each layer can catch something the others miss. Defense in depth.

---

## 4. What we collect, and what we don't

### We collect:
- Your email (to log you in)
- Your kid's age band ("12+", not their birthday)
- Your kid's display nickname (their choice, not their real name)
- Course Pack progress
- A summary of what AI tools your kid's sessions used (the audit log)

### We do NOT collect:
- Your kid's real name, birthday, school, or address (unless you specifically add them to a project — and we encourage you not to)
- Your kid's voice, face, or biometric data
- Your kid's location
- Your kid's project files — those stay on **your family's own computer**
- Your kid's behavioural data for advertising — we don't do advertising

### We never:
- Sell your data
- Use your kid's data or code to train AI models
- Show ads
- Embed third-party tracking pixels on kid-facing pages
- Build behavioural profiles of kids

Full details: [Privacy Policy](./privacy-policy.md).

---

## 5. Laws and regulators we work with

We operate primarily in Australia. The Australian laws and codes that apply to us:

| Law / Code | What it covers | Status |
|---|---|---|
| Privacy Act 1988 (Cth) and APPs | How we handle personal information | ✅ In force; we comply |
| Online Safety Act 2021 | Safety obligations for online services | ✅ In force; we comply. Kids OpenCode's primary purpose is education, which exempts us from the under-16 social-media ban. |
| Online Safety Amendment (Social Media Minimum Age) Act 2024 | Under-16 social-media ban (effective Dec 2025) | ✅ Education exemption applies to us; see §6 |
| Children's Online Privacy Code 2026 | Specific kid-data rules (effective Dec 2026) | 🟡 In draft; we have filed a public submission to the OAIC consultation; we will comply on day-one of commencement |
| Voluntary AI Safety Standard | 10 guardrails for AI products | ✅ We align our practice to all 10; see [github.com/kidsinai/kids-opencode/blob/main/docs/safety-assessment.md](https://github.com/kidsinai/kids-opencode/blob/main/docs/safety-assessment.md) |

Australian regulators we engage with:

| Regulator | When |
|---|---|
| Office of the Australian Information Commissioner (OAIC) | Privacy law enforcement; we have engaged with the COPC consultation |
| eSafety Commissioner | Online safety; we are prepared to respond to transparency notices |
| State school authorities (NSW Department of Education, etc.) | When we deploy to public schools (V1+ Workshop sales) |

Our [public submission to the Children's Online Privacy Code consultation (June 2026)](https://github.com/kidsinai/kids-opencode/blob/main/docs/compliance/au-oaic-copc-submission-draft.md) is published in full.

---

## 6. Is Kids OpenCode a "social media platform"?

**No.** Kids OpenCode is a coding tool, not a social network. Specifically:

- It runs on your family's own computer
- There is no friend graph, no follower network, no direct messaging
- There is no public profile, no algorithmic feed, no recommendation engine
- There is no advertising
- There is no engagement-optimised notification system
- The kid's project files stay on the family's computer

Under the Online Safety Amendment (Social Media Minimum Age) Act 2024, services whose **primary purpose is education** are exempt from the under-16 account ban. Kids OpenCode is unambiguously such a service: curriculum-aligned to the AU Digital Technologies F-10, mission-based learning structure, teacher-facing Workshop Mode.

We have signed a [standing Sole or Primary Purpose Statement](https://github.com/kidsinai/kids-opencode/blob/main/docs/compliance/au-sole-or-primary-purpose-statement.md) documenting this position.

---

## 7. AI providers we work with

All AI calls in the default mode go through our gateway (DeepRouter) to one of these providers:

| Provider | What we send | Their privacy policy |
|---|---|---|
| Anthropic (Claude) | Prompts, stripped of identifying metadata. Kid-safe system prompt enforced. | https://www.anthropic.com/legal/privacy |
| OpenAI (GPT) | Prompts, stripped of identifying metadata. Zero Data Retention enforced. | https://openai.com/policies/privacy-policy |
| DeepSeek | When configured; kid-safety constraints enforced. | [provider URL] |
| Doubao (火山方舟) | When configured; kid-safety constraints enforced. | [provider URL] |

Each provider's terms apply to their portion of the data flow. Our gateway adds protections on top.

**Bring-your-own-key mode (advanced)**: families that prefer can bypass DeepRouter and connect Kids OpenCode directly to their own Anthropic or OpenAI account. In that mode, server-side moderation is bypassed; only our client-side safety layer applies. We recommend the default mode for most families.

---

## 8. Your rights as a parent (or guardian)

You can, at any time:

- **See exactly what the AI did** in your kid's sessions, in the audit log on your Family Dashboard
- **Pause** your kid's account (stops all AI use, keeps data)
- **Delete** your kid's profile or your entire Family Account (full data deletion within 30 days)
- **Export** all your data as a machine-readable file
- **Withdraw consent** for any specific processing — full details in our [Parental Consent](./parental-consent.md)
- **Ask us a question** at `privacy@airbotix.ai` — we respond within 14 days

If you think we have not handled your data correctly, you can complain to the OAIC at https://www.oaic.gov.au/privacy/privacy-complaints.

---

## 9. Incidents and breaches

If something goes wrong and your kid's data is exposed in a "Notifiable Data Breach" under the Privacy Act:

1. We start our incident response runbook within minutes of detection
2. We work to contain the issue within 4 hours
3. We assess the impact with our lawyer within 24 hours
4. If serious harm is likely, we notify you (the parent) and the OAIC, ideally within 72 hours of awareness and no later than 30 days

Our incident response runbook is open for inspection at [github.com/kidsinai/kids-opencode/blob/main/docs/runbook/ndb-incident.md](https://github.com/kidsinai/kids-opencode/blob/main/docs/runbook/ndb-incident.md).

For kid-related incidents, we presume serious harm — meaning we err on the side of telling you even when the law might not strictly require it.

---

## 10. The short version

| Question | Answer |
|---|---|
| Where does my kid's code live? | On your family's own computer. We don't have it. |
| What do you keep? | Email, age band, nickname, an audit log of what the AI did. That's it. |
| Do you train AI on my kid's data? | No. Never. |
| Do you show ads? | No. Never. |
| Are you a social media platform? | No. Education tool with an exemption. |
| Where is the data stored? | AWS Sydney. Stays in Australia. |
| Can I see what the AI did? | Yes, in your Family Dashboard. |
| Can I delete everything? | Yes, in 30 days flat. |
| Who regulates you? | OAIC (privacy), eSafety (online safety), and we work with both. |
| What if it goes wrong? | Email privacy@airbotix.ai — we respond in 14 days. Or complain to the OAIC. |

---

## 11. Show your working — open compliance

We believe a kid-AI product should be auditable by parents, regulators, journalists, researchers, and anyone else who wants to look. Most of our compliance work is **public on GitHub**:

- Per-country compliance audits: [github.com/kidsinai/kids-opencode/tree/main/docs/compliance](https://github.com/kidsinai/kids-opencode/tree/main/docs/compliance)
- Red-team test set: [github.com/kidsinai/kids-opencode/blob/main/docs/red-team.md](https://github.com/kidsinai/kids-opencode/blob/main/docs/red-team.md)
- AI Safety Assessment: [github.com/kidsinai/kids-opencode/blob/main/docs/safety-assessment.md](https://github.com/kidsinai/kids-opencode/blob/main/docs/safety-assessment.md)
- Incident response runbook: [github.com/kidsinai/kids-opencode/blob/main/docs/runbook/ndb-incident.md](https://github.com/kidsinai/kids-opencode/blob/main/docs/runbook/ndb-incident.md)
- The actual kid-safety code (plugin): [github.com/kidsinai/kids-opencode/tree/main/packages/kids-plugin](https://github.com/kidsinai/kids-opencode/tree/main/packages/kids-plugin)
- This page's source: [github.com/Airbotix-AI/airbotix/blob/main/docs/legal/compliance-statement.md](https://github.com/Airbotix-AI/airbotix/blob/main/docs/legal/compliance-statement.md)

If any other kid-AI product is willing to publish their compliance posture at this level of detail, we'd love to compare notes.

---

## 12. Contact

| Topic | Email |
|---|---|
| Privacy | privacy@airbotix.ai |
| Security / incidents | security@airbotix.ai |
| Compliance questions / regulator inquiries | legal@airbotix.ai |
| General support | support@airbotix.ai |
| Postal | Airbotix Pty Ltd · [REGISTERED ADDRESS] · NSW Australia |

---

## Revision history

| Version | Date | Note |
|---|---|---|
| 0.1 | 2026-05-15 | Engineering-side draft. Awaiting AU lawyer confirmation. Will be deployed to airbotix.ai/compliance once the marketing site team renders it. |

---

## Notes for Lightman (delete before publishing)

Bracketed placeholders:
- `[REGISTERED ADDRESS]` — Airbotix Pty Ltd's registered office

Marketing team to-do:
- Render this Markdown into the React/Vite marketing site at `/compliance` route
- Make sure the page is indexable but not in the kids-facing nav (this is parent / regulator audience)
- All external GitHub links must be public; ensure `kidsinai/kids-opencode` is set to public **before** publishing this page. (Currently private — public-toggle gate is V0 launch readiness item.)
- Coordinate with the parent dashboard `Manage Consent` UI so kids/parents can click from there to here

Lawyer-review checklist:
- §2 The product description claims to be accurate — make sure no overstatement
- §5 Verify each regulator/law citation is current as of date of publication
- §10 The "short version" table is the document most parents will actually read — focus lawyer review here
- §11 Confirm GitHub-link disclosure of compliance practice doesn't create unintended legal hooks
