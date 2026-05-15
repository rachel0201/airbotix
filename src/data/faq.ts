export const faqCategories = [
  {
    id: 'general',
    title: 'General',
    icon: '📚',
    items: [
      {
        question: 'What is Airbotix?',
        answer:
          'Airbotix builds AI coding programs for K-12 students. We deliver group classes, 1-on-1 tutoring, and our own kids-safe AI coding tool called Kids OpenCode. We are an Australian company based in Brisbane.',
      },
      {
        question: 'What ages do you teach?',
        answer:
          'Ages 8–17. Younger kids (8-11) focus on AI creative tools — image, story, music, video. Middle schoolers (12-15) start AI coding with our Kids OpenCode platform. Older students (15-17) build real portfolio projects, prep for hackathons, and develop university-ready work.',
      },
      {
        question: 'Do students need prior coding experience?',
        answer:
          "No prior experience needed. We don't run traditional Python/Java syntax classes. Our approach teaches kids how to direct AI to write code — same way professional engineers work today.",
      },
      {
        question: 'Online or in-person?',
        answer:
          'Group classes and 1-on-1 are online (Zoom). School partnerships are in-person at the school. Holiday intensives can be either, depending on demand.',
      },
      {
        question: 'Who are the instructors?',
        answer:
          "Senior Airbotix instructors with AI fluency and teaching experience. We screen for both technical skill (we're an AI-coding company, after all) and ability to make complex things make sense to kids.",
      },
    ],
  },
  {
    id: 'group-classes',
    title: 'Group Classes',
    icon: '👥',
    items: [
      {
        question: "What's the difference between Weekly Term, Holiday Intensive, and School Partnership?",
        answer:
          'Same curriculum, three rhythms. Weekly Term = 8-10 weeks, one session per week (term-aligned). Holiday Intensive = 3-5 days in school holidays, compressed deep dive. School Partnership = year-long program co-taught with your school staff. Most families pick one format; some combine.',
      },
      {
        question: 'How many kids per class?',
        answer: '3-6 kids per class. Small enough that every kid gets attention, big enough for collaborative learning.',
      },
      {
        question: 'What if my kid misses a class?',
        answer:
          'Every session is recorded. Your kid catches up on the recording, then gets a 15-min 1-on-1 catch-up before the next live class. No extra cost up to 2 missed sessions per term.',
      },
      {
        question: 'Is there a trial class?',
        answer:
          'Yes. Book a free 15-min consult first. If it sounds right, we offer a single trial class at the single-class rate, refundable against the term fee if you continue.',
      },
      {
        question: "What if there aren't enough kids to start a cohort?",
        answer:
          "Minimum 3 kids to start. If a cohort doesn't fill within 2 weeks of the planned start, we either roll your spot to the next term or refund in full.",
      },
      {
        question: 'Does my kid need a laptop?',
        answer:
          "Yes. Any laptop with Chrome or Firefox works. We don't require any install for AI Creative Lab. For AI Coding Studio we use Kids OpenCode in the browser (no install needed at V0).",
      },
    ],
  },
  {
    id: '1-on-1',
    title: '1-on-1 Tutoring',
    icon: '🎯',
    items: [
      {
        question: 'How is 1-on-1 different from group classes?',
        answer:
          "1-on-1 is fully personalised to your kid's level, interest, and pace. Better for kids who already have a specific goal (build a website, prep for hackathon, finish a school project with AI help) or who are too advanced/beginner for a cohort.",
      },
      {
        question: 'How much does it cost?',
        answer:
          'A$70 per single hour-long session, A$650 for a 10-pack (A$65/hour, save A$50), A$1,200 for a 20-pack (A$60/hour, save A$200). Sessions unused in a pack roll over for 12 months.',
      },
      {
        question: 'Same instructor each time?',
        answer:
          "Yes. We match your kid with one senior instructor for continuity. We only switch if there's a scheduling conflict and you approve.",
      },
      {
        question: 'How do I book?',
        answer:
          'Book a free 15-min consult first to figure out goals and the right instructor. Then schedule sessions via our booking system (Cal.com integration). Sessions paid up-front via Airwallex.',
      },
      {
        question: 'Can sessions be more or less than 60 min?',
        answer:
          '60 or 90 mins are the standard options. Most kids find 60 mins is the sweet spot for focus. For deep project work, 90 mins (1.5x charge) works better.',
      },
    ],
  },
  {
    id: 'kids-opencode',
    title: 'Kids OpenCode Platform',
    icon: '🛡️',
    items: [
      {
        question: 'What is Kids OpenCode?',
        answer:
          "Our flagship product — the first AI coding tool designed specifically for K-12 students. It's an AI agent (similar in shape to Cursor or Claude Code, which professionals use), but rebuilt with kid-safe defaults, parent visibility, and curriculum integration. Launching 2026 Q3.",
      },
      {
        question: 'How is it different from giving my kid ChatGPT?',
        answer:
          "5 mechanisms ChatGPT doesn't have: (1) Every AI conversation + action is replayable in your parent dashboard. (2) Kid-safe system prompts are injected server-side (kids can't bypass). (3) The AI is sandboxed — no shell access, no external network. (4) Kids work inside guided Missions with structure, not an empty chat box. (5) Kid creations are private by default; sharing needs review.",
      },
      {
        question: 'When will it launch?',
        answer:
          'V0 launches 2026 Q3-Q4. Waitlist families get early access + 50% off the first 3 months of platform credits.',
      },
      {
        question: 'Will it replace classes and 1-on-1?',
        answer:
          "No — they're complementary. Classes and 1-on-1 = live human teaching. Platform = the always-on AI tool kids use between classes to actually practise + build. Middle-schoolers (12-15) especially benefit from having both.",
      },
      {
        question: 'Will the platform cost extra?',
        answer:
          "Yes. Pricing is pay-as-you-go via \"Stars\" (our credit system). Classes and 1-on-1 include some platform credits. We'll publish exact pricing closer to launch.",
      },
    ],
  },
  {
    id: 'safety',
    title: 'Trust & Safety',
    icon: '🔒',
    items: [
      {
        question: 'What AI models do you use?',
        answer:
          'Claude (Anthropic) is our main model for AI tutoring + agent reasoning. We also use OpenAI, ElevenLabs (voice), Suno (music), Runway (video), and Flux/SDXL (image). All routed through our own DeepRouter gateway which adds kid-safe system prompts and metering. Full list on the About page.',
      },
      {
        question: 'How do I see what my kid is doing with AI?',
        answer:
          "Through your parent dashboard, every AI conversation, every code change, every tool the AI used is replayable. You'll get monthly progress summaries by email as well.",
      },
      {
        question: "What happens to my kid's data?",
        answer:
          'AU user data stays in AWS Sydney (ap-southeast-2). We never sell data, never use kid project files to train AI models, never show ads. Full details on our Privacy Policy page.',
      },
      {
        question: 'Can I delete everything?',
        answer:
          "Yes. One-click data export (all your kid's work) and one-click account deletion. We respond within 14 days. See Privacy Policy for the exact mechanism.",
      },
      {
        question: 'What if my kid sees inappropriate content from the AI?',
        answer:
          'We have double-layer safety filters — DeepRouter server-side kid-safe prompts + platform-level classifier. If something slips through, you can flag it from the audit replay and we investigate within 24 hours. Zero content safety incidents is a hard target.',
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Pricing & Payments',
    icon: '💳',
    items: [
      {
        question: 'How much does everything cost?',
        answer:
          'Group Classes: A$480 per 8-week term (AI Creative Lab) or A$600 per 10-week term (AI Coding Studio). 1-on-1: from A$70/hour, with discounts on 10-pack and 20-pack. Platform: pay-as-you-go Stars, pricing TBD before 2026 Q3 launch.',
      },
      {
        question: 'How do I pay?',
        answer:
          'All payments are processed via Airwallex (Australian payment provider with strong cross-border FX). You can pay by card. Receipts emailed immediately.',
      },
      {
        question: 'Do you offer refunds?',
        answer:
          "Group Classes: full refund if cohort doesn't fill (we need min 3 kids to start). After cohort starts: pro-rata refund for first 2 weeks. 1-on-1 packs: unused sessions refundable for 30 days. See Terms of Service for exact rules.",
      },
      {
        question: 'Discounts for siblings or schools?',
        answer:
          'Sibling discount: 15% off for the second kid in the same family. School partnership: discount scales with student count, contact us. Single-parent or financial hardship: we have a small bursary fund, email us.',
      },
    ],
  },
] as const

export type FaqCategory = (typeof faqCategories)[number]
export type FaqItem = FaqCategory['items'][number]
