import { Button, message, notification } from 'antd';
import { Trans } from 'react-i18next';
import { Observable, Observer } from 'rxjs';
import Web3 from 'web3';
import { MetamaskError, AddEthereumChainParameter } from '../../model';
import { isNativeMetamaskChain } from './network';

async function switchEthereumChain(network: AddEthereumChainParameter): Promise<null> {
  const chainId = Web3.utils.toHex(network.chainId);
  const res: null = await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId }],
  });

  return res;
}

/**
 * @description add chain in metamask
 */
async function addEthereumChain(network: AddEthereumChainParameter): Promise<null> {
  const chainId = Web3.utils.toHex(network.chainId);
  const result = await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{ ...network, chainId }],
  });

  return result;
}

export const switchMetamaskNetwork: (network: AddEthereumChainParameter) => Observable<null> = (
  network: AddEthereumChainParameter
) => {
  const key = `key${Date.now()}`;

  return new Observable((observer: Observer<null>) => {
    notification.error({
      message: <Trans>Incorrect network</Trans>,
      description: (
        <Trans
          i18nKey="Network mismatch, you can switch network manually in metamask or do it automatically by clicking the button below"
          tOptions={{ type: network.chainName }}
        ></Trans>
      ),
      btn: (
        <Button
          type="primary"
          onClick={async () => {
            try {
              const isNative = isNativeMetamaskChain(network);
              const action = isNative ? switchEthereumChain : addEthereumChain;
              const res = await action(network);

              notification.close(key);
              observer.next(res);
            } catch (err: unknown) {
              message.error({
                content: (
                  <span>
                    <Trans>Network switch failed, please switch it in the metamask plugin!</Trans>
                    <span className="ml-2">{(err as MetamaskError).message}</span>
                  </span>
                ),
                duration: 5,
              });
            }
          }}
        >
          <Trans i18nKey="Switch to {{ network }}" tOptions={{ network: network.chainName }}></Trans>
        </Button>
      ),
      key,
      onClose: () => {
        notification.close(key);
        observer.complete();
      },
      duration: null,
    });
  });
};
