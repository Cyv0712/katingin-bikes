import { Link } from 'react-router-dom';
import { brandConfig } from '../data/brandConfig';
import { bikeAlt, bikePath, getBikeImage, withPeso } from '../utils/format';

const HeroTile = ({ bike }) => (
  <Link to={bikePath(bike)} className="kb-hero-tile moto-card moto-card-link" aria-label={`${bike.brand} ${bike.model}, ${withPeso(bike.price)}`}>
    <img src={getBikeImage(bike)} alt={bikeAlt(bike)} />
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
                    {column.map((bike) => <HeroTile key={bike._id} bike={bike} />)}
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
