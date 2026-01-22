import React from 'react';
import { useOffline } from '../context/OfflineContext';
import { useLanguage } from '../context/LanguageContext';

function OfflineBanner() {
  const { isOnline, queuedCount, syncing } = useOffline();
  const { t } = useLanguage();

  if (isOnline && !syncing && queuedCount === 0) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 px-4 py-3 text-white text-center text-sm z-40 ${
      isOnline && syncing ? 'bg-blue-500' : isOnline ? 'bg-green-500' : 'bg-orange-500'
    }`}>
      {!isOnline ? (
        <>
          <span className="font-semibold">📡 {t('offlineTitle')}</span>
          {queuedCount > 0 && (
            <span className="ml-2 text-xs">{queuedCount} {t('offlineQueuedChanges')}</span>
          )}
        </>
      ) : syncing ? (
        <span className="font-semibold">🔄 {t('offlineSyncProgress')}</span>
      ) : queuedCount === 0 ? (
        <span className="font-semibold">✅ {t('offlineSynced')}</span>
      ) : null}
    </div>
  );
}

export default OfflineBanner;
