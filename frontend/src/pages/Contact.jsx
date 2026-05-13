import { Container, Row, Col } from 'react-bootstrap';
import { Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import { FaFacebookF, FaWhatsapp } from 'react-icons/fa';
import { contactInfo } from '../data/contactInfo';
import { brandConfig } from '../data/brandConfig';

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
          <span className="text-accent mb-2 d-block" style={{ letterSpacing: '4px', textTransform: 'uppercase', fontWeight: '700', fontSize: '0.85rem' }}>
            GET IN TOUCH
          </span>
          <h1 className="moto-heading mb-0" style={{ fontSize: '3.5rem' }}>CONNECT WITH US</h1>
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
            </Col>

            <Col md={4}>
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
            </Col>

            <Col md={4}>
              <div className="moto-card p-4 text-center h-100">
                <div className="mb-4 d-inline-flex align-items-center justify-content-center bg-muted rounded-circle" style={{ color: 'var(--accent-primary)', width: '60px', height: '60px' }}>
                  <Mail size={30} />
                </div>
                <h4 className="moto-heading mb-2" style={{ fontSize: '1.2rem' }}>EMAIL US</h4>
                <p className="text-secondary mb-4">{contactInfo.email}</p>
                <div className="text-secondary small mt-auto">GENERAL INQUIRIES</div>
              </div>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="moto-card p-5">
                <Row className="g-4 text-center text-md-start">
                  <Col md={6}>
                    <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                      <div className="d-flex align-items-center justify-content-center flex-shrink-0 bg-void rounded" style={{ color: 'var(--accent-primary)', width: '60px', height: '60px' }}>
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h5 className="moto-heading mb-2" style={{ fontSize: '1.1rem' }}>SHOWROOM LOCATION</h5>
                        <p className="text-secondary mb-3" style={{ fontSize: '0.9rem' }}>{contactInfo.address}</p>
                        <a href={contactInfo.googleMaps} target="_blank" rel="noreferrer" className="moto-btn" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                          OPEN IN MAPS <ExternalLink size={12} className="ms-2" />
                        </a>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                      <div className="d-flex align-items-center justify-content-center flex-shrink-0 bg-void rounded" style={{ color: 'var(--accent-primary)', width: '60px', height: '60px' }}>
                        <Clock size={24} />
                      </div>
                      <div>
                        <h5 className="moto-heading mb-2" style={{ fontSize: '1.1rem' }}>OPERATING HOURS</h5>
                        <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>{contactInfo.operatingHours}</p>
                        <div className="mt-2 text-accent" style={{ fontSize: '0.8rem', fontWeight: 600 }}>AVAILABLE FOR VIEWING</div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── 4. Map Section ── */}
      <section className="mt-5">
        <div style={{ width: '100%', height: '450px', filter: 'grayscale(0.8) contrast(1.1) brightness(0.9)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.0000000000005!2d121.05000000000001!3d14.650000000000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x74a75f5b6bf8d21f!2sKatingin%20Bikes!5e0!3m2!1sen!2sph!4v1715516000000!5m2!1sen!2sph" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Katingin Bikes Location"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default Contact;
