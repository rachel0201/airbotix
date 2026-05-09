import { useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { blogPosts } from '../../data/blog-posts'
import { blogCategories } from '../../data/blog-categories'
import { formatDate } from '../../utils'
import {
  BLOG_PAGE_TITLES,
  BLOG_PAGE_DESCRIPTIONS,
  BLOG_BUTTON_TEXTS,
  BLOG_META_TEXTS,
} from '../../constants/blog'

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>()
  const post = useMemo(() => blogPosts.find((p) => p.slug === slug), [slug])

  // Update page title and meta description for SEO
  useEffect(() => {
    if (post?.seoTitle) {
      document.title = post.seoTitle
    }
    if (post?.seoDescription) {
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', post.seoDescription)
    }
  }, [post])

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-ink mb-4">{BLOG_PAGE_TITLES.DETAIL}</h1>
          <p className="text-ink-soft mb-6">{BLOG_PAGE_DESCRIPTIONS.NOT_FOUND}</p>
          <Link to="/blog" className="btn-primary">{BLOG_BUTTON_TEXTS.BACK_TO_BLOG}</Link>
        </div>
      </div>
    )
  }

  // Get related posts (same category, excluding current post)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id && p.isPublished)
    .slice(0, 3)

  const getCategoryColor = (category: string) => {
    const cat = blogCategories.find(c => c.slug === category)
    switch (cat?.color) {
      case 'primary':   return 'bg-wash-coral text-brand-coral'
      case 'secondary': return 'bg-wash-bubblegum text-brand-bubblegum'
      case 'green':     return 'bg-wash-mint text-emerald-700'
      default:          return 'bg-surface text-ink-soft'
    }
  }

  return (
    <div className="bg-canvas">
      {/* Header */}
      <section className="relative overflow-hidden py-16 md:py-20 bg-canvas">
        <div className="blob-bg bg-brand-sky" style={{ width: 460, height: 460, top: -100, right: -160, opacity: 0.25 }} aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <Link to="/blog" className="text-brand-coral hover:underline mb-5 inline-block font-semibold text-sm">
            ← {BLOG_BUTTON_TEXTS.BACK_TO_BLOG}
          </Link>
          
          {/* Category Badge */}
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
              {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-ink mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-ink-soft mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{BLOG_META_TEXTS.BY} {post.author}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(post.publishDate)}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{post.readTime} {BLOG_META_TEXTS.MIN_READ}</span>
            </div>
          </div>

          {/* Excerpt */}
          <p className="text-lg text-ink-soft leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Featured Image */}
      {post.featuredImage && (
        <section className="py-8 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-auto rounded-xl shadow-sm"
            />
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="text-ink-soft leading-relaxed"
            />
          </article>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-hairline">
            <h3 className="text-lg font-semibold text-ink mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-surface text-ink-soft text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Share Section */}
          <div className="mt-8 pt-8 border-t border-hairline">
            <h3 className="text-lg font-semibold text-ink mb-4">Share this article</h3>
            <div className="flex gap-3">
              <button 
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Share on Twitter"
                aria-label="Share on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </button>
              <button 
                className="p-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                title="Share on Facebook"
                aria-label="Share on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </button>
              <button 
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Share on LinkedIn"
                aria-label="Share on LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-ink mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.id} className="bg-white border border-hairline rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {relatedPost.featuredImage && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(relatedPost.category)}`}>
                        {relatedPost.category.charAt(0).toUpperCase() + relatedPost.category.slice(1)}
                      </span>
                      <span className="text-sm text-slate-500">{formatDate(relatedPost.publishDate)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-ink mb-2 line-clamp-2">
                      <Link
                        to={`/blog/${relatedPost.slug}`}
                        className="hover:text-brand-coral focus:underline outline-none"
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-ink-soft mb-4 line-clamp-3">{relatedPost.excerpt}</p>
                    <Link
                      to={`/blog/${relatedPost.slug}`}
                      className="text-brand-coral hover:underline font-semibold text-sm"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-24 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="promo-card-coral">
            <div
              className="absolute rounded-full pointer-events-none"
              style={{ top: -160, right: -160, width: 460, height: 460, background: 'rgba(255,255,255,0.12)' }}
              aria-hidden="true"
            />
            <div className="relative">
              <span className="text-[13px] font-bold uppercase tracking-[0.10em] text-white/85">
                NEXT STEP
              </span>
              <h2 className="text-[40px] md:text-[52px] font-bold leading-[1.05] tracking-tight mt-3 mb-5 max-w-2xl">
                Ready to explore AI & robotics?
              </h2>
              <p className="text-white/90 text-[18px] max-w-xl mb-9 leading-relaxed">
                Join our workshops and give your child the skills they need for the future.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/workshops" className="btn-pill-on-color">View Workshops</Link>
                <Link to="/contact" className="inline-flex items-center justify-center bg-transparent text-white text-[15px] font-semibold py-[14px] px-7 rounded-full border-2 border-white/70 hover:bg-white hover:text-ink transition-colors no-underline">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BlogDetail
