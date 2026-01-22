// Offline utilities using IndexedDB via idb
import { openDB } from 'idb';

let dbPromise;

export const offlineInit = async () => {
  if (!dbPromise) {
    dbPromise = openDB('kpm-offline', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('queue')) {
          db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache');
        }
      }
    });
  }
  return dbPromise;
};

export const isOnline = () => typeof navigator !== 'undefined' ? navigator.onLine : true;

export const cacheResponse = async (key, data) => {
  const db = await offlineInit();
  return db.put('cache', data, key);
};

export const getCached = async (key) => {
  const db = await offlineInit();
  return db.get('cache', key);
};

export const canQueue = (method, url, data, config) => {
  // Don't queue file uploads (multipart with File/Blob)
  if (config && config.headers && /multipart\/form-data/i.test(config.headers['Content-Type'])) {
    if (data instanceof FormData) {
      for (const v of data.values()) {
        if (v instanceof File || v instanceof Blob) return false;
      }
    }
  }
  return ['POST', 'PUT', 'DELETE'].includes(method.toUpperCase());
};

export const enqueue = async (method, url, data, headers) => {
  const db = await offlineInit();
  const entry = { method, url, data, headers, ts: Date.now() };
  await db.add('queue', entry);
  return entry;
};

export const flushQueue = async (API) => {
  const db = await offlineInit();
  const tx = db.transaction('queue', 'readwrite');
  const store = tx.objectStore('queue');
  const all = await store.getAll();
  for (const item of all) {
    try {
      if (item.method === 'POST') {
        await API.post(item.url, item.data, { headers: item.headers });
      } else if (item.method === 'PUT') {
        await API.put(item.url, item.data, { headers: item.headers });
      } else if (item.method === 'DELETE') {
        await API.delete(item.url, { headers: item.headers, data: item.data });
      }
      await store.delete(item.id);
    } catch (e) {
      // keep in queue if still failing (e.g., server unreachable)
    }
  }
  await tx.done;
};
