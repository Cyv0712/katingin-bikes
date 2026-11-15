import { Link } from 'react-router-dom';
import { brandConfig } from '../data/brandConfig';
import { bikeAlt, bikePath, bikeImageProps, HERO_TILE_SIZES, withPeso } from '../utils/format';

// `first` is the tile most likely to be the largest thing on screen, so it jumps
// the queue. The others are lazy: below 768px the tiles are hidden (display: none),
// and a lazy image in a hidden box is never downloaded, an eager one always is.
const HeroTile = ({ bike, first }) => (
  <Link to={bikePath(bike)} className="kb-hero-tile moto-card moto-card-link" aria-label={`${bike.brand} ${bike.model}, ${withPeso(bike.price)}`}>
    <img
      {...bikeImageProps(bike, HERO_TILE_SIZES)}
      alt={bikeAlt(bike)}
      loading={first ? 'eager' : 'lazy'}
      fetchPriority={first ? 'high' : undefined}
      decoding="async"
    />
    <span className="kb-price-plate kb-price-plate-overlay">{withPeso(bike.price)}</span>
  </Link>
);

const TilePlaceholder = () => (
  <div className="kb-hero-tile moto-card skeleton-img" aria-hidden="true" />
);

/**
 * Home hero: headline + two actions on the left, and a staggered 2x2 grid of
 * the newest bikes on the right (hidden on phone, like the mockup).
 * `bikes` are up to four available bikes that have a photo.
 */
const HeroSection = ({ bikes, loading }) => {
  const columns = [bikes.slice(0, 2), bikes.slice(2, 4)];
  // The tiles are display: none below 768px; an eager image in a hidden box still downloads
  const tilesVisible = window.matchMedia('(min-width: 768px)').matches;

  return (
    <section
      id="home"
      className="kb-hero"
      style={{ '--hero-image': `url('${brandConfig.images.heroBackground}')` }}
    >
      <div className="container">
        <div className="kb-hero-inner">
          <div className="kb-hero-copy">
            <h1 className="kb-display-xl m-0">Pre-owned big bikes in Metro Manila</h1>
            <p className="kb-body-lg m-0" style={{ maxWidth: '500px' }}>
              Transparent inspection, complete OR/CR papers, and low downpayment financing.
            </p>
            <div className="kb-hero-actions">
              <Link to="/inventory" className="moto-btn">View inventory</Link>
              <Link to="/contact" className="moto-btn moto-btn-outline">Contact us</Link>
            </div>
          </div>

          <div className="kb-hero-grid">
            {loading
              ? [0, 1].map((col) => (
                  <div className="kb-hero-col" key={col}>
                    <TilePlaceholder />
                    <TilePlaceholder />
                  </div>
                ))
              : columns.map((column, col) => (
                  <div className="kb-hero-col" key={col}>
                    {column.map((bike) => <HeroTile key={bike._id} bike={bike} first={tilesVisible && col === 0 && bike === column[0]} />)}
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
