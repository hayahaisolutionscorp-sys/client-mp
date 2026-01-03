import dayjs from 'dayjs';
import { CacheKey } from 'constants/cache';

const isLocalStorageAvailable = () => {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
};

export function cacheItem(
  key: CacheKey,
  item: any,
  expirationInMinutes?: number
) {
  if (!isLocalStorageAvailable()) return;

  expirationInMinutes ??= 60 * 24 * 365;

  localStorage.setItem(
    key,
    JSON.stringify({
      data: item,
      expiration: dayjs().add(expirationInMinutes, 'minute').toISOString(),
    })
  );
}

export function fetchItem<T>(key: CacheKey): T | undefined {
  if (!isLocalStorageAvailable()) return undefined;

  const cachedItemJson = localStorage.getItem(key);
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
  if (!isLocalStorageAvailable()) return;
  localStorage.removeItem(key);
}

export function clearExpiredCache() {
  if (!isLocalStorageAvailable()) return;

  const keys = Object.keys(localStorage);

  keys.forEach(key => {
    const cachedItemJson = localStorage.getItem(key);
    if (cachedItemJson !== null) {
      const { expiration } = JSON.parse(cachedItemJson);
      if (dayjs().isAfter(dayjs(expiration))) {
        localStorage.removeItem(key);
      }
    }
  });
}
