import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
};

export const sendNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/manifest.json',
      badge: '🌾',
      ...options
    });
  }
};

function NotificationBanner() {
  const { t } = useLanguage();
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setNotifEnabled(Notification.permission === 'granted');
      if (Notification.permission === 'default') {
        setShowPrompt(true);
      }
    }
  }, []);

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    setNotifEnabled(granted);
    setShowPrompt(false);
  };

  if (notifEnabled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-50">
      <p className="text-sm text-gray-900 mb-3">{t('notificationPrompt') || 'Get alerts for weather and tasks'}</p>
      <div className="flex gap-2">
        <button
          onClick={() => setShowPrompt(false)}
          className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50"
        >
          {t('notLater') || 'Later'}
        </button>
        <button
          onClick={handleEnable}
          className="flex-1 px-3 py-2 text-xs bg-primary text-white rounded hover:bg-secondary"
        >
          {t('enable') || 'Enable'}
        </button>
      </div>
    </div>
  );
}

export default NotificationBanner;
