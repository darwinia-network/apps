import { useMemo } from 'react';
import { getTypeDef } from '@polkadot/types/create';
import type { Registry, TypeDef } from '@polkadot/types/types';

import type { ParamDef } from '../../model/param';

function expandDef(registry: Registry, td: TypeDef): TypeDef {
  try {
    return getTypeDef(registry.createType(td.type as 'u32').toRawType());
  } catch (e) {
    return td;
  }
}

function getDefs(registry: Registry, type: TypeDef): ParamDef[] {
  const typeDef = expandDef(registry, type);

  return typeDef.sub
    ? (Array.isArray(typeDef.sub) ? typeDef.sub : [typeDef.sub]).map(
        (td): ParamDef => ({
          length: typeDef.length,
          name: td.name,
          type: td,
        })
      )
    : [];
}

export const useParamDefs = (registry: Registry, type: TypeDef): ParamDef[] => {
  return useMemo(() => getDefs(registry, type), [registry, type]);
};
