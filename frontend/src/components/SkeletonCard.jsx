/**
 * SkeletonCard — High-tech wireframe shimmer placeholder.
 * Rendered in a grid while Inventory page fetches data from the API.
 */
const SkeletonCard = () => {
  return (
    <div className="skeleton-card glass-panel">
      <div className="skeleton-img" />
      <div className="skeleton-body">
        <div className="d-flex justify-content-between mb-2">
          <div className="skeleton-line short" style={{ height: '10px' }} />
          <div className="skeleton-line short" style={{ width: '25%', height: '10px' }} />
        </div>
        <div className="skeleton-line" style={{ height: '22px' }} />
        <div className="d-flex gap-2 my-3">
          <div className="skeleton-line medium" style={{ height: '18px' }} />
          <div className="skeleton-line short" style={{ height: '18px' }} />
        </div>
        <div className="skeleton-divider" />
        <div className="d-flex justify-content-between align-items-center pt-1">
          <div className="skeleton-line short" style={{ height: '20px', width: '40%' }} />
          <div className="skeleton-line short" style={{ height: '32px', width: '35%' }} />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
