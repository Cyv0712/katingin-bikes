import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import { ArrowLeft, Check, Zap } from 'lucide-react';
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
      return <p className="kb-body-lg m-0">{text}</p>;
    }
    return (
      <ul className="m-0 p-0 d-flex flex-column gap-2" style={{ listStyle: 'none' }}>
        {lines.map((line, i) => (
          <li key={i} className="d-flex align-items-start gap-2" style={{ color: 'var(--ink-muted)' }}>
            <Check className="text-accent flex-shrink-0 mt-1" size={20} strokeWidth={1.75} aria-hidden="true" />
            {line}
          </li>
        ))}
      </ul>
    );
  };

  if (!bike) {
    return (
      <div className="container text-center" style={{ padding: '96px 0' }}>
        <h1 className="kb-h2" style={{ color: 'var(--danger)' }}>Showcase bike not found</h1>
        <Link to="/inventory" className="moto-btn mt-4">Browse inventory</Link>
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
    <div className="showcase-page">
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

      <div className="container pt-3">
        <Link to="/" className="kb-link">
          <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
          Back to home
        </Link>
      </div>

      <div className="container pt-2">
        <div className="kb-detail">
          <div>
            <div className="kb-gallery-main">
              <Carousel activeIndex={activeIndex} onSelect={(selectedIdx) => setActiveIndex(selectedIdx)} interval={null} controls={false} indicators={false}>
                {bike.images.map((imgSrc, idx) => (
                  <Carousel.Item key={idx}>
                    <img src={imgSrc} alt={`${bike.brand} ${bike.model} photo ${idx + 1}`} />
                  </Carousel.Item>
                ))}
              </Carousel>
            </div>

            {bike.images.length > 1 && (
              <div className="kb-thumbs">
                {bike.images.map((imgSrc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="kb-thumb"
                    aria-label={`Photo ${idx + 1}${activeIndex === idx ? ', selected' : ''}`}
                    aria-pressed={activeIndex === idx}
                    onClick={() => setActiveIndex(idx)}
                  >
                    <img src={imgSrc} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="d-flex flex-column align-items-start gap-4">
            <div className="d-flex flex-column align-items-start gap-3">
              {inStock ? (
                <span className="kb-badge kb-badge-success"><span className="kb-badge-dot" />Available in inventory</span>
              ) : (
                <span className="kb-badge kb-badge-danger"><span className="kb-badge-dot" />Sold out</span>
              )}
              <span className="kb-label" style={{ color: 'var(--ink-muted)' }}>{bike.brand} Hall of Fame</span>
              <h1 className="kb-h1 m-0">{bike.model}</h1>
              <p className="kb-h4 m-0" style={{ color: 'var(--brass-text)', fontStyle: 'italic' }}>&ldquo;{bike.tagline}&rdquo;</p>
            </div>

            {renderList(bike.description)}

            <div className="moto-card w-100 p-4">
              <h2 className="kb-h4 mb-4 d-flex align-items-center gap-2">
                <Zap size={20} strokeWidth={1.75} className="text-accent" aria-hidden="true" /> Core specifications
              </h2>
              <ul className="m-0 p-0 d-grid gap-3" style={{ listStyle: 'none', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {bike.features.map((feature, idx) => (
                  <li key={idx} className="d-flex align-items-center gap-2" style={{ color: 'var(--ink-muted)' }}>
                    <Check className="text-accent flex-shrink-0" size={18} strokeWidth={1.75} aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {inStock && matchedLiveBike ? (
              <div className="moto-card w-100 p-4">
                <h2 className="kb-h4 mb-2">Currently available showroom unit</h2>
                <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>
                  Great news! We currently have a {bike.model} available in our live inventory. View the actual unit below.
                </p>
                <Link to={`/bike/${createSlug(matchedLiveBike)}-${matchedLiveBike._id}`} className="moto-btn moto-btn-lg moto-btn-block">
                  View live inventory unit
                </Link>
              </div>
            ) : (
              <div className="moto-card w-100 p-4">
                <h2 className="kb-h4 mb-2">Out of stock</h2>
                <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>
                  We don&apos;t have any pre-owned {bike.model} units right now. Check back later or browse our other inventory!
                </p>
                <Link to="/inventory" className="moto-btn moto-btn-outline moto-btn-lg moto-btn-block">
                  Browse all bikes
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseDetails;
