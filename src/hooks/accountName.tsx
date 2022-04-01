import { useState, useEffect } from 'react';
import { isFunction } from '@polkadot/util';
import { useApi } from './api';

export const useAccountName = (address: string, defaultName?: string) => {
  const { api } = useApi();
  const [name, setName] = useState<string>(defaultName ?? '');

  useEffect(() => {
    api.derive.accounts
      .info(address)
      .then(({ identity, nickname }) => {
        if (isFunction(api.query.identity?.identityOf) && identity?.display) {
          setName(identity.display);
        } else if (nickname) {
          setName(nickname);
        } else {
          setName(defaultName || '');
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [api, address, defaultName]);

  return { name };
};
