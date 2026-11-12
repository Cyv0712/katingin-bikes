const mongoose = require('mongoose');

// Append-only log of inventory events, kept apart from the Bike collection so
// the history survives a bike being hard-deleted. Currently only 'added'.
// Holds no personal data: a bike id, a snapshot of what was listed, and the
// moment it happened.
const bikeActivitySchema = new mongoose.Schema({
  bikeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  event: { type: String, enum: ['added'], required: true },
  brand: String,
  model: String,
  engineSize: String,
  price: String,
  occurredAt: { type: Date, required: true, default: Date.now },
});

// One 'added' entry per bike, and fast newest-first reads.
bikeActivitySchema.index({ bikeId: 1, event: 1 }, { unique: true });
bikeActivitySchema.index({ occurredAt: -1 });

module.exports = mongoose.models.BikeActivity || mongoose.model('BikeActivity', bikeActivitySchema);
