import { Collapse } from 'antd';

const { Panel } = Collapse;

export function Waiting() {
  return (
    <Collapse collapsible="header" defaultActiveKey={['1']}>
      <Panel header="This panel can only be collapsed by clicking text" key="1">
        <p>xxxxxx</p>
      </Panel>
    </Collapse>
  );
}
