import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

export const QuoteHistoryChart = ({ data }: { data: [number, number][] }) => {
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
        text: t('Quote History'),
        align: 'left',
        margin: 0,
      },
      series: [
        {
          type: 'line',
          name: t('Quote'),
          color: '#8085e9',
          data: [...data],
        },
      ],
      tooltip: {
        borderRadius: 12,
        dateTimeLabelFormats: {
          millisecond: '%Y/%m/%dT%H:%M%S(+UTC)',
          second: '%Y/%m/%dT%H:%M:%S(+UTC)',
          minute: '%Y/%m/%dT%H:%M:%S(+UTC)',
          hour: '%Y/%m/%dT%H:%M:%S(+UTC)',
          day: '%Y/%m/%dT%H:%M:%S(+UTC)',
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
            format: '{value:%Y/%m/%dT%H:%M:%S}',
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
