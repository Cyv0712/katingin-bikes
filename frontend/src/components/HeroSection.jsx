import { Container, Row, Col } from 'react-bootstrap';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { brandConfig } from '../data/brandConfig';
import Reveal from './Reveal';

const HeroSection = () => {
  return (
    <section 
      id="home" 
      className="hero-section position-relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.65)), url('${brandConfig.images.heroBackground}')`
      }}
    >
      <Container className="pt-5 mt-4">
        <Row className="justify-content-center text-center">
          <Col lg={10} className="hero-content py-5">
            <Reveal>
              <h1 className="moto-heading mb-3" style={{ fontSize: 'clamp(3rem, 9vw, 6rem)', lineHeight: 1.02, letterSpacing: '-1px' }}>
                {brandConfig.aboutHeroTitle}
              </h1>
              
              <p className="text-accent fw-bold text-mono mb-4 text-uppercase" style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1.25rem)', letterSpacing: '4px' }}>
                {brandConfig.aboutHeroSubtitle}
              </p>
              
              <p className="lead mb-5 text-secondary mx-auto" style={{ maxWidth: '680px', fontSize: '1.1rem', lineHeight: '1.7' }}>
                {brandConfig.aboutHeroDescription}
              </p>
              
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <Link to="/inventory" className="text-decoration-none">
                  <button className="moto-btn px-4 py-3">
                    VIEW INVENTORY <ArrowRight size={18} className="ms-2" />
                  </button>
                </Link>
                <Link to="/contact" className="text-decoration-none">
                  <button className="moto-btn moto-btn-outline px-4 py-3">
                    CONTACT US
                  </button>
                </Link>
              </div>
            </Reveal>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HeroSection;
