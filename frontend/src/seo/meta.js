// Single source of truth for page metadata (title, description, canonical,
// Open Graph, JSON-LD). The pages render it through <Seo> (Seo.jsx) and the
// build-time prerender script (scripts/prerender.js) writes the same data into
// static HTML, so crawlers and link scrapers that don't run JS see what the
// browser would. Keep this file free of browser and Vite globals: Node imports
// it, so relative imports need explicit ".js" extensions.
import { bikePath } from '../config/slug.js';
import { contactInfo } from '../data/contactInfo.js';
import { parsePrice, withPeso } from '../utils/price.js';

export const SITE_URL = 'https://katinginbikes.com';
export const LOGO_URL = `${SITE_URL}/static_data/Katingin_logo.png`;

const abs = (path) => `${SITE_URL}${path}`;

const dealerSchema = () => ({
  "@context": "https://schema.org",
  "@type": "MotorcycleDealer",
  "name": "Katingin Bikes",
  "image": LOGO_URL,
  "url": SITE_URL,
  "telephone": contactInfo.phone,
  "priceRange": "₱150,000 - ₱1,500,000",
  "sameAs": [contactInfo.facebook, contactInfo.instagram].filter(Boolean),
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Metro Manila",
    "addressCountry": "PH"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "09:00",
    "closes": "18:00"
  }
});

export const homeMeta = () => ({
  title: 'Pre-Owned Big Bikes in Metro Manila | Katingin Bikes',
  description: "Looking for premium pre-owned motorcycles in the Philippines? Katingin Bikes is Metro Manila's trusted big bike dealer for 100-point inspected pre-owned motorcycles with complete papers and flexible financing.",
  keywords: 'Motorcycles Philippines, Pre-Owned Big Bikes Philippines, Second Hand Motorcycles Metro Manila, Used Big Bikes PH',
  canonical: abs('/'),
  ogDescription: 'Trusted dealer of premium pre-owned big bikes and motorcycles in the Philippines. Complete OR/CR papers, transparent deals, and financing options.',
  ogImage: LOGO_URL,
  jsonLd: [dealerSchema()],
});

export const inventoryMeta = (bikes = []) => ({
  title: 'Pre-Owned Motorcycles for Sale in the Philippines | Katingin Bikes',
  description: 'Browse fresh pre-owned motorcycles and big bikes for sale in the Philippines. Filter by brand (BMW, Ducati, Kawasaki, Yamaha, Honda), price, engine CC, and flexible installment terms.',
  keywords: 'Motorcycles Philippines, Pre-Owned Motorcycles for Sale PH, Second Hand Big Bikes Metro Manila, Used Motorcycles Philippines',
  canonical: abs('/inventory'),
  ogDescription: 'Browse our collection of fresh pre-owned big bikes and motorcycles for sale in the Philippines. 100-point inspection and complete OR/CR papers.',
  ogImage: LOGO_URL,
  jsonLd: [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Pre-Owned Motorcycles for Sale in the Philippines",
      "description": "Available pre-owned big bikes and motorcycles in Metro Manila, Philippines.",
      "itemListElement": bikes.slice(0, 30).map((bike, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": `${bike.brand} ${bike.model} (${bike.year})`,
        "url": abs(bikePath(bike))
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": abs('/') },
        { "@type": "ListItem", "position": 2, "name": "Motorcycles Philippines Inventory", "item": abs('/inventory') }
      ]
    },
  ],
});

export const financingMeta = () => ({
  title: 'Big Bike & Motorcycle Financing Philippines | Katingin Bikes',
  description: 'Apply for motorcycle financing and installment options in the Philippines. Easy pre-approval for pre-owned big bikes with low downpayment terms.',
  keywords: 'Motorcycle Financing Philippines, Big Bike Installment Philippines, Used Motorcycle Financing Metro Manila',
  canonical: abs('/financing'),
  ogDescription: 'Get pre-approved for pre-owned big bike financing in the Philippines. Flexible downpayment and monthly installment plans.',
  ogImage: LOGO_URL,
  jsonLd: [],
});

export const contactMeta = () => ({
  title: 'Contact Us | Katingin Bikes | Big Bikes Metro Manila',
  description: 'Get in touch with Katingin Bikes. Contact us via Viber, Messenger, or Email to verify pre-owned big bike availability and schedules in Metro Manila.',
  canonical: abs('/contact'),
  ogDescription: 'Get in touch directly via Viber, Facebook Messenger, or Email to ask about our premium pre-owned big bikes.',
  ogImage: LOGO_URL,
  jsonLd: [],
});

export const privacyMeta = () => ({
  title: 'Privacy Policy | Katingin Bikes',
  description: 'Privacy Policy for Katingin Bikes. Learn how we collect, use, and protect your data.',
  canonical: abs('/privacy-policy'),
  ogImage: LOGO_URL,
  jsonLd: [],
});

const flat = (text) => String(text || '').replace(/\s+/g, ' ').trim();

/**
 * @param bike  an Available or Reserved bike (sold bikes get no metadata)
 * @param imageUrl  maps a stored image path to an absolute URL. The browser
 *   and the build script reach the API at different addresses, so the caller
 *   supplies it.
 */
export const bikeMeta = (bike, imageUrl = (p) => p) => {
  const canonical = abs(bikePath(bike));
  const images = (Array.isArray(bike.images) && bike.images.length > 0 ? bike.images : bike.image ? [bike.image] : [])
    .map(imageUrl)
    .filter(Boolean)
    .map((src) => (/^https?:\/\//i.test(src) ? src : abs(src)));
  const name = `${bike.brand} ${bike.model} (${bike.year})`;

  return {
    title: `${name} | Katingin Bikes`,
    description: `Fresh pre-owned ${bike.brand} ${bike.model} (${bike.year}) for sale in Metro Manila, Philippines. Price: ${withPeso(bike.price)}, Engine: ${bike.engineSize || 'N/A'}. 100-point inspected with complete OR/CR papers.`,
    keywords: `${bike.brand} ${bike.model}, ${bike.brand} motorcycle Philippines, pre-owned ${bike.brand} ${bike.model}, used big bikes Philippines`,
    canonical,
    ogTitle: `${name} | Katingin Bikes`,
    ogDescription: `Pre-owned ${bike.brand} ${bike.model} (${bike.year}) for sale at Katingin Bikes Philippines. Price: ${withPeso(bike.price)}.`,
    ogImage: images[0] || LOGO_URL,
    ogType: 'product',
    jsonLd: [{
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": name,
      "image": images,
      "description": flat(bike.description) || `Fresh pre-owned ${bike.brand} ${bike.model} big bike for sale.`,
      "brand": { "@type": "Brand", "name": bike.brand },
      "sku": String(bike._id),
      "itemCondition": "https://schema.org/UsedCondition",
      "offers": {
        "@type": "Offer",
        "url": canonical,
        "priceCurrency": "PHP",
        "price": parsePrice(bike.price),
        "availability": bike.isReserved ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
        "itemCondition": "https://schema.org/UsedCondition",
        "seller": { "@type": "Organization", "name": "Katingin Bikes", "url": SITE_URL }
      }
    }],
  };
};

/**
 * @param bike  an entry of data/showcase.js
 * @param liveBike  the matching in-stock unit, if any. A showcase page has no
 *   price of its own, so an Offer is only emitted when there is a live unit.
 */
export const showcaseMeta = (bike, liveBike = null) => {
  const canonical = abs(`/showcase/${bike.slug}`);
  const first = bike.images && bike.images.length > 0 ? bike.images[0] : '';
  const image = first ? (first.startsWith('http') ? first : abs(first)) : LOGO_URL;
  const livePrice = liveBike ? parsePrice(liveBike.price) : 0;

  return {
    title: `${bike.brand} ${bike.model} | Katingin Bikes Showcase`,
    description: `Discover the ${bike.brand} ${bike.model} at Katingin Bikes Hall of Fame. ${bike.tagline || ''}. Specifications, features, and live availability.`,
    canonical,
    ogTitle: `${bike.brand} ${bike.model} - Showcase Details`,
    ogDescription: `Curated specs and hall of fame details for ${bike.brand} ${bike.model} at Katingin Bikes.`,
    ogImage: image,
    jsonLd: [{
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": `${bike.brand} ${bike.model}`,
      "image": image,
      "description": bike.description || `Hall of fame showcase page for the legendary ${bike.brand} ${bike.model} at Katingin Bikes.`,
      ...(livePrice > 0 && {
        "offers": {
          "@type": "Offer",
          "url": abs(bikePath(liveBike)),
          "priceCurrency": "PHP",
          "price": livePrice,
          "availability": liveBike.isReserved ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
          "itemCondition": "https://schema.org/UsedCondition"
        }
      })
    }],
  };
};

/** Fields every renderer falls back on, so a page only states what differs. */
export const withDefaults = (meta) => ({
  ogTitle: meta.title,
  ogDescription: meta.description,
  ogType: 'website',
  ...meta,
});
