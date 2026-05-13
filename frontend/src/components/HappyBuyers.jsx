import { Container, Row, Col } from 'react-bootstrap';
import { Quote } from 'lucide-react';
import { brandConfig } from '../data/brandConfig';
import Reveal from './Reveal';

const buyers = [
  {
    id: 1,
    name: "Mark T.",
    bike: "BMW R 1250 GS",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop",
    quote: "Katingin Bikes lived up to their name. The transaction was smooth, and the bike was exactly as described. Best dealership experience."
  },
  {
    id: 2,
    name: "Sarah L.",
    bike: "Ducati Panigale V4",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop",
    quote: "Transparency from day one. I knew everything about the bike before I even visited the showroom. Incredible service."
  },
  {
    id: 3,
    name: "Jason R.",
    bike: "Kawasaki Z1000",
    image: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?q=80&w=800&auto=format&fit=crop",
    quote: "Got my dream bike with zero hassle. They assisted me with the financing and made sure the papers were perfect."
  }
];

const HappyBuyers = () => {
  return (
    <section id="buyers" className="section-padding">
      <Container>
        <Reveal>
          <div className="text-center mb-5">
             <span className="text-accent mb-2 d-block" style={{ fontSize: '0.85rem', letterSpacing: '4px', fontWeight: 600 }}>OUR COMMUNITY</span>
             <h2 className="moto-heading mb-0">HAPPY RIDERS</h2>
          </div>
        </Reveal>
        
        <Row className="g-4">
          {buyers.map((buyer, index) => (
            <Col lg={4} md={6} key={buyer.id}>
              <Reveal delay={index + 1}>
                <div className="moto-card d-flex flex-column h-100 p-4">
                  <Quote size={32} className="text-accent mb-3" strokeWidth={1.5} />
                  <p className="text-secondary font-italic mb-4 flex-grow-1" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                    "{buyer.quote}"
                  </p>
                  <div className="d-flex align-items-center mt-auto pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <img 
                      src={buyer.image} 
                      alt={buyer.name} 
                      className="rounded-circle me-3" 
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                    <div>
                      <h5 className="moto-heading mb-0" style={{ fontSize: '1rem', textTransform: 'none' }}>{buyer.name}</h5>
                      <span className="text-accent" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{buyer.bike}</span>
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
