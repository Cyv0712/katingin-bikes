import { Container, Row, Col } from 'react-bootstrap';
import { Bike, Wrench, Shield, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { brandConfig } from '../data/brandConfig';
import Reveal from '../components/Reveal';
import { Helmet } from 'react-helmet-async';

const About = () => {
  return (
    <div className="about-page pb-5">
      <Helmet>
        <title>About Us | Katingin Bikes</title>
        <meta name="description" content="Discover Katingin Bikes. Learn about our roots, our commitment to transparency, verified quality inspecton, and clean papers." />
        <meta property="og:title" content="About Us | Katingin Bikes" />
        <meta property="og:description" content="Learn about our roots, story, and commitment to transparency." />
        <meta property="og:image" content="https://katinginbikes.com/static_data/Katingin_logo.png" />
        <meta property="og:url" content="https://katinginbikes.com/about" />
      </Helmet>
      {/* ── 1. Hero Section ── */}
      <section
        className="about-hero position-relative d-flex align-items-center justify-content-center text-center"
        style={{
          minHeight: '80vh',
          marginTop: '76px', // Offset for navbar
          backgroundImage: `linear-gradient(to bottom, rgba(10,10,15,0.8), rgba(10,10,15,1)), url('${brandConfig.images.aboutHeroBackground}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container>
          <Reveal>
            <span className="text-accent mb-3 d-block" style={{ letterSpacing: '6px', textTransform: 'uppercase', fontWeight: '700', fontSize: '0.85rem' }}>
              {brandConfig.aboutHeroSubtitle}
            </span>
            <h1 className="moto-heading mb-4" style={{ fontSize: 'clamp(2rem, 8vw, 4.5rem)' }}>
              {brandConfig.aboutHeroTitle}
            </h1>
            <p className="lead text-secondary mx-auto" style={{ maxWidth: '800px', fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)', borderLeft: '2px solid var(--accent-primary)', paddingLeft: '20px', lineHeight: '1.8' }}>
              {brandConfig.aboutHeroDescription}
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ── 2. The Narrative ── */}
      <section className="section-padding py-5 mt-5">
        <Container>
          <Row className="align-items-center gy-5">
            <Col lg={6}>
              <Reveal>
                <div className="pe-lg-5">
                  <h2 className="moto-heading mb-4" style={{ fontSize: '2.5rem' }}>
                    THE <span className="text-accent">STORY</span>
                  </h2>
                  {brandConfig.storyParagraphs.map((para, idx) => (
                    <p key={idx} className="text-secondary mb-4" style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
                      {para}
                    </p>
                  ))}
                  <div className="mt-4 p-4 moto-card about-quote-card" style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', borderLeft: '4px solid var(--accent-primary)' }}>
                    <div className="d-flex align-items-center gap-3">
                      <Handshake className="text-accent" size={32} />
                      <p className="mb-0 text-primary" style={{ fontSize: '1.1rem', fontStyle: 'italic', fontWeight: 600 }}>"{brandConfig.quote}"</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </Col>
            <Col lg={6}>
              <Reveal delay={2}>
                <div className="position-relative p-2 d-flex justify-content-center">
                  <div className="moto-card overflow-hidden p-0 border-0" style={{ maxWidth: '85%' }}>
                    <img
                      src={brandConfig.images.storyImage}
                      alt={brandConfig.name}
                      className="img-fluid rounded"
                      style={{ filter: 'grayscale(0.3) contrast(1.1)', transition: 'all 0.5s ease' }}
                    />
                    <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(45deg, var(--accent-primary) 0%, transparent 5%, transparent 95%, var(--accent-primary) 100%)', opacity: 0.1, pointerEvents: 'none' }}></div>
                  </div>
                </div>
              </Reveal>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── 3. The Philosophy ── */}
      <section className="section-padding py-5">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col md={8}>
              <h2 className="moto-heading mb-4">OUR COMMITMENT</h2>
              <p className="text-secondary" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
                {brandConfig.philosophyDescription}
              </p>
            </Col>
          </Row>

          <Row className="g-4">
            {[
              { icon: Bike, title: "CURATED UNITS", desc: "We hand-pick only the finest pre-owned adventure and touring units. If it's not good enough for us to ride, it's not going on the showroom floor." },
              { icon: Wrench, title: "THOROUGH VETTING", desc: "Every unit is carefully evaluated before it reaches our showroom. We ensure that what you see is exactly what you get, with zero hidden surprises." },
              { icon: Shield, title: "SEAMLESS ACQUISITION", desc: "We handle the heavy lifting. From documentation to transparent pricing, we make acquiring your dream bike as smooth as the ride itself." }
            ].map((item, i) => (
               <Col md={4} key={i}>
                 <Reveal delay={i + 1} className="h-100">
                   <div className="moto-card p-4 h-100 text-center">
                     <div className="d-inline-flex align-items-center justify-content-center mb-4 bg-muted rounded-circle" style={{ width: '80px', height: '80px', color: 'var(--accent-primary)' }}>
                       <item.icon size={36} strokeWidth={1.5} />
                     </div>
                     <h4 className="moto-heading mb-3" style={{ fontSize: '1.2rem' }}>{item.title}</h4>
                     <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{item.desc}</p>
                   </div>
                 </Reveal>
               </Col>
             ))}
          </Row>
        </Container>
      </section>

      {/* ── 4. The Experience ── */}
      <section className="section-padding py-5 mt-4">
        <Container>
          <div className="mb-5 text-center">
             <h2 className="moto-heading">THE <span className="text-accent">EXPERIENCE</span></h2>
          </div>
          <Row className="g-4">
            {[
              { img: brandConfig.images.experienceCard1, title: "PREMIUM UNITS", desc: "Explore our showroom featuring meticulously detailed big bikes ready for their next owner." },
              { img: brandConfig.images.experienceCard2, title: "HONEST NOTES", desc: "Complete transparency. We provide a full breakdown of every unit's condition so you can buy with confidence." },
              { img: brandConfig.images.experienceCard3, title: "THE COMMUNITY", desc: "More than a showroom. We are a hub for riders who share a passion for the open road." }
            ].map((card, i) => (
               <Col md={6} lg={4} key={i}>
                 <Reveal delay={i + 1} className="h-100">
                   <div className="moto-card overflow-hidden h-100 p-0">
                     <div style={{ height: '240px', overflow: 'hidden' }}>
                       <img src={card.img} alt={card.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                     </div>
                     <div className="p-4 bg-muted h-100">
                       <h5 className="moto-heading mb-3" style={{ fontSize: '1.1rem' }}>{card.title}</h5>
                       <p className="text-secondary mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{card.desc}</p>
                     </div>
                   </div>
                 </Reveal>
               </Col>
             ))}
          </Row>
        </Container>
      </section>

      {/* ── 5. Call to Action ── */}
      <section className="mt-5 py-5 text-center" style={{ borderTop: '1px solid var(--border-color)' }}>
        <Container>
          <h3 className="moto-heading mb-4" style={{ fontSize: '2rem' }}>READY TO RIDE?</h3>
          <div className="d-flex justify-content-center gap-4 flex-wrap mt-4">
            <Link to="/inventory" className="moto-btn px-5 py-3">
              BROWSE INVENTORY
            </Link>
            <a href="/contact" className="moto-btn moto-btn-outline px-5 py-3 text-decoration-none">
              CONTACT US
            </a>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default About;
