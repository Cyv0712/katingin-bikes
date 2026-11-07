import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const digitsOnly = (value) => value.replace(/\D/g, '');

/**
 * The Inventory filter panel: Search, Brand, Type, Minimum price, Maximum
 * price and Reset. On phone it collapses to Search plus a Filters button that
 * opens the rest.
 *
 * Controlled: `filters` is { search, brand, type, priceMin, priceMax } and
 * `onChange(key, value)` reports edits. Brand/type use 'All' for "no filter".
 */
const BikeFilters = ({ filters, brands, types, onChange, onReset, activeCount = 0 }) => {
  const [open, setOpen] = useState(false);

  const priceField = (key, label, placeholder) => (
    <div className="kb-field kb-filters-more">
      <label htmlFor={`bf-${key}`}>{label}</label>
      <input
        id={`bf-${key}`}
        type="text"
        inputMode="numeric"
        className="moto-input"
        placeholder={placeholder}
        value={filters[key]}
        onChange={(e) => onChange(key, digitsOnly(e.target.value))}
      />
    </div>
  );

  return (
    <div
      className={`kb-filters kb-filters-inventory moto-card ${open ? 'is-open' : ''}`}
      role="search"
      aria-label="Filter bikes"
    >
      <div className="kb-search-row">
        <div className="kb-field">
          <label htmlFor="bf-search">Search</label>
          <div className="kb-search-wrap">
            <Search className="kb-input-icon" size={18} strokeWidth={1.75} aria-hidden="true" />
            <input
              id="bf-search"
              type="text"
              className="moto-input moto-input-with-icon"
              placeholder="Brand or model"
              value={filters.search}
              onChange={(e) => onChange('search', e.target.value)}
            />
            {filters.search && (
              <button
                type="button"
                className="kb-filters-clear"
                aria-label="Clear search"
                onClick={() => onChange('search', '')}
              >
                <X size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          className="moto-btn moto-btn-outline kb-filters-toggle"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <SlidersHorizontal size={18} strokeWidth={1.75} aria-hidden="true" />
          Filters
          {activeCount > 0 && <span className="kb-tag" aria-label={`${activeCount} active`}>{activeCount}</span>}
        </button>
      </div>

      <div className="kb-field kb-filters-more">
        <label htmlFor="bf-brand">Brand</label>
        <select
          id="bf-brand"
          className="form-select moto-input"
          value={filters.brand}
          onChange={(e) => onChange('brand', e.target.value)}
        >
          <option value="All">All brands</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="kb-field kb-filters-more">
        <label htmlFor="bf-type">Type</label>
        <select
          id="bf-type"
          className="form-select moto-input"
          value={filters.type}
          onChange={(e) => onChange('type', e.target.value)}
        >
          <option value="All">All types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {priceField('priceMin', 'Minimum price', '₱0')}
      {priceField('priceMax', 'Maximum price', '₱2,000,000')}

      <button type="button" className="moto-btn moto-btn-outline kb-filters-reset" onClick={onReset}>
        Reset filters
      </button>
    </div>
  );
};

export default BikeFilters;
