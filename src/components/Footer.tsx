import { Link } from 'react-router-dom'
import { ALT_TEXTS, LOGO_SIZES, RESPONSIVE_LOGOS } from '../constants/assets'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-start">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className={`logo-crop-container-footer ${LOGO_SIZES.FOOTER.MAX_WIDTH} mb-5`}>
              <img
                src={RESPONSIVE_LOGOS.FOOTER.MOBILE}
                alt={ALT_TEXTS.LOGO_MAIN}
                className={`${LOGO_SIZES.FOOTER.HEIGHT} ${LOGO_SIZES.FOOTER.WIDTH} logo-crop-footer block md:hidden`}
              />
              <img
                src={RESPONSIVE_LOGOS.FOOTER.DESKTOP}
                alt={ALT_TEXTS.LOGO_MAIN}
                className={`${LOGO_SIZES.FOOTER.HEIGHT} ${LOGO_SIZES.FOOTER.WIDTH} logo-crop-footer hidden md:block`}
              />
            </div>
            <p className="text-white/70 max-w-md leading-relaxed text-[15px]">
              Teaching the next generation of K-12 students to code with AI. Hands-on workshops and
              AI-native curriculum, built with educators across Australia.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="https://www.linkedin.com/company/airbotix-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Programs */}
          <div className="md:col-span-3">
            <div className="text-[11px] font-semibold uppercase text-white/50 mb-4 tracking-[0.12em]">
              Programs
            </div>
            <ul className="space-y-3">
              <li><Link to="/workshops" className="text-white/80 hover:text-white text-[15px] transition-colors">Workshops</Link></li>
              <li><Link to="/workshops" className="text-white/80 hover:text-white text-[15px] transition-colors">AI Coding</Link></li>
              <li><Link to="/workshops" className="text-white/80 hover:text-white text-[15px] transition-colors">Robotics</Link></li>
              <li><Link to="/book" className="text-white/80 hover:text-white text-[15px] transition-colors">Book a Workshop</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <div className="text-[11px] font-semibold uppercase text-white/50 mb-4 tracking-[0.12em]">
              Company
            </div>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-white/80 hover:text-white text-[15px] transition-colors">About</Link></li>
              <li><Link to="/blog" className="text-white/80 hover:text-white text-[15px] transition-colors">Blog</Link></li>
              <li><Link to="/media" className="text-white/80 hover:text-white text-[15px] transition-colors">Media</Link></li>
              <li><Link to="/contact" className="text-white/80 hover:text-white text-[15px] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <div className="text-[11px] font-semibold uppercase text-white/50 mb-4 tracking-[0.12em]">
              Contact
            </div>
            <ul className="space-y-3 text-[15px] text-white/80">
              <li className="leading-relaxed">
                L10b 144 Edward St<br />
                Brisbane City, QLD 4000
              </li>
              <li>
                <a href="mailto:hello@airbotix.ai" className="hover:text-white transition-colors">
                  hello@airbotix.ai
                </a>
              </li>
              <li className="text-white/60 text-sm">ABN: 37 689 925 219</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-14 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-white/50 text-sm">
            © {year} Airbotix. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-white/50 hover:text-white text-sm transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-white/50 hover:text-white text-sm transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
