import { Link } from 'react-router-dom'

const cohorts = [
  {
    tone: 'coral',
    slug: 'ai-creative-lab',
    eyebrow: 'AGES 8-11',
    title: 'AI Creative Lab',
    promise: 'Each kid leaves with their own AI-collaborated storybook + media bundle.',
    intro: 'Hands-on creative track for younger kids. No coding required. Kids use AI to generate images, write stories, compose music, make voice-overs, and animate short videos. The output is theirs — illustrated, narrated, and shareable.',
    skills: [
      'AI image generation (characters, scenes, styles)',
      'AI storytelling (plot, dialogue, structure)',
      'AI voice & narration (multi-character TTS)',
      'AI music & theme songs',
      'Short animated clips & GIFs',
      'Prompt literacy & critical-eye habits (embedded throughout)',
    ],
    format: 'Online (Zoom). 3–6 kids per cohort. 8 weekly sessions, ~75 min each.',
    tools: 'Powered by Claude (story), Flux/SDXL (image), ElevenLabs (voice), Suno (music), Runway (video) — all routed through our DeepRouter gateway with kid-safe defaults.',
    price: 'A$480',
    priceNote: '8 sessions · A$60 per session',
    cta: 'Reserve a seat',
  },
  {
    tone: 'bubblegum',
    slug: 'ai-coding-studio',
    eyebrow: 'AGES 12-17',
    title: 'AI Coding Studio',
    promise: 'Each kid leaves with 1–2 deployed projects (URLs they can share) and real working-with-AI skills.',
    intro: 'For older kids ready to build real things. No traditional Python syntax class — we teach how to direct AI to write code, read the output, debug, and deploy. Language follows the project (usually HTML/CSS/JS to start, because results are visible immediately).',
    skills: [
      'Directing an AI agent to write code (Cursor / Claude / Kids OpenCode)',
      'Reading + debugging AI-generated code',
      'Git / GitHub basics',
      'Deploying to Vercel (real URL kids can show friends)',
      'AI Agent foundations (LLM API, tool use, simple agentic projects)',
      'Bridge to the Airbotix Platform (Kids OpenCode early access)',
    ],
    format: 'Online (Zoom). 3–6 kids per cohort. 10 weekly sessions, ~90 min each.',
    tools: 'Kids start in our own Kids OpenCode for safety + scaffolding. Advanced students (15+) get an intro to Cursor and Claude Code in their final sessions.',
    price: 'A$600',
    priceNote: '10 sessions · A$60 per session',
    cta: 'Reserve a seat',
  },
] as const

const faqs = [
  {
    q: 'What if my kid misses a class?',
    a: 'We record every session. Your kid catches up on the recording, then we do a 15-min 1-on-1 catch-up before the next live class. No extra cost up to 2 missed sessions per term.',
  },
  {
    q: 'Is there a trial class?',
    a: 'Yes. Book a free 15-min consult first — if it sounds right, we offer a single trial class at A$60 (single-class rate), refundable against the term fee if you continue.',
  },
  {
    q: 'What if there aren&rsquo;t enough kids to start a cohort?',
    a: 'We require a minimum of 3 kids to start. If a cohort doesn&rsquo;t fill within 2 weeks of the planned start date, we either roll your spot to the next term or refund in full.',
  },
  {
    q: 'Do kids need their own laptop?',
    a: 'Yes. Any laptop/desktop with Chrome or Firefox works. We don&rsquo;t require installing anything for AI Creative Lab. For AI Coding Studio, we use Kids OpenCode in the browser (no install needed at V0).',
  },
] as const

const Classes = () => {
  return (
    <div className="bg-canvas">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-canvas">
        <div className="blob-bg bg-brand-coral" style={{ width: 480, height: 480, top: -120, right: -180, opacity: 0.25 }} aria-hidden="true" />
        <div className="blob-bg bg-brand-bubblegum" style={{ width: 360, height: 360, bottom: -120, left: -160, opacity: 0.25 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-coral">WEEKLY CLASSES</span>
            <h1 className="hero-display">
              Small-group AI classes. <span className="squiggle-word text-brand-coral">Real projects.</span>
            </h1>
            <p className="lead-text mt-7">
              Two age-tiered cohorts. 3–6 kids per class, weekly online sessions, term-based.
              Every class ends with something the kid can actually show their family — an
              illustrated story, a deployed website, a working AI tool.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-9">
              <Link to="/book" className="btn-pill-primary">Book a Free Consult</Link>
              <Link
                to="#cohorts"
                className="inline-flex items-center justify-center bg-canvas text-ink text-[15px] font-semibold py-[12px] px-7 rounded-full border-2 border-ink/15 hover:border-ink/30 transition-colors no-underline"
              >
                See cohorts
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cohorts */}
      <section id="cohorts" className="py-24 md:py-32 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 space-y-8">
          {cohorts.map((c) => (
            <div key={c.slug} className="rounded-3xl bg-canvas shadow-card-soft border border-hairline overflow-hidden">
              <div className={`h-2 bg-grad-${c.tone}`} />
              <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7">
                  <span className={`text-[12px] font-bold uppercase tracking-[0.12em] text-brand-${c.tone}`}>
                    {c.eyebrow}
                  </span>
                  <h2 className="text-[34px] md:text-[42px] font-bold text-ink leading-tight mt-2 mb-4">{c.title}</h2>
                  <p className={`text-[16px] italic text-brand-${c.tone} mb-5 leading-relaxed`}>
                    &ldquo;{c.promise}&rdquo;
                  </p>
                  <p className="text-[16px] text-ink-soft leading-relaxed mb-7">{c.intro}</p>

                  <h3 className="text-[14px] font-bold uppercase tracking-[0.10em] text-ink mb-3">What they&rsquo;ll learn</h3>
                  <ul className="space-y-2 mb-7">
                    {c.skills.map((s) => (
                      <li key={s} className="flex items-start gap-3 text-[15px] text-ink-soft leading-relaxed">
                        <span className={`text-brand-${c.tone} font-bold mt-0.5`}>✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <h4 className="text-[12px] font-bold uppercase tracking-[0.10em] text-slate2 mb-2">Format</h4>
                      <p className="text-[14px] text-ink leading-relaxed">{c.format}</p>
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold uppercase tracking-[0.10em] text-slate2 mb-2">Tools we use</h4>
                      <p className="text-[14px] text-ink leading-relaxed">{c.tools}</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className={`rounded-2xl bg-wash-${c.tone === 'bubblegum' ? 'mint' : 'sky'}/40 p-7 sticky top-24`}>
                    <div className="text-[12px] font-bold uppercase tracking-[0.10em] text-slate2">Price per term</div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-[44px] font-bold text-ink leading-none">{c.price}</span>
                    </div>
                    <p className="text-[13px] text-ink-soft mt-2 mb-6">{c.priceNote}</p>

                    <div className="space-y-3 mb-6 text-[13px] text-ink-soft">
                      <div className="flex items-center justify-between">
                        <span>Min cohort size</span>
                        <span className="text-ink font-semibold">3 kids</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Max cohort size</span>
                        <span className="text-ink font-semibold">6 kids</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Next start date</span>
                        <span className="text-ink font-semibold">TBA</span>
                      </div>
                    </div>

                    <Link to="/book" className="btn-pill-primary w-full text-center block">{c.cta}</Link>
                    <p className="text-[12px] text-slate2 mt-3 text-center">
                      Refundable if cohort doesn&rsquo;t fill.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 md:py-32 bg-wash-mint">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <span className="eyebrow eyebrow-mint">FAQS</span>
            <h2 className="section-heading">Common questions.</h2>
          </div>

          <div className="space-y-4 max-w-3xl">
            {faqs.map((f) => (
              <div key={f.q} className="card-base">
                <h3 className="text-[17px] font-bold text-ink mb-3 leading-tight">{f.q}</h3>
                <p className="text-[15px] text-ink-soft leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="promo-card-coral">
            <div className="absolute rounded-full pointer-events-none" style={{ top: -160, right: -160, width: 460, height: 460, background: 'rgba(255,255,255,0.12)' }} aria-hidden="true" />
            <div className="relative">
              <span className="text-[13px] font-bold uppercase tracking-[0.10em] text-white/85">
                NEXT STEP
              </span>
              <h2 className="text-[40px] md:text-[52px] font-bold leading-[1.05] tracking-tight mt-3 mb-5 max-w-2xl">
                Reserve a seat in the next cohort.
              </h2>
              <p className="text-white/90 text-[18px] max-w-xl mb-9 leading-relaxed">
                Book a free 15-min consult — we&rsquo;ll figure out which cohort and term works for your
                kid, and walk you through what to expect.
              </p>
              <Link to="/book" className="btn-pill-on-color">Book Free Consult</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Classes
