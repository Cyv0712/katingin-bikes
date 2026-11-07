import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
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
    // Only play the splash on the first load of a session, not on refreshes
    return !sessionStorage.getItem('hasSeenSplash');
  });

  // Lock scroll during splash. html sets overflow-x: clip, which stops the
  // body value propagating to the viewport, so lock both or a scrollbar
  // shows beside the splash.
  useEffect(() => {
    const lock = showSplash ? 'hidden' : '';
    document.documentElement.style.overflow = lock;
    document.body.style.overflow = lock;
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [showSplash]);

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  }, []);

  return (
    <Router>
      <ScrollToTop />

      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* The whole app renders underneath the splash so the homepage is
          already there when it lifts */}
      <NavigationBar />
      <ErrorBoundary>
        <Suspense fallback={
          <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '85vh' }}>
            <div className="spinner-border text-accent" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
            <Route path="/inventory" element={<AnimatedPage><Inventory /></AnimatedPage>} />
            <Route path="/bike/:slugAndId" element={<AnimatedPage><BikeDetails /></AnimatedPage>} />
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
      <Footer />
    </Router>
  );
}

export default App;
