import { Container, Row, Col } from 'react-bootstrap';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { brandConfig } from '../data/brandConfig';
import Reveal from './Reveal';

const HeroSection = () => {
  return (
    <section 
      id="home" 
      className="hero-section"
      style={{
        backgroundImage: `url('${brandConfig.images.heroBackground}')`
      }}
    >
      <Container>
        <Row className="justify-content-center text-center">
          <Col lg={10} className="hero-content">
            <Reveal>
              <span className="text-accent mb-3 d-block" style={{ letterSpacing: '6px', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>
                {brandConfig.slogan}
              </span>
              <h1 className="moto-heading mb-4" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1.1 }}>
                {brandConfig.aboutHeroTitle} <br />
                <span className="text-accent">{brandConfig.aboutHeroSubtitle}</span>
              </h1>
              <p className="lead mb-5 text-secondary mx-auto" style={{ maxWidth: '750px', fontSize: '1.2rem', opacity: 0.9 }}>
                {brandConfig.aboutHeroDescription}
              </p>
              <div className="d-flex flex-wrap gap-4 mt-4 justify-content-center">
                <Link to="/inventory" className="text-decoration-none">
                  <button className="moto-btn">
                    VIEW INVENTORY <ArrowRight size={18} className="ms-2" />
                  </button>
                </Link>
                <Link to="/contact" className="text-decoration-none">
                  <button className="moto-btn moto-btn-outline">
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
