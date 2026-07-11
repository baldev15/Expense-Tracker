import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Sun, Moon, Check, AlertTriangle, ShieldAlert, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user, darkMode, toggleDarkMode, notifications } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success':
        return <div className="p-1 rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400"><Check size={14} /></div>;
      case 'error':
        return <div className="p-1 rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/20 dark:text-rose-400"><ShieldAlert size={14} /></div>;
      case 'warning':
        return <div className="p-1 rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400"><AlertTriangle size={14} /></div>;
      default:
        return <div className="p-1 rounded-full bg-blue-50 text-blue-500 dark:bg-blue-950/20 dark:text-blue-400"><Info size={14} /></div>;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
      {/* Left side: Hamburger (Mobile) and Greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 rounded-xl lg:hidden transition-all"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-100">
            Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{user?.name}</span>
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-400">Track and optimize your finances.</p>
        </div>
      </div>

      {/* Right side: Utilities */}
      <div className="flex items-center gap-3">
        {/* Dark Mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 rounded-xl transition-all"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications center */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 rounded-xl transition-all"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-h-[30rem] overflow-y-auto bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl z-50 animate-fade-in">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700/60 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Notifications</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  {notifications.length} New
                </span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-slate-700/40">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400 dark:text-slate-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-4 flex gap-3 hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-all">
                      <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-700 dark:text-slate-300 font-medium leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 block mt-1">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Link */}
        <Link
          to="/profile"
          className="flex items-center gap-2 pl-2 border-l border-gray-100 dark:border-slate-800"
        >
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name}`}
            alt="Avatar"
            className="w-8 h-8 rounded-full border border-indigo-100 dark:border-slate-700 bg-indigo-50"
          />
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
