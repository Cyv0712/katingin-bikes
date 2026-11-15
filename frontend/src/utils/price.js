// Pure formatting helpers (no browser or Vite globals) so the build-time
// prerender script can use them too. format.js re-exports these.

// Prices and mileage are stored as free-text strings ("₱385,000", "4,928 km")
export const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  return parseFloat(String(priceStr).replace(/[^0-9.]/g, '')) || 0;
};

export const withUnit = (value, suffix) => {
  if (!value) return '—';
  const str = String(value).trim();
  if (str.toLowerCase().endsWith(suffix.toLowerCase())) return str;
  return `${str} ${suffix}`;
};

export const withPeso = (value) => {
  if (!value) return '—';
  const str = String(value).trim();
  return str.startsWith('₱') ? str : `₱${str}`;
};
