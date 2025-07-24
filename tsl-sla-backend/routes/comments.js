const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// Create new comment
router.post('/:slaId', async (req, res) => {
  try {
    const { content, user, progress } = req.body;
    
    const newComment = new Comment({
      sla: req.params.slaId,
      user,
      content,
      progress
    });
    
    const savedComment = await newComment.save()
      .populate('user', 'username department');
    
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for SLA
router.get('/:slaId', async (req, res) => {
  try {
    const comments = await Comment.find({ sla: req.params.slaId })
      .populate('user', 'username department')
      .populate('progress', 'month')
      .sort({ createdAt: 1 });
      
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;