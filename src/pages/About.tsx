import { Link } from 'react-router-dom'

const values = [
  {
    tone: 'coral',
    title: 'Student-Centered',
    description: 'We design experiences that spark curiosity and build confidence through hands-on learning.',
  },
  {
    tone: 'sunshine',
    title: 'Real-World Skills',
    description: 'From problem solving to collaboration, our programs prepare students for the future of work.',
  },
  {
    tone: 'sky',
    title: 'Equity & Access',
    description: 'We strive to make AI and Robotics education accessible to all students across Australia.',
  },
  {
    tone: 'mint',
    title: 'Responsible AI',
    description: 'Ethics, safety, and responsible technology use are embedded throughout our curriculum.',
  },
] as const

const ownProducts = [
  {
    tone: 'coral',
    name: 'Kids OpenCode',
    desc: 'The first AI coding agent designed specifically for K-12 students. Forked from open-source opencode, deeply customised for kid-safety, parent visibility, and curriculum integration.',
  },
  {
    tone: 'bubblegum',
    name: 'airbotix-app',
    desc: 'Unified learning platform — parent portal for family management, kid learning zone for AI creative tools, and class wall for sharing work.',
  },
  {
    tone: 'sunshine',
    name: 'DeepRouter',
    desc: 'Our LLM gateway. All AI calls route through it — injecting kid-safe system prompts on the server side, metering Stars, and emitting audit events parents can replay.',
  },
  {
    tone: 'mint',
    name: 'Airbotix Curriculum',
    desc: '100+ student classroom-tested curriculum aligned with Australian Digital Technologies F-10. The substrate every program is built on.',
  },
] as const

const partners = [
  { group: 'AI Models', items: ['Anthropic Claude', 'OpenAI'] },
  { group: 'Creative Tools', items: ['ElevenLabs', 'Suno', 'Runway', 'Flux (Black Forest Labs)', 'SDXL (Stability AI)'] },
  { group: 'Coding Tools (15+ advanced students only)', items: ['Cursor', 'Anthropic Claude Code', 'opencode (upstream, MIT)'] },
  { group: 'Dev & Deploy', items: ['Vercel', 'GitHub'] },
  { group: 'Infrastructure', items: ['AWS Sydney', 'Neon', 'Cloudflare', 'Airwallex', 'SendGrid'] },
] as const

const layers = [
  {
    layer: 'Layer 1',
    tone: 'sunshine',
    title: 'Curriculum & Group Programs',
    body: 'Hands-on AI curriculum delivered through weekly classes, holiday intensives, and school partnerships. The substrate every other layer is built on — content first, software second.',
    badge: 'Launching',
  },
  {
    layer: 'Layer 2',
    tone: 'coral',
    title: 'Kids-Safe AI Coding Platform',
    body: 'Kids OpenCode + airbotix-app + DeepRouter. Purpose-built for K-12. Agent-based, parent-visible, curriculum-anchored. Waitlist open now.',
    badge: '2026 Q3-Q4',
  },
  {
    layer: 'Layer 3',
    tone: 'bubblegum',
    title: 'Hackathons & University Pipeline',
    body: 'Quarterly student hackathons. Top portfolios connect to university admissions partners. Particularly compelling for families optimising for college outcomes.',
    badge: '2027+',
  },
] as const

const About = () => {
  return (
    <div className="bg-canvas">
      {/* ============================================================
          Hero
          ============================================================ */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-canvas">
        <div className="blob-bg bg-brand-bubblegum" style={{ width: 480, height: 480, top: -120, right: -180, opacity: 0.30 }} aria-hidden="true" />
        <div className="blob-bg bg-brand-sunshine" style={{ width: 360, height: 360, bottom: -120, left: -160, opacity: 0.30 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="eyebrow">ABOUT AIRBOTIX</span>
            <h1 className="hero-display">
              Teaching the next generation of <span className="squiggle-word text-brand-coral">builders.</span>
            </h1>
            <p className="lead-text mt-7">
              We&rsquo;re building the AI coding curriculum & platform K-12 schools and parents trust —
              engaging, responsible, and made for kids who&rsquo;ll graduate into an AI-native economy.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          Mission & Vision
          ============================================================ */}
      <section className="py-20 md:py-24 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-base">
            <span className="eyebrow eyebrow-bubblegum">OUR MISSION</span>
            <p className="text-[18px] text-ink leading-relaxed mt-3">
              To inspire K-12 students across Australia to explore, create, and lead with technology
              by delivering hands-on, curriculum-aligned AI and Robotics learning experiences.
            </p>
          </div>
          <div className="card-base">
            <span className="eyebrow eyebrow-mint">OUR VISION</span>
            <p className="text-[18px] text-ink leading-relaxed mt-3">
              A world where every student has the opportunity to understand and shape the intelligent
              systems that power our future.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          3-Layer Stack — vision visual
          ============================================================ */}
      <section className="py-24 md:py-28 bg-canvas relative overflow-hidden">
        <div className="blob-bg bg-brand-coral" style={{ width: 420, height: 420, top: -120, left: -180, opacity: 0.20 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <span className="eyebrow eyebrow-coral">OUR APPROACH</span>
            <h2 className="section-heading">A three-layer stack, built from curriculum outward.</h2>
            <p className="lead-text mt-6">
              We didn&rsquo;t start by building a software product and then bolting on classes. We started
              with curriculum, learned what works in real classrooms, and are now building the
              platform on top of that foundation. Each layer reinforces the next.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {layers.map((l) => (
              <div key={l.layer} className="card-base relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-grad-${l.tone}`} />
                <div className="flex items-center justify-between mt-3 mb-4">
                  <span className={`text-[12px] font-bold uppercase tracking-[0.12em] text-brand-${l.tone}`}>
                    {l.layer}
                  </span>
                  <span className="text-[11px] font-semibold text-slate2 bg-canvas px-2 py-0.5 rounded-full border border-hairline">
                    {l.badge}
                  </span>
                </div>
                <h3 className="text-[22px] font-bold text-ink leading-tight mb-3">{l.title}</h3>
                <p className="text-[15px] text-ink-soft leading-relaxed">{l.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          Where We Are Today — honest "just getting started" framing
          ============================================================ */}
      <section className="py-24 md:py-28 bg-wash-sky">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-sky">WHERE WE ARE TODAY</span>
            <h2 className="section-heading">Just getting started — and saying so honestly.</h2>
            <p className="lead-text mt-5">
              Airbotix is in build mode. We&rsquo;re finalising our first classes, opening the
              Kids OpenCode waitlist, and looking for the first families who want to be part of a
              new K-12 AI brand from day one. No inflated pilot numbers. No fake testimonials.
              Just the work — done in the open.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          Our Technology Stack — what we build + what we use
          ============================================================ */}
      <section className="py-24 md:py-28 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <span className="eyebrow eyebrow-coral">OUR TECHNOLOGY STACK</span>
            <h2 className="section-heading">We build the kid-safe layer. We use world-class AI underneath.</h2>
            <p className="lead-text mt-6">
              Airbotix doesn&rsquo;t build AI models — Anthropic, OpenAI, and other research labs do that
              better than anyone. Our job is to wrap their models in curriculum, safety, parent
              visibility, and a kid-friendly experience. Here&rsquo;s exactly what&rsquo;s under the hood.
            </p>
          </div>

          {/* Our own products */}
          <div className="mb-10">
            <h3 className="text-[20px] font-bold text-ink mb-5 flex items-center gap-3">
              <span className="inline-block w-2 h-6 bg-brand-coral rounded-full" />
              Our own products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {ownProducts.map((p) => (
                <div key={p.name} className="card-base relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-grad-${p.tone}`} />
                  <h4 className={`text-[18px] font-bold mt-3 mb-2 text-brand-${p.tone}`}>{p.name}</h4>
                  <p className="text-[14px] text-ink-soft leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Partner stack */}
          <div>
            <h3 className="text-[20px] font-bold text-ink mb-5 flex items-center gap-3">
              <span className="inline-block w-2 h-6 bg-slate2 rounded-full" />
              AI engines & services we use
            </h3>
            <div className="rounded-3xl bg-wash-sky/30 p-7">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                {partners.map((p) => (
                  <div key={p.group}>
                    <div className="text-[12px] font-bold uppercase tracking-[0.10em] text-slate2 mb-2">
                      {p.group}
                    </div>
                    <ul className="space-y-1">
                      {p.items.map((item) => (
                        <li key={item} className="text-[14px] text-ink leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[14px] text-slate2 mt-5 max-w-3xl">
              Every tool is named on this page. You can see exactly what your kid&rsquo;s interactions
              touch — no black boxes, no mystery models, no &ldquo;trust us&rdquo; hand-waving.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          Values
          ============================================================ */}
      <section className="py-24 md:py-28 bg-wash-mint">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12 max-w-3xl">
            <span className="eyebrow eyebrow-mint">OUR VALUES</span>
            <h2 className="section-heading">Principles that guide our programs.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => (
              <div key={v.title} className="card-base relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-grad-${v.tone}`} />
                <h3 className="text-[20px] font-semibold text-ink mt-3 mb-2 leading-tight">{v.title}</h3>
                <p className="text-[15px] text-ink-soft leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          Founders mention (brief — full bios TBD with Lightman/Joe input)
          ============================================================ */}
      <section className="py-20 md:py-24 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="card-base max-w-3xl mx-auto text-center">
            <span className="eyebrow">THE TEAM</span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-ink leading-tight mt-3 mb-5">
              Built by founders who&rsquo;ve shipped real software.
            </h2>
            <p className="text-[16px] text-ink-soft leading-relaxed">
              Airbotix is built by Lightman (coding pedagogy, ex-bootcamp founder) and Joe
              (engineering leadership), with classroom delivery by Australian-based educators.
              We&rsquo;re a small team focused on doing one thing well: making AI coding accessible,
              safe, and useful for K-12 students.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          Final CTA — coral promo
          ============================================================ */}
      <section className="py-20 md:py-24 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="promo-card-coral">
            <div
              className="absolute rounded-full pointer-events-none"
              style={{ top: -160, right: -160, width: 460, height: 460, background: 'rgba(255,255,255,0.12)' }}
              aria-hidden="true"
            />
            <span
              className="sticker-sunshine alt"
              style={{ position: 'absolute', top: 36, right: 56 }}
            >
              FOR EDUCATORS
            </span>
            <div className="relative">
              <span className="text-[13px] font-bold uppercase tracking-[0.10em] text-white/85">
                PARTNER WITH US
              </span>
              <h2 className="text-[40px] md:text-[52px] font-bold leading-[1.05] tracking-tight mt-3 mb-5 max-w-2xl">
                Bring AI & robotics to your school.
              </h2>
              <p className="text-white/90 text-[18px] max-w-xl mb-9 leading-relaxed">
                We collaborate with schools, clubs, libraries, and community groups to deliver
                tailored programs that complement Australian curriculum.
              </p>
              <Link to="/contact" className="btn-pill-on-color">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
