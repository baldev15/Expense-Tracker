import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded"></div>
        <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
      <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden animate-pulse">
    <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
      <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
      <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
    </div>
    <div className="p-6 space-y-4">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex justify-between items-center py-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
          <div className="h-5 w-20 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm animate-pulse flex flex-col h-80 justify-between">
    <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
    <div className="flex-1 w-full bg-gray-100 dark:bg-slate-700/50 rounded-xl flex items-end gap-4 p-4">
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-t h-[40%]"></div>
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-t h-[75%]"></div>
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-t h-[55%]"></div>
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-t h-[90%]"></div>
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-t h-[30%]"></div>
    </div>
  </div>
);
