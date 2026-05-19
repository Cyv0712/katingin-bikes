import { Container, Row, Col } from 'react-bootstrap';
import { Mail, Clock } from 'lucide-react';
import { FaFacebookF, FaWhatsapp } from 'react-icons/fa';
import { contactInfo } from '../data/contactInfo';
import Reveal from '../components/Reveal';

const Contact = () => {
  return (
    <div className="contact-page pb-5">
      {/* ── 1. Hero Section ── */}
      <section 
        className="contact-hero position-relative d-flex align-items-center justify-content-center text-center"
        style={{
          minHeight: '35vh',
          marginTop: '76px',
          backgroundColor: 'var(--bg-void)'
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
                  href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="moto-card p-4 text-center text-decoration-none d-block h-100"
                >
                  <div className="mb-4 d-inline-flex align-items-center justify-content-center bg-muted rounded-circle" style={{ color: '#25D366', width: '60px', height: '60px' }}>
                    <FaWhatsapp size={32} />
                  </div>
                  <h4 className="moto-heading mb-2" style={{ fontSize: '1.2rem' }}>WHATSAPP / VIBER</h4>
                  <p className="text-secondary mb-4">{contactInfo.phone}</p>
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
                  <p className="text-secondary mb-4">Official Page</p>
                  <div className="text-accent small fw-bold mt-auto">CHAT WITH US</div>
                </a>
              </Reveal>
            </Col>

            <Col md={4}>
              <Reveal delay={3} className="h-100">
                <div className="moto-card p-4 text-center h-100">
                  <div className="mb-4 d-inline-flex align-items-center justify-content-center bg-muted rounded-circle" style={{ color: 'var(--accent-primary)', width: '60px', height: '60px' }}>
                    <Mail size={30} />
                  </div>
                  <h4 className="moto-heading mb-2" style={{ fontSize: '1.2rem' }}>EMAIL US</h4>
                  <p className="text-secondary mb-4">{contactInfo.email}</p>
                  <div className="text-accent small fw-bold mt-auto" style={{ fontSize: '0.7rem' }}>FOR FINANCING REQUIREMENTS ONLY</div>
                </div>
              </Reveal>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col lg={6}>
              <div className="moto-card p-5 text-center">
                <div className="d-flex align-items-center justify-content-center flex-shrink-0 bg-void rounded-circle mx-auto mb-4" style={{ color: 'var(--accent-primary)', width: '70px', height: '70px' }}>
                  <Clock size={28} />
                </div>
                <h5 className="moto-heading mb-2" style={{ fontSize: '1.3rem' }}>OPERATING HOURS</h5>
                <p className="text-secondary mb-0" style={{ fontSize: '1.05rem' }}>{contactInfo.operatingHours}</p>
                <div className="mt-3 text-accent" style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '2px' }}>UNIT VIEWING BY APPOINTMENT ONLY</div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Contact;
