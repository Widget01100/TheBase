import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  AlertCircle
} from 'lucide-react';
import ContributionGrid from '@/components/contribution-grid/ContributionGrid';
import MpesaStatus from '@/components/shared/MpesaStatus';
import { generateMockContributionData, mockQuotes, mockGoals, mockBudgets } from '@/data/mockData';
import { DailyActivity, FinancialQuote } from '@/types';
import { formatCurrency } from '@/utils/formatters';

const Dashboard: React.FC = () => {
  const [contributionData, setContributionData] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DailyActivity | null>(null);
  const [quote, setQuote] = useState<FinancialQuote | null>(null);
  
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Load mock data
    setTimeout(() => {
      const data = generateMockContributionData(currentYear);
      setContributionData(data);
      setLoading(false);
    }, 1000);
    
    // Set random quote
    const randomQuote = mockQuotes[Math.floor(Math.random() * mockQuotes.length)];
    setQuote(randomQuote);
  }, [currentYear]);

  const stats = [
    {
      title: 'Total Balance',
      value: formatCurrency(245800),
      change: '+12.5%',
      trend: 'up',
      icon: Wallet,
      color: 'bg-blue-500',
    },
    {
      title: 'Monthly Income',
      value: formatCurrency(85000),
      change: '+5.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(52300),
      change: '-3.1%',
      trend: 'down',
      icon: TrendingDown,
      color: 'bg-red-500',
    },
    {
      title: 'Savings Rate',
      value: '38.5%',
      change: '+2.3%',
      trend: 'up',
      icon: PiggyBank,
      color: 'bg-purple-500',
    },
  ];

  const recentTransactions = [
    { id: 1, description: 'Salary Deposit', amount: 85000, type: 'income', category: 'Salary', date: '2024-01-15' },
    { id: 2, description: 'M-PESA to Savings', amount: -5000, type: 'expense', category: 'Savings', date: '2024-01-14' },
    { id: 3, description: 'Netflix Subscription', amount: -1450, type: 'expense', category: 'Entertainment', date: '2024-01-13' },
    { id: 4, description: 'Shopping - Naivas', amount: -3200, type: 'expense', category: 'Groceries', date: '2024-01-12' },
    { id: 5, description: 'MMF Investment', amount: -10000, type: 'investment', category: 'Investment', date: '2024-01-11' },
  ];

  const handleDayClick = (day: DailyActivity) => {
    setSelectedDay(day);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Welcome Section with Quote */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, Francis! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's your financial summary for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <MpesaStatus />
          <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">🇰🇪 Safaricom 4G</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-2">
              <Calendar className="text-gray-500" size={18} />
              <span className="text-gray-700 dark:text-gray-300">
                {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quote of the Day */}
      {quote && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-400 text-white rounded-xl p-6 shadow-lg">
          <p className="text-lg font-medium italic">"{quote.text}"</p>
          <p className="text-sm mt-2 opacity-90">— {quote.author}</p>
          {quote.language === 'sw' && (
            <span className="inline-block mt-2 text-xs bg-white/20 px-2 py-1 rounded-full">Kiswahili</span>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="text-green-500" size={20} />
                ) : (
                  <ArrowDownRight className="text-red-500" size={20} />
                )}
                <span
                  className={`text-sm font-medium ml-1 ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  vs last month
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Contribution Grid */}
      {loading ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-7 gap-1">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <ContributionGrid 
          data={contributionData} 
          year={currentYear} 
          onDayClick={handleDayClick}
        />
      )}

      {/* Selected Day Transactions */}
      {selectedDay && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Transactions on {new Date(selectedDay.date).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          {selectedDay.transactions.length > 0 ? (
            <div className="space-y-3">
              {selectedDay.transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.amount > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                    }`}>
                      <CreditCard className={
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      } size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No transactions on this day</p>
          )}
        </motion.div>
      )}

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/20' :
                    transaction.type === 'expense' ? 'bg-red-100 dark:bg-red-900/20' :
                    'bg-purple-100 dark:bg-purple-900/20'
                  }`}>
                    <CreditCard className={
                      transaction.type === 'income' ? 'text-green-600' :
                      transaction.type === 'expense' ? 'text-red-600' :
                      'text-purple-600'
                    } size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.category} • {transaction.date}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Goals and Budget */}
        <div className="space-y-6">
          {/* Goals Progress */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Goals Progress
              </h2>
              <Target className="text-gray-400" size={20} />
            </div>
            <div className="space-y-4">
              {mockGoals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{goal.name}</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`bg-primary-600 rounded-full h-2 transition-all duration-500`}
                      style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Overview */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Budget
              </h2>
              <AlertCircle className="text-gray-400" size={20} />
            </div>
            <div className="space-y-3">
              {mockBudgets.map((budget) => {
                const percentage = (budget.spent / budget.amount) * 100;
                const isOverBudget = percentage > 100;
                const isCloseToLimit = percentage > 80 && percentage <= 100;
                
                return (
                  <div key={budget.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{budget.category}</span>
                      <span className={`font-medium ${
                        isOverBudget ? 'text-red-600' : isCloseToLimit ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`rounded-full h-2 transition-all duration-500 ${
                          isOverBudget ? 'bg-red-600' : isCloseToLimit ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Preview */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="text-primary-600" size={24} />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Achievements
          </h2>
        </div>
        <div className="flex space-x-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center text-2xl mb-2">
              🦈
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Saving Shark</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Week 12/52</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-2xl mb-2">
              📱
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">M-Pesa Master</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">30 day streak</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-2xl mb-2">
              👑
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Budget King</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">No-spend weekend</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
