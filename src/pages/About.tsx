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
              We're building the AI coding curriculum & platform K-12 schools and parents trust —
              engaging, responsible, and made for kids who'll graduate into an AI-native economy.
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
          Pilot Snapshot
          ============================================================ */}
      <section className="py-24 md:py-28 bg-wash-sky">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12 max-w-3xl">
            <span className="eyebrow eyebrow-sky">WHERE WE ARE TODAY</span>
            <h2 className="section-heading">An early pilot, focused on getting it right.</h2>
            <p className="lead-text mt-5">
              We're not pretending to be everywhere. Two schools. ~100 kids. Real curriculum.
              Learning what works before we scale.
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
          Values
          ============================================================ */}
      <section className="py-24 md:py-28 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12 max-w-3xl">
            <span className="eyebrow">OUR VALUES</span>
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
