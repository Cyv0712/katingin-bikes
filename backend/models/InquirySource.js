const mongoose = require('mongoose');

// How many inquiries came from each source ("facebook", "google", "direct", ...).
// One document per source label. Holds no personal data: the label is a short
// lowercase tag taken from the link the visitor arrived by, plus a counter.
const inquirySourceSchema = new mongoose.Schema({
  source: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  firstAt: Date,
  lastAt: Date,
});

module.exports = mongoose.models.InquirySource || mongoose.model('InquirySource', inquirySourceSchema);
