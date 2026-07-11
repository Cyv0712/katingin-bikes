import { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Badge, Collapse } from 'react-bootstrap';
import { Route, Calendar, Filter, Info, Search, X, ChevronDown } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import SkeletonCard from '../components/SkeletonCard';
import { apiUrl, toAbsoluteUploadUrl } from '../config/api';
import Reveal from '../components/Reveal';
import { Helmet } from 'react-helmet-async';
import { createSlug } from '../config/slug';

// --- Helper ---
const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  return parseFloat(String(priceStr).replace(/[^0-9.]/g, '')) || 0;
};

const withUnit = (value, suffix) => {
  if (!value) return '—';
  const str = String(value).trim();
  if (str.toLowerCase().endsWith(suffix.toLowerCase())) return str;
  return `${str} ${suffix}`;
};

const withPeso = (value) => {
  if (!value) return '—';
  const str = String(value).trim();
  return str.startsWith('₱') ? str : `₱${str}`;
};

const getImageUrl = (bike) => {
  if (bike.images && bike.images.length > 0) {
    return toAbsoluteUploadUrl(bike.images[0]);
  }
  return 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop';
};

const Inventory = () => {
  const [bikesData, setBikesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || 'All',
    type: searchParams.get('type') || 'All',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || ''
  }), [searchParams]);

  useEffect(() => {
    const MIN_SKELETON_MS = 900;
    const startedAt = Date.now();

    const fetchBikes = async () => {
      try {
        const res = await fetch(apiUrl('/api/bikes'));
        const data = await res.json();
        
        // Handle cases where the backend returns an error object instead of an array
        if (Array.isArray(data)) {
          const availableOnly = data.filter(b => b.status === 'Available' || !b.status);
          setBikesData(availableOnly);
        } else {
          console.error('API Error: Expected array but received:', data);
          setBikesData([]);
        }
      } catch (err) {
        console.error('Fetch Error:', err);
        setBikesData([]);
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_SKELETON_MS - elapsed);
        setTimeout(() => setLoading(false), remaining);
      }
    };

    fetchBikes();
  }, []);

  const brands = useMemo(
    () => ['All', ...new Set(bikesData.map((b) => b.brand).filter(Boolean))].sort(),
    [bikesData]
  );
  const types = useMemo(
    () => ['All', ...new Set(bikesData.map((b) => b.type).filter(Boolean))].sort(),
    [bikesData]
  );

  const filteredBikes = useMemo(() => {
    const searchTerm = filters.search.toLowerCase().trim();
    const searchWords = searchTerm.split(/\s+/).filter(Boolean);
    const priceMin = filters.priceMin !== '' ? parseFloat(filters.priceMin) : null;
    const priceMax = filters.priceMax !== '' ? parseFloat(filters.priceMax) : null;

    return bikesData.filter((bike) => {
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

  const activeChips = useMemo(() => [
    filters.search && { key: 'search', label: `"${filters.search}"` },
    filters.brand !== 'All' && { key: 'brand', label: filters.brand },
    filters.type !== 'All' && { key: 'type', label: filters.type },
    filters.priceMin && { key: 'priceMin', label: `Min ₱${Number(filters.priceMin).toLocaleString()}` },
    filters.priceMax && { key: 'priceMax', label: `Max ₱${Number(filters.priceMax).toLocaleString()}` },
  ].filter(Boolean), [filters]);

  const filterFields = (
    <>
      {/* Search */}
      <div className="mb-4">
        <label className="text-secondary fw-bold d-block mb-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>SEARCH</label>
        <div className="position-relative">
          <Search size={14} className="text-muted position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-control moto-input moto-input-with-icon w-100"
            placeholder="Brand, model..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />
          {filters.search && (
            <X size={14} className="text-secondary position-absolute" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} onClick={() => setFilter('search', '')} />
          )}
        </div>
      </div>

      {/* Brand */}
      <div className="mb-4">
        <label className="text-secondary fw-bold d-block mb-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>BRAND</label>
        <select className="form-select moto-input" value={filters.brand} onChange={(e) => setFilter('brand', e.target.value)}>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Type */}
      <div className="mb-4">
        <label className="text-secondary fw-bold d-block mb-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>TYPE</label>
        <select className="form-select moto-input" value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <label className="text-secondary fw-bold d-block mb-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
          PRICE RANGE (₱)
        </label>
        <div className="d-flex gap-2">
          <input
            type="number"
            className="form-control moto-input"
            placeholder="MIN"
            value={filters.priceMin}
            onChange={(e) => setFilter('priceMin', e.target.value)}
          />
          <input
            type="number"
            className="form-control moto-input"
            placeholder="MAX"
            value={filters.priceMax}
            onChange={(e) => setFilter('priceMax', e.target.value)}
          />
        </div>
      </div>

      <button
        className="moto-btn moto-btn-outline w-100 mt-2"
        onClick={clearAllFilters}
        style={{ fontSize: '0.8rem', padding: '10px' }}
      >
        RESET FILTERS
      </button>
    </>
  );

  return (
    <div className="inventory-page py-5" style={{ minHeight: '100vh' }}>
      <Helmet>
        <title>Pre-Owned Bigbikes Philippines | Full Inventory | Katingin Bikes</title>
        <meta name="description" content="Browse our wide collection of fresh, pre-owned adventure, naked, sport, and touring bigbikes in the Philippines. Verified quality, complete papers, and Metro Manila delivery." />
        <meta property="og:title" content="Pre-Owned Bigbikes Philippines | Full Inventory | Katingin Bikes" />
        <meta property="og:description" content="Browse our wide collection of quality, pre-owned bigbikes and premium motorcycles in Metro Manila, Philippines." />
        <meta property="og:image" content="https://katinginbikes.com/static_data/Katingin_logo.png" />
        <meta property="og:url" content="https://katinginbikes.com/inventory" />
      </Helmet>
      <Container fluid className="inventory-container" style={{ paddingTop: '80px' }}>
        {/* Page Header */}
        <Reveal>
          <div className="inventory-page-header mb-5 text-center">
            <span className="text-accent mb-2 d-block" style={{ fontSize: '0.85rem', letterSpacing: '4px', fontWeight: 600 }}>OUR COLLECTION</span>
            <h1 className="moto-heading mb-0" style={{ fontSize: '3rem' }}>PRE-OWNED BIGBIKES</h1>
          </div>
        </Reveal>

        {/* Disclaimer */}
        <Reveal delay={1}>
          <div className="inventory-disclaimer mb-5 p-4" style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', border: '1px solid var(--accent-primary)', borderRadius: '8px' }}>
            <div className="d-flex align-items-center">
              <Info className="text-accent fs-4 me-3 flex-shrink-0" />
              <div className="text-secondary" style={{ fontSize: '0.95rem' }}>
                <strong className="text-primary">NOTE:</strong> All stocks and prices are subject to change without prior notice. Contact us via Facebook or Viber to verify availability and actual unit condition.
              </div>
            </div>
          </div>
        </Reveal>

        <Row className="g-3 g-xl-4">
          {/* ── Sidebar Filters ── */}
          <Col lg={3} xl={2} className="mb-4">
              <div className="moto-card inventory-filters p-4 sticky-lg-top-100">
                {/* Mobile: collapsible toggle */}
                <button
                  type="button"
                  className="inventory-filters-toggle moto-btn moto-btn-outline w-100 d-lg-none d-flex align-items-center justify-content-between"
                  onClick={() => setFiltersOpen((open) => !open)}
                  aria-expanded={filtersOpen}
                  style={{ fontSize: '0.85rem', padding: '10px 14px' }}
                >
                  <span className="d-flex align-items-center gap-2">
                    <Filter size={16} className="text-accent" />
                    FILTERS
                    {activeChips.length > 0 && (
                      <span className="badge bg-primary text-white" style={{ fontSize: '0.7rem' }}>
                        {activeChips.length}
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      transition: 'transform 0.2s ease',
                      transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {/* Desktop: always-visible heading */}
                <h5 className="mb-4 d-none d-lg-flex align-items-center gap-2 moto-heading" style={{ fontSize: '1rem' }}>
                  <Filter size={18} className="text-accent" /> FILTERS
                </h5>

                {/* Mobile: collapsible fields (default closed) */}
                <div className="d-lg-none">
                  <Collapse in={filtersOpen}>
                    <div className="inventory-filters-body pt-3">
                      {filterFields}
                    </div>
                  </Collapse>
                </div>

                {/* Desktop: always-visible fields */}
                <div className="d-none d-lg-block">
                  {filterFields}
                </div>
              </div>
          </Col>

          {/* ── Bike Grid ── */}
          <Col lg={9} xl={10}>
            {/* Results count + active chips */}
            {!loading && (
              <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
                <span className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  RESULTS: <strong className="text-accent">{filteredBikes.length}</strong> / {bikesData.length}
                </span>
                {activeChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="badge border border-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
                    onClick={() => setFilter(chip.key, chip.key === 'brand' || chip.key === 'type' ? 'All' : '')}
                  >
                    {chip.label} <X size={12} className="ms-1" />
                  </span>
                ))}
                {activeChips.length > 1 && (
                  <span
                    className="text-accent ms-2"
                    style={{ fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={clearAllFilters}
                  >
                    CLEAR ALL
                  </span>
                )}
              </div>
            )}

            <Row className="g-2 g-md-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Col xs={6} xl={3} key={i}>
                    <SkeletonCard />
                  </Col>
                ))
              ) : filteredBikes.length > 0 ? (
                filteredBikes.map((bike) => (
                  <Col xs={6} xl={3} key={bike._id}>
                    <Reveal className="h-100">
                      <div className="moto-card inventory-card d-flex flex-column h-100">
                        <div className="bike-img-wrapper inventory-card-img">
                          <img src={getImageUrl(bike)} alt={`Pre-owned ${bike.brand} ${bike.model} ${bike.year} motorcycle for sale - Katingin Bikes`} className="bike-img w-100 h-100" />
                          {bike.isReserved && (
                            <Badge
                              className="position-absolute top-0 start-0 m-2 bg-primary text-white"
                              style={{ fontSize: '0.75rem', fontWeight: 700, zIndex: 1 }}
                            >
                              RESERVED
                            </Badge>
                          )}
                        </div>
                        <div className="inventory-card-body p-4 d-flex flex-column flex-grow-1">
                          <span className="inventory-card-type text-secondary mb-1 d-block font-weight-bold" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>{bike.type?.toUpperCase()}</span>
                          <h4 className="inventory-card-title moto-heading mb-3" style={{ fontSize: '1.25rem' }}>
                            <span className="text-accent">{bike.brand}</span> {bike.model}
                          </h4>

                          <div className="inventory-card-meta d-flex gap-3 mb-4">
                            <div className="d-flex align-items-center gap-1 text-secondary" style={{ fontSize: '0.9rem' }}>
                              <Calendar size={14} className="text-accent flex-shrink-0" />
                              <span>{bike.year}</span>
                            </div>
                            <div className="inventory-card-mileage d-flex align-items-center gap-1 text-secondary min-w-0" style={{ fontSize: '0.9rem' }}>
                              <Route size={14} className="text-accent flex-shrink-0" />
                              <span className="text-truncate">{withUnit(bike.mileage, 'km')}</span>
                            </div>
                          </div>

                          <div className="inventory-card-footer d-flex justify-content-between align-items-center mt-auto pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                            <span className="inventory-card-price text-accent fw-bold text-truncate me-2" style={{ fontSize: '1.3rem' }}>{withPeso(bike.price)}</span>
                            <Link
                              to={`/bike/${createSlug(bike)}-${bike._id}`}
                              className="moto-btn inventory-card-btn flex-shrink-0"
                              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                            >
                              DETAILS
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  </Col>
                ))
              ) : (
                <Col>
                  <div className="text-center p-5 text-secondary moto-card border-0">
                    <Search size={48} className="text-muted mb-4 opacity-50" />
                    <h5 className="moto-heading">NO RESULTS FOUND</h5>
                    <p style={{ fontSize: '0.9rem' }}>Adjust your filters or <span className="text-accent" style={{ cursor: 'pointer' }} onClick={clearAllFilters}>reset all filters</span>.</p>
                  </div>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Inventory;
