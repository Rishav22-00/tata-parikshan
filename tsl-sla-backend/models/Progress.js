const mongoose = require('mongoose');

const metricUpdateSchema = new mongoose.Schema({
  metric: String,
  target: String,
  actual: String,
  status: { 
    type: String, 
    enum: ['on_track', 'at_risk', 'off_track'] 
  },
});

const progressSchema = new mongoose.Schema({
  sla: { type: mongoose.Schema.Types.ObjectId, ref: 'SLA', required: true },
  month: { type: Date, required: true }, // First day of the month
  updates: [metricUpdateSchema],
  overallComments: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);