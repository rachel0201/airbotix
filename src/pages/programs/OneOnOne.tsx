import { Link } from 'react-router-dom'

const subjects = [
  {
    tone: 'coral',
    title: 'AI Image, Story & Music',
    body: 'For ages 8-11. Use AI tools to design characters, write illustrated stories, generate music. Output a personal storybook + media bundle.',
  },
  {
    tone: 'sunshine',
    title: 'AI Coding Foundations',
    body: 'For ages 11+. Direct an AI to build websites, small apps, games. Read the code, debug, deploy. Language follows the project — usually HTML/CSS/JS first.',
  },
  {
    tone: 'bubblegum',
    title: 'AI Agent Building',
    body: 'For ages 13+. Build agentic projects (mini Cursor-style tools, task automators). Understand LLM API, tool use, simple agent loops.',
  },
  {
    tone: 'mint',
    title: 'School STEM Project Co-pilot',
    body: 'Tackle the school&rsquo;s actual STEM / Digital Tech assignment with AI assistance. Parents love this one — directly improves grades + portfolio.',
  },
  {
    tone: 'sky',
    title: 'Hackathon Prep',
    body: 'For ages 13+. Train for upcoming hackathons. Project ideation, scoping, pitching, building under time pressure.',
  },
  {
    tone: 'coral',
    title: 'University Portfolio Build',
    body: 'For ages 15+. Build the AI/coding portfolio universities want. Real projects with URLs to share, written explanation of impact.',
  },
] as const

const pricing = [
  {
    tone: 'sky',
    label: 'Single Session',
    price: 'A$80',
    unit: '/ hour',
    note: 'Try before committing. Same instructor for follow-ups.',
    cta: 'Book single session',
    href: '/book',
    highlight: false,
  },
  {
    tone: 'coral',
    label: '10-Session Pack',
    price: 'A$750',
    unit: 'A$75 / hour',
    note: 'Best for steady weekly progress. Save A$50.',
    cta: 'Buy 10-pack',
    href: '/book',
    highlight: true,
  },
  {
    tone: 'bubblegum',
    label: '20-Session Pack',
    price: 'A$1,400',
    unit: 'A$70 / hour',
    note: 'Best for a full term + deep project work. Save A$200.',
    cta: 'Buy 20-pack',
    href: '/book',
    highlight: false,
  },
] as const

const howItWorks = [
  { step: '01', title: 'Free 15-min consult', body: 'We figure out goals, level, schedule — no obligation.' },
  { step: '02', title: 'Match with instructor', body: 'Senior Airbotix instructor, vetted in AU + AI fluency.' },
  { step: '03', title: 'Weekly Zoom sessions', body: '60–90 mins. We keep notes + project files in your kid&rsquo;s portfolio.' },
  { step: '04', title: 'Monthly parent update', body: 'Short video + written summary of progress. You always know where things stand.' },
] as const

const OneOnOne = () => {
  return (
    <div className="bg-canvas">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-canvas">
        <div className="blob-bg bg-brand-bubblegum" style={{ width: 480, height: 480, top: -120, right: -180, opacity: 0.25 }} aria-hidden="true" />
        <div className="blob-bg bg-brand-sunshine" style={{ width: 360, height: 360, bottom: -120, left: -160, opacity: 0.25 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-bubblegum">1-ON-1 TUTORING</span>
            <h1 className="hero-display">
              Private AI coding, <span className="squiggle-word text-brand-bubblegum">on your kid&rsquo;s schedule.</span>
            </h1>
            <p className="lead-text mt-7">
              One senior instructor. One kid. One real project at a time. Bring an idea, leave with
              something they can actually share — a website, an app, a story, a hackathon entry.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-9">
              <Link to="/book" className="btn-pill-primary">Book a Free Consult</Link>
              <Link
                to="#pricing"
                className="inline-flex items-center justify-center bg-canvas text-ink text-[15px] font-semibold py-[12px] px-7 rounded-full border-2 border-ink/15 hover:border-ink/30 transition-colors no-underline"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 md:py-32 bg-wash-sky">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <span className="eyebrow eyebrow-sky">PRICING</span>
            <h2 className="section-heading">Pay-as-you-go, or save with a pack.</h2>
            <p className="lead-text mt-5">
              Same instructor across all sessions. Cancel anytime. Stars unused in a pack roll over for 12 months.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pricing.map((p) => (
              <div
                key={p.label}
                className={`relative rounded-3xl bg-canvas p-8 shadow-card-soft border-2 ${p.highlight ? 'border-brand-coral' : 'border-hairline'}`}
              >
                {p.highlight && (
                  <span className="sticker-coral" style={{ position: 'absolute', top: -16, left: 28 }}>
                    BEST VALUE
                  </span>
                )}
                <div className={`text-[12px] font-bold uppercase tracking-[0.10em] text-brand-${p.tone}`}>
                  {p.label}
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[44px] font-bold text-ink leading-none">{p.price}</span>
                  <span className="text-[14px] text-slate2">{p.unit}</span>
                </div>
                <p className="text-[14px] text-ink-soft mt-4 leading-relaxed">{p.note}</p>
                <Link
                  to={p.href}
                  className={`mt-7 inline-flex items-center justify-center w-full font-semibold py-[12px] px-6 rounded-full transition-colors no-underline ${p.highlight ? 'btn-pill-primary' : 'bg-canvas text-ink border-2 border-ink/15 hover:border-ink/30'}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="py-24 md:py-32 bg-canvas relative overflow-hidden">
        <div className="blob-bg bg-brand-mint" style={{ width: 420, height: 420, bottom: -120, right: -180, opacity: 0.25 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <span className="eyebrow eyebrow-mint">SUBJECTS</span>
            <h2 className="section-heading">Pick the path that matches your kid&rsquo;s goals.</h2>
            <p className="lead-text mt-5">
              We&rsquo;ll tailor the sessions to one of these — or mix two if it makes sense. Most kids
              find their lane within the first 2–3 sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((s) => (
              <div key={s.title} className="card-base relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-grad-${s.tone}`} />
                <h3 className="text-[19px] font-bold text-ink mt-3 mb-3 leading-tight">{s.title}</h3>
                <p className="text-[14px] text-ink-soft leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 md:py-32 bg-wash-mint">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <span className="eyebrow eyebrow-coral">HOW IT WORKS</span>
            <h2 className="section-heading">From first call to weekly rhythm.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {howItWorks.map((h) => (
              <div key={h.step} className="card-base relative">
                <div className="text-[40px] font-bold text-brand-coral/25 leading-none">{h.step}</div>
                <h3 className="text-[18px] font-bold text-ink mt-3 mb-2 leading-tight">{h.title}</h3>
                <p className="text-[14px] text-ink-soft leading-relaxed">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="promo-card-coral">
            <div
              className="absolute rounded-full pointer-events-none"
              style={{ top: -160, right: -160, width: 460, height: 460, background: 'rgba(255,255,255,0.12)' }}
              aria-hidden="true"
            />
            <span className="sticker-sunshine alt" style={{ position: 'absolute', top: 36, right: 56 }}>
              FREE CONSULT
            </span>
            <div className="relative">
              <span className="text-[13px] font-bold uppercase tracking-[0.10em] text-white/85">
                NEXT STEP
              </span>
              <h2 className="text-[40px] md:text-[52px] font-bold leading-[1.05] tracking-tight mt-3 mb-5 max-w-2xl">
                Book a 15-min call. We&rsquo;ll figure out the right fit.
              </h2>
              <p className="text-white/90 text-[18px] max-w-xl mb-9 leading-relaxed">
                No obligation. Just a quick chat about your kid&rsquo;s age, interest, and schedule —
                we&rsquo;ll recommend whether 1-on-1 is right, or whether classes / workshops might fit better.
              </p>
              <Link to="/book" className="btn-pill-on-color">
                Book Free Consult
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default OneOnOne
