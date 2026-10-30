// src/components/shared/ExportModal.tsx
// Beautiful export dialog with format selection, filters, and preview

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  FileJson,
  FileSpreadsheet,
  Download,
  X,
  Calendar,
  Filter,
  Check,
  Sparkles,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { exportToCSV, exportToJSON, exportToPDF } from '@/utils/export/exportUtils';
import type { ExportableTransaction } from '@/utils/export/exportUtils';

export type ExportFormat = 'pdf' | 'csv' | 'json';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: ExportableTransaction[];
  title?: string;
}

const formatOptions: {
  id: ExportFormat;
  name: string;
  description: string;
  icon: any;
  color: string;
  extension: string;
}[] = [
  {
    id: 'pdf',
    name: 'PDF Report',
    description: 'Beautiful formatted report with branding. Best for printing or sharing.',
    icon: FileText,
    color: 'text-red-600 bg-red-100 dark:bg-red-900/20',
    extension: '.pdf',
  },
  {
    id: 'csv',
    name: 'CSV Spreadsheet',
    description: 'Opens in Excel or Google Sheets. Best for analysis and calculations.',
    icon: FileSpreadsheet,
    color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    extension: '.csv',
  },
  {
    id: 'json',
    name: 'JSON Data',
    description: 'Raw data export. Best for developers and backups.',
    icon: FileJson,
    color: 'text-brand-600 bg-blue-100 dark:bg-blue-900/20',
    extension: '.json',
  },
];

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  title = 'Export Transactions',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'week' | 'custom'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'investment' | 'savings'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Apply filters to transactions
  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;

    if (dateRange !== 'all') {
      const txDate = new Date(t.date);
      const now = new Date();
      if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return txDate >= weekAgo;
      }
      if (dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return txDate >= monthAgo;
      }
    }
    return true;
  });

  const handleExport = async () => {
    setIsExporting(true);

    // Small delay for UX (so button shows loading)
    await new Promise((resolve) => setTimeout(resolve, 400));

    try {
      const options = {
        title: 'The Base — Transaction Report',
        subtitle: `${filteredTransactions.length} transactions • ${new Date().toLocaleDateString('en-KE', { dateStyle: 'long' })}`,
      };

      if (selectedFormat === 'pdf') {
        exportToPDF(filteredTransactions, options);
      } else if (selectedFormat === 'csv') {
        exportToCSV(filteredTransactions, options);
      } else if (selectedFormat === 'json') {
        exportToJSON(filteredTransactions, options);
      }

      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-ink-50 dark:bg-ink-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-ink-200 dark:border-ink-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
                <Download className="text-primary-600" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">{title}</h2>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  {transactions.length} transactions available
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-ink-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-ink-500" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Format selection */}
            <div>
              <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-50 mb-3 uppercase tracking-wide">
                Choose Format
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {formatOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedFormat === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedFormat(option.id)}
                      className={cn(
                        'relative p-4 rounded-xl border-2 text-left transition-all',
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                          : 'border-ink-200 dark:border-ink-800 hover:border-ink-300 dark:hover:border-gray-700'
                      )}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center"
                        >
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                      <div className={cn('p-2 rounded-lg inline-block mb-3', option.color)}>
                        <Icon size={20} />
                      </div>
                      <h4 className="font-semibold text-sm text-ink-900 dark:text-ink-50 mb-1">
                        {option.name}
                      </h4>
                      <p className="text-xs text-ink-500 dark:text-ink-400 leading-relaxed">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date range */}
              <div>
                <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-50 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Calendar size={14} />
                  Date Range
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'month', 'week'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        dateRange === range
                          ? 'bg-primary-600 text-white'
                          : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-gray-700'
                      )}
                    >
                      {range === 'all' ? 'All Time' : range === 'month' ? 'Last 30 days' : 'Last 7 days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type filter */}
              <div>
                <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-50 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Filter size={14} />
                  Transaction Type
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'income', 'expense', 'investment', 'savings'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                        typeFilter === type
                          ? 'bg-primary-600 text-white'
                          : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-gray-700'
                      )}
                    >
                      {type === 'all' ? 'All' : type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-ink-50 dark:bg-ink-900 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl border border-primary-100 dark:border-primary-900/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-primary-600" />
                <span className="text-sm font-semibold text-ink-900 dark:text-ink-50">Export Preview</span>
              </div>
              <p className="text-sm text-ink-600 dark:text-ink-400">
                You're about to export <strong className="text-primary-600">{filteredTransactions.length}</strong> transactions
                as a <strong className="text-primary-600">{formatOptions.find(f => f.id === selectedFormat)?.name}</strong>.
              </p>
              <p className="text-xs text-ink-500 dark:text-ink-500 mt-2">
                📅 Generated at:{' '}
                <strong className="text-ink-700 dark:text-ink-300">
                  {new Date().toLocaleString('en-KE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                  })}
                </strong>
              </p>
              {filteredTransactions.length === 0 && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium">
                  ⚠️ No transactions match your filters. Adjust them above.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-800/50">
            <p className="text-xs text-ink-500 dark:text-ink-400">
              File will download automatically
            </p>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose} disabled={isExporting}>
                Cancel
              </Button>
              <Button
                variant={exportComplete ? 'success' : 'primary'}
                onClick={handleExport}
                disabled={isExporting || filteredTransactions.length === 0}
                isLoading={isExporting && !exportComplete}
                icon={exportComplete ? <Check size={16} /> : <Download size={16} />}
              >
                {exportComplete
                  ? 'Downloaded!'
                  : isExporting
                  ? 'Exporting...'
                  : `Export ${formatOptions.find(f => f.id === selectedFormat)?.extension}`}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExportModal;
