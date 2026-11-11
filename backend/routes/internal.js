const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const BikeLead = require('../models/BikeLead');
const BikeActivity = require('../models/BikeActivity');
const { ownerLimiter } = require('../middleware/rateLimiter');

const MIN_KEY_LENGTH = 24;

// Owner-only key check. Any failure (unset or too-short env, missing or wrong
// key) falls through to the app's normal 404, so the endpoint is
// indistinguishable from a route that doesn't exist.
function ownerKeyGuard(req, res, next) {
  const expected = process.env.OWNER_API_KEY;
  const provided = req.headers['x-owner-key'];
  if (!expected || expected.length < MIN_KEY_LENGTH || typeof provided !== 'string') {
    return next('route');
  }
  // Compare hashes so the buffers are always equal length for timingSafeEqual.
  const a = crypto.createHash('sha256').update(provided).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  if (!crypto.timingSafeEqual(a, b)) {
    return next('route');
  }
  next();
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// GET /api/internal/attribution?from=<ISO>&to=<ISO>
// from/to filter on removedAt for the "helped sell" figures.
router.get('/attribution', ownerLimiter, ownerKeyGuard, async (req, res) => {
  try {
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);

    const removedFilter = { removalType: { $ne: null } };
    if (from || to) {
      removedFilter.removedAt = {};
      if (from) removedFilter.removedAt.$gte = from;
      if (to) removedFilter.removedAt.$lte = to;
    }

    const [removed, openLeads, totalLeads, totals] = await Promise.all([
      BikeLead.find(removedFilter).sort({ removedAt: -1 }).lean(),
      BikeLead.countDocuments({ removalType: null }),
      BikeLead.countDocuments({}),
      BikeLead.aggregate([{ $group: { _id: null, total: { $sum: '$inquiryCount' } } }]),
    ]);

    const byType = { deleted: 0, sold: 0 };
    for (const lead of removed) byType[lead.removalType] += 1;

    res.json({
      helpedSold: removed.length,
      byType,
      openLeads,
      totalLeads,
      totalInquiries: totals[0]?.total || 0,
      bikes: removed.map(({ brand, model, engineSize, price, inquiryCount, firstInquiryAt, lastInquiryAt, removedAt, removalType }) => ({
        brand, model, engineSize, price, inquiryCount, firstInquiryAt, lastInquiryAt, removedAt, removalType,
        // Prices are stored as display strings like "₱ 1,450,000"
        priceValue: parseFloat(String(price ?? '').replace(/[^0-9.]/g, '')) || 0,
        daysToClose: firstInquiryAt && removedAt
          ? Math.max(0, Math.round(((removedAt - firstInquiryAt) / 86400000) * 10) / 10)
          : null,
      })),
    });
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/internal/activity?limit=<1-200, default 50>&from=<ISO>&to=<ISO>
// Newest-first log of bikes added to the site, with the exact timestamp.
// Counts are over the whole log; from/to/limit only shape the returned list.
router.get('/activity', ownerLimiter, ownerKeyGuard, async (req, res) => {
  try {
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 200) : 50;

    const filter = { event: 'added' };
    if (from || to) {
      filter.occurredAt = {};
      if (from) filter.occurredAt.$gte = from;
      if (to) filter.occurredAt.$lte = to;
    }

    const now = Date.now();
    const since = (days) => new Date(now - days * 86400000);
    const [events, total, last24h, last7d, last30d] = await Promise.all([
      BikeActivity.find(filter).sort({ occurredAt: -1 }).limit(limit).lean(),
      BikeActivity.countDocuments({ event: 'added' }),
      BikeActivity.countDocuments({ event: 'added', occurredAt: { $gte: since(1) } }),
      BikeActivity.countDocuments({ event: 'added', occurredAt: { $gte: since(7) } }),
      BikeActivity.countDocuments({ event: 'added', occurredAt: { $gte: since(30) } }),
    ]);

    res.json({
      total,
      last24h,
      last7d,
      last30d,
      events: events.map(({ brand, model, engineSize, price, occurredAt }) => ({
        brand, model, engineSize, price, addedAt: occurredAt,
      })),
    });
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
