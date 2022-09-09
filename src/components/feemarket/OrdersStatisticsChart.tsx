import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export const OrdersStatisticsChart = ({
  finished,
  inSlot,
  outOfSlot,
}: {
  finished: number;
  inSlot: number;
  outOfSlot: number;
}) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<Highcharts.Options>({});

  useEffect(() => {
    setOptions({
      title: {
        style: {
          display: 'none',
        },
      },
      legend: {
        enabled: true,
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        width: '65%',
        x: -10,
        margin: 0,
        itemWidth: 300,
        itemMarginTop: 2,
        itemMarginBottom: 2,
      },
      plotOptions: {
        pie: {
          size: 80,
          dataLabels: {
            enabled: false,
          },
          showInLegend: true,
          center: ['50%', -20], // eslint-disable-line
        },
      },
      credits: {
        enabled: false,
      },
      tooltip: {
        borderRadius: 12,
      },
      series: [
        {
          type: 'pie',
          name: t('Orders Count'),
          innerSize: '70%',
          data: [
            {
              y: finished,
              name: `${t('Finished')}`,
              color: '#90ed7d',
            },
            {
              y: inSlot,
              name: `${t('In Progress')} (${t('In Slot')})`,
              color: '#8085e9',
            },
            {
              y: outOfSlot,
              name: `${t('In Progress')} (${t('Out of Slot')})`,
              color: '#f45b5b',
            },
          ],
        },
      ],
    });
  }, [t, finished, inSlot, outOfSlot]);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      constructorType="chart"
      containerProps={{ className: 'h-24 w-72' }}
    />
  );
};
