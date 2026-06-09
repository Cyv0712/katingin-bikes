import { Container, Row, Col } from 'react-bootstrap';
import { Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { brandConfig } from '../data/brandConfig';
import { contactInfo } from '../data/contactInfo';

// Import FontAwesome versions for specific brand logos that Lucide lacks
import { FaViber, FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer" style={{ backgroundColor: 'var(--bg-void)', borderTop: '1px solid var(--border-color)', paddingTop: '80px', paddingBottom: '40px' }}>
      <Container>
        <Row className="gy-5 mb-5">
          <Col lg={4} md={12}>
            <h3 className="moto-heading mb-4" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {brandConfig.name} <span className="text-accent">{brandConfig.brandSuffix}</span>
            </h3>
            <p className="text-secondary mb-4 mx-lg-0 mx-auto" style={{ fontSize: '0.95rem', lineHeight: '1.8', maxWidth: '350px' }}>
              {brandConfig.description}
            </p>
            <div className="d-flex gap-3 mt-4">
              <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Follow Katingin Bikes on Facebook">
                <FaFacebookF size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Follow Katingin Bikes on Instagram">
                <FaInstagram size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Subscribe to Katingin Bikes on YouTube">
                <FaYoutube size={20} />
              </a>
              <a href={`viber://chat?number=%2B${contactInfo.viber.replace(/^0/, '63')}`} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Chat with Katingin Bikes on Viber">
                <FaViber size={20} />
              </a>
            </div>
          </Col>
          
          <Col lg={2} md={4} className="offset-lg-1">
            <h5 className="moto-heading mb-4" style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>QUICK LINKS</h5>
            <ul className="list-unstyled d-flex flex-column gap-3">
              <li><Link to="/" className="text-secondary text-decoration-none hover-accent">Home</Link></li>
              <li><Link to="/inventory" className="text-secondary text-decoration-none hover-accent">Inventory</Link></li>
              {/* <li><Link to="/buyers" className="text-secondary text-decoration-none hover-accent">Happy Buyers</Link></li> */}
              <li><Link to="/contact" className="text-secondary text-decoration-none hover-accent">Contact Us</Link></li>
              <li><Link to="/privacy-policy" className="text-secondary text-decoration-none hover-accent">Privacy Policy</Link></li>
            </ul>
          </Col>
          
          <Col lg={4} md={8} className="offset-lg-1">
            <h5 className="moto-heading mb-4" style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>CONTACT US</h5>
            <ul className="list-unstyled d-flex flex-column gap-4 text-secondary" style={{ fontSize: '0.95rem' }}>
              {/* Address removed as per new business model */}
              <li className="d-flex align-items-center gap-3">
                <Phone size={22} className="text-accent flex-shrink-0" />
                <span>{contactInfo.phone}</span>
              </li>
              <li className="d-flex align-items-center gap-3">
                <Mail size={22} className="text-accent flex-shrink-0" />
                <span className="text-break">{contactInfo.email}</span>
              </li>
            </ul>
          </Col>
        </Row>
        
        <div className="text-center pt-5 mt-4" style={{ borderTop: '1px solid var(--border-color)', opacity: 0.8 }}>
          <p className="text-secondary mb-0" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
            &copy; {new Date().getFullYear()} {brandConfig.fullName}. All rights reserved.
          </p>
          <p className="text-secondary mt-3 mb-0 mx-auto" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', opacity: 0.7, maxWidth: '600px', lineHeight: '1.5' }}>
            Disclaimer: All motorcycle brand names, logos, and trademarks displayed on this website are the property of their respective owners. {brandConfig.fullName} is an independent platform and does not claim ownership or affiliation with these brands.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
