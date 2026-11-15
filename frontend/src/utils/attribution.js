// Where did this visitor come from? Used to tell the owner which inquiries
// came from Facebook posts, Google, a shared link, and so on.
//
// Two signals, in order of trust:
//   1. utm_source / utm_medium / utm_campaign on the link (links the owner
//      posts, and the Share buttons on bike pages, are tagged this way)
//   2. the site that sent the visitor (document.referrer), reduced to a name
//
// The result is kept in sessionStorage for the visit only, sent with a financing
// inquiry, and never contains anything personal. Pure functions first (no
// browser globals) so they can be tested in Node.

const STORAGE_KEY = 'kbAttribution';

// Known referrers get a friendly name; anything else is the bare host name
const KNOWN_REFERRERS = [
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$|^fb\.me$/, 'facebook'],
  [/(^|\.)messenger\.com$/, 'messenger'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)google\./, 'google'],
  [/(^|\.)bing\.com$/, 'bing'],
  [/(^|\.)duckduckgo\.com$/, 'duckduckgo'],
  [/(^|\.)yahoo\./, 'yahoo'],
  [/(^|\.)youtube\.com$/, 'youtube'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/(^|\.)viber\.com$/, 'viber'],
  [/^t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/, 'twitter'],
];

/** Lowercase tag of letters, digits, dot, dash and underscore, at most 40 characters. */
export const cleanLabel = (value) =>
  typeof value === 'string' ? value.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '').slice(0, 40) : '';

export const sourceFromReferrer = (referrer, ownHost) => {
  let host;
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
  if (!host || host === ownHost || host.endsWith(`.${ownHost}`)) return ''; // navigating within the site
  const known = KNOWN_REFERRERS.find(([pattern]) => pattern.test(host));
  return known ? known[1] : cleanLabel(host);
};

/**
 * @returns {{source: string, medium: string, campaign: string, tagged: boolean} | null}
 *   `tagged` is true when it came from utm parameters (those replace an earlier
 *   value in the same visit; a referrer only fills in when nothing is known yet).
 */
export const deriveAttribution = ({ search = '', referrer = '', ownHost = '' } = {}) => {
  const params = new URLSearchParams(search);
  const source = cleanLabel(params.get('utm_source'));
  if (source) {
    return {
      source,
      medium: cleanLabel(params.get('utm_medium')),
      campaign: cleanLabel(params.get('utm_campaign')),
      tagged: true,
    };
  }
  const fromReferrer = sourceFromReferrer(referrer, ownHost.replace(/^www\./, ''));
  return fromReferrer ? { source: fromReferrer, medium: 'referral', campaign: '', tagged: false } : null;
};

const read = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
};

/** Call once when the app starts. */
export const captureAttribution = () => {
  try {
    const found = deriveAttribution({
      search: window.location.search,
      referrer: document.referrer,
      ownHost: window.location.hostname,
    });
    if (!found) return;
    if (found.tagged || !read()) {
      const { source, medium, campaign } = found;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ source, medium, campaign }));
    }
  } catch {
    // storage blocked (private mode, etc.): attribution is optional
  }
};

/** What to send with an inquiry: {source, medium, campaign}, or undefined when nothing is known. */
export const getAttribution = () => read() || undefined;
