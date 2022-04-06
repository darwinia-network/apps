import { SettingFilled, QuestionCircleFilled } from '@ant-design/icons';
import BaseIdentityIcon from '@polkadot/react-identicon';
import { Button, Empty, Modal, Radio, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi } from '../../../hooks';
import { convertToSS58 } from '../../../utils';
import { EllipsisMiddle } from '../EllipsisMiddle';
import { IAccountMeta } from '../../../model';
import { AccountName } from './AccountName';

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

// eslint-disable-next-line complexity
export function ActiveAccount() {
  const {
    connection: { accounts },
    network,
  } = useApi();
  const { t } = useTranslation();
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
        title={
          <div className="inline-flex items-center space-x-1">
            <span>{t('Select active account')}</span>
            <Tooltip
              title={`If your account in the old version cannot be found in your wallet, you can restore JSON which the account in the old version Apps through "Account Migration" and add the JSON to polkadot{.js}.`}
            >
              <QuestionCircleFilled className="cursor-pointer text-gray-400" />
            </Tooltip>
          </div>
        }
        destroyOnClose
        visible={isVisible}
        maskClosable={false}
        onCancel={() => setIsVisible(false)}
        bodyStyle={{
          maxHeight: '70vh',
          overflow: 'scroll',
        }}
        footer={null}
      >
        {accounts?.length ? (
          <Radio.Group
            className="w-full"
            defaultValue={account}
            onChange={(event) => {
              if (event.target.value !== account) {
                setAccount(event.target.value);
              }
              setIsVisible(false);
            }}
          >
            {displayAccounts.map((item) => (
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
    </>
  );
}
