import BaseIdentityIcon, { Identicon } from '@polkadot/react-identicon';
import { Card, Col, Modal, Row, Typography } from 'antd';
import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { delay, of } from 'rxjs';
import { useAccount, useApi } from '../../hooks';
import { convertToSS58 } from '../../utils';
import { ViewBrowserIcon, CopyIcon } from '../icons';
import { SHORT_DURATION } from '../../config';
import { ConnectPolkadot } from './ConnectPolkadot';
import { EllipsisMiddle } from './EllipsisMiddle';
import { AccountName } from './account/AccountName';

function ActiveAccount({
  children,
  logoStyle,
  containerStyle,
  isLargeRounded = true,
  className = '',
  onClick = () => {
    // do nothing
  },
}: React.PropsWithChildren<{
  isLargeRounded?: boolean;
  logoStyle?: CSSProperties;
  containerStyle?: CSSProperties;
  className?: string;
  textClassName?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}>) {
  const ref = useRef<HTMLSpanElement>(null);
  const { network } = useApi();
  const { account } = useAccount();
  const containerCls = useMemo(
    () =>
      `flex items-center justify-between leading-normal whitespace-nowrap p-1 overflow-hidden bg-${network.name} 
        ${isLargeRounded ? 'rounded-xl ' : 'rounded-lg '}
        ${className}`,
    [isLargeRounded, className, network]
  );

  return (
    <div className={containerCls} onClick={onClick} style={containerStyle || {}}>
      <img src={`/image/${network.name}-1.svg`} style={logoStyle || { width: 24 }} alt="" />
      <Typography.Text className="mx-2" style={{ color: 'inherit', maxWidth: '64px' }} ellipsis={true}>
        <AccountName account={account} ref={ref} className="hidden" />
        {ref.current?.textContent}
      </Typography.Text>
      {children}
    </div>
  );
}

export function Connection() {
  const { t } = useTranslation();
  const [isAccountDetailVisible, setIsAccountDetailVisible] = useState(false);
  const { account } = useAccount();
  const { connection, network } = useApi();
  const [isCopied, setIsCopied] = useState<boolean | null>(false);
  const copyText = useMemo(() => (isCopied ? t('Copied') : t('Copy Address')), [isCopied, t]);

  useEffect(() => {
    if (isCopied) {
      of(false).pipe(delay(SHORT_DURATION)).subscribe(setIsCopied);
    }
  }, [isCopied]);

  return (
    <>
      {!!connection && !!account ? (
        <section className={`flex items-center gap-2 connection`}>
          {account && (
            <>
              <ActiveAccount
                onClick={(event) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  if ((event.target as any).tagName === 'SPAN') {
                    setIsAccountDetailVisible(true);
                  }
                }}
                className="max-w-xs text-white hidden lg:flex cursor-pointer"
                logoStyle={{ width: 24 }}
                isLargeRounded={false}
              >
                <EllipsisMiddle className="text-white overflow-hidden mr-2" copyable value={account} />
              </ActiveAccount>

              <span onClick={() => setIsAccountDetailVisible(true)} className="lg:hidden flex">
                <Identicon value={account} size={20} className="rounded-full border p-1" />
              </span>
            </>
          )}
        </section>
      ) : (
        <ConnectPolkadot />
      )}

      <Modal
        title={t('Address')}
        visible={isAccountDetailVisible}
        footer={null}
        onCancel={() => setIsAccountDetailVisible(false)}
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
                value={account}
              />
            </Col>
            <Col span={20}>
              <Row>
                <Col>
                  <AccountName account={account} />
                  <EllipsisMiddle className="text-gray-600 overflow-hidden" value={account} />
                </Col>
              </Row>

              <Row className="my-2" gutter={{ xs: 0, sm: 8 }}>
                <Col xs={{ span: 24, order: 2 }} sm={{ span: 10, order: 1 }}>
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href={`https://${network.name}.subscan.io/account/${convertToSS58(
                      account ?? '',
                      network.ss58Prefix
                    )}`}
                    className="inline-flex items-center"
                  >
                    <ViewBrowserIcon className="text-sm mr-1" />
                    <span>{t('View in Subscan')}</span>
                  </a>
                </Col>
                <Col xs={{ span: 24, order: 1 }} sm={{ span: 12, order: 2 }}>
                  <CopyToClipboard text={account} onCopy={() => setIsCopied(true)}>
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
  );
}
