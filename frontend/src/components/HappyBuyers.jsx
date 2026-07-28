import { Container, Row, Col } from 'react-bootstrap';
import { Quote, Star, CheckCircle } from 'lucide-react';
import Reveal from './Reveal';

const buyers = [
  {
    id: 1,
    name: "Mark T.",
    bike: "BMW R 1250 GS",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=150&auto=format&fit=crop",
    quote: "Katingin Bikes lived up to their name. Smooth transaction, authentic papers, and the bike was in pristine condition."
  },
  {
    id: 2,
    name: "Sarah L.",
    bike: "Ducati Panigale V4",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=150&auto=format&fit=crop",
    quote: "100% transparency from day one. I knew every detail before visiting. Incredible customer service and support."
  },
  {
    id: 3,
    name: "Jason R.",
    bike: "Kawasaki Z1000",
    image: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?q=80&w=150&auto=format&fit=crop",
    quote: "Got my dream big bike with zero hassle! They assisted me with the financing application and made paper transfer effortless."
  }
];

const HappyBuyers = () => {
  return (
    <section id="buyers" className="section-padding">
      <Container>
        <Reveal>
          <div className="text-center mb-5">
             <span className="text-accent mb-2 d-block" style={{ fontSize: '0.85rem', letterSpacing: '4px', fontWeight: 600 }}>OUR COMMUNITY</span>
             <h2 className="moto-heading mb-0" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>HAPPY RIDERS</h2>
          </div>
        </Reveal>
        
        <Row className="g-4">
          {buyers.map((buyer, index) => (
            <Col lg={4} md={6} key={buyer.id}>
              <Reveal delay={index + 1}>
                <div className="moto-card glass-panel d-flex flex-column h-100 p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Quote size={28} className="text-accent" strokeWidth={1.5} />
                    <div className="d-flex gap-1 text-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-secondary mb-4 flex-grow-1" style={{ fontSize: '0.94rem', lineHeight: '1.75' }}>
                    "{buyer.quote}"
                  </p>
                  
                  <div className="d-flex align-items-center mt-auto pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <img 
                      src={buyer.image} 
                      alt={buyer.name} 
                      className="rounded-circle me-3 border border-accent" 
                      style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div>
                      <div className="d-flex align-items-center gap-1">
                        <h5 className="moto-heading mb-0" style={{ fontSize: '0.98rem', textTransform: 'none' }}>{buyer.name}</h5>
                        <CheckCircle size={14} className="text-success ms-1" />
                      </div>
                      <span className="telemetry-badge mt-1 d-inline-block px-2 py-0" style={{ fontSize: '0.7rem' }}>{buyer.bike}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default HappyBuyers;
