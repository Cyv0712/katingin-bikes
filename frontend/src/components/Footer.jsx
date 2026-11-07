import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { FiFacebook, FiInstagram } from 'react-icons/fi';
import { Container } from 'react-bootstrap';
import { brandConfig } from '../data/brandConfig';
import { contactInfo } from '../data/contactInfo';
import { openViber, getContactLinks } from '../utils/contactLinks';
import useBikes from '../hooks/useBikes';

const DEFAULT_BRANDS = ['Honda', 'Yamaha', 'Kawasaki', 'BMW', 'Ducati'];

const Footer = () => {
  const { bikes } = useBikes();

  // The five brands we have the most available units of
  const topBrands = useMemo(() => {
    const counts = {};
    bikes.forEach((bike) => {
      if (bike.brand) {
        const brand = bike.brand.trim();
        counts[brand] = (counts[brand] || 0) + 1;
      }
    });

    const sorted = Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))
      .slice(0, 5);

    return sorted.length > 0 ? sorted : DEFAULT_BRANDS;
  }, [bikes]);

  return (
    <footer className="kb-footer">
      <Container>
        <div className="kb-footer-main">
          <div className="d-flex flex-column align-items-start gap-3">
            <div className="kb-brand">
              <img src="/static_data/Katingin_logo.webp" alt="" width="40" height="40" />
              <span className="kb-brand-name">{brandConfig.fullName}</span>
            </div>
            <p className="m-0" style={{ maxWidth: '420px', color: 'var(--ink-muted)' }}>
              {brandConfig.description}
            </p>
            <div className="d-flex gap-2">
              <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Katingin Bikes on Facebook">
                <FiFacebook size={18} strokeWidth={1.75} aria-hidden="true" />
              </a>
              <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Katingin Bikes on Instagram">
                <FiInstagram size={18} strokeWidth={1.75} aria-hidden="true" />
              </a>
              <a href={getContactLinks().viber} onClick={openViber} className="social-link" aria-label="Chat with Katingin Bikes on Viber">
                <MessageCircle size={18} strokeWidth={1.75} aria-hidden="true" />
              </a>
            </div>
          </div>

          <nav aria-label="Footer" className="kb-footer-links">
            <span className="kb-footer-title">Quick navigation</span>
            <Link to="/" className="kb-footer-link">Home</Link>
            <Link to="/inventory" className="kb-footer-link">Inventory</Link>
            <Link to="/financing" className="kb-footer-link">Financing</Link>
            <Link to="/contact" className="kb-footer-link">Contact</Link>
            <Link to="/privacy-policy" className="kb-footer-link">Privacy policy</Link>
            <Link to="/admin" className="kb-footer-link">Admin</Link>
          </nav>

          <nav aria-label="Top brands" className="kb-footer-links">
            <span className="kb-footer-title">Top brands</span>
            {topBrands.map((brand) => (
              <Link key={brand} to={`/inventory?brand=${encodeURIComponent(brand)}`} className="kb-footer-link">
                Pre-owned {brand}
              </Link>
            ))}
          </nav>

          <div className="kb-footer-links">
            <span className="kb-footer-title">Direct contact</span>
            <a href={`tel:${contactInfo.phone}`} className="kb-footer-link kb-num">{contactInfo.phone}</a>
            <a href={`mailto:${contactInfo.email}`} className="kb-footer-link" style={{ overflowWrap: 'anywhere' }}>{contactInfo.email}</a>
          </div>
        </div>

        <div className="kb-footer-legal">
          <span className="kb-caption">&copy; {new Date().getFullYear()} {brandConfig.fullName}. All rights reserved.</span>
          <p className="kb-caption m-0" style={{ maxWidth: '760px' }}>
            All motorcycle brand names, logos, and trademarks shown on this website are the property of their respective owners. {brandConfig.fullName} is an independent platform and does not claim ownership or official affiliation with these brands.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
