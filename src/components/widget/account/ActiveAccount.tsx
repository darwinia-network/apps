import BaseIdentityIcon, { Identicon } from '@polkadot/react-identicon';
import { Card, Col, Modal, Row, Typography, Badge } from 'antd';
import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { delay, of } from 'rxjs';
import { useApi, useWallet, useAccount } from '../../../hooks';
import { toShortAddress } from '../../../utils';
import { ViewBrowserIcon, CopyIcon } from '../../icons';
import { SHORT_DURATION, SEARCH_PARAMS_SOURCE } from '../../../config';
import { AccountName } from '../account/AccountName';
import { Account } from '../../../model';
import { AccountSelector } from './AccountSelector';

function AccountItem({
  children,
  logoStyle,
  containerStyle,
  isLargeRounded = true,
  className = '',
  account,
  onClick = () => {
    // do nothing
  },
}: React.PropsWithChildren<{
  isLargeRounded?: boolean;
  logoStyle?: CSSProperties;
  containerStyle?: CSSProperties;
  className?: string;
  textClassName?: string;
  account: Account;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}>) {
  const ref = useRef<HTMLSpanElement>(null);
  const { network } = useApi();
  const { walletToUse } = useWallet();
  const containerCls = useMemo(
    () =>
      `flex items-center justify-between leading-normal whitespace-nowrap p-1 overflow-hidden bg-${network.name} 
        ${isLargeRounded ? 'rounded-xl ' : 'rounded-lg '}
        ${className}`,
    [isLargeRounded, className, network]
  );

  return (
    <div className={containerCls} onClick={onClick} style={containerStyle || {}}>
      {walletToUse && (
        <img src={walletToUse.logo.src} style={logoStyle || { width: 24, height: 24 }} alt={walletToUse.logo.alt} />
      )}
      <Typography.Text className="mx-2" style={{ color: 'inherit', maxWidth: '64px' }} ellipsis={true}>
        <AccountName account={account.address} ref={ref} className="hidden" />
        {ref.current?.textContent}
      </Typography.Text>
      {children}
    </div>
  );
}

export const ActiveAccount = () => {
  const { network } = useApi();
  const { account } = useAccount();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyText = useMemo(() => (isCopied ? t('Copied') : t('Copy Address')), [isCopied, t]);

  useEffect(() => {
    if (isCopied) {
      of(false).pipe(delay(SHORT_DURATION)).subscribe(setIsCopied);
    }
  }, [isCopied]);

  return account ? (
    <>
      <section className={`flex items-center gap-2 connection`}>
        {account && (
          <>
            <Badge.Ribbon
              color="red"
              text={t('Read only')}
              className={`-top-1 -right-2 ${account?.meta.source === SEARCH_PARAMS_SOURCE ? '' : 'hidden'}`}
            >
              <AccountItem
                onClick={(event) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  if ((event.target as any).tagName === 'SPAN') {
                    setVisible(true);
                  }
                }}
                account={account}
                className="max-w-xs text-white hidden lg:flex cursor-pointer"
                logoStyle={{ width: 24, height: 24 }}
                isLargeRounded={false}
              >
                <span className="text-white overflow-hidden mr-2">{toShortAddress(account.displayAddress)}</span>
              </AccountItem>
            </Badge.Ribbon>

            <span onClick={() => setVisible(true)} className="lg:hidden flex">
              <Identicon value={account.address} size={20} className="rounded-full border p-1" />
            </span>
          </>
        )}
      </section>
      <Modal
        title={t('Address')}
        visible={visible}
        footer={null}
        onCancel={() => setVisible(false)}
        destroyOnClose={true}
        bodyStyle={{ maxHeight: '80vh', overflow: 'hidden' }}
      >
        <Card className="mb-4">
          <Row gutter={4} className="overflow-hidden">
            <Col span={4}>
              <BaseIdentityIcon
                theme="substrate"
                size={42}
                className="mr-2 rounded-full border border-solid border-gray-100"
                value={account.address}
              />
            </Col>
            <Col span={20}>
              <Row>
                <Col flex="auto">
                  <div className="flex items-center justify-between">
                    <AccountName account={account.address} />
                    <AccountSelector />
                  </div>
                  <span className="text-gray-600 overflow-hidden">{toShortAddress(account.displayAddress)}</span>
                </Col>
              </Row>

              <Row className="my-2" gutter={{ xs: 0, sm: 8 }}>
                <Col xs={{ span: 24, order: 2 }} sm={{ span: 10, order: 1 }}>
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href={`https://${network.name}.subscan.io/account/${account.displayAddress}`}
                    className="inline-flex items-center"
                  >
                    <ViewBrowserIcon className="text-sm mr-1" />
                    <span>{t('View in Subscan')}</span>
                  </a>
                </Col>
                <Col xs={{ span: 24, order: 1 }} sm={{ span: 12, order: 2 }}>
                  <CopyToClipboard text={account.displayAddress} onCopy={() => setIsCopied(true)}>
                    <a className="inline-flex items-center">
                      <CopyIcon className="text-sm mr-1" />
                      <span>{copyText}</span>
                    </a>
                  </CopyToClipboard>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </Modal>
    </>
  ) : null;
};
