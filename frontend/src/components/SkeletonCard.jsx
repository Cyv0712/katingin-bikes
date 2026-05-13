/**
 * SkeletonCard — Animated placeholder that mimics the shape of a BikeCard.
 * Rendered in a grid of 6 while the Inventory page fetches data from the API.
 */
const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
        <div className="skeleton-line medium" />
        <div className="skeleton-divider" />
        <div className="skeleton-line short" />
      </div>
    </div>
  );
};

export default SkeletonCard;
