// src/pages/savings/Savings.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PiggyBank,
  Target,
  Trophy,
  Gift,
  Award,
  TrendingUp,
  Calendar,
  ChevronRight,
  Plus,
  Clock,
  Flame,
  Star,
  Zap,
  Shield,
  Download,
  Share2,
  Bell,
  Settings,
  ChevronDown,
  ChevronUp,
  Circle,
  CheckCircle,
  Lock,
  Unlock,
  Sparkles,
  Rocket,
  Medal,
  Crown,
  Diamond,
  Gem,
  Coins,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Info,
  AlertCircle,
  ThumbsUp,
  Heart,
  Smile,
  Coffee,
  ShoppingBag,
  Car,
  Home,
  Briefcase,
  GraduationCap,
  Plane,
  Gift as GiftIcon,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Mock data for savings challenges
const week52Data = Array.from({ length: 52 }, (_, i) => ({
  week: i + 1,
  amount: (i + 1) * 100,
  saved: Math.random() > 0.3 ? (i + 1) * 100 : 0,
  completed: Math.random() > 0.7,
}));

const roundUpData = [
  { name: 'Jan', saved: 1250 },
  { name: 'Feb', saved: 1800 },
  { name: 'Mar', saved: 2200 },
  { name: 'Apr', saved: 1900 },
  { name: 'May', saved: 2800 },
  { name: 'Jun', saved: 3100 },
];

const savingsGoals = [
  { id: 1, name: 'Emergency Fund', target: 300000, current: 150000, color: '#0ea5e9', icon: Shield, deadline: 'Dec 2024' },
  { id: 2, name: 'House Deposit', target: 1000000, current: 200000, color: '#8b5cf6', icon: Home, deadline: 'Dec 2025' },
  { id: 3, name: 'Dream Vacation', target: 150000, current: 45000, color: '#f59e0b', icon: Plane, deadline: 'Jun 2024' },
  { id: 4, name: 'Education Fund', target: 500000, current: 75000, color: '#10b981', icon: GraduationCap, deadline: 'Dec 2026' },
];

const achievements = [
  { id: 1, name: 'Week 1 Complete', icon: '🌱', earned: true, date: 'Jan 15, 2024' },
  { id: 2, name: 'Saved KSh 5,000', icon: '💰', earned: true, date: 'Jan 20, 2024' },
  { id: 3, name: '10 Week Streak', icon: '🔥', earned: true, date: 'Feb 1, 2024' },
  { id: 4, name: 'Round-Up Master', icon: '🔄', earned: false },
  { id: 5, name: 'Goal Crusher', icon: '🎯', earned: false },
  { id: 6, name: 'Saving Legend', icon: '👑', earned: false },
];

const Savings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('challenges');
  const [selectedChallenge, setSelectedChallenge] = useState<'52week' | 'roundup' | 'goals'>('52week');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [roundUpEnabled, setRoundUpEnabled] = useState(true);
  const [roundUpMultiplier, setRoundUpMultiplier] = useState(1);
  
  // Calculate totals
  const totalSaved52Week = week52Data.reduce((sum, week) => sum + week.saved, 0);
  const totalRoundUp = roundUpData.reduce((sum, month) => sum + month.saved, 0);
  const totalGoals = savingsGoals.reduce((sum, goal) => sum + goal.current, 0);
  const completedWeeks = week52Data.filter(w => w.completed).length;
  const progress = (completedWeeks / 52) * 100;

  // Trigger confetti when completing a week
  const handleWeekComplete = (week: number) => {
    setSelectedWeek(week);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          colors={['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header with Celebration Effect */}
        <div className="relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Savings & Challenges
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Turn saving into a game. Watch your money grow!
            </p>
          </motion.div>
          
          {/* Animated background */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-40 h-40 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full opacity-20 blur-3xl"
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Saved</p>
                  <AnimatedCounter
                    value={totalSaved52Week + totalRoundUp + totalGoals}
                    className="text-2xl font-bold text-gray-900 dark:text-white mt-1"
                  />
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                  <PiggyBank className="text-green-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2">↑ 15.3% from last month</p>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">52-Week Challenge</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {completedWeeks}/52
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <Calendar className="text-blue-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-blue-600 mt-2">{progress.toFixed(1)}% complete</p>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Round-Up Savings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(totalRoundUp)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                  <RefreshCw className="text-purple-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-purple-600 mt-2">128 transactions rounded up</p>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Goals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {savingsGoals.length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
                  <Target className="text-yellow-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-yellow-600 mt-2">4 goals in progress</p>
            </Card>
          </motion.div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {[
            { id: 'challenges', label: '52-Week Challenge', icon: Calendar },
            { id: 'roundup', label: 'Round-Up Savings', icon: RefreshCw },
            { id: 'goals', label: 'Savings Goals', icon: Target },
            { id: 'achievements', label: 'Achievements', icon: Trophy },
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
          {/* 52-Week Challenge Tab */}
          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Challenge Header */}
              <Card variant="gradient" className="p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-white/20 rounded-2xl">
                      <Calendar size={40} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">52-Week Money Challenge</h2>
                      <p className="text-white/80">Save increasing amounts each week. Start small, finish big!</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{formatCurrency(137800)}</p>
                      <p className="text-sm text-white/80">Potential total savings</p>
                    </div>
                    <div className="h-12 w-px bg-white/20"></div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{completedWeeks}</p>
                      <p className="text-sm text-white/80">Weeks completed</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Progress Circle and Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="glass" className="p-6 col-span-1">
                  <div className="relative w-48 h-48 mx-auto">
                    {/* Circular Progress */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="12"
                        className="dark:stroke-gray-700"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 88}
                        strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {progress.toFixed(0)}%
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Complete</span>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Next milestone: Week {completedWeeks + 1}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                      Save {formatCurrency((completedWeeks + 1) * 100)}
                    </p>
                  </div>
                </Card>

                <Card variant="glass" className="p-6 col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Progress Timeline
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={week52Data.slice(0, 20)}>
                      <defs>
                        <linearGradient id="savedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="saved"
                        stroke="#0ea5e9"
                        fillOpacity={1}
                        fill="url(#savedGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Challenge Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-13 gap-2">
                {week52Data.map((week) => (
                  <motion.button
                    key={week.week}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => !week.completed && handleWeekComplete(week.week)}
                    className={cn(
                      'aspect-square rounded-xl p-2 flex flex-col items-center justify-center transition-all',
                      week.completed
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg'
                        : week.saved > 0
                        ? 'bg-green-100 dark:bg-green-900/20 border-2 border-green-500'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    )}
                  >
                    <span className="text-xs font-medium">W{week.week}</span>
                    <span className="text-xs mt-1">
                      {week.completed ? '✓' : formatCurrency(week.amount)}
                    </span>
                    {week.completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[10px]"
                      >
                        ⭐
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Challenge Actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" icon={<Download size={18} />}>
                    Export Progress
                  </Button>
                  <Button variant="outline" icon={<Share2 size={18} />}>
                    Share Challenge
                  </Button>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Info size={16} />
                  <span>Complete all 52 weeks to earn the "Saving Shark" badge 🦈</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Round-Up Savings Tab */}
          {activeTab === 'roundup' && (
            <motion.div
              key="roundup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card variant="mpesa" className="p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-white/20 rounded-2xl">
                      <RefreshCw size={40} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Round-Up Savings</h2>
                      <p className="text-white/80">
                        Round up your M-PESA transactions to the nearest 100 and save the difference
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button
                      variant="secondary"
                      onClick={() => setRoundUpEnabled(!roundUpEnabled)}
                    >
                      {roundUpEnabled ? 'Disable' : 'Enable'} Round-Up
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Settings */}
                <Card variant="glass" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Round-Up Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Auto round-up</span>
                      <button
                        onClick={() => setRoundUpEnabled(!roundUpEnabled)}
                        className={cn(
                          'w-12 h-6 rounded-full transition-colors',
                          roundUpEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                        )}
                      >
                        <motion.div
                          animate={{ x: roundUpEnabled ? 24 : 2 }}
                          className="w-5 h-5 bg-white rounded-full shadow-md"
                        />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Round-up multiplier
                      </label>
                      <select
                        value={roundUpMultiplier}
                        onChange={(e) => setRoundUpMultiplier(Number(e.target.value))}
                        className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <option value={1}>1x (Round to nearest 100)</option>
                        <option value={2}>2x (Round to nearest 200)</option>
                        <option value={5}>5x (Round to nearest 500)</option>
                        <option value={10}>10x (Round to nearest 1000)</option>
                      </select>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <Info size={16} className="inline mr-2" />
                        You've rounded up 128 transactions this month
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Monthly Stats */}
                <Card variant="glass" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Monthly Round-Up
                  </h3>
                  <div className="space-y-4">
                    {roundUpData.map((month) => (
                      <div key={month.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">{month.name}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(month.saved)}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${(month.saved / 3500) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Recent Round-Ups */}
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Round-Ups
                </h3>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                          <RefreshCw size={18} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            M-PESA to {['Naivas', 'KPLC', 'Safaricom', 'Uber', 'Java'][i-1]}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {`${i} hour${i > 1 ? 's' : ''} ago`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+{formatCurrency(i * 75)}</p>
                        <p className="text-xs text-gray-500">rounded up</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Savings Goals Tab */}
          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Add Goal Button */}
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  icon={<Plus size={18} />}
                  onClick={() => setShowAddGoal(true)}
                >
                  Create New Goal
                </Button>
              </div>

              {/* Goals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savingsGoals.map((goal, index) => {
                  const Icon = goal.icon;
                  const progress = (goal.current / goal.target) * 100;
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card variant="glass" className="p-6 hover:shadow-xl transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: `${goal.color}20` }}>
                              <Icon style={{ color: goal.color }} size={24} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {goal.name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Due {goal.deadline}
                              </p>
                            </div>
                          </div>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                            <Settings size={16} className="text-gray-500" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${progress}%`, backgroundColor: goal.color }}
                            />
                          </div>
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-600 dark:text-gray-400">
                              {formatCurrency(goal.current)}
                            </span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {formatCurrency(goal.target)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock size={14} className="text-gray-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.ceil((goal.target - goal.current) / 5000)} months left
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" icon={<ChevronRight size={16} />} iconPosition="right">
                            View Details
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Goal Tips */}
              <Card variant="mpesa" className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Pro Tip 💡</h4>
                    <p className="text-white/90">
                      Break down your large goals into smaller milestones. 
                      Try the 52-week challenge to save for your house deposit!
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Achievement Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="glass" className="p-6 text-center">
                  <Trophy className="mx-auto text-yellow-500 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {achievements.filter(a => a.earned).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Achievements Earned</p>
                </Card>
                <Card variant="glass" className="p-6 text-center">
                  <Flame className="mx-auto text-orange-500 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">15</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Day Streak</p>
                </Card>
                <Card variant="glass" className="p-6 text-center">
                  <Medal className="mx-auto text-purple-500 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rare Badges</p>
                </Card>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      variant={achievement.earned ? 'gradient' : 'glass'}
                      className={cn(
                        'p-6 text-center relative overflow-hidden',
                        !achievement.earned && 'opacity-60'
                      )}
                    >
                      {achievement.earned && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2"
                        >
                          <Crown size={20} className="text-yellow-400" />
                        </motion.div>
                      )}
                      <div className="text-5xl mb-3">{achievement.icon}</div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {achievement.name}
                      </h3>
                      {achievement.earned ? (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Earned {achievement.date}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Locked
                        </p>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Next Achievements */}
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Next Achievements
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Save KSh 10,000', progress: 75, icon: '💰' },
                    { name: 'Complete Week 20', progress: 60, icon: '📅' },
                    { name: '10 Round-Ups', progress: 90, icon: '🔄' },
                  ].map((next, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-2xl">{next.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 dark:text-gray-300">{next.name}</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {next.progress}%
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${next.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Goal Modal */}
        <AnimatePresence>
          {showAddGoal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddGoal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Create Savings Goal
                </h2>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Goal Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Emergency Fund"
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Amount (KES)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Icon
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[Home, Car, Plane, GraduationCap, Briefcase, GiftIcon, Heart, Star].map((Icon, i) => (
                        <button
                          key={i}
                          type="button"
                          className="p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <Icon size={20} className="mx-auto text-gray-700 dark:text-gray-300" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="autoSave" className="rounded text-primary-600" />
                    <label htmlFor="autoSave" className="text-sm text-gray-700 dark:text-gray-300">
                      Enable auto-save from round-ups
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button variant="primary" fullWidth onClick={() => setShowAddGoal(false)}>
                      Create Goal
                    </Button>
                    <Button variant="outline" fullWidth onClick={() => setShowAddGoal(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default Savings;
