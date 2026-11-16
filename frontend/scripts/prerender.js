/* global process */
// Runs after `vite build`. Writes a static HTML page for every public route
// into dist/ (own <title>, description, canonical, Open Graph, JSON-LD and a
// readable body), plus dist/sitemap.xml, so crawlers and link scrapers (Google,
// Facebook, Viber, Messenger) get real content without running JavaScript.
// React replaces the body when the app starts.
//
// Needs the API at build time: set VITE_API_URL. With SEO_STRICT=1 the build
// fails if the bike list can't be fetched (recommended in the deploy env, so a
// failed build keeps the previous deploy instead of shipping a site with no
// bike pages).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { showcaseBikes } from '../src/data/showcase.js';
import { contactInfo } from '../src/data/contactInfo.js';
import { bikePath } from '../src/config/slug.js';
import { withPeso, withUnit } from '../src/utils/price.js';
import { bikeSpecs, bikeFinancing } from '../src/utils/bikeFacts.js';
import { findShowcaseInventoryMatch } from '../src/utils/showcaseStockMatch.js';
import {
  pageUrl, homeMeta, inventoryMeta, financingMeta, contactMeta, privacyMeta, bikeMeta, showcaseMeta,
} from '../src/seo/meta.js';
import { esc, buildPage } from './lib/html.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const API_BASE_URL = (process.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const STRICT = process.env.SEO_STRICT === '1';

// ── Inventory ────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The API host can be cold (free-tier hosting sleeps), so retry with backoff
const fetchBikes = async () => {
  const attempts = 4;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bikes`, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('response was not an array');
      return data;
    } catch (error) {
      console.error(`[prerender] fetching bikes failed (attempt ${i}/${attempts}): ${error.message}`);
      if (i < attempts) await sleep(5000 * 2 ** (i - 1));
    }
  }
  return null;
};

// Same mapping as the browser's toAbsoluteUploadUrl (src/config/api.js)
const imageUrl = (p) => {
  if (!p) return p;
  if (/^https?:\/\//i.test(p)) return p;
  return p.startsWith('/uploads') ? `${API_BASE_URL}${p}` : p;
};

// ── Body markup ──────────────────────────────────────────────────────────────

const link = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`;
const dl = (rows) => `<dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
const bikeLine = (bike, extra = []) =>
  `<li>${[link(bikePath(bike), `${bike.brand} ${bike.model} (${bike.year})`), esc(withPeso(bike.price)), ...extra.filter(Boolean).map(esc)].join(' - ')}</li>`;
const lines = (text) => String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);

const homeBody = (bikes) => `
<main>
  <h1>Pre-owned big bikes in Metro Manila</h1>
  <p>Transparent inspection, complete OR/CR papers, and low downpayment financing.</p>
  <p>${link('/inventory', 'View inventory')} | ${link('/financing', 'Financing')} | ${link('/contact', 'Contact us')}</p>
  <h2>Available bikes</h2>
  <ul>${bikes.map((b) => bikeLine(b)).join('')}</ul>
  <h2>Popular models</h2>
  <ul>${showcaseBikes.map((m) => `<li>${link(`/showcase/${m.slug}`, `${m.brand} ${m.model}`)}</li>`).join('')}</ul>
</main>`;

const inventoryBody = (bikes) => `
<main>
  <h1>Inventory</h1>
  <p>Pre-owned big bikes and motorcycles for sale in Metro Manila, Philippines.</p>
  <ul>${bikes.map((b) => bikeLine(b, [b.mileage && withUnit(b.mileage, 'km'), b.engineSize && withUnit(b.engineSize, 'cc')])).join('')}</ul>
</main>`;

// No <img> tags on purpose: browsers start downloading them before the app loads (and
// then the app loads its own, smaller copies). Crawlers and link previews get the photos
// from og:image and the JSON-LD image list in the head instead.
const bikeBody = (bike) => {
  const { showCard, showDownpayment, monthlyTerms } = bikeFinancing(bike);
  const modelPage = showcaseBikes.find((s) => findShowcaseInventoryMatch(s, [bike]));
  const financing = showCard
    ? `<h2>Financing</h2>${dl([
        ...(showDownpayment ? [['Minimum downpayment', withPeso(bike.minDownpayment)]] : []),
        ...monthlyTerms.map((t) => [t.label, `${withPeso(t.value)}/mo`]),
      ])}`
    : '';
  const financingUrl = `/financing?bikeId=${encodeURIComponent(bike._id)}&bikeName=${encodeURIComponent(
    `${bike.brand} ${bike.model} ${bike.engineSize || ''}`.trim()
  )}`;

  return `
<main>
  <p>${link('/inventory', 'Back to inventory')}</p>
  <h1>${esc(bike.brand)} ${esc(bike.model)}</h1>
  <p>${bike.isReserved ? 'Reserved' : 'Available'} - ${esc(withPeso(bike.price))}</p>
  <h2>Specifications</h2>
  ${dl(bikeSpecs(bike))}
  ${lines(bike.description).length ? `<h2>Unit overview and condition</h2>${lines(bike.description).map((l) => `<p>${esc(l)}</p>`).join('')}` : ''}
  ${financing}
  ${modelPage ? `<p>${link(`/showcase/${modelPage.slug}`, `About the ${modelPage.brand} ${modelPage.model}`)}</p>` : ''}
  <p>Every unit comes with a 100-point inspection, complete OR/CR papers and full bike history.</p>
  <p>${link(financingUrl, 'Inquire for financing')} | ${link('/contact', 'Contact us')}</p>
</main>`;
};

const showcaseBody = (bike, live) => `
<main>
  <p>${link('/', 'Back to home')}</p>
  <h1>${esc(bike.brand)} ${esc(bike.model)}</h1>
  ${bike.tagline ? `<p>${esc(bike.tagline)}</p>` : ''}
  ${bike.description ? `<p>${esc(bike.description)}</p>` : ''}
  ${bike.features?.length ? `<h2>Features</h2><ul>${bike.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
  <p>${live ? link(bikePath(live), 'View in stock') : link('/inventory', 'Browse inventory')}</p>
</main>`;

const simpleBody = (heading, text, extra = '') => `
<main>
  <h1>${esc(heading)}</h1>
  <p>${esc(text)}</p>${extra}
</main>`;

const contactExtra = `
  <ul>
    <li>Phone: ${esc(contactInfo.phone)}</li>
    <li>Email: ${esc(contactInfo.email)}</li>
    <li>${esc(contactInfo.operatingHours)}</li>
    <li>${link(contactInfo.facebook, 'Facebook')}</li>
    <li>${link(contactInfo.instagram, 'Instagram')}</li>
  </ul>`;

// ── Sitemap ──────────────────────────────────────────────────────────────────

const toDate = (value) => {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString().split('T')[0] : null;
};

const sitemapXml = (entries) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(({ loc, lastmod }) => `  <url>
    <loc>${esc(loc)}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>
`;

// ── Run ──────────────────────────────────────────────────────────────────────

const writePage = (routePath, html) => {
  const file = routePath === '/'
    ? path.join(DIST, 'index.html')
    : path.join(DIST, routePath, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html, 'utf8');
};

const main = async () => {
  const indexFile = path.join(DIST, 'index.html');
  if (!fs.existsSync(indexFile)) {
    console.error('[prerender] dist/index.html not found. Run `vite build` first.');
    process.exit(1);
  }
  // Read the untouched template once: "/" overwrites dist/index.html below
  const template = fs.readFileSync(indexFile, 'utf8');

  const all = await fetchBikes();
  if (!all) {
    const msg = `Could not fetch bikes from ${API_BASE_URL} (VITE_API_URL=${process.env.VITE_API_URL || '(unset)'}). Bike pages and sitemap entries will be missing.`;
    if (STRICT) {
      console.error(`[prerender] ${msg} SEO_STRICT=1, failing the build.`);
      process.exit(1);
    }
    console.warn(`[prerender] WARNING: ${msg}`);
  }

  const bikes = (all || [])
    .filter((b) => b.status === 'Available' || !b.status)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const sitemap = [];
  const add = (routePath, meta, body, opts, lastmod) => {
    writePage(routePath, buildPage(template, meta, body, opts));
    sitemap.push({ loc: pageUrl(routePath), lastmod });
  };

  // "/" is also what the server falls back to for any path without its own
  // file, so it carries no canonical/og:url (it would claim every unknown URL).
  // The hero photo is the biggest thing on Home, so start fetching it before the CSS that uses it.
  // Only here: bike pages and the rest never show it.
  add('/', homeMeta(), homeBody(bikes), {
    withCanonical: false,
    extraHead: ['<link data-static-seo rel="preload" as="image" href="/static_data/hero.webp" fetchpriority="high" />'],
  });
  add('/inventory', inventoryMeta(bikes), inventoryBody(bikes));
  add('/financing', financingMeta(), simpleBody('Financing inquiry', financingMeta().description));
  add('/contact', contactMeta(), simpleBody('Contact', contactMeta().description, contactExtra));
  add('/privacy-policy', privacyMeta(), simpleBody('Privacy policy', privacyMeta().description));

  showcaseBikes.forEach((bike) => {
    const live = findShowcaseInventoryMatch(bike, bikes);
    add(`/showcase/${bike.slug}`, showcaseMeta(bike, live), showcaseBody(bike, live));
  });

  let skipped = 0;
  bikes.forEach((bike) => {
    const routePath = bikePath(bike);
    // The id comes from the database and the slug is sanitised, but this is
    // also a file path, so refuse anything unexpected.
    if (!/^\/bike\/[a-z0-9-]+$/.test(routePath)) {
      skipped += 1;
      console.warn(`[prerender] skipping unexpected path ${routePath}`);
      return;
    }
    add(routePath, bikeMeta(bike, imageUrl), bikeBody(bike), undefined, toDate(bike.updatedAt));
  });

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemapXml(sitemap), 'utf8');
  console.log(`[prerender] ${sitemap.length} pages written (${bikes.length - skipped} bikes), sitemap.xml updated.`);
};

main().catch((error) => {
  console.error('[prerender] failed:', error);
  process.exit(1);
});
