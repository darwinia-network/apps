import { Card, Descriptions, Typography, Badge, Divider, Breadcrumb } from 'antd';
import { NavLink } from 'react-router-dom';
import { Path } from '../../config/routes';

export const OrderDetail = ({ orderId }: { orderId: string }) => {
  void orderId;

  return (
    <>
      <Breadcrumb separator=">">
        <Breadcrumb.Item>
          <NavLink to={`${Path.feemarket}?tab=orders`}>Orders</NavLink>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{` 0x0a11…ed1a80`}</Breadcrumb.Item>
      </Breadcrumb>

      <Card className="mt-1">
        <Descriptions column={1}>
          <Descriptions.Item label="Source TxID">
            <Typography.Link>0x433dd33c63a3f8a4a7f7483fe33b15a7963665d33c1ee60ba70075290d43cc87</Typography.Link>
          </Descriptions.Item>
          <Descriptions.Item label="Target TxID">
            <Typography.Link>0x433dd33c63a3f8a4a7f7483fe333665d33c1ee60ba70075290d43cc87</Typography.Link>
          </Descriptions.Item>
          <Descriptions.Item label="State">
            <Badge color="green" text="Cross-chain Success" />
          </Descriptions.Item>
          <Descriptions.Item label="Time Stamp">1 hrs 23 mins ago (Mar-24-2022 09:23:14 AM +UTC)</Descriptions.Item>
          <Descriptions.Item label="From">2tJaxND51vBbPwUDHuhVzndY4MeohvvHvn3D9uDejYNin73S</Descriptions.Item>
          <Descriptions.Item label="To">0xcb515340b4889807de6bb15403e9403680dc7302</Descriptions.Item>
          <Descriptions.Item label="Cross-chain Fee:">55 RING</Descriptions.Item>
        </Descriptions>

        <Divider className="my-2" />

        <Descriptions column={1}>
          <Descriptions.Item label="Lane ID">0xcb515340b4</Descriptions.Item>
          <Descriptions.Item label="Nonce">126</Descriptions.Item>
          <Descriptions.Item label="Start Block">#234</Descriptions.Item>
          <Descriptions.Item label="End Block">#244</Descriptions.Item>
          <Descriptions.Item label="Priority Slot">10 (Slot1)</Descriptions.Item>
        </Descriptions>

        <Divider className="my-2" />

        <Descriptions column={1}>
          <Descriptions.Item label="Assigned relayers">B...H大鱼#4 DOZENODES ❤️Be-World-#0 10 RING</Descriptions.Item>
          <Descriptions.Item label="Delivery relayer">B...H大鱼#4 4 RING</Descriptions.Item>
          <Descriptions.Item label="Confirm relayer">❤️Be-World-#0 10 RING</Descriptions.Item>
          <Descriptions.Item label="To Treaury">10 RING</Descriptions.Item>
        </Descriptions>
      </Card>
    </>
  );
};
