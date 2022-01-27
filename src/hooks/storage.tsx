import { useCallback, useMemo } from 'react';

import store from 'store';
import { useApi } from './api';

/**
 * create a chain-specific key for the local cache
 */
export function useStorageKey<T>(storageKeyBase: string): [(defaultValue?: T) => T | undefined, (value: T) => T] {
  const { api, isDev } = useApi();
  const storageKey = useMemo(
    () => `${storageKeyBase}:${isDev ? 'development' : api.genesisHash}`,
    [api, isDev, storageKeyBase]
  );
  const getter = useCallback((): T | undefined => store.get(storageKey), [storageKey]);
  const setter = useCallback((value: T): T => store.set(storageKey, value), [storageKey]);

  return [getter, setter];
}
