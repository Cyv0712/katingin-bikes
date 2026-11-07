import { Link } from 'react-router-dom';
import { Bookmark, Calendar, Route } from 'lucide-react';
import { bikeAlt, bikePath, getBikeImage, withPeso, withUnit } from '../utils/format';

/**
 * The bike card used on Home (featured), Inventory and Bike detail
 * ("More bikes"). The whole card is the link; price sits on a brass plate.
 */
const BikeCard = ({ bike }) => (
  <Link to={bikePath(bike)} className="kb-card moto-card moto-card-link">
    <div className="kb-card-media">
      <img src={getBikeImage(bike)} alt={bikeAlt(bike)} loading="lazy" />
      {bike.isReserved && (
        <span className="kb-badge kb-badge-reserved kb-card-flag">
          <Bookmark size={14} strokeWidth={2} fill="currentColor" aria-hidden="true" />
          Reserved
        </span>
      )}
      <span className="kb-price-plate kb-price-plate-overlay">{withPeso(bike.price)}</span>
    </div>
    <div className="kb-card-body">
      <h3 className="kb-card-title">
        {bike.brand} {bike.model}
      </h3>
      <div className="kb-card-meta">
        <span>
          <Calendar size={16} strokeWidth={1.75} aria-hidden="true" />
          {bike.year}
        </span>
        <span>
          <Route size={16} strokeWidth={1.75} aria-hidden="true" />
          {withUnit(bike.mileage, 'km')}
        </span>
        {bike.type && <span className="kb-tag kb-card-type">{bike.type}</span>}
      </div>
    </div>
  </Link>
);

export default BikeCard;
