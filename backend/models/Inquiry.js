const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  unitInterested: { type: String, required: true },
  message: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', InquirySchema);
