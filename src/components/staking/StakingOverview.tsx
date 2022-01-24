import { Card, Input, Progress } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';
import { Statistics } from '../widget/Statistics';

const testData = [
  { id: 0, validators: 'xxx', other: '8743104(8)', own: 4848, active: '6%', next: '6%', points: 2660, last: 6157610 },
];

export function StakingOverview() {
  const { t } = useTranslation();
  const columns: ColumnsType<Record<string, string | number>> = [
    { title: 'validators', dataIndex: 'validators' },
    { title: 'other stake(power)', dataIndex: 'other' },
    { title: 'own stake(power)', dataIndex: 'own' },
    { title: 'active commission', dataIndex: 'active' },
    { title: 'next commission', dataIndex: 'next' },
    { title: 'points', dataIndex: 'points' },
    { title: 'last #', dataIndex: 'last' },
  ];

  return (
    <>
      <Card>
        <div className="grid grid-cols-5">
          <Statistics title={t('validators')} value={'105 / 105 '} />
          <Statistics title={t('waiting')} value={'32'} />
          <Statistics title={t('nominators')} value={'780'} />
          <Statistics
            title={t('epoch')}
            value={
              <div className="grid grid-cols-5 gap-2">
                <span className="flex-1 col-span-2">4 hrs</span>
                <Progress percent={50} className="col-span-2" />
              </div>
            }
          />
          <Statistics
            title={t('era')}
            className="border-none"
            value={
              <div className="grid grid-cols-5 gap-2">
                <span className="flex-1 col-span-2">1 day</span>
                <Progress percent={50} className="col-span-2" />
              </div>
            }
          />
        </div>
      </Card>

      <Input size="large" placeholder={t('Flite by name, address or index')} className="my-8 w-1/3" />

      <Card>
        <Table rowKey={'id'} dataSource={testData} columns={columns} />
      </Card>
    </>
  );
}
