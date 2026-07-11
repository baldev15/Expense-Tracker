import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, TrendingUp, ShieldCheck, PieChart, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      title: 'Automated Budget Checks',
      description: 'Set custom spending caps by category and receive alerts before you overshoot.',
      icon: ShieldCheck,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      title: 'Detailed Analytical Reports',
      description: 'Filter insights by day, week, month, or year with detailed charts on spend habits.',
      icon: PieChart,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'Global Search & Export',
      description: 'Find past receipts instantly and download your full logs in CSV spreadsheet format.',
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-gray-100 dark:border-slate-800/60 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-lg shadow-md shadow-indigo-200 dark:shadow-none">
            S
          </div>
          <span className="text-lg font-bold tracking-tight">Smart Expense</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none transition"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-20 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 text-xs font-semibold mb-6 animate-fade-in">
          <Sparkles size={14} />
          <span>Intelligent Personal Finance Assistant</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-6">
          Take Control of Your Money with <br />
          <span className="bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
            Smart Expense Tracker
          </span>
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Monitor your income streams, manage daily purchases, create monthly budgets, and see visual summaries in a secure, dark-mode dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all group"
          >
            <span>Start Tracking Now</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400 bg-white hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-800 transition"
          >
            <span>Access Demo Dashboard</span>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 w-full text-left mt-10">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
              >
                <div className={`p-3 rounded-2xl w-fit ${feat.color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-gray-100 dark:border-slate-900/60 max-w-7xl mx-auto w-full">
        &copy; {new Date().getFullYear()} Smart Expense Tracker. Created for pairs programming. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
