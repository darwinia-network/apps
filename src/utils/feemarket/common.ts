import type { ApiPromise } from '@polkadot/api';

import type { DarwiniaChain, FeeMarketApiSection } from '../../model';
import { marketApiSections } from '../../config';

// eslint-disable-next-line complexity
export const getFeeMarketApiSection = (api: ApiPromise, destination: DarwiniaChain): FeeMarketApiSection | null => {
  const { specName } = api.consts.system.version;
  const source = specName.toString() as DarwiniaChain;

  if (marketApiSections[source] && marketApiSections[source][destination]) {
    const sections = marketApiSections[source][destination];
    for (const section of sections) {
      if (api.consts[section] && api.query[section]) {
        return section;
      }
    }
  }

  return null;
};
