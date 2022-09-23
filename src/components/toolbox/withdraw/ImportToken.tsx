import { Button } from 'antd';
import { EVMToken } from '../../../model';

export const ImportToken = ({ disabled, token }: { disabled: boolean; token?: EVMToken | null }) =>
  token ? (
    <Button
      size="large"
      htmlType="button"
      className="ml-3"
      disabled={disabled}
      onClick={async () => {
        try {
          window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: token.address,
                symbol: token.symbol,
                decimals: token.decimals,
              },
            },
          });
        } catch (err) {
          console.error(err);
        }
      }}
    >
      {`Import ${token.symbol}`}
    </Button>
  ) : null;
