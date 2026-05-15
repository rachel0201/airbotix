import { Link } from 'react-router-dom'

const programs = [
  {
    tone: 'coral',
    tag: 'KIDS OPENCODE',
    title: 'AI coding, built for kids.',
    desc: 'The first AI coding agent designed for K-12 — not adults using kids. Parent-visible, sandboxed, and curriculum-driven. Our flagship product.',
    cta: 'See how it works →',
    href: '/about',
    sticker: { label: 'FLAGSHIP', color: 'sunshine' },
  },
  {
    tone: 'sunshine',
    tag: 'WORKSHOPS',
    title: 'In-school & holiday camps.',
    desc: '1–3 day intensive AI & robotics workshops. mBots, sensors, generative AI. Run in real Australian schools.',
    cta: 'View workshops →',
    href: '/workshops',
    sticker: { label: 'POPULAR', color: 'coral', alt: true },
  },
  {
    tone: 'bubblegum',
    tag: '1-ON-1 TUTORING',
    title: 'Private AI coding sessions.',
    desc: 'Personalised online tutoring with senior instructors. Bring an idea, leave with a real project. From A$80/hour.',
    cta: 'Book a session →',
    href: '/book',
    sticker: { label: 'NEW', color: 'mint' },
  },
  {
    tone: 'sky',
    tag: 'WEEKLY CLASSES',
    title: 'Small-group AI classes.',
    desc: 'Termly small-group classes (3–6 students). AI Creative Lab for ages 8–11, AI Coding Studio for ages 12–17. Online & in-person.',
    cta: 'View cohorts →',
    href: '/book',
    sticker: null,
  },
] as const

const trustMechanisms = [
  {
    tone: 'coral',
    eyebrow: '01',
    title: 'Agent Action Replay',
    body: 'Every conversation, every line of code the AI writes, every tool it uses — replay it all in your parent dashboard. Not just a vague summary.',
  },
  {
    tone: 'bubblegum',
    eyebrow: '02',
    title: 'Kid-Safe AI by Default',
    body: 'Our DeepRouter gateway injects safety prompts on every AI call — built into the stack, not a UI overlay that kids could bypass.',
  },
  {
    tone: 'sunshine',
    eyebrow: '03',
    title: 'Sandboxed Tools',
    body: 'Kids OpenCode can read, write, and edit project files. It cannot run arbitrary commands, fetch external resources, or escape its sandbox.',
  },
  {
    tone: 'mint',
    eyebrow: '04',
    title: 'Mission-Driven, Not Open Chat',
    body: 'Kids aren’t dropped into a ChatGPT box. They’re in a Mission — a guided project with structure — and AI is the tool.',
  },
  {
    tone: 'sky',
    eyebrow: '05',
    title: 'Private by Default',
    body: 'Kid creations are private to the family. Sharing to a class wall needs teacher review. Going public requires parent consent.',
  },
] as const

const partners = [
  'Anthropic Claude',
  'OpenAI',
  'ElevenLabs',
  'Suno',
  'Cursor',
  'Vercel',
  'GitHub',
] as const

type CompareCell = 'yes' | 'no' | 'partial'

const compareRows: Array<{ feature: string; chatgpt: CompareCell; khanmigo: CompareCell; scratch: CompareCell; airbotix: CompareCell }> = [
  { feature: 'AI-native',                         chatgpt: 'yes',     khanmigo: 'partial', scratch: 'no',      airbotix: 'yes' },
  { feature: 'Built for K-12 kids',               chatgpt: 'no',      khanmigo: 'yes',     scratch: 'yes',     airbotix: 'yes' },
  { feature: 'Purpose-built AI coding tool',      chatgpt: 'no',      khanmigo: 'no',      scratch: 'no',      airbotix: 'yes' },
  { feature: 'Parent visibility / audit replay',  chatgpt: 'no',      khanmigo: 'partial', scratch: 'no',      airbotix: 'yes' },
  { feature: 'Curriculum-driven (not open chat)', chatgpt: 'no',      khanmigo: 'partial', scratch: 'yes',     airbotix: 'yes' },
]

const galleryImages = [
  { src: '/media/pacific-camp/photos/activities-03.jpg', alt: 'Hands-on robotics activity' },
  { src: '/media/pacific-camp/photos/activities-04.jpg', alt: 'Team coding challenge' },
  { src: '/media/pacific-camp/photos/activities-05.jpg', alt: 'Students testing robot' },
  { src: '/media/pacific-camp/photos/activities-06.jpg', alt: 'AI workshop session' },
  { src: '/media/pacific-camp/photos/activities-07.jpg', alt: 'Group robotics build' },
  { src: '/media/pacific-camp/photos/activities-08.jpg', alt: 'Class demo and presentation' },
  { src: '/media/pacific-camp/photos/classroom-01.jpg', alt: 'Classroom collaboration' },
  { src: '/media/pacific-camp/photos/outcomes-01.jpg', alt: 'Learning outcomes showcase' },
]

const testimonials = [
  {
    quote: 'Our students were absolutely engaged. The hands-on activities made complex AI concepts accessible and exciting.',
    name: 'Sarah Williams',
    role: 'STEM Coordinator, Riverdale Primary',
  },
  {
    quote: 'The workshop aligned perfectly with our curriculum and inspired several new lunchtime robotics clubs.',
    name: 'James O’Connor',
    role: 'Deputy Principal, Northview College',
  },
  {
    quote: 'Professional, well-structured, and fun. Students developed real confidence with coding and robotics.',
    name: 'Emily Zhang',
    role: 'Digital Technologies Lead, Eastside High',
  },
]

const CompareIcon = ({ kind, highlight = false }: { kind: CompareCell; highlight?: boolean }) => {
  if (kind === 'yes') {
    return (
      <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center font-bold text-[15px] ${highlight ? 'bg-brand-coral text-white' : 'bg-brand-mint/20 text-brand-mint'}`}>
        ✓
      </span>
    )
  }
  if (kind === 'no') {
    return (
      <span className="inline-flex w-7 h-7 rounded-full items-center justify-center font-bold text-[15px] bg-slate2/15 text-slate2">
        ✕
      </span>
    )
  }
  return (
    <span className="inline-flex w-7 h-7 rounded-full items-center justify-center font-bold text-[15px] bg-brand-sunshine/25 text-ink">
      ◐
    </span>
  )
}

const Home = () => {
  return (
    <div className="bg-canvas">
      {/* ============================================================
          Hero — student video background with ink overlay
          ============================================================ */}
      <section className="relative overflow-hidden bg-ink">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay muted loop playsInline preload="auto"
          poster="/media/hero-students-poster.jpg"
          aria-hidden="true"
        >
          <source src="/media/hero-students.mp4" type="video/mp4" />
        </video>

        {/* Dark gradient overlay — left-heavy for text legibility */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(31,27,45,0.85) 0%, rgba(31,27,45,0.55) 55%, rgba(31,27,45,0.20) 100%)' }}
          aria-hidden="true"
        />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 py-32 md:py-40 min-h-[640px] md:min-h-[720px] flex items-center">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="sticker-bubblegum">FOR K-12</span>
              <span className="sticker-sunshine alt">AUSTRALIA</span>
            </div>

            <h1 className="hero-display text-canvas">
              Teach kids to code <span className="squiggle-word text-brand-coral">with AI.</span>
            </h1>

            <p className="text-[18px] md:text-[22px] text-white/85 mt-8 max-w-2xl leading-relaxed font-medium">
              Workshops, weekly classes, 1-on-1 tutoring, and our own kids-safe AI coding tool —
              all designed in Australia for the next generation of builders.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <Link to="/book" className="btn-pill-primary">Book a Free Consult</Link>
              <Link
                to="/workshops"
                className="inline-flex items-center justify-center bg-transparent text-white text-[15px] font-semibold py-[12px] px-7 rounded-full border-2 border-white/70 hover:bg-white hover:text-ink transition-colors duration-200 no-underline"
              >
                View Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Kids OpenCode — flagship section, our own IP
          ============================================================ */}
      <section className="relative overflow-hidden bg-ink py-20 md:py-28">
        <div className="blob-bg bg-brand-coral" style={{ width: 480, height: 480, top: -160, right: -160, opacity: 0.25 }} aria-hidden="true" />
        <div className="blob-bg bg-brand-bubblegum" style={{ width: 360, height: 360, bottom: -120, left: -160, opacity: 0.18 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <img
                src="/media/brand/kids-opencode-logo.png"
                alt="Kids OpenCode"
                className="w-auto h-20 md:h-24 mb-7"
                loading="eager"
              />
              <span className="inline-block text-[13px] font-bold uppercase tracking-[0.10em] text-brand-coral mb-5">
                OUR FLAGSHIP — KIDS OPENCODE
              </span>
              <h2 className="text-[40px] md:text-[56px] font-bold leading-[1.05] tracking-tight text-canvas">
                The first AI coding tool built for
                <span className="squiggle-word text-brand-sunshine"> kids,</span> not adults using kids.
              </h2>
              <p className="text-white/85 text-[18px] md:text-[20px] leading-relaxed mt-7 max-w-2xl">
                ChatGPT was built for adults. Cursor and Claude Code are built for engineers.
                Scratch and Tynker are pre-AI. <strong className="text-white">Kids OpenCode is the only AI coding agent
                designed specifically for K-12 students</strong> — with the safety, scaffolding,
                and parent visibility every other tool is missing.
              </p>

              <ul className="mt-10 space-y-3 text-white/85 text-[16px]">
                <li className="flex items-start gap-3">
                  <span className="text-brand-sunshine font-bold mt-0.5">✓</span>
                  <span><strong className="text-white">Kid-safe by default</strong> — sandboxed tools, age-aware prompts, no shell access.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-sunshine font-bold mt-0.5">✓</span>
                  <span><strong className="text-white">Parent-visible</strong> — replay every AI conversation and code change in your dashboard.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-sunshine font-bold mt-0.5">✓</span>
                  <span><strong className="text-white">Curriculum-driven</strong> — projects with structure, not an empty chat box.</span>
                </li>
              </ul>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link to="/about" className="btn-pill-primary">Learn more</Link>
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center bg-transparent text-white text-[15px] font-semibold py-[12px] px-7 rounded-full border-2 border-white/70 hover:bg-white hover:text-ink transition-colors duration-200 no-underline"
                >
                  Join the waitlist
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-white/15 bg-white/[0.04] p-8 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-3 h-3 rounded-full bg-brand-coral/80" />
                  <span className="w-3 h-3 rounded-full bg-brand-sunshine/80" />
                  <span className="w-3 h-3 rounded-full bg-brand-mint/80" />
                  <span className="ml-3 text-[12px] uppercase tracking-[0.10em] text-white/50">kids-opencode</span>
                </div>
                <div className="font-mono text-[13px] leading-relaxed text-white/85 space-y-3">
                  <div>
                    <span className="text-brand-sunshine">▸ You</span>
                    <span className="text-white/60"> — Make me a website about my pet hamster.</span>
                  </div>
                  <div>
                    <span className="text-brand-coral">▸ AI</span>
                    <span className="text-white/60"> — I&rsquo;ll create:</span>
                  </div>
                  <ul className="pl-5 list-disc text-white/55 space-y-1">
                    <li><code className="text-brand-mint">index.html</code> — main page</li>
                    <li><code className="text-brand-mint">style.css</code> — pink theme</li>
                    <li><code className="text-brand-mint">hamster.png</code> — generate image</li>
                  </ul>
                  <div className="text-white/55">Shall I start? <span className="text-brand-sunshine">[Yes] [Modify]</span></div>
                  <div className="mt-5 pt-4 border-t border-white/10 text-[11px] text-white/40">
                    Estimated cost: 3⭐ · Parent audit: visible
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Powered by — partner logo strip (text-based V0)
          ============================================================ */}
      <section className="bg-canvas border-y border-hairline py-10 md:py-12">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <p className="text-center text-[12px] uppercase tracking-[0.12em] text-slate2 mb-6">
            Built on best-in-class AI infrastructure
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {partners.map((p) => (
              <span
                key={p}
                className="text-[15px] font-semibold text-slate2 hover:text-ink transition-colors"
              >
                {p}
              </span>
            ))}
          </div>
          <p className="text-center text-[13px] text-slate2 mt-6 max-w-2xl mx-auto leading-relaxed">
            We don&rsquo;t build the AI models. We build the <strong className="text-ink">kid-safe layer</strong> on top —
            Kids OpenCode for coding, our platform for learning, our curriculum for structure.
          </p>
        </div>
      </section>

      {/* ============================================================
          Programs — 4 vibrant gradient cards
          ============================================================ */}
      <section className="py-24 md:py-32 bg-canvas relative overflow-hidden">
        <div className="blob-bg bg-brand-sunshine" style={{ width: 480, height: 480, top: -120, right: -200, opacity: 0.35 }} aria-hidden="true" />
        <div className="blob-bg bg-brand-mint" style={{ width: 360, height: 360, bottom: -120, left: -200, opacity: 0.30 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <span className="eyebrow">OUR PROGRAMS</span>
            <h2 className="section-heading">Four ways kids learn AI with us.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {programs.map((p) => (
              <Link key={p.tag} to={p.href} className={`program-card-${p.tone} no-underline`}>
                {p.sticker && (
                  <span
                    className={`sticker-${p.sticker.color}${'alt' in p.sticker && p.sticker.alt ? ' alt' : ''}`}
                    style={{ position: 'absolute', top: 16, right: 16 }}
                  >
                    {p.sticker.label}
                  </span>
                )}
                <div className="pc-blob" />
                <div className="relative z-10">
                  <div className="pc-tag">{p.tag}</div>
                  <h3 className="pc-title">{p.title}</h3>
                  <p className="pc-desc">{p.desc}</p>
                </div>
                <div className="pc-cta relative z-10">{p.cta}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          Where We Are Today — honest pilot snapshot
          ============================================================ */}
      <section className="py-24 md:py-32 bg-wash-sky">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12 max-w-3xl">
            <span className="eyebrow eyebrow-sky">WHERE WE ARE TODAY</span>
            <h2 className="section-heading">An early pilot, focused on doing it right.</h2>
            <p className="lead-text mt-6">
              We&rsquo;re not pretending to be everywhere yet. Two schools. ~100 kids. Real curriculum.
              We&rsquo;re learning what works before we scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="stat-tile coral">
              <span className="sticker-coral" style={{ position: 'absolute', top: -12, right: 20 }}>PILOT</span>
              <div className="stat-num text-brand-coral">100+</div>
              <div className="stat-label">Students Taught</div>
            </div>
            <div className="stat-tile bubblegum">
              <div className="stat-num text-brand-bubblegum">2</div>
              <div className="stat-label">Partner Schools</div>
            </div>
            <div className="stat-tile sky">
              <div className="stat-num-text text-brand-sky">Australia</div>
              <div className="stat-label">Pilot Market</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Why Parents Trust Us — 5 mechanisms
          ============================================================ */}
      <section className="py-24 md:py-32 bg-canvas relative overflow-hidden">
        <div className="blob-bg bg-brand-coral" style={{ width: 420, height: 420, top: -120, left: -160, opacity: 0.20 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <span className="eyebrow eyebrow-coral">WHY PARENTS TRUST US</span>
            <h2 className="section-heading">
              Every move your kid makes with AI — <span className="squiggle-word text-brand-coral">you can see it.</span>
            </h2>
            <p className="lead-text mt-6">
              When you let your kid use ChatGPT or Cursor, you have no idea what they typed, what the AI said,
              or what got built. With Airbotix, all of that is visible to you — by design, not by accident.
            </p>
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

      {/* ============================================================
          Competitive Comparison — where Airbotix sits in the landscape
          ============================================================ */}
      <section className="py-24 md:py-32 bg-wash-mint">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12 max-w-3xl">
            <span className="eyebrow eyebrow-mint">HOW WE&rsquo;RE DIFFERENT</span>
            <h2 className="section-heading">The only AI coding tool actually designed for kids.</h2>
            <p className="lead-text mt-6">
              Plenty of products claim to teach kids AI. Almost none of them check every box that actually
              matters for K-12. Here&rsquo;s where we sit in the landscape.
            </p>
          </div>

          <div className="rounded-3xl bg-canvas shadow-card-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-hairline bg-canvas">
                    <th className="text-left px-6 py-5 text-[13px] font-bold uppercase tracking-[0.08em] text-slate2"></th>
                    <th className="px-4 py-5 text-[13px] font-semibold text-ink-soft text-center">
                      <div>ChatGPT</div>
                      <div className="text-[11px] text-slate2 font-normal mt-0.5">Cursor · Claude Code</div>
                    </th>
                    <th className="px-4 py-5 text-[13px] font-semibold text-ink-soft text-center">
                      <div>Khanmigo</div>
                      <div className="text-[11px] text-slate2 font-normal mt-0.5">Cluey · tutoring bots</div>
                    </th>
                    <th className="px-4 py-5 text-[13px] font-semibold text-ink-soft text-center">
                      <div>Scratch</div>
                      <div className="text-[11px] text-slate2 font-normal mt-0.5">Tynker · Code.org</div>
                    </th>
                    <th className="px-4 py-5 text-center bg-brand-coral text-white">
                      <div className="text-[15px] font-bold">Airbotix</div>
                      <div className="text-[11px] font-normal mt-0.5 opacity-90">Kids OpenCode</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? 'bg-canvas' : 'bg-wash-sky/40'}>
                      <td className="px-6 py-4 text-[15px] font-medium text-ink">{row.feature}</td>
                      <td className="px-4 py-4 text-center"><CompareIcon kind={row.chatgpt} /></td>
                      <td className="px-4 py-4 text-center"><CompareIcon kind={row.khanmigo} /></td>
                      <td className="px-4 py-4 text-center"><CompareIcon kind={row.scratch} /></td>
                      <td className="px-4 py-4 text-center bg-brand-coral/8"><CompareIcon kind={row.airbotix} highlight /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-center text-[13px] text-slate2 mt-6">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-brand-mint/40" /> Yes
              <span className="ml-4 inline-block w-3 h-3 rounded-full bg-brand-sunshine/40" /> Partial
              <span className="ml-4 inline-block w-3 h-3 rounded-full bg-slate2/30" /> No
            </span>
          </p>
        </div>
      </section>

      {/* ============================================================
          Workshop Gallery
          ============================================================ */}
      <section className="py-24 md:py-32 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <span className="eyebrow eyebrow-bubblegum">WORKSHOP GALLERY</span>
            <h2 className="section-heading">Real students. Real builds.</h2>
            <p className="lead-text mt-6">
              Moments from our AI and robotics workshops — hands-on learning, teamwork, and a lot of
              focused mess.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((img) => (
              <div
                key={img.src}
                className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-surface shadow-card-soft"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          Testimonials — on mint wash for warmth
          ============================================================ */}
      <section className="py-24 md:py-32 bg-wash-mint">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <span className="eyebrow eyebrow-mint">FROM EDUCATORS</span>
            <h2 className="section-heading">What teachers say.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="card-base">
                <p className="text-ink-soft leading-relaxed mb-6 text-[16px]">&ldquo;{t.quote}&rdquo;</p>
                <div className="pt-5 border-t border-hairline">
                  <div className="font-semibold text-ink">{t.name}</div>
                  <div className="text-[13px] text-slate2 mt-1">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          Final CTA — coral promo card with sticker
          ============================================================ */}
      <section className="py-24 md:py-32 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="promo-card-coral">
            {/* Decorative blob */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{ top: -160, right: -160, width: 460, height: 460, background: 'rgba(255,255,255,0.12)' }}
              aria-hidden="true"
            />
            {/* Sticker callout */}
            <span
              className="sticker-sunshine alt"
              style={{ position: 'absolute', top: 36, right: 56 }}
            >
              FREE INTRO CALL
            </span>

            <div className="relative">
              <span className="text-[13px] font-bold uppercase tracking-[0.10em] text-white/85">
                FOR PARENTS, SCHOOLS & PARTNERS
              </span>
              <h2 className="text-[40px] md:text-[56px] font-bold leading-[1.05] tracking-tight mt-3 mb-5 max-w-3xl">
                Ready to give your kid the right AI head start?
              </h2>
              <p className="text-white/90 text-[18px] max-w-xl mb-9 leading-relaxed">
                Book a free 15-minute call. We&rsquo;ll figure out which program fits — workshop, weekly class,
                1-on-1, or the platform waitlist.
              </p>
              <Link to="/book" className="btn-pill-on-color">
                Book a Free Consult
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
