const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Simple authentication (string comparison)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Simple string comparison for demo (not secure for production)
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Return user data without password
    const { password: _, ...userData } = user.toObject();
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;