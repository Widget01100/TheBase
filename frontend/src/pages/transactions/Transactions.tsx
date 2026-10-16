// src/pages/transactions/Transactions.tsx
// Smart transactions explorer — date grouping, live counts, multiple views

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Download, Calendar, ChevronDown, CreditCard,
  Smartphone, ShoppingBag, Car, Briefcase, TrendingUp, PiggyBank,
  ArrowUpRight, ArrowDownRight, MoreVertical, Edit2, Trash2, Copy,
  FileText, Camera, X, Eye, LayoutGrid, List as ListIcon, ChevronRight,
  ArrowUpDown, Hash, Clock,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import RowMenu from '@/components/shared/RowMenu';
import ConfirmModal from '@/components/shared/ConfirmModal';
import ExportModal from '@/components/shared/ExportModal';
import EmptyState from '@/components/shared/EmptyState';
import { initialTransactions, type AppTransaction } from '@/data/transactions';
import { useFormatCurrency, useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { ExportableTransaction } from '@/utils/export/exportUtils';

// ─────────────────────────────────────────────────────────────
// Categories with colors and icons
// ─────────────────────────────────────────────────────────────
const CATEGORY_META: Record<string, { color: string; bg: string }> = {
  Food: { color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20' },
  Transport: { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
  Housing: { color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
  Utilities: { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
  Entertainment: { color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/20' },
  Groceries: { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
  Shopping: { color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/20' },
  Healthcare: { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' },
  Education: { color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/20' },
  Salary: { color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
  Business: { color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/20' },
  Investment: { color: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-900/20' },
  'Investment Returns': { color: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-900/20' },
  Savings: { color: 'text-lime-600', bg: 'bg-lime-100 dark:bg-lime-900/20' },
  Airtime: { color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/20' },
  Travel: { color: 'text-sky-600', bg: 'bg-sky-100 dark:bg-sky-900/20' },
  Gift: { color: 'text-fuchsia-600', bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/20' },
};

const getCategoryMeta = (category: string) =>
  CATEGORY_META[category] || { color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' };

// ─────────────────────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────────────────────
const formatDateGroup = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const txDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (txDate.getTime() === today.getTime()) return 'Today';
  if (txDate.getTime() === yesterday.getTime()) return 'Yesterday';
  if (txDate >= weekAgo) return 'This Week';
  if (txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear()) {
    return 'Earlier This Month';
  }
  return date.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
};

// ─────────────────────────────────────────────────────────────
// Filter definitions
// ─────────────────────────────────────────────────────────────
type FilterId = 'all' | 'income' | 'expenses' | 'investments' | 'savings';
type SortBy = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
type ViewMode = 'timeline' | 'category';

interface TransactionsProps {}

const Transactions: React.FC<TransactionsProps> = () => {
  const fmtMoney = useFormatCurrency();
  const { currency } = useCurrency();

  // State
  const [transactionsList, setTransactionsList] = useState<AppTransaction[]>(initialTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterId>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; ids: string[] }>({ open: false, ids: [] });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // ─── Filtered list ───
  const filtered = useMemo(() => {
    let result = [...transactionsList];

    // Type filter
    if (selectedFilter === 'income') result = result.filter((t) => t.type === 'income');
    else if (selectedFilter === 'expenses') result = result.filter((t) => t.type === 'expense');
    else if (selectedFilter === 'investments') result = result.filter((t) => t.type === 'investment');
    else if (selectedFilter === 'savings') result = result.filter((t) => t.type === 'saving');

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.merchant && t.merchant.toLowerCase().includes(q)) ||
          (t.tags || []).some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortBy) {
      case 'date-asc':
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'amount-desc':
        result.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
        break;
      case 'amount-asc':
        result.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
        break;
      case 'date-desc':
      default:
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return result;
  }, [transactionsList, selectedFilter, categoryFilter, searchQuery, sortBy]);

  // ─── Filter counts ───
  const filterCounts = useMemo(() => {
    const counts = {
      all: transactionsList.length,
      income: 0,
      expenses: 0,
      investments: 0,
      savings: 0,
    };
    transactionsList.forEach((t) => {
      if (t.type === 'income') counts.income++;
      else if (t.type === 'expense') counts.expenses++;
      else if (t.type === 'investment') counts.investments++;
      else if (t.type === 'saving') counts.savings++;
    });
    return counts;
  }, [transactionsList]);

  // ─── Categories available ───
  const availableCategories = useMemo(() => {
    const cats = new Set(transactionsList.map((t) => t.category));
    return ['all', ...Array.from(cats).sort()];
  }, [transactionsList]);

  // ─── Group by date (for timeline view) ───
  const groupedByDate = useMemo(() => {
    const groups: Record<string, AppTransaction[]> = {};
    filtered.forEach((t) => {
      const key = formatDateGroup(t.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    // Sort group keys: Today, Yesterday, This Week, Earlier This Month, then months
    const priority = ['Today', 'Yesterday', 'This Week', 'Earlier This Month'];
    const ordered = Object.keys(groups).sort((a, b) => {
      const ai = priority.indexOf(a);
      const bi = priority.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      // both are month names — sort descending by actual date
      return new Date(groups[b][0].date).getTime() - new Date(groups[a][0].date).getTime();
    });

    return ordered.map((key) => ({ label: key, transactions: groups[key] }));
  }, [filtered]);

  // ─── Group by category ───
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, AppTransaction[]> = {};
    filtered.forEach((t) => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });

    return Object.entries(groups)
      .map(([category, transactions]) => ({
        label: category,
        transactions,
        total: transactions.reduce((sum, t) => sum + t.amount, 0),
      }))
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  }, [filtered]);

  // ─── Summary ───
  const summary = useMemo(() => {
    const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount), 0);
    const expenses = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
    const investments = filtered.filter((t) => t.type === 'investment').reduce((s, t) => s + Math.abs(t.amount), 0);
    const savings = filtered.filter((t) => t.type === 'saving').reduce((s, t) => s + Math.abs(t.amount), 0);
    return { income, expenses, investments, savings, count: filtered.length };
  }, [filtered]);

  // ─── Handlers ───
  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleSelect = (id: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === filtered.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filtered.map((t) => t.id));
    }
  };

  const handleRowDelete = (id: string) => setConfirmDelete({ open: true, ids: [id] });
  const handleRowDuplicate = (id: string) => {
    const orig = transactionsList.find((t) => t.id === id);
    if (!orig) return;
    const copy = { ...orig, id: String(Date.now() + Math.random()), description: `${orig.description} (copy)` };
    setTransactionsList((prev) => [copy, ...prev]);
    toast.success('Transaction duplicated');
  };
  const handleRowView = (id: string) => toast.success(`Viewing transaction #${id}`);
  const handleRowEdit = (id: string) => toast.success(`Edit transaction #${id}`);

  const handleBulkDelete = () => {
    const ids = [...selectedTransactions];
    setTransactionsList((prev) => prev.filter((t) => !ids.includes(t.id)));
    setSelectedTransactions([]);
    toast.success(`${ids.length} deleted`);
  };
  const handleBulkDuplicate = () => {
    const ids = [...selectedTransactions];
    const toDup = transactionsList.filter((t) => ids.includes(t.id));
    const copies = toDup.map((t) => ({
      ...t,
      id: String(Date.now() + Math.random()),
      description: `${t.description} (copy)`,
    }));
    setTransactionsList((prev) => [...copies, ...prev]);
    setSelectedTransactions([]);
    toast.success(`${ids.length} duplicated`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'salary': return Briefcase;
      case 'savings': return PiggyBank;
      case 'entertainment': return FileText;
      case 'groceries': return ShoppingBag;
      case 'investment': return TrendingUp;
      case 'investment returns': return TrendingUp;
      case 'airtime': return Smartphone;
      case 'transport': return Car;
      case 'food': return ShoppingBag;
      case 'housing': return Briefcase;
      case 'utilities': return Smartphone;
      default: return CreditCard;
    }
  };

  const getAmountColor = (type: string) => {
    if (type === 'income') return 'text-green-600';
    if (type === 'saving') return 'text-lime-600';
    if (type === 'investment') return 'text-purple-600';
    return 'text-red-600';
  };

  const filters: { id: FilterId; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'income', label: 'Income' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'investments', label: 'Investments' },
    { id: 'savings', label: 'Savings' },
  ];

  // ─── Render transaction row ───
  const renderTransactionRow = (t: AppTransaction, index: number) => {
    const Icon = getCategoryIcon(t.category);
    const meta = getCategoryMeta(t.category);

    return (
      <motion.div
        key={t.id}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ delay: Math.min(index * 0.015, 0.25) }}
        className={cn(
          'grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group',
          selectedTransactions.includes(t.id) && 'bg-primary-50 dark:bg-primary-900/20'
        )}
      >
        <div className="col-span-1 flex items-center">
          <input
            type="checkbox"
            checked={selectedTransactions.includes(t.id)}
            onChange={() => handleSelect(t.id)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </div>
        <div className="col-span-5 flex items-center space-x-3 min-w-0">
          <div className={cn('p-2 rounded-lg shrink-0', meta.bg)}>
            <Icon className={meta.color} size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {t.description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {t.merchant} • {t.tags?.slice(0, 2).join(', ')}
            </p>
          </div>
        </div>
        <div className="col-span-2 flex items-center">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', meta.bg, meta.color)}>
            {t.category}
          </span>
        </div>
        <div className="col-span-2 flex items-center">
          <div>
            <p className="text-sm text-gray-900 dark:text-white">
              {new Date(t.date).toLocaleDateString('en-KE', { day: '2-digit', month: 'short' })}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.time}</p>
          </div>
        </div>
        <div className="col-span-1 flex items-center justify-end">
          <span className={cn('font-semibold text-sm whitespace-nowrap', getAmountColor(t.type))}>
            {t.amount > 0 ? '+' : ''}{fmtMoney(t.amount)}
          </span>
        </div>
        <div className="col-span-1 flex items-center justify-end">
          <RowMenu
            items={[
              { label: 'View details', icon: Eye, onClick: () => handleRowView(t.id) },
              { label: 'Edit', icon: Edit2, onClick: () => handleRowEdit(t.id) },
              { label: 'Duplicate', icon: Copy, onClick: () => handleRowDuplicate(t.id) },
              { label: 'Delete', icon: Trash2, variant: 'danger', divider: true, onClick: () => handleRowDelete(t.id) },
            ]}
          />
        </div>
      </motion.div>
    );
  };

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
            {summary.count} of {transactionsList.length} transactions shown
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<Download size={18} />}
            onClick={() => setShowExportModal(true)}
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

      {/* Summary Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
          <p className="text-lg font-bold text-green-600 mt-1">{fmtMoney(summary.income)}</p>
        </Card>
        <Card variant="glass" className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Expenses</p>
          <p className="text-lg font-bold text-red-600 mt-1">{fmtMoney(summary.expenses)}</p>
        </Card>
        <Card variant="glass" className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Investments</p>
          <p className="text-lg font-bold text-purple-600 mt-1">{fmtMoney(summary.investments)}</p>
        </Card>
        <Card variant="glass" className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Savings</p>
          <p className="text-lg font-bold text-lime-600 mt-1">{fmtMoney(summary.savings)}</p>
        </Card>
      </div>

      {/* Filters Row 1: Search + Type tabs + View toggle */}
      <Card variant="glass" className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by description, merchant, category, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Type tabs with counts */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 lg:pb-0">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5',
                  selectedFilter === f.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                    selectedFilter === f.id
                      ? 'bg-white/20'
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}
                >
                  {filterCounts[f.id]}
                </span>
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('timeline')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
              title="Timeline view"
            >
              <ListIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'category'
                  ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
              title="Category view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </Card>

      {/* Filters Row 2: Category + Sort */}
      <Card variant="glass" className="p-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={16} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

          {/* Active filter chips */}
          {categoryFilter !== 'all' && (
            <button
              onClick={() => setCategoryFilter('all')}
              className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full text-xs hover:bg-primary-200"
            >
              {categoryFilter}
              <X size={12} />
            </button>
          )}
        </div>
      </Card>

      {/* Bulk actions */}
      <AnimatePresence>
        {selectedTransactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-primary-600 text-white p-3 rounded-lg flex items-center justify-between"
          >
            <span className="font-medium text-sm">
              {selectedTransactions.length} selected
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowExportModal(true)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Export selected"
              >
                <Download size={16} />
              </button>
              <button
                onClick={() => setConfirmDelete({ open: true, ids: [...selectedTransactions] })}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Delete selected"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={handleBulkDuplicate}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Duplicate"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={() => setSelectedTransactions([])}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Clear selection"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transactions list */}
      <Card variant="glass" className="overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={filtered.length > 0 && selectedTransactions.length === filtered.length}
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

        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No transactions found"
            description={
              searchQuery || categoryFilter !== 'all' || selectedFilter !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Start tracking your finances by adding your first transaction.'
            }
            actionLabel={
              searchQuery || categoryFilter !== 'all' || selectedFilter !== 'all'
                ? 'Clear filters'
                : 'Add Transaction'
            }
            onAction={() => {
              if (searchQuery || categoryFilter !== 'all' || selectedFilter !== 'all') {
                setSearchQuery('');
                setCategoryFilter('all');
                setSelectedFilter('all');
              } else {
                setShowAddModal(true);
              }
            }}
            color="primary"
          />
        ) : viewMode === 'timeline' ? (
          // ─── Timeline view ───
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            <AnimatePresence>
              {groupedByDate.map((group) => {
                const isCollapsed = expandedGroups.has(`date:${group.label}`);
                const groupTotal = group.transactions.reduce((sum, t) => sum + t.amount, 0);

                return (
                  <div key={group.label}>
                    {/* Group header */}
                    <button
                      onClick={() => toggleGroup(`date:${group.label}`)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          size={16}
                          className={cn(
                            'text-gray-400 transition-transform',
                            !isCollapsed && 'rotate-90'
                          )}
                        />
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                          {group.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({group.transactions.length})
                        </span>
                      </div>
                      <span className={cn(
                        'text-sm font-semibold',
                        groupTotal >= 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {groupTotal >= 0 ? '+' : ''}{fmtMoney(groupTotal)}
                      </span>
                    </button>

                    {/* Transactions in group */}
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {group.transactions.map((t, i) => renderTransactionRow(t, i))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          // ─── Category view ───
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            <AnimatePresence>
              {groupedByCategory.map((group) => {
                const isCollapsed = expandedGroups.has(`cat:${group.label}`);
                const meta = getCategoryMeta(group.label);
                const Icon = getCategoryIcon(group.label);

                return (
                  <div key={group.label}>
                    {/* Category header */}
                    <button
                      onClick={() => toggleGroup(`cat:${group.label}`)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          size={16}
                          className={cn(
                            'text-gray-400 transition-transform',
                            !isCollapsed && 'rotate-90'
                          )}
                        />
                        <div className={cn('p-1.5 rounded-md', meta.bg)}>
                          <Icon size={14} className={meta.color} />
                        </div>
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                          {group.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({group.transactions.length})
                        </span>
                      </div>
                      <span className={cn(
                        'text-sm font-semibold',
                        group.total >= 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {group.total >= 0 ? '+' : ''}{fmtMoney(group.total)}
                      </span>
                    </button>

                    {/* Transactions */}
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {group.transactions.map((t, i) => renderTransactionRow(t, i))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Add modal */}
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
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Add Transaction
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Coming soon — full form with M-Pesa import.
              </p>
              <Button variant="primary" fullWidth onClick={() => setShowAddModal(false)}>
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm modal */}
      <ConfirmModal
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, ids: [] })}
        onConfirm={() => {
          const ids = confirmDelete.ids;
          setTransactionsList((prev) => prev.filter((t) => !ids.includes(t.id)));
          setSelectedTransactions((prev) => prev.filter((id) => !ids.includes(id)));
          toast.success(`${ids.length} deleted`);
        }}
        title={confirmDelete.ids.length > 1 ? `Delete ${confirmDelete.ids.length} transactions?` : 'Delete transaction?'}
        message="This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      {/* Export modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        transactions={filtered.map((t): ExportableTransaction => ({
          id: t.id,
          description: t.description,
          category: t.category,
          type: t.type as any,
          date: new Date(t.date).toISOString().split('T')[0],
          time: t.time,
          amount: t.amount,
          merchant: t.merchant,
          tags: t.tags,
        }))}
        title="Export Transactions"
      />
    </motion.div>
  );
};

export default Transactions;
