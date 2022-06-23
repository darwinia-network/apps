import { Spin, Tooltip } from 'antd';
import { prettyNumber } from '../../utils';

export function BestNumber({ bestNumber }: { bestNumber: number }) {
  return (
    <Tooltip title={bestNumber}>
      <div className="max-w-full overflow-hidden flex items-center">
        {bestNumber ? (
          <span className="inline-flex items-center gap-2">
            <span>#</span>
            <span>{prettyNumber(bestNumber, { decimal: 0, ignoreZeroDecimal: true })}</span>
          </span>
        ) : (
          <Spin size="small" className="mx-auto" />
        )}
      </div>
    </Tooltip>
  );
}
