const mongoose = require('mongoose');

// One document per bike that has received at least one tracked inquiry.
// Holds no personal data: only the bike id, a snapshot of what the bike was
// (the Bike document may later be hard-deleted), and counts/timestamps.
const bikeLeadSchema = new mongoose.Schema({
  bikeId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  brand: String,
  model: String,
  engineSize: String,
  price: String,
  inquiryCount: { type: Number, default: 0 },
  firstInquiryAt: Date,
  lastInquiryAt: Date,
  removedAt: { type: Date, default: null },
  removalType: { type: String, enum: ['deleted', 'sold', null], default: null },
});

module.exports = mongoose.models.BikeLead || mongoose.model('BikeLead', bikeLeadSchema);
