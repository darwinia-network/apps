import { useCallback, useState } from 'react';
import { useStorageKey } from './storage';

/**
 * hook for favorites with local storage
 */
export function useFavorites(storageKeyBase: string): [string[], (address: string) => void] {
  const [getCache, setCache] = useStorageKey<string[]>(storageKeyBase);
  const [favorites, setFavorites] = useState<string[]>(getCache() || []);

  const toggleFavorite = useCallback(
    (address: string): void =>
      setFavorites((fav: string[]) =>
        setCache(fav.includes(address) ? fav.filter((accountId): boolean => address !== accountId) : [...fav, address])
      ),
    [setCache]
  );

  return [favorites, toggleFavorite];
}

/* -----------------------------------keys------------------------------------------------- */

export const STAKING_FAV_KEY = 'staking:favorites';
