import { useState, useEffect, useMemo, useRef } from 'react';
import { Info, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SkeletonCard from '../components/SkeletonCard';
import BikeCard from '../components/BikeCard';
import BikeFilters from '../components/BikeFilters';
import useBikes from '../hooks/useBikes';
import { createSlug } from '../config/slug';
import { parsePrice, getBikeImage } from '../utils/format';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest listed' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'year-desc', label: 'Year, newest first' },
  { value: 'year-asc', label: 'Year, oldest first' },
  { value: 'mileage-asc', label: 'Mileage, low to high' },
];

// Bikes added per batch as the visitor scrolls. 12 divides evenly into the
// 2, 3 and 4 column grids, so the last row is never ragged.
const PAGE_SIZE = 12;
// The next batch is added while its sentinel is still this far below the
// viewport, so new cards are already in place long before they scroll into view.
const LOAD_AHEAD = '0px 0px 1800px 0px';
const MIN_SKELETON_MS = 900;
// Without IntersectionObserver there is no way to know when to load more,
// so show everything at once rather than strand the visitor.
const CAN_OBSERVE = typeof IntersectionObserver !== 'undefined';

const Inventory = () => {
  const { bikes: bikesData, loading: fetching } = useBikes();
  const [searchParams, setSearchParams] = useSearchParams();

  // Keep the skeleton up briefly on a cold load so the grid doesn't flash.
  // If the inventory is already cached, skip the wait.
  const [minElapsed, setMinElapsed] = useState(!fetching);
  useEffect(() => {
    if (minElapsed) return undefined;
    const timer = setTimeout(() => setMinElapsed(true), MIN_SKELETON_MS);
    return () => clearTimeout(timer);
  }, [minElapsed]);
  const loading = fetching || !minElapsed;

  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || 'All',
    type: searchParams.get('type') || 'All',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    sort: searchParams.get('sort') || 'newest'
  }), [searchParams]);

  const brands = useMemo(
    () => [...new Set(bikesData.map((b) => b.brand).filter(Boolean))].sort(),
    [bikesData]
  );
  const types = useMemo(
    () => [...new Set(bikesData.map((b) => b.type).filter(Boolean))].sort(),
    [bikesData]
  );

  const filteredBikes = useMemo(() => {
    const searchTerm = filters.search.toLowerCase().trim();
    const searchWords = searchTerm.split(/\s+/).filter(Boolean);
    const priceMin = filters.priceMin !== '' ? parseFloat(filters.priceMin) : null;
    const priceMax = filters.priceMax !== '' ? parseFloat(filters.priceMax) : null;

    const matched = bikesData.filter((bike) => {
      const matchesSearch =
        searchWords.length === 0 ||
        searchWords.every((word) =>
          bike.brand?.toLowerCase().includes(word) ||
          bike.model?.toLowerCase().includes(word) ||
          bike.type?.toLowerCase().includes(word)
        );
      const matchesBrand = filters.brand === 'All' || bike.brand === filters.brand;
      const matchesType = filters.type === 'All' || bike.type === filters.type;
      const bikePrice = parsePrice(bike.price);
      const matchesPriceMin = priceMin === null || bikePrice >= priceMin;
      const matchesPriceMax = priceMax === null || bikePrice <= priceMax;
      return matchesSearch && matchesBrand && matchesType && matchesPriceMin && matchesPriceMax;
    });

    switch (filters.sort) {
      case 'price-asc':
        return matched.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
      case 'price-desc':
        return matched.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
      case 'year-asc':
        return matched.sort((a, b) => Number(a.year) - Number(b.year));
      case 'year-desc':
        return matched.sort((a, b) => Number(b.year) - Number(a.year));
      case 'mileage-asc':
        return matched.sort((a, b) => parsePrice(a.mileage) - parsePrice(b.mileage));
      default:
        // "Newest listed": sort by the backend's createdAt timestamp (set on
        // upload) rather than relying on fetch order.
        return matched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [bikesData, filters]);

  const setFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === 'All' || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    }, { replace: true });
  };
  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };
  const setSort = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === 'newest') {
        next.delete('sort');
      } else {
        next.set('sort', value);
      }
      return next;
    }, { replace: true });
  };

  const activeChips = useMemo(() => [
    filters.search && { key: 'search', label: `"${filters.search}"` },
    filters.brand !== 'All' && { key: 'brand', label: filters.brand },
    filters.type !== 'All' && { key: 'type', label: filters.type },
    filters.priceMin && { key: 'priceMin', label: `Min ₱${Number(filters.priceMin).toLocaleString()}` },
    filters.priceMax && { key: 'priceMax', label: `Max ₱${Number(filters.priceMax).toLocaleString()}` },
  ].filter(Boolean), [filters]);

  // Infinite scroll: the visible count belongs to one set of filters, so any
  // change to the filters or sort (the URL) starts again from the first batch.
  const querySignature = searchParams.toString();
  const [visible, setVisible] = useState({ signature: querySignature, count: PAGE_SIZE });
  const visibleCount = !CAN_OBSERVE
    ? Infinity
    : visible.signature === querySignature ? visible.count : PAGE_SIZE;

  const shownBikes = filteredBikes.slice(0, visibleCount);
  const hasMore = shownBikes.length < filteredBikes.length;
  const resultsLabel = `${filteredBikes.length} ${filteredBikes.length === 1 ? 'bike' : 'bikes'}`;

  // A sentinel under the grid asks for the next batch while it is still
  // 1800px below the viewport. The observer is recreated after every batch, so
  // if the sentinel is still inside that margin (tall screen, short batch) it
  // reports straight away and keeps going until the grid is far enough ahead.
  const sentinelRef = useRef(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (loading || !hasMore || !node) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible({ signature: querySignature, count: visibleCount + PAGE_SIZE });
      }
    }, { rootMargin: LOAD_AHEAD });
    observer.observe(node);
    return () => observer.disconnect();
  }, [loading, hasMore, querySignature, visibleCount]);

  // Warm the browser cache with the photos of the batch after the visible one,
  // so when its cards are added their images are already there.
  useEffect(() => {
    filteredBikes.slice(visibleCount, visibleCount + PAGE_SIZE).forEach((bike) => {
      const img = new Image();
      img.src = getBikeImage(bike);
    });
  }, [filteredBikes, visibleCount]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Pre-Owned Motorcycles for Sale in the Philippines",
    "description": "Available pre-owned big bikes and motorcycles in Metro Manila, Philippines.",
    "itemListElement": filteredBikes.slice(0, 30).map((bike, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": `${bike.brand} ${bike.model} (${bike.year})`,
      "url": `https://katinginbikes.com/bike/${createSlug(bike)}-${bike._id}`
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://katinginbikes.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Motorcycles Philippines Inventory",
        "item": "https://katinginbikes.com/inventory"
      }
    ]
  };

  return (
    <div className="inventory-page">
      <Helmet>
        <title>Pre-Owned Motorcycles for Sale in the Philippines | Katingin Bikes</title>
        <meta name="description" content="Browse fresh pre-owned motorcycles and big bikes for sale in the Philippines. Filter by brand (BMW, Ducati, Kawasaki, Yamaha, Honda), price, engine CC, and flexible installment terms." />
        <meta name="keywords" content="Motorcycles Philippines, Pre-Owned Motorcycles for Sale PH, Second Hand Big Bikes Metro Manila, Used Motorcycles Philippines" />
        <link rel="canonical" href="https://katinginbikes.com/inventory" />
        <meta property="og:title" content="Pre-Owned Motorcycles for Sale in the Philippines | Katingin Bikes" />
        <meta property="og:description" content="Browse our collection of fresh pre-owned big bikes and motorcycles for sale in the Philippines. 100-point inspection and complete OR/CR papers." />
        <meta property="og:image" content="https://katinginbikes.com/static_data/Katingin_logo.png" />
        <meta property="og:url" content="https://katinginbikes.com/inventory" />
        <script type="application/ld+json">
          {JSON.stringify(itemListSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <div className="kb-wide">
        <header className="kb-page-head d-flex flex-column align-items-start gap-3">
          <h1 className="kb-display-lg kb-page-title">Inventory</h1>
          {!loading && bikesData.length > 0 && (
            <p className="m-0 d-md-none" style={{ color: 'var(--ink-muted)' }}>
              {bikesData.length} pre-owned motorcycles and big bikes, each with complete papers.
            </p>
          )}
          <div className="kb-notice w-100 mt-2">
            <Info size={20} strokeWidth={1.75} aria-hidden="true" />
            <span>Stocks and prices can change without notice. Contact us on Facebook or Viber to confirm availability and the unit&apos;s condition.</span>
          </div>
        </header>

        <BikeFilters
          filters={filters}
          brands={brands}
          types={types}
          onChange={setFilter}
          onReset={clearAllFilters}
          activeCount={activeChips.length}
        />

        <section aria-label="Results" className="mt-4">
          {!loading && (
            <>
              <div className="kb-results-bar">
                <span style={{ color: 'var(--ink-muted)' }} aria-live="polite">{resultsLabel}</span>
                <div className="kb-sort">
                  <label htmlFor="inventory-sort" className="kb-label kb-sort-label">Sort by</label>
                  <select
                    id="inventory-sort"
                    className="form-select moto-input"
                    value={filters.sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>

              {activeChips.length > 0 && (
                <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
                  {activeChips.map((chip) => (
                    <button
                      type="button"
                      key={chip.key}
                      className="kb-tag kb-tag-lg"
                      aria-label={`Remove filter ${chip.label}`}
                      onClick={() => setFilter(chip.key, chip.key === 'brand' || chip.key === 'type' ? 'All' : '')}
                    >
                      {chip.label}
                      <X size={14} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                  ))}
                  {activeChips.length > 1 && (
                    <button type="button" className="kb-link border-0 bg-transparent p-0 ms-2" onClick={clearAllFilters}>
                      Reset filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {loading ? (
            <div className="kb-grid" aria-busy="true" aria-label="Loading bikes">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredBikes.length > 0 ? (
            <>
              <div className="kb-grid">
                {shownBikes.map((bike) => <BikeCard key={bike._id} bike={bike} />)}
              </div>
              {hasMore && <div ref={sentinelRef} aria-hidden="true" style={{ height: '1px' }} />}
            </>
          ) : (
            <div className="moto-card kb-empty">
              <Search size={40} strokeWidth={1.75} className="mb-3" style={{ color: 'var(--ink-subtle)' }} aria-hidden="true" />
              <h2 className="kb-h3 mb-2">No matching bikes</h2>
              <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>Try adjusting your search or price range.</p>
              <button type="button" onClick={clearAllFilters} className="moto-btn">
                Reset all filters
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Inventory;
