import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useLocation, Link, Navigate } from 'react-router-dom';
import { Carousel, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ArrowLeft, Banknote, Bookmark, Calendar, Route, Check, Circle, MessageCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Seo from '../seo/Seo';
import { bikeMeta, SITE_URL } from '../seo/meta';
import ShareBar from '../components/ShareBar';
import { showcaseBikes } from '../data/showcase';
import { findShowcaseInventoryMatch } from '../utils/showcaseStockMatch';
import { apiUrl, toAbsoluteUploadUrl } from '../config/api';
import { bikePath } from '../config/slug';
import { withPeso, withUnit, imageProps, preloadImage } from '../utils/format';
import { bikeSpecs, bikeFinancing } from '../utils/bikeFacts';
import { getContactLinks, openViber, bikeInquiryMessage } from '../utils/contactLinks';
import useBikes from '../hooks/useBikes';
import BikeCard from '../components/BikeCard';

// Normalise to an array — supports both old (string) and new (array) schema
const getImages = (bike) => {
  if (Array.isArray(bike.images) && bike.images.length > 0) return bike.images;
  if (bike.image) return [bike.image]; // backwards compat with old single-image field
  return [];
};

// How wide the photos are drawn: the main photo fills the screen up to 991px, then about
// 55% of it beside the details; thumbnails are small
const GALLERY_SIZES = '(max-width: 991.98px) 100vw, 55vw';
const THUMB_SIZES = '(max-width: 991.98px) 25vw, 10vw';
const THUMB_OPTIONS = { widths: [240, 480], original: false };

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

const BikeDetailsContent = ({ id, slugAndId }) => {
  const location = useLocation();
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

  // Only the selected photo is loaded up front (the others sit in hidden carousel
  // slides), so fetch the neighbours of the one on screen ahead of the next swipe.
  useEffect(() => {
    if (!bike) return;
    const photos = getImages(bike);
    [activeIndex - 1, activeIndex + 1].forEach((i) => {
      if (photos[i]) preloadImage(imageProps(photos[i], GALLERY_SIZES));
    });
  }, [bike, activeIndex]);

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
    const score = (b) => (bike && b.brand === bike.brand ? 2 : 0) + (bike && b.type && b.type === bike.type ? 1 : 0);
    return bikes
      .filter((b) => b._id !== bike?._id)
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
        {/* The server still answers 200 for these URLs, so tell crawlers not to index them */}
        <Helmet>
          {/* Marking a bike sold clears its year, so only name what is still there */}
          <title>{bike ? `Sold: ${[bike.brand, bike.model].filter(Boolean).join(' ')} | Katingin Bikes` : 'Unit not found | Katingin Bikes'}</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <h1 className="kb-h2" style={{ color: 'var(--danger)' }}>Unit sold out</h1>
        <p className="mt-3" style={{ color: 'var(--ink-muted)' }}>This motorcycle is no longer in our inventory.</p>
        <Link to="/inventory" className="moto-btn mt-4">Back to inventory</Link>

        {related.length > 0 && (
          <section className="mt-5 text-start" aria-labelledby="similar-heading">
            <h2 id="similar-heading" className="kb-h2 mb-4">Similar bikes in stock</h2>
            <div className="kb-grid">
              {related.map((b) => <BikeCard key={b._id} bike={b} />)}
            </div>
          </section>
        )}
      </div>
    );
  }

  // Any slug text resolves (only the id matters), so send stale or mistyped
  // slugs to the one canonical URL, keeping the query string (e.g. utm tags).
  if (slugAndId !== bikePath(bike).replace('/bike/', '')) {
    return <Navigate to={{ pathname: bikePath(bike), search: location.search }} replace />;
  }

  const images = getImages(bike);
  const links = getContactLinks({ message: bikeInquiryMessage(bike) });
  const bikeName = [bike.year, bike.brand, bike.model].filter(Boolean).join(' ');

  const financingUrl = `/financing?bikeId=${encodeURIComponent(bike._id)}&bikeName=${encodeURIComponent(
    `${bike.brand} ${bike.model} ${bike.engineSize || ''}`.trim()
  )}`;

  const inquiryBlockReason = bike.isReserved
    ? 'This unit is reserved and cannot accept new inquiries.'
    : bike.isFinanceable === false
      ? 'This unit is not available for financing.'
      : null;

  const canInquireFinancing = !inquiryBlockReason;
  const { showDownpayment, monthlyTerms, showCard: showFinancingCard } = bikeFinancing(bike);

  // When there is no financing card, say why instead of leaving a gap
  const financingNote = bike.isReserved
    ? 'This unit is reserved, so its financing terms are not shown.'
    : bike.isFinanceable === false
      ? 'This unit is not available for financing.'
      : 'We have not listed financing terms for this unit yet. Message us on Viber for options.';

  const specs = bikeSpecs(bike);
  // The showcase (model) page for this bike, when there is one
  const modelPage = showcaseBikes.find((s) => findShowcaseInventoryMatch(s, [bike]));

  const photoAlt = (idx) =>
    `Pre-owned ${bike.brand} ${bike.model} ${bike.year} motorcycle photo ${idx + 1} - Katingin Bikes`;

  return (
    <div className="bike-details">
      <Seo meta={bikeMeta(bike, toAbsoluteUploadUrl)} />

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
                      <img
                        {...imageProps(img, GALLERY_SIZES)}
                        alt={photoAlt(idx)}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        fetchPriority={idx === 0 ? 'high' : undefined}
                        decoding="async"
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : images.length === 1 ? (
                <img {...imageProps(images[0], GALLERY_SIZES)} alt={photoAlt(0)} fetchPriority="high" decoding="async" />
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
                    <img {...imageProps(img, THUMB_SIZES, THUMB_OPTIONS)} alt="" loading="lazy" decoding="async" />
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
                <Link
                  to={financingUrl}
                  className="moto-btn moto-btn-lg moto-btn-block"
                  data-umami-event="financing_click"
                  data-umami-event-placement="page"
                  data-umami-event-bike={bikeName}
                >
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
                data-umami-event="viber_click"
                data-umami-event-placement="page"
                data-umami-event-bike={bikeName}
              >
                <MessageCircle size={18} strokeWidth={1.75} aria-hidden="true" />
                Message us on Viber
              </a>
              <a
                href={links.messenger}
                target="_blank"
                rel="noreferrer"
                className="moto-btn moto-btn-outline moto-btn-lg moto-btn-block"
                data-umami-event="messenger_click"
                data-umami-event-placement="page"
                data-umami-event-bike={bikeName}
              >
                <MessageCircle size={18} strokeWidth={1.75} aria-hidden="true" />
                Message us on Messenger
              </a>
            </div>

            <p className="kb-body-sm m-0" style={{ color: 'var(--ink-muted)' }}>
              Stocks and prices can change without notice. Message us on Viber or Facebook to confirm availability and the unit&apos;s condition.
            </p>

            <ShareBar
              url={`${SITE_URL}${bikePath(bike)}`}
              text={`Check out this ${bikeName} at Katingin Bikes.`}
              bikeName={bikeName}
            />
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
            {modelPage && (
              <p className="mt-3 mb-0">
                <Link to={`/showcase/${modelPage.slug}`} className="kb-link">
                  About the {modelPage.brand} {modelPage.model}
                </Link>
              </p>
            )}

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

      {/* Phones: the buttons above sit below the price and financing card, so keep them in reach */}
      <div className="kb-sticky-cta" role="region" aria-label="Contact us about this bike">
        <a
          href={links.viber}
          onClick={openViber}
          target="_blank"
          rel="noreferrer"
          className="moto-btn"
          data-umami-event="viber_click"
          data-umami-event-placement="sticky"
          data-umami-event-bike={bikeName}
        >
          Viber
        </a>
        <a
          href={links.messenger}
          target="_blank"
          rel="noreferrer"
          className="moto-btn moto-btn-outline"
          data-umami-event="messenger_click"
          data-umami-event-placement="sticky"
          data-umami-event-bike={bikeName}
        >
          Messenger
        </a>
        {canInquireFinancing && (
          <Link
            to={financingUrl}
            className="moto-btn moto-btn-outline"
            data-umami-event="financing_click"
            data-umami-event-placement="sticky"
            data-umami-event-bike={bikeName}
          >
            Financing
          </Link>
        )}
      </div>
    </div>
  );
};

// Keyed by id so moving between bikes (e.g. via "More bikes") starts fresh:
// new fetch, first photo selected.
const BikeDetails = () => {
  const { slugAndId } = useParams();
  const id = slugAndId ? slugAndId.split('-').pop() : '';
  return <BikeDetailsContent key={id} id={id} slugAndId={slugAndId || ''} />;
};

export default BikeDetails;
