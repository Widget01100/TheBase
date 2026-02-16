import React, { useState, useMemo } from 'react';
import { format, eachDayOfInterval, startOfYear, endOfYear, getMonth } from 'date-fns';

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
    
    const firstDayOfYear = new Date(year, 0, 1).getDay();
    for (let i = 0; i < firstDayOfYear; i++) {
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

  const months = useMemo(() => {
    const monthLabels: { label: string; position: number }[] = [];
    let lastMonth = -1;
    
    days.forEach((day, index) => {
      const month = getMonth(new Date(day.date));
      if (month !== lastMonth) {
        monthLabels.push({
          label: format(new Date(day.date), 'MMM'),
          position: Math.floor(index / 7),
        });
        lastMonth = month;
      }
    });
    
    return monthLabels;
  }, [days]);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Financial Activity {year}
        </h3>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Less</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((intensity) => (
              <div
                key={intensity}
                className={`w-4 h-4 ${getColorClass(intensity)} rounded-sm`}
              />
            ))}
          </div>
          <span className="text-gray-600 dark:text-gray-400">More</span>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        {/* Month labels */}
        <div className="flex ml-8 mb-2 text-xs text-gray-500 dark:text-gray-400">
          {months.map((month, i) => (
            <div
              key={i}
              className="absolute text-xs"
              style={{ left: `${month.position * 16 + 32}px` }}
            >
              {month.label}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day of week labels */}
          <div className="flex flex-col mr-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="h-4 mb-0.5">Mon</div>
            <div className="h-4 mb-0.5">Wed</div>
            <div className="h-4 mb-0.5">Fri</div>
          </div>

          {/* Contribution grid */}
          <div className="flex">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col mr-0.5">
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return <div key={dayIndex} className="w-4 h-4 mb-0.5 bg-transparent" />;
                  }

                  return (
                    <button
                      key={dayIndex}
                      onClick={() => onDayClick?.(day)}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-4 h-4 mb-0.5 rounded-sm ${getColorClass(
                        day.intensity
                      )} transition-all hover:scale-150 hover:z-10 relative group`}
                      title={`${format(new Date(day.date), 'MMM d, yyyy')}: ${day.count} transactions`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div 
            className="absolute bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none z-20"
            style={{
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <div>{format(new Date(hoveredDay.date), 'MMM d, yyyy')}</div>
            <div>{hoveredDay.count} transactions</div>
            {hoveredDay.hasSavings && <div>💰 Saved</div>}
            {hoveredDay.hasInvestment && <div>📈 Invested</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributionGrid;
