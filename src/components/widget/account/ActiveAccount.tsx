import { SettingFilled } from '@ant-design/icons';
import BaseIdentityIcon from '@polkadot/react-identicon';
import { Button, Empty, Modal, Radio } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi } from '../../../hooks';
import { convertToSS58 } from '../../../utils';
import { EllipsisMiddle } from '../EllipsisMiddle';

const iconSize = 36;

// eslint-disable-next-line complexity
export function ActiveAccount() {
  const {
    connection: { accounts },
    network,
  } = useApi();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string>();
  const { account, setAccount } = useAccount();
  const [isVisible, setIsVisible] = useState(false);
  const displayAccounts = useMemo(
    () => accounts.map((item) => ({ ...item, address: convertToSS58(item.address, network.ss58Prefix) })),
    [accounts, network.ss58Prefix]
  );

  if (!accounts) {
    return null;
  }

  return (
    <>
      {accounts.length > 1 && (
        <>
          <Button onClick={() => setIsVisible(true)} className="hidden lg:block">
            {t('Switch Account')}
          </Button>

          <SettingFilled
            onClick={() => setIsVisible(true)}
            className={`lg:hidden inline-flex items-center text-2xl h-8 text-${network.name}-main`}
          />
        </>
      )}
      <Modal
        title={t('Select active account')}
        destroyOnClose
        visible={isVisible}
        maskClosable={false}
        onCancel={() => setIsVisible(false)}
        bodyStyle={{
          maxHeight: '50vh',
          overflow: 'scroll',
        }}
        footer={
          accounts?.length
            ? [
                <Button
                  key="primary-btn"
                  type="primary"
                  size="large"
                  onClick={() => {
                    if (selected && selected !== account) {
                      setAccount(selected);
                    }
                    setIsVisible(false);
                  }}
                  className="block mx-auto w-full border-none rounded-lg"
                >
                  {t('Confirm')}
                </Button>,
              ]
            : null
        }
      >
        {accounts?.length ? (
          <Radio.Group
            className="w-full"
            defaultValue={account}
            onChange={(event) => {
              setSelected(event.target.value);
            }}
          >
            {displayAccounts.map((item) => (
              <Radio.Button value={item.address} key={item.address} className="radio-list">
                <BaseIdentityIcon
                  theme="substrate"
                  size={iconSize}
                  className="mr-2 rounded-full border border-solid border-gray-100"
                  value={item.address}
                />
                <span className="flex flex-col leading-5 overflow-hidden">
                  <b>{item.meta?.name}</b>
                  <EllipsisMiddle className="opacity-60 w-full">{item.address}</EllipsisMiddle>
                </span>
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
    </>
  );
}
