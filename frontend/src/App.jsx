import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { Analytics } from '@vercel/analytics/react';
import AnimatedPage from './components/AnimatedPage';
import SplashScreen from './components/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load page components to improve initial load speed (FCP)
const Home = lazy(() => import('./pages/Home'));
const Inventory = lazy(() => import('./pages/Inventory'));
const BikeDetails = lazy(() => import('./pages/BikeDetails'));
const ShowcaseDetails = lazy(() => import('./pages/ShowcaseDetails'));
// const About = lazy(() => import('./pages/About'));
// const Buyers = lazy(() => import('./pages/Buyers'));
const Financing = lazy(() => import('./pages/Financing'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Skip splash screen if the user has already loaded/seen it in this session
    return !sessionStorage.getItem('hasSeenSplash');
  });

  // Lock body scroll during splash
  useEffect(() => {
    if (showSplash) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showSplash]);

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  }, []);

  return (
    <Router>
      <Analytics />
      <ScrollToTop />

      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Navbar & Footer hidden during splash to prevent flash-through */}
      {!showSplash && <NavigationBar />}
      <ErrorBoundary>
        <Suspense fallback={
          <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '85vh', backgroundColor: '#080808' }}>
            <div className="spinner-border text-accent" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
            <Route path="/inventory" element={<AnimatedPage><Inventory /></AnimatedPage>} />
            <Route path="/bike/:id" element={<AnimatedPage><BikeDetails /></AnimatedPage>} />
            <Route path="/showcase/:slug" element={<AnimatedPage><ShowcaseDetails /></AnimatedPage>} />
            {/* <Route path="/about" element={<AnimatedPage><About /></AnimatedPage>} /> */}
            {/* <Route path="/buyers" element={<AnimatedPage><Buyers /></AnimatedPage>} /> */}
            <Route path="/financing" element={<AnimatedPage><Financing /></AnimatedPage>} />
            <Route path="/contact" element={<AnimatedPage><Contact /></AnimatedPage>} />
            <Route path="/privacy-policy" element={<AnimatedPage><PrivacyPolicy /></AnimatedPage>} />
            <Route path="/admin" element={<AnimatedPage><Admin /></AnimatedPage>} />
            {/* Wildcard 404 Route */}
            <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      {!showSplash && <Footer />}
    </Router>
  );
}

export default App;
