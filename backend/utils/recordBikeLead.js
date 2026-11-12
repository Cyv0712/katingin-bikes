const Bike = require('../models/Bike');
const BikeLead = require('../models/BikeLead');
const BikeActivity = require('../models/BikeActivity');

// Best-effort helpers: they never throw and never log, so a failure here can
// not change an inquiry or delete response (or leave traces in server logs).

async function recordInquiry(bikeId) {
  try {
    // Request-supplied: accept only a plain 24-char hex string, never an object.
    if (typeof bikeId !== 'string' || !/^[a-f\d]{24}$/i.test(bikeId)) return;
    const bike = await Bike.findById(bikeId).lean();
    if (!bike || bike.status === 'Sold') return;

    const now = new Date();
    await BikeLead.updateOne(
      { bikeId: bike._id },
      {
        $inc: { inquiryCount: 1 },
        $set: {
          brand: bike.brand,
          model: bike.model,
          engineSize: bike.engineSize,
          price: bike.price,
          lastInquiryAt: now,
        },
        $setOnInsert: { firstInquiryAt: now },
      },
      { upsert: true }
    );
  } catch {
    // swallowed on purpose
  }
}

// type: 'deleted' | 'sold'. No-op unless the bike has a lead that is still open.
async function recordRemoval(bikeId, type) {
  try {
    await BikeLead.updateOne(
      { bikeId, removedAt: null },
      { $set: { removedAt: new Date(), removalType: type } }
    );
  } catch {
    // swallowed on purpose
  }
}

// Logs that a bike was listed. Idempotent per bike (the unique index plus
// $setOnInsert means a replay never moves the original timestamp).
async function recordBikeAdded(bike) {
  try {
    if (!bike || !bike._id) return;
    await BikeActivity.updateOne(
      { bikeId: bike._id, event: 'added' },
      {
        $setOnInsert: {
          brand: bike.brand,
          model: bike.model,
          engineSize: bike.engineSize,
          price: bike.price,
          occurredAt: bike.createdAt instanceof Date ? bike.createdAt : new Date(),
        },
      },
      { upsert: true }
    );
  } catch {
    // swallowed on purpose
  }
}

module.exports = { recordInquiry, recordRemoval, recordBikeAdded };
