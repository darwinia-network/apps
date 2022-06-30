import type { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { Output } from './Output';

interface Props {
  defaultValue: SubmittableExtrinsicFunction<'promise'>;
  label: React.ReactNode;
}

export const DisplayExtrinsic: React.FC<Props> = ({ defaultValue, label }) => {
  const {
    section,
    method,
    meta: { args, docs },
  } = defaultValue;

  return (
    <Output label={label}>
      <div className="flex justify-between">
        <span>{section}</span>
        <span>
          {method}({args.map((arg) => arg.name.toString()).join(', ')})
        </span>
        <span className="opacity-60">{(docs[0] || method).toString()}</span>
      </div>
    </Output>
  );
};
