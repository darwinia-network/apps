import { Collapse, CollapsePanelProps } from 'antd';
import { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { useApi } from '../../../hooks';
import { isSameAddress } from '../../../utils';
import { useOverview } from './overview';

interface PanelProps extends CollapsePanelProps, PropsWithChildren<unknown> {
  account: string;
  match: string;
}

export function HidablePanel({ account, match, children, ...rest }: PanelProps) {
  const {
    api,
    connection: { accounts },
  } = useApi();
  const { accountInfo } = useOverview();

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

  return (
    <Collapse.Panel className={!canDisplay ? 'hidden' : ''} {...rest}>
      {children}
    </Collapse.Panel>
  );
}
