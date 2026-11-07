/**
 * SkeletonCard — placeholder with the same footprint as a BikeCard.
 * Rendered in a grid while the inventory loads.
 */
const SkeletonCard = () => {
  return (
    <div className="skeleton-card moto-card" aria-hidden="true">
      <div className="skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton-line title" />
        <div className="skeleton-line medium" />
      </div>
    </div>
  );
};

export default SkeletonCard;
