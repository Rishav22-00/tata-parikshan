const express = require('express');
const router = express.Router();
const SLA = require('../models/SLA');
const Review = require('../models/Review');

// Create new SLA
router.post('/', async (req, res) => {
  try {
    const newSLA = new SLA(req.body);
    const savedSLA = await newSLA.save();
    res.status(201).json(savedSLA);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get SLA by ID
router.get('/:id', async (req, res) => {
  try {
    const sla = await SLA.findById(req.params.id)
      .populate('createdBy', 'username department');
      
    if (!sla) {
      return res.status(404).json({ message: 'SLA not found' });
    }
    
    res.json(sla);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit SLA for review
router.put('/:id/submit', async (req, res) => {
  try {
    const sla = await SLA.findByIdAndUpdate(
      req.params.id,
      { status: 'submitted' },
      { new: true }
    );
    
    if (!sla) {
      return res.status(404).json({ message: 'SLA not found' });
    }
    
    res.json(sla);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Review SLA
router.post('/:id/review', async (req, res) => {
  try {
    const { decision, comments, reviewedBy } = req.body;
    
    // Create review record
    const review = new Review({
      sla: req.params.id,
      reviewedBy,
      decision,
      comments
    });
    
    await review.save();
    
    // Update SLA status
    const newStatus = decision === 'accepted' ? 'active' : 'returned';
    const sla = await SLA.findByIdAndUpdate(
      req.params.id,
      { status: newStatus },
      { new: true }
    );
    
    res.json({ sla, review });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get SLAs for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const slas = await SLA.find({ createdBy: req.params.userId });
    res.json(slas);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get SLAs for a department
router.get('/dept/:deptName', async (req, res) => {
  try {
    const slas = await SLA.find({ 
      $or: [
        { raisingDept: req.params.deptName },
        { targetDept: req.params.deptName }
      ],
      status: { $ne: 'draft' }
    });
    res.json(slas);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;