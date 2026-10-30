// src/components/shared/ConfirmModal.tsx
// Reusable confirmation dialog for destructive actions

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  if (!isOpen) return null;

  const iconColors = {
    danger: 'text-red-600 bg-red-100 dark:bg-red-900/20',
    warning: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
    primary: 'text-primary-600 bg-primary-100 dark:bg-primary-900/20',
  };

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
          className="bg-ink-50 dark:bg-ink-900 rounded-lg shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-ink-200 dark:border-ink-800">
            <div className="flex items-center space-x-3">
              <div className={cn('p-3 rounded-xl', iconColors[variant])}>
                <AlertTriangle size={22} />
              </div>
              <h2 className="text-lg font-bold text-ink-900 dark:text-ink-50">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-ink-100 dark:hover:bg-gray-800 rounded-lg"
              aria-label="Close"
            >
              <X size={18} className="text-ink-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-sm text-ink-600 dark:text-ink-400 leading-relaxed">{message}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 bg-ink-50 dark:bg-ink-800/50 border-t border-ink-200 dark:border-ink-800">
            <Button variant="outline" onClick={onClose}>
              {cancelText}
            </Button>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Local cn helper (in case the parent doesn't import it)
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default ConfirmModal;
