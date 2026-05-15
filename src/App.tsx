import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Book from './pages/Book'
import Media from './pages/Media'
import BlogList from './pages/Blog/BlogList'
import BlogDetail from './pages/Blog/BlogDetail'
import FAQ from './pages/FAQ'
import Programs from './pages/programs/Programs'
import OneOnOne from './pages/programs/OneOnOne'
import Classes from './pages/programs/Classes'
import Platform from './pages/programs/Platform'
import Privacy from './pages/legal/Privacy'
import Terms from './pages/legal/Terms'
import ParentalConsent from './pages/legal/ParentalConsent'
import Compliance from './pages/legal/Compliance'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/programs/classes" element={<Classes />} />
        <Route path="/programs/one-on-one" element={<OneOnOne />} />
        <Route path="/programs/platform" element={<Platform />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/book" element={<Book />} />
        <Route path="/media" element={<Media />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/parental-consent" element={<ParentalConsent />} />
        <Route path="/compliance" element={<Compliance />} />
      </Routes>
    </Layout>
  )
}

export default App
