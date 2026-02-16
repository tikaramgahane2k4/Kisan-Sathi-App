import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', timeout = 4000) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, timeout);
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`px-4 py-2 rounded shadow text-white transition-all ${
              n.type === 'success' ? 'bg-emerald-600' : n.type === 'error' ? 'bg-red-600' : 'bg-slate-700'
            }`}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
