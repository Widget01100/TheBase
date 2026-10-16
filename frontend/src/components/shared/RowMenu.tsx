// src/components/shared/RowMenu.tsx
// Reusable dropdown menu for table rows (transactions, goals, etc.)

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Eye, Edit2, Copy, Trash2, Share2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RowMenuItem {
  label: string;
  icon?: any;
  onClick: () => void;
  variant?: 'default' | 'danger';
  divider?: boolean;
}

interface RowMenuProps {
  items: RowMenuItem[];
  align?: 'left' | 'right';
}

const RowMenu: React.FC<RowMenuProps> = ({ items, align = 'right' }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={cn(
          'p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors',
          open && 'bg-gray-100 dark:bg-gray-700'
        )}
        aria-label="More actions"
      >
        <MoreVertical size={16} className="text-gray-500" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'absolute top-full mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            <div className="py-1">
              {items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <React.Fragment key={i}>
                    {item.divider && i > 0 && (
                      <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(false);
                        item.onClick();
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                        item.variant === 'danger'
                          ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      {Icon && <Icon size={15} />}
                      <span>{item.label}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RowMenu;
