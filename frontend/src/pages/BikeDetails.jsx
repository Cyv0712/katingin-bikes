import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Carousel, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ArrowLeft, Calendar, Route, CircleCheck, Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiUrl, toAbsoluteUploadUrl } from '../config/api';
import { Helmet } from 'react-helmet-async';
import { createSlug } from '../config/slug';

const hasFinancingValue = (value) => {
  if (!value) return false;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  return cleaned.length > 0 && parseFloat(cleaned) > 0;
};

const BikeDetails = () => {
  const { slugAndId } = useParams();
  const id = slugAndId ? slugAndId.split('-').pop() : '';
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadedMap, setLoadedMap] = useState({});
  const [singleImageLoaded, setSingleImageLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const financingUrl = `/financing?bikeName=${encodeURIComponent(
    `${bike.brand} ${bike.model} ${bike.engineSize || ''}`.trim()
  )}`;

  const inquiryBlockReason = bike.isReserved
    ? 'This unit is reserved and cannot accept new inquiries.'
    : bike.isFinanceable === false
      ? 'This unit is not available for financing.'
      : null;

  const canInquireFinancing = !inquiryBlockReason;
  const showDownpayment = hasFinancingValue(bike.minDownpayment);
  const showMonthly12 = hasFinancingValue(bike.monthly12);
  const showMonthly24 = hasFinancingValue(bike.monthly24);
  const showMonthly36 = hasFinancingValue(bike.monthly36);
  const showMonthlyTerms = showMonthly12 || showMonthly24 || showMonthly36;
  const showFinancingCard =
    bike.isFinanceable !== false && !bike.isReserved && (showDownpayment || showMonthlyTerms);

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
        <title>{`${bike.brand} ${bike.model} (${bike.year}) | Pre-Owned Motorcycles Philippines`}</title>
        <meta name="description" content={`Fresh pre-owned ${bike.brand} ${bike.model} (${bike.year}) for sale in Metro Manila, Philippines. Price: ${withPeso(bike.price)}, Engine: ${bike.engineSize || 'N/A'}. 100-point inspected with complete OR/CR papers.`} />
        <meta name="keywords" content={`${bike.brand} ${bike.model}, ${bike.brand} motorcycle Philippines, pre-owned ${bike.brand} ${bike.model}, used big bikes Philippines`} />
        <link rel="canonical" href={`https://katinginbikes.com/bike/${createSlug(bike)}-${bike._id}`} />
        <meta property="og:title" content={`${bike.brand} ${bike.model} (${bike.year}) | Pre-Owned Motorcycles Philippines`} />
        <meta property="og:description" content={`Pre-owned ${bike.brand} ${bike.model} (${bike.year}) for sale at Katingin Bikes Philippines. Price: ${withPeso(bike.price)}.`} />
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
              <div className="moto-card moto-card-static overflow-hidden">
                {images.length > 1 ? (
                  <Carousel activeIndex={activeIndex} onSelect={(selectedIdx) => setActiveIndex(selectedIdx)} interval={null} controls={false} indicators={false}>
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

              {/* Mini Image Thumbnails Navigation Strip */}
              {images.length > 1 && (
                <div className="d-flex align-items-center justify-content-center gap-2 mt-3 px-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-link p-1 text-secondary text-decoration-none"
                    onClick={() => setActiveIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                    aria-label="Previous image thumbnail"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <div className="d-flex align-items-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar" style={{ maxWidth: '100%' }}>
                    {images.map((img, idx) => {
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
                            src={getImageUrl(img)}
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
                    onClick={() => setActiveIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                    aria-label="Next image thumbnail"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>
              )}
            </div>
          </Col>

          {/* ── Bike Info ── */}
          <Col lg={5}>
            <div className="moto-card glass-panel p-4 p-xl-5">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="featured-spec-badge">{bike.type?.toUpperCase()} // {withUnit(bike.engineSize, 'cc')}</span>
                <Badge className={bike.isReserved ? 'bg-danger text-white' : 'bg-success text-white'} style={{ fontSize: '0.75rem', fontWeight: 700, padding: '6px 12px' }}>
                  {bike.isReserved ? 'RESERVED' : 'AVAILABLE'}
                </Badge>
              </div>

              <h1 className="moto-heading mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', lineHeight: '1.15' }}>
                <span className="text-accent">{bike.brand}</span> {bike.model}
              </h1>

              <div className="d-flex flex-wrap gap-3 mb-4">
                <div className="d-flex align-items-center gap-3 p-3 rounded glass-panel flex-grow-1">
                  <div className="p-2 rounded bg-muted">
                    <Calendar className="text-accent" size={20} />
                  </div>
                  <div>
                    <small className="text-secondary d-block" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px' }}>YEAR MODEL</small>
                    <span className="text-white fw-bold" style={{ fontSize: '1.1rem' }}>{bike.year}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3 p-3 rounded glass-panel flex-grow-1">
                  <div className="p-2 rounded bg-muted">
                    <Route className="text-accent" size={20} />
                  </div>
                  <div>
                    <small className="text-secondary d-block" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px' }}>ODOMETER</small>
                    <span className="text-white fw-bold" style={{ fontSize: '1.1rem' }}>{withUnit(bike.mileage, 'km')}</span>
                  </div>
                </div>
              </div>

              {/* Price Card */}
              <div className="mb-4 p-4 rounded glass-panel">
                <small className="text-secondary d-block mb-1" style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>CASH PRICE</small>
                <h2 className="text-accent fw-bold mb-0" style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)' }}>{withPeso(bike.price)}</h2>
              </div>

              {showFinancingCard && (
                <div className="mb-4 p-4 rounded glass-panel border border-secondary-subtle">
                  {showDownpayment && (
                    <div className={showMonthlyTerms ? 'mb-3 pb-3 border-bottom border-secondary-subtle' : 'mb-0'}>
                      <small className="text-secondary text-mono d-block mb-1" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>MINIMUM DOWNPAYMENT</small>
                      <h3 className="text-white text-mono fw-bold mb-0" style={{ fontSize: '1.6rem' }}>{withPeso(bike.minDownpayment)}</h3>
                    </div>
                  )}

                  {showMonthlyTerms && (
                    <Row className="g-3 text-mono">
                      {showMonthly12 && (
                        <Col xs={12} sm={4} className="d-flex d-sm-block justify-content-between align-items-center">
                          <small className="text-secondary d-block mb-0 mb-sm-1" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>12 MOS</small>
                          <span className="text-accent fw-bold" style={{ fontSize: '0.95rem' }}>{withPeso(bike.monthly12)}<span className="text-muted" style={{ fontSize: '0.72rem' }}>/mo</span></span>
                        </Col>
                      )}
                      {showMonthly24 && (
                        <Col xs={12} sm={4} className="d-flex d-sm-block justify-content-between align-items-center">
                          <small className="text-secondary d-block mb-0 mb-sm-1" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>24 MOS</small>
                          <span className="text-accent fw-bold" style={{ fontSize: '0.95rem' }}>{withPeso(bike.monthly24)}<span className="text-muted" style={{ fontSize: '0.72rem' }}>/mo</span></span>
                        </Col>
                      )}
                      {showMonthly36 && (
                        <Col xs={12} sm={4} className="d-flex d-sm-block justify-content-between align-items-center">
                          <small className="text-secondary d-block mb-0 mb-sm-1" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>36 MOS</small>
                          <span className="text-accent fw-bold" style={{ fontSize: '0.95rem' }}>{withPeso(bike.monthly36)}<span className="text-muted" style={{ fontSize: '0.72rem' }}>/mo</span></span>
                        </Col>
                      )}
                    </Row>
                  )}
                </div>
              )}

              <div className="mb-4">
                {canInquireFinancing ? (
                  <Link to={financingUrl} className="moto-btn w-100 py-3 text-decoration-none" style={{ fontSize: '0.95rem' }}>
                    INQUIRE FOR FINANCING
                  </Link>
                ) : (
                  <OverlayTrigger
                    trigger={['hover', 'focus', 'click']}
                    placement="top"
                    overlay={
                      <Tooltip id="inquiry-block-tooltip" className="inquiry-block-tooltip">
                        {inquiryBlockReason}
                      </Tooltip>
                    }
                  >
                    <span className="d-inline-block w-100" tabIndex={0} style={{ cursor: 'not-allowed' }}>
                      <button
                        type="button"
                        className="moto-btn w-100 py-3"
                        disabled
                        style={{ fontSize: '0.95rem', opacity: 0.5, pointerEvents: 'none' }}
                      >
                        INQUIRE FOR FINANCING
                      </button>
                    </span>
                  </OverlayTrigger>
                )}
              </div>

              {/* Overview */}
              <div>
                <h5 className="moto-heading mb-3" style={{ fontSize: '0.95rem' }}><CircleCheck className="text-accent me-2" size={18} /> UNIT OVERVIEW & CONDITION</h5>
                <div className="description-container">
                  {renderIssues(bike.description)}
                </div>
                <div className="mt-4 pt-3 border-top border-secondary-subtle d-flex align-items-center justify-content-between">
                  <span className="text-secondary text-mono fw-bold" style={{ fontSize: '0.78rem', letterSpacing: '0.5px' }}>POWERED BY REVLINE PLATFORM</span>
                  <img src="/static_data/revline_logo.png" alt="REVLINE" style={{ height: '36px', width: 'auto', filter: 'invert(1) brightness(1.2)' }} />
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
