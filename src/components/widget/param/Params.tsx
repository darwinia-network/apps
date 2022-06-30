import type { Registry } from '@polkadot/types/types';
import { ReactNode } from 'react';

import { useApi } from '../../../hooks';
import { ErrorBoundary } from '../ErrorBoundary';
import { BareProps, RawParams, ComponentMap, ParamDef } from '../../../model/param';
import { Holder } from './Holder';
import { ParamComp } from './ParamComp';

interface Props extends BareProps {
  children?: React.ReactNode;
  isDisabled?: boolean;
  onChange?: (value: RawParams) => void;
  onEnter?: () => void;
  onError?: () => void;
  onEscape?: () => void;
  overrides?: ComponentMap;
  params: ParamDef[];
  registry?: Registry;
  values?: RawParams | null;
  withBorder?: boolean;
}

export const Params: React.FC<Props> = ({ children, values, params, isDisabled, overrides, registry }) => {
  const { api } = useApi();

  return (
    <Holder>
      <ErrorBoundary>
        <div className="ml-4">
          {values &&
            params.map(
              ({ name, type }: ParamDef, index: number): ReactNode => (
                <ParamComp
                  defaultValue={values[index]}
                  index={index}
                  key={index}
                  isDisabled={isDisabled}
                  name={name}
                  overrides={overrides}
                  registry={registry || api.registry}
                  type={type}
                />
              )
            )}
          {children}
        </div>
      </ErrorBoundary>
    </Holder>
  );
};
