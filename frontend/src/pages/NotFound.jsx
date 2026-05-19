import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div 
      className="d-flex align-items-center justify-content-center text-center"
      style={{
        minHeight: '80vh',
        marginTop: '76px', // Offset for Navbar
        backgroundColor: '#080808',
        color: '#f0f0f0'
      }}
    >
      <Container>
        <Compass 
          className="text-accent mb-4 animate-pulse" 
          size={72} 
          strokeWidth={1.5}
          style={{ animation: 'pulse 2s infinite' }}
        />
        <h1 
          className="moto-heading mb-3" 
          style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', letterSpacing: '4px' }}
        >
          404
        </h1>
        <h2 
          className="moto-heading mb-4 text-accent" 
          style={{ fontSize: '1.5rem', letterSpacing: '2px' }}
        >
          LOST THE TRAIL?
        </h2>
        <p 
          className="text-secondary mx-auto mb-5" 
          style={{ maxWidth: '500px', fontSize: '1rem', lineHeight: '1.6' }}
        >
          The page you are looking for has been moved, renamed, or does not exist. Let's get you back on track to finding your dream ride.
        </p>
        <Link 
          to="/" 
          className="moto-btn d-inline-flex align-items-center justify-content-center px-5 py-3"
          style={{ letterSpacing: '2px', fontWeight: 700 }}
        >
          BACK TO SHOWROOM
        </Link>
      </Container>
    </div>
  );
};

export default NotFound;
