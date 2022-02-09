import { useCallback } from 'react';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { isSameAddress } from '../utils';
import { useApi } from './api';

export function useIsAccountFuzzyMatch() {
  const {
    api,
    connection: { accounts },
  } = useApi();

  const predicate = useCallback(
    // eslint-disable-next-line complexity
    (account: string, compare: string, accountInfo?: DeriveAccountInfo) => {
      const filterLower = compare.toLowerCase();
      let isVisible = false;

      if (filterLower) {
        if (accountInfo) {
          const { accountId, accountIndex, identity, nickname } = accountInfo;

          if (accountId?.toString().includes(compare) || accountIndex?.toString().includes(compare)) {
            isVisible = true;
          } else if (api.query.identity && api.query.identity.identityOf) {
            isVisible =
              (!!identity?.display && identity.display.toLowerCase().includes(filterLower)) ||
              (!!identity?.displayParent && identity.displayParent.toLowerCase().includes(filterLower));
          } else if (nickname) {
            isVisible = nickname.toLowerCase().includes(filterLower);
          }
        }

        if (!isVisible) {
          const acc = accounts.find((item) => isSameAddress(item.address, account));

          isVisible = acc?.meta?.name ? acc.meta.name.toLowerCase().includes(filterLower) : false;
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
