import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Target,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Calendar,
  Award,
} from 'lucide-react';
import ContributionGridWithData from '@/components/contribution-grid/ContributionGridWithData';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Balance',
      value: 'KES 245,800',
      change: '+12.5%',
      trend: 'up',
      icon: Wallet,
      color: 'bg-blue-500',
    },
    {
      title: 'Monthly Income',
      value: 'KES 85,000',
      change: '+5.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Monthly Expenses',
      value: 'KES 52,300',
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

  const goals = [
    { id: 1, name: 'Emergency Fund', current: 150000, target: 300000, progress: 50, color: 'bg-green-500' },
    { id: 2, name: 'House Deposit', current: 50000, target: 500000, progress: 10, color: 'bg-blue-500' },
    { id: 3, name: 'Investment Portfolio', current: 75000, target: 100000, progress: 75, color: 'bg-purple-500' },
  ];

  const upcomingBills = [
    { id: 1, name: 'Rent', amount: 25000, dueDate: '2024-01-25', status: 'upcoming' },
    { id: 2, name: 'Electricity Bill', amount: 3500, dueDate: '2024-01-20', status: 'urgent' },
    { id: 3, name: 'Water Bill', amount: 800, dueDate: '2024-01-18', status: 'overdue' },
  ];

  const insights = [
    { id: 1, message: 'You spent 15% less on transport this month 🚗', type: 'positive' },
    { id: 2, message: 'Consider increasing your MMF contributions', type: 'info' },
    { id: 3, message: 'Fuliza repayment due in 3 days', type: 'warning' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, John! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's your financial summary for January 2024
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-lg shadow">
          <Calendar className="text-gray-500" size={20} />
          <span className="text-gray-700 dark:text-gray-300">Jan 15, 2024</span>
        </div>
      </div>

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
              className="bg-white dark:bg-gray-900 rounded-lg shadow p-6"
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
      <ContributionGridWithData year={2024} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
              View All
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
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} KES
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Goals Progress */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Goals Progress
              </h2>
              <Target className="text-gray-400" size={20} />
            </div>
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{goal.name}</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${goal.color} rounded-full h-2 transition-all duration-500`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    KES {goal.current.toLocaleString()} / KES {goal.target.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Bills */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Bills
              </h2>
              <AlertCircle className="text-gray-400" size={20} />
            </div>
            <div className="space-y-3">
              {upcomingBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{bill.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Due: {bill.dueDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      KES {bill.amount.toLocaleString()}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      bill.status === 'urgent' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      bill.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {bill.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="text-primary-600" size={24} />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Insights from Malkia
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg ${
                insight.type === 'positive' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
                'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }`}
            >
              <p className="text-sm text-gray-700 dark:text-gray-300">{insight.message}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
