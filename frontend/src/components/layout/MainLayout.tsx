// src/components/layout/MainLayout.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  PiggyBank,
  Calculator,
  Settings,
  LogOut,
  Menu,
  Bell,
  User,
  Search,
  Moon,
  Sun,
  HelpCircle,
  Brain,
  GraduationCap,
  Flag,
  Map,
  ChevronDown,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PageTransition from '@/components/shared/PageTransition';
import { useNotifications } from '@/contexts/NotificationsContext';
import CurrencySwitcher from '@/components/shared/CurrencySwitcher';

interface NavItem {
  path: string;
  name: string;
  icon: any;
  badge?: number;
  color?: string;
}

const navItems: NavItem[] = [
  { path: '/', name: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-600 to-blue-400' },
  { path: '/transactions', name: 'Transactions', icon: Wallet, color: 'from-green-600 to-green-400' },
  { path: '/savings', name: 'Savings', icon: PiggyBank, color: 'from-purple-600 to-purple-400' },
  { path: '/investments', name: 'Investments', icon: TrendingUp, color: 'from-pink-600 to-pink-400' },
  { path: '/calculators', name: 'Calculators', icon: Calculator, color: 'from-yellow-600 to-yellow-400' },
  { path: '/education', name: 'Education', icon: GraduationCap, color: 'from-indigo-600 to-indigo-400' },
  { path: '/ai-coach', name: 'Malkia AI', icon: Brain, color: 'from-red-600 to-red-400', badge: 3 },
];

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });
  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mpesaTooltipOpen, setMpesaTooltipOpen] = useState(false);


  // Live clock — updates every second
  const [now, setNow] = useState(new Date());

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Keep darkMode state in sync with <html> class changes ───
  // (e.g. if another tab toggles theme, or user's OS theme changes)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setDarkMode(isDark);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // ─── Close dropdowns on outside click / Esc ───
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        notificationsOpen &&
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }

      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotificationsOpen(false);
        setUserMenuOpen(false);
      }
    };

    if (notificationsOpen || userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [notificationsOpen, userMenuOpen]);

  useEffect(() => {
    setSidebarOpen(false);
    setNotificationsOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Live clock — tick every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Global keyboard shortcuts: Ctrl+K → focus search, Esc → close everything
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setNotificationsOpen(false);
        setUserMenuOpen(false);
        setMpesaTooltipOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('thebase.theme', next ? 'dark' : 'light');
    } catch (e) {
      // localStorage might be blocked
    }
  };



  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
{/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <Link to="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30"
              >
                <span className="text-white font-bold text-xl">B</span>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  The Base
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">v2.0.0 • Kenya</p>
              </div>
            </Link>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <Card variant="glass" className="p-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  F
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">Francis</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Premium Member</p>
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <User size={16} className="text-gray-500" />
                </button>
              </div>
            </Card>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-xl transition-all',
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <Link to="/settings">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                <Settings size={20} />
                <span className="font-medium">Settings</span>
              </motion.div>
            </Link>
            <Link to="/help">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                <HelpCircle size={20} />
                <span className="font-medium">Help & Support</span>
              </motion.div>
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Header */}
        <header
          className={cn(
            'sticky top-0 z-30 transition-all duration-300',
            'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl',
            scrolled && 'shadow-lg'
          )}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left section */}
              <div className="flex items-center space-x-4 flex-shrink-0">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  aria-label="Toggle sidebar"
                >
                  <Menu size={24} />
                </button>

                {/* Breadcrumb */}
                <div className="hidden md:block">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {now.toLocaleString('en-KE', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })}
                  </p>
                </div>
              </div>

              {/* Center - Search */}
              <div className="hidden md:flex flex-1 max-w-md mx-auto">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search transactions, goals, or ask Malkia..."
                    className="w-full pl-10 pr-16 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white placeholder:text-gray-400 text-sm"
                  />
                  <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                    ⌘K
                  </kbd>
                </div>
              </div>

              {/* Right section */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* M-Pesa Status — clickable tooltip */}
                <div className="hidden sm:block relative">
                  <button
                    onClick={() => setMpesaTooltipOpen(!mpesaTooltipOpen)}
                    onMouseEnter={() => setMpesaTooltipOpen(true)}
                    onMouseLeave={() => setMpesaTooltipOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">M-Pesa Live</span>
                  </button>
                  <AnimatePresence>
                    {mpesaTooltipOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <Check size={14} className="text-green-400" />
                          <span className="font-semibold">Safaricom Daraja</span>
                        </div>
                        <p className="text-gray-300">Connected via M-Pesa API</p>
                        <p className="text-gray-300 mt-1">Last sync: 2 minutes ago</p>
                        <p className="text-gray-400 mt-2 text-[10px]">Auto-sync enabled • 12 new transactions</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Currency Switcher */}
                <div className="hidden sm:block">
                  <CurrencySwitcher variant="compact" />
                </div>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Toggle dark mode"
                  title={darkMode ? 'Light mode' : 'Dark mode'}
                >
                  {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
                </button>

                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setUserMenuOpen(false);
                    }}
                    className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                          <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllRead}
                              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="p-6 text-center text-sm text-gray-500">No notifications</p>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                className={cn(
                                  'px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors',
                                  !n.read && 'bg-primary-50/50 dark:bg-primary-900/10'
                                )}
                                onClick={() => {
                                  markOneRead(n.id);
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  {!n.read && <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />}
                                  {!n.read && <div className="w-2 flex-shrink-0" />}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{n.timestamp}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 text-center">
                          <button
                            onClick={() => {
                              setNotificationsOpen(false);
                              navigate('/notifications');
                            }}
                            className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                          >
                            View all notifications
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center space-x-2 p-1.5 pr-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-400 rounded-lg flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-gray-900 dark:text-white">
                      Francis
                    </span>
                    <ChevronDown
                      size={14}
                      className={cn(
                        'hidden lg:block text-gray-400 transition-transform',
                        userMenuOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                          <p className="font-semibold text-gray-900 dark:text-white">Francis Kamau</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">francis@example.com</p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-medium rounded-full">
                            ⭐ Premium Member
                          </span>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <User size={16} />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Settings size={16} />
                            <span>Settings</span>
                          </Link>
                          <Link
                            to="/help"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <HelpCircle size={16} />
                            <span>Help & Support</span>
                          </Link>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-800 py-1">
                          <button
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <LogOut size={16} />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative px-4 sm:px-6 lg:px-8 py-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 The Base - Your Financial Command Center. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Flag size={16} className="text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Made with ❤️ for Kenya</span>
              <Map size={16} className="text-gray-400" />
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
