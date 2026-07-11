import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Toast & Notifications logging helper
  const addNotification = (message, type = 'info') => {
    const newNotif = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type, // 'success' | 'error' | 'warning' | 'info'
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotif, ...prev].slice(0, 50)); // Keep last 50

    // Trigger toast based on type
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else if (type === 'warning') toast(message, { icon: '⚠️' });
    else toast(message);
  };

  // Initialize Auth session & Dark mode settings
  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Get token from either localStorage or sessionStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Optionally verify profile with server to keep session fresh
          const res = await API.get('/auth/profile');
          if (res.data.success) {
            setUser(res.data.data);
            const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
            storage.setItem('user', JSON.stringify(res.data.data));
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    const initializeTheme = () => {
      const isDark =
        localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    initializeAuth();
    initializeTheme();
  }, []);

  // Theme Toggle Handler
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Register Handler
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', { name, email, password });
      if (res.data.success) {
        const { token, ...userData } = res.data.data;
        
        // Default to localStorage for registrations
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        addNotification(`Welcome to Smart Expense Tracker, ${userData.name}!`, 'success');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      addNotification(msg, 'error');
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Login Handler (with "Remember Me")
  const login = async (email, password, rememberMe) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, ...userData } = res.data.data;

        // Remember Me: store in localStorage (persistent), else sessionStorage (tab lifecycle)
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', token);
        storage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        addNotification(`Welcome back, ${userData.name}!`, 'success');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      addNotification(msg, 'error');
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout Handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    addNotification('Logged out successfully', 'info');
  };

  // Update Profile on Password Change
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await API.put('/auth/password', { currentPassword, newPassword });
      if (res.data.success) {
        addNotification('Password updated successfully', 'success');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Password update failed';
      addNotification(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // Trigger Notifications programmatically
  const triggerAppNotification = (message, type) => {
    addNotification(message, type);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        darkMode,
        notifications,
        toggleDarkMode,
        register,
        login,
        logout,
        changePassword,
        triggerAppNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
