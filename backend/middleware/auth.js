const jwt = require('jsonwebtoken');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function getRequestOrigin(req) {
  if (req.headers.origin) return req.headers.origin;
  if (req.headers.referer) {
    try {
      return new URL(req.headers.referer).origin;
    } catch {
      return null;
    }
  }
  return null;
}

// Mirrors the CORS allowlist logic in server.js: if CORS_ORIGIN isn't set
// (local dev), we don't have an allowlist to check against, so allow through.
function isOriginAllowed(origin) {
  const CORS_ORIGIN = process.env.CORS_ORIGIN;
  if (!CORS_ORIGIN) return true;
  const allowedOrigins = CORS_ORIGIN.split(',').map((o) => o.trim());
  return !!origin && allowedOrigins.includes(origin);
}

const authMiddleware = (req, res, next) => {
  let token = null;
  let fromCookie = false;

  // Check HttpOnly cookies first
  if (req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
    fromCookie = true;
  }
  // Fall back to Authorization header for compatibility
  else {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  // CSRF guard: browsers auto-attach cookies to cross-site requests, and some
  // request shapes (e.g. a multipart/form-data POST) are "simple" requests that
  // skip CORS preflight entirely, so the CORS allowlist alone doesn't stop them.
  // This only applies to cookie-based auth — a manually-set Authorization header
  // can't be forged by a third-party page, so it needs no extra check.
  if (fromCookie && !SAFE_METHODS.has(req.method)) {
    const origin = getRequestOrigin(req);
    if (!isOriginAllowed(origin)) {
      return res.status(403).json({ message: 'Request origin not allowed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
