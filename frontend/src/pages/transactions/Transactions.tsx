// src/pages/transactions/Transactions.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Plus, Download, Upload, 
  Calendar, ChevronDown, CreditCard, Smartphone,
  ShoppingBag, Car, Home, Coffee, Film, BookOpen,
  Briefcase, TrendingUp, PiggyBank, ArrowUpRight,
  ArrowDownRight, MoreVertical, Edit2, Trash2,
  Copy, FileText, Camera, Mic, X, Check
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const Transactions: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('This Month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  const filters = ['All', 'Income', 'Expenses', 'Investments', 'Savings'];
  
  const transactions = [
    { id: 1, description: 'Salary - KPLC', amount: 85000, type: 'income', category: 'Salary', date: '2024-01-15', time: '09:30 AM', icon: Briefcase, merchant: 'KPLC', status: 'completed', tags: ['monthly', 'salary'] },
    { id: 2, description: 'M-PESA to KCB Savings', amount: -5000, type: 'expense', category: 'Savings', date: '2024-01-14', time: '02:15 PM', icon: PiggyBank, merchant: 'KCB', status: 'completed', tags: ['savings', 'automated'] },
    { id: 3, description: 'Netflix Subscription', amount: -1450, type: 'expense', category: 'Entertainment', date: '2024-01-13', time: '11:20 AM', icon: Film, merchant: 'Netflix', status: 'completed', tags: ['subscription', 'recurring'] },
    { id: 4, description: 'Naivas Supermarket', amount: -3200, type: 'expense', category: 'Groceries', date: '2024-01-12', time: '06:45 PM', icon: ShoppingBag, merchant: 'Naivas', status: 'completed', tags: ['groceries', 'essential'] },
    { id: 5, description: 'CIC MMF Investment', amount: -10000, type: 'investment', category: 'Investment', date: '2024-01-11', time: '10:00 AM', icon: TrendingUp, merchant: 'CIC', status: 'pending', tags: ['investment', 'mmf'] },
    { id: 6, description: 'Safaricom Airtime', amount: -500, type: 'expense', category: 'Airtime', date: '2024-01-10', time: '08:30 AM', icon: Smartphone, merchant: 'Safaricom', status: 'completed', tags: ['airtime', 'mobile'] },
    { id: 7, description: 'Uber - Westlands', amount: -850, type: 'expense', category: 'Transport', date: '2024-01-09', time: '07:15 PM', icon: Car, merchant: 'Uber', status: 'completed', tags: ['transport', 'travel'] },
    { id: 8, description: 'Interest - CIC MMF', amount: 1250, type: 'income', category: 'Investment Returns', date: '2024-01-08', time: '09:00 AM', icon: TrendingUp, merchant: 'CIC', status: 'completed', tags: ['interest', 'investment'] },
  ];

  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'salary': return Briefcase;
      case 'savings': return PiggyBank;
      case 'entertainment': return Film;
      case 'groceries': return ShoppingBag;
      case 'investment': return TrendingUp;
      case 'airtime': return Smartphone;
      case 'transport': return Car;
      default: return CreditCard;
    }
  };

  const getAmountColor = (type: string) => {
    switch(type) {
      case 'income': return 'text-green-600';
      case 'expense': return 'text-red-600';
      case 'investment': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map(t => t.id.toString()));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(selectedTransactions.filter(t => t !== id));
    } else {
      setSelectedTransactions([...selectedTransactions, id]);
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const totalInvestments = transactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track all your financial activities
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<Download size={18} />}
            onClick={() => alert('Export feature coming soon!')}
          >
            Export
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => setShowAddModal(true)}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <ArrowUpRight className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">↑ 8.2% from last month</p>
        </Card>

        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
              <ArrowDownRight className="text-red-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">↓ 3.1% from last month</p>
        </Card>

        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Investments</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {formatCurrency(totalInvestments)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">↑ 15.3% from last month</p>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card variant="glass" className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search transactions by description, category, or merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter.toLowerCase())}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  selectedFilter === filter.toLowerCase()
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Date filter */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            <Calendar size={16} />
            <span>{selectedDate}</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-600 text-white p-4 rounded-lg flex items-center justify-between"
        >
          <span className="font-medium">{selectedTransactions.length} transactions selected</span>
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Download size={18} />
            </button>
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Trash2 size={18} />
            </button>
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Copy size={18} />
            </button>
            <button 
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              onClick={() => setSelectedTransactions([])}
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Transactions List */}
      <Card variant="glass" className="overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={selectedTransactions.length === transactions.length}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <div className="col-span-5">Description</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1 text-right">Amount</div>
          <div className="col-span-1"></div>
        </div>

        {/* Transactions */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          <AnimatePresence>
            {transactions.map((transaction, index) => {
              const Icon = getCategoryIcon(transaction.category);
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                    selectedTransactions.includes(transaction.id.toString()) && 'bg-primary-50 dark:bg-primary-900/20'
                  )}
                >
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction.id.toString())}
                      onChange={() => handleSelect(transaction.id.toString())}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                  <div className="col-span-5 flex items-center space-x-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/20' :
                      transaction.type === 'expense' ? 'bg-red-100 dark:bg-red-900/20' :
                      'bg-purple-100 dark:bg-purple-900/20'
                    )}>
                      <Icon className={
                        transaction.type === 'income' ? 'text-green-600' :
                        transaction.type === 'expense' ? 'text-red-600' :
                        'text-purple-600'
                      } size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.merchant} • {transaction.tags.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.category}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">{transaction.date}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.time}</p>
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <span className={cn('font-semibold', getAmountColor(transaction.type))}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreVertical size={16} className="text-gray-500" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing 1-8 of 24 transactions
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm">1</button>
            <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm">2</button>
            <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm">3</button>
            <button className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Add New Transaction
              </h2>
              
              <form className="space-y-4">
                {/* Transaction Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Income', 'Expense', 'Investment', 'Savings'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Salary, Groceries, etc."
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>Select category</option>
                    <option>Salary</option>
                    <option>Groceries</option>
                    <option>Transport</option>
                    <option>Entertainment</option>
                    <option>Savings</option>
                    <option>Investment</option>
                    <option>Bills</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* M-Pesa Code (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    M-Pesa Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., SDF34T6Y"
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Receipt Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attach Receipt
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
                    <Camera className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setShowAddModal(false)}
                  >
                    Add Transaction
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setShowAddModal(false)}
                  >
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

export default Transactions;
