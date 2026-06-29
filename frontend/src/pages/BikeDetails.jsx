import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Carousel, Spinner } from 'react-bootstrap';
import { ArrowLeft, Calendar, Route, CircleCheck, Circle, Info } from 'lucide-react';
import { apiUrl, toAbsoluteUploadUrl } from '../config/api';
import { Helmet } from 'react-helmet-async';
import { createSlug } from '../config/slug';

const BikeDetails = () => {
  const { slugAndId } = useParams();
  const id = slugAndId ? slugAndId.split('-').pop() : '';
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadedMap, setLoadedMap] = useState({});
  const [singleImageLoaded, setSingleImageLoaded] = useState(false);

  const handleImageLoad = (idx) => {
    setLoadedMap((prev) => ({ ...prev, [idx]: true }));
  };

  useEffect(() => {
    fetch(apiUrl(`/api/bikes/${id}`))
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => { setBike(data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, [id]);

  const getImageUrl = (path) => toAbsoluteUploadUrl(path);

  // Append a unit suffix only if the value doesn't already contain it
  const withUnit = (value, suffix) => {
    if (!value) return '—';
    const str = String(value).trim();
    if (str.toLowerCase().endsWith(suffix.toLowerCase())) return str;
    return `${str} ${suffix}`;
  };

  // Prefix ₱ only if the value doesn't already start with it
  const withPeso = (value) => {
    if (!value) return '—';
    const str = String(value).trim();
    return str.startsWith('₱') ? str : `₱${str}`;
  };

  // Normalise to an array — supports both old (string) and new (array) schema
  const getImages = (bike) => {
    if (Array.isArray(bike.images) && bike.images.length > 0) return bike.images;
    if (bike.image) return [bike.image]; // backwards compat with old single-image field
    return [];
  };

  // Convert newline-separated issues text into a bullet list
  const renderIssues = (text) => {
    if (!text) return <p className="text-secondary mb-0 font-monospace" style={{ fontSize: '0.85rem' }}>NO_KNOWN_ISSUES_DETECTED.</p>;
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      return <p className="text-secondary mb-0 font-monospace" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>{text}</p>;
    }
    return (
      <ul className="mb-0 ps-0" style={{ listStyle: 'none' }}>
        {lines.map((line, i) => (
          <li key={i} className="text-primary d-flex align-items-start gap-2 mb-2 font-monospace" style={{ fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.9 }}>
            <Circle size={6} className="text-accent mt-2 flex-shrink-0" fill="currentColor" />
            {line}
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '150px', minHeight: '100vh', textAlign: 'center' }}>
        <div className="moto-heading text-accent">LOADING...</div>
      </div>
    );
  }

  if (!bike || bike.status === 'Sold') {
    return (
      <div style={{ paddingTop: '150px', minHeight: '100vh', textAlign: 'center' }}>
        <h2 className="moto-heading text-destructive">UNIT SOLD OUT</h2>
        <p className="text-secondary mt-3">This motorcycle is no longer in our inventory.</p>
        <Link to="/inventory" className="moto-btn mt-4">BACK TO INVENTORY</Link>
      </div>
    );
  }

  const images = getImages(bike);

  const cleanPrice = parseFloat(String(bike.price).replace(/[^0-9.]/g, '')) || 0;
  const firstImage = images.length > 0 ? getImageUrl(images[0]) : '';
  const absoluteImage = firstImage.startsWith('http') ? firstImage : `https://katinginbikes.com${firstImage}`;

  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": `${bike.brand} ${bike.model} (${bike.year})`,
    "image": absoluteImage,
    "description": bike.description || `Fresh pre-owned ${bike.brand} ${bike.model} big bike for sale.`,
    "offers": {
      "@type": "Offer",
      "url": `https://katinginbikes.com/bike/${createSlug(bike)}-${bike._id}`,
      "priceCurrency": "PHP",
      "price": cleanPrice,
      "availability": bike.status === 'Sold' ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      "itemCondition": "https://schema.org/UsedCondition"
    }
  };

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '100px', minHeight: '100vh' }}>
      <Helmet>
        <title>{`${bike.brand} ${bike.model} (${bike.year}) | Katingin Bikes`}</title>
        <meta name="description" content={`Get this fresh pre-owned ${bike.brand} ${bike.model} (${bike.year}). Price: ${withPeso(bike.price)}, Engine: ${bike.engineSize}, Config: ${bike.engineConfig || 'N/A'}. Check clean papers.`} />
        <meta property="og:title" content={`${bike.brand} ${bike.model} (${bike.year}) - For Sale`} />
        <meta property="og:description" content={`Fresh pre-owned ${bike.brand} ${bike.model} big bike for sale at Katingin Bikes.`} />
        <meta property="og:image" content={absoluteImage} />
        <meta property="og:url" content={`https://katinginbikes.com/bike/${createSlug(bike)}-${bike._id}`} />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      <Container>
        <Link
          to="/inventory"
          className="text-accent text-decoration-none mb-5 d-inline-flex align-items-center gap-2"
          style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px' }}
        >
          <ArrowLeft size={16} /> BACK TO INVENTORY
        </Link>

        <Row className="g-5">
          {/* ── Image Carousel ── */}
          <Col lg={7}>
            <div className="sticky-lg-top-120">
              <div className="moto-card overflow-hidden">
                {images.length > 1 ? (
                  <Carousel interval={null}>
                    {images.map((img, idx) => (
                      <Carousel.Item key={idx}>
                        <div className="featured-gallery-main" style={{ height: 'clamp(260px, 45vw, 550px)' }}>
                          {!loadedMap[idx] && (
                            <div className="d-flex align-items-center justify-content-center position-absolute w-100 h-100" style={{ top: 0, left: 0, background: '#111', zIndex: 3 }}>
                              <div className="text-center">
                                <Spinner animation="border" size="sm" variant="accent" className="mb-2" />
                                <div className="text-secondary font-monospace" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>LOADING_IMAGES...</div>
                              </div>
                            </div>
                          )}
                          <img
                            src={getImageUrl(img)}
                            alt={`${bike.model} — background glow`}
                            className="featured-gallery-bg"
                          />
                          <img
                            src={getImageUrl(img)}
                            alt={`Pre-owned ${bike.brand} ${bike.model} ${bike.year} motorcycle photo ${idx + 1} - Katingin Bikes`}
                            className="featured-gallery-fg"
                            onLoad={() => handleImageLoad(idx)}
                          />
                        </div>
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <div className="featured-gallery-main" style={{ height: 'clamp(260px, 45vw, 550px)' }}>
                    {!singleImageLoaded && (
                      <div className="d-flex align-items-center justify-content-center position-absolute w-100 h-100" style={{ top: 0, left: 0, background: '#111', zIndex: 3 }}>
                        <div className="text-center">
                          <Spinner animation="border" size="sm" variant="accent" className="mb-2" />
                          <div className="text-secondary font-monospace" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>LOADING_IMAGE...</div>
                        </div>
                      </div>
                    )}
                    <img
                      src={getImageUrl(images[0])}
                      alt={`${bike.model} — background glow`}
                      className="featured-gallery-bg"
                    />
                    <img
                      src={getImageUrl(images[0])}
                      alt={`Pre-owned ${bike.brand} ${bike.model} ${bike.year} motorcycle - Katingin Bikes`}
                      className="featured-gallery-fg"
                      onLoad={() => setSingleImageLoaded(true)}
                    />
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* ── Bike Info ── */}
          <Col lg={5}>
            <div className="moto-card p-4 border-0" style={{ background: 'transparent' }}>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px' }}>{bike.type.toUpperCase()} // {withUnit(bike.engineSize, 'cc')}</span>
                <Badge className="bg-accent text-dark" style={{ fontSize: '0.75rem', fontWeight: 700, padding: '6px 12px' }}>AVAILABLE</Badge>
              </div>

              <h1 className="moto-heading mb-4" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)' }}>
                <span className="text-accent">{bike.brand}</span> {bike.model}
              </h1>

              <div className="d-flex flex-wrap gap-4 mb-5">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-3 rounded bg-muted">
                    <Calendar className="text-accent" size={24} />
                  </div>
                  <div>
                    <small className="text-secondary d-block" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px' }}>YEAR MODEL</small>
                    <span className="text-primary fw-bold" style={{ fontSize: '1.1rem' }}>{bike.year}</span>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="p-3 rounded bg-muted">
                    <Route className="text-accent" size={24} />
                  </div>
                  <div>
                    <small className="text-secondary d-block" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px' }}>MILEAGE</small>
                    <span className="text-primary fw-bold" style={{ fontSize: '1.1rem' }}>{withUnit(bike.mileage, 'km')}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4 p-4 rounded bg-muted" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                <small className="text-secondary d-block mb-1" style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>CASH PRICE</small>
                <div className="d-flex align-items-baseline gap-2">
                  <h2 className="text-primary fw-bold mb-0" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)' }}>{withPeso(bike.price)}</h2>
                </div>
              </div>

              {bike.isFinanceable !== false && (
                <div className="mb-5 p-4 rounded" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-primary)' }}>
                  <span className="badge bg-accent text-dark mb-3" style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px' }}>FINANCING AVAILABLE</span>

                  <div className="mb-4">
                    <small className="text-secondary d-block mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px' }}>MINIMUM DOWNPAYMENT</small>
                    <h3 className="text-white fw-bold mb-0" style={{ fontSize: '1.8rem' }}>{withPeso(bike.minDownpayment || "120,000")}</h3>
                  </div>

                  <Row className="g-3 pt-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
                    <Col xs={12} sm={4} className="d-flex d-sm-block justify-content-between align-items-center">
                      <small className="text-secondary d-block mb-0 mb-sm-1" style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px' }}>12 MOS</small>
                      <span className="text-accent fw-bold" style={{ fontSize: '1rem' }}>{withPeso(bike.monthly12 || "35,000")}<span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>/mo</span></span>
                    </Col>
                    <Col xs={12} sm={4} className="d-flex d-sm-block justify-content-between align-items-center">
                      <small className="text-secondary d-block mb-0 mb-sm-1" style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px' }}>24 MOS</small>
                      <span className="text-accent fw-bold" style={{ fontSize: '1rem' }}>{withPeso(bike.monthly24 || "19,500")}<span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>/mo</span></span>
                    </Col>
                    <Col xs={12} sm={4} className="d-flex d-sm-block justify-content-between align-items-center">
                      <small className="text-secondary d-block mb-0 mb-sm-1" style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px' }}>36 MOS</small>
                      <span className="text-accent fw-bold" style={{ fontSize: '1rem' }}>{withPeso(bike.monthly36 || "14,200")}<span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>/mo</span></span>
                    </Col>
                  </Row>

                  <div className="mt-4 pt-3 border-top d-flex align-items-start gap-2" style={{ borderColor: 'var(--border-color)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                    <Info size={18} className="text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-secondary">Looking for different terms or a custom downpayment? </span>
                      <Link
                        to={`/financing?bikeName=${encodeURIComponent(`${bike.brand} ${bike.model} ${bike.engineSize || ''}`.trim())}`}
                        className="text-accent fw-bold"
                        style={{ textDecoration: 'underline', display: 'inline-block', marginTop: '2px' }}
                      >
                        Click Here to Inquire via our Financing Tab
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <Link to="/contact" className="moto-btn w-100 mb-5 py-3 text-decoration-none" style={{ fontSize: '1rem' }}>
                INQUIRE NOW
              </Link>

              {/* Overview */}
              <div className="mb-5">
                <h5 className="moto-heading mb-3" style={{ fontSize: '1rem' }}><CircleCheck className="text-accent me-2" size={20} /> OVERVIEW</h5>
                <div className="description-container">
                  {renderIssues(bike.description)}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BikeDetails;
