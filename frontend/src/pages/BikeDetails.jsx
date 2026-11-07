import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Carousel, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ArrowLeft, Banknote, Bookmark, Calendar, Route, Check, Circle, MessageCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { apiUrl, toAbsoluteUploadUrl } from '../config/api';
import { createSlug } from '../config/slug';
import { withPeso, withUnit } from '../utils/format';
import { getContactLinks, openViber } from '../utils/contactLinks';
import useBikes from '../hooks/useBikes';
import BikeCard from '../components/BikeCard';

const hasFinancingValue = (value) => {
  if (!value) return false;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  return cleaned.length > 0 && parseFloat(cleaned) > 0;
};

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== '';

// Normalise to an array — supports both old (string) and new (array) schema
const getImages = (bike) => {
  if (Array.isArray(bike.images) && bike.images.length > 0) return bike.images;
  if (bike.image) return [bike.image]; // backwards compat with old single-image field
  return [];
};

const INCLUDED = [
  {
    title: '100-point inspection',
    body: 'Checked by certified technicians before the unit enters our showroom.',
  },
  {
    title: 'Complete OR/CR papers',
    body: 'Authentic registration, with hassle-free transfer assistance.',
  },
  {
    title: 'Full bike history',
    body: 'We disclose the complete history and true odometer reading. No hidden issues.',
  },
];

// Convert newline-separated condition notes into a bullet list
const renderIssues = (text) => {
  if (!text) {
    return <p className="m-0" style={{ color: 'var(--ink-muted)' }}>No known issues recorded.</p>;
  }
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    return <p className="m-0" style={{ color: 'var(--ink-muted)' }}>{text}</p>;
  }
  return (
    <ul className="m-0 p-0 d-flex flex-column gap-2" style={{ listStyle: 'none' }}>
      {lines.map((line, i) => (
        <li key={i} className="d-flex align-items-start gap-2" style={{ color: 'var(--ink-muted)' }}>
          <Circle size={6} className="flex-shrink-0 mt-2" fill="currentColor" style={{ color: 'var(--brass-text)' }} aria-hidden="true" />
          {line}
        </li>
      ))}
    </ul>
  );
};

const BikeDetailsContent = ({ id }) => {
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const { bikes } = useBikes();
  const thumbsRef = useRef(null);

  // Keep the selected thumbnail in view when the photo changes (swipe, keys, click)
  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[activeIndex];
    if (!strip || !thumb) return;
    strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2, behavior: 'smooth' });
  }, [activeIndex]);

  useEffect(() => {
    fetch(apiUrl(`/api/bikes/${id}`))
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => { setBike(data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, [id]);

  // "More bikes": same brand first, then same type, then the newest
  const related = useMemo(() => {
    if (!bike) return [];
    const score = (b) => (b.brand === bike.brand ? 2 : 0) + (b.type && b.type === bike.type ? 1 : 0);
    return bikes
      .filter((b) => b._id !== bike._id)
      .sort((a, b) => score(b) - score(a) || new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  }, [bikes, bike]);

  if (loading) {
    return (
      <div className="container pt-4" aria-busy="true" aria-label="Loading bike">
        <div className="kb-detail mt-4">
          <div className="kb-gallery-main skeleton-img" />
          <div className="d-flex flex-column gap-3">
            <div className="skeleton-line title" style={{ width: '40%' }} />
            <div className="skeleton-line" style={{ height: '56px' }} />
            <div className="skeleton-line medium" />
          </div>
        </div>
      </div>
    );
  }

  if (!bike || bike.status === 'Sold') {
    return (
      <div className="container text-center" style={{ padding: '96px 0' }}>
        <h1 className="kb-h2" style={{ color: 'var(--danger)' }}>Unit sold out</h1>
        <p className="mt-3" style={{ color: 'var(--ink-muted)' }}>This motorcycle is no longer in our inventory.</p>
        <Link to="/inventory" className="moto-btn mt-4">Back to inventory</Link>
      </div>
    );
  }

  const images = getImages(bike).map((path) => toAbsoluteUploadUrl(path));
  const links = getContactLinks();
  const canonicalUrl = `https://katinginbikes.com/bike/${createSlug(bike)}-${bike._id}`;

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
  const monthlyTerms = [
    { label: '12 months', value: bike.monthly12 },
    { label: '24 months', value: bike.monthly24 },
    { label: '36 months', value: bike.monthly36 },
  ].filter((term) => hasFinancingValue(term.value));
  const showFinancingCard =
    bike.isFinanceable !== false && !bike.isReserved && (showDownpayment || monthlyTerms.length > 0);

  // When there is no financing card, say why instead of leaving a gap
  const financingNote = bike.isReserved
    ? 'This unit is reserved, so its financing terms are not shown.'
    : bike.isFinanceable === false
      ? 'This unit is not available for financing.'
      : 'We have not listed financing terms for this unit yet. Message us on Viber for options.';

  // Only rows with data are shown: the extra spec fields exist on a few bikes
  const specs = [
    ['Year', bike.year],
    ['Mileage', hasValue(bike.mileage) ? withUnit(bike.mileage, 'km') : null],
    ['Engine', hasValue(bike.engineSize) ? withUnit(bike.engineSize, 'cc') : null],
    ['Type', bike.type],
    ['Engine configuration', bike.engineConfig],
    ['Power', bike.power],
    ['Transmission', bike.transmission],
    ['Fuel capacity', bike.fuelCapacity],
    ['Edition', bike.edition],
  ].filter(([, value]) => hasValue(value));

  const cleanPrice = parseFloat(String(bike.price).replace(/[^0-9.]/g, '')) || 0;
  const firstImage = images[0] || '';
  const absoluteImage = firstImage.startsWith('http') ? firstImage : `https://katinginbikes.com${firstImage}`;

  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": `${bike.brand} ${bike.model} (${bike.year})`,
    "image": absoluteImage,
    "description": bike.description || `Fresh pre-owned ${bike.brand} ${bike.model} big bike for sale.`,
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "PHP",
      "price": cleanPrice,
      "availability": bike.status === 'Sold' ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      "itemCondition": "https://schema.org/UsedCondition"
    }
  };

  const photoAlt = (idx) =>
    `Pre-owned ${bike.brand} ${bike.model} ${bike.year} motorcycle photo ${idx + 1} - Katingin Bikes`;

  return (
    <div className="bike-details">
      <Helmet>
        <title>{`${bike.brand} ${bike.model} (${bike.year}) | Katingin Bikes`}</title>
        <meta name="description" content={`Fresh pre-owned ${bike.brand} ${bike.model} (${bike.year}) for sale in Metro Manila, Philippines. Price: ${withPeso(bike.price)}, Engine: ${bike.engineSize || 'N/A'}. 100-point inspected with complete OR/CR papers.`} />
        <meta name="keywords" content={`${bike.brand} ${bike.model}, ${bike.brand} motorcycle Philippines, pre-owned ${bike.brand} ${bike.model}, used big bikes Philippines`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${bike.brand} ${bike.model} (${bike.year}) | Katingin Bikes`} />
        <meta property="og:description" content={`Pre-owned ${bike.brand} ${bike.model} (${bike.year}) for sale at Katingin Bikes Philippines. Price: ${withPeso(bike.price)}.`} />
        <meta property="og:image" content={absoluteImage} />
        <meta property="og:url" content={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <div className="container pt-3">
        <Link to="/inventory" className="kb-link">
          <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
          Back to inventory
        </Link>
      </div>

      <section className="container pt-2">
        <div className="kb-detail">
          {/* ── Gallery ── */}
          <div>
            <div className="kb-gallery-main">
              {images.length > 1 ? (
                <Carousel
                  activeIndex={activeIndex}
                  onSelect={(selectedIdx) => setActiveIndex(selectedIdx)}
                  interval={null}
                  controls={false}
                  indicators={false}
                >
                  {images.map((img, idx) => (
                    <Carousel.Item key={idx}>
                      <img src={img} alt={photoAlt(idx)} />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : images.length === 1 ? (
                <img src={images[0]} alt={photoAlt(0)} />
              ) : null}
            </div>

            {images.length > 1 && (
              <div className={`kb-thumbs ${images.length > 4 ? 'kb-thumbs-scroll' : ''}`} ref={thumbsRef}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="kb-thumb"
                    aria-label={`Photo ${idx + 1}${activeIndex === idx ? ', selected' : ''}`}
                    aria-pressed={activeIndex === idx}
                    onClick={() => setActiveIndex(idx)}
                  >
                    <img src={img} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="d-flex flex-column align-items-start gap-4">
            <div className="d-flex flex-column align-items-start gap-3">
              {bike.isReserved ? (
                <span className="kb-badge kb-badge-reserved">
                  <Bookmark size={16} strokeWidth={2} fill="currentColor" aria-hidden="true" />
                  Reserved
                </span>
              ) : (
                <span className="kb-badge kb-badge-success"><span className="kb-badge-dot" />Available</span>
              )}
              <h1 className="kb-h1 m-0">{bike.brand} {bike.model}</h1>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2" style={{ columnGap: '20px', color: 'var(--ink-muted)' }}>
              <span className="d-inline-flex align-items-center gap-2">
                <Calendar size={18} strokeWidth={1.75} aria-hidden="true" />
                {bike.year}
              </span>
              <span className="d-inline-flex align-items-center gap-2">
                <Route size={18} strokeWidth={1.75} aria-hidden="true" />
                {withUnit(bike.mileage, 'km')}
              </span>
              {bike.type && <span className="kb-tag kb-tag-lg">{bike.type}</span>}
            </div>

            <div className="kb-price-plate kb-price-plate-lg">{withPeso(bike.price)}</div>

            {showFinancingCard && (
              <div className="moto-card kb-fin w-100">
                <dl className="kb-spec-list m-0">
                  {showDownpayment && (
                    <div className="kb-spec-row">
                      <dt>Minimum downpayment</dt>
                      <dd className="kb-num">{withPeso(bike.minDownpayment)}</dd>
                    </div>
                  )}
                  {monthlyTerms.map((term) => (
                    <div className="kb-spec-row" key={term.label}>
                      <dt>{term.label}</dt>
                      <dd className="kb-num">{withPeso(term.value)}<span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}>/mo</span></dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {!showFinancingCard && (
              <div className="moto-card kb-fin-empty w-100">
                <Banknote size={24} strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <div className="kb-label">Financing details not available</div>
                  <p className="kb-body-sm m-0" style={{ color: 'var(--ink-muted)' }}>{financingNote}</p>
                </div>
              </div>
            )}

            <div className="d-flex flex-column gap-3 w-100">
              {canInquireFinancing ? (
                <Link to={financingUrl} className="moto-btn moto-btn-lg moto-btn-block">
                  Inquire for financing
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
                  <span className="d-block w-100" tabIndex={0} style={{ cursor: 'not-allowed' }}>
                    <button type="button" className="moto-btn moto-btn-lg moto-btn-block" disabled>
                      Inquire for financing
                    </button>
                  </span>
                </OverlayTrigger>
              )}
              <a
                href={links.viber}
                onClick={openViber}
                target="_blank"
                rel="noreferrer"
                className="moto-btn moto-btn-outline moto-btn-lg moto-btn-block"
              >
                <MessageCircle size={18} strokeWidth={1.75} aria-hidden="true" />
                Message us on Viber
              </a>
            </div>

            <p className="kb-body-sm m-0" style={{ color: 'var(--ink-muted)' }}>
              Stocks and prices can change without notice. Message us on Viber or Facebook to confirm availability and the unit&apos;s condition.
            </p>
          </div>
        </div>
      </section>

      <section className="kb-section" aria-labelledby="spec-heading">
        <div className="container kb-two-col">
          <div>
            <h2 id="spec-heading" className="kb-h3 mb-4">Specifications</h2>
            <dl className="kb-spec-list">
              {specs.map(([label, value]) => (
                <div className="kb-spec-row" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <h2 className="kb-h3 mt-5 mb-3">Unit overview and condition</h2>
            {renderIssues(bike.description)}
          </div>

          <div>
            <h2 className="kb-h3 mb-4">Included with every unit</h2>
            <div className="d-flex flex-column gap-3">
              {INCLUDED.map((item) => (
                <div className="moto-card kb-check-card" key={item.title}>
                  <Check size={24} strokeWidth={1.75} aria-hidden="true" />
                  <div>
                    <div className="kb-h4">{item.title}</div>
                    <p>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="kb-section" aria-labelledby="more-heading">
          <div className="container">
            <div className="kb-section-head">
              <h2 id="more-heading" className="kb-h2 m-0">More bikes</h2>
              <Link to="/inventory" className="kb-link">View inventory</Link>
            </div>
            <div className="kb-grid">
              {related.map((b) => <BikeCard key={b._id} bike={b} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

// Keyed by id so moving between bikes (e.g. via "More bikes") starts fresh:
// new fetch, first photo selected.
const BikeDetails = () => {
  const { slugAndId } = useParams();
  const id = slugAndId ? slugAndId.split('-').pop() : '';
  return <BikeDetailsContent key={id} id={id} />;
};

export default BikeDetails;
