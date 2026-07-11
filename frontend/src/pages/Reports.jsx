import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingDown, Award, CalendarDays, PieChart } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
} from 'recharts';
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

const ReportsPage = () => {
  const { darkMode, triggerAppNotification } = useAuth();
  
  // Data State
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('last30days'); // 'today', 'last7days', 'last30days', 'monthly', 'yearly'

  const ranges = [
    { value: 'today', label: 'Today' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'monthly', label: 'This Month' },
    { value: 'yearly', label: 'This Year' },
  ];

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/reports?range=${range}`);
      if (res.data.success) {
        setReport(res.data.data);
      }
    } catch (error) {
      console.error(error);
      triggerAppNotification('Failed to generate report summaries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [range]);

  if (loading || !report) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-gray-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

  const { stats, categoryData, timelineData } = report;

  const strokeColor = darkMode ? '#334155' : '#e2e8f0';
  const textColor = darkMode ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-8">
      {/* Page Header & Range Selectors */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Reports & Analysis</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Generate detailed graphs and statistics on your cash flows.
          </p>
        </div>
        
        {/* Toggle Range buttons */}
        <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-850 shadow-sm w-fit">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                range === r.value
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                  : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Spending */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
              Total Period Spending
            </span>
            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              ₹{stats.totalSpending.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="p-4 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 rounded-2xl">
            <TrendingDown size={24} />
          </div>
        </div>

        {/* Highest Spending Category */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
              Highest Category
            </span>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white truncate max-w-[12rem]">
              {stats.highestCategory.category}
            </h3>
            {stats.highestCategory.amount > 0 && (
              <p className="text-xs text-gray-400 dark:text-slate-400">
                Spent: ₹{stats.highestCategory.amount.toLocaleString('en-IN')}
              </p>
            )}
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 rounded-2xl">
            <Award size={24} />
          </div>
        </div>

        {/* Average Daily Expense */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
              Average Daily Spending
            </span>
            <h3 className="text-2xl font-bold text-indigo-650 text-indigo-600 dark:text-indigo-400">
              ₹{stats.averageDailyExpense.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-2xl">
            <CalendarDays size={24} />
          </div>
        </div>
      </div>

      {/* Graphs */}
      {stats.totalSpending === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm text-center">
          <p className="text-gray-400 dark:text-slate-500 text-sm">
            No spending data recorded for this time range. Add expenses to generate graphs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Spend timeline curve */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 size={16} className="text-indigo-600" />
              <span>Spend Timeline</span>
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorTimeline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
                  <XAxis
                    dataKey="date"
                    stroke={textColor}
                    fontSize={10}
                    tickFormatter={(val) => {
                      // Shorten YYYY-MM-DD to MM-DD
                      const parts = val.split('-');
                      return parts.length > 2 ? `${parts[1]}-${parts[2]}` : val;
                    }}
                    tickLine={false}
                  />
                  <YAxis stroke={textColor} fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      borderColor: strokeColor,
                      borderRadius: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTimeline)"
                    name="Spent Amount"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category distribution */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                <PieChart size={16} className="text-emerald-500" />
                <span>Categories</span>
              </h3>
              <p className="text-xs text-gray-400 dark:text-slate-400 mb-6">Distribution for the range.</p>
            </div>

            <div className="h-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
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
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Category legends list */}
            <div className="space-y-1.5 max-h-[8rem] overflow-y-auto mt-4 pr-1">
              {categoryData.map((item, idx) => (
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
      )}
    </div>
  );
};

export default ReportsPage;
