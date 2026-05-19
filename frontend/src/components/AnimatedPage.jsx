import { useLocation } from 'react-router-dom';
import { useReveal } from '../hooks/useReveal';

/**
 * A wrapper component that applies a premium entry animation (fade-in + slide-up)
 * to any page whenever routes change.
 */
const AnimatedPage = ({ children }) => {
  const { pathname } = useLocation();

  // Re-run scroll-reveal registration whenever the page changes
  useReveal();

  return (
    <div key={pathname} className="page-fade-in">
      {children}
    </div>
  );
};

export default AnimatedPage;
