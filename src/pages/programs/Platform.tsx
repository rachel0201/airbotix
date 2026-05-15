import { Link } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { usePageMeta } from '../../hooks/usePageMeta'

const trustMechanisms = [
  {
    tone: 'coral',
    eyebrow: '01',
    title: 'Agent Action Replay',
    body: 'Replay every AI conversation, every tool call, every file change in your parent dashboard. Not a summary — the actual record.',
  },
  {
    tone: 'bubblegum',
    eyebrow: '02',
    title: 'Kid-Safe AI by Default',
    body: 'Our DeepRouter gateway injects kid-safe system prompts on every AI call. Server-side enforced — not a UI overlay kids can bypass.',
  },
  {
    tone: 'sunshine',
    eyebrow: '03',
    title: 'Sandboxed Tools',
    body: 'Read, write, edit project files only. No shell access, no external network, no escape paths. Your kid can&rsquo;t accidentally do anything dangerous.',
  },
  {
    tone: 'mint',
    eyebrow: '04',
    title: 'Mission-Driven, Not Open Chat',
    body: 'Kids are inside guided Missions with structure and outcomes — not dropped into an empty ChatGPT box.',
  },
  {
    tone: 'sky',
    eyebrow: '05',
    title: 'Private by Default',
    body: 'Kid work is private to the family. Class wall sharing requires teacher review. Public sharing requires parent consent.',
  },
] as const

const ageTracks = [
  {
    tone: 'sunshine',
    eyebrow: 'AGES 8-11',
    title: 'Creative Studio',
    body: 'Image generation, storytelling, music, video — the platform&rsquo;s creative side. Lighter touch, more guided, family-friendly outputs.',
    intensity: 'Light',
  },
  {
    tone: 'coral',
    eyebrow: 'AGES 12-15',
    title: 'Kids OpenCode (primary)',
    body: 'Our flagship use case. Middle-schoolers use Kids OpenCode at home between weekly classes — building real projects with an AI agent that&rsquo;s designed for them.',
    intensity: 'Daily',
  },
  {
    tone: 'bubblegum',
    eyebrow: 'AGES 15-17',
    title: 'Portfolio Builder',
    body: 'Real projects with deployed URLs. AI agent collaboration. Hackathon-ready output. The portfolio universities want to see.',
    intensity: 'Project-driven',
  },
] as const

const Platform = () => {
  usePageMeta({
    title: 'Kids OpenCode — Platform Waitlist',
    description: 'The first AI coding tool built for kids, not adults using kids. Launching 2026 Q3. Join the waitlist for early access + 50% off first 3 months.',
  })

  const [submitted, setSubmitted] = useState(false)
  const formspreeId = import.meta.env.VITE_FORMSPREE_ID || ''

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    if (formspreeId) {
      try {
        await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        })
      } catch {
        // Silent fail — still show success state, follow up via email
      }
    }

    setSubmitted(true)
    form.reset()
  }

  return (
    <div className="bg-canvas">
      {/* Hero — Kids OpenCode primary */}
      <section className="relative overflow-hidden bg-ink py-24 md:py-32">
        <div className="blob-bg bg-brand-coral" style={{ width: 480, height: 480, top: -160, right: -160, opacity: 0.25 }} aria-hidden="true" />
        <div className="blob-bg bg-brand-bubblegum" style={{ width: 360, height: 360, bottom: -120, left: -160, opacity: 0.18 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <img
              src="/media/brand/kids-opencode-logo.png"
              alt="Kids OpenCode"
              className="w-auto h-20 md:h-24 mb-7"
            />
            <span className="inline-block text-[13px] font-bold uppercase tracking-[0.10em] text-brand-coral mb-5">
              OUR FLAGSHIP — WAITLIST OPEN
            </span>
            <h1 className="text-[42px] md:text-[64px] font-bold leading-[1.05] tracking-tight text-canvas">
              The AI coding tool your kid should be using —
              <span className="squiggle-word text-brand-sunshine"> not ChatGPT.</span>
            </h1>
            <p className="text-white/85 text-[18px] md:text-[20px] leading-relaxed mt-7 max-w-2xl">
              Kids OpenCode is our proprietary AI coding agent — built from scratch for K-12 kids,
              with the safety, parent visibility, and curriculum integration that no general-purpose
              tool offers. Launching 2026 Q3. Join the waitlist now.
            </p>

            <a
              href="#waitlist"
              className="btn-pill-primary mt-9 inline-block"
            >
              Join Waitlist
            </a>
          </div>
        </div>
      </section>

      {/* What's actually under the hood */}
      <section className="py-24 md:py-32 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <span className="eyebrow eyebrow-coral">UNDER THE HOOD</span>
            <h2 className="section-heading">What&rsquo;s actually inside Kids OpenCode.</h2>
            <p className="lead-text mt-6">
              We didn&rsquo;t fork ChatGPT and add a colourful skin. Kids OpenCode is a proper AI agent
              tool — same shape as professional tools like Cursor or Claude Code — but rebuilt from
              the kid up. Here&rsquo;s how it works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-base">
              <span className="eyebrow eyebrow-coral">AGENT LOOP</span>
              <h3 className="text-[20px] font-bold text-ink mt-2 mb-3">Plan → Approve → Execute</h3>
              <p className="text-[15px] text-ink-soft leading-relaxed">
                AI doesn&rsquo;t silently change your kid&rsquo;s files. It first writes a plan in plain English.
                Your kid reviews. Approves. Then the AI works. This rhythm is fundamental — it teaches
                kids to be the director, not the typist.
              </p>
            </div>

            <div className="card-base">
              <span className="eyebrow eyebrow-bubblegum">TOOL WHITELIST</span>
              <h3 className="text-[20px] font-bold text-ink mt-2 mb-3">Read · Write · Edit. Nothing else.</h3>
              <p className="text-[15px] text-ink-soft leading-relaxed">
                Kids OpenCode can read, write, and edit files inside your kid&rsquo;s project sandbox.
                It cannot run arbitrary shell commands. It cannot make network requests. It cannot
                touch anything outside its sandbox. Engineering-grade isolation.
              </p>
            </div>

            <div className="card-base">
              <span className="eyebrow eyebrow-sunshine">SANDBOXED PREVIEW</span>
              <h3 className="text-[20px] font-bold text-ink mt-2 mb-3">Browser-rendered, never server-executed.</h3>
              <p className="text-[15px] text-ink-soft leading-relaxed">
                Your kid&rsquo;s code (HTML/CSS/JS in V0) renders in an iframe in their browser — never
                on our servers. Even if AI generates buggy or weird code, the blast radius is your
                kid&rsquo;s preview tab. Nothing else.
              </p>
            </div>

            <div className="card-base">
              <span className="eyebrow eyebrow-mint">PARENT AUDIT TRAIL</span>
              <h3 className="text-[20px] font-bold text-ink mt-2 mb-3">Every action logged, every conversation replayable.</h3>
              <p className="text-[15px] text-ink-soft leading-relaxed">
                In your parent portal, you can scrub through every minute of your kid&rsquo;s AI work.
                What they asked. What the AI suggested. Every file diff. Every approved action.
                Transparency by design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Age tracks — emphasising 12-15 middle school */}
      <section className="py-24 md:py-32 bg-wash-sky">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <span className="eyebrow eyebrow-sky">WHO IT&rsquo;S FOR</span>
            <h2 className="section-heading">Built for middle school — works across ages 8-17.</h2>
            <p className="lead-text mt-6">
              The platform&rsquo;s primary audience is <strong className="text-ink">middle schoolers (12-15)</strong> —
              the age where weekly classes alone aren&rsquo;t enough, and kids need an always-on tool
              between sessions to actually develop AI coding instincts. Younger and older kids
              use a lighter or more advanced version of the same platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ageTracks.map((t) => (
              <div key={t.title} className={`card-base relative overflow-hidden ${t.eyebrow === 'AGES 12-15' ? 'ring-2 ring-brand-coral' : ''}`}>
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-grad-${t.tone}`} />
                {t.eyebrow === 'AGES 12-15' && (
                  <span className="sticker-coral" style={{ position: 'absolute', top: -12, right: 20 }}>
                    PRIMARY
                  </span>
                )}
                <div className={`text-[12px] font-bold uppercase tracking-[0.12em] text-brand-${t.tone} mt-3`}>
                  {t.eyebrow}
                </div>
                <h3 className="text-[22px] font-bold text-ink mt-2 mb-3 leading-tight">{t.title}</h3>
                <p className="text-[14px] text-ink-soft leading-relaxed mb-4">{t.body}</p>
                <div className="pt-4 border-t border-hairline flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.10em] text-slate2 font-semibold">Use intensity</span>
                  <span className="text-[13px] font-bold text-ink">{t.intensity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust mechanisms */}
      <section className="py-24 md:py-32 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <span className="eyebrow eyebrow-coral">WHY PARENTS TRUST IT</span>
            <h2 className="section-heading">Five mechanisms — each one verifiable.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trustMechanisms.map((m) => (
              <div key={m.title} className="card-base relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-grad-${m.tone}`} />
                <div className={`text-[12px] font-bold uppercase tracking-[0.12em] text-brand-${m.tone} mt-3`}>
                  {m.eyebrow}
                </div>
                <h3 className="text-[20px] font-semibold text-ink mt-2 mb-3 leading-tight">{m.title}</h3>
                <p className="text-[15px] text-ink-soft leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist form */}
      <section id="waitlist" className="py-24 md:py-32 bg-wash-mint">
        <div className="max-w-[720px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="card-base relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-grad-coral" />
            <div className="mt-3">
              <span className="eyebrow eyebrow-coral">JOIN THE WAITLIST</span>
              <h2 className="text-[28px] md:text-[34px] font-bold text-ink leading-tight mt-3 mb-3">
                Get early access + a 50% discount on first 3 months.
              </h2>
              <p className="text-[15px] text-ink-soft leading-relaxed mb-7">
                We&rsquo;ll email you when Kids OpenCode is ready (2026 Q3). Waitlist families get
                priority access + an early-bird discount on the first three months of platform credits.
              </p>

              {submitted ? (
                <div className="bg-wash-mint border border-brand-mint/40 rounded-2xl p-7 text-center">
                  <div className="text-[40px] mb-3">🎉</div>
                  <h3 className="text-[20px] font-bold text-ink mb-2">You&rsquo;re on the list!</h3>
                  <p className="text-[14px] text-ink-soft leading-relaxed">
                    We&rsquo;ll email you well before launch with early access details.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-ink mb-2" htmlFor="parent-name">
                      Your name
                    </label>
                    <input
                      id="parent-name"
                      name="parent_name"
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-hairline focus:border-brand-coral focus:outline-none transition-colors text-[15px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-ink mb-2" htmlFor="parent-email">
                      Email
                    </label>
                    <input
                      id="parent-email"
                      name="parent_email"
                      type="email"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-hairline focus:border-brand-coral focus:outline-none transition-colors text-[15px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-ink mb-2" htmlFor="kid-age">
                      Your kid&rsquo;s age
                    </label>
                    <select
                      id="kid-age"
                      name="kid_age"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-hairline focus:border-brand-coral focus:outline-none transition-colors text-[15px] bg-canvas"
                    >
                      <option value="">Select an age range</option>
                      <option value="8-11">8-11</option>
                      <option value="12-15">12-15 (primary)</option>
                      <option value="15-17">15-17</option>
                      <option value="other">Other (we&rsquo;ll figure it out)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-ink mb-2" htmlFor="interest">
                      What&rsquo;s your kid most interested in? <span className="text-slate2 font-normal">(optional)</span>
                    </label>
                    <textarea
                      id="interest"
                      name="interest"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-hairline focus:border-brand-coral focus:outline-none transition-colors text-[15px] resize-none"
                      placeholder="E.g. wants to build games, loves drawing, struggles with school coding class..."
                    />
                  </div>
                  <input type="hidden" name="_subject" value="Kids OpenCode waitlist signup" />
                  <button
                    type="submit"
                    className="btn-pill-primary w-full"
                  >
                    Join Waitlist
                  </button>
                  <p className="text-[12px] text-slate2 text-center mt-3">
                    We&rsquo;ll only email you about Kids OpenCode launch. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </div>

          <div className="text-center mt-10">
            <p className="text-[14px] text-ink-soft">
              Not ready to wait? <Link to="/programs/classes" className="text-brand-coral font-semibold no-underline hover:underline">Try a weekly class</Link> or <Link to="/programs/one-on-one" className="text-brand-coral font-semibold no-underline hover:underline">book a 1-on-1 session</Link> in the meantime — same curriculum DNA.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Platform
