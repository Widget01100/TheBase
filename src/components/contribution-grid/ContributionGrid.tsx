import React, { useState, useMemo } from 'react';
import { format, eachDayOfInterval, startOfYear, endOfYear, getMonth, getWeek } from 'date-fns';
import { DailyActivity } from '@/types';

interface ContributionGridProps {
  data: DailyActivity[];
  year: number;
  onDayClick?: (day: DailyActivity) => void;
}

const ContributionGrid: React.FC<ContributionGridProps> = ({ data, year, onDayClick }) => {
  const [hoveredDay, setHoveredDay] = useState<DailyActivity | null>(null);
  
  const days = useMemo(() => {
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(start);
    const allDays = eachDayOfInterval({ start, end });
    
    return allDays.map(date => {
      const activity = data.find(d => 
        format(new Date(d.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      return activity || {
        date,
        count: 0,
        intensity: 0,
        transactions: [],
        hasSavings: false,
        hasInvestment: false,
      };
    });
  }, [data, year]);

  const getColorClass = (intensity: number): string => {
    switch (intensity) {
      case 0: return 'bg-gray-100 dark:bg-gray-800';
      case 1: return 'bg-green-200 dark:bg-green-900';
      case 2: return 'bg-green-300 dark:bg-green-700';
      case 3: return 'bg-green-500 dark:bg-green-500';
      case 4: return 'bg-green-700 dark:bg-green-300';
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const weeks = useMemo(() => {
    const weeksArray: (DailyActivity | null)[][] = [];
    let currentWeek: (DailyActivity | null)[] = [];
    
    // Add empty cells for days before the first day of the year
    const firstDayOfYear = new Date(year, 0, 1).getDay();
    for (let i = 0; i < firstDayOfYear; i++) {
      currentWeek.push(null);
    }
    
    days.forEach((day, index) => {
      currentWeek.push(day);
      
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Add empty cells for remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeksArray.push(currentWeek);
    }
    
    return weeksArray;
  }, [days, year]);

  const months = useMemo(() => {
    const monthLabels: { index: number; label: string; position: number }[] = [];
    let lastMonth = -1;
    
    days.forEach((day, index) => {
      const month = getMonth(new Date(day.date));
      if (month !== lastMonth) {
        monthLabels.push({
          index: month,
          label: format(new Date(day.date), 'MMM'),
          position: Math.floor(index / 7),
        });
        lastMonth = month;
      }
    });
    
    return monthLabels;
  }, [days]);

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Financial Activity {year}
        </h3>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Less</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((intensity) => (
              <div
                key={intensity}
                className={`w-4 h-4 ${getColorClass(intensity)} rounded`}
              />
            ))}
          </div>
          <span className="text-gray-600 dark:text-gray-400">More</span>
        </div>
      </div>

      <div className="relative">
        {/* Month labels */}
        <div className="flex mb-2 text-xs text-gray-500 dark:text-gray-400">
          {months.map((month, i) => (
            <div
              key={i}
              className="absolute"
              style={{ left: `${month.position * 2}rem` }}
            >
              {month.label}
            </div>
          ))}
        </div>

        {/* Day of week labels */}
        <div className="flex text-xs text-gray-500 dark:text-gray-400 mt-6">
          <div className="w-8">Mon</div>
          <div className="w-8">Wed</div>
          <div className="w-8">Fri</div>
        </div>

        {/* Contribution grid */}
        <div className="flex mt-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col">
              {week.map((day, dayIndex) => {
                if (!day) {
                  return <div key={dayIndex} className="w-4 h-4 m-0.5" />;
                }

                return (
                  <button
                    key={dayIndex}
                    onClick={() => onDayClick?.(day)}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-4 h-4 m-0.5 rounded ${getColorClass(
                      day.intensity
                    )} transition-transform hover:scale-150 hover:z-10 relative group`}
                  >
                    {/* Tooltip */}
                    {hoveredDay === day && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-20">
                        <div>{format(new Date(day.date), 'MMMM d, yyyy')}</div>
                        <div>{day.count} transactions</div>
                        {day.hasSavings && <div>💰 Saved</div>}
                        {day.hasInvestment && <div>📈 Invested</div>}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Days Active</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">
            {data.filter(d => d.count > 0).length}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Current Streak</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">
            {calculateStreak(days)} days
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Saved</div>
          <div className="text-xl font-semibold text-green-600 dark:text-green-400">
            KES {formatNumber(data.reduce((sum, d) => sum + (d.hasSavings ? 1 : 0), 0) * 1000)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Best Day</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">
            {formatNumber(Math.max(...data.map(d => d.count)))}
          </div>
        </div>
      </div>
    </div>
  );
};

const calculateStreak = (days: DailyActivity[]): number => {
  let currentStreak = 0;
  const today = new Date();
  
  for (let i = days.length - 1; i >= 0; i--) {
    if (format(new Date(days[i].date), 'yyyy-MM-dd') <= format(today, 'yyyy-MM-dd')) {
      if (days[i].count > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  return currentStreak;
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

export default ContributionGrid;
