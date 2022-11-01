import { Card, Typography, Spin, Button, Form, Modal, notification } from 'antd';
import { useState, useCallback, useEffect, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { isRing, rxGet, rxPost, formatTimeLeft } from 'src/utils';
import { capitalize } from 'lodash';
import { useAccount, useApi } from 'src/hooks';
import { AddressItem } from 'src/components/widget/form-control/AddressItem';
import { timer } from 'rxjs';
import { millisecondsInHour, millisecondsInSecond } from 'date-fns';
import { SubscanLink } from 'src/components/widget/SubscanLink';
import { FaucetResponse, FaucetResponseCode, FaucetThrottleData, FaucetTransferData } from 'src/model';

// eslint-disable-next-line complexity
export const Faucet = () => {
  const { t } = useTranslation();
  const { network } = useApi();
  const { assets, refreshAssets } = useAccount();
  const [busy, setBusy] = useState(false);
  const [loading, setLoaing] = useState(false);
  const [address, setAddress] = useState<string | null | undefined>(null);

  const [message, setMessage] = useState('');
  const [throttle, setThrottle] = useState<FaucetThrottleData>({ lastTime: 0, throttleHours: 0 });
  const [status, setStatus] = useState<FaucetResponseCode | null>(null);

  const symbol = assets.find((item) => isRing(item.token.symbol))?.token.symbol;

  const handleOpenFaucet = useCallback(() => {
    setBusy(true);
    rxPost<FaucetResponse<unknown>>({
      url: `/api/${network.name}`,
      params: { address },
    }).subscribe({
      next: (res) => {
        if (!res) {
          return;
        }

        const { code, message, data } = res;
        if (code === FaucetResponseCode.SUCCESS_TRANSFER) {
          const { txHash, lastTime, throttleHours } = data as FaucetTransferData & FaucetThrottleData;
          notification.success({
            message: t('Faucet success'),
            description: <SubscanLink network={network.name} txHash={txHash} className="underline" />,
          });

          refreshAssets();
          setThrottle({ lastTime, throttleHours });
        } else if (code === FaucetResponseCode.FAILED_EXTRINSIC) {
          notification.warning({
            message,
            description: (
              <SubscanLink network={network.name} txHash={(data as FaucetTransferData).txHash} className="underline" />
            ),
          });
        } else if (code === FaucetResponseCode.FAILED_THROTTLE) {
          setThrottle(data as FaucetThrottleData);
        }

        setMessage(message);
        setStatus(code);
        setBusy(false);
      },
      error: (err) => {
        const error = err as Error;
        notification.error({
          message: t('Faucet error'),
          description: error.message,
        });
        setBusy(false);
      },
    });
  }, [network.name, address, t, refreshAssets]);

  useEffect(() => {
    if (!address) {
      return;
    }

    setLoaing(true);
    const sub$$ = rxGet<FaucetResponse<unknown>>({
      url: `/api/${network.name}`,
      params: { address },
    }).subscribe({
      next: (res) => {
        if (!res) {
          return;
        }

        const { code, message, data } = res;
        if (code === FaucetResponseCode.FAILED_THROTTLE) {
          setThrottle(data as FaucetThrottleData);
        }
        setMessage(message);
        setStatus(code);
        setLoaing(false);
      },
      error: (err) => {
        const error = err as Error;
        notification.error({
          message: error.message,
        });
        setLoaing(false);
      },
    });

    return () => {
      sub$$.unsubscribe();
      setLoaing(false);
      setStatus(null);
    };
  }, [network.name, address]);

  return (
    <>
      <Card className="max-w-xl pb-8">
        <Form<{ address: string }>
          layout="vertical"
          onValuesChange={({ address }) => {
            setAddress(address);
          }}
          onFinish={({ address }) => {
            console.log(address);
          }}
        >
          <Section>
            <span>
              {t(
                'This faucet sends {{symbol}} (TestToken) on {{network}} Chain to your account. You can request 100 {{symbol}} from faucet every 12h.',
                { network: capitalize(network.name), symbol }
              )}
            </span>
          </Section>

          <Section label={t('You will receive')} className="mt-6">
            <div className="py-6 flex justify-center items-center bg-gray-100 rounded-xl">
              <span className="text-xl font-bold">100 {symbol}</span>
            </div>
          </Section>

          <Form.Item className="mt-7 mb-2">
            <AddressItem label={'Your account'} name="address" extra={null} />
          </Form.Item>

          <div className="flex flex-col items-center mt-3 gap-8">
            <Request
              onClick={handleOpenFaucet}
              loading={loading || busy}
              disabled={status !== FaucetResponseCode.SUCCESS_PRECHECK}
            />
            <div className="flex flex-col items-center">
              {!status || status === FaucetResponseCode.SUCCESS_PRECHECK ? null : status ===
                  FaucetResponseCode.FAILED_THROTTLE || status === FaucetResponseCode.SUCCESS_TRANSFER ? (
                <ThrottleLimit throttleData={throttle} onFinish={() => setStatus(null)} />
              ) : status === FaucetResponseCode.FAILED_INSUFFICIENT ? (
                <Insufficient />
              ) : (
                <Typography.Text className="text-red-500">{message}</Typography.Text>
              )}
            </div>
          </div>
        </Form>
      </Card>

      <Modal visible={busy} onCancel={() => setBusy(false)} footer={null} width={460}>
        <div className="py-16 flex flex-col justify-center items-center">
          <Spin size="large" />
          <Typography.Paragraph className="mt-4">{t('Transaction is being processed')}</Typography.Paragraph>
        </div>
      </Modal>
    </>
  );
};

const Section = ({ label, children, className }: PropsWithChildren<{ label?: string; className?: string }>) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && <h5 className="font-bold">{label}</h5>}
    {children}
  </div>
);

const Request = ({
  loading,
  disabled,
  onClick = () => undefined,
}: {
  loading: boolean;
  disabled: boolean;
  onClick?: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <Button size="large" className="w-full" type="primary" loading={loading} disabled={disabled} onClick={onClick}>
      {t('Request')}
    </Button>
  );
};

const ThrottleLimit = ({
  throttleData: { throttleHours, lastTime },
  onFinish,
}: {
  throttleData: FaucetThrottleData;
  onFinish: () => void;
}) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({ hrs: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const sub$$ = timer(0, millisecondsInSecond).subscribe(() => {
      const milliSecs = throttleHours * millisecondsInHour + lastTime - Date.now();

      if (milliSecs > 0) {
        const { hours: hrs, minutes: mins, seconds: secs } = formatTimeLeft(milliSecs);
        setTimeLeft({ hrs, mins, secs });
      } else {
        onFinish();
      }
    });

    return () => sub$$.unsubscribe();
  }, [lastTime, throttleHours, onFinish]);

  return (
    <>
      <Typography.Text className="text-red-500">{t('Time left until the next request')}</Typography.Text>
      <Typography.Text className="text-2xl">{`${timeLeft.hrs} hrs ${timeLeft.mins} mins ${timeLeft.secs} secs`}</Typography.Text>
    </>
  );
};

const Insufficient = () => {
  const { t } = useTranslation();
  return (
    <>
      <Typography.Text className="text-red-500">{t('Sorry that the faucet is lack of tokens')}</Typography.Text>
      <Typography.Text>
        {t('Please contact us via ')}
        <Typography.Link href="mailto:hello@darwinia.network">hello@darwinia.network</Typography.Link>
      </Typography.Text>
    </>
  );
};
