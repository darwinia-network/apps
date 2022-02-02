import { typesBundleForPolkadotApps } from '@darwinia/types/mix';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { derive } from '@polkadot/api-derive';
import { DeriveCustom } from '@polkadot/api/types';
import { derive as iDerive } from '../../api-derive/derive';

const { staking, ...rest } = derive;

const customDerive = {
  ...rest,
  staking: { ...staking, ...iDerive.staking },
} as DeriveCustom;

interface ApiGuy<T> {
  [key: string]: T;
}

abstract class Entrance<T> {
  abstract apiList: ApiGuy<T>[];
  abstract beforeRemove(instance: T): void;
  abstract init(url: string): T;
  abstract afterInit(instance: T): void;

  protected checkExist(url: string): ApiGuy<T> | null {
    const target = this.apiList.find((item) => item[url]);

    return target ?? null;
  }

  getInstance(url: string): T {
    const exist = this.checkExist(url);

    if (exist) {
      return exist[url];
    }

    const instance = this.init(url);

    this.apiList.push({ [url]: instance });
    this.afterInit(instance);

    return instance;
  }

  removeInstance(url: string): void {
    const exist = this.checkExist(url);

    if (exist) {
      this.beforeRemove(exist[url]);
      this.apiList = this.apiList.filter((item) => item !== exist);
    }
  }
}

class PolkadotEntrance extends Entrance<ApiPromise> {
  apiList: ApiGuy<ApiPromise>[] = [];

  init(url: string) {
    const provider = new WsProvider(url);

    return new ApiPromise({
      provider,
      typesBundle: typesBundleForPolkadotApps,
      derives: customDerive,
    });
  }

  afterInit(instance: ApiPromise) {
    instance.connect();
  }

  beforeRemove(instance: ApiPromise) {
    instance.disconnect();
  }
}

/**
 * Hold a singleton entrance in apps scope.
 * The entrance guarantees the instance will not be instantiated repeatedly.
 */
export const entrance = (() => {
  let polkadot: PolkadotEntrance;

  return {
    get polkadot() {
      if (polkadot) {
        return polkadot;
      }

      polkadot = new PolkadotEntrance();

      return polkadot;
    },
  };
})();
