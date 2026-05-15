import { Link } from 'react-router-dom'

const tracks = [
  {
    tone: 'coral',
    tag: 'PLATFORM',
    title: 'Kids OpenCode',
    desc: 'Our flagship AI coding tool, designed specifically for K-12. Parent-visible, sandboxed, curriculum-driven. Currently in waitlist — launching 2026 Q3.',
    cta: 'Join waitlist →',
    href: '/programs/platform',
    sticker: { label: 'FLAGSHIP', color: 'sunshine' },
  },
  {
    tone: 'sunshine',
    tag: 'WORKSHOPS',
    title: 'School & holiday camps',
    desc: '1–3 day intensive AI & robotics workshops. mBots, sensors, generative AI. Run in real Australian schools today.',
    cta: 'View workshops →',
    href: '/programs/workshops',
    sticker: { label: 'POPULAR', color: 'coral', alt: true },
  },
  {
    tone: 'bubblegum',
    tag: '1-ON-1',
    title: 'Private AI tutoring',
    desc: 'One-on-one online sessions with senior instructors. Subjects from AI image creation to real project building. From A$80/hour.',
    cta: 'Book a session →',
    href: '/programs/one-on-one',
    sticker: { label: 'NEW', color: 'mint' },
  },
  {
    tone: 'sky',
    tag: 'CLASSES',
    title: 'Small-group weekly classes',
    desc: 'Term-based small-group classes (3–6 kids). AI Creative Lab for ages 8–11. AI Coding Studio for ages 12–17.',
    cta: 'View cohorts →',
    href: '/programs/classes',
    sticker: null,
  },
] as const

const Programs = () => {
  return (
    <div className="bg-canvas">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-canvas">
        <div className="blob-bg bg-brand-coral" style={{ width: 480, height: 480, top: -120, right: -180, opacity: 0.25 }} aria-hidden="true" />
        <div className="blob-bg bg-brand-sky" style={{ width: 360, height: 360, bottom: -120, left: -160, opacity: 0.25 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="eyebrow">OUR PROGRAMS</span>
            <h1 className="hero-display">
              Four ways kids learn <span className="squiggle-word text-brand-coral">AI</span> with us.
            </h1>
            <p className="lead-text mt-7">
              Workshops, weekly classes, 1-on-1 tutoring, and our own kids-safe AI coding platform.
              Pick what fits your kid&rsquo;s age, schedule, and goals — they all share the same
              curriculum, design philosophy, and safety standards.
            </p>
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="py-16 md:py-20 bg-canvas relative overflow-hidden">
        <div className="blob-bg bg-brand-sunshine" style={{ width: 420, height: 420, top: -120, right: -180, opacity: 0.30 }} aria-hidden="true" />
        <div className="blob-bg bg-brand-mint" style={{ width: 360, height: 360, bottom: -120, left: -180, opacity: 0.25 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {tracks.map((t) => (
              <Link key={t.tag} to={t.href} className={`program-card-${t.tone} no-underline`}>
                {t.sticker && (
                  <span
                    className={`sticker-${t.sticker.color}${'alt' in t.sticker && t.sticker.alt ? ' alt' : ''}`}
                    style={{ position: 'absolute', top: 16, right: 16 }}
                  >
                    {t.sticker.label}
                  </span>
                )}
                <div className="pc-blob" />
                <div className="relative z-10">
                  <div className="pc-tag">{t.tag}</div>
                  <h3 className="pc-title">{t.title}</h3>
                  <p className="pc-desc">{t.desc}</p>
                </div>
                <div className="pc-cta relative z-10">{t.cta}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Not sure which fits — free consult CTA */}
      <section className="py-20 md:py-24 bg-wash-sky">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="card-base max-w-3xl mx-auto text-center">
            <span className="eyebrow eyebrow-sky">NOT SURE WHICH ONE?</span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-ink leading-tight mt-3 mb-4">
              Book a free 15-minute consult.
            </h2>
            <p className="text-[16px] text-ink-soft leading-relaxed mb-7 max-w-xl mx-auto">
              Tell us your kid&rsquo;s age, interests, and schedule. We&rsquo;ll recommend the best fit —
              and there&rsquo;s no obligation to sign up.
            </p>
            <Link to="/book" className="btn-pill-primary">Book a Free Consult</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Programs
