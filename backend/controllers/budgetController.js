import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';

// @desc    Get all budgets with calculated spend progress for a specific month and year
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month, year });

    // Calculate dates for expense aggregation
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Get expenses aggregated by category for this month
    const expensesAggregated = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    // Map aggregated expenses to category:amount dictionary
    const spentDict = {};
    expensesAggregated.forEach((item) => {
      spentDict[item._id] = item.totalSpent;
    });

    // Merge spent data with budgets
    const budgetProgress = budgets.map((budget) => {
      const spent = spentDict[budget.category] || 0;
      const remaining = budget.limit - spent;
      const usedPercent = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

      return {
        _id: budget._id,
        category: budget.category,
        limit: budget.limit,
        month: budget.month,
        year: budget.year,
        spent,
        remaining,
        usedPercent: parseFloat(usedPercent.toFixed(2)),
      };
    });

    res.json({ success: true, count: budgetProgress.length, data: budgetProgress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add or Update budget (upsert)
// @route   POST /api/budgets
// @access  Private
export const addOrUpdateBudget = async (req, res) => {
  const { category, limit, month, year } = req.body;

  try {
    if (!category || limit === undefined) {
      return res.status(400).json({ success: false, message: 'Please specify category and limit' });
    }

    if (Number(limit) < 0) {
      return res.status(400).json({ success: false, message: 'Limit cannot be negative' });
    }

    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();

    // Find and update or insert if it doesn't exist
    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user._id,
        category,
        month: targetMonth,
        year: targetYear,
      },
      {
        limit: Number(limit),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    // Calculate current progress for the returned budget
    const startOfMonth = new Date(Date.UTC(targetYear, targetMonth - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));

    const totalExpenses = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          category,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const spent = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
    const remaining = budget.limit - spent;
    const usedPercent = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

    res.status(201).json({
      success: true,
      data: {
        _id: budget._id,
        category: budget.category,
        limit: budget.limit,
        month: budget.month,
        year: budget.year,
        spent,
        remaining,
        usedPercent: parseFloat(usedPercent.toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget record not found' });
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await budget.deleteOne();

    res.json({ success: true, message: 'Budget record removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
