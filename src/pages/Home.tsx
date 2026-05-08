import { Link } from 'react-router-dom'

const programs = [
  {
    tone: 'coral',
    tag: 'AI CODING',
    title: 'Code with AI.',
    desc: 'Project-based AI coding for ages 8–17. Frontier LLMs with age-appropriate scaffolding.',
    cta: 'Coming 2026 →',
    sticker: { label: 'NEW', color: 'sunshine' },
  },
  {
    tone: 'sunshine',
    tag: 'ROBOTICS',
    title: 'Build robots.',
    desc: 'Hands-on robotics workshops. Sensors, navigation, autonomy — the abstract becomes physical.',
    cta: 'Enrolling now →',
    sticker: { label: 'POPULAR', color: 'coral', alt: true },
  },
  {
    tone: 'bubblegum',
    tag: 'HACKATHONS',
    title: 'Show what you build.',
    desc: 'Quarterly student hackathons with university admissions partners.',
    cta: 'Coming 2026 →',
    sticker: null,
  },
  {
    tone: 'sky',
    tag: 'SCHOOLS',
    title: 'Partner with us.',
    desc: 'Curriculum-aligned programs for AU schools. Recurring partnerships.',
    cta: 'For educators →',
    sticker: null,
  },
] as const

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
              Hands-on workshops, AI-native curriculum, and projects that make AI feel like a tool —
              not a mystery. Built with educators, in real Australian schools.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <Link to="/book" className="btn-pill-primary">Book a Workshop</Link>
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
              <div key={p.tag} className={`program-card-${p.tone}`}>
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
              </div>
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
              We're not pretending to be everywhere yet. Two schools. ~100 kids. Real curriculum.
              We're learning what works before we scale.
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
                FOR SCHOOLS & PARENTS
              </span>
              <h2 className="text-[40px] md:text-[56px] font-bold leading-[1.05] tracking-tight mt-3 mb-5 max-w-3xl">
                Ready to bring AI coding to your school?
              </h2>
              <p className="text-white/90 text-[18px] max-w-xl mb-9 leading-relaxed">
                Book a free 30-minute intro call. We'll walk through curriculum, logistics, and what
                makes a great pilot.
              </p>
              <Link to="/book" className="btn-pill-on-color">
                Book a Workshop
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
