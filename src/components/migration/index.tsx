import Identicon from '@polkadot/react-identicon';
import { Button, Card, List } from 'antd';
import AntdLink from 'antd/lib/typography/Link';
import FileSaver from 'file-saver';
import { Trans, useTranslation } from 'react-i18next';
import { EllipsisMiddle } from '../widget/EllipsisMiddle';
import { useWallet } from '../../hooks';
import { LOCAL_SOURCE } from '../../config';

const SubkeyMigration = () => {
  const { t } = useTranslation();
  const { accounts } = useWallet();
  const localAccounts = accounts.filter((item) => item.meta.source === LOCAL_SOURCE);

  return (
    <div>
      <Card className="mx-0 shadow-xxl">
        <Trans className="m-8">
          {`Here are the accounts you generated on the Darwinia Apps of the old version. You can restore them in the Polkadot{.js} by importing the JSON files. `}
          <AntdLink
            href="https://darwinianetwork.medium.com/using-darwinia-tools-3-8-darwinia-apps-lite-guide-part-%E2%85%B0-account-ae9b3347b3c7"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tutorial refers here.
          </AntdLink>
        </Trans>
      </Card>

      <Card
        style={{ marginTop: '20px' }}
        title={<span className="font-bold">{t('Local Accounts')}</span>}
        className="shadow-xxl"
      >
        <List
          dataSource={localAccounts}
          renderItem={(item) => (
            <List.Item key={item.address}>
              <List.Item.Meta
                avatar={<Identicon value={item.displayAddress} size={40} className="border rounded-full p-1" />}
                title={<span className="font-bold text-lg">{item.meta.name}</span>}
                description={<EllipsisMiddle value={item.displayAddress} />}
                className="flex item-center"
              />

              <Button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(item.json)], { type: 'application/json; charset=utf-8' });

                  FileSaver.saveAs(blob, `${item.address}.json`);
                }}
              >
                {t('Export JSON')}
              </Button>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default SubkeyMigration;
