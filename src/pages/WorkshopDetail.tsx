import { useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { workshops } from '../data/workshops'

const WorkshopDetail = () => {
  const { id } = useParams<{ id: string }>()
  const item = useMemo(() => workshops.find((w) => w.slug === id), [id])

  useEffect(() => {
    if (item?.seo?.title) document.title = item.seo.title
    if (item?.seo?.description) {
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', item.seo.description)
    }
  }, [item])

  if (!item) {
    return (
      <div className="bg-canvas min-h-screen">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 py-24 text-center">
          <h1 className="text-3xl font-bold text-ink mb-5">Workshop Not Found</h1>
          <Link to="/workshops" className="btn-pill-primary">Back to Workshops</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-canvas">
      {/* ============================================================
          Header
          ============================================================ */}
      <section className="relative overflow-hidden py-20 md:py-24 bg-canvas">
        <div className="blob-bg bg-brand-coral" style={{ width: 460, height: 460, top: -100, right: -160, opacity: 0.25 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <Link to="/workshops" className="inline-flex items-center text-sm font-semibold text-brand-coral hover:underline">
            ← Back to Workshops
          </Link>
          <div className="max-w-3xl mt-5">
            <span className="eyebrow">WORKSHOP</span>
            <h1 className="text-[40px] md:text-[60px] font-bold text-ink leading-[1.05] tracking-tight">{item.title}</h1>
            {item.subtitle && (
              <div className="mt-3 text-brand-coral font-semibold text-[18px]">{item.subtitle}</div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="sticker-coral">{item.targetAudience}</span>
              <span className="sticker-bubblegum alt">{item.duration}</span>
            </div>
            <p className="mt-7 text-[18px] text-ink-soft leading-relaxed max-w-2xl">{item.overview}</p>
          </div>
        </div>
      </section>

      {/* ============================================================
          Outcomes & Outline
          ============================================================ */}
      <section className="py-16 md:py-20 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <span className="eyebrow eyebrow-mint">LEARNING OUTCOMES</span>
            <h2 className="section-heading mt-1 mb-6" style={{fontSize: '32px'}}>What kids will learn.</h2>
            <ul className="space-y-3 text-ink-soft text-[16px]">
              {item.learningOutcomes.map((o) => (
                <li key={o} className="flex gap-3">
                  <span className="text-brand-mint font-bold mt-0.5">✓</span>
                  <span className="leading-relaxed">{o}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="eyebrow eyebrow-bubblegum">WORKSHOP OUTLINE</span>
            <h2 className="section-heading mt-1 mb-6" style={{fontSize: '32px'}}>Day by day.</h2>
            <div className="space-y-4">
              {item.syllabus.map((s) => (
                <div key={s.day} className="card-base">
                  <div className="font-bold text-ink mb-1 text-[17px]">Day {s.day}: {s.title}</div>
                  <div className="text-[13px] text-slate-500 mb-3">Objective: {s.objective}</div>
                  <ul className="text-ink-soft space-y-1 text-[14px]">
                    {s.activities.map((t) => (
                      <li key={t} className="flex gap-2">
                        <span className="text-brand-coral">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Materials
          ============================================================ */}
      <section className="py-16 md:py-20 bg-wash-sky">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-8">
            <span className="eyebrow eyebrow-sky">MATERIALS</span>
            <h2 className="section-heading mt-1" style={{fontSize: '32px'}}>What we bring.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: 'Hardware', items: item.materials.hardware, tone: 'coral' as const },
              { title: 'Software', items: item.materials.software, tone: 'bubblegum' as const },
              { title: 'Online Resources', items: item.materials.onlineResources, tone: 'mint' as const },
            ].map((cat) => (
              <div key={cat.title} className="card-base relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-grad-${cat.tone}`} />
                <h3 className="font-bold text-ink mb-3 mt-2 text-[18px]">{cat.title}</h3>
                <ul className="text-ink-soft space-y-1.5 text-[14px]">
                  {cat.items.map((m) => (
                    <li key={m} className="flex gap-2">
                      <span className="text-brand-coral">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          Assessment
          ============================================================ */}
      <section className="py-16 md:py-20 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-8">
            <span className="eyebrow">ASSESSMENT</span>
            <h2 className="section-heading mt-1" style={{fontSize: '32px'}}>How we measure progress.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {item.assessment.map((a) => (
              <div key={a.item} className="card-base">
                <div className="font-bold text-ink text-[17px]">{a.item}</div>
                <div className="text-[12px] font-semibold uppercase tracking-wider text-brand-coral mt-1.5">Weight: {a.weight}</div>
                {a.criteria && (
                  <div className="text-[14px] text-ink-soft mt-3 leading-relaxed">{a.criteria}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          Media
          ============================================================ */}
      {(item.media?.video || item.media?.photos) && (
        <section className="py-16 md:py-20 bg-canvas">
          <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 space-y-8">
            {item.media?.video && (
              <figure>
                <video controls poster={item.media.video.poster} className="w-full rounded-3xl shadow-card-soft">
                  <source src={item.media.video.src} />
                </video>
                {item.media.video.caption && (
                  <figcaption className="text-[14px] text-slate-500 mt-3 italic">{item.media.video.caption}</figcaption>
                )}
              </figure>
            )}
            {item.media?.photos && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {item.media.photos.map((p) => (
                  <div key={p.src} className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-surface shadow-card-soft">
                    <img src={p.src} alt={p.alt || 'workshop'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============================================================
          CTA
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
              CUSTOMISABLE
            </span>
            <div className="relative">
              <span className="text-[13px] font-bold uppercase tracking-[0.10em] text-white/85">
                READY TO BOOK?
              </span>
              <h2 className="text-[40px] md:text-[52px] font-bold leading-[1.05] tracking-tight mt-3 mb-5 max-w-2xl">
                Bring this workshop to your school.
              </h2>
              <p className="text-white/90 text-[18px] max-w-xl mb-9 leading-relaxed">
                We tailor content to suit your class size, schedule, and learning goals.
              </p>
              <Link to={`/book?workshop=${item.slug}`} className="btn-pill-on-color">
                Book This Workshop
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default WorkshopDetail
