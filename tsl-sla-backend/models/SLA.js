const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
  name: String,
  target: String,
  measurement: String,
});

const slaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  raisingDept: { type: String, required: true },
  targetDept: { type: String, required: true },
  metrics: [metricSchema],
  startDate: Date,
  endDate: Date,
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'accepted', 'returned', 'active', 'completed'], 
    default: 'draft' 
  },
  attachments: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('SLA', slaSchema);