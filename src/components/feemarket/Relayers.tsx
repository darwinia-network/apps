import { Table, Input, Radio, Card } from 'antd';
import { ColumnsType } from 'antd/lib/table';

type RelayerData = {
  relayer: string;
  countOrders: number;
  collateral: number;
  quote: number;
  sumReward: number;
  sumSlash: number;
};

export const Relayers = () => {
  const columns: ColumnsType<RelayerData> = [
    {
      title: 'Relayer',
      key: 'relayer',
      dataIndex: 'relayer',
    },
    {
      title: 'Count(orders)',
      key: 'countOrders',
      dataIndex: 'countOrders',
      sorter: (a, b) => a.countOrders - b.countOrders,
    },
    {
      title: 'Collateral',
      key: 'collateral',
      dataIndex: 'collateral',
      sorter: (a, b) => a.collateral - b.collateral,
    },
    {
      title: 'Quote',
      key: 'quote',
      dataIndex: 'quote',
      sorter: (a, b) => a.quote - b.quote,
    },
    {
      title: 'Sum(reward)',
      key: 'sumReward',
      dataIndex: 'sumReward',
      sorter: (a, b) => a.sumReward - b.sumReward,
    },
    {
      title: 'Sum(slash)',
      key: 'sumSlash',
      dataIndex: 'sumSlash',
      sorter: (a, b) => a.sumSlash - b.sumSlash,
    },
  ];

  const dataSource = [
    {
      key: 1,
      relayer: 'Relayer1',
      countOrders: 123,
      collateral: 3456,
      quote: 1234,
      sumReward: 6798,
      sumSlash: 3256,
    },
    {
      key: 2,
      relayer: 'Relayer1',
      countOrders: 223,
      collateral: 2456,
      quote: 3234,
      sumReward: 5798,
      sumSlash: 1256,
    },
  ];

  return (
    <>
      <div className="flex items-end justify-between">
        <Radio.Group>
          <Radio.Button value={1}>All Relayers</Radio.Button>
          <Radio.Button value={2}>Assigned Relayers</Radio.Button>
        </Radio.Group>
        <Input size="large" className="mb-2 w-96" placeholder="Filter by relayer address" />
      </div>
      <Card className="mt-2">
        <Table columns={columns} dataSource={dataSource} />
      </Card>
    </>
  );
};
