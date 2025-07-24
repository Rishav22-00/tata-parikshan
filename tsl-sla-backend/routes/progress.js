const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');

// Create or update progress
router.post('/:slaId', async (req, res) => {
  try {
    const { month, updates, overallComments, updatedBy } = req.body;
    
    // Find existing progress for this month
    const existingProgress = await Progress.findOne({ 
      sla: req.params.slaId, 
      month: new Date(month) 
    });
    
    let progress;
    if (existingProgress) {
      // Update existing progress
      progress = await Progress.findByIdAndUpdate(
        existingProgress._id,
        { updates, overallComments, updatedBy },
        { new: true }
      );
    } else {
      // Create new progress
      const newProgress = new Progress({
        sla: req.params.slaId,
        month: new Date(month),
        updates,
        overallComments,
        updatedBy
      });
      
      progress = await newProgress.save();
    }
    
    res.json(progress); 
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get progress for SLA
router.get('/:slaId', async (req, res) => {
  try {
    const progress = await Progress.find({ sla: req.params.slaId })
      .sort({ month: 1 })
      .populate('updatedBy', 'username department');
      
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;