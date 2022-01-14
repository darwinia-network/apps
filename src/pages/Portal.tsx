import { Card } from 'antd';
import { withRouter } from 'react-router-dom';

function Page() {
  return (
    <Card className="xl:w-1/3 lg:w-1/2 md:w-2/3 w-full mx-auto dark:shadow-none dark:border-transparent">
      <div>Portal page</div>
    </Card>
  );
}

export const Portal = withRouter(Page);
