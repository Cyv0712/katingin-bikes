import { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Alert, Badge } from 'react-bootstrap';
import { Tag, Route, Calendar, Filter, Info, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import SkeletonCard from '../components/SkeletonCard';
import { apiUrl, toAbsoluteUploadUrl } from '../config/api';

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

const INITIAL_FILTERS = { search: '', brand: 'All', type: 'All', priceMin: '', priceMax: '' };

const Inventory = () => {
  const [bikesData, setBikesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

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
    const searchTerm = filters.search.toLowerCase();
    const priceMin = filters.priceMin !== '' ? parseFloat(filters.priceMin) : null;
    const priceMax = filters.priceMax !== '' ? parseFloat(filters.priceMax) : null;

    return bikesData.filter((bike) => {
      const matchesSearch =
        !searchTerm ||
        bike.brand?.toLowerCase().includes(searchTerm) ||
        bike.model?.toLowerCase().includes(searchTerm) ||
        bike.type?.toLowerCase().includes(searchTerm);
      const matchesBrand = filters.brand === 'All' || bike.brand === filters.brand;
      const matchesType = filters.type === 'All' || bike.type === filters.type;
      const bikePrice = parsePrice(bike.price);
      const matchesPriceMin = priceMin === null || bikePrice >= priceMin;
      const matchesPriceMax = priceMax === null || bikePrice <= priceMax;
      return matchesSearch && matchesBrand && matchesType && matchesPriceMin && matchesPriceMax;
    });
  }, [bikesData, filters]);

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const clearAllFilters = () => setFilters(INITIAL_FILTERS);

  const activeChips = useMemo(() => [
    filters.search && { key: 'search', label: `"${filters.search}"` },
    filters.brand !== 'All' && { key: 'brand', label: filters.brand },
    filters.type !== 'All' && { key: 'type', label: filters.type },
    filters.priceMin && { key: 'priceMin', label: `Min ₱${Number(filters.priceMin).toLocaleString()}` },
    filters.priceMax && { key: 'priceMax', label: `Max ₱${Number(filters.priceMax).toLocaleString()}` },
  ].filter(Boolean), [filters]);

  return (
    <div className="py-5" style={{ minHeight: '100vh' }}>
      <Container style={{ paddingTop: '80px' }}>
        {/* Page Header */}
        <div className="mb-5 text-center">
          <span className="text-accent mb-2 d-block" style={{ fontSize: '0.85rem', letterSpacing: '4px', fontWeight: 600 }}>OUR COLLECTION</span>
          <h1 className="moto-heading mb-0" style={{ fontSize: '3rem' }}>FULL INVENTORY</h1>
        </div>

        {/* Disclaimer */}
        <div className="mb-5 p-4" style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', border: '1px solid var(--accent-primary)', borderRadius: '8px' }}>
          <div className="d-flex align-items-center">
            <Info className="text-accent fs-4 me-3 flex-shrink-0" />
            <div className="text-secondary" style={{ fontSize: '0.95rem' }}>
              <strong className="text-primary">NOTE:</strong> All stocks and prices are subject to change without prior notice. Contact us via Facebook or WhatsApp to verify availability and actual unit condition.
            </div>
          </div>
        </div>

        <Row>
          {/* ── Sidebar Filters ── */}
          <Col lg={3} className="mb-4">
            <div className="moto-card p-4 position-sticky" style={{ top: '100px' }}>
              <h5 className="mb-4 d-flex align-items-center gap-2 moto-heading" style={{ fontSize: '1rem' }}>
                <Filter size={18} className="text-accent" /> FILTERS
              </h5>

              {/* Search */}
              <div className="mb-4">
                <label className="text-secondary fw-bold d-block mb-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>SEARCH</label>
                <div className="position-relative">
                  <Search size={14} className="text-muted position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="form-control moto-input w-100"
                    placeholder="Brand, model..."
                    value={filters.search}
                    onChange={(e) => setFilter('search', e.target.value)}
                    style={{ paddingLeft: '32px' }}
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
            </div>
          </Col>

          {/* ── Bike Grid ── */}
          <Col lg={9}>
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

            <Row className="g-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Col xl={4} md={6} key={i}>
                    <SkeletonCard />
                  </Col>
                ))
              ) : filteredBikes.length > 0 ? (
                filteredBikes.map((bike) => (
                  <Col xl={4} md={6} key={bike._id}>
                    <div className="moto-card d-flex flex-column h-100">
                      <div className="bike-img-wrapper" style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
                        <img src={getImageUrl(bike)} alt={bike.model} className="bike-img w-100 h-100" style={{ objectFit: 'cover' }} />
                      <div className="p-4 d-flex flex-column flex-grow-1">
                        <span className="text-secondary mb-1 d-block font-weight-bold" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>{bike.type?.toUpperCase()}</span>
                        <h4 className="moto-heading mb-3" style={{ fontSize: '1.25rem' }}>
                          <span className="text-accent">{bike.brand}</span> {bike.model} <small className="text-secondary" style={{ fontSize: '0.85rem' }}>{bike.engineSize}</small>
                        </h4>

                        <div className="d-flex gap-3 mb-4">
                          <div className="d-flex align-items-center gap-1 text-secondary" style={{ fontSize: '0.9rem' }}>
                            <Calendar size={14} className="text-accent" />
                            <span>{bike.year}</span>
                          </div>
                          <div className="d-flex align-items-center gap-1 text-secondary" style={{ fontSize: '0.9rem' }}>
                            <Route size={14} className="text-accent" />
                            <span>{withUnit(bike.mileage, 'km')}</span>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-auto pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                          <span className="text-accent fw-bold" style={{ fontSize: '1.3rem' }}>{withPeso(bike.price)}</span>
                          <Link
                            to={`/bike/${bike._id}`}
                            className="moto-btn"
                            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                          >
                            DETAILS
                          </Link>
                        </div>
                      </div>
                    </div>
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
