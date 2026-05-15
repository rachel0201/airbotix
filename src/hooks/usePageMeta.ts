import { useEffect } from 'react'

interface PageMeta {
  title: string
  description?: string
}

const BASE_TITLE = 'Airbotix — AI coding for K-12'

const ensureMeta = (name: string, content: string) => {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

const ensureOg = (property: string, content: string) => {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.content = content
}

/**
 * Sets document.title + meta description + OG tags for a page.
 * Call from each page component with relevant strings.
 *
 * NOTE: This is client-side only. Social crawlers that don't run JS
 * will see the static fallback in index.html. For full SEO of deep
 * pages, we'd need SSG/SSR — out of scope for V0.
 */
export const usePageMeta = ({ title, description }: PageMeta) => {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE
    document.title = fullTitle
    ensureOg('og:title', fullTitle)
    ensureOg('twitter:title', fullTitle)

    if (description) {
      ensureMeta('description', description)
      ensureOg('og:description', description)
      ensureOg('twitter:description', description)
    }
  }, [title, description])
}
