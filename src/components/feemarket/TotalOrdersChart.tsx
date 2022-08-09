import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

export const TotalOrdersChart = ({ data }: { data: [number, number][] }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<Highcharts.Options>({});

  useEffect(() => {
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
          name: t('Orders'),
          color: '#8085e9',
          data: [...data],
        },
      ],
      tooltip: {
        borderRadius: 12,
        dateTimeLabelFormats: {
          millisecond: '%Y/%m/%d(+UTC)',
          second: '%Y/%m/%d(+UTC)',
          minute: '%Y/%m/%d(+UTC)',
          hour: '%Y/%m/%d(+UTC)',
          day: '%Y/%m/%d(+UTC)',
        },
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
      xAxis: [
        {
          labels: {
            format: '{value:%Y/%m/%d}',
          },
        },
      ],
      yAxis: [
        {
          opposite: false,
        },
      ],
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
          y: -20,
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
  }, [t, data]);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      constructorType="stockChart"
      containerProps={{ className: 'h-96 w-full shadow-xxl rounded-lg' }}
    />
  );
};
