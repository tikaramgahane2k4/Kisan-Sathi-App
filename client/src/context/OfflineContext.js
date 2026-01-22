import React, { createContext, useContext, useState, useEffect } from 'react';

const OfflineContext = createContext({
  isOnline: true,
  queuedCount: 0,
  syncing: false
});

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [queuedCount, setQueuedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value = { isOnline, queuedCount, syncing, setQueuedCount, setSyncing };
  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
};

export const useOffline = () => useContext(OfflineContext);
