import Income from '../models/Income.js';
import Expense from '../models/Expense.js';

// @desc    Get dashboard statistics, charts data, and recent transactions
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Calculate Lifetime Totals
    const totalIncomePromise = Income.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalExpensePromise = Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // 2. Fetch Latest 5 Incomes and 5 Expenses to combine
    const recentIncomesPromise = Income.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    const recentExpensesPromise = Expense.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    // 3. Aggregate Monthly Data for last 6 months (Income vs Expense)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyExpensesPromise = Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const monthlyIncomesPromise = Income.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    // 4. Category Pie Chart (All time or Current Month - we'll group by category)
    // We will do all time or current month. Let's do all-time for better historical visualization on the main dashboard, or we can do last 30 days. Let's do last 30 days for category breakdown.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const categoryExpensesPromise = Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' },
        },
      },
      { $sort: { value: -1 } },
    ]);

    // Execute all queries in parallel
    const [
      totalIncomeResult,
      totalExpenseResult,
      recentIncomes,
      recentExpenses,
      monthlyExpenses,
      monthlyIncomes,
      categoryExpenses,
    ] = await Promise.all([
      totalIncomePromise,
      totalExpensePromise,
      recentIncomesPromise,
      recentExpensesPromise,
      monthlyExpensesPromise,
      monthlyIncomesPromise,
      categoryExpensesPromise,
    ]);

    // Format lifetime values
    const totalIncome = totalIncomeResult.length > 0 ? totalIncomeResult[0].total : 0;
    const totalExpense = totalExpenseResult.length > 0 ? totalExpenseResult[0].total : 0;
    const totalBalance = totalIncome - totalExpense;
    const savings = totalBalance > 0 ? totalBalance : 0; // Savings equals positive balance

    // Format Recent Transactions
    const combinedTransactions = [
      ...recentIncomes.map((inc) => ({
        _id: inc._id,
        amount: inc.amount,
        title: inc.source,
        category: 'Income',
        type: 'income',
        date: inc.date,
      })),
      ...recentExpenses.map((exp) => ({
        _id: exp._id,
        amount: exp.amount,
        title: exp.description,
        category: exp.category,
        type: 'expense',
        date: exp.date,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // Format monthly data for charts (last 6 months chronologically)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartDataMap = {};

    // Initialize past 6 months in map
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1; // 1-12
      const y = d.getFullYear();
      const key = `${y}-${m}`;
      chartDataMap[key] = {
        name: `${monthNames[m - 1]} ${y.toString().slice(-2)}`,
        income: 0,
        expense: 0,
        year: y,
        month: m,
      };
    }

    // Populate monthly expenses
    monthlyExpenses.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      if (chartDataMap[key]) {
        chartDataMap[key].expense = item.total;
      }
    });

    // Populate monthly incomes
    monthlyIncomes.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      if (chartDataMap[key]) {
        chartDataMap[key].income = item.total;
      }
    });

    const monthlyChartData = Object.values(chartDataMap).sort(
      (a, b) => a.year - b.year || a.month - b.month
    );

    // Format category data
    const formattedCategories = categoryExpenses.map((item) => ({
      name: item._id,
      value: item.value,
    }));

    res.json({
      success: true,
      data: {
        cards: {
          totalBalance,
          totalIncome,
          totalExpense,
          savings,
        },
        recentTransactions: combinedTransactions,
        monthlyChartData,
        categoryChartData: formattedCategories,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
