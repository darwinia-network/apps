import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

export const TotalOrdersChart = () => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<Highcharts.Options>({});

  useEffect(() => {
    const now = Date.now();
    const day = 60 * 60 * 24 * 1000; // eslint-disable-line

    setOptions({
      chart: {
        spacingLeft: 30,
        spacingRight: 30,
        spacingBottom: 0,
        spacingTop: 20,
      },
      title: {
        text: t('Total Orders'),
        align: 'left',
        margin: 0,
      },
      series: [
        {
          type: 'column',
          name: 'Orders',
          color: '#512DBC',
          data: new Array(45).fill(0).map((_, index) => [now + day * index, Math.floor(Math.random() * 100)]), // eslint-disable-line
        },
      ],
      tooltip: {
        borderColor: '#512DBC',
        borderRadius: 12,
      },
      credits: {
        enabled: false,
      },
      navigator: {
        enabled: false,
      },
      scrollbar: {
        enabled: false,
      },
      rangeSelector: {
        inputEnabled: false,
        labelStyle: {
          display: 'none',
          width: 0,
        },
        buttonTheme: {
          r: 4,
        },
        buttonPosition: {
          align: 'right',
        },
        buttons: [
          {
            type: 'all',
            text: t('All'),
            title: t('View all'),
          },
          {
            type: 'week',
            count: 1,
            text: t('7D'),
            title: t('View 7 days'),
          },
          {
            type: 'month',
            count: 1,
            text: t('30D'),
            title: t('View 30 days'),
          },
        ],
        selected: 0,
      },
    });
  }, [t]);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      constructorType="stockChart"
      containerProps={{ className: 'h-96 my-12 shadow-xxl rounded-lg' }}
    />
  );
};
