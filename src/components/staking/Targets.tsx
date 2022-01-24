import { Button, Card, Input } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';
import { Statistics } from '../widget/Statistics';

const testData = [
  { id: 0, validators: 'xxx', other: '8743104(8)', own: 4848, active: '6%', next: '6%', points: 2660, last: 6157610 },
];

export function Targets() {
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
          <Statistics title={t('total staked(Power)')} value={'105 / 105 '} />
          <Statistics title={t('total issuance(CRAB)')} value={'32'} />
          <Statistics title={t('total issuance(CKTON)')} value={'780'} />
          <Statistics title={t('validators/nominators')} value={'95 / 304'} />
          <Statistics title={t('last reward(CRAB)')} className="border-none" value={37990} />
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <Input size="large" placeholder={t('Flite by name, address or index')} className="my-8 w-1/3" />
        <Button type="primary">{t('Nominate selected')}</Button>
      </div>

      <Card>
        <Table rowKey={'id'} dataSource={testData} columns={columns} />
      </Card>
    </>
  );
}
