import Expense from '../models/Expense.js';

// @desc    Get all expenses with search, sorting, filtering, and pagination
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res) => {
  try {
    const { category, search, month, year, date, sortBy, sortOrder, page, limit } = req.query;

    // Build query object
    const query = { user: req.user._id };

    // Filter by category
    if (category && category !== 'All' && category !== '') {
      query.category = category;
    }

    // Filter by specific date
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Filter by month & year or year only
    if (month || year) {
      const targetYear = parseInt(year) || new Date().getFullYear();
      let start, end;

      if (month) {
        const targetMonth = parseInt(month) - 1; // JS months are 0-11
        start = new Date(Date.UTC(targetYear, targetMonth, 1, 0, 0, 0, 0));
        end = new Date(Date.UTC(targetYear, targetMonth + 1, 0, 23, 59, 59, 999));
      } else {
        // Year only
        start = new Date(Date.UTC(targetYear, 0, 1, 0, 0, 0, 0));
        end = new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59, 999));
      }
      query.date = { $gte: start, $lte: end };
    }

    // Search by description or category or paymentMethod
    if (search && search.trim() !== '') {
      const regexSearch = { $regex: search, $options: 'i' };
      query.$or = [
        { description: regexSearch },
        { category: regexSearch },
        { paymentMethod: regexSearch },
      ];
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortField = sortBy || 'date';
    const direction = sortOrder === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: direction };

    // Execute query
    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: expenses.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private
export const addExpense = async (req, res) => {
  const { amount, category, paymentMethod, description, date } = req.body;

  try {
    if (!amount || !category || !paymentMethod || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount, category, paymentMethod, and description',
      });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({ success: false, message: 'Amount cannot be negative' });
    }

    const expense = await Expense.create({
      user: req.user._id,
      amount: Number(amount),
      category,
      paymentMethod,
      description,
      date: date || new Date(),
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
  const { amount, category, paymentMethod, description, date } = req.body;

  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    // Check ownership
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (amount !== undefined) {
      if (Number(amount) < 0) {
        return res.status(400).json({ success: false, message: 'Amount cannot be negative' });
      }
      expense.amount = Number(amount);
    }

    if (category !== undefined) expense.category = category;
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
    if (description !== undefined) expense.description = description;
    if (date !== undefined) expense.date = date;

    await expense.save();

    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    // Check ownership
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await expense.deleteOne();

    res.json({ success: true, message: 'Expense record removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
