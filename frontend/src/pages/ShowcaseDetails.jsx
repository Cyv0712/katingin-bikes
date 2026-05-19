import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Carousel } from 'react-bootstrap';
import { ArrowLeft, Check, Database, Zap } from 'lucide-react';
import { showcaseBikes } from '../data/showcase';
import { apiUrl } from '../config/api';

const ShowcaseDetails = () => {
  const { slug } = useParams();
  const bike = showcaseBikes.find(b => b.slug === slug);
  const [inStock, setInStock] = useState(false);
  const [inventoryId, setInventoryId] = useState(null);

  useEffect(() => {
    if (bike) {
      fetch(apiUrl('/api/bikes'))
        .then(res => res.json())
        .then(data => {
          const matchedBike = data.find(liveBike => {
            // Check availability status first
            if (liveBike.status && liveBike.status !== 'Available') return false;

            const targetBrand = bike.brand.toLowerCase().trim();
            const liveBrand = (liveBike.brand || '').toLowerCase().trim();
            if (liveBrand !== targetBrand) return false;

            const liveModel = (liveBike.model || '').toLowerCase();
            const liveEngine = (liveBike.engineSize || '').toLowerCase().replace('cc', '').trim();
            const combinedLive = `${liveModel} ${liveEngine}`.replace(/[^\w\s]/g, '').trim();

            // Custom-tailored matches for the showcase collection:
            if (bike.slug === 'honda-africa-twin') {
              return combinedLive.includes('africa') && combinedLive.includes('twin');
            }
            if (bike.slug === 'yamaha-tracer-900') {
              return combinedLive.includes('tracer') && (combinedLive.includes('900') || combinedLive.includes('gt'));
            }
            if (bike.slug === 'kawasaki-versys-650') {
              return combinedLive.includes('versys') && (combinedLive.includes('650') || combinedLive.includes('600'));
            }

            // Fallback matching
            const targetWords = bike.model.toLowerCase()
              .replace(/[^\w\s]/g, '')
              .split(/\s+/)
              .filter(w => w && w !== 'cc');
            
            return targetWords.every(word => combinedLive.includes(word));
          });

          if (matchedBike) {
            setInStock(true);
            setInventoryId(matchedBike._id);
          } else {
            setInStock(false);
            setInventoryId(null);
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
          <li key={i} className="text-primary d-flex align-items-start gap-2 mb-2" style={{ fontSize: '1.1rem', lineHeight: '1.8', opacity: 0.9 }}>
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

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '100px', minHeight: '100vh', backgroundColor: 'var(--bg-void)' }}>
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
              
              <Carousel interval={null}>
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
              
              {inStock ? (
                <div className="p-4 rounded" style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid var(--accent-primary)' }}>
                  <h5 className="moto-heading mb-2 text-primary" style={{ fontSize: '1.1rem' }}>CURRENTLY AVAILABLE</h5>
                  <p className="text-secondary mb-4" style={{ fontSize: '0.95rem' }}>Great news! We currently have a {bike.model} available in our live inventory. Click below to view the actual unit.</p>
                  <Link to={`/bike/${inventoryId}`} className="text-decoration-none">
                    <button className="moto-btn w-100 py-3" style={{ fontSize: '1rem' }}>
                       VIEW LIVE INVENTORY UNIT <Database size={18} className="ms-2" />
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="p-4 rounded" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <h5 className="moto-heading mb-2" style={{ fontSize: '1.1rem' }}>OUT OF STOCK</h5>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.95rem' }}>We don't have any second-hand {bike.model} units right now. Check back later or browse our other inventory!</p>
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
