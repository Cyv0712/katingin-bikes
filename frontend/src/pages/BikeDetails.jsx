import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Carousel } from 'react-bootstrap';
import { ArrowLeft, Calendar, Route, TriangleAlert, CircleCheck, Settings, Circle } from 'lucide-react';
import { apiUrl, toAbsoluteUploadUrl } from '../config/api';

const BikeDetails = () => {
  const { id } = useParams();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (!bike) {
    return (
      <div style={{ paddingTop: '150px', minHeight: '100vh', textAlign: 'center' }}>
        <h2 className="moto-heading text-destructive">UNIT NOT FOUND</h2>
        <Link to="/inventory" className="moto-btn mt-4">BACK TO INVENTORY</Link>
      </div>
    );
  }

  const images = getImages(bike);

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '100px', minHeight: '100vh' }}>
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
                        <img
                          src={getImageUrl(img)}
                          alt={`${bike.model} — photo ${idx + 1}`}
                          className="d-block w-100 bike-detail-carousel"
                          style={{ height: 'clamp(260px, 45vw, 550px)', objectFit: 'cover' }}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <img
                    src={getImageUrl(images[0])}
                    alt={bike.model}
                    className="bike-detail-single-img img-fluid"
                    style={{ width: '100%', height: 'clamp(260px, 45vw, 550px)', objectFit: 'cover' }}
                  />
                )}
              </div>
            </div>
          </Col>

          {/* ── Bike Info ── */}
          <Col lg={5}>
            <div className="moto-card p-4 border-0" style={{ background: 'transparent' }}>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px' }}>{bike.type.toUpperCase()} // {bike.engineSize}</span>
                <Badge className="bg-accent text-dark" style={{ fontSize: '0.75rem', fontWeight: 700, padding: '6px 12px' }}>AVAILABLE</Badge>
              </div>
              
              <h1 className="moto-heading mb-4" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)' }}>
                <span className="text-accent">{bike.brand}</span> {bike.model} {bike.engineSize?.replace('CC', '').trim()}
              </h1>

              <div className="d-flex gap-4 mb-5">
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

              <div className="mb-5 p-4 rounded bg-muted" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                <small className="text-secondary d-block mb-1" style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>CASH PRICE</small>
                <div className="d-flex align-items-baseline gap-2">
                   <h2 className="text-primary fw-bold mb-0" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)' }}>{withPeso(bike.price)}</h2>
                </div>
              </div>

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

              {/* Technical Specs */}
              <div className="mb-5">
                <h5 className="moto-heading mb-3" style={{ fontSize: '1rem' }}><Settings className="text-accent me-2" size={20} /> SPECIFICATIONS</h5>
                <Row className="g-3">
                  {[
                    { label: 'ENGINE',        value: bike.engineSize },
                    { label: 'CONFIGURATION', value: bike.engineConfig },
                    { label: 'POWER',         value: withUnit(bike.power, 'HP') },
                    { label: 'TRANSMISSION',  value: bike.transmission },
                    { label: 'FUEL CAPACITY', value: withUnit(bike.fuelCapacity, 'L') },
                  ].map(({ label, value }) => (
                    <Col md={6} key={label}>
                      <div className="p-3 rounded bg-muted h-100">
                        <small className="text-secondary d-block mb-1" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px' }}>{label}</small>
                        <span className="text-primary fw-bold" style={{ fontSize: '0.9rem' }}>{value || '—'}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* Honest Notes */}
              <div className="p-4 rounded" style={{ backgroundColor: 'rgba(220, 53, 69, 0.05)', border: '1px solid rgba(220, 53, 69, 0.2)' }}>
                <h5 className="text-destructive mb-3 d-flex align-items-center gap-2 moto-heading" style={{ fontSize: '1rem' }}>
                  <TriangleAlert size={20} /> HONEST NOTES
                </h5>
                {renderIssues(bike.issues)}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BikeDetails;
