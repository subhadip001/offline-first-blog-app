import React from 'react';
import { useTinybase } from '@/providers/TinybaseProvider';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export function SyncIndicator() {
  const { isOnline, lastSync } = useTinybase();
  
  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center space-x-3">
      <div className="flex items-center">
        {isOnline ? (
          <Wifi className="w-5 h-5 text-green-500" />
        ) : (
          <WifiOff className="w-5 h-5 text-red-500" />
        )}
      </div>
      
      <div className="text-sm">
        <div className={isOnline ? "text-green-600" : "text-red-600"}>
          {isOnline ? "Online" : "Offline"}
        </div>
        <div className="text-gray-500 text-xs">
          Last sync: {formatLastSync(lastSync)}
        </div>
      </div>
      
      {!isOnline && (
        <div className="flex items-center text-xs text-gray-500">
          <RefreshCw className="w-4 h-4 mr-1 animate-spin"/>
          Changes will sync when online
        </div>
      )}
    </div>
  );
}