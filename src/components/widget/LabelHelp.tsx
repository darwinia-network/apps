import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface Props {
  help: React.ReactNode;
  className?: string;
}

export const LabelHelp = ({ className, help }: Props) => {
  return (
    <div className={className}>
      <Tooltip title={help}>
        <QuestionCircleOutlined className="cursor-help" />
      </Tooltip>
    </div>
  );
};
