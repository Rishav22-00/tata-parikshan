const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  sla: { type: mongoose.Schema.Types.ObjectId, ref: 'SLA', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  progress: { type: mongoose.Schema.Types.ObjectId, ref: 'Progress' },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);