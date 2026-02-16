import React, { useState, useEffect } from 'react';
import { Smartphone, Wifi, Battery, Signal } from 'lucide-react';

interface MpesaStatusProps {
  showDetails?: boolean;
}

const MpesaStatus: React.FC<MpesaStatusProps> = ({ showDetails = false }) => {
  const [balance, setBalance] = useState<string | null>(null);
  const [fulizaBalance, setFulizaBalance] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  useEffect(() => {
    // Simulate fetching M-Pesa data
    setBalance('15,450');
    setFulizaBalance('2,500');
  }, []);

  if (showDetails) {
    return (
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Smartphone size={20} />
            <span className="font-semibold">M-Pesa</span>
          </div>
          <div className="flex items-center space-x-1">
            <Signal size={16} />
            <Wifi size={16} />
            <Battery size={16} />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-green-100">M-Pesa Balance</span>
            <span className="font-bold">KSh {balance}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-100">Fuliza Limit</span>
            <span className="font-bold">KSh {fulizaBalance}</span>
          </div>
          <div className="flex justify-between text-xs text-green-200 mt-2">
            <span>Last synced: {lastSync.toLocaleTimeString()}</span>
            <span>Auto-sync on</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-green-700 dark:text-green-300">M-Pesa Connected</span>
      </div>
    </div>
  );
};

export default MpesaStatus;
