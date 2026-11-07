import { toAbsoluteUploadUrl } from '../config/api';
import { createSlug } from '../config/slug';

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

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop';

export const getBikeImage = (bike) => {
  if (bike?.images && bike.images.length > 0) {
    return toAbsoluteUploadUrl(bike.images[0]);
  }
  return FALLBACK_IMAGE;
};

export const bikePath = (bike) => `/bike/${createSlug(bike)}-${bike._id}`;

export const bikeAlt = (bike) =>
  `Pre-owned ${bike.brand} ${bike.model} ${bike.year} motorcycle for sale - Katingin Bikes`;
