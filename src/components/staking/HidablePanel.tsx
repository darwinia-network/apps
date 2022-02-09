import { Collapse, CollapsePanelProps } from 'antd';
import { PropsWithChildren } from 'react';
import { useIsAccountFuzzyMatch } from '../../hooks';
import { useOverview } from './overview/overview';

interface PanelProps extends CollapsePanelProps, PropsWithChildren<unknown> {
  account: string;
  match: string;
}

export function HidablePanel({ account, match, children, ...rest }: PanelProps) {
  const isMatch = useIsAccountFuzzyMatch();
  const { accountInfo } = useOverview();
  const canDisplay = isMatch(account, match, accountInfo);

  return (
    <Collapse.Panel className={!canDisplay ? 'hidden' : ''} {...rest}>
      {children}
    </Collapse.Panel>
  );
}
