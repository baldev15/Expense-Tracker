import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Plus,
  ArrowRight,
  PlusCircle,
  X,
  CreditCard,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton, ChartSkeleton } from '../components/Layout/LoadingSkeleton';

const COLORS = [
  '#4f46e5', // indigo
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#14b8a6', // teal
  '#f43f5e', // rose
  '#6b7280', // gray
];

const Dashboard = () => {
  const { darkMode, triggerAppNotification } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: '',
      category: 'Food',
      paymentMethod: 'UPI',
      description: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const categories = [
    'Food',
    'Travel',
    'Shopping',
    'Rent',
    'Entertainment',
    'Medical',
    'Education',
    'Bills',
    'Fuel',
    'Other',
  ];

  const fetchDashboardData = async () => {
    try {
      const res = await API.get('/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      triggerAppNotification('Failed to retrieve dashboard analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickAddExpense = async (formData) => {
    setModalLoading(true);
    try {
      const res = await API.post('/expenses', formData);
      if (res.data.success) {
        triggerAppNotification('Expense added successfully!', 'success');
        setIsModalOpen(false);
        reset();
        fetchDashboardData(); // Refresh dashboard metrics & charts
      }
    } catch (error) {
      triggerAppNotification(error.response?.data?.message || 'Failed to add expense', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const { cards, recentTransactions, monthlyChartData, categoryChartData } = data;

  const strokeColor = darkMode ? '#334155' : '#e2e8f0';
  const textColor = darkMode ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-8">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Real-time financial summary and statistics.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Quick Add Expense</span>
        </button>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Balance */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
              Total Balance
            </span>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              ₹{cards.totalBalance.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-2xl">
            <Wallet size={24} />
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
              Total Income
            </span>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{cards.totalIncome.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-2xl">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
              Total Expenses
            </span>
            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              ₹{cards.totalExpense.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="p-4 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 rounded-2xl">
            <TrendingDown size={24} />
          </div>
        </div>

        {/* Savings */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
              Savings
            </span>
            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ₹{cards.savings.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-2xl">
            <PiggyBank size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Expense Curve */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-6">Monthly Expense Curve</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
                <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} />
                <YAxis stroke={textColor} fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    borderColor: strokeColor,
                    borderRadius: '12px',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-6">Income vs Expenses</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
                <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} />
                <YAxis stroke={textColor} fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    borderColor: strokeColor,
                    borderRadius: '12px',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                  }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Row: Recent Transactions + Category Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Transactions List */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Recent Transactions</h3>
            <Link
              to="/transactions"
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Title / Description</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40 text-sm">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-400 dark:text-slate-500">
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50/40 dark:hover:bg-slate-800/20">
                      <td className="py-3.5 font-medium text-gray-800 dark:text-slate-200">
                        {tx.title}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tx.type === 'income'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                          }`}
                        >
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 text-gray-400 dark:text-slate-400">
                        {new Date(tx.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td
                        className={`py-3.5 text-right font-semibold ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-800 dark:text-slate-100'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">Expenses by Category</h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 mb-6">Distribution in the last 30 days.</p>
          </div>
          
          <div className="h-56 relative flex items-center justify-center">
            {categoryChartData.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-slate-500 text-center">No spending logs in this range.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `₹${value}`}
                    contentStyle={{
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      borderColor: strokeColor,
                      borderRadius: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Custom legends list */}
          <div className="space-y-1.5 max-h-[7rem] overflow-y-auto mt-4 pr-1">
            {categoryChartData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-gray-500 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-700 dark:text-slate-200">
                  ₹{item.value.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-fade-in">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <PlusCircle size={20} className="text-indigo-600 dark:text-indigo-400" />
                <span>Quick Add Expense</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleQuickAddExpense)} className="p-6 space-y-4">
              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="any"
                  {...register('amount', {
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than zero' },
                  })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-850 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none rounded-2xl dark:text-white"
                />
                {errors.amount && (
                  <p className="text-xs text-rose-500 font-medium">{errors.amount.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-850 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none rounded-2xl dark:text-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Payment Method
                </label>
                <select
                  {...register('paymentMethod')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-850 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none rounded-2xl dark:text-white"
                >
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Starbucks coffee"
                  {...register('description', {
                    required: 'Description is required',
                    trim: true,
                  })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-850 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none rounded-2xl dark:text-white"
                />
                {errors.description && (
                  <p className="text-xs text-rose-500 font-medium">{errors.description.message}</p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </label>
                <input
                  type="date"
                  {...register('date', {
                    required: 'Date is required',
                  })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-850 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none rounded-2xl dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 bg-gray-50 text-gray-700 border border-gray-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700 font-semibold rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-1/2 py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-all text-sm shadow-md shadow-indigo-150 dark:shadow-none flex items-center justify-center"
                >
                  {modalLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Add Expense'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
