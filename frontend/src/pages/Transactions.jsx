import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TableSkeleton } from '../components/Layout/LoadingSkeleton';

const TransactionsPage = () => {
  const { triggerAppNotification } = useAuth();
  
  // Data State
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All', 'income', 'expense'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;

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

  const fetchAllTransactions = async () => {
    setLoading(true);
    try {
      // Fetch both incomes and expenses
      const [incomeRes, expenseRes] = await Promise.all([
        API.get('/incomes'),
        API.get('/expenses?limit=100000'), // fetch all expenses
      ]);

      if (incomeRes.data.success && expenseRes.data.success) {
        const incomesFormatted = incomeRes.data.data.map((inc) => ({
          _id: inc._id,
          amount: inc.amount,
          title: inc.source,
          category: 'Income',
          type: 'income',
          date: inc.date,
          paymentMethod: 'Bank Transfer', // default for income
          notes: inc.notes || '',
        }));

        const expensesFormatted = expenseRes.data.data.map((exp) => ({
          _id: exp._id,
          amount: exp.amount,
          title: exp.description,
          category: exp.category,
          type: 'expense',
          date: exp.date,
          paymentMethod: exp.paymentMethod,
          notes: '',
        }));

        const combined = [...incomesFormatted, ...expensesFormatted];
        setTransactions(combined);
        setFilteredTransactions(combined);
      }
    } catch (error) {
      triggerAppNotification('Failed to retrieve transactions history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  // Filter & Sort Logic
  useEffect(() => {
    let result = [...transactions];

    // Global Search
    if (search.trim() !== '') {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.title.toLowerCase().includes(searchLower) ||
          tx.category.toLowerCase().includes(searchLower) ||
          tx.paymentMethod.toLowerCase().includes(searchLower) ||
          tx.notes.toLowerCase().includes(searchLower) ||
          tx.amount.toString().includes(searchLower)
      );
    }

    // Type Filter
    if (typeFilter !== 'All') {
      result = result.filter((tx) => tx.type === typeFilter);
    }

    // Category Filter
    if (categoryFilter !== 'All') {
      result = result.filter((tx) => tx.category === categoryFilter);
    }

    // Sort Logic
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTransactions(result);
    setPage(1); // Reset to page 1 on filter changes
  }, [search, typeFilter, categoryFilter, sortBy, sortOrder, transactions]);

  // Paginated Slicing
  const totalPages = Math.ceil(filteredTransactions.length / limit) || 1;
  const paginatedList = filteredTransactions.slice((page - 1) * limit, page * limit);

  // CSV Export Trigger
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      triggerAppNotification('No transactions to export', 'warning');
      return;
    }

    // Define CSV headers
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Type,Description/Source,Category,Date,Payment Method,Amount,Notes\r\n';

    filteredTransactions.forEach((tx) => {
      const type = tx.type.toUpperCase();
      const title = `"${tx.title.replace(/"/g, '""')}"`;
      const category = tx.category;
      const date = new Date(tx.date).toLocaleDateString('en-IN');
      const payMethod = tx.paymentMethod;
      const amount = tx.amount;
      const notes = `"${tx.notes.replace(/"/g, '""')}"`;

      csvContent += `${type},${title},${category},${date},${payMethod},${amount},${notes}\r\n`;
    });

    // Create a temporary hidden download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `smart_expense_transactions_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerAppNotification('CSV Export downloaded successfully!', 'success');
  };

  const handleSortToggle = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Transaction Logs</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            A comprehensive history of all incoming and outgoing funds.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-5 py-3 border border-indigo-200 text-indigo-600 bg-white hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:text-indigo-400 dark:hover:bg-slate-800/80 font-semibold rounded-2xl transition w-full sm:w-auto"
        >
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Filter size={16} className="text-indigo-655 text-indigo-600" />
          <span>Filter Results</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Global Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search anything..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-slate-800/40 dark:border-slate-700 focus:border-indigo-500 rounded-xl focus:outline-none text-sm dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCategoryFilter('All'); // Reset category when type changes
            }}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 dark:bg-slate-800/40 dark:border-slate-700 focus:border-indigo-500 rounded-xl focus:outline-none text-sm dark:text-white"
          >
            <option value="All">All Types</option>
            <option value="income">Inflows Only (Income)</option>
            <option value="expense">Outflows Only (Expenses)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            disabled={typeFilter === 'income'}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 dark:bg-slate-800/40 dark:border-slate-700 focus:border-indigo-500 rounded-xl focus:outline-none text-sm dark:text-white disabled:opacity-50"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sorting Direction */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSortToggle('date')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border rounded-xl text-xs font-semibold transition-all ${
                sortBy === 'date'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-800 dark:text-indigo-400'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-400'
              }`}
            >
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
              <span>Amt {sortBy === 'amount' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between min-h-[30rem]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-800/30">
                  <th className="px-6 py-4">Title / Description</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40 text-sm">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">
                      No matching transactions found.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/10">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-slate-200">
                            {tx.title}
                          </p>
                          {tx.notes && (
                            <p className="text-xs text-gray-400 dark:text-slate-500 truncate max-w-xs">
                              {tx.notes}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                        {tx.paymentMethod}
                      </td>
                      <td className="px-6 py-4 text-gray-400 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span>
                            {new Date(tx.date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-bold ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-900 dark:text-slate-100'
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

          {/* Pagination */}
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
    </div>
  );
};

export default TransactionsPage;
