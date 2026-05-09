import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { workshops as data } from '../data/workshops'

const WORKSHOP_FILTERS = {
  ALL: 'all',
  ONE_DAY: '1d',
  TWO_DAY: '2d',
  THREE_DAY: '3d',
  OTHER: 'other',
} as const

const WORKSHOP_TEXTS = {
  PAGE_TITLE: 'Workshops',
  PAGE_DESC: 'Past programs we\'ve delivered, designed with flexibility for school calendars and learning goals.',
  FILTER_ALL: 'All',
  FILTER_1D: '1 day',
  FILTER_2D: '2 day',
  FILTER_3D: '3 day',
  FILTER_OTHER: 'Other',
  VIEW_DETAILS: 'View Details',
  BOOK: 'Book',
  EMPTY_TITLE: 'No workshops match your filter',
  EMPTY_DESC: 'Try adjusting the duration filter or check back soon for new programs.',
  CLEAR_FILTERS: 'Clear filters',
} as const

type DurationFilter = typeof WORKSHOP_FILTERS[keyof typeof WORKSHOP_FILTERS]

const deriveDurationFilter = (duration: string): Exclude<DurationFilter, 'all'> => {
  const match = duration.toLowerCase().match(/\b(\d+)\s*day/)
  if (match) {
    const num = parseInt(match[1], 10)
    if (num === 1) return WORKSHOP_FILTERS.ONE_DAY
    if (num === 2) return WORKSHOP_FILTERS.TWO_DAY
    if (num === 3) return WORKSHOP_FILTERS.THREE_DAY
  }
  return WORKSHOP_FILTERS.OTHER
}

const Workshops = () => {
  const [selectedDuration, setSelectedDuration] = useState<DurationFilter>(WORKSHOP_FILTERS.ALL)

  const filtered = useMemo(() => {
    if (selectedDuration === WORKSHOP_FILTERS.ALL) return data
    return data.filter((ws) => deriveDurationFilter(ws.duration) === selectedDuration)
  }, [selectedDuration])

  const filters = [
    { key: WORKSHOP_FILTERS.ALL, label: WORKSHOP_TEXTS.FILTER_ALL },
    { key: WORKSHOP_FILTERS.ONE_DAY, label: WORKSHOP_TEXTS.FILTER_1D },
    { key: WORKSHOP_FILTERS.TWO_DAY, label: WORKSHOP_TEXTS.FILTER_2D },
    { key: WORKSHOP_FILTERS.THREE_DAY, label: WORKSHOP_TEXTS.FILTER_3D },
    { key: WORKSHOP_FILTERS.OTHER, label: WORKSHOP_TEXTS.FILTER_OTHER },
  ]

  return (
    <div className="bg-canvas">
      {/* ============================================================
          Hero
          ============================================================ */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-canvas">
        <div className="blob-bg bg-brand-sunshine" style={{ width: 480, height: 480, top: -120, right: -180, opacity: 0.30 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-bubblegum">PROGRAMS</span>
            <h1 className="hero-display">
              Hands-on workshops for <span className="squiggle-word text-brand-coral">curious kids.</span>
            </h1>
            <p className="lead-text mt-7">{WORKSHOP_TEXTS.PAGE_DESC}</p>
          </div>
        </div>
      </section>

      {/* ============================================================
          Filters (pill tabs)
          ============================================================ */}
      <section className="py-6 bg-canvas border-b border-hairline">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedDuration(f.key as DurationFilter)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  selectedDuration === f.key
                    ? 'bg-ink text-canvas'
                    : 'bg-canvas text-ink-soft border border-hairline hover:bg-surface'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          Cards
          ============================================================ */}
      <section className="py-20 md:py-24 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          {filtered.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-16 h-16 bg-wash-coral rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-brand-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-ink mb-2">{WORKSHOP_TEXTS.EMPTY_TITLE}</h3>
              <p className="text-ink-soft mb-7">{WORKSHOP_TEXTS.EMPTY_DESC}</p>
              {selectedDuration !== WORKSHOP_FILTERS.ALL && (
                <button onClick={() => setSelectedDuration(WORKSHOP_FILTERS.ALL)} className="btn-pill-primary">
                  {WORKSHOP_TEXTS.CLEAR_FILTERS}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((ws) => (
                <div key={ws.slug} className="card-base flex flex-col hover:-translate-y-1 hover:shadow-brand-coral transition-all duration-200">
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <h3 className="text-[20px] font-bold text-ink leading-tight max-w-[65%] line-clamp-3 tracking-tight">
                      <Link
                        to={`/workshops/${ws.slug}`}
                        className="hover:text-brand-coral focus:underline outline-none transition-colors"
                        aria-label={`View details for ${ws.title}`}
                      >
                        {ws.title}
                      </Link>
                    </h3>
                    <span className="text-[11px] font-bold uppercase tracking-[0.10em] text-brand-coral bg-wash-coral px-3 py-1.5 rounded-full max-w-[40%] line-clamp-2 text-center">
                      {ws.targetAudience || 'All levels'}
                    </span>
                  </div>
                  <p className="text-[15px] text-ink-soft mb-4 line-clamp-4 leading-relaxed">{ws.overview}</p>
                  {ws.highlights && (
                    <ul className="space-y-1.5 mb-6 text-[14px] text-ink-soft">
                      {ws.highlights.map((item) => (
                        <li key={item} className="line-clamp-2 flex gap-2">
                          <span className="text-brand-coral font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-auto space-y-3 pt-4 border-t border-hairline">
                    <div className="flex items-center text-sm text-ink-soft font-medium">
                      <svg className="w-4 h-4 mr-2 text-brand-bubblegum" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M8 2v3M16 2v3M3 9h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="line-clamp-2">{ws.duration}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/workshops/${ws.slug}`} className="btn-pill-secondary flex-1 text-center">
                        {WORKSHOP_TEXTS.VIEW_DETAILS}
                      </Link>
                      <Link to={`/book?workshop=${ws.slug}`} className="btn-pill-primary flex-1 text-center">
                        {WORKSHOP_TEXTS.BOOK}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          Final CTA
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
              FOR SCHOOLS
            </span>
            <div className="relative">
              <span className="text-[13px] font-bold uppercase tracking-[0.10em] text-white/85">
                CUSTOM PROGRAMS
              </span>
              <h2 className="text-[40px] md:text-[52px] font-bold leading-[1.05] tracking-tight mt-3 mb-5 max-w-2xl">
                Bring Airbotix to your school.
              </h2>
              <p className="text-white/90 text-[18px] max-w-xl mb-9 leading-relaxed">
                Tailored programs for different age groups, class sizes, and learning objectives. Let's build one for your students.
              </p>
              <Link to="/contact" className="btn-pill-on-color">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Workshops
