import { Link } from 'react-router-dom'
import { BlogPost } from '../../types/blog'
import { formatDate } from '../../utils'
import { BLOG_META_TEXTS, BLOG_BUTTON_TEXTS } from '../../constants/blog'

interface BlogCardProps {
  post: BlogPost
  className?: string
}

const BlogCard = ({ post, className = '' }: BlogCardProps) => {
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'blog':      return 'bg-wash-coral text-brand-coral'
      case 'news':      return 'bg-wash-bubblegum text-brand-bubblegum'
      case 'resources': return 'bg-wash-mint text-emerald-700'
      default:          return 'bg-surface text-ink-soft'
    }
  }

  return (
    <article className={`bg-canvas-pure rounded-2xl shadow-card-soft hover:-translate-y-1 hover:shadow-brand-coral transition-all duration-200 overflow-hidden ${className}`}>
      {/* Featured Image */}
      {post.featuredImage && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Category and Date */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] ${getCategoryStyle(post.category)}`}>
            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
          </span>
          <span className="text-[13px] text-slate-500 font-medium">{formatDate(post.publishDate)}</span>
        </div>

        {/* Title */}
        <h3 className="text-[20px] font-bold text-ink mb-3 line-clamp-2 leading-tight tracking-tight">
          <Link
            to={`/blog/${post.slug}`}
            className="hover:text-brand-coral focus:underline outline-none transition-colors"
          >
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-[15px] text-ink-soft mb-4 line-clamp-3 leading-relaxed">{post.excerpt}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-surface text-ink-soft text-[12px] rounded-md font-medium"
            >
              {tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="px-2.5 py-1 bg-surface text-ink-soft text-[12px] rounded-md font-medium">
              +{post.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Author and Read Time */}
        <div className="flex items-center justify-between text-[13px] text-slate-500 pt-4 border-t border-hairline">
          <span>{BLOG_META_TEXTS.BY} <span className="text-ink font-semibold">{post.author}</span></span>
          <span>{post.readTime} {BLOG_META_TEXTS.MIN_READ}</span>
        </div>

        {/* Read More Button */}
        <div className="mt-4">
          <Link to={`/blog/${post.slug}`} className="btn-pill-secondary w-full text-center">
            {BLOG_BUTTON_TEXTS.READ_MORE}
          </Link>
        </div>
      </div>
    </article>
  )
}

export default BlogCard
