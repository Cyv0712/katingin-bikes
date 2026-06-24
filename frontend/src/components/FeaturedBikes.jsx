import { useState, useEffect } from 'react';
import { Container, Row, Col, Badge, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { showcaseBikes } from '../data/showcase';
import { apiUrl } from '../config/api';
import Reveal from './Reveal';

const FeaturedBikes = () => {
  const [inventory, setInventory] = useState([]);
  const [activeImages, setActiveImages] = useState({});

  useEffect(() => {
    // Fetch live inventory to check stock status
    fetch(apiUrl('/api/bikes'))
      .then(res => res.json())
      .then(data => {
        setInventory(data || []);
      })
      .catch(err => console.error(err));
  }, []);

  const checkStock = (showcaseBike) => {
    return inventory.some(bike => {
      // Check availability status first
      if (bike.status && bike.status !== 'Available') return false;

      const targetBrand = showcaseBike.brand.toLowerCase().trim();
      const liveBrand = (bike.brand || '').toLowerCase().trim();
      if (liveBrand !== targetBrand) return false;

      const liveModel = (bike.model || '').toLowerCase();
      const liveEngine = (bike.engineSize || '').toLowerCase().replace('cc', '').trim();
      const combinedLive = `${liveModel} ${liveEngine}`.replace(/[^\w\s]/g, '').trim();

      // Custom-tailored matches for the showcase collection:
      if (showcaseBike.slug === 'honda-africa-twin') {
        return combinedLive.includes('africa') && combinedLive.includes('twin');
      }
      if (showcaseBike.slug === 'yamaha-tracer-900') {
        return combinedLive.includes('tracer') && (combinedLive.includes('900') || combinedLive.includes('gt'));
      }
      if (showcaseBike.slug === 'kawasaki-versys-650') {
        return combinedLive.includes('versys') && (combinedLive.includes('650') || combinedLive.includes('600'));
      }
      if (showcaseBike.slug === 'honda-cb650r') {
        return combinedLive.includes('cb650r') || (combinedLive.includes('cb') && combinedLive.includes('650'));
      }
      if (showcaseBike.slug === 'ducati-monster-937') {
        return combinedLive.includes('monster') && (combinedLive.includes('937') || combinedLive.includes('900') || combinedLive.includes('821') || combinedLive.includes('797'));
      }
      if (showcaseBike.slug === 'bmw-gs-rallye') {
        return combinedLive.includes('gs') && (combinedLive.includes('rallye') || combinedLive.includes('1250') || combinedLive.includes('1200'));
      }

      // Fallback matching
      const targetWords = showcaseBike.model.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w && w !== 'cc');
      
      return targetWords.every(word => combinedLive.includes(word));
    });
  };

  const handleThumbnailClick = (slug, index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImages(prev => ({
      ...prev,
      [slug]: index
    }));
  };

  return (
    <section id="inventory" className="section-padding" style={{ paddingTop: '60px' }}>
      <Container>
        <div className="text-center mb-5 pb-2">
           <Reveal>
             <span className="text-accent mb-2 d-block" style={{ fontSize: '0.85rem', letterSpacing: '4px', fontWeight: 600 }}>OUR SHOWROOM</span>
             <h2 className="moto-heading mb-0">
               FEATURED BIKES
             </h2>
           </Reveal>
        </div>

        <Reveal className="position-relative">
          <Carousel 
            controls={false}
            interval={2000} 
            fade={true} 
            pause="hover" 
            className="featured-carousel"
          >
            {showcaseBikes.map((bike) => {
              const inStock = checkStock(bike);
              const activeIndex = activeImages[bike.slug] ?? 0;

              return (
                <Carousel.Item key={bike.slug}>
                  <div className="featured-carousel-card">
                    <Row className="g-4 align-items-center">
                      {/* Left Column: Bike Details (Col 3) */}
                      <Col lg={3} className="order-2 order-lg-1">
                        <div className="pe-lg-3 text-center text-lg-start">
                          <div className="d-flex align-items-center justify-content-center justify-content-lg-start gap-3 mb-2">
                            {inStock ? (
                              <Badge className="bg-success" style={{ fontSize: '0.7rem', padding: '5px 10px', fontWeight: 600 }}>AVAILABLE</Badge>
                            ) : (
                              <Badge className="bg-danger" style={{ fontSize: '0.7rem', padding: '5px 10px', fontWeight: 600 }}>SOLD OUT</Badge>
                            )}
                          </div>

                          <h3 className="moto-heading mb-3" style={{ fontSize: '1.8rem', lineHeight: '1.2' }}>
                            <span className="text-accent">{bike.brand}</span> <br /> {bike.model}
                          </h3>

                          <div className="featured-specs-list justify-content-center justify-content-lg-start mb-4">
                            {bike.features.map((feature, idx) => (
                              <span key={idx} className="featured-spec-badge" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                                {feature}
                              </span>
                            ))}
                          </div>

                          <div className="pt-1 d-flex flex-column align-items-center align-items-lg-start gap-2">
                            <Link 
                              to={`/showcase/${bike.slug}`} 
                              className="moto-btn py-2 px-4 text-decoration-none"
                              style={{ width: 'fit-content', fontSize: '0.8rem' }}
                            >
                              EXPLORE UNIT
                            </Link>
                            <Link 
                              to="/inventory" 
                              className="text-accent text-decoration-none mt-2 d-inline-flex align-items-center gap-1"
                              style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}
                            >
                              VIEW FULL INVENTORY &rarr;
                            </Link>
                          </div>
                        </div>
                      </Col>

                      {/* Right Column: Dynamic Image Gallery (Col 9) */}
                      <Col lg={9} className="order-1 order-lg-2">
                        <div className="featured-gallery-main" style={{ position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={bike.images[activeIndex]}
                            alt=""
                            className="featured-gallery-bg"
                          />
                          <img
                            src={bike.images[activeIndex]}
                            alt={`${bike.model} angle ${activeIndex + 1}`}
                            className="featured-gallery-fg"
                            loading="eager"
                          />
                        </div>

                        <div className="featured-gallery-thumbnails">
                          {bike.images.map((imgSrc, idx) => (
                            <div 
                              key={idx}
                              className={`featured-gallery-thumb ${idx === activeIndex ? 'active' : ''}`}
                              onClick={(e) => handleThumbnailClick(bike.slug, idx, e)}
                            >
                              <img 
                                src={imgSrc} 
                                alt={`${bike.model} thumb ${idx + 1}`}
                                className="w-100 h-100 object-fit-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Carousel.Item>
              );
            })}
          </Carousel>
        </Reveal>
      </Container>
    </section>
  );
};

export default FeaturedBikes;
