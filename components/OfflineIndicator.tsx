'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi, Download } from 'lucide-react';
import { offlineStorage } from '@/lib/db/offline-storage';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<any>(null);
  const [isPreloading, setIsPreloading] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);
    
    // Check cache status
    offlineStorage.getCacheStatus().then(setCacheStatus);

    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Sync annotations when coming back online
      offlineStorage.syncAnnotations();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check cache status periodically
    const interval = setInterval(() => {
      offlineStorage.getCacheStatus().then(setCacheStatus);
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handlePreloadBible = async () => {
    setIsPreloading(true);
    await offlineStorage.preloadBible();
    const status = await offlineStorage.getCacheStatus();
    setCacheStatus(status);
    setIsPreloading(false);
  };

  const percentCached = cacheStatus 
    ? Math.round((cacheStatus.currentlyCached / 1189) * 100)
    : 0;

  return (
    <>
      {/* Connection status toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg
            ${isOnline 
              ? 'bg-green-500 text-white' 
              : 'bg-orange-500 text-white'}`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Back online - syncing...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Offline mode - changes will sync later</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cache status indicator */}
      {cacheStatus && !cacheStatus.isComplete && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Offline Bible
              </span>
              <span className="text-xs text-gray-500">
                {percentCached}% cached
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-water-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentCached}%` }}
              />
            </div>
            
            {!isPreloading ? (
              <button
                onClick={handlePreloadBible}
                className="text-xs text-water-600 hover:text-water-700 flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Download all for offline
              </button>
            ) : (
              <span className="text-xs text-gray-500">
                Downloading... {cacheStatus.currentlyCached}/1189 chapters
              </span>
            )}
          </div>
        </div>
      )}

      {/* Permanent offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-1 z-50">
          <div className="flex items-center justify-center gap-2 text-sm">
            <WifiOff className="w-4 h-4" />
            <span>Offline Mode - Reading from cached Bible</span>
          </div>
        </div>
      )}
    </>
  );
}