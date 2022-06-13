import { Alert, Button, notification } from 'antd';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { from } from 'rxjs';
import { useApi, useAccount } from '../../../hooks';
import {
  dvmAddressToAccountId,
  getDarwiniaBalances,
  entrance,
  toWei,
  fromWei,
  handleEthTxResult,
} from '../../../utils';
import { DVMChainConfig } from '../../../model';

const DVM_CLAIM_ADDRESS = '0x0000000000000000000000000000000000000015';

export const ClaimKton = ({
  dvmAddress,
  onSuccess = () => undefined,
}: {
  dvmAddress: string;
  onSuccess?: () => void;
}) => {
  const { api, network } = useApi();
  const {
    assets: [, assetKton],
  } = useAccount();
  const [busy, setBusy] = useState(false);
  const [ktonToClaim, setKtonToClaim] = useState('0');

  const { kton } = network.tokens;
  const { kton: dvmKton } = (network as DVMChainConfig).dvm;

  const tokenIconSrc = useMemo(
    () => `/image/token-${(assetKton?.token.symbol || 'KTON').toLowerCase()}.svg`,
    [assetKton]
  );

  const getKtonToClaim = useCallback(() => {
    if (dvmAddress) {
      const address = dvmAddressToAccountId(dvmAddress).toString();
      return from(getDarwiniaBalances(api, address)).subscribe(([_, ktonAmount]) => setKtonToClaim(ktonAmount));
    }

    return from(['0']).subscribe(setKtonToClaim);
  }, [dvmAddress, api]);

  const handleClaimKton = useCallback(() => {
    try {
      setBusy(true);

      const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);

      const params = web3.eth.abi.encodeParameters(
        ['address', 'uint256'],
        [dvmKton.address, toWei({ value: ktonToClaim })]
      );

      // eslint-disable-next-line no-magic-numbers
      const data = '0x3225da29' + params.substring(2);
      const gas = 100000;

      const tx = web3.eth.sendTransaction({
        from: dvmAddress,
        to: DVM_CLAIM_ADDRESS,
        data,
        value: '0x00',
        gas,
      });

      handleEthTxResult(tx, {
        txFailedCb: () => setBusy(false),
        txSuccessCb: () => {
          getKtonToClaim();
          onSuccess();
          setBusy(false);
        },
      });
    } catch (error) {
      setBusy(false);
      console.error(error);
      notification.error({
        message: 'Transaction failed',
        description: (error as Error).message,
      });
    }
  }, [dvmAddress, dvmKton.address, ktonToClaim, getKtonToClaim, onSuccess]);

  useEffect(() => {
    const sub$$ = getKtonToClaim();

    return () => sub$$.unsubscribe();
  }, [getKtonToClaim]);

  return ktonToClaim === '0' ? null : (
    <Alert
      showIcon
      message={`You have ${fromWei({ value: ktonToClaim })} ${kton.symbol} to claim`}
      icon={<img alt="..." src={tokenIconSrc} className="w-6 h-6" />}
      action={
        <Button type="primary" loading={busy} onClick={handleClaimKton}>
          Receive
        </Button>
      }
      className="absolute top-6 left-auto right-6 z-10"
    />
  );
};
