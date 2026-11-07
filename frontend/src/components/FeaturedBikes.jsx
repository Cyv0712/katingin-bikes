import { Link } from 'react-router-dom';
import BikeCard from './BikeCard';
import SkeletonCard from './SkeletonCard';

/**
 * Home "Featured bikes": four live units from the inventory.
 * `bikes` is chosen by Home (newest units not already in the hero).
 */
const FeaturedBikes = ({ bikes, loading }) => {
  if (!loading && bikes.length === 0) return null;

  return (
    <section id="inventory" className="kb-section" aria-labelledby="featured-heading">
      <div className="container">
        <div className="kb-section-head">
          <h2 id="featured-heading" className="kb-h2 m-0">Featured bikes</h2>
          <Link to="/inventory" className="kb-link">View inventory</Link>
        </div>
        <div className="kb-grid">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : bikes.map((bike) => <BikeCard key={bike._id} bike={bike} />)}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBikes;
