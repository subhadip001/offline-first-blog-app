"use client"
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { createStore } from 'tinybase';
import type { BlogStore } from '@/lib/types';

interface TinybaseContextType {
  store: BlogStore | null;
  isOnline: boolean;
  lastSync: Date | null;
}

const TinybaseContext = createContext<TinybaseContextType>({
  store: null,
  isOnline: true,
  lastSync: null,
});

export function TinybaseProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<BlogStore | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const newStore = createStore();
    
    // Initialize tables with default empty records
    newStore.setTables({
      posts: {},
      comments: {},
      pendingChanges: {},
    });

    const currentTime = Date.now();

    // Initialize values
    newStore.setValues({
      lastSync: currentTime,
      isOnline: navigator.onLine
    });

    // Load persisted data
    const persistedData = localStorage.getItem('offlineBlogData');
    if (persistedData) {
      try {
        newStore.setJson(persistedData);
      } catch (error) {
        console.error('Error loading persisted data:', error);
      }
    }

    // Set up persistence using tablesListener
    newStore.addTablesListener(() => {
      try {
        localStorage.setItem('offlineBlogData', newStore.getJson());
      } catch (error) {
        console.error('Error persisting data:', error);
      }
    });

    // Also listen for value changes
    newStore.addValuesListener(() => {
      try {
        localStorage.setItem('offlineBlogData', newStore.getJson());
        const syncTime = newStore.getValue('lastSync');
        if (syncTime !== undefined) {
          setLastSync(new Date(syncTime as number));
        }
      } catch (error) {
        console.error('Error persisting data:', error);
      }
    });

    // Set up online/offline detection
    const handleOnline = () => {
      setIsOnline(true);
      newStore.setValue('isOnline', true);
      // Trigger sync when coming online
      syncPendingChanges(newStore);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      newStore.setValue('isOnline', false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setStore(newStore);
    setLastSync(new Date(currentTime)); // Use the currentTime we set initially

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to sync pending changes when coming online
  const syncPendingChanges = async (store: BlogStore) => {
    const pendingChanges = store.getTable('pendingChanges');
    
    for (const [changeId, change] of Object.entries(pendingChanges)) {
      try {
        switch (change.type) {
          case 'create':
            await fetch(`/api/${change.table}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(change.data),
            });
            break;
          
          case 'update':
            await fetch(`/api/${change.table}/${change.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(change.data),
            });
            break;
          
          case 'delete':
            await fetch(`/api/${change.table}/${change.id}`, {
              method: 'DELETE',
            });
            break;
        }
        
        // Remove synced change
        store.delRow('pendingChanges', changeId);
      } catch (error) {
        console.error(`Failed to sync change ${changeId}:`, error);
      }
    }

    const currentTime = Date.now();
    // Update last sync timestamp
    store.setValue('lastSync', currentTime);
    setLastSync(new Date(currentTime));
  };

  const value = {
    store,
    isOnline,
    lastSync,
  };

  return (
    <TinybaseContext.Provider value={value}>
      <div className="relative">
        {/* Offline indicator */}
        {!isOnline && (
          <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Offline Mode
          </div>
        )}
        {children}
      </div>
    </TinybaseContext.Provider>
  );
}

export const useTinybase = () => {
  const context = useContext(TinybaseContext);
  if (!context) {
    throw new Error('useTinybase must be used within a TinybaseProvider');
  }
  return context;
};