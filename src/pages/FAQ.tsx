import { useState } from 'react'
import { Link } from 'react-router-dom'
import { faqCategories } from '../data/faq'

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState(faqCategories[0]?.id || '')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (questionId: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(questionId)) newOpenItems.delete(questionId)
    else newOpenItems.add(questionId)
    setOpenItems(newOpenItems)
  }

  const activeData = faqCategories.find(cat => cat.id === activeCategory)

  return (
    <div className="bg-canvas">
      {/* ============================================================
          Hero
          ============================================================ */}
      <section className="relative overflow-hidden py-24 md:py-28 bg-canvas">
        <div className="blob-bg bg-brand-bubblegum" style={{ width: 480, height: 480, top: -100, right: -180, opacity: 0.30 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-bubblegum">FAQ</span>
            <h1 className="hero-display">
              Quick answers for <span className="squiggle-word text-brand-coral">curious parents.</span>
            </h1>
            <p className="lead-text mt-7">
              Common questions about our AI and robotics programs. Can't find yours? Drop us a message — we read every one.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          FAQ Content
          ============================================================ */}
      <section className="py-16 md:py-20 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Category Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.10em] text-slate-600 mb-4">
                  Categories
                </h3>
                <nav className="space-y-1">
                  {faqCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                        activeCategory === category.id
                          ? 'bg-ink text-canvas'
                          : 'text-ink-soft hover:bg-surface'
                      }`}
                    >
                      <span className="mr-3">{category.icon}</span>
                      {category.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* FAQ Items */}
            <div className="lg:col-span-3">
              {activeData && (
                <div>
                  <h2 className="text-[28px] md:text-[32px] font-bold text-ink mb-8 flex items-center tracking-tight">
                    <span className="mr-3 text-3xl">{activeData.icon}</span>
                    {activeData.title}
                  </h2>
                  <div className="space-y-3">
                    {activeData.items.map((item, index) => {
                      const itemId = `${activeCategory}-${index}`
                      const isOpen = openItems.has(itemId)

                      return (
                        <div
                          key={itemId}
                          className="bg-canvas-pure rounded-2xl border border-hairline overflow-hidden"
                        >
                          <button
                            onClick={() => toggleItem(itemId)}
                            className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-surface transition-colors"
                          >
                            <span className="font-semibold text-ink pr-4 text-[16px]">
                              {item.question}
                            </span>
                            <svg
                              className={`w-5 h-5 text-brand-coral flex-shrink-0 transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-5">
                              <div className="border-t border-hairline-soft pt-4">
                                <p className="text-ink-soft leading-relaxed text-[15px]">
                                  {item.answer}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
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
              WE READ EVERY ONE
            </span>
            <div className="relative">
              <span className="text-[13px] font-bold uppercase tracking-[0.10em] text-white/85">
                STILL WONDERING?
              </span>
              <h2 className="text-[40px] md:text-[52px] font-bold leading-[1.05] tracking-tight mt-3 mb-5 max-w-2xl">
                Ask us anything.
              </h2>
              <p className="text-white/90 text-[18px] max-w-xl mb-9 leading-relaxed">
                Our team is here to help you find the right program for your child or your school.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/contact" className="btn-pill-on-color">Contact Us</Link>
                <Link to="/book" className="inline-flex items-center justify-center bg-transparent text-white text-[15px] font-semibold py-[14px] px-7 rounded-full border-2 border-white/70 hover:bg-white hover:text-ink transition-colors no-underline">
                  Book a Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FAQ
