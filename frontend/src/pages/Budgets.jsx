import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PiggyBank, Plus, Edit2, Trash2, AlertTriangle, CheckCircle, X, ChevronRight } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/Layout/ConfirmationModal';
import { CardSkeleton } from '../components/Layout/LoadingSkeleton';

const BudgetsPage = () => {
  const { triggerAppNotification } = useAuth();
  
  // Data State
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: 'Food',
      limit: '',
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

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/budgets?month=${month}&year=${year}`);
      if (res.data.success) {
        setBudgets(res.data.data);
      }
    } catch (error) {
      triggerAppNotification('Failed to fetch budgets list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const openAddModal = () => {
    setEditingBudget(null);
    reset({
      category: 'Food',
      limit: '',
    });
    setIsFormOpen(true);
  };

  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setValue('category', budget.category);
    setValue('limit', budget.limit);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitLoading(true);
    try {
      const payload = {
        ...formData,
        month: parseInt(month),
        year: parseInt(year),
      };

      const res = await API.post('/budgets', payload);
      if (res.data.success) {
        triggerAppNotification(
          editingBudget ? 'Budget limit updated' : 'New budget limit established',
          'success'
        );
        setIsFormOpen(false);
        fetchBudgets();

        // Check if the budget was set and is immediately exceeded to trigger notification toast
        const budgetResult = res.data.data;
        if (budgetResult.spent > budgetResult.limit) {
          triggerAppNotification(
            `Budget alert! You have exceeded your ₹${budgetResult.limit} limit for ${budgetResult.category}.`,
            'warning'
          );
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
      const res = await API.delete(`/budgets/${deletingId}`);
      if (res.data.success) {
        triggerAppNotification('Budget cap removed', 'success');
        setIsDeleteOpen(false);
        fetchBudgets();
      }
    } catch (error) {
      triggerAppNotification('Failed to remove budget cap', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Find remaining budget categories for Quick Add
  const activeCategories = budgets.map((b) => b.category);
  const remainingCategories = categories.filter((c) => !activeCategories.includes(c));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Budgets</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Set and track spending boundaries for each category to maintain your savings rate.
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={remainingCategories.length === 0}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-250 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Establish Budget Limit</span>
        </button>
      </div>

      {/* Select Month/Year Row */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-200 flex items-center gap-2">
          <PiggyBank size={18} className="text-indigo-600 dark:text-indigo-400" />
          <span>Active Period</span>
        </h3>
        
        <div className="flex gap-4">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 dark:bg-slate-800/40 dark:border-slate-700 focus:border-indigo-500 rounded-xl focus:outline-none text-sm dark:text-white"
          >
            {monthsList.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 dark:bg-slate-800/40 dark:border-slate-700 focus:border-indigo-500 rounded-xl focus:outline-none text-sm dark:text-white"
          >
            {yearsList.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of budgets */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <p className="text-gray-400 dark:text-slate-500 max-w-sm mx-auto mb-4 text-sm leading-relaxed">
            No budgets are established for this period ({monthsList.find((m) => m.value === month)?.label} {year}).
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 rounded-xl transition"
          >
            Create First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((b) => {
            const isExceeded = b.spent > b.limit;
            const progress = Math.min(b.usedPercent, 100);

            let barColor = 'bg-indigo-650 bg-indigo-600';
            if (isExceeded) {
              barColor = 'bg-red-500 animate-pulse';
            } else if (progress > 85) {
              barColor = 'bg-amber-500';
            } else {
              barColor = 'bg-emerald-500';
            }

            return (
              <div
                key={b._id}
                className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-sm transition-all flex flex-col justify-between h-56 ${
                  isExceeded
                    ? 'border-red-100 dark:border-red-950/30 bg-red-50/10 dark:bg-red-950/5'
                    : 'border-gray-100 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white text-base">
                        {b.category}
                      </h4>
                      <p className="text-xs text-gray-400 dark:text-slate-400">
                        Budget for {monthsList.find((m) => m.value === month)?.label}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(b)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Edit limit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(b._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Delete limit"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Warning banner */}
                  {isExceeded && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-semibold mb-3 animate-pulse">
                      <AlertTriangle size={14} />
                      <span>Warning: Limit exceeded by ₹{(b.spent - b.limit).toLocaleString('en-IN')}!</span>
                    </div>
                  )}

                  {!isExceeded && b.usedPercent > 85 && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold mb-3">
                      <AlertTriangle size={14} />
                      <span>Caution: Budget almost exhausted (85%+)</span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-end justify-between text-xs">
                    <span className="text-gray-500 dark:text-slate-400 font-medium">
                      ₹{b.spent.toLocaleString('en-IN')} / ₹{b.limit.toLocaleString('en-IN')} used
                    </span>
                    <span className={`font-bold ${isExceeded ? 'text-red-500' : 'text-gray-700 dark:text-slate-200'}`}>
                      {b.usedPercent}%
                    </span>
                  </div>

                  {/* Outer track */}
                  <div className="w-full h-3.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    {/* Progress fill */}
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${progress}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-gray-400 dark:text-slate-500">
                      Remaining:
                    </span>
                    <span className={`font-bold ${isExceeded ? 'text-red-500' : 'text-emerald-500 dark:text-emerald-400'}`}>
                      {isExceeded ? '-' : ''}₹{Math.abs(b.remaining).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-fade-in">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <PiggyBank size={20} className="text-indigo-600 dark:text-indigo-400" />
                <span>{editingBudget ? 'Update Budget Cap' : 'Create Budget Cap'}</span>
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Category
                </label>
                <select
                  disabled={editingBudget !== null}
                  {...register('category')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-850 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none rounded-2xl dark:text-white disabled:opacity-50"
                >
                  {editingBudget ? (
                    <option value={editingBudget.category}>{editingBudget.category}</option>
                  ) : (
                    remainingCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Limit */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Monthly Limit Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  {...register('limit', {
                    required: 'Limit amount is required',
                    min: { value: 1, message: 'Limit must be greater than zero' },
                  })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-850 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none rounded-2xl dark:text-white"
                />
                {errors.limit && (
                  <p className="text-xs text-rose-500 font-medium">{errors.limit.message}</p>
                )}
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
                  ) : editingBudget ? (
                    'Update Cap'
                  ) : (
                    'Set Cap'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        title="Remove Budget Cap"
        message="Are you sure you want to remove this budget boundary? You will no longer receive warnings if your spending in this category increases."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
        isLoading={submitLoading}
      />
    </div>
  );
};

export default BudgetsPage;
