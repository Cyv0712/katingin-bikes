import { Container, Row, Col } from 'react-bootstrap';
import { ShieldCheck, ClipboardCheck, FileText } from 'lucide-react';
import { brandConfig } from '../data/brandConfig';
import Reveal from './Reveal';

const AboutUs = () => {
  return (
    <section id="about" className="section-padding" style={{ backgroundColor: 'var(--bg-void)' }}>
      <Container>
        <Reveal>
          <div className="text-center mb-5">
             <span className="text-accent mb-2 d-block" style={{ fontSize: '0.85rem', letterSpacing: '4px', fontWeight: 600 }}>OUR COMMITMENT</span>
             <h2 className="moto-heading mb-0">THE KATINGIN DIFFERENCE</h2>
          </div>
        </Reveal>
        
        <Row className="g-4">
          <Col md={4}>
            <Reveal delay={1} className="h-100">
              <div className="moto-card h-100 p-4 text-center moto-card-static">
                <ShieldCheck className="text-accent mb-3" size={48} strokeWidth={1.5} />
                <h4 className="moto-heading mb-3" style={{ fontSize: '1.2rem' }}>VERIFIED QUALITY</h4>
                <p className="text-secondary mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  Every unit undergoes a strict 100-point mechanical inspection by our expert technicians before hitting the showroom floor.
                </p>
              </div>
            </Reveal>
          </Col>
          <Col md={4}>
            <Reveal delay={2} className="h-100">
              <div className="moto-card h-100 p-4 text-center moto-card-static">
                <ClipboardCheck className="text-accent mb-3" size={48} strokeWidth={1.5} />
                <h4 className="moto-heading mb-3" style={{ fontSize: '1.2rem' }}>FULL TRANSPARENCY</h4>
                <p className="text-secondary mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  We disclose every detail. No hidden issues, no surprises. What you see is exactly what you get.
                </p>
              </div>
            </Reveal>
          </Col>
          <Col md={4}>
            <Reveal delay={3} className="h-100">
              <div className="moto-card h-100 p-4 text-center moto-card-static">
                <FileText className="text-accent mb-3" size={48} strokeWidth={1.5} />
                <h4 className="moto-heading mb-3" style={{ fontSize: '1.2rem' }}>CLEAN DOCUMENTS</h4>
                <p className="text-secondary mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  Guaranteed complete and legitimate papers. We handle the paperwork so you can focus on the ride.
                </p>
              </div>
            </Reveal>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AboutUs;
