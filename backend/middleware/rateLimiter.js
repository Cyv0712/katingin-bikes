const rateLimit = require('express-rate-limit');

// Global limiter: 1500 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Auth limiter: 5 attempts per 15 minutes per IP (Brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
  }
});

// Inquiry limiter: 10 submissions per hour per IP (prevents inbox flooding / email-API abuse)
const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many inquiries submitted from this IP, please try again later'
  }
});

// Owner-report limiter: only FAILED attempts (404 from a bad key) count, so the
// dashboard can reload freely but a key can't be brute-forced. No rate-limit
// headers, and once locked out the route just 404s like any unknown path.
const ownerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req, res, next) => next('route')
});

module.exports = {
  globalLimiter,
  authLimiter,
  inquiryLimiter,
  ownerLimiter
};
