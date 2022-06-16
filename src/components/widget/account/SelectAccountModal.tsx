import React from 'react';
import BaseIdentityIcon from '@polkadot/react-identicon';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Empty, Modal, Radio, Spin, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { useApi, useAssets, useWallet } from '../../../hooks';
import { EllipsisMiddle } from '../EllipsisMiddle';
import { Account } from '../../../model';
import { PrettyAmount } from '../PrettyAmount';
import { fromWei, prettyNumber } from '../../../utils';
import { AccountName } from './AccountName';

type Props = {
  visible: boolean;
  defaultValue: string;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  onSelect: (address: string) => void;
  onCancel: () => void;
};

const iconSize = 36;

const AccountWithIdentify = ({ value }: { value: Account }) => {
  const { assets, loading } = useAssets(value.displayAddress);

  return (
    <>
      <BaseIdentityIcon
        theme="substrate"
        size={iconSize}
        className="mr-2 rounded-full border border-solid border-gray-100"
        value={value.displayAddress}
      />
      <span className="flex flex-col leading-5 overflow-hidden w-full">
        <div className="flex items-center justify-between">
          <AccountName account={value.displayAddress} />
          <Spin className="flex items-center" spinning={!assets.length || loading} size="small">
            {assets.length ? (
              assets.map((item, index) => (
                <React.Fragment key={item.token.symbol}>
                  {index > 0 && <span className="inline-flex justify-center w-3">|</span>}
                  <PrettyAmount amount={fromWei({ value: item.total }, prettyNumber)} />
                  <span>{item.token.symbol}</span>
                </React.Fragment>
              ))
            ) : (
              <span className="inline-block w-12" />
            )}
          </Spin>
        </div>
        <EllipsisMiddle className="opacity-60 w-full" value={value.displayAddress} />
      </span>
    </>
  );
};

export const SelectAccountModal: React.FC<Props> = ({ visible, defaultValue, title, footer, onSelect, onCancel }) => {
  const { network } = useApi();
  const { accounts } = useWallet();
  const { t } = useTranslation();

  return (
    <Modal
      title={
        title || (
          <div className="inline-flex items-center space-x-1">
            <span>{t('Select active account')}</span>
            <Tooltip
              title={`If your account in the old version cannot be found in your wallet, you can restore JSON which the account in the old version Apps through "Account Migration" and add the JSON to your wallet.`}
            >
              <QuestionCircleFilled className="cursor-pointer text-gray-400" />
            </Tooltip>
          </div>
        )
      }
      destroyOnClose
      visible={visible}
      onCancel={onCancel}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'scroll',
      }}
      footer={footer}
    >
      {accounts?.length ? (
        <Radio.Group className="w-full" defaultValue={defaultValue} onChange={(event) => onSelect(event.target.value)}>
          {accounts.map((item) => (
            <Radio.Button
              value={item.address}
              key={item.address}
              className={`radio-list network-radio-button-${network.name}`}
            >
              <AccountWithIdentify value={item} />
            </Radio.Button>
          ))}
        </Radio.Group>
      ) : (
        <Empty
          description={t(
            'No active accounts in this wallet. Please add one or manage website access in your wallet extension.'
          )}
        />
      )}
    </Modal>
  );
};
