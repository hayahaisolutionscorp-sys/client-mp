import dayjs from 'dayjs';
import { CacheKey } from 'constants/cache';

// Keys stored in sessionStorage (cleared on tab close / logout)
import { sessionCacheKeys } from 'constants/cache';

const isLocalStorageAvailable = () => {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
};

const getStorage = (key: CacheKey): Storage | null => {
  if (typeof window === 'undefined') return null;
  return (sessionCacheKeys as ReadonlyArray<string>).includes(key)
    ? sessionStorage
    : localStorage;
};

export function cacheItem(
  key: CacheKey,
  item: any,
  expirationInMinutes?: number
) {
  const storage = getStorage(key);
  if (!storage) return;

  expirationInMinutes ??= 60 * 24 * 365;

  storage.setItem(
    key,
    JSON.stringify({
      data: item,
      expiration: dayjs().add(expirationInMinutes, 'minute').toISOString(),
    })
  );
}

export function fetchItem<T>(key: CacheKey): T | undefined {
  const storage = getStorage(key);
  if (!storage) return undefined;

  const cachedItemJson = storage.getItem(key);
  if (cachedItemJson === null) {
    return undefined;
  }

  const { data, expiration } = JSON.parse(cachedItemJson);
  if (dayjs().isAfter(dayjs(expiration))) {
    invalidateItem(key)
    return undefined;
  }

  return data;
}

export function invalidateItem(key: CacheKey) {
  const storage = getStorage(key);
  if (!storage) return;
  storage.removeItem(key);
}

export function clearExpiredCache() {
  if (typeof window === 'undefined') return;

  [localStorage, sessionStorage].forEach(storage => {
    const keys = Object.keys(storage);
    keys.forEach(key => {
      const cachedItemJson = storage.getItem(key);
      if (cachedItemJson !== null) {
        try {
          const { expiration } = JSON.parse(cachedItemJson);
          if (dayjs().isAfter(dayjs(expiration))) {
            storage.removeItem(key);
          }
        } catch {
          // not a managed cache entry, skip
        }
      }
    });
  });
}
