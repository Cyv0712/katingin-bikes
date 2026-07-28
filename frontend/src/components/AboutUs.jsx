import { Container, Row, Col } from 'react-bootstrap';
import { ShieldCheck, ClipboardCheck, FileText } from 'lucide-react';
import Reveal from './Reveal';

const AboutUs = () => {
  return (
    <section id="about" className="section-padding" style={{ backgroundColor: 'var(--bg-void)' }}>
      <Container>
        <Reveal>
          <div className="text-center mb-5">
             <span className="text-accent mb-2 d-block" style={{ fontSize: '0.85rem', letterSpacing: '4px', fontWeight: 600 }}>OUR COMMITMENT</span>
             <h2 className="moto-heading mb-0" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
               THE KATINGIN DIFFERENCE
             </h2>
          </div>
        </Reveal>
        
        <Row className="g-4">
          <Col md={4}>
            <Reveal delay={1} className="h-100">
              <div className="moto-card glass-panel h-100 p-4 text-center d-flex flex-column align-items-center">
                <div className="p-3 rounded-circle mb-3 mb-sm-4" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                  <ShieldCheck className="text-accent" size={38} strokeWidth={1.75} />
                </div>
                <h4 className="moto-heading mb-3" style={{ fontSize: '1.25rem', letterSpacing: '0.5px' }}>VERIFIED QUALITY</h4>
                <p className="text-secondary mb-0" style={{ fontSize: '0.92rem', lineHeight: '1.7' }}>
                  Every unit undergoes a strict 100-point mechanical inspection by certified technicians before entering our showroom.
                </p>
              </div>
            </Reveal>
          </Col>
          <Col md={4}>
            <Reveal delay={2} className="h-100">
              <div className="moto-card glass-panel h-100 p-4 text-center d-flex flex-column align-items-center">
                <div className="p-3 rounded-circle mb-3 mb-sm-4" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                  <ClipboardCheck className="text-accent" size={38} strokeWidth={1.75} />
                </div>
                <h4 className="moto-heading mb-3" style={{ fontSize: '1.25rem', letterSpacing: '0.5px' }}>FULL TRANSPARENCY</h4>
                <p className="text-secondary mb-0" style={{ fontSize: '0.92rem', lineHeight: '1.7' }}>
                  We disclose complete bike history and true odometer readings. No hidden issues, no surprises.
                </p>
              </div>
            </Reveal>
          </Col>
          <Col md={4}>
            <Reveal delay={3} className="h-100">
              <div className="moto-card glass-panel h-100 p-4 text-center d-flex flex-column align-items-center">
                <div className="p-3 rounded-circle mb-3 mb-sm-4" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                  <FileText className="text-accent" size={38} strokeWidth={1.75} />
                </div>
                <h4 className="moto-heading mb-3" style={{ fontSize: '1.25rem', letterSpacing: '0.5px' }}>CLEAN DOCUMENTS</h4>
                <p className="text-secondary mb-0" style={{ fontSize: '0.92rem', lineHeight: '1.7' }}>
                  Guaranteed authentic registration, complete OR/CR papers, and hassle-free transfer assistance.
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
