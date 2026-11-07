import { Link } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import { FiFacebook } from 'react-icons/fi';
import { contactInfo } from '../data/contactInfo';
import { getContactLinks, openViber } from '../utils/contactLinks';

/** Home panel: financing pitch on the left, the three direct channels on the right. */
const FinancingContactPanel = () => {
  const links = getContactLinks();

  return (
    <section className="kb-section" aria-label="Financing and contact">
      <div className="container">
        <div className="moto-card kb-panel-split">
          <div className="align-items-start gap-3">
            <h2 className="kb-h2 m-0">Low downpayment financing</h2>
            <p className="kb-body-lg m-0" style={{ maxWidth: '460px' }}>
              Tell us the bike you want and send your details. We will contact you directly about your financing options.
            </p>
            <Link to="/financing" className="moto-btn mt-2">Inquire for financing</Link>
          </div>

          <div className="gap-3">
            <a href={links.viber} onClick={openViber} target="_blank" rel="noreferrer" className="kb-contact-link">
              <MessageCircle size={24} strokeWidth={1.75} aria-hidden="true" />
              <span className="kb-contact-text">
                <span className="kb-label">Viber</span>
                <span className="kb-contact-value kb-num">{contactInfo.viber}</span>
              </span>
            </a>
            <a href={links.facebook} target="_blank" rel="noreferrer" className="kb-contact-link">
              <FiFacebook size={24} strokeWidth={1.75} aria-hidden="true" />
              <span className="kb-contact-text">
                <span className="kb-label">Messenger</span>
                <span className="kb-contact-value">Katingin Bikes</span>
              </span>
            </a>
            <a
              href={links.email}
              target={links.isMobile ? undefined : '_blank'}
              rel={links.isMobile ? undefined : 'noreferrer'}
              className="kb-contact-link"
            >
              <Mail size={24} strokeWidth={1.75} aria-hidden="true" />
              <span className="kb-contact-text">
                <span className="kb-label">Email, for financing requirements only</span>
                <span className="kb-contact-value">{contactInfo.email}</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinancingContactPanel;
