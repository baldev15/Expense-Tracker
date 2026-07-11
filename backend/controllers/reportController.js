import Expense from '../models/Expense.js';

// @desc    Get detailed report data for a specific date range
// @route   GET /api/reports
// @access  Private
export const getReportData = async (req, res) => {
  try {
    const { range } = req.query; // 'today', 'last7days', 'last30days', 'monthly', 'yearly'
    const userId = req.user._id;

    let start = new Date();
    let end = new Date();
    let numDays = 1;

    const today = new Date();

    if (range === 'today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      numDays = 1;
    } else if (range === 'last7days') {
      start.setDate(today.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      numDays = 7;
    } else if (range === 'last30days') {
      start.setDate(today.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      numDays = 30;
    } else if (range === 'monthly') {
      // Current month
      start = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      // Days in current month up to today (or full month if user wants full)
      const lastDay = end.getDate();
      numDays = lastDay;
    } else if (range === 'yearly') {
      // Current year
      start = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
      end = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
      numDays = 365;
    } else {
      // Default to last 30 days
      start.setDate(today.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      numDays = 30;
    }

    // 1. Get total spending and category breakdown
    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    // 2. Get daily spending timeline
    const dailyTimeline = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Calculate total spend
    const totalSpending = categoryBreakdown.reduce((sum, item) => sum + item.amount, 0);

    // Calculate average daily spending
    const averageDailyExpense = parseFloat((totalSpending / numDays).toFixed(2));

    // Get highest spending category
    const highestCategory =
      categoryBreakdown.length > 0
        ? { category: categoryBreakdown[0]._id, amount: categoryBreakdown[0].amount }
        : { category: 'None', amount: 0 };

    // Format category breakdown for Recharts
    const formattedCategories = categoryBreakdown.map((item) => ({
      name: item._id,
      value: item.amount,
    }));

    // Format timeline: ensure all days in range are represented (even with 0) for a smooth chart
    const timelineDataMap = {};
    const tempDate = new Date(start);
    while (tempDate <= end) {
      const dateStr = tempDate.toISOString().split('T')[0];
      timelineDataMap[dateStr] = 0;
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // Fill in real daily data
    dailyTimeline.forEach((item) => {
      if (timelineDataMap[item._id] !== undefined) {
        timelineDataMap[item._id] = item.amount;
      }
    });

    const formattedTimeline = Object.entries(timelineDataMap).map(([date, amount]) => ({
      date,
      amount,
    }));

    res.json({
      success: true,
      data: {
        stats: {
          totalSpending,
          highestCategory,
          averageDailyExpense,
        },
        categoryData: formattedCategories,
        timelineData: formattedTimeline,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
