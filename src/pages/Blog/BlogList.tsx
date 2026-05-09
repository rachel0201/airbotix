import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { blogPosts } from '../../data/blog-posts'
import { blogCategories } from '../../data/blog-categories'
import BlogCard from '../../components/Blog/BlogCard'
import {
  BLOG_PAGE_DESCRIPTIONS,
  BLOG_BUTTON_TEXTS,
  BLOG_CATEGORY_NAMES,
  BLOG_SEARCH_PLACEHOLDERS,
} from '../../constants/blog'

const BlogList = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleCategoryChange = (category: string) => {
    if (category !== selectedCategory && blogPosts.length > 10) {
      setIsLoading(true)
      setTimeout(() => setIsLoading(false), 200)
    }
    setSelectedCategory(category)
  }

  const handleSearchChange = (term: string) => setSearchTerm(term)

  useEffect(() => {
    if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  const filteredPosts = useMemo(() => {
    let filtered = blogPosts.filter(post => post.isPublished)
    if (selectedCategory) filtered = filtered.filter(post => post.category === selectedCategory)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        post.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }
    return filtered.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
  }, [selectedCategory, searchTerm])

  const filterBtn = (active: boolean) =>
    `px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
      active ? 'bg-ink text-canvas' : 'bg-canvas text-ink-soft border border-hairline hover:bg-surface'
    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`

  return (
    <div className="bg-canvas">
      {/* ============================================================
          Hero
          ============================================================ */}
      <section className="relative overflow-hidden py-24 md:py-28 bg-canvas">
        <div className="blob-bg bg-brand-sky" style={{ width: 480, height: 480, top: -100, right: -180, opacity: 0.30 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-sky">BLOG</span>
            <h1 className="hero-display">
              Notes from the <span className="squiggle-word text-brand-coral">classroom.</span>
            </h1>
            <p className="lead-text mt-7">{BLOG_PAGE_DESCRIPTIONS.HERO}</p>
          </div>
        </div>
      </section>

      {/* ============================================================
          Filters and Search
          ============================================================ */}
      <section className="py-6 bg-canvas border-b border-hairline">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('')}
                disabled={isLoading}
                className={filterBtn(selectedCategory === '')}
              >
                {BLOG_CATEGORY_NAMES.ALL}
              </button>
              {blogCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.slug)}
                  disabled={isLoading}
                  className={filterBtn(selectedCategory === category.slug)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={BLOG_SEARCH_PLACEHOLDERS.ARTICLES}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-hairline bg-canvas-pure text-ink text-[14px] placeholder:text-stone focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 outline-none transition-colors"
              />
              <svg
                className="absolute left-3 top-3 h-4 w-4 text-stone"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Blog Posts
          ============================================================ */}
      <section className="py-20 md:py-24 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-coral"></div>
                <span className="ml-3 text-lg text-ink-soft">{BLOG_BUTTON_TEXTS.LOADING_ARTICLES}</span>
              </div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-16 h-16 bg-wash-coral rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-brand-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-ink mb-3 tracking-tight">
                {searchTerm || selectedCategory ? BLOG_PAGE_DESCRIPTIONS.NO_ARTICLES_FOUND : BLOG_PAGE_DESCRIPTIONS.NO_ARTICLES_AVAILABLE}
              </h3>
              <p className="text-ink-soft mb-7">
                {searchTerm || selectedCategory
                  ? BLOG_PAGE_DESCRIPTIONS.TRY_ADJUSTING
                  : BLOG_PAGE_DESCRIPTIONS.CHECK_BACK_SOON}
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('') }}
                  className="btn-pill-primary"
                >
                  {BLOG_BUTTON_TEXTS.CLEAR_FILTERS}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          Final CTA — sky promo
          ============================================================ */}
      <section className="py-20 md:py-24 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="rounded-hero p-12 md:p-16 text-white shadow-brand-sky bg-grad-sky relative overflow-hidden">
            <div
              className="absolute rounded-full pointer-events-none"
              style={{ top: -160, right: -160, width: 460, height: 460, background: 'rgba(255,255,255,0.12)' }}
              aria-hidden="true"
            />
            <span
              className="sticker-sunshine alt"
              style={{ position: 'absolute', top: 36, right: 56 }}
            >
              MONTHLY DIGEST
            </span>
            <div className="relative">
              <span className="text-[13px] font-bold uppercase tracking-[0.10em] text-white/85">
                STAY IN TOUCH
              </span>
              <h2 className="text-[40px] md:text-[52px] font-bold leading-[1.05] tracking-tight mt-3 mb-5 max-w-2xl">
                Stay updated with Airbotix.
              </h2>
              <p className="text-white/90 text-[18px] max-w-xl mb-9 leading-relaxed">
                Latest insights on AI and robotics education, plus exclusive resources for parents and educators.
              </p>
              <Link to="/contact" className="btn-pill-on-color">
                Subscribe to Our Newsletter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BlogList
