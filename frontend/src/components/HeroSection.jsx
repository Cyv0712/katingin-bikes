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
        backgroundImage: `url('${brandConfig.images.heroBackground}')`
      }}
    >
      <Container className="pt-5 mt-4">
        <Row className="justify-content-center text-center">
          <Col lg={10} className="hero-content py-5">
            <Reveal>
              <span className="text-accent mb-3 d-block" style={{ letterSpacing: '6px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
                {brandConfig.slogan}
              </span>
              
              <h1 className="moto-heading mb-4" style={{ fontSize: 'clamp(2.5rem, 7.5vw, 5.2rem)', lineHeight: 1.08, letterSpacing: '-1px' }}>
                {brandConfig.aboutHeroTitle} <br />
                <span className="text-accent">{brandConfig.aboutHeroSubtitle}</span>
              </h1>
              
              <p className="lead mb-5 text-secondary mx-auto" style={{ maxWidth: '720px', fontSize: '1.15rem', lineHeight: '1.7' }}>
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
