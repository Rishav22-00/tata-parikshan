const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  sla: { type: mongoose.Schema.Types.ObjectId, ref: 'SLA', required: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  decision: { 
    type: String, 
    enum: ['accepted', 'returned'], 
    required: true 
  },
  comments: String,
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);