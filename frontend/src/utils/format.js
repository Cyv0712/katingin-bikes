import { toAbsoluteUploadUrl } from '../config/api';
import { bikePath } from '../config/slug';
import { parsePrice, withUnit, withPeso } from './price';

export { parsePrice, withUnit, withPeso };

// Shown for a bike with no photo (hosted by us, not a third party)
const FALLBACK_IMAGE = '/static_data/placeholder-bike.webp';

export const getBikeImage = (bike) => {
  if (bike?.images && bike.images.length > 0) {
    return toAbsoluteUploadUrl(bike.images[0]);
  }
  return FALLBACK_IMAGE;
};

/**
 * src / srcSet / sizes for one photo. The API serves uploaded photos at smaller
 * widths via ?w= (see backend/utils/imageVariants.js), so cards and thumbnails
 * don't download the full 1200px original. Anything else (legacy Cloudinary
 * URLs, local assets) is used as it is.
 *
 * `sizes` says how wide the image is drawn; the browser picks from the set.
 * Widths must be ones the API accepts: 240, 480, 800.
 */
export const imageProps = (path, sizes, { widths = [480, 800], original = true } = {}) => {
  const src = toAbsoluteUploadUrl(path);
  if (!path || !path.startsWith('/uploads')) return { src };
  const set = widths.map((w) => `${src}?w=${w} ${w}w`);
  if (original) set.push(`${src} 1200w`);
  return { src, srcSet: set.join(', '), sizes };
};

/** Start loading what an <img> with these props would pick, so it is cached when it renders. */
export const preloadImage = ({ src, srcSet, sizes }) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = resolve; // a failed image must never block the caller
    // sizes and srcset first: set after src they would not influence the choice
    if (srcSet) {
      img.sizes = sizes;
      img.srcset = srcSet;
    }
    img.src = src;
    if (img.complete) resolve();
  });

/** imageProps for a bike's first photo, or the placeholder. */
export const bikeImageProps = (bike, sizes) =>
  bike?.images?.length > 0 ? imageProps(bike.images[0], sizes) : { src: FALLBACK_IMAGE };

// How wide the bike card photo is drawn: 2 columns on phones, 3 on tablets, 4 on desktop
export const CARD_SIZES = '(max-width: 767.98px) 50vw, (max-width: 1199.98px) 33vw, 25vw';
// The four hero tiles on Home (not shown below 768px): two across the page up to 991px, then a column beside the headline
export const HERO_TILE_SIZES = '(max-width: 991.98px) 45vw, 20vw';

export { bikePath };

export const bikeAlt = (bike) =>
  `Pre-owned ${bike.brand} ${bike.model} ${bike.year} motorcycle for sale - Katingin Bikes`;
