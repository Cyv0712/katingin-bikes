import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  return (
    <div
      className="d-flex align-items-center justify-content-center text-center"
      style={{ minHeight: '70vh', padding: '64px 20px' }}
    >
      <Helmet><title>Katingin Bikes - Page Not Found</title></Helmet>
      <div className="container">
        <Compass className="text-accent mb-4" size={56} strokeWidth={1.75} aria-hidden="true" />
        <h1 className="kb-display-xl mb-3">404</h1>
        <h2 className="kb-h3 mb-3">Lost the trail?</h2>
        <p className="kb-body-lg mx-auto mb-5" style={{ maxWidth: '500px' }}>
          The page you are looking for has been moved, renamed, or does not exist. Let&apos;s get you back on track to finding your dream ride.
        </p>
        <Link to="/" className="moto-btn">Back to showroom</Link>
      </div>
    </div>
  );
};

export default NotFound;
