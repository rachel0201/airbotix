import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ALT_TEXTS, LOGO_SIZES, RESPONSIVE_LOGOS } from '../constants/assets';
import { useAuthStore } from '@/store/authStore';
import LanguageToggle from '@/auth/components/LanguageToggle';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useTranslation()
  const { user, isAuthenticated, logout } = useAuthStore()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
  }

  const navLink = "text-ink-soft hover:text-ink px-3 py-2 rounded-md text-[15px] font-medium transition-colors"
  const navLinkMobile = "block text-ink-soft hover:text-ink px-3 py-2 rounded-md text-base font-medium"

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
            <Link to="/" className={navLink}>{t('nav.home', 'Home')}</Link>
            <Link to="/workshops" className={navLink}>{t('nav.workshops', 'Workshops')}</Link>
            <Link to="/blog" className={navLink}>{t('nav.blog', 'Blog')}</Link>
            <Link to="/media" className={navLink}>{t('nav.media', 'Media')}</Link>
            <Link to="/about" className={navLink}>{t('nav.about', 'About')}</Link>
            <Link to="/faq" className={navLink}>{t('nav.faq', 'FAQ')}</Link>
            <Link to="/contact" className={navLink}>{t('nav.contact', 'Contact')}</Link>
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageToggle />
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-ink-soft">{user?.email}</span>
                <Link to="/dashboard" className={navLink}>
                  {t('nav.dashboard', 'Dashboard')}
                </Link>
                <button onClick={handleLogout} className={navLink}>
                  {t('nav.logout', 'Logout')}
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className={navLink}>{t('nav.login', 'Login')}</Link>
                <Link to="/book" className="btn-pill-primary">
                  {t('nav.bookWorkshop', 'Book a Workshop')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageToggle />
            <button
              onClick={toggleMenu}
              className="text-ink-soft hover:text-ink focus:outline-none"
              aria-label={isMenuOpen ? t('nav.closeMenu', 'Close menu') : t('nav.openMenu', 'Open menu')}
              title={isMenuOpen ? t('nav.closeMenu', 'Close menu') : t('nav.openMenu', 'Open menu')}
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
              <Link to="/" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>{t('nav.home', 'Home')}</Link>
              <Link to="/workshops" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>{t('nav.workshops', 'Workshops')}</Link>
              <Link to="/blog" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>{t('nav.blog', 'Blog')}</Link>
              <Link to="/media" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>{t('nav.media', 'Media')}</Link>
              <Link to="/about" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>{t('nav.about', 'About')}</Link>
              <Link to="/faq" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>{t('nav.faq', 'FAQ')}</Link>
              <Link to="/contact" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>{t('nav.contact', 'Contact')}</Link>

              {isAuthenticated ? (
                <div className="pt-4 border-t border-hairline-soft mt-4">
                  <div className="px-3 py-2 text-sm text-ink-soft">{user?.email}</div>
                  <Link to="/dashboard" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>
                    {t('nav.dashboard', 'Dashboard')}
                  </Link>
                  <button onClick={handleLogout} className={`${navLinkMobile} w-full text-left`}>
                    {t('nav.logout', 'Logout')}
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-hairline-soft mt-4 space-y-2">
                  <Link to="/login" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>{t('nav.login', 'Login')}</Link>
                  <Link to="/book" className="btn-pill-primary w-full" onClick={() => setIsMenuOpen(false)}>
                    {t('nav.bookWorkshop', 'Book a Workshop')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
