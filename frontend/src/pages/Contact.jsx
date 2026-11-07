import { Mail, MessageCircle } from 'lucide-react';
import { FiFacebook } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { contactInfo } from '../data/contactInfo';
import { getContactLinks, openViber } from '../utils/contactLinks';

const Contact = () => {
  const links = getContactLinks();

  return (
    <div className="contact-page">
      <Helmet>
        <title>Contact Us | Katingin Bikes | Big Bikes Metro Manila</title>
        <meta name="description" content="Get in touch with Katingin Bikes. Contact us via Viber, Messenger, or Email to verify pre-owned big bike availability and schedules in Metro Manila." />
        <meta property="og:title" content="Contact Us | Katingin Bikes | Big Bikes Metro Manila" />
        <meta property="og:description" content="Get in touch directly via Viber, Facebook Messenger, or Email to ask about our premium pre-owned big bikes." />
        <meta property="og:image" content="https://katinginbikes.com/static_data/Katingin_logo.png" />
        <meta property="og:url" content="https://katinginbikes.com/contact" />
      </Helmet>

      <header className="container kb-page-head d-flex flex-column align-items-start gap-3">
        <h1 className="kb-display-lg kb-page-title">Contact</h1>
        <p className="kb-body-lg m-0" style={{ maxWidth: '560px' }}>
          Operational transparency is our priority. Reach out to us directly for immediate inquiries.
        </p>
      </header>

      <section className="container pt-3" aria-label="Direct channels">
        <div className="d-flex flex-column gap-3" style={{ maxWidth: '640px' }}>
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
      </section>
    </div>
  );
};

export default Contact;
