import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Calendar, Key, ShieldCheck, CreditCard, UserCheck, TrendingUp, TrendingDown } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, changePassword, triggerAppNotification } = useAuth();
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, count: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPass, setLoadingPass] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordVal = watch('newPassword');

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const [dashRes, incomeRes, expenseRes] = await Promise.all([
          API.get('/dashboard'),
          API.get('/incomes'),
          API.get('/expenses?limit=100000'),
        ]);

        if (dashRes.data.success && incomeRes.data.success && expenseRes.data.success) {
          const cards = dashRes.data.data.cards;
          const totalTransactions = incomeRes.data.count + expenseRes.data.total;
          setStats({
            totalIncome: cards.totalIncome,
            totalExpense: cards.totalExpense,
            count: totalTransactions,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchUserStats();
  }, []);

  const handlePasswordChangeSubmit = async (data) => {
    setLoadingPass(true);
    const result = await changePassword(data.currentPassword, data.newPassword);
    setLoadingPass(false);
    if (result && result.success) {
      reset();
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Profile Details</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Manage your personal credentials, view account health logs, and change your password.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card & Quick Stats */}
        <div className="space-y-6 lg:col-span-1">
          {/* Avatar and name */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name}`}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-2 border-indigo-100 bg-indigo-50 dark:border-slate-700 shadow-sm mb-4"
            />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h3>
            <p className="text-sm text-gray-400 dark:text-slate-400 mb-6">{user?.email}</p>

            <div className="w-full pt-6 border-t border-gray-50 dark:border-slate-800/60 text-left space-y-3.5">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                <Mail size={16} className="text-gray-400" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                <Calendar size={16} className="text-gray-400" />
                <span>
                  Joined:{' '}
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick statistics */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-5">
            <h4 className="font-bold text-sm text-gray-800 dark:text-white border-b border-gray-50 dark:border-slate-850 pb-2">
              Account Statistics
            </h4>
            
            {loadingStats ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 w-full bg-gray-100 dark:bg-slate-800 rounded" />
                <div className="h-6 w-full bg-gray-100 dark:bg-slate-800 rounded" />
                <div className="h-6 w-full bg-gray-100 dark:bg-slate-800 rounded" />
              </div>
            ) : (
              <div className="space-y-4 text-xs font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-indigo-500" />
                    Total Transactions
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">{stats.count}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-emerald-500" />
                    Lifetime Inflow
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{stats.totalIncome.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                    <TrendingDown size={14} className="text-rose-500" />
                    Lifetime Outflow
                  </span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    ₹{stats.totalExpense.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Update Password Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Key size={20} className="text-indigo-650 text-indigo-600" />
              <span>Change Account Password</span>
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-400">
              Ensure your account is protected by setting a strong secure password.
            </p>

            <form onSubmit={handleSubmit(handlePasswordChangeSubmit)} className="space-y-5 pt-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('currentPassword', {
                    required: 'Current password is required',
                  })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-850 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none rounded-2xl dark:text-white"
                />
                {errors.currentPassword && (
                  <p className="text-xs text-rose-500 font-medium">{errors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters long',
                    },
                  })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-850 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none rounded-2xl dark:text-white"
                />
                {errors.newPassword && (
                  <p className="text-xs text-rose-500 font-medium">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your new password',
                    validate: (val) => val === newPasswordVal || 'Passwords do not match',
                  })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-850 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none rounded-2xl dark:text-white"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loadingPass}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all text-sm"
                >
                  {loadingPass ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
