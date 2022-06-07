import { useCallback } from 'react';
import { isFunction } from '@polkadot/util';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { isSameAddress } from '../utils';
import { useApi } from './api';
import { useWallet } from './wallet';

export function useIsAccountFuzzyMatch() {
  const { api } = useApi();
  const { accounts } = useWallet();

  const predicate = useCallback(
    // eslint-disable-next-line complexity
    (account: string, compare: string, accountInfo?: DeriveAccountInfo) => {
      const compareLower = compare.toLowerCase();
      let isVisible = false;

      if (compareLower) {
        if (accountInfo) {
          const { accountId, accountIndex, identity, nickname } = accountInfo;

          if (
            accountId?.toString().toLowerCase().includes(compareLower) ||
            accountIndex?.toString().toLowerCase().includes(compareLower)
          ) {
            isVisible = true;
          } else if (isFunction(api.query.identity?.identityOf)) {
            isVisible =
              !!identity.display &&
              `${identity.displayParent}/${identity.display}`.toLowerCase().includes(compareLower);
          } else if (nickname) {
            isVisible = nickname.toLowerCase().includes(compareLower);
          }
        }

        if (!isVisible) {
          const acc = accounts.find((item) => isSameAddress(item.displayAddress, account));

          isVisible = acc?.meta?.name ? acc.meta.name.toLowerCase().includes(compareLower) : false;
        }
      } else {
        isVisible = true;
      }

      return isVisible;
    },
    [accounts, api.query.identity]
  );

  return predicate;
}
