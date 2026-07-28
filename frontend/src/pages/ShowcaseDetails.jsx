import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Carousel } from 'react-bootstrap';
import { ArrowLeft, Check, Database, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { showcaseBikes } from '../data/showcase';
import { apiUrl } from '../config/api';
import { findShowcaseInventoryMatch } from '../utils/showcaseStockMatch';
import { Helmet } from 'react-helmet-async';
import { createSlug } from '../config/slug';

const ShowcaseDetails = () => {
  const { slug } = useParams();
  const bike = showcaseBikes.find(b => b.slug === slug);
  const [inStock, setInStock] = useState(false);
  const [matchedLiveBike, setMatchedLiveBike] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (bike) {
      fetch(apiUrl('/api/bikes'))
        .then(res => res.json())
        .then(data => {
          const matchedBike = findShowcaseInventoryMatch(bike, data);

          if (matchedBike) {
            setInStock(true);
            setMatchedLiveBike(matchedBike);
          } else {
            setInStock(false);
            setMatchedLiveBike(null);
          }
        })
        .catch(err => console.error(err));
    }
  }, [bike]);

  // Convert newline-separated text into a bullet list
  const renderList = (text) => {
    if (!text) return null;
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      return <p className="text-secondary mb-5" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>{text}</p>;
    }
    return (
      <ul className="mb-5 ps-0" style={{ listStyle: 'none' }}>
        {lines.map((line, i) => (
          <li key={i} className="text-secondary d-flex align-items-start gap-2 mb-2" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
            <Check className="text-accent mt-1 flex-shrink-0" size={20} />
            {line}
          </li>
        ))}
      </ul>
    );
  };

  if (!bike) {
    return (
      <div style={{ paddingTop: '150px', minHeight: '100vh', textAlign: 'center' }}>
        <h2 className="moto-heading text-destructive">SHOWCASE BIKE NOT FOUND</h2>
        <Link to="/" className="moto-btn mt-4">BACK TO SHOWCASE</Link>
      </div>
    );
  }

  const cleanImage = bike.images && bike.images.length > 0 ? bike.images[0] : '';
  const absoluteImage = cleanImage.startsWith('http') ? cleanImage : `https://katinginbikes.com${cleanImage}`;

  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": `${bike.brand} ${bike.model}`,
    "image": absoluteImage,
    "description": bike.description || `Hall of fame showcase page for the legendary ${bike.brand} ${bike.model} at Katingin Bikes.`,
    "offers": {
      "@type": "Offer",
      "url": `https://katinginbikes.com/showcase/${bike.slug}`,
      "priceCurrency": "PHP",
      "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/UsedCondition"
    }
  };

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '100px', minHeight: '100vh', backgroundColor: 'var(--bg-void)' }}>
      <Helmet>
        <title>{`${bike.brand} ${bike.model} | Katingin Bikes Showcase`}</title>
        <meta name="description" content={`Discover the ${bike.brand} ${bike.model} at Katingin Bikes Hall of Fame. ${bike.tagline || ''}. Specifications, features, and live availability.`} />
        <meta property="og:title" content={`${bike.brand} ${bike.model} - Showcase Details`} />
        <meta property="og:description" content={`Curated specs and hall of fame details for ${bike.brand} ${bike.model} at Katingin Bikes.`} />
        <meta property="og:image" content={absoluteImage} />
        <meta property="og:url" content={`https://katinginbikes.com/showcase/${bike.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      <Container>
        <Link to="/" className="text-accent text-decoration-none mb-5 d-inline-flex align-items-center gap-2" style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px' }}>
          <ArrowLeft size={16} /> BACK TO SHOWCASE
        </Link>
        
        <Row className="g-5 align-items-center">
          <Col lg={6}>
            <div className="moto-card overflow-hidden position-relative border-0" style={{ background: 'transparent' }}>
              <div className="position-absolute top-0 start-0 p-3" style={{ zIndex: 10 }}>
                {inStock ? (
                  <Badge className="bg-success" style={{ fontSize: '0.75rem', fontWeight: 700, padding: '6px 12px' }}>AVAILABLE IN INVENTORY</Badge>
                ) : (
                  <Badge className="bg-danger" style={{ fontSize: '0.75rem', fontWeight: 700, padding: '6px 12px' }}>SOLD OUT</Badge>
                )}
              </div>
              
              <Carousel activeIndex={activeIndex} onSelect={(selectedIdx) => setActiveIndex(selectedIdx)} interval={null} controls={false} indicators={false}>
                {bike.images.map((imgSrc, idx) => (
                  <Carousel.Item key={idx}>
                    <img 
                      src={imgSrc} 
                      alt={`${bike.model} detail ${idx + 1}`} 
                      className="d-block w-100 rounded" 
                      style={{ height: 'clamp(260px, 45vw, 600px)', objectFit: 'cover' }} 
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            </div>

            {/* Mini Image Thumbnails Navigation Strip */}
            {bike.images.length > 1 && (
              <div className="d-flex align-items-center justify-content-center gap-2 mt-3 px-2">
                <button
                  type="button"
                  className="btn btn-sm btn-link p-1 text-secondary text-decoration-none"
                  onClick={() => setActiveIndex(prev => (prev === 0 ? bike.images.length - 1 : prev - 1))}
                  aria-label="Previous image thumbnail"
                >
                  <ChevronLeft size={22} />
                </button>

                <div className="d-flex align-items-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar" style={{ maxWidth: '100%' }}>
                  {bike.images.map((imgSrc, idx) => {
                    const isActive = activeIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        className="p-0 border-0 bg-transparent flex-shrink-0"
                        aria-label={`Select photo ${idx + 1}`}
                      >
                        <img
                          src={imgSrc}
                          alt={`Thumbnail ${idx + 1}`}
                          style={{
                            width: '78px',
                            height: '78px',
                            objectFit: 'cover',
                            borderRadius: '14px',
                            border: isActive ? '2px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.15)',
                            opacity: isActive ? 1 : 0.55,
                            transform: isActive ? 'scale(1.04)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                            boxShadow: isActive ? '0 0 14px rgba(212, 175, 55, 0.35)' : 'none',
                            cursor: 'pointer'
                          }}
                        />
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-link p-1 text-secondary text-decoration-none"
                  onClick={() => setActiveIndex(prev => (prev === bike.images.length - 1 ? 0 : prev + 1))}
                  aria-label="Next image thumbnail"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            )}
          </Col>
          
          <Col lg={6}>
            <div className="p-2">
              <span className="text-secondary mb-2 d-block" style={{ letterSpacing: '2px', fontSize: '0.9rem', fontWeight: 600 }}>{bike.brand.toUpperCase()} HALL OF FAME</span>
              <h1 className="moto-heading mb-3" style={{ fontSize: 'clamp(2rem, 8vw, 4rem)' }}>{bike.model}</h1>
              <h4 className="text-accent mb-5 font-italic" style={{ fontSize: '1.2rem', fontStyle: 'italic' }}>"{bike.tagline}"</h4>
              
              {renderList(bike.description)}

              <div className="mb-5 p-4 rounded" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                <h5 className="moto-heading mb-4" style={{ fontSize: '1.1rem' }}><Zap size={20} className="text-accent me-2" /> CORE SPECIFICATIONS</h5>
                <Row className="g-3">
                  {bike.features.map((feature, idx) => (
                    <Col sm={6} key={idx}>
                      <div className="d-flex align-items-center text-secondary" style={{ fontSize: '0.9rem' }}>
                        <Check className="text-accent me-2" size={18} />
                        <span>{feature}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
              
              {inStock && matchedLiveBike ? (
                <div className="p-4 rounded glass-panel metallic-glow" style={{ border: '1px solid var(--accent-primary)' }}>
                  <h5 className="moto-heading mb-2 text-accent" style={{ fontSize: '1.1rem' }}>CURRENTLY AVAILABLE SHOWROOM UNIT</h5>
                  <p className="text-secondary mb-4" style={{ fontSize: '0.95rem' }}>Great news! We currently have a {bike.model} available in our live inventory. Click below to view the actual unit.</p>
                  <Link to={`/bike/${createSlug(matchedLiveBike)}-${matchedLiveBike._id}`} className="text-decoration-none">
                    <button className="moto-btn w-100 py-3" style={{ fontSize: '1rem' }}>
                       VIEW LIVE INVENTORY UNIT <Database size={18} className="ms-2" />
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="p-4 rounded glass-panel" style={{ border: '1px solid var(--border-color)' }}>
                  <h5 className="moto-heading mb-2 text-white" style={{ fontSize: '1.1rem' }}>OUT OF STOCK</h5>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.95rem' }}>We don't have any pre-owned {bike.model} units right now. Check back later or browse our other inventory!</p>
                  <Link to="/inventory" className="text-decoration-none">
                    <button className="moto-btn moto-btn-outline w-100 mt-4 py-3" style={{ fontSize: '1rem' }}>
                      BROWSE ALL BIKES
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ShowcaseDetails;
