import { Spin, Tooltip } from 'antd';
import { useEffect, useState, memo } from 'react';
import { from, startWith, switchMap, takeWhile, timer } from 'rxjs';
import { useApi, useIsMounted } from '../../hooks';
import { prettyNumber } from '../../utils';

const duration = 6000;

function Component({ onChange = (num) => void num }: { onChange?: (num: string) => void }) {
  const { api } = useApi();
  const isMounted = useIsMounted();
  const [bestNumber, setBestNumber] = useState<string | null>(null);

  useEffect(() => {
    const sub$$ = timer(0, duration)
      .pipe(
        takeWhile(() => isMounted && api.isConnected),
        switchMap(() => from(api.derive.chain.bestNumber())),
        startWith(null)
      )
      .subscribe((num) => {
        if (num) {
          onChange(num.toString());
          setBestNumber(num.toString());
        }
      });

    return () => {
      sub$$?.unsubscribe();
    };
  }, [api, isMounted, onChange]);

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

export const BestNumber = memo(Component);
