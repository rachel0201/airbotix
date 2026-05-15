import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ALT_TEXTS, LOGO_SIZES, RESPONSIVE_LOGOS } from '../constants/assets'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/programs', label: 'Programs' },
  { to: '/about', label: 'About' },
  { to: '/media', label: 'Media' },
  { to: '/blog', label: 'Blog' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
] as const

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  const navLink = 'text-ink-soft hover:text-ink px-3 py-2 rounded-md text-[15px] font-medium transition-colors'
  const navLinkMobile = 'block text-ink-soft hover:text-ink px-3 py-2 rounded-md text-base font-medium'

  return (
    <header className="bg-canvas/95 backdrop-blur-sm border-b border-hairline-soft sticky top-0 z-50">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src={RESPONSIVE_LOGOS.HEADER.MOBILE}
                alt={ALT_TEXTS.LOGO_MAIN}
                className={`${LOGO_SIZES.HEADER.HEIGHT} ${LOGO_SIZES.HEADER.WIDTH} ${LOGO_SIZES.HEADER.MAX_WIDTH} block md:hidden`}
              />
              <img
                src={RESPONSIVE_LOGOS.HEADER.DESKTOP}
                alt={ALT_TEXTS.LOGO_MAIN}
                className={`${LOGO_SIZES.HEADER.HEIGHT} ${LOGO_SIZES.HEADER.WIDTH} ${LOGO_SIZES.HEADER.MAX_WIDTH} hidden md:block`}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={navLink}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right Section — single primary CTA */}
          <div className="hidden md:flex items-center">
            <Link to="/book" className="btn-pill-primary">
              Book a Consult
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-ink-soft hover:text-ink focus:outline-none"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-hairline-soft">
              {NAV_LINKS.map((l) => (
                <Link key={l.to} to={l.to} className={navLinkMobile} onClick={closeMenu}>
                  {l.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-hairline-soft mt-4">
                <Link to="/book" className="btn-pill-primary w-full text-center block" onClick={closeMenu}>
                  Book a Consult
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
