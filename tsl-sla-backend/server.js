require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/slas', require('./routes/slas'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/comments', require('./routes/comments'));

// Seed initial data
const seedInitialData = async () => {
  const Department = require('./models/Department');
  const User = require('./models/User');
  
  const departments = ['Finance', 'HR', 'IT', 'Operations', 'Marketing'];
  const users = [
    { username: 'finance1', password: 'pass123', department: 'Finance', role: 'dept_head' },
    { username: 'hr1', password: 'pass123', department: 'HR', role: 'dept_head' },
    { username: 'it1', password: 'pass123', department: 'IT', role: 'dept_head' },
    { username: 'operations1', password: 'pass123', department: 'Operations', role: 'user' },
    { username: 'admin', password: 'admin123', department: 'Admin', role: 'admin' },
  ];
  
  try {
    // Create departments
    for (const dept of departments) {
      await Department.findOneAndUpdate(
        { name: dept },
        { name: dept },
        { upsert: true, new: true }
      );
    }
    
    // Create users
    for (const user of users) {
      await User.findOneAndUpdate(
        { username: user.username },
        user,
        { upsert: true, new: true }
      );
    }
    
    console.log('Initial data seeded successfully');
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  seedInitialData();
});