import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { Collapse, CollapsePanelProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { from } from 'rxjs';
import { useApi } from '../../../hooks';
import { isSameAddress } from '../../../utils';

interface PanelProps extends CollapsePanelProps {
  account: string;
  match: string;
}

export function HidablePanel({ account, match, ...rest }: PanelProps) {
  const {
    api,
    connection: { accounts },
  } = useApi();
  const [accountInfo, setAccountInfo] = useState<DeriveAccountInfo | null>(null);

  // eslint-disable-next-line complexity
  const canDisplay = useMemo(() => {
    const filterLower = match.toLowerCase();
    let isVisible = false;

    if (filterLower) {
      if (accountInfo) {
        const { accountId, accountIndex, identity, nickname } = accountInfo;

        if (accountId?.toString().includes(match) || accountIndex?.toString().includes(match)) {
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
  }, [account, accountInfo, accounts, api.query.identity, match]);

  useEffect(() => {
    const sub$$ = from(api.derive.accounts.info(account)).subscribe((res) => {
      setAccountInfo(res);
    });

    return () => sub$$.unsubscribe();
  }, [account, api]);

  return <Collapse.Panel className={!canDisplay ? 'hidden' : ''} {...rest}></Collapse.Panel>;
}
