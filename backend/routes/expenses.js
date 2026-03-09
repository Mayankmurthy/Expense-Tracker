const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// Apply auth middleware to all expense routes
router.use(auth);

// GET all expenses for a user
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create expense
router.post('/', async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      userId: req.user.id
    });
    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update expense
router.put('/:id', async (req, res) => {
  try {
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Expense not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: 'Expense not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
