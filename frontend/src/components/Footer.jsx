import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { brandConfig } from '../data/brandConfig';
import { contactInfo } from '../data/contactInfo';
import { apiUrl } from '../config/api';

import { FaViber, FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const [topBrands, setTopBrands] = useState(['Honda', 'Yamaha', 'Kawasaki', 'BMW', 'Ducati']);

  useEffect(() => {
    fetch(apiUrl('/api/bikes'))
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const counts = {};
          data.filter(bike => bike.status === 'Available' || !bike.status).forEach(bike => {
            if (bike.brand) {
              const brand = bike.brand.trim();
              counts[brand] = (counts[brand] || 0) + 1;
            }
          });

          const sorted = Object.keys(counts)
            .sort((a, b) => {
              const diff = counts[b] - counts[a];
              if (diff !== 0) return diff;
              return a.localeCompare(b);
            })
            .slice(0, 5);

          if (sorted.length > 0) {
            setTopBrands(sorted);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to aggregate top brands for footer:', err);
      });
  }, []);

  return (
    <footer className="footer border-top border-secondary-subtle" style={{ backgroundColor: 'var(--bg-void)', paddingTop: '80px', paddingBottom: '40px' }}>
      <Container>
        <Row className="gy-5 mb-5">
          <Col lg={4} md={12}>
            <div className="d-flex align-items-center gap-3 mb-4">
              <img 
                src="/static_data/Katingin_logo.webp" 
                alt="Katingin Bikes Logo" 
                style={{ height: '40px', width: 'auto', borderRadius: '4px' }} 
              />
              <h3 className="moto-heading mb-0" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                {brandConfig.name} <span className="text-secondary fw-normal fs-6 ms-1">BY</span> <span className="text-accent ms-1">REVLINE</span>
              </h3>
            </div>
            <p className="text-secondary mb-4 mx-lg-0 mx-auto" style={{ fontSize: '0.92rem', lineHeight: '1.8', maxWidth: '360px' }}>
              {brandConfig.description}
            </p>
            <div className="d-flex gap-3 mt-4">
              <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Follow Katingin Bikes on Facebook">
                <FaFacebookF size={18} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Follow Katingin Bikes on Instagram">
                <FaInstagram size={18} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Subscribe to Katingin Bikes on YouTube">
                <FaYoutube size={18} />
              </a>
              <a href={`viber://chat?number=%2B${contactInfo.viber.replace(/^0/, '63')}`} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Chat with Katingin Bikes on Viber">
                <FaViber size={18} />
              </a>
            </div>
          </Col>
          
          <Col lg={2} md={4}>
            <h5 className="moto-heading mb-4 text-mono" style={{ fontSize: '0.95rem', letterSpacing: '1px' }}>QUICK NAVIGATION</h5>
            <ul className="list-unstyled d-flex flex-column gap-3 mb-0" style={{ fontSize: '0.92rem' }}>
              <li><Link to="/" className="text-secondary text-decoration-none hover-accent">Home</Link></li>
              <li><Link to="/inventory" className="text-secondary text-decoration-none hover-accent">Showroom Inventory</Link></li>
              <li><Link to="/financing" className="text-secondary text-decoration-none hover-accent">Loan Financing</Link></li>
              <li><Link to="/contact" className="text-secondary text-decoration-none hover-accent">Contact Support</Link></li>
              <li><Link to="/privacy-policy" className="text-secondary text-decoration-none hover-accent">Privacy Policy</Link></li>
            </ul>
          </Col>

          <Col lg={3} md={4}>
            <h5 className="moto-heading mb-4 text-mono" style={{ fontSize: '0.95rem', letterSpacing: '1px' }}>TOP BRANDS</h5>
            <ul className="list-unstyled d-flex flex-column gap-3 mb-0" style={{ fontSize: '0.92rem' }}>
              {topBrands.map((brand) => (
                <li key={brand}>
                  <Link to={`/inventory?brand=${encodeURIComponent(brand)}`} className="text-secondary text-decoration-none hover-accent">
                    Pre-Owned {brand}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>
          
          <Col lg={3} md={4}>
            <h5 className="moto-heading mb-4 text-mono" style={{ fontSize: '0.95rem', letterSpacing: '1px' }}>DIRECT CONTACT</h5>
            <ul className="list-unstyled d-flex flex-column gap-3 text-secondary mb-0" style={{ fontSize: '0.92rem' }}>
              <li className="d-flex align-items-center gap-3 p-2 rounded glass-panel">
                <Phone size={18} className="text-accent flex-shrink-0" />
                <span className="text-mono">{contactInfo.phone}</span>
              </li>
              <li className="d-flex align-items-center gap-3 p-2 rounded glass-panel">
                <Mail size={18} className="text-accent flex-shrink-0" />
                <span className="text-break text-mono">{contactInfo.email}</span>
              </li>
            </ul>
          </Col>
        </Row>
        
        <div className="text-center pt-5 mt-4" style={{ borderTop: '1px solid var(--border-color)', opacity: 0.9 }}>
          <div className="d-inline-flex flex-column flex-sm-row align-items-center gap-3 mb-4 px-4 py-3 rounded glass-panel border border-secondary-subtle">
            <span className="text-secondary text-mono" style={{ fontSize: '0.8rem', letterSpacing: '1.5px', fontWeight: 700 }}>POWERED BY</span>
            <img 
              src="/static_data/revline_logo.png" 
              alt="REVLINE Dealership Web Platform" 
              style={{ height: '48px', width: 'auto', filter: 'invert(1) brightness(1.2)' }} 
            />
          </div>
          <p className="text-secondary mb-0 text-mono" style={{ fontSize: '0.82rem', letterSpacing: '0.5px' }}>
            &copy; {new Date().getFullYear()} {brandConfig.fullName}. All rights reserved.
          </p>
          <p className="text-muted mt-3 mb-0 mx-auto" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', maxWidth: '640px', lineHeight: '1.6' }}>
            Disclaimer: All motorcycle brand names, logos, and trademarks displayed on this website are the property of their respective owners. {brandConfig.fullName} is an independent platform and does not claim ownership or official affiliation with these brands.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
