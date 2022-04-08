import React from 'react';
import BaseIdentityIcon from '@polkadot/react-identicon';
import { Button, Empty, Modal, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../hooks';
import { EllipsisMiddle } from '../EllipsisMiddle';
import { IAccountMeta } from '../../../model';
import { AccountName } from './AccountName';

type Props = {
  visible: boolean;
  defaultValue: string;
  title: React.ReactNode;
  footer: React.ReactNode;
  onSelect: (address: string) => void;
  onCancel: () => void;
};

const iconSize = 36;

const AccountWithIdentify = ({ value }: { value: IAccountMeta }) => {
  return (
    <>
      <BaseIdentityIcon
        theme="substrate"
        size={iconSize}
        className="mr-2 rounded-full border border-solid border-gray-100"
        value={value.address}
      />
      <span className="flex flex-col leading-5 overflow-hidden">
        <AccountName account={value.address} />
        <EllipsisMiddle className="opacity-60 w-full" value={value.address} />
      </span>
    </>
  );
};

export const SelectAccountModal: React.FC<Props> = ({ visible, defaultValue, title, footer, onSelect, onCancel }) => {
  const {
    connection: { accounts },
    network,
  } = useApi();
  const { t } = useTranslation();

  return (
    <Modal
      title={title}
      destroyOnClose
      visible={visible}
      maskClosable={false}
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
              className={`radio-list account-select-btn-group-${network.name}`}
            >
              <AccountWithIdentify value={item} />
            </Radio.Button>
          ))}
        </Radio.Group>
      ) : (
        <Empty
          image="/image/empty.png"
          imageStyle={{ height: 44 }}
          description={t('You haven’t created an address yet, please create a address first.')}
          className="flex justify-center flex-col items-center"
        >
          <Button
            onClick={() => {
              const url = 'https://polkadot.js.org';

              window.open(url, 'blank');
            }}
          >
            {t('How to create?')}
          </Button>
        </Empty>
      )}
    </Modal>
  );
};
