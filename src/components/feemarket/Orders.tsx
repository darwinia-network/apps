import { Card, Statistic, Table, Select, Input, Button, Form, DatePicker, Badge, InputNumber } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

import * as echarts from 'echarts/core';
import { TooltipComponent, TooltipComponentOption, LegendComponent, LegendComponentOption } from 'echarts/components';
import { PieChart, PieSeriesOption } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer, LabelLayout]);

type EChartsOption = echarts.ComposeOption<TooltipComponentOption | LegendComponentOption | PieSeriesOption>;

type OrderData = {
  key: number;
  orderId: string;
  deliveryRelayer: string;
  confirmationRelayer: string;
  assignedRelayer: string;
  startBlock: number;
  confirmBlock: number;
  time: string;
};

const dataSource: OrderData[] = [
  {
    key: 1,
    orderId: '0x00002',
    deliveryRelayer: 'shwuycx',
    confirmationRelayer: 'ssjhwu',
    assignedRelayer: 'swuhyde',
    startBlock: 100,
    confirmBlock: 200,
    time: '2022/01/11',
  },
];

export const Orders = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [timeDimension, setTimeDimension] = useState(1);

  const columns: ColumnsType<OrderData> = [
    {
      title: 'Order ID',
      key: 'orderId',
      dataIndex: 'orderId',
      align: 'center',
      render: (value) => {
        const searchParams = new URL(window.location.href).searchParams;
        searchParams.set('orderid', '0x8765');
        return <NavLink to={`?${searchParams.toString()}`}>{value}</NavLink>;
      },
    },
    {
      title: 'Delivery Relayer',
      key: 'deliveryRelayer',
      dataIndex: 'deliveryRelayer',
      align: 'center',
    },
    {
      title: 'Confirmation Relayer',
      key: 'confirmationRelayer',
      dataIndex: 'confirmationRelayer',
      align: 'center',
    },
    {
      title: 'Assigned Relayer',
      key: 'assignedRelayer',
      dataIndex: 'assignedRelayer',
      align: 'center',
    },
    {
      title: 'Start Block',
      key: 'startBlock',
      dataIndex: 'startBlock',
      align: 'center',
    },
    {
      title: 'Confirm Block',
      key: 'confirmBlock',
      dataIndex: 'confirmBlock',
      align: 'center',
    },
    {
      title: 'Time',
      key: 'time',
      dataIndex: 'time',
      align: 'center',
    },
  ];

  useEffect(() => {
    const chart = ref.current ? echarts.init(ref.current) : null;

    if (chart) {
      const option: EChartsOption = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          orient: 'vertical',
          top: 'center',
          right: '0',
          itemWidth: 10,
          itemHeight: 10,
          borderRadius: [0, 0, 0, 0],
        },
        series: [
          {
            name: 'Order Status',
            type: 'pie',
            radius: ['70%', '90%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
            },
            data: [
              { value: 999000, name: 'Finished' },
              { value: 120000, name: 'In-progress' },
              { value: 90000, name: 'Out-of-slot' },
            ],
          },
        ],
      };

      chart.setOption(option);
    }

    return () => {
      if (chart) {
        chart.dispose();
      }
    };
  }, []);

  return (
    <>
      <Card>
        <div className="flex items-center justify-around">
          <Statistic
            value={999000}
            title={
              <div className="flex flex-col items-center">
                <CheckCircleOutlined className="text-xl" />
                <span>Finished</span>
              </div>
            }
            valueStyle={{ textAlign: 'center' }}
          />
          <Statistic
            value={120000}
            title={
              <div className="flex flex-col items-center">
                <ClockCircleOutlined className="text-xl" />
                <span>In Progress</span>
              </div>
            }
            valueStyle={{ textAlign: 'center' }}
          />
          <Statistic
            value={90000}
            title={
              <div className="flex flex-col items-center">
                <ExclamationCircleOutlined className="text-xl" />
                <span>Out of Slot</span>
              </div>
            }
            valueStyle={{ textAlign: 'center' }}
          />
          <div ref={ref} className="h-24 w-72" />
        </div>
      </Card>
      <Card className="mt-6">
        <div className="flex items-center space-x-2">
          <Input
            addonBefore={
              <Select defaultValue={1}>
                <Select.Option value={1}>Order ID</Select.Option>
                <Select.Option value={2}>Sender Address</Select.Option>
              </Select>
            }
            className="w-96"
          />
          <Button>Search</Button>
        </div>

        <Form
          layout="inline"
          className="mt-6"
          onValuesChange={({ timeDimension }) => {
            if (timeDimension) {
              setTimeDimension(timeDimension);
            }
          }}
        >
          <Form.Item name="timeDimension" label="Time Dimension">
            <Select defaultValue={1} className="w-20">
              <Select.Option value={1}>Date</Select.Option>
              <Select.Option value={2}>Block</Select.Option>
            </Select>
          </Form.Item>
          {timeDimension === 1 ? (
            <Form.Item name={`dateRange`} label="Date Range">
              <DatePicker.RangePicker />
            </Form.Item>
          ) : (
            <Form.Item name="block" label="Block">
              <InputNumber min={1} />
            </Form.Item>
          )}
          <Form.Item name={`state`} label="State">
            <Select defaultValue={0} className="w-32">
              <Select.Option value={0}>All</Select.Option>
              <Select.Option value={1}>
                <Badge color="green" text="Finished" />
              </Select.Option>
              <Select.Option value={2}>
                <Badge color="blue" text="In Progress" />
              </Select.Option>
              <Select.Option value={3}>
                <Badge color="gold" text="Out of Slot" />
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name={`slot`} label="Slot">
            <Select defaultValue={1} className="w-24">
              <Select.Option value={1}>All</Select.Option>
              <Select.Option value={2}>Slot 1</Select.Option>
              <Select.Option value={3}>Slot 2</Select.Option>
              <Select.Option value={4}>Slot 3</Select.Option>
              <Select.Option value={5}>Out of Slot</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit">Filter</Button>
          </Form.Item>
        </Form>
      </Card>
      <Card className="mt-2">
        <Table columns={columns} dataSource={dataSource} />
      </Card>
    </>
  );
};
