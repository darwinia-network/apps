import Identicon from '@polkadot/react-identicon';
import { Button, Card, List, Tabs } from 'antd';
import AntdLink from 'antd/lib/typography/Link';
import FileSaver from 'file-saver';
import { Trans, useTranslation } from 'react-i18next';
import { EllipsisMiddle } from '../components/widget/EllipsisMiddle';
import { useApi, useWallet } from '../hooks';
import { LOCAL_SOURCE } from '../config';

export function Migration() {
  const { t } = useTranslation();
  const { network } = useApi();
  const { accounts } = useWallet();
  const localAccounts = accounts.filter((item) => item.meta.source === LOCAL_SOURCE);

  return (
    <div className="lg:px-8 px-4">
      <Card className="mx-0 shadow-xxl">
        <Trans className="m-8">
          {`If your account in the old version cannot be found in your wallet, you can restore JSON which the account in the old version Apps through "Account Migration" and add the JSON to your wallet. `}
          <AntdLink
            href="https://darwinianetwork.medium.com/using-darwinia-tools-3-8-darwinia-apps-lite-guide-part-%E2%85%B0-account-ae9b3347b3c7"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tutorial refers here.
          </AntdLink>
        </Trans>
      </Card>

      <Tabs
        accessKey="overview"
        className={`px-0 w-full mx-auto dark:shadow-none dark:border-transparent pb-5 page-account-tabs page-account-tabs-${network.name}`}
      >
        <Tabs.TabPane tab={t('overview')} key="overview" className="pb-8">
          <Card title={<span className="font-bold">{t('Local Accounts')}</span>} className="shadow-xxl">
            <List
              dataSource={localAccounts}
              renderItem={(item) => (
                <List.Item key={item.address}>
                  <List.Item.Meta
                    avatar={<Identicon value={item.displayAddress} size={40} className="border rounded-full p-1" />}
                    title={<span className="font-bold text-lg">{item.meta.name}</span>}
                    description={<EllipsisMiddle value={item.address} />}
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
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
