import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { ReactNode } from 'react';

interface LabelProps {
  text: string | ReactNode;
  info?: string | ReactNode;
  className?: string;
}

export function Label({ text, info, className = '' }: LabelProps) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span>{text}</span>
      {info && (
        <Tooltip title={info}>
          <QuestionCircleOutlined className="cursor-help" />
        </Tooltip>
      )}
    </span>
  );
}
