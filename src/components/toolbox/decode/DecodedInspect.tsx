import type { Inspect } from '@polkadot/types/types';
import { u8aToHex } from '@polkadot/util';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Output } from '../../widget/Output';

interface Props {
  className?: string;
  hex?: string | null;
  inspect?: Inspect | null;
  label: React.ReactNode;
}

interface Inspected {
  name: string;
  value: string;
}

const formatInspect = ({ inner = [], name = '', outer = [] }: Inspect, result: Inspected[] = []): Inspected[] => {
  if (outer.length) {
    const value = new Array<string>(outer.length);

    for (let i = 0; i < outer.length; i++) {
      value[i] = u8aToHex(outer[i], undefined, false);
    }

    result.push({ name, value: value.join(' ') });
  }

  for (const item of inner) {
    formatInspect(item, result);
  }

  return result;
};

export const DecodedInspect = ({ inspect, label, className, hex }: Props) => {
  const { t } = useTranslation();

  const formatted = useMemo(() => inspect && formatInspect(inspect), [inspect]);

  const [link, path] = useMemo((): [null | string, null | string] => {
    if (hex) {
      const path = `/extrinsics/decode/${hex}`;

      return [path, `#${path}`];
    }

    return [null, null];
  }, [hex]);

  if (!formatted) {
    return null;
  }

  return (
    <Output className={className} label={label}>
      <table>
        <tbody>
          {formatted.map(({ name, value }, i) => (
            <tr key={i}>
              <td className="pl-4 pr-1 text-right">{name}</td>
              <td className="w-full">{value}</td>
            </tr>
          ))}
          {link && (
            <tr key="hex">
              <td className="pl-4 pr-1 text-right">{t('link')}</td>
              <td className="max-w-0">
                <a
                  href={link}
                  rel="noreferrer"
                  target="_blank"
                  className="whitespace-nowrap overflow-hidden overflow-ellipsis"
                >
                  {path}
                </a>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Output>
  );
};
