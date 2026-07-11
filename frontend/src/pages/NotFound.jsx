import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl p-8 text-center space-y-6 animate-fade-in">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 mx-auto shadow-sm">
          <ShieldAlert size={36} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Page Not Found</h2>
          <p className="text-sm text-gray-400 dark:text-slate-400">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none transition w-full"
        >
          <Home size={18} />
          <span>Back to Safety</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
