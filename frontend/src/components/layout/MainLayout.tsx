// src/components/layout/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  PiggyBank,
  Calculator,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Search,
  Moon,
  Sun,
  ChevronRight,
  Home,
  BarChart3,
  Target,
  Users,
  HelpCircle,
  Gift,
  Award,
  Sparkles,
  Zap,
  Brain,
  GraduationCap,
  Landmark,
  Building,
  CreditCard,
  Smartphone,
  Globe,
  Flag,
  Map,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

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
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(5);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close sidebar on route change (mobile)
    setSidebarOpen(false);
  }, [location]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
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
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 20 }}
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 shadow-2xl',
          'lg:translate-x-0 lg:static lg:z-0 transition-transform duration-300'
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
      </motion.aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={cn(
            'sticky top-0 z-30 transition-all duration-300',
            scrolled
              ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg'
              : 'bg-transparent'
          )}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Left section */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <Menu size={24} />
                </button>
                
                {/* Breadcrumb */}
                <div className="hidden md:block">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString('en-KE', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              {/* Center - Search */}
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search transactions, goals, or ask Malkia... (Ctrl+K)"
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                    ⌘K
                  </div>
                </div>
              </div>

              {/* Right section */}
              <div className="flex items-center space-x-2">
                {/* M-Pesa Status */}
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">M-Pesa Live</span>
                  </div>
                </div>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <Bell size={20} />
                  {notifications > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* User Menu (Mobile) */}
                <button className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <User size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
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
