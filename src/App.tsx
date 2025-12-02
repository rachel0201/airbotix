import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import Layout from './components/Layout';
import Home from './pages/Home';
import Workshops from './pages/Workshops';
import About from './pages/About';
import Contact from './pages/Contact';
import WorkshopDetail from './pages/WorkshopDetail';
import Book from './pages/Book';
import Media from './pages/Media';
import BlogList from './pages/Blog/BlogList';
import BlogDetail from './pages/Blog/BlogDetail';
import FAQ from './pages/FAQ';
import Subscriptions from './pages/Subscriptions';

// Auth pages
import Login from './auth/pages/Login';
import Verify from './auth/pages/Verify';
import Dashboard from './auth/pages/Dashboard';
import ProtectedRoute from './auth/components/ProtectedRoute';

function App() {
  const { initialize } = useAuthStore();

  // Initialize auth state on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Routes>
      {/* Public routes - redirect to dashboard if authenticated */}
      <Route
        path="/login"
        element={
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify"
        element={
          <ProtectedRoute requireAuth={false}>
            <Verify />
          </ProtectedRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Public routes with layout */}
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/workshops" element={<Workshops />} />
              <Route path="/workshops/:id" element={<WorkshopDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/book" element={<Book />} />
              <Route path="/media" element={<Media />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;

