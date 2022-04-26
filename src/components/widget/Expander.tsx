import React, { useMemo } from 'react';
import { Collapse } from 'antd';
import type { Text } from '@polkadot/types';

interface Meta {
  docs: Text[];
}

function splitSingle(value: string[], sep: string): string[] {
  return value.reduce((result: string[], value: string): string[] => {
    return value.split(sep).reduce((result: string[], value: string) => result.concat(value), result);
  }, []);
}

function splitParts(value: string): string[] {
  return ['[', ']'].reduce((result: string[], sep) => splitSingle(result, sep), [value]);
}

function formatMeta(meta?: Meta): React.ReactNode | null {
  if (!meta || !meta.docs.length) {
    return null;
  }

  const strings = meta.docs.map((d) => d.toString().trim());
  const firstEmpty = strings.findIndex((d) => !d.length);
  const combined = (firstEmpty === -1 ? strings : strings.slice(0, firstEmpty))
    .join(' ')
    .replace(/#(<weight>| <weight>).*<\/weight>/, '');
  const parts = splitParts(combined.replace(/\\/g, '').replace(/`/g, ''));

  return (
    <>
      {/* eslint-disable-next-line no-magic-numbers */}
      {parts.map((part, index) => (index % 2 ? <em key={index}>[{part}]</em> : <span key={index}>{part}</span>))}&nbsp;
    </>
  );
}

interface Props {
  children?: React.ReactNode;
  summary?: React.ReactNode;
  summaryMeta?: Meta;
  summarySub?: React.ReactNode;
}

export const Expander: React.FC<Props> = ({ children, summary, summaryMeta, summarySub }) => {
  const headerMain = useMemo(() => summary || formatMeta(summaryMeta), [summary, summaryMeta]);

  const headerSub = useMemo(
    () => (summary ? formatMeta(summaryMeta) || summarySub : null),
    [summary, summaryMeta, summarySub]
  );

  return (
    <Collapse>
      <Collapse.Panel
        key=""
        header={
          <div>
            {headerMain}
            {headerSub}
          </div>
        }
      >
        {children}
      </Collapse.Panel>
    </Collapse>
  );
};
