import { Container, Row, Col } from 'react-bootstrap';
import { Mail } from 'lucide-react';
import { FaFacebookF, FaViber } from 'react-icons/fa';
import { contactInfo } from '../data/contactInfo';
import Reveal from '../components/Reveal';
import { Helmet } from 'react-helmet-async';

const Contact = () => {
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const cleanNumber = contactInfo.viber.replace(/^0/, '63');
  const viberLink = isMobile
    ? `viber://chat/?number=%2B${cleanNumber}&draft=$hello`
    : `viber://chat/?number=+${cleanNumber}&draft=$hello`;
  const emailLink = isMobile
    ? `mailto:${contactInfo.email}`
    : `https://mail.google.com/mail/?view=cm&fs=1&to=${contactInfo.email}`;

  const handleViberClick = (e) => {
    e.preventDefault();
    // Open a new tab in about:blank state first
    const newTab = window.open('about:blank', '_blank');
    if (!newTab) return;

    // Direct the new tab to the deep link scheme
    newTab.location.href = viberLink;

    // Timeout check: if the tab is still on about:blank after 2 seconds, Viber isn't installed.
    // Redirect the user to the official download page instead.
    setTimeout(() => {
      try {
        if (!newTab.closed) {
          if (newTab.location.href === 'about:blank' || newTab.location.href.startsWith('viber://')) {
            newTab.location.href = 'https://www.viber.com/en/download/';
          }
        }
      } catch {
        // Safe to ignore: a cross-origin error means it successfully navigated or launched
      }
    }, 2000);
  };

  return (
    <div className="contact-page pb-5" style={{ backgroundColor: 'var(--bg-void)', minHeight: '100vh', paddingTop: '76px' }}>
      <Helmet>
        <title>Contact Us | Katingin Bikes | Bigbikes Metro Manila</title>
        <meta name="description" content="Get in touch with Katingin Bikes. Contact us via Viber, Messenger, or Email to verify second hand bigbike availability and schedules in Metro Manila." />
        <meta property="og:title" content="Contact Us | Katingin Bikes | Bigbikes Metro Manila" />
        <meta property="og:description" content="Get in touch directly via Viber, Facebook Messenger, or Email to ask about our premium pre-owned bigbikes." />
        <meta property="og:image" content="https://katinginbikes.com/static_data/Katingin_logo.png" />
        <meta property="og:url" content="https://katinginbikes.com/contact" />
      </Helmet>
      {/* ── 1. Hero Section ── */}
      <section
        className="contact-hero position-relative d-flex align-items-center justify-content-center text-center"
        style={{
          minHeight: '25vh'
        }}
      >
        <Container>
          <Reveal>
            <span className="text-accent mb-2 d-block" style={{ letterSpacing: '4px', textTransform: 'uppercase', fontWeight: '700', fontSize: '0.85rem' }}>
              GET IN TOUCH
            </span>
            <h1 className="moto-heading mb-0" style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)' }}>CONNECT WITH US</h1>
          </Reveal>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <h2 className="moto-heading mb-3" style={{ fontSize: '1.5rem' }}>DIRECT CHANNELS</h2>
              <p className="text-secondary" style={{ fontSize: '1rem' }}>
                Operational transparency is our priority. Reach out to us directly for immediate inquiries.
              </p>
            </Col>
          </Row>

          <Row className="g-4 justify-content-center mb-5">
            <Col md={4}>
              <Reveal delay={1} className="h-100">
                <a
                  href={viberLink}
                  onClick={handleViberClick}
                  target="_blank"
                  rel="noreferrer"
                  className="moto-card p-4 text-center text-decoration-none d-block h-100"
                >
                  <div className="mb-4 d-inline-flex align-items-center justify-content-center bg-muted rounded-circle" style={{ color: '#7360F2', width: '60px', height: '60px' }}>
                    <FaViber size={32} />
                  </div>
                  <h4 className="moto-heading mb-2" style={{ fontSize: '1.2rem' }}>VIBER</h4>
                  <p className="text-secondary mb-4">{contactInfo.viber}</p>
                  <div className="text-accent small fw-bold mt-auto">SEND A MESSAGE</div>
                </a>
              </Reveal>
            </Col>

            <Col md={4}>
              <Reveal delay={2} className="h-100">
                <a
                  href={contactInfo.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="moto-card p-4 text-center text-decoration-none d-block h-100"
                >
                  <div className="mb-4 d-inline-flex align-items-center justify-content-center bg-muted rounded-circle" style={{ color: '#0084FF', width: '60px', height: '60px' }}>
                    <FaFacebookF size={30} />
                  </div>
                  <h4 className="moto-heading mb-2" style={{ fontSize: '1.2rem' }}>MESSENGER</h4>
                  <p className="text-secondary mb-4">Katingin Bikes</p>
                  <div className="text-accent small fw-bold mt-auto">CHAT WITH US</div>
                </a>
              </Reveal>
            </Col>

            <Col md={4}>
              <Reveal delay={3} className="h-100">
                <a 
                  href={emailLink} 
                  target={isMobile ? undefined : "_blank"}
                  rel={isMobile ? undefined : "noreferrer"}
                  className="moto-card p-4 text-center text-decoration-none d-block h-100"
                >
                  <div className="mb-4 d-inline-flex align-items-center justify-content-center bg-muted rounded-circle" style={{ color: 'var(--accent-primary)', width: '60px', height: '60px' }}>
                    <Mail size={30} />
                  </div>
                  <h4 className="moto-heading mb-2" style={{ fontSize: '1.2rem' }}>EMAIL US</h4>
                  <p className="text-secondary mb-4">{contactInfo.email}</p>
                  <div className="text-accent small fw-bold mt-auto" style={{ fontSize: '0.7rem' }}>FOR FINANCING REQUIREMENTS ONLY</div>
                </a>
              </Reveal>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Contact;
