import React, { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import { format } from 'date-fns';
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
import EmptyState from '@/components/shared/EmptyState';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { StatCardSkeleton, ChartSkeleton } from '@/components/shared/Skeleton';
import { generateMockContributionData, mockQuotes, mockGoals, mockBudgets } from '@/data/mockData';
import { initialTransactions } from '@/data/transactions';
import { buildContributionData } from '@/utils/contributionData';
import type { DailyActivity, FinancialQuote } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { useFormatCurrency, useCurrency } from '@/contexts/CurrencyContext';
import ExportModal from '@/components/shared/ExportModal';
import toast from 'react-hot-toast';
import { exportToPDF } from '@/utils/export/exportUtils';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';
import { useHotkeys } from 'react-hotkeys-hook';
import Tilt from 'react-parallax-tilt';
import { useSpring as useSpringAnimation, animated } from '@react-spring/web';
import { VictoryPie, VictoryLine, VictoryBar, VictoryScatter, VictoryChart, VictoryTheme, VictoryAxis, VictoryVoronoiContainer, VictoryTooltip } from 'victory';

// Mock weather data for Kenyan cities
const weatherData = {
  nairobi: { temp: 22, condition: 'Partly Cloudy', icon: Cloud, color: 'from-blue-400 to-blue-600' },
  mombasa: { temp: 30, condition: 'Sunny', icon: SunIcon, color: 'from-yellow-400 to-orange-500' },
  kisumu: { temp: 26, condition: 'Light Rain', icon: CloudRain, color: 'from-gray-400 to-gray-600' },
};

// Module-level cache: year → DailyActivity[]
// Uses a plain object to avoid clashing with the lucide-react `Map` icon import.
const contributionCache: Record<number, any[]> = {};

const Dashboard: React.FC = () => {
  // Currency-aware formatter — subscribing here causes re-render on currency change
  const fmtMoney = useFormatCurrency();
  const { currency } = useCurrency();

  // State management
  const [contributionData, setContributionData] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DailyActivity | null>(null);
  const [quote, setQuote] = useState<FinancialQuote | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hasLoadedOnceRef = useRef(false);
  
  // Motion values for scroll effects
  
  // Spring animations
  const springProps = useSpringAnimation({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 60 },
  });

  // Mouse position for 3D effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  

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
  // ─────────────────────────────────────────────────────────
  // Recent transactions — pulled from shared data source
  // ─────────────────────────────────────────────────────────
  const recentTransactions = initialTransactions;

  // ─────────────────────────────────────────────────────────
  // Spending Overview — real data derived from transactions
  // ─────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────
  // Spending time-series — real per-day/week/month totals
  // Adapts to selectedTimeframe: 1W (7 days), 1M (30 days),
  // 3M (12 weeks), 1Y (12 months)
  // ─────────────────────────────────────────────────────────
  const spendingTimeSeries = useMemo(() => {
    const now = new Date();

    // ─── 1Y: 12 monthly buckets ───
    if (selectedTimeframe === '1Y') {
      const buckets: { x: number; y: number; label: string }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push({
          x: 12 - i,
          y: 0,
          label: format(d, 'MMM'),
        });
      }
      recentTransactions.forEach((t) => {
        if (t.type !== 'expense') return;
        const td = new Date(t.date);
        // Match by month + year
        const bucketIdx = 11 - (
          (now.getFullYear() - td.getFullYear()) * 12 +
          (now.getMonth() - td.getMonth())
        );
        if (bucketIdx >= 0 && bucketIdx < 12) {
          buckets[bucketIdx].y += Math.abs(t.amount);
        }
      });
      return buckets;
    }

    // ─── 3M: 12 weekly buckets ───
    if (selectedTimeframe === '3M') {
      const buckets: { x: number; y: number; label: string }[] = [];
      const startOfCurrentWeek = new Date(now);
      startOfCurrentWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfCurrentWeek.setHours(0, 0, 0, 0);

      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(startOfCurrentWeek);
        weekStart.setDate(startOfCurrentWeek.getDate() - i * 7);
        buckets.push({
          x: 12 - i,
          y: 0,
          label: format(weekStart, 'dd MMM'),
        });
      }

      recentTransactions.forEach((t) => {
        if (t.type !== 'expense') return;
        const td = new Date(t.date);
        for (let i = 0; i < 12; i++) {
          const weekStart = new Date(startOfCurrentWeek);
          weekStart.setDate(startOfCurrentWeek.getDate() - (11 - i) * 7);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);

          if (td >= weekStart && td <= weekEnd) {
            buckets[i].y += Math.abs(t.amount);
            break;
          }
        }
      });
      return buckets;
    }

    // ─── 1W: 7 daily buckets ───
    // ─── 1M: 30 daily buckets ───
    const dayCount = selectedTimeframe === '1W' ? 7 : 30;
    const buckets: { x: number; y: number; label: string }[] = [];

    for (let i = dayCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      d.setHours(0, 0, 0, 0);
      buckets.push({
        x: dayCount - i,
        y: 0,
        label: selectedTimeframe === '1W' ? format(d, 'EEE') : format(d, 'dd'),
      });
    }

    recentTransactions.forEach((t) => {
      if (t.type !== 'expense') return;
      const td = new Date(t.date);
      const daysAgo = Math.floor(
        (now.getTime() - td.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (daysAgo >= 0 && daysAgo < dayCount) {
        const idx = dayCount - 1 - daysAgo;
        buckets[idx].y += Math.abs(t.amount);
      }
    });

    return buckets;
  }, [recentTransactions, selectedTimeframe]);

  // ─────────────────────────────────────────────────────────
  // Chart presentation helpers — adaptive per timeframe
  // ─────────────────────────────────────────────────────────
  const chartBarWidth = useMemo(() => {
    switch (selectedTimeframe) {
      case '1W': return 38;
      case '1M': return 16;
      case '3M': return 30;
      default: return 22;
    }
  }, [selectedTimeframe]);

  // Smart Y-max

  // ─────────────────────────────────────────────────────────
  // Color palette per timeframe — makes each timeframe unique
  // ─────────────────────────────────────────────────────────
  const chartPalette = useMemo(() => {
    switch (selectedTimeframe) {
      case '1W':
        return {
          name: 'emerald',
          light: '#a7f3d0',
          medium: '#34d399',
          dark: '#10b981',
          deep: '#059669',
        };
      case '1M':
        return {
          name: 'sky',
          light: '#bae6fd',
          medium: '#38bdf8',
          dark: '#0ea5e9',
          deep: '#0284c7',
        };
      case '3M':
        return {
          name: 'violet',
          light: '#ddd6fe',
          medium: '#a78bfa',
          dark: '#8b5cf6',
          deep: '#7c3aed',
        };
      case '1Y':
        return {
          name: 'amber',
          light: '#fde68a',
          medium: '#fbbf24',
          dark: '#f59e0b',
          deep: '#d97706',
        };
      default:
        return {
          name: 'sky',
          light: '#bae6fd',
          medium: '#38bdf8',
          dark: '#0ea5e9',
          deep: '#0284c7',
        };
    }
  }, [selectedTimeframe]);

  // Smart Y-max: use 95th percentile so one huge spike doesn't crush the rest
  const chartYMax = useMemo(() => {
    const values = spendingTimeSeries
      .map((d) => d.y)
      .filter((v) => v > 0)
      .sort((a, b) => a - b);
    if (values.length === 0) return 1000;
    const p95Index = Math.floor(values.length * 0.95);
    const p95 = values[p95Index] || values[values.length - 1];
    // Round up to nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(p95)));
    return Math.ceil(p95 / magnitude) * magnitude * 1.1;
  }, [spendingTimeSeries]);

  // Memoized label formatter for chart bars — avoids re-computation on every render
  const chartLabelFormatter = useMemo(() => {
    return ({ datum }: { datum: any }) => {
      const amount = datum.y || 0;
      if (amount === 0) return '';
      return amount >= 1_000_000
        ? `${currency.symbol}${(amount / 1_000_000).toFixed(2)}M`
        : amount >= 1_000
          ? `${currency.symbol}${(amount / 1_000).toFixed(1)}k`
          : `${currency.symbol}${Math.round(amount)}`;
    };
  }, [currency.symbol]);

  // Tick stride: how often to show X-axis labels
  const chartTickStride = useMemo(() => {
    switch (selectedTimeframe) {
      case '1W': return 1;   // every day
      case '1M': return 3;   // every 3rd day
      case '3M': return 1;   // every week
      case '1Y': return 1;   // every month
      default: return 1;
    }
  }, [selectedTimeframe]);

  // ─────────────────────────────────────────────────────────
  // Year navigation for contribution grid
  // ─────────────────────────────────────────────────────────
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();

    // Earliest transaction year (or current year if no transactions)
    const earliestYear = initialTransactions.length > 0
      ? initialTransactions.reduce((min, t) => {
          const y = new Date(t.date).getFullYear();
          return y < min ? y : min;
        }, currentYear)
      : currentYear;

    // Build range: earliest → current year + 2 (planning ahead)
    const years: number[] = [];
    for (let y = earliestYear; y <= currentYear + 2; y++) {
      years.push(y);
    }
    return years.reverse(); // newest first
  }, []);

  // Default to the year of the newest transaction
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const sorted = [...initialTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0] ? new Date(sorted[0].date).getFullYear() : new Date().getFullYear();
  });

  // ─────────────────────────────────────────────────────────
  // Effect 1: Build contribution data from selected year
  // Re-runs only when the year changes
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const isFirstLoad = !hasLoadedOnceRef.current;

    if (isFirstLoad) {
      setLoading(true);
      // Only delay + confetti on first mount
      const timer = setTimeout(() => {
        let data = contributionCache[selectedYear];
        if (!data) {
          data = buildContributionData(recentTransactions, selectedYear);
          contributionCache[selectedYear] = data;
        }
        setContributionData(data);
        setLoading(false);
        hasLoadedOnceRef.current = true;
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      // Subsequent year changes: check cache first, then build
      let data = contributionCache[selectedYear];
      if (!data) {
        data = buildContributionData(recentTransactions, selectedYear);
        contributionCache[selectedYear] = data;
      }
      setContributionData(data);
    }
  }, [selectedYear]);

  // ─────────────────────────────────────────────────────────
  // Effect 2: One-time setup (quote, welcome, notifications)
  // Runs only on mount, never on year change
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    // Random quote on first load
    const randomQuote = mockQuotes[Math.floor(Math.random() * mockQuotes.length)];
    setQuote(randomQuote);

    // Hide welcome after 5s
    const welcomeTimer = setTimeout(() => setShowWelcome(false), 5000);

    // Notification ticker
    const notificationTimer = setInterval(() => {
      setNotifications((prev) => Math.min(prev + 1, 9));
    }, 30000);

    return () => {
      clearTimeout(welcomeTimer);
      clearInterval(notificationTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const data = buildContributionData(recentTransactions, selectedYear);
    setContributionData(data);
    setQuote(mockQuotes[Math.floor(Math.random() * mockQuotes.length)]);
    setIsRefreshing(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'The Base — My Financial Dashboard',
      text: `💰 I've saved KSh 245,800 on The Base!\n📈 Savings rate: 39%\n🎯 Goal: 50% to my Emergency Fund\n\nJoin me on Kenya's best personal finance platform!`,
      url: window.location.href,
    };
    try {
      if (typeof navigator.share === 'function' && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
        toast.success('Copied to clipboard!');
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        toast.error('Could not share');
      }
    }
  };

  const handlePrint = () => {
    exportToPDF(
      recentTransactions.map((t: any) => ({
        id: t.id.toString(),
        description: t.description,
        category: t.category,
        type: t.type,
        date: t.date,
        amount: t.amount,
      })),
      {
        title: 'The Base — Dashboard Report',
        subtitle: 'Generated from your dashboard',
      }
    );
    toast.success('Report downloaded!');
  };

  const handleExport = () => {
    setShowExportModal(true);
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >

        {/* Premium Header with Glass Effect */}

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
                  year={selectedYear}
                  availableYears={availableYears}
                  onYearChange={(year) => startTransition(() => setSelectedYear(year))}
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
                <motion.div
                  key={selectedTimeframe}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="h-64"
                >
                  <VictoryChart
                    theme={VictoryTheme.material}
                    domainPadding={{ x: selectedTimeframe === '1W' ? 40 : 15 }}
                    style={{
                      parent: { touchAction: 'auto' },
                    }}
                    width={700}
                    height={320}
                    padding={{ top: 40, bottom: 80, left: 130, right: 30 }}
                  >
                    {/* X-axis */}
                    <VictoryAxis
                      label={(() => {
                        switch (selectedTimeframe) {
                          case '1W': return 'Day of Week';
                          case '1M': return 'Day of Month';
                          case '3M': return 'Week';
                          case '1Y': return 'Month';
                          default: return '';
                        }
                      })()}
                      tickValues={spendingTimeSeries
                        .filter((_, i) => {
                          // Filter ticks based on timeframe
                          if (selectedTimeframe === '1W') return true;
                          if (selectedTimeframe === '1M') return i % 5 === 0; // every 5th day
                          return true;
                        })
                        .map((d) => d.x)}
                      tickFormat={spendingTimeSeries
                        .filter((_, i) => {
                          if (selectedTimeframe === '1W') return true;
                          if (selectedTimeframe === '1M') return i % 5 === 0;
                          return true;
                        })
                        .map((d) => d.label)}
                      style={{
                        tickLabels: {
                          fill: '#6B7280',
                          fontSize: 11,
                          fontFamily: 'Inter, sans-serif',
                          padding: 8,
                        },
                        axisLabel: {
                          fill: '#374151',
                          fontSize: 11,
                          fontWeight: 600,
                          fontFamily: 'Inter, sans-serif',
                          padding: 35,
                          letterSpacing: '0.05em',
                        },
                        grid: { stroke: 'transparent' },
                        axis: { stroke: '#E5E7EB' },
                        ticks: { stroke: 'transparent', size: 0 },
                      }}
                    />

                    {/* Y-axis */}
                    <VictoryAxis
                      dependentAxis
                      label={`Amount (${currency.code})`}
                      domain={[0, chartYMax]}
                      tickFormat={(x: number) => {
                        if (x === 0) return `${currency.symbol}0`;
                        if (x >= 1_000_000_000) return `${currency.symbol}${(x / 1_000_000_000).toFixed(1)}B`;
                        if (x >= 1_000_000) return `${currency.symbol}${(x / 1_000_000).toFixed(1)}M`;
                        if (x >= 1_000) return `${currency.symbol}${(x / 1_000).toFixed(0)}k`;
                        return `${currency.symbol}${Math.round(x)}`;
                      }}
                      style={{
                        tickLabels: {
                          fill: '#6B7280',
                          fontSize: 11,
                          fontFamily: 'Inter, sans-serif',
                          padding: 8,
                        },
                        axisLabel: {
                          fill: '#374151',
                          fontSize: 11,
                          fontWeight: 600,
                          fontFamily: 'Inter, sans-serif',
                          padding: 65,
                          letterSpacing: '0.05em',
                        },
                        grid: {
                          stroke: '#F3F4F6',
                          strokeDasharray: '4 4',
                        },
                        axis: { stroke: 'transparent' },
                        ticks: { stroke: 'transparent', size: 0 },
                      }}
                    />

                    {/* Bars for 1W, 1M, 3M */}
                    {selectedTimeframe !== '1Y' && (
                      <VictoryBar
                        data={spendingTimeSeries}
                        cornerRadius={{ top: 5 }}
                        barWidth={chartBarWidth}
                        labels={({ datum }) => {
                          const amount = datum.y || 0;
                          if (amount === 0) return '';
                          return amount >= 1_000_000
                            ? `${currency.symbol}${(amount / 1_000_000).toFixed(2)}M`
                            : amount >= 1_000
                              ? `${currency.symbol}${(amount / 1_000).toFixed(1)}k`
                              : `${currency.symbol}${Math.round(amount)}`;
                        }}
                        labelComponent={
                          <VictoryTooltip
                            flyoutStyle={{
                              fill: chartPalette.deep,
                              stroke: 'none',
                            }}
                            style={{
                              fill: '#ffffff',
                              fontSize: 12,
                              fontWeight: 'bold',
                            }}
                            flyoutPadding={{ top: 8, bottom: 8, left: 12, right: 12 }}
                            cornerRadius={6}
                            pointerLength={6}
                            constrainToVisibleArea={true}
                            dy={-12}
                          />
                        }
                        style={{
                          data: {
                            fill: ({ datum }) => {
                              const max = Math.max(...spendingTimeSeries.map((d) => d.y), 1);
                              const ratio = datum.y / max;

                              // Use palette-specific colors per timeframe
                              if (ratio > 0.75) return chartPalette.deep;
                              if (ratio > 0.5) return chartPalette.dark;
                              if (ratio > 0.25) return chartPalette.medium;
                              if (ratio > 0.05) return chartPalette.light;
                              return chartPalette.light;
                            },
                            opacity: 1,
                          },
                        }}
                      />
                    )}

                    {/* Line for 1Y (trend over time) */}
                    {selectedTimeframe === '1Y' && (
                      <VictoryLine
                        data={spendingTimeSeries}
                        interpolation="monotoneX"
                        labels={({ datum }) => {
                          const amount = datum.y || 0;
                          if (amount === 0) return '';
                          return amount >= 1_000_000
                            ? `${currency.symbol}${(amount / 1_000_000).toFixed(2)}M`
                            : amount >= 1_000
                              ? `${currency.symbol}${(amount / 1_000).toFixed(1)}k`
                              : `${currency.symbol}${Math.round(amount)}`;
                        }}
                        labelComponent={
                          <VictoryTooltip
                            flyoutStyle={{
                              fill: chartPalette.deep,
                              stroke: 'none',
                            }}
                            style={{
                              fill: '#ffffff',
                              fontSize: 12,
                              fontWeight: 'bold',
                            }}
                            flyoutPadding={{ top: 8, bottom: 8, left: 12, right: 12 }}
                            cornerRadius={6}
                            pointerLength={6}
                            constrainToVisibleArea={true}
                            dy={-12}
                          />
                        }
                        style={{
                          data: { stroke: chartPalette.dark, strokeWidth: 3 },
                        }}
                        animate={{
                          duration: 800,
                          onLoad: { duration: 400 },
                        }}
                      />
                    )}
                  </VictoryChart>
                </motion.div>
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
                                {transaction.amount > 0 ? '+' : ''}{fmtMoney(Math.abs(transaction.amount))}
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
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.1 } },
                  }}
                  className="space-y-6"
                >
                  {mockGoals.map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        visible: { opacity: 1, x: 0 },
                      }}
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
                        {fmtMoney(goal.currentAmount)} / {fmtMoney(goal.targetAmount)}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
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
                            {fmtMoney(budget.spent)} / {fmtMoney(budget.amount)}
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
                        {transaction.amount > 0 ? '+' : ''}{fmtMoney(transaction.amount)}
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
                      {fmtMoney(investment.amount)}
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
              { icon: Printer, label: 'Print Report', onClick: handlePrint },
              { icon: Camera, label: 'Scan Receipt', onClick: () => toast.success('Receipt scanner coming soon — check back next week!') },
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
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        transactions={recentTransactions.map((t: any) => ({
          id: t.id.toString(),
          description: t.description,
          category: t.category,
          type: t.type,
          date: t.date,
          amount: t.amount,
        }))}
        title="Export Financial Data"
      />

      </motion.div>
    </>
  );
};

export default Dashboard;
