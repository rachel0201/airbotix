<!--
Airbotix Pitch Deck — Pre-Seed
Format: Marp markdown (https://marp.app)

To render:
  npm install -g @marp-team/marp-cli
  marp pitch-deck.md -o pitch-deck.pdf      # PDF
  marp pitch-deck.md -o pitch-deck.pptx     # PowerPoint
  marp pitch-deck.md -o pitch-deck.html     # Web slides
  marp -p pitch-deck.md                     # Live preview server

Or install the "Marp for VS Code" extension and preview inline.
-->

---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  section {
    font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
    padding: 60px 80px;
  }
  h1 {
    font-size: 56px;
    color: #1a1a1a;
    margin-bottom: 24px;
  }
  h2 {
    font-size: 40px;
    color: #1a1a1a;
  }
  h3 {
    color: #2563eb;
  }
  .lead h1 {
    font-size: 72px;
  }
  .big-stat {
    font-size: 96px;
    font-weight: 700;
    color: #2563eb;
    line-height: 1;
  }
  .big-stat-label {
    font-size: 22px;
    color: #555;
  }
  blockquote {
    border-left: 4px solid #2563eb;
    color: #444;
    font-style: italic;
  }
  table {
    font-size: 22px;
  }
---

<!-- _class: lead -->
<!-- _paginate: false -->

# Airbotix

## Teaching the next generation to code with AI.

**Pre-Seed | May 2026**

Lightman, Co-Founder
Joe, Co-Founder & CTO (ex-Google)

<!--
Speaker notes:
Open with the one-liner. Don't over-explain on slide 1.
Investors should know: K-12 AI education company, AU-based, ex-Google CTO, raising pre-seed.
-->

---

# AI coding will be the next universal literacy.

| Era | Defining Skill |
|-----|----------------|
| 1900s | Reading & writing |
| 1980s | Operating a computer |
| 2000s | Using the internet |
| **2020s+** | **Coding with AI** |

Children born in 2020 graduate university in 2042.
By then, **AI fluency is table stakes for every knowledge profession.**

<!--
The thesis. Don't lead with "kids AI safety platform" — lead with the secular trend.
This is the page that decides whether the investor leans in or zones out.
-->

---

# The K-12 system is not ready.

### Kids
Generic LLMs are built for adults — no scaffolding, no progression, passive consumption.

### Parents
Know AI matters. No structured path. Tutoring is A$80–150/hr and not AI-native.

### Schools
AU curriculum mandates AI literacy. **Most schools have no implementation plan.**

<!--
Three audiences, three pains. Keep tight.
The "AU curriculum mandates" line is critical for AU VCs — local regulatory tailwind.
-->

---

# Massive market, opening now.

<div style="display: flex; gap: 40px; margin-top: 40px;">

<div>

### TAM
Global K-12 EdTech
**~US$300B+ by 2030**
AI/STEM segment 20%+ CAGR

</div>

<div>

### SAM
4M AU students × A$300–800/yr STEM spend
+ millions of overseas Chinese-speaking families
**A$200–600M serviceable**

</div>

<div>

### SOM (3yr)
**5,000–10,000 paying students**
Single-digit-million ARR
Path to 10× from there

</div>

</div>

<!--
Don't read the numbers aloud. Just point and say "growing fast, addressable from AU."
If asked source: refine with HolonIQ / IBISWorld in diligence.
-->

---

# Why now: four tailwinds converging.

1. **AI capability** — frontier LLMs can tutor at scale, in real time
2. **AI cost** — inference down 95% in 18 months → consumer pricing viable
3. **Curriculum reform** — AU Digital Technologies F-10 mandates AI literacy
4. **Parent demand** — post-ChatGPT, AI education jumped to top-3 household priority

> The category window is open now. In 5 years, the category leaders will be entrenched.

<!--
This slide is the "why this won't wait" argument. Time the four points.
-->

---

# Our approach: a 3-layer stack.

| | What | Status |
|---|---|---|
| **L1 — Curriculum** | In-school workshops + study tours, AI + robotics integrated | **Live** — 100+ students, 2 schools |
| **L2 — Platform** | Kids-native AI coding env. on Claude/OpenAI. Subscription + token margin. Parent dashboard. | **Building** — MVP next 12 mo |
| **L3 — Hackathons** | Quarterly student hackathons, university admissions partnerships | **Roadmap** — Year 2 |

> Workshops drive platform signups → Platform produces hackathon-ready students → Hackathon outcomes drive new workshops. **Compounding loop.**

<!--
Investors love a layered roadmap with one layer already shipping.
Emphasize: we did NOT start with software — we started with paying customers.
-->

---

# Business model: 4 streams, blended 65–75% GM.

| Stream | Pricing | Margin | Role |
|--------|---------|--------|------|
| B2C subscription | A$29–79/month/student | ~80% | Recurring base |
| LLM token resale | Markup on API cost | 30–50% | Margin upside |
| B2B school license | Annual per-school / per-student | ~85% | Anchor accounts |
| Workshops & hackathons | Per-event fees | ~50% | **CAC channel** |

> Workshops are not a cost center — they are our cheapest acquisition channel.
> Workshop-led CAC is materially below paid-digital benchmarks.

<!--
Be ready for: "Why is token resale a real margin and not commoditized?"
Answer: integrated into curriculum + parent UX, not raw API access.
-->

---

# Traction (honest).

<div style="display: flex; gap: 60px; margin-top: 60px; justify-content: center;">

<div style="text-align: center;">
<div class="big-stat">100+</div>
<div class="big-stat-label">Students taught</div>
</div>

<div style="text-align: center;">
<div class="big-stat">2</div>
<div class="big-stat-label">Partner schools</div>
</div>

<div style="text-align: center;">
<div class="big-stat">AU</div>
<div class="big-stat-label">Pilot market</div>
</div>

</div>

### What this proves
- Kids stay engaged with project-based AI curriculum
- Parents pay for AI coding outcomes
- Schools want recurring partners, not one-off vendors

<!--
This is the most important slide. DO NOT inflate.
Pre-seed VCs want honest small numbers + sharp learnings, not hockey-stick claims.
The "what this proves" line is what they actually buy.
-->

---

# Go-to-market: workshop-led flywheel.

```
Workshops  →  Subscriptions  →  Hackathons  →  Referrals  →  Workshops
```

**Stage 1 (now)** — Workshop graduates become the first platform cohort
**Stage 2 (Y1)** — Scale 2 → 20 AU schools; launch parent dashboard
**Stage 3 (Y2+)** — First overseas Chinese-family cohort; B2B school district sales; first university partnership

> Most competitors have CACs of A$200+ via paid digital.
> **Our CAC is workshop-led — structurally cheaper, structurally stickier.**

<!--
The flywheel is the durable moat. Most software-first competitors can't reproduce it.
-->

---

# Competition: AI-native + robotics + AU + cross-border.

|  | AI-native | Robotics | AU curriculum | Parent layer | Cross-border CN |
|--|:--:|:--:|:--:|:--:|:--:|
| Code.org | ✗ | ✗ | ✗ | ✗ | ✗ |
| Tynker | ✗ | ✗ | ✗ | partial | ✗ |
| Kira Learning (US) | ✓ | ✗ | ✗ | partial | ✗ |
| Replit | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Airbotix** | **✓** | **✓** | **✓** | **✓** | **✓** |

> Distribution + curriculum + cross-border GTM. Hard to copy from a software-first start.

<!--
The 5 columns are the moat. Be ready to defend each one.
-->

---

# Team.

### Lightman — Co-Founder
[TBD: 1-line title + 1-line credentials — fill before sending]

### Joe — Co-Founder & CTO
**Ex-Google Senior Software Engineer.** Brings frontier-grade engineering to a category where most competitors are pedagogy-first and software-thin.

**Hiring with this round**: Lead Curriculum Designer, Senior Engineer.
**Advisors lining up** across AU education, AI research, cross-border investment.

<!--
Joe ex-Google is the headline credential — every AU and CN VC will respect it.
Lightman section needs personal credentials before this goes out — see TBD.
-->

---

# 18-month plan & the ask.

### Raising A$[TBD] pre-seed for 18 months runway

<div style="margin-top: 30px;">

| Allocation | % |
|---|:--:|
| Product & engineering | 40% |
| Curriculum & content | 25% |
| Growth & partnerships | 20% |
| Hiring | 10% |
| Ops & compliance | 5% |

</div>

### Milestones
- Platform MVP live with pilot students as cohort 1
- **20 partner schools** in AU
- **1,000+ paying subscriptions**
- First overseas Chinese-family cohort
- First Airbotix Hackathon with university partner

> Path to A$1.5–3M ARR → ready for Seed.

<!--
Close confidently. Don't apologize for the small base — frame it as discipline.
-->

---

<!-- _class: lead -->
<!-- _paginate: false -->

# Build the AI literacy infrastructure for the next billion kids.

**Lightman** · lightman@airbotix.ai
**Joe** · joe@airbotix.ai

airbotix.ai

<!--
Closing. End on the vision, not the ask.
Have the BP, financial model, and demo ready in appendix / data room.
-->
