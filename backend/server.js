const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const MONGO_URI = 'mongodb://localhost:27017/expense_tracker';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Compass locally'))
  .catch(err => console.error('MongoDB connection error:', err));

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

app.listen(PORT, () => console.log(`Node Server running on http://localhost:${PORT}`));
