import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Edit2, TrendingUp, Calendar, FileText, X } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/Layout/ConfirmationModal';
import { TableSkeleton } from '../components/Layout/LoadingSkeleton';

const IncomePage = () => {
  const { triggerAppNotification } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
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
      source: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const fetchIncomes = async () => {
    try {
      const res = await API.get('/incomes');
      if (res.data.success) {
        setIncomes(res.data.data);
        const sum = res.data.data.reduce((acc, item) => acc + item.amount, 0);
        setTotalIncome(sum);
      }
    } catch (error) {
      triggerAppNotification('Failed to fetch income logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const openAddModal = () => {
    setEditingIncome(null);
    reset({
      amount: '',
      source: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsFormOpen(true);
  };

  const openEditModal = (income) => {
    setEditingIncome(income);
    setValue('amount', income.amount);
    setValue('source', income.source);
    setValue('date', new Date(income.date).toISOString().split('T')[0]);
    setValue('notes', income.notes || '');
    setIsFormOpen(true);
  };

  const openDeleteDialog = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitLoading(true);
    try {
      if (editingIncome) {
        // Edit flow
        const res = await API.put(`/incomes/${editingIncome._id}`, formData);
        if (res.data.success) {
          triggerAppNotification('Income record updated', 'success');
          setIsFormOpen(false);
          fetchIncomes();
        }
      } else {
        // Create flow
        const res = await API.post('/incomes', formData);
        if (res.data.success) {
          triggerAppNotification('Income stream added!', 'success');
          setIsFormOpen(false);
          fetchIncomes();
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
      const res = await API.delete(`/incomes/${deletingId}`);
      if (res.data.success) {
        triggerAppNotification('Income stream deleted', 'success');
        setIsDeleteOpen(false);
        fetchIncomes();
      }
    } catch (error) {
      triggerAppNotification('Failed to delete income stream', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Inflows & Income</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Log and manage your salaries, freelancing, dividends and other revenues.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Add Income Stream</span>
        </button>
      </div>

      {/* Summary Stat Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
              Total Recorded Income
            </span>
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹{totalIncome.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-2xl">
            <TrendingUp size={28} />
          </div>
        </div>
      </div>

      {/* Table section */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 dark:border-slate-800">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Inflow Statements</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-800/30">
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Notes</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40 text-sm">
                {incomes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">
                      No income records found. Click 'Add Income Stream' to log one.
                    </td>
                  </tr>
                ) : (
                  incomes.map((inc) => (
                    <tr key={inc._id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/10">
                      <td className="px-6 py-4 font-semibold text-gray-800 dark:text-slate-200">
                        {inc.source}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400 max-w-xs truncate">
                        {inc.notes || <span className="italic text-gray-300 dark:text-slate-600">No notes</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-400 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span>
                            {new Date(inc.date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{inc.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(inc)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Edit Inflow"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(inc._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Delete Inflow"
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
        </div>
      )}

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-fade-in">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" />
                <span>{editingIncome ? 'Edit Income Details' : 'Add Income Stream'}</span>
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

              {/* Source */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Source
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salary, Freelance Work"
                  {...register('source', {
                    required: 'Source is required',
                    trim: true,
                  })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-850 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none rounded-2xl dark:text-white"
                />
                {errors.source && (
                  <p className="text-xs text-rose-500 font-medium">{errors.source.message}</p>
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

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Notes
                </label>
                <textarea
                  placeholder="Additional details..."
                  rows="3"
                  {...register('notes', {
                    trim: true,
                  })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-850 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none rounded-2xl dark:text-white resize-none"
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
                  ) : editingIncome ? (
                    'Save Changes'
                  ) : (
                    'Add Income'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        title="Delete Income Stream"
        message="Are you sure you want to delete this income stream? This will permanently subtract the amount from your total balance and statistics."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
        isLoading={submitLoading}
      />
    </div>
  );
};

export default IncomePage;
