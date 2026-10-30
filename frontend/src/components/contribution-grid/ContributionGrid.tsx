// src/components/contribution-grid/ContributionGrid.tsx
// GitHub-style contribution grid for financial activity
// Redesigned: spacious cells, aligned labels, interactive tooltips, stats bar

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format, eachDayOfInterval, startOfYear, endOfYear, getMonth } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Flame, Award, Target, Calendar, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface DailyActivity {
  date: Date;
  count: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  transactions: any[];
  hasSavings: boolean;
  hasInvestment: boolean;
  budgetAdherence?: number;
  notes?: string;
}

interface ContributionGridProps {
  data: DailyActivity[];
  year: number;
  availableYears?: number[];
  onYearChange?: (year: number) => void;
  onDayClick?: (day: DailyActivity) => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

const ContributionGrid: React.FC<ContributionGridProps> = ({
  data,
  year,
  availableYears,
  onYearChange,
  onDayClick,
}) => {

  if (typeof window !== 'undefined') {
    const activeDays = data.filter((d) => d.count > 0).length;
    if (activeDays === 0 && data.length > 0) {
    }
  }
  const [hoveredDay, setHoveredDay] = useState<{ day: DailyActivity; x: number; y: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // ─────────────────────────────────────────────────────────────
  // Build the full year's data
  // ─────────────────────────────────────────────────────────────
  const days = useMemo(() => {
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(start);
    const allDays = eachDayOfInterval({ start, end });

    return allDays.map((date) => {
      const activity = data.find(
        (d) => format(new Date(d.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      return (
        activity || {
          date,
          count: 0,
          intensity: 0 as 0 | 1 | 2 | 3 | 4,
          transactions: [],
          hasSavings: false,
          hasInvestment: false,
        }
      );
    });
  }, [data, year]);

  // ─────────────────────────────────────────────────────────────
  // Group into weeks (columns)
  // ─────────────────────────────────────────────────────────────
  const weeks = useMemo(() => {
    const weeksArray: (DailyActivity | null)[][] = [];
    let currentWeek: (DailyActivity | null)[] = [];

    const firstDayOfYear = new Date(year, 0, 1).getDay();
    // date-fns getDay(): 0=Sun, 1=Mon, ..., 6=Sat
    // GitHub style: Mon first, so we shift Sun (0) to end (position 6)
    const offset = firstDayOfYear === 0 ? 6 : firstDayOfYear - 1;

    for (let i = 0; i < offset; i++) {
      currentWeek.push(null);
    }

    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeksArray.push(currentWeek);
    }

    return weeksArray;
  }, [days, year]);

  // ─────────────────────────────────────────────────────────────
  // Compute month label positions (week index where month starts)
  // ─────────────────────────────────────────────────────────────
  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week.find((d) => d !== null);
      if (!firstDayOfWeek) return;

      const month = getMonth(new Date(firstDayOfWeek.date));
      if (month !== lastMonth) {
        labels.push({ label: MONTHS[month], weekIndex });
        lastMonth = month;
      }
    });

    return labels;
  }, [weeks]);

  // ─────────────────────────────────────────────────────────────
  // Stats
  // ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const activeDays = days.filter((d) => d.count > 0).length;
    const totalTransactions = days.reduce((sum, d) => sum + d.count, 0);
    const maxCount = Math.max(...days.map((d) => d.count), 0);

    // Current streak (from most recent day backward)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = days.length - 1; i >= 0; i--) {
      const d = days[i];
      if (d.date > today) continue;
      if (d.count > 0) currentStreak++;
      else break;
    }

    // Best streak (longest consecutive run with count > 0)
    let bestStreak = 0;
    let running = 0;
    days.forEach((d) => {
      if (d.count > 0) {
        running++;
        bestStreak = Math.max(bestStreak, running);
      } else {
        running = 0;
      }
    });

    return {
      activeDays,
      totalTransactions,
      currentStreak,
      bestStreak,
      maxCount,
    };
  }, [days]);

  // ─────────────────────────────────────────────────────────────
  // Color mapping
  // ─────────────────────────────────────────────────────────────
  const getColorClass = (intensity: number): string => {
    switch (intensity) {
      case 0:
        return 'bg-ink-100 dark:bg-ink-800/60';
      case 1:
        return 'bg-emerald-200 dark:bg-emerald-900/60';
      case 2:
        return 'bg-brand-500 dark:bg-emerald-700';
      case 3:
        return 'bg-brand-500 dark:bg-brand-500';
      case 4:
        return 'bg-brand-500 dark:bg-emerald-300';
      default:
        return 'bg-ink-100 dark:bg-ink-800/60';
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Cell size (px) — responsive to container width
  // ─────────────────────────────────────────────────────────────
  const GAP = 3;
  const WEEKDAY_LABEL_WIDTH = 32;
  const MONTH_LABEL_HEIGHT = 20;
  const CELL_MIN = 11;
  const CELL_MAX = 22;

  const [cellSize, setCellSize] = useState(14);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-fit cell size to container width
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const fit = () => {
      const width = el.clientWidth - WEEKDAY_LABEL_WIDTH;
      const numWeeks = weeks.length || 53;
      // cellSize * numWeeks + gap * (numWeeks - 1) = width
      const ideal = Math.floor((width - GAP * (numWeeks - 1)) / numWeeks);
      setCellSize(Math.max(CELL_MIN, Math.min(ideal, CELL_MAX)));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [weeks.length]);

  const CELL_SIZE = cellSize;
  const CELL_WITH_GAP = CELL_SIZE + GAP;

  return (
    <div className="p-6 bg-ink-50 dark:bg-ink-900 rounded-lg shadow-sm border border-ink-200 dark:border-ink-800">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-50">
              Financial Activity
            </h3>

            {/* Year Selector */}
            {availableYears && availableYears.length > 0 && onYearChange ? (
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => onYearChange(Number(e.target.value))}
                  className={cn(
                    'appearance-none pl-8 pr-8 py-1.5 rounded-lg text-sm font-semibold',
                    'bg-ink-50 dark:bg-ink-800',
                    'text-ink-900 dark:text-ink-50',
                    'border border-ink-200 dark:border-ink-700',
                    'hover:border-primary-400 dark:hover:border-primary-500',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    'cursor-pointer transition-colors'
                  )}
                  aria-label="Select year"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <Calendar
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-600 dark:text-primary-400 pointer-events-none"
                />
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
                />
              </div>
            ) : (
              <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                {year}
              </span>
            )}
          </div>

          <p className="text-sm text-ink-500 dark:text-ink-400">
            {stats.totalTransactions} transaction{stats.totalTransactions !== 1 ? 's' : ''} across {stats.activeDays} active day{stats.activeDays !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((intensity) => (
              <div
                key={intensity}
                className={cn(
                  'w-3.5 h-3.5 rounded-[3px]',
                  getColorClass(intensity)
                )}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* ─── Grid (with horizontal scroll if needed) ─── */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
        <div
          ref={(el) => {
            (gridRef as any).current = el;
            (containerRef as any).current = el;
          }}
          style={{
            minWidth: `${WEEKDAY_LABEL_WIDTH + weeks.length * CELL_WITH_GAP}px`,
          }}
        >
          {/* Month labels row */}
          <div
            className="relative text-[11px] font-medium text-ink-500 dark:text-ink-400"
            style={{
              marginLeft: `${WEEKDAY_LABEL_WIDTH}px`,
              height: `${MONTH_LABEL_HEIGHT}px`,
            }}
          >
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="absolute top-0"
                style={{
                  left: `${m.weekIndex * CELL_WITH_GAP}px`,
                }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Grid rows: label column + week columns */}
          <div className="flex">
            {/* Weekday labels column */}
            <div
              className="flex flex-col shrink-0"
              style={{
                width: `${WEEKDAY_LABEL_WIDTH}px`,
                gap: `${GAP}px`,
              }}
            >
              {WEEKDAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="text-[11px] font-medium text-ink-500 dark:text-ink-400 flex items-center"
                  style={{ height: `${CELL_SIZE}px` }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Week columns */}
            <div className="flex" style={{ gap: `${GAP}px` }}>
              {weeks.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  className="flex flex-col shrink-0"
                  style={{ gap: `${GAP}px` }}
                >
                  {week.map((day, dayIndex) => {
                    if (!day) {
                      return (
                        <div
                          key={dayIndex}
                          style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                        />
                      );
                    }

                    const isHovered = hoveredDay?.day === day;

                    return (
                      <motion.button
                        key={dayIndex}
                        whileHover={{ scale: 1.35 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => onDayClick?.(day)}
                        onMouseEnter={(e) => {
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setHoveredDay({
                            day,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={cn(
                          'rounded-[3px] transition-colors',
                          getColorClass(day.intensity),
                          'hover:ring-2 hover:ring-emerald-400/60 hover:ring-offset-1 hover:ring-offset-white dark:hover:ring-offset-gray-900',
                          isHovered && 'ring-2 ring-emerald-400/60'
                        )}
                        style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                        aria-label={`${format(day.date, 'MMM d, yyyy')}: ${day.count} transactions`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stats bar ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-ink-200 dark:border-ink-800">
        <StatCard
          icon={TrendingUp}
          label="Active Days"
          value={`${stats.activeDays}`}
          color="text-brand-600 dark:text-brand-600"
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${stats.currentStreak} d`}
          color="text-orange-600 dark:text-orange-400"
          bg="bg-orange-50 dark:bg-orange-900/20"
        />
        <StatCard
          icon={Award}
          label="Best Streak"
          value={`${stats.bestStreak} d`}
          color="text-purple-600 dark:text-purple-400"
          bg="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatCard
          icon={Target}
          label="Busiest Day"
          value={`${stats.maxCount}`}
          color="text-brand-600 dark:text-brand-600"
          bg="bg-emerald-50 dark:bg-emerald-900/20"
        />
      </div>

      {/* ─── Tooltip (fixed position, follows cursor) ─── */}
      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: hoveredDay.x,
              top: hoveredDay.y - 8,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-gray-900 dark:bg-ink-800 text-white rounded-lg shadow-xl px-3 py-2 text-xs">
              <div className="font-semibold">
                {format(hoveredDay.day.date, 'EEEE, MMM d, yyyy')}
              </div>
              <div className="text-gray-300 mt-1">
                {hoveredDay.day.count} transaction{hoveredDay.day.count !== 1 ? 's' : ''}
              </div>
              {hoveredDay.day.hasSavings && (
                <div className="text-brand-600 mt-0.5">💰 Saved today</div>
              )}
              {hoveredDay.day.hasInvestment && (
                <div className="text-brand-600 mt-0.5">📈 Invested today</div>
              )}
              {hoveredDay.day.count === 0 && (
                <div className="text-ink-400 mt-0.5 italic">No activity</div>
              )}
            </div>
            {/* Arrow */}
            <div className="w-2 h-2 bg-gray-900 dark:bg-ink-800 rotate-45 mx-auto -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Stat card subcomponent
// ─────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: any;
  label: string;
  value: string;
  color: string;
  bg: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, bg }) => (
  <div className="flex items-center gap-3">
    <div className={cn('p-2 rounded-lg', bg)}>
      <Icon size={16} className={color} />
    </div>
    <div>
      <p className="text-xs text-ink-500 dark:text-ink-400">{label}</p>
      <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">{value}</p>
    </div>
  </div>
);

export default React.memo(ContributionGrid);
