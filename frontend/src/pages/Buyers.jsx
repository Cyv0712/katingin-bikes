import { Container, Row, Col } from 'react-bootstrap';
import { Quote } from 'lucide-react';
import { buyersData } from '../data/buyers';
import Reveal from '../components/Reveal';

const Buyers = () => {
  return (
    <div className="buyers-page pb-5">
      {/* ── 1. Hero Section ── */}
      <section 
        className="buyers-hero position-relative d-flex align-items-center justify-content-center text-center"
        style={{
          minHeight: '40vh',
          marginTop: '76px', // Offset for navbar
          backgroundColor: 'var(--bg-void)'
        }}
      >
        <Container>
          <Reveal>
            <span className="text-accent mb-3 d-block" style={{ letterSpacing: '4px', textTransform: 'uppercase', fontWeight: '700', fontSize: '0.85rem' }}>
              AUTHENTIC TESTIMONIALS
            </span>
            <h1 className="moto-heading mb-4" style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)' }}>
              THE COMMUNITY
            </h1>
            <p className="lead text-secondary mx-auto" style={{ maxWidth: '650px', fontSize: '1.05rem', opacity: 0.9 }}>
              Stories from across the archipelago. Real riders, real deals, total transparency.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ── 2. Testimonial Grid ── */}
      <section className="section-padding py-5">
        <Container>
          <Row className="g-4">
            {buyersData.map((buyer, idx) => (
              <Col lg={6} key={buyer.id}>
                <Reveal delay={idx % 2 + 1} className="h-100">
                  <div className="moto-card h-100 overflow-hidden">
                    <Row className="g-0 h-100 buyer-card-row">
                      <Col md={5}>
                        <div className="h-100 position-relative buyer-card-img">
                          <img 
                            src={buyer.image} 
                            alt={buyer.name} 
                            className="w-100 h-100" 
                            style={{ objectFit: 'cover', minHeight: 'clamp(200px, 30vw, 280px)' }} 
                            loading="lazy"
                          />
                          <div className="position-absolute bottom-0 start-0 w-100 p-2 text-accent bg-dark bg-opacity-75" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>
                             {buyer.location.toUpperCase()}
                          </div>
                        </div>
                      </Col>
                      <Col md={7} className="p-4 d-flex flex-column">
                        <Quote className="text-accent mb-3" size={32} strokeWidth={1.5} />
                        <p className="text-secondary flex-grow-1" style={{ fontSize: '0.95rem', lineHeight: '1.6', fontStyle: 'italic' }}>"{buyer.quote}"</p>
                        
                        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                          <h5 className="moto-heading mb-1" style={{ fontSize: '1.2rem', textTransform: 'none' }}>{buyer.name}</h5>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-accent" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{buyer.location}</span>
                            <div className="text-end">
                              <span className="text-accent fw-bold d-block" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>ACQUIRED UNIT</span>
                              <span className="text-primary fw-bold" style={{ fontSize: '0.9rem' }}>{buyer.bike}</span>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Reveal>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Buyers;
