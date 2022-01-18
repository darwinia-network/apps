import { Card, Table, Tabs } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi } from '../hooks';
import { rxPost } from '../utils';

type ActiveKey = 'bonded' | 'unbond' | 'mapping';

enum ApiPath {
  bonded = '/wallet/bond_list',
  unbond = '/wallet/bond_list',
  mapping = '/wallet/mapping_history',
}

export function AssetDetail() {
  const [activeKey, setActiveKey] = useState<ActiveKey>('bonded');
  const { account } = useAccount();
  const { network } = useApi();
  const { t } = useTranslation();
  const columns: ColumnType<Record<string, string>>[] = [
    {
      title: 'No.',
      key: 'index',
      width: '5%',
      align: 'center',
      render: (_1, _2, index) => index + 1,
    },
    { title: 'Extrinsic ID', dataIndex: 'hash' },
    {
      title: 'Date',
      dataIndex: 'date',
      render() {
        return '--';
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
    },
    {
      title: 'Reward',
      dataIndex: 'reward',
    },
    {
      title: 'status',
      dataIndex: 'status',
    },
  ];

  useEffect(() => {
    if (!account) {
      return;
    }

    const url = `https://${network.name}.webapi.subscan.io/api${ApiPath[activeKey]}`;
    const sub$$ = rxPost({
      url,
      params: { page: 0, locked: 0, status: 'bonded', row: 10, address: account },
    }).subscribe((res) => {
      console.info('%c [ res ]-54', 'font-size:13px; background:pink; color:#bf2c9f;', res);
    });

    return () => {
      sub$$?.unsubscribe();
    };
  }, [account, activeKey, network.name]);

  return (
    <Card>
      <Tabs defaultActiveKey={activeKey} onChange={(key) => setActiveKey(key as ActiveKey)}>
        <Tabs.TabPane tab={t('Bound')} key="bonded">
          <Table columns={columns} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('Unbound')} key="unbond">
          {/* <Table columns={columns} /> */}
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('Mapping')} key="mapping">
          {/* <Table columns={columns} /> */}
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}
