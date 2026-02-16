import React, { useState, useEffect } from 'react';
import ContributionGrid from './ContributionGrid';
import { DailyActivity } from '@/types';
import { generateMockData } from '@/data/mockContributionData';

interface ContributionGridWithDataProps {
  year?: number;
  userId?: string;
}

const ContributionGridWithData: React.FC<ContributionGridWithDataProps> = ({ 
  year = new Date().getFullYear(),
  userId 
}) => {
  const [data, setData] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DailyActivity | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockData = generateMockData(year);
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, [year]);

  const handleDayClick = (day: DailyActivity) => {
    setSelectedDay(day);
  };

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ContributionGrid 
        data={data} 
        year={year} 
        onDayClick={handleDayClick}
      />
      
      {selectedDay && (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Transactions on {new Date(selectedDay.date).toLocaleDateString()}
          </h4>
          {selectedDay.transactions.length > 0 ? (
            <ul className="space-y-2">
              {selectedDay.transactions.map((transaction) => (
                <li key={transaction.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {transaction.description}
                  </span>
                  <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                    {transaction.amount > 0 ? '+' : '-'} KES {Math.abs(transaction.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No transactions on this day</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ContributionGridWithData;
