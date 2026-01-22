import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import OfflineBanner from './components/OfflineBanner';
import NotificationBanner from './components/NotificationBanner';
import { offlineInit } from './utils/offline';
import { flushOfflineQueue } from './utils/api';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <OfflineBanner />
    <NotificationBanner />
    <App />
  </React.StrictMode>
);

// Register service worker for better performance
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(err => {
        console.log('SW registration failed:', err);
      });
  });
}

// Offline queue: initialize DB and flush when connection is restored
offlineInit().then(() => {
  if (navigator.onLine) {
    flushOfflineQueue();
  }
});

window.addEventListener('online', () => {
  flushOfflineQueue();
});

// Performance monitoring
reportWebVitals();
