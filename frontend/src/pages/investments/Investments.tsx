// src/pages/investments/Investments.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  LineChart,
  DollarSign,
  Percent,
  Clock,
  Shield,
  Zap,
  Award,
  ChevronRight,
  Plus,
  Download,
  RefreshCw,
  AlertCircle,
  Info,
  Building,
  Landmark,
  Briefcase,
  Gem,
  Coins,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Bell,
  Settings,
  Calendar,
  Filter,
  Search,
  Star,
  StarOff,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Rocket,
  Target,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Gift,
  Heart,
  ThumbsUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import {
  LineChart as ReLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
} from 'recharts';

// Mock investment data for Kenyan context
const mmfData = [
  { id: 1, name: 'CIC Money Market Fund', provider: 'CIC Asset Management', amount: 150000, returns: 8.5, risk: 'Low', minInvestment: 1000, liquidity: 'High', color: '#0ea5e9' },
  { id: 2, name: 'Sanlam Money Market Fund', provider: 'Sanlam Investments', amount: 85000, returns: 8.2, risk: 'Low', minInvestment: 500, liquidity: 'High', color: '#10b981' },
  { id: 3, name: 'Britam Money Market Fund', provider: 'Britam Asset Managers', amount: 45000, returns: 8.7, risk: 'Low', minInvestment: 1000, liquidity: 'High', color: '#f59e0b' },
  { id: 4, name: 'NCBA Money Market Fund', provider: 'NCBA Bank', amount: 0, returns: 8.3, risk: 'Low', minInvestment: 5000, liquidity: 'High', color: '#8b5cf6' },
];

const saccoData = [
  { id: 1, name: 'Stima Sacco', provider: 'Stima DT Sacco', amount: 120000, shares: 5000, dividends: 12, deposits: 5000, loanBalance: 250000, color: '#ec4899' },
  { id: 2, name: 'Mwalimu National', provider: 'Mwalimu National Sacco', amount: 75000, shares: 3000, dividends: 11, deposits: 3000, loanBalance: 150000, color: '#14b8a6' },
  { id: 3, name: 'Harambee Sacco', provider: 'Harambee Co-operative', amount: 50000, shares: 2000, dividends: 10.5, deposits: 2000, loanBalance: 0, color: '#f97316' },
];

const stockData = [
  { id: 1, symbol: 'SCOM', name: 'Safaricom PLC', shares: 500, price: 42.50, value: 21250, change: 1.25, changePercent: 3.03, dividend: 1.85, sector: 'Telecom' },
  { id: 2, symbol: 'EQTY', name: 'Equity Group', shares: 300, price: 48.75, value: 14625, change: -0.50, changePercent: -1.02, dividend: 4.50, sector: 'Banking' },
  { id: 3, symbol: 'KCB', name: 'KCB Group', shares: 200, price: 38.90, value: 7780, change: 0.30, changePercent: 0.78, dividend: 3.75, sector: 'Banking' },
  { id: 4, symbol: 'EABL', name: 'EABL', shares: 100, price: 152.00, value: 15200, change: 2.50, changePercent: 1.67, dividend: 8.50, sector: 'Beverage' },
];

const performanceData = [
  { month: 'Jan', mmf: 1250, sacco: 1500, stocks: 850, total: 3600 },
  { month: 'Feb', mmf: 1320, sacco: 1550, stocks: 920, total: 3790 },
  { month: 'Mar', mmf: 1410, sacco: 1620, stocks: 1100, total: 4130 },
  { month: 'Apr', mmf: 1530, sacco: 1700, stocks: 980, total: 4210 },
  { month: 'May', mmf: 1620, sacco: 1810, stocks: 1150, total: 4580 },
  { month: 'Jun', mmf: 1750, sacco: 1950, stocks: 1280, total: 4980 },
];

const allocationData = [
  { name: 'Money Market Funds', value: 280000, color: '#0ea5e9' },
  { name: 'Sacco Investments', value: 245000, color: '#10b981' },
  { name: 'Stocks', value: 58855, color: '#f59e0b' },
  { name: 'Treasury Bills', value: 100000, color: '#8b5cf6' },
];

const nseIndices = [
  { name: 'NSE 20', value: 1850.45, change: 12.30, changePercent: 0.67 },
  { name: 'NSE 25', value: 2450.80, change: -5.20, changePercent: -0.21 },
  { name: 'NASI', value: 98.75, change: 0.85, changePercent: 0.87 },
];

const Investments: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('1Y');
  const [watchlist, setWatchlist] = useState<string[]>(['SCOM', 'EQTY', 'KCB']);
  const [riskProfile, setRiskProfile] = useState<'Low' | 'Moderate' | 'High'>('Moderate');
  const [showProjections, setShowProjections] = useState(false);
  const [selectedSacco, setSelectedSacco] = useState<string | null>(null);

  // Calculate totals
  const totalMMF = mmfData.reduce((sum, item) => sum + item.amount, 0);
  const totalSacco = saccoData.reduce((sum, item) => sum + item.amount, 0);
  const totalStocks = stockData.reduce((sum, item) => sum + item.value, 0);
  const totalInvestments = totalMMF + totalSacco + totalStocks;
  
  const totalReturns = performanceData.reduce((sum, item) => sum + item.total, 0);
  const averageReturn = (totalReturns / performanceData.length) / totalInvestments * 100;

  const toggleWatchlist = (symbol: string) => {
    if (watchlist.includes(symbol)) {
      setWatchlist(watchlist.filter(s => s !== symbol));
    } else {
      setWatchlist([...watchlist, symbol]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header with Market Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            Investment Portfolio
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your MMFs, Saccos, and NSE investments in one place
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<Download size={18} />}
            onClick={() => alert('Export portfolio data')}
          >
            Export
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => setShowAddInvestment(true)}
          >
            Add Investment
          </Button>
        </div>
      </div>

      {/* NSE Market Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nseIndices.map((index, i) => (
          <motion.div
            key={index.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card variant="glass" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{index.name}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {index.value.toFixed(2)}
                  </p>
                </div>
                <div className={cn(
                  'flex items-center space-x-1 px-2 py-1 rounded-lg',
                  index.change >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                )}>
                  {index.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  <span className="text-sm font-medium">{index.changePercent.toFixed(2)}%</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="gradient" className="p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Portfolio</p>
                <AnimatedCounter
                  value={totalInvestments}
                  className="text-2xl font-bold mt-1"
                />
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Briefcase size={24} />
              </div>
            </div>
            <p className="text-white/80 text-sm mt-2">
              +{formatCurrency(totalReturns)} returns this year
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">MMF Investments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(totalMMF)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">Avg. 8.4% returns</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sacco Savings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(totalSacco)}
                </p>
              </div>
              <div className="p-3 bg-pink-100 dark:bg-pink-900/20 rounded-xl">
                <Building className="text-pink-600" size={24} />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">Avg. 11.2% dividends</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stocks Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(totalStocks)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                <BarChart3 className="text-orange-600" size={24} />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">+1.2% today</p>
          </Card>
        </motion.div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { id: 'overview', label: 'Portfolio Overview', icon: PieChart },
          { id: 'mmf', label: 'Money Market Funds', icon: TrendingUp },
          { id: 'sacco', label: 'Sacco Investments', icon: Building },
          { id: 'stocks', label: 'Stocks (NSE)', icon: BarChart3 },
          { id: 'projections', label: 'Projections', icon: LineChart },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Icon size={18} />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* Portfolio Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Allocation Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Asset Allocation
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {allocationData.map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
                      <span className="text-xs font-medium ml-auto">
                        {((item.value / totalInvestments) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Performance Chart */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Performance History
                  </h3>
                  <div className="flex items-center space-x-2">
                    {['1M', '3M', '6M', '1Y', 'All'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTimeframe(t)}
                        className={cn(
                          'px-2 py-1 text-xs rounded-lg transition-colors',
                          timeframe === t
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip
                        formatter={(value: any) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '8px',
                          border: 'none',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#0ea5e9"
                        fillOpacity={1}
                        fill="url(#totalGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Risk Profile */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Shield className="text-primary-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Risk Profile
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  {['Low', 'Moderate', 'High'].map((risk) => (
                    <button
                      key={risk}
                      onClick={() => setRiskProfile(risk as any)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        riskProfile === risk
                          ? risk === 'Low' ? 'bg-green-600 text-white' :
                            risk === 'Moderate' ? 'bg-yellow-600 text-white' :
                            'bg-red-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      )}
                    >
                      {risk}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">Low Risk (MMF, T-Bills)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatCurrency(totalMMF + 100000)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">65% of portfolio</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Moderate Risk (Saccos)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatCurrency(totalSacco)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">25% of portfolio</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">High Risk (Stocks)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatCurrency(totalStocks)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">10% of portfolio</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* MMF Tab */}
        {activeTab === 'mmf' && (
          <motion.div
            key="mmf"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* MMF Header */}
            <Card variant="gradient" className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <TrendingUp size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Money Market Funds</h2>
                    <p className="text-white/80 mt-1">Low risk, stable returns • Avg. 8.4% p.a.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{formatCurrency(totalMMF)}</p>
                  <p className="text-white/80 text-sm">Total invested</p>
                </div>
              </div>
            </Card>

            {/* MMF Comparison Chart */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Returns Comparison
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mmfData.filter(m => m.amount > 0)}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => `${value}%`}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        border: 'none',
                      }}
                    />
                    <Bar dataKey="returns" fill="#0ea5e9">
                      {mmfData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* MMF List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mmfData.map((fund, index) => (
                <motion.div
                  key={fund.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    variant={fund.amount > 0 ? 'glass' : 'default'}
                    className={cn(
                      'p-6 cursor-pointer transition-all hover:shadow-xl',
                      fund.amount === 0 && 'opacity-60'
                    )}
                    onClick={() => setShowDetails(fund.amount > 0 ? fund.id.toString() : null)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: `${fund.color}20` }}>
                          <TrendingUp style={{ color: fund.color }} size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {fund.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {fund.provider}
                          </p>
                        </div>
                      </div>
                      {fund.amount > 0 && (
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                          <MoreVertical size={16} className="text-gray-500" />
                        </button>
                      )}
                    </div>

                    {fund.amount > 0 ? (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Invested</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(fund.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Returns p.a.</p>
                          <p className="text-lg font-bold text-green-600">
                            {fund.returns}%
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <Button variant="outline" size="sm" icon={<Plus size={14} />}>
                          Start Investing from {formatCurrency(fund.minInvestment)}
                        </Button>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span>Min: {formatCurrency(fund.minInvestment)}</span>
                      <span>Liquidity: {fund.liquidity}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sacco Tab */}
        {activeTab === 'sacco' && (
          <motion.div
            key="sacco"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Sacco Header */}
            <Card variant="gradient" className="p-6 text-white" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Building size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Sacco Investments</h2>
                    <p className="text-white/80 mt-1">High dividends, loan access • Avg. 11.2% p.a.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{formatCurrency(totalSacco)}</p>
                  <p className="text-white/80 text-sm">Total savings</p>
                </div>
              </div>
            </Card>

            {/* Sacco List */}
            <div className="grid grid-cols-1 gap-4">
              {saccoData.map((sacco, index) => (
                <motion.div
                  key={sacco.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    variant="glass"
                    className="p-6 cursor-pointer hover:shadow-xl transition-all"
                    onClick={() => setSelectedSacco(selectedSacco === sacco.id.toString() ? null : sacco.id.toString())}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: `${sacco.color}20` }}>
                          <Building style={{ color: sacco.color }} size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {sacco.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {sacco.provider}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(sacco.amount)}
                        </p>
                        <p className="text-xs text-gray-500">Total savings</p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedSacco === sacco.id.toString() && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Shares</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {sacco.shares.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Dividend Rate</p>
                              <p className="text-lg font-bold text-green-600">
                                {sacco.dividends}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Deposit</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatCurrency(sacco.deposits)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Loan Balance</p>
                              <p className="text-lg font-bold text-red-600">
                                {formatCurrency(sacco.loanBalance)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end space-x-3">
                            <Button variant="outline" size="sm" icon={<TrendingUp size={14} />}>
                              View Dividends
                            </Button>
                            <Button variant="outline" size="sm" icon={<Wallet size={14} />}>
                              Apply for Loan
                            </Button>
                            <Button variant="primary" size="sm" icon={<Plus size={14} />}>
                              Add Deposit
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Sacco Calculator */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Sacco Dividend Calculator
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Monthly Contribution
                  </label>
                  <input
                    type="number"
                    placeholder="5000"
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Dividend Rate (%)
                  </label>
                  <input
                    type="number"
                    placeholder="12"
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Years
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                  />
                </div>
              </div>
              <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  After 5 years, you'll have approximately KSh 450,000 with KSh 54,000 in dividends
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Stocks Tab */}
        {activeTab === 'stocks' && (
          <motion.div
            key="stocks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stocks Header */}
            <Card variant="gradient" className="p-6 text-white" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <BarChart3 size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">NSE Stocks</h2>
                    <p className="text-white/80 mt-1">Real-time prices • Dividends • Capital gains</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{formatCurrency(totalStocks)}</p>
                  <p className="text-white/80 text-sm">Portfolio value</p>
                </div>
              </div>
            </Card>

            {/* Watchlist */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Watchlist
                </h3>
                <Button variant="ghost" size="sm" icon={<Plus size={14} />}>
                  Add Symbol
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {['SCOM', 'EQTY', 'KCB', 'EABL', 'COOP', 'ABSA'].map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => toggleWatchlist(symbol)}
                    className={cn(
                      'px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1',
                      watchlist.includes(symbol)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    <span>{symbol}</span>
                    {watchlist.includes(symbol) ? (
                      <Star size={12} className="ml-1" />
                    ) : (
                      <StarOff size={12} className="ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {/* Stock List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 dark:text-gray-400">
                    <th className="pb-4">Symbol</th>
                    <th className="pb-4">Company</th>
                    <th className="pb-4">Shares</th>
                    <th className="pb-4">Price</th>
                    <th className="pb-4">Change</th>
                    <th className="pb-4">Value</th>
                    <th className="pb-4">Dividend</th>
                    <th className="pb-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {stockData.map((stock, index) => (
                    <motion.tr
                      key={stock.symbol}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-4 font-medium text-gray-900 dark:text-white">
                        {stock.symbol}
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-400">
                        {stock.name}
                      </td>
                      <td className="py-4 text-gray-900 dark:text-white">
                        {stock.shares}
                      </td>
                      <td className="py-4 font-medium text-gray-900 dark:text-white">
                        {formatCurrency(stock.price)}
                      </td>
                      <td className="py-4">
                        <div className={cn(
                          'flex items-center space-x-1',
                          stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                          {stock.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          <span>{stock.changePercent.toFixed(2)}%</span>
                        </div>
                      </td>
                      <td className="py-4 font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stock.value)}
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-400">
                        {stock.dividend}
                      </td>
                      <td className="py-4">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                          <ExternalLink size={16} className="text-gray-500" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Market News */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Market News
              </h3>
              <div className="space-y-3">
                {[
                  { title: 'Safaricom announces 5G expansion', source: 'Business Daily', time: '2h ago' },
                  { title: 'KCB Group posts KSh 15B profit', source: 'Nation', time: '5h ago' },
                  { title: 'NSE lifts suspension on EABL shares', source: 'Standard', time: '1d ago' },
                ].map((news, i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{news.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{news.source} • {news.time}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Projections Tab */}
        {activeTab === 'projections' && (
          <motion.div
            key="projections"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card variant="gradient" className="p-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Investment Projections</h2>
              <p className="text-white/80">See where your investments could be in the future</p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Future Value Calculator
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Current Investment
                    </label>
                    <input
                      type="number"
                      value={totalInvestments}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Monthly Contribution
                    </label>
                    <input
                      type="number"
                      placeholder="10000"
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Expected Return (%)
                    </label>
                    <input
                      type="number"
                      value={averageReturn.toFixed(1)}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Years
                    </label>
                    <input
                      type="number"
                      placeholder="10"
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                  <Button variant="primary" fullWidth>
                    Calculate
                  </Button>
                </div>
              </Card>

              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Projected Growth
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { year: 2024, value: totalInvestments },
                        { year: 2025, value: totalInvestments * 1.1 },
                        { year: 2026, value: totalInvestments * 1.21 },
                        { year: 2027, value: totalInvestments * 1.33 },
                        { year: 2028, value: totalInvestments * 1.46 },
                        { year: 2029, value: totalInvestments * 1.61 },
                        { year: 2030, value: totalInvestments * 1.77 },
                      ]}
                                    >
                      <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => formatCurrency(value)}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    By 2030, your investments could grow to KSh 8.5M with monthly contributions of KSh 10,000
                  </p>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Investment Modal */}
      <AnimatePresence>
        {showAddInvestment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddInvestment(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Add Investment
              </h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Investment Type
                  </label>
                  <select className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <option>Money Market Fund</option>
                    <option>Sacco</option>
                    <option>Stocks (NSE)</option>
                    <option>Treasury Bills</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fund/Stock Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., CIC Money Market Fund"
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount Invested (KES)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button variant="primary" fullWidth onClick={() => setShowAddInvestment(false)}>
                    Add Investment
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => setShowAddInvestment(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Investments;
