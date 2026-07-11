import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Receipt,
  PiggyBank,
  BarChart3,
  User,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Income', path: '/income', icon: TrendingUp },
    { name: 'Expenses', path: '/expenses', icon: TrendingDown },
    { name: 'Budgets', path: '/budgets', icon: PiggyBank },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const activeStyle =
    'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl bg-indigo-50 text-indigo-600 dark:bg-slate-800/80 dark:text-indigo-400 transition-all';
  const inactiveStyle =
    'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200 transition-all';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-gray-100 bg-white dark:border-slate-800 dark:bg-slate-900 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-lg shadow-md shadow-indigo-200 dark:shadow-none">
              S
            </div>
            <span className="text-lg font-bold text-gray-800 dark:text-white">Smart Expense</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg lg:hidden dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* User preview */}
        {user && (
          <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-50 dark:border-slate-800/40">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full border border-indigo-100 dark:border-slate-700 bg-indigo-50"
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                {user.name}
              </h4>
              <p className="text-xs text-gray-400 dark:text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={() => {
              logout();
              if (window.innerWidth < 1024) toggleSidebar();
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
