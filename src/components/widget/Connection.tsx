import BaseIdentityIcon, { Identicon } from '@polkadot/react-identicon';
import { Button, Card, Col, Modal, Row, Typography } from 'antd';
import React, { CSSProperties, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi } from '../../hooks';
import { convertToSS58 } from '../../utils';
import { ViewBrowserIcon } from '../icons';
import { ConnectPolkadot } from './ConnectPolkadot';
import { EllipsisMiddle } from './EllipsisMiddle';

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
  const { network } = useApi();
  const { accountWithMeta } = useAccount();
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
        {accountWithMeta.meta.name}
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
                className="max-w-xs text-white hidden lg:flex"
                logoStyle={{ width: 24 }}
              >
                <EllipsisMiddle className="text-white overflow-hidden mr-2" copyable>
                  {account}
                </EllipsisMiddle>
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
                  <Typography.Text copyable className="mr-4 text-gray-600 text-base">
                    {account}
                  </Typography.Text>
                </Col>
              </Row>

              <Row className="my-2" gutter={8}>
                <Button
                  onClick={() => {
                    const address = convertToSS58(account ?? '', network.ss58Prefix);

                    window.open(`https://${network.name}.subscan.io/account/${address}`, 'blank');
                  }}
                  className="flex items-center cursor-pointer"
                  icon={<ViewBrowserIcon className="text-xl" />}
                >
                  {t('View in Subscan')}
                </Button>
              </Row>
            </Col>
          </Row>
        </Card>
      </Modal>
    </>
  );
}
