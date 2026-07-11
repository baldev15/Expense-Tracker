import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus,
  Trash2,
  Edit2,
  TrendingDown,
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/Layout/ConfirmationModal';
import { TableSkeleton } from '../components/Layout/LoadingSkeleton';

const ExpensesPage = () => {
  const { triggerAppNotification } = useAuth();
  
  // Data State
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8; // items per page

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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

  const yearsList = ['2024', '2025', '2026', '2027'];
  const monthsList = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        category: category === 'All' ? '' : category,
        month,
        year,
        sortBy,
        sortOrder,
        page,
        limit,
      });

      const res = await API.get(`/expenses?${queryParams.toString()}`);
      if (res.data.success) {
        setExpenses(res.data.data);
        setTotalPages(res.data.pages || 1);
        
        // Let's get lifetime / context stats sum
        // To find the sum of currently queried filter, we could aggregate.
        // For simplicity, we show the sum computed by standard query or we can compute aggregate of current result.
        // Let's show total items count or fetch dashboard stats. Let's compute local page sum or pull sum.
        // We'll compute total expenses for this month/year by querying dashboard or reports, or we can sum it here.
        // For visual clarity, we'll fetch the sum of all pages matching this query.
        const allRes = await API.get(`/expenses?category=${category === 'All' ? '' : category}&search=${search}&month=${month}&year=${year}&limit=10000`);
        if (allRes.data.success) {
          const sum = allRes.data.data.reduce((acc, item) => acc + item.amount, 0);
          setTotalExpenses(sum);
        }
      }
    } catch (error) {
      triggerAppNotification('Failed to fetch expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when filters or page changes
  useEffect(() => {
    fetchExpenses();
  }, [category, search, month, year, sortBy, sortOrder, page]);

  const openAddModal = () => {
    setEditingExpense(null);
    reset({
      amount: '',
      category: 'Food',
      paymentMethod: 'UPI',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsFormOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setValue('amount', expense.amount);
    setValue('category', expense.category);
    setValue('paymentMethod', expense.paymentMethod);
    setValue('description', expense.description);
    setValue('date', new Date(expense.date).toISOString().split('T')[0]);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitLoading(true);
    try {
      if (editingExpense) {
        const res = await API.put(`/expenses/${editingExpense._id}`, formData);
        if (res.data.success) {
          triggerAppNotification('Expense updated', 'success');
          setIsFormOpen(false);
          fetchExpenses();
        }
      } else {
        const res = await API.post('/expenses', formData);
        if (res.data.success) {
          triggerAppNotification('Expense recorded!', 'success');
          setIsFormOpen(false);
          fetchExpenses();
        }
      }
    } catch (error) {
      triggerAppNotification(error.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setSubmitLoading(true);
    try {
      const res = await API.delete(`/expenses/${deletingId}`);
      if (res.data.success) {
        triggerAppNotification('Expense record removed', 'success');
        setIsDeleteOpen(false);
        fetchExpenses();
      }
    } catch (error) {
      triggerAppNotification('Failed to delete expense record', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSortToggle = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Log and manage your daily purchases and utility payouts.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
              Selected Filter Spend
            </span>
            <h3 className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="p-4 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 rounded-2xl">
            <TrendingDown size={28} />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Filter size={16} className="text-indigo-600 dark:text-indigo-400" />
          <span>Search & Filters</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Search Description */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-slate-800/40 dark:border-slate-700 focus:border-indigo-500 rounded-xl focus:outline-none text-sm dark:text-white"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 dark:bg-slate-800/40 dark:border-slate-700 focus:border-indigo-500 rounded-xl focus:outline-none text-sm dark:text-white"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Month */}
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 dark:bg-slate-800/40 dark:border-slate-700 focus:border-indigo-500 rounded-xl focus:outline-none text-sm dark:text-white"
          >
            {monthsList.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Year */}
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 dark:bg-slate-800/40 dark:border-slate-700 focus:border-indigo-500 rounded-xl focus:outline-none text-sm dark:text-white"
          >
            {yearsList.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Sort field */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSortToggle('date')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border rounded-xl text-xs font-semibold transition-all ${
                sortBy === 'date'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-800 dark:text-indigo-400'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-400'
              }`}
            >
              <ArrowUpDown size={14} />
              <span>Date {sortBy === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
            </button>
            <button
              onClick={() => handleSortToggle('amount')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border rounded-xl text-xs font-semibold transition-all ${
                sortBy === 'amount'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-800 dark:text-indigo-400'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-400'
              }`}
            >
              <ArrowUpDown size={14} />
              <span>Amt {sortBy === 'amount' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Expenses Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between min-h-[28rem]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-800/30">
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40 text-sm">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">
                      No expense logs found matching selected filters.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/10">
                      <td className="px-6 py-4 font-semibold text-gray-800 dark:text-slate-200">
                        {exp.description}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                        {exp.paymentMethod}
                      </td>
                      <td className="px-6 py-4 text-gray-400 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span>
                            {new Date(exp.date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-slate-100">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Edit Expense"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(exp._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Delete Expense"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 border border-gray-250 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 border border-gray-250 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 disabled:opacity-40 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-fade-in">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <TrendingDown size={20} className="text-indigo-600 dark:text-indigo-400" />
                <span>{editingExpense ? 'Edit Expense Record' : 'Record Expense'}</span>
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
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
                  placeholder="e.g. Grocery items"
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
                  onClick={() => setIsFormOpen(false)}
                  className="w-1/2 py-3 bg-gray-50 text-gray-700 border border-gray-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700 font-semibold rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-1/2 py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-all text-sm shadow-md shadow-indigo-150 dark:shadow-none flex items-center justify-center"
                >
                  {submitLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : editingExpense ? (
                    'Save Changes'
                  ) : (
                    'Record Expense'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        title="Delete Expense Record"
        message="Are you sure you want to delete this expense record? This will permanently subtract this purchase from your logs and statistics."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
        isLoading={submitLoading}
      />
    </div>
  );
};

export default ExpensesPage;
