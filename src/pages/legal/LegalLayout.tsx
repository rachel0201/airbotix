import { type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface LegalLayoutProps {
  eyebrow: string
  title: string
  source: string
  intro?: ReactNode
}

const LegalLayout = ({ eyebrow, title, source, intro }: LegalLayoutProps) => {
  return (
    <div className="bg-canvas">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-24 bg-canvas">
        <div className="blob-bg bg-brand-sky" style={{ width: 420, height: 420, top: -120, right: -180, opacity: 0.20 }} aria-hidden="true" />

        <div className="relative max-w-[820px] mx-auto px-6 sm:px-8 lg:px-12">
          <span className="eyebrow eyebrow-sky">{eyebrow}</span>
          <h1 className="text-[40px] md:text-[52px] font-bold leading-[1.1] tracking-tight text-ink mt-3">
            {title}
          </h1>
          {intro && <div className="mt-7 text-[16px] text-ink-soft leading-relaxed">{intro}</div>}
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 bg-canvas">
        <div className="max-w-[820px] mx-auto px-6 sm:px-8 lg:px-12">
          <article className="legal-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {source}
            </ReactMarkdown>
          </article>
        </div>
      </section>
    </div>
  )
}

export default LegalLayout
