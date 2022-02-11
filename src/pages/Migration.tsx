import Identicon from '@polkadot/react-identicon';
import { Button, Card, List, Tabs } from 'antd';
import Link from 'antd/lib/typography/Link';
import FileSaver from 'file-saver';
import { Trans, useTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { useApi } from '../hooks';
import { LOCAL } from '../utils';

function Page() {
  const { t } = useTranslation();
  const {
    connection: { accounts },
  } = useApi();
  const localAccounts = accounts.filter((item) => item.meta.source === LOCAL);

  return (
    <div className="px-8">
      <Card className="mx-8">
        <Trans i18nKey="tutorialRefers" className="m-8">
          If your account in the old version cannot be found in your wallet, you can restore JSON which the account in
          the old version apps through \u0022 Account Migration \u0022 and add the JSON to polkadot\u007b.js\u007d.
          <Link>Tutorial refers here.</Link>
        </Trans>
      </Card>

      <Tabs accessKey="overview" className="px-8 w-full mx-auto dark:shadow-none dark:border-transparent">
        <Tabs.TabPane tab={t('overview')} key="overview" className="pb-8">
          <Card title={<span className="font-bold">{t('Local Accounts')}</span>}>
            <List
              dataSource={localAccounts}
              renderItem={(item) => (
                <List.Item key={item.address}>
                  <List.Item.Meta
                    avatar={<Identicon value={item.address} size={40} className="border rounded-full p-1" />}
                    title={<span className="font-bold text-lg">{item.meta.name}</span>}
                    description={item.address}
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

export const Migration = withRouter(Page);
