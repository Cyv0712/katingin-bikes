import { useState, useEffect } from 'react';
import { Container, Row, Col, Badge, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { showcaseBikes } from '../data/showcase';
import { apiUrl } from '../config/api';
import { isShowcaseInStock } from '../utils/showcaseStockMatch';
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

  const checkStock = (showcaseBike) => isShowcaseInStock(showcaseBike, inventory);

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
             <h2 className="moto-heading mb-0" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
               FEATURED UNITS
             </h2>
           </Reveal>
        </div>

        <Reveal className="position-relative">
          <Carousel 
            controls={false}
            interval={3500} 
            fade={true} 
            pause="hover" 
            className="featured-carousel"
          >
            {showcaseBikes.map((bike) => {
              const inStock = checkStock(bike);
              const activeIndex = activeImages[bike.slug] ?? 0;

              return (
                <Carousel.Item key={bike.slug}>
                  <div className="featured-carousel-card glass-panel">
                    <Row className="g-4 align-items-center">
                      {/* Left Column: Bike Details (Col 4) */}
                      <Col lg={4} className="order-2 order-lg-1">
                        <div className="pe-lg-3 text-center text-lg-start">
                          <div className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2 mb-3">
                            {inStock ? (
                              <Badge className="bg-success px-3 py-1" style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px' }}>AVAILABLE</Badge>
                            ) : (
                              <Badge className="bg-danger px-3 py-1" style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px' }}>SOLD OUT</Badge>
                            )}
                          </div>

                          <h3 className="moto-heading mb-3" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', lineHeight: '1.15' }}>
                            <span className="text-accent">{bike.brand}</span> <br /> {bike.model}
                          </h3>

                          <div className="featured-specs-list justify-content-center justify-content-lg-start mb-4 gap-2">
                            {bike.features.map((feature, idx) => (
                              <span key={idx} className="featured-spec-badge">
                                {feature}
                              </span>
                            ))}
                          </div>

                          <div className="pt-2 d-flex flex-column align-items-center align-items-lg-start gap-3">
                            <Link 
                              to={`/showcase/${bike.slug}`} 
                              className="moto-btn py-3 px-4 text-decoration-none"
                              style={{ width: 'fit-content' }}
                            >
                              EXPLORE UNIT <ArrowRight size={16} className="ms-2" />
                            </Link>
                            <Link 
                              to="/inventory" 
                              className="text-accent text-decoration-none d-inline-flex align-items-center gap-2"
                              style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}
                            >
                              VIEW FULL INVENTORY &rarr;
                            </Link>
                          </div>
                        </div>
                      </Col>

                      {/* Right Column: Dynamic Image Gallery (Col 8) */}
                      <Col lg={8} className="order-1 order-lg-2">
                        <div className="featured-gallery-main rounded" style={{ position: 'relative', overflow: 'hidden' }}>
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

                        <div className="featured-gallery-thumbnails mt-3">
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
