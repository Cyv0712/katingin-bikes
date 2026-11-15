import { Mail, MessageCircle, Phone, Clock } from 'lucide-react';
import { FiFacebook } from 'react-icons/fi';
import Seo from '../seo/Seo';
import { contactMeta } from '../seo/meta';
import { contactInfo } from '../data/contactInfo';
import { getContactLinks, openViber } from '../utils/contactLinks';

const Contact = () => {
  const links = getContactLinks();

  return (
    <div className="contact-page">
      <Seo meta={contactMeta()} />

      <header className="container kb-page-head d-flex flex-column align-items-start gap-3">
        <h1 className="kb-display-lg kb-page-title">Contact</h1>
        <p className="kb-body-lg m-0" style={{ maxWidth: '560px' }}>
          Operational transparency is our priority. Reach out to us directly for immediate inquiries.
        </p>
      </header>

      <section className="container pt-3" aria-label="Direct channels">
        <div className="d-flex flex-column gap-3" style={{ maxWidth: '640px' }}>
          <a
            href={links.viber}
            onClick={openViber}
            target="_blank"
            rel="noreferrer"
            className="kb-contact-link"
            data-umami-event="viber_click"
            data-umami-event-placement="contact"
          >
            <MessageCircle size={24} strokeWidth={1.75} aria-hidden="true" />
            <span className="kb-contact-text">
              <span className="kb-label">Viber</span>
              <span className="kb-contact-value kb-num">{contactInfo.viber}</span>
            </span>
          </a>

          <a
            href={links.messenger}
            target="_blank"
            rel="noreferrer"
            className="kb-contact-link"
            data-umami-event="messenger_click"
            data-umami-event-placement="contact"
          >
            <FiFacebook size={24} strokeWidth={1.75} aria-hidden="true" />
            <span className="kb-contact-text">
              <span className="kb-label">Messenger</span>
              <span className="kb-contact-value">Katingin Bikes</span>
            </span>
          </a>

          <a
            href={links.call}
            className="kb-contact-link"
            data-umami-event="call_click"
            data-umami-event-placement="contact"
          >
            <Phone size={24} strokeWidth={1.75} aria-hidden="true" />
            <span className="kb-contact-text">
              <span className="kb-label">Call</span>
              <span className="kb-contact-value kb-num">{contactInfo.phone}</span>
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

          <p className="kb-body-sm m-0 d-flex align-items-center gap-2" style={{ color: 'var(--ink-muted)' }}>
            <Clock size={18} strokeWidth={1.75} aria-hidden="true" />
            {contactInfo.operatingHours}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Contact;
