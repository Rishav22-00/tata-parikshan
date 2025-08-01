const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  role: { type: String, enum: ['admin', 'dept_head', 'user'], default: 'user' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);