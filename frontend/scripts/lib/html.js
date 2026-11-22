// HTML string helpers for the prerender script. Everything that ends up in
// markup is escaped here: bike fields are typed in by the admin and the
// JSON-LD blocks are inline <script>, so a stray "</script>" must not break out.
import { withDefaults } from '../../src/seo/meta.js';

export const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// JSON that is safe inside <script>: "<" can never start "</script>" or "<!--"
export const jsonForScript = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

// Marker that main.jsx removes at startup. The page then sets its own tags
// through Helmet, so the browser never ends up with duplicates.
const MARK = 'data-static-seo';

export const renderHeadTags = (meta, { withCanonical = true, extraHead = [] } = {}) => {
  const m = withDefaults(meta);
  const tags = [
    `<title ${MARK}>${esc(m.title)}</title>`,
    `<meta ${MARK} name="description" content="${esc(m.description)}" />`,
  ];
  if (m.keywords) tags.push(`<meta ${MARK} name="keywords" content="${esc(m.keywords)}" />`);
  if (withCanonical) tags.push(`<link ${MARK} rel="canonical" href="${esc(m.canonical)}" />`);
  tags.push(
    `<meta ${MARK} property="og:title" content="${esc(m.ogTitle)}" />`,
    `<meta ${MARK} property="og:description" content="${esc(m.ogDescription)}" />`,
  );
  if (m.ogImage) tags.push(`<meta ${MARK} property="og:image" content="${esc(m.ogImage)}" />`);
  if (withCanonical) tags.push(`<meta ${MARK} property="og:url" content="${esc(m.canonical)}" />`);
  tags.push(`<meta ${MARK} property="og:type" content="${esc(m.ogType)}" />`);
  m.jsonLd.forEach((data) => {
    tags.push(`<script ${MARK} type="application/ld+json">${jsonForScript(data)}</script>`);
  });
  // Page-specific tags that are not metadata (e.g. an image preload), already in HTML form
  extraHead.forEach((tag) => tags.push(tag));
  return tags.map((t) => `  ${t}`).join('\n');
};

const TITLE_RE = /<title data-static-seo>[\s\S]*?<\/title>/;
const STATIC_META_RE = /[ \t]*<meta data-static-seo[^>]*>\r?\n?/g;
const ROOT = '<div id="root"></div>';

/** Replace the default head tags in dist/index.html and fill #root. */
export const buildPage = (template, meta, bodyHtml, headOptions) => {
  if (!TITLE_RE.test(template) || !template.includes(ROOT)) {
    throw new Error('dist/index.html is not the plain Vite build output (already prerendered? run `vite build` first)');
  }
  return template
    .replace(STATIC_META_RE, '')
    .replace(TITLE_RE, () => renderHeadTags(meta, headOptions).trim())
    // data-prerender: hidden by index.html's inline CSS when JS runs, so visitors don't
    // see the plain link list flash before the app mounts (crawlers read the raw HTML)
    .replace(ROOT, () => `<div id="root"><div data-prerender>${bodyHtml}</div></div>`);
};
