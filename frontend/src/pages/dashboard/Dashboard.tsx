import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Award,
  AlertCircle,
  Sparkles,
  Zap,
  Shield,
  Globe,
  Battery,
  Signal,
  Smartphone,
  Wifi,
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Share2,
  MoreVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Bell,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  LogOut,
  User,
  Menu,
  X,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Clock,
  DollarSign,
  Percent,
  Activity,
  Flame,
  Star,
  Gift,
  Coffee,
  ShoppingBag,
  Car,
  Home,
  Heart,
  BookOpen,
  GraduationCap,
  Briefcase,
  Users,
  MessageSquare,
  FileText,
  Printer,
  Camera,
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Grid,
  List,
  Layers,
  Compass,
  Navigation,
  Map,
  Cloud,
  CloudRain,
  Sun as SunIcon,
  Wind,
  Gauge,
  Thermometer,
} from 'lucide-react';
import ContributionGrid from '@/components/contribution-grid/ContributionGrid';
import MpesaStatus from '@/components/shared/MpesaStatus';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { generateMockContributionData, mockQuotes, mockGoals, mockBudgets } from '@/data/mockData';
import { DailyActivity, FinancialQuote } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';
import { useHotkeys } from 'react-hotkeys-hook';
import Tilt from 'react-parallax-tilt';
import { useSpring as useSpringAnimation, animated } from '@react-spring/web';
import { VictoryPie, VictoryLine, VictoryChart, VictoryTheme, VictoryAxis } from 'victory';

// Mock weather data for Kenyan cities
const weatherData = {
  nairobi: { temp: 22, condition: 'Partly Cloudy', icon: Cloud, color: 'from-blue-400 to-blue-600' },
  mombasa: { temp: 30, condition: 'Sunny', icon: SunIcon, color: 'from-yellow-400 to-orange-500' },
  kisumu: { temp: 26, condition: 'Light Rain', icon: CloudRain, color: 'from-gray-400 to-gray-600' },
};

const Dashboard: React.FC = () => {
  // State management
  const [contributionData, setContributionData] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DailyActivity | null>(null);
  const [quote, setQuote] = useState<FinancialQuote | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [notifications, setNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCity, setSelectedCity] = useState<'nairobi' | 'mombasa' | 'kisumu'>('nairobi');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Motion values for scroll effects
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);
  const headerBlur = useTransform(scrollYProgress, [0, 0.1], [0, 8]);
  const headerScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.98]);
  
  // Spring animations
  const springProps = useSpringAnimation({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 60 },
  });

  // Mouse position for 3D effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    }
  }, []);

  // Keyboard shortcuts
  useHotkeys('ctrl+k', () => {
    setShowSearch(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  });

  useHotkeys('ctrl+b', () => {
    setBalanceVisible(!balanceVisible);
  });

  useHotkeys('ctrl+d', () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  });

  useHotkeys('ctrl+f', () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  useHotkeys('ctrl+r', () => {
    handleRefresh();
  });

  useHotkeys('esc', () => {
    setShowSearch(false);
    setSelectedDay(null);
  });

  // Effects
  useEffect(() => {
    // Load mock data
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const data = generateMockContributionData(new Date().getFullYear());
      setContributionData(data);
      setLoading(false);
      
      // Trigger confetti on first load
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    };
    
    loadData();
    
    // Set random quote
    const randomQuote = mockQuotes[Math.floor(Math.random() * mockQuotes.length)];
    setQuote(randomQuote);

    // Hide welcome message after 5 seconds
    const welcomeTimer = setTimeout(() => setShowWelcome(false), 5000);
    
    // Check for notifications
    const notificationTimer = setInterval(() => {
      setNotifications(prev => Math.min(prev + 1, 9));
    }, 30000);

    return () => {
      clearTimeout(welcomeTimer);
      clearInterval(notificationTimer);
    };
  }, []);

  // Stats data with Kenyan context
  const stats = [
    {
      title: 'Total Balance',
      value: 245800,
      change: '+12.5%',
      trend: 'up',
      icon: Wallet,
      color: 'from-blue-600 to-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Monthly Income',
      value: 85000,
      change: '+5.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-600 to-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Monthly Expenses',
      value: 52300,
      change: '-3.1%',
      trend: 'down',
      icon: TrendingDown,
      color: 'from-red-600 to-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950',
      textColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Savings Rate',
      value: 38.5,
      change: '+2.3%',
      trend: 'up',
      icon: PiggyBank,
      color: 'from-purple-600 to-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      textColor: 'text-purple-600 dark:text-purple-400',
      isPercentage: true,
    },
  ];

  // Recent transactions with Kenyan merchants
  const recentTransactions = [
    { id: 1, description: 'Salary - KPLC', amount: 85000, type: 'income', category: 'Salary', date: '2024-01-15', time: '09:30 AM', icon: Briefcase, merchant: 'KPLC', location: 'Nairobi' },
    { id: 2, description: 'M-PESA to KCB Savings', amount: -5000, type: 'expense', category: 'Savings', date: '2024-01-14', time: '02:15 PM', icon: PiggyBank, merchant: 'KCB', location: 'Mombasa' },
    { id: 3, description: 'Netflix Subscription', amount: -1450, type: 'expense', category: 'Entertainment', date: '2024-01-13', time: '11:20 AM', icon: Play, merchant: 'Netflix', location: 'Online' },
    { id: 4, description: 'Naivas Supermarket', amount: -3200, type: 'expense', category: 'Groceries', date: '2024-01-12', time: '06:45 PM', icon: ShoppingBag, merchant: 'Naivas', location: 'Nairobi' },
    { id: 5, description: 'CIC MMF Investment', amount: -10000, type: 'investment', category: 'Investment', date: '2024-01-11', time: '10:00 AM', icon: TrendingUp, merchant: 'CIC', location: 'Nairobi' },
    { id: 6, description: 'Safaricom Airtime', amount: -500, type: 'expense', category: 'Airtime', date: '2024-01-10', time: '08:30 AM', icon: Smartphone, merchant: 'Safaricom', location: 'Online' },
    { id: 7, description: 'Uber - Westlands', amount: -850, type: 'expense', category: 'Transport', date: '2024-01-09', time: '07:15 PM', icon: Car, merchant: 'Uber', location: 'Nairobi' },
  ];

  // Kenyan achievements
  const achievements = [
    { id: 1, name: 'Saving Shark', icon: '🦈', progress: 12, total: 52, color: 'from-yellow-400 to-yellow-600', description: '52-week money challenge' },
    { id: 2, name: 'M-Pesa Master', icon: '📱', progress: 30, total: 30, color: 'from-green-400 to-green-600', completed: true, description: '30 day M-Pesa streak' },
    { id: 3, name: 'Budget King', icon: '👑', progress: 1, total: 1, color: 'from-purple-400 to-purple-600', completed: true, description: 'No-spend weekend' },
    { id: 4, name: 'Investment Guru', icon: '📈', progress: 3, total: 10, color: 'from-blue-400 to-blue-600', description: 'MMF investments' },
    { id: 5, name: 'Fuliza Fighter', icon: '⚔️', progress: 0, total: 1, color: 'from-red-400 to-red-600', description: 'Avoid Fuliza for a month' },
    { id: 6, name: 'Sacco Star', icon: '⭐', progress: 5, total: 12, color: 'from-yellow-400 to-yellow-600', description: 'Sacco contributions' },
  ];

  // Kenyan financial tips
  const tips = [
    'Did you know? MMFs in Kenya have averaged 8-10% returns over the past year',
    'Set aside 20% of your income for savings - "Pesa ni mzizi"',
    'Compare Sacco dividends before investing - some offer up to 12%',
    'Use M-PESA round-up feature to save automatically',
    'Fuliza interest is 1% per day - try to clear within 3 days',
    'KUSCCO offers some of the best Sacco rates in Kenya',
  ];

  // Handlers
  const handleDayClick = (day: DailyActivity) => {
    setSelectedDay(day);
  };

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const data = generateMockContributionData(new Date().getFullYear());
    setContributionData(data);
    setQuote(mockQuotes[Math.floor(Math.random() * mockQuotes.length)]);
    setIsRefreshing(false);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'The Base - My Financial Dashboard',
        text: 'Check out my financial progress on The Base!',
        url: window.location.href,
      });
    } catch (error) {
      console.log('Share failed', error);
    }
  };

  const handleExport = () => {
    // Simulate export
    alert('Exporting your financial data...');
  };

  // Get weather icon for selected city
  const WeatherIcon = weatherData[selectedCity].icon;

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          colors={['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
        />
      )}
      
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
      >
        {/* Animated background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: mouseX.get() * 100,
              y: mouseY.get() * 100,
            }}
            transition={{ type: 'spring', stiffness: 50 }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
          />
          <motion.div
            animate={{
              x: mouseX.get() * -100,
              y: mouseY.get() * -100,
            }}
            transition={{ type: 'spring', stiffness: 50 }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
          />
          <motion.div
            animate={{
              x: mouseX.get() * 50,
              y: mouseY.get() * -50,
            }}
            transition={{ type: 'spring', stiffness: 50 }}
            className="absolute top-40 left-1/3 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"
          />
        </div>

        {/* Premium Header with Glass Effect */}
        <motion.header
          ref={headerRef}
          style={{
            opacity: headerOpacity,
            backdropFilter: `blur(${headerBlur}px)`,
            scale: headerScale,
          }}
          className="sticky top-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              {/* Logo and Brand */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4"
              >
                <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 cursor-pointer"
                  >
                    <span className="text-white font-bold text-xl md:text-2xl">B</span>
                  </motion.div>
                </Tilt>
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent"
                  >
                    The Base
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs md:text-sm text-gray-500 dark:text-gray-400"
                  >
                    Financial Command Center
                  </motion.p>
                </div>
              </motion.div>

              {/* Search Bar - Desktop */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="hidden md:flex items-center flex-1 max-w-md mx-4"
              >
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search transactions or ask Malkia... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                    ⌘K
                  </div>
                </div>
              </motion.div>

              {/* Right Side Icons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 md:space-x-4"
              >
                {/* Weather Widget */}
                <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} perspective={1000}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-xl shadow-lg cursor-pointer"
                    onClick={() => {
                      const cities = ['nairobi', 'mombasa', 'kisumu'] as const;
                      const next = cities[(cities.indexOf(selectedCity) + 1) % cities.length];
                      setSelectedCity(next);
                    }}
                  >
                    <WeatherIcon size={18} />
                    <span className="font-medium">{weatherData[selectedCity].temp}°C</span>
                    <span className="text-xs opacity-80">{weatherData[selectedCity].condition}</span>
                  </motion.div>
                </Tilt>

                {/* M-Pesa Status */}
                <MpesaStatus />

                {/* Notifications */}
                <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} perspective={1000}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative cursor-pointer"
                    onClick={() => setNotifications(0)}
                  >
                    <div className="p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors">
                      <Bell size={20} className="text-gray-700 dark:text-gray-300" />
                    </div>
                    {notifications > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                      >
                        {notifications}
                      </motion.span>
                    )}
                  </motion.div>
                </Tilt>

                {/* Dark Mode Toggle */}
                <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} perspective={1000}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      setDarkMode(!darkMode);
                      document.documentElement.classList.toggle('dark');
                    }}
                  >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </motion.div>
                </Tilt>

                {/* User Menu */}
                <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} perspective={1000}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 cursor-pointer bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-xl p-1.5 pr-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-400 rounded-lg flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                    <span className="hidden md:block text-sm font-medium">Francis</span>
                    <ChevronDown size={16} className="hidden md:block text-gray-500" />
                  </motion.div>
                </Tilt>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-0 right-0 z-40 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 md:hidden"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
          {/* Welcome Banner */}
          <AnimatePresence>
            {showWelcome && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 rounded-2xl shadow-xl"
              >
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
                <div className="relative p-6 md:p-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      Karibu, Francis! 👋
                    </h2>
                    <p className="text-white/90 text-sm md:text-base">
                      Your financial health score is <span className="font-bold">85%</span> - Keep it up! 
                      You're doing better than 78% of users.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRefresh}
                    className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl backdrop-blur-sm transition-colors"
                  >
                    <RefreshCw size={20} className={cn(isRefreshing && 'animate-spin')} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats with 3D Tilt Effect */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000} glareEnable={true} glareMaxOpacity={0.1}>
                    <Card variant="glass" interactive className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {balanceVisible ? (
                              <AnimatedCounter
                                value={stat.value}
                                format={!stat.isPercentage}
                                suffix={stat.isPercentage ? '%' : ''}
                                className="text-2xl font-bold text-gray-900 dark:text-white"
                              />
                            ) : (
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">•••••</span>
                            )}
                          </div>
                        </div>
                        <div className={cn('p-3 rounded-xl bg-gradient-to-br', stat.color)}>
                          <Icon className="text-white" size={24} />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        {stat.trend === 'up' ? (
                          <ArrowUpRight className="text-green-500" size={20} />
                        ) : (
                          <ArrowDownRight className="text-red-500" size={20} />
                        )}
                        <span className={cn(
                          'text-sm font-medium ml-1',
                          stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        )}>
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          vs last month
                        </span>
                      </div>
                    </Card>
                  </Tilt>
                </motion.div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Contribution Grid and Chart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contribution Grid */}
              {loading ? (
                <Card variant="glass" className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="grid grid-cols-7 gap-1">
                      {[...Array(35)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      ))}
                    </div>
                  </div>
                </Card>
              ) : (
                <ContributionGrid 
                  data={contributionData} 
                  year={new Date().getFullYear()} 
                  onDayClick={handleDayClick}
                />
              )}

              {/* Spending Chart */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Spending Overview
                  </h3>
                  <div className="flex items-center space-x-2">
                    {['1W', '1M', '3M', '1Y'].map((timeframe) => (
                      <button
                        key={timeframe}
                        onClick={() => setSelectedTimeframe(timeframe)}
                        className={cn(
                          'px-3 py-1 text-sm rounded-lg transition-colors',
                          selectedTimeframe === timeframe
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        {timeframe}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-64">
                  <VictoryChart
                    theme={VictoryTheme.material}
                    domainPadding={20}
                    width={600}
                    height={250}
                  >
                    <VictoryAxis
                      tickFormat={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                      style={{
                        tickLabels: { fill: '#6B7280', fontSize: 12 },
                      }}
                    />
                    <VictoryAxis
                      dependentAxis
                      tickFormat={(x) => `KES ${x/1000}k`}
                      style={{
                        tickLabels: { fill: '#6B7280', fontSize: 12 },
                      }}
                    />
                    <VictoryLine
                      data={[
                        { x: 1, y: 4500 },
                        { x: 2, y: 6200 },
                        { x: 3, y: 3800 },
                        { x: 4, y: 7100 },
                        { x: 5, y: 5300 },
                        { x: 6, y: 8900 },
                        { x: 7, y: 4200 },
                      ]}
                      style={{
                        data: { stroke: '#0ea5e9', strokeWidth: 3 },
                      }}
                      animate={{
                        duration: 2000,
                        onLoad: { duration: 1000 },
                      }}
                    />
                  </VictoryChart>
                </div>
              </Card>

              {/* Selected Day Transactions */}
              <AnimatePresence>
                {selectedDay && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card variant="glass" className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {new Date(selectedDay.date).toLocaleDateString('en-KE', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <button
                          onClick={() => setSelectedDay(null)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      {selectedDay.transactions.length > 0 ? (
                        <div className="space-y-3">
                          {selectedDay.transactions.map((transaction) => (
                            <motion.div
                              key={transaction.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className={cn(
                                  'p-2 rounded-lg',
                                  transaction.amount > 0 
                                    ? 'bg-green-100 dark:bg-green-900/20' 
                                    : 'bg-red-100 dark:bg-red-900/20'
                                )}>
                                  <CreditCard className={
                                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                                  } size={18} />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {transaction.description}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {transaction.category}
                                  </p>
                                </div>
                              </div>
                              <span className={cn(
                                'font-semibold',
                                transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                              )}>
                                {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                          No transactions on this day
                        </p>
                      )}
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column - Goals, Budget, Achievements */}
            <div className="space-y-6">
              {/* Quote of the Day */}
              {quote && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card variant="gradient" className="p-6 text-white">
                    <div className="flex items-start space-x-3">
                      <Sparkles className="flex-shrink-0" size={24} />
                      <div>
                        <p className="text-lg font-medium italic">"{quote.text}"</p>
                        <p className="text-sm mt-2 opacity-90">— {quote.author}</p>
                        {quote.language === 'sw' && (
                          <span className="inline-block mt-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                            Kiswahili
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Goals Progress */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Goals Progress
                  </h3>
                  <Target className="text-gray-400" size={20} />
                </div>
                <div className="space-y-6">
                  {mockGoals.map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{goal.name}</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="progress-bar-fill"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Budget Overview */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Monthly Budget
                  </h3>
                  <AlertCircle className="text-gray-400" size={20} />
                </div>
                <div className="space-y-4">
                  {mockBudgets.map((budget, index) => {
                    const percentage = (budget.spent / budget.amount) * 100;
                    const isOverBudget = percentage > 100;
                    const isCloseToLimit = percentage > 80 && percentage <= 100;
                    
                    return (
                      <motion.div
                        key={budget.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 dark:text-gray-300">{budget.category}</span>
                          <span className={cn(
                            'font-medium',
                            isOverBudget && 'text-red-600',
                            isCloseToLimit && 'text-yellow-600',
                            !isOverBudget && !isCloseToLimit && 'text-green-600'
                          )}>
                            {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={cn(
                              'progress-bar-fill',
                              isOverBudget && 'progress-bar-fill-danger',
                              isCloseToLimit && 'progress-bar-fill-warning',
                              !isOverBudget && !isCloseToLimit && 'progress-bar-fill-success'
                            )}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>

              {/* Kenyan Tip */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card variant="mpesa" className="p-6 text-white">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Did you know? 🇰🇪</h4>
                      <p className="text-sm text-white/90">
                        {tips[Math.floor(Math.random() * tips.length)]}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Achievements */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Achievements
                  </h3>
                  <Award className="text-primary-600" size={20} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.slice(0, 4).map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        'p-3 rounded-xl text-center',
                        achievement.completed 
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' 
                          : 'bg-gray-100 dark:bg-gray-800'
                      )}
                    >
                      <div className="text-3xl mb-1">{achievement.icon}</div>
                      <p className={cn(
                        'text-xs font-medium',
                        achievement.completed ? 'text-white' : 'text-gray-900 dark:text-white'
                      )}>
                        {achievement.name}
                      </p>
                      {!achievement.completed && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {achievement.progress}/{achievement.total}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
                <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                  View All Achievements →
                </button>
              </Card>

              {/* Recent Activity Feed */}
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentTransactions.slice(0, 3).map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <div className={cn(
                        'p-2 rounded-lg',
                        transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/20' :
                        transaction.type === 'expense' ? 'bg-red-100 dark:bg-red-900/20' :
                        'bg-purple-100 dark:bg-purple-900/20'
                      )}>
                        <transaction.icon size={16} className={
                          transaction.type === 'income' ? 'text-green-600' :
                          transaction.type === 'expense' ? 'text-red-600' :
                          'text-purple-600'
                        } />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.merchant} • {transaction.location}
                        </p>
                      </div>
                      <span className={cn(
                        'text-sm font-medium',
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Investment Portfolio Section */}
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Investment Portfolio
              </h3>
              <Button variant="ghost" size="sm" icon={<ChevronRight size={16} />} iconPosition="right">
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'CIC MMF', amount: 150000, returns: '+8.5%', color: 'from-green-600 to-green-400' },
                { name: 'KCB Sacco', amount: 85000, returns: '+12%', color: 'from-blue-600 to-blue-400' },
                { name: 'NSE Stocks', amount: 45000, returns: '+5.2%', color: 'from-purple-600 to-purple-400' },
              ].map((investment, index) => (
                <motion.div
                  key={investment.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="glass" className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{investment.name}</span>
                      <span className={cn('text-sm font-medium text-green-600')}>{investment.returns}</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(investment.amount)}
                    </p>
                    <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '60%' }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        className={cn('h-full rounded-full bg-gradient-to-r', investment.color)}
                      />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Download, label: 'Export Data', onClick: handleExport },
              { icon: Share2, label: 'Share Progress', onClick: handleShare },
              { icon: Printer, label: 'Print Report', onClick: () => window.print() },
              { icon: Camera, label: 'Scan Receipt', onClick: () => alert('Scan receipt feature coming soon!') },
            ].map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all"
              >
                <action.icon className="mx-auto mb-2 text-primary-600" size={24} />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </main>
      </motion.div>
    </>
  );
};

export default Dashboard;
