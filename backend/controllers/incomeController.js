import Income from '../models/Income.js';

// @desc    Get all incomes for current user
// @route   GET /api/incomes
// @access  Private
export const getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ success: true, count: incomes.length, data: incomes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new income record
// @route   POST /api/incomes
// @access  Private
export const addIncome = async (req, res) => {
  const { amount, source, date, notes } = req.body;

  try {
    if (!amount || !source) {
      return res.status(400).json({ success: false, message: 'Please specify amount and source' });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({ success: false, message: 'Amount cannot be negative' });
    }

    const income = await Income.create({
      user: req.user._id,
      amount: Number(amount),
      source,
      date: date || new Date(),
      notes,
    });

    res.status(201).json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an income record
// @route   PUT /api/incomes/:id
// @access  Private
export const updateIncome = async (req, res) => {
  const { amount, source, date, notes } = req.body;

  try {
    let income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found' });
    }

    // Make sure user owns income record
    if (income.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (amount !== undefined) {
      if (Number(amount) < 0) {
        return res.status(400).json({ success: false, message: 'Amount cannot be negative' });
      }
      income.amount = Number(amount);
    }

    if (source !== undefined) income.source = source;
    if (date !== undefined) income.date = date;
    if (notes !== undefined) income.notes = notes;

    await income.save();

    res.json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an income record
// @route   DELETE /api/incomes/:id
// @access  Private
export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found' });
    }

    // Make sure user owns income record
    if (income.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await income.deleteOne();

    res.json({ success: true, message: 'Income record removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
