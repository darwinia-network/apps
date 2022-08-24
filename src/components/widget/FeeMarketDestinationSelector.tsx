import { Select } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useMatch } from 'react-router-dom';
import { Path } from '../../config/routes';
import { DarwiniaChain, Network } from '../../model';

export const FeeMarketDestinationSelector = ({
  network,
  defaultValue,
  destinations,
  refresh = () => undefined,
  onSelect,
}: {
  network: Network;
  defaultValue?: DarwiniaChain | null;
  destinations: DarwiniaChain[];
  refresh: () => void;
  onSelect: (destination: DarwiniaChain) => void;
}) => {
  const matchPath = useMatch({
    path: Path.feemarket,
  });
  const options = destinations.map((item) => ({ label: item, value: item }));

  return !!matchPath && destinations.length ? (
    <div className="flex items-center space-x-2">
      <Select
        options={options}
        onSelect={onSelect}
        defaultValue={defaultValue || destinations[0]}
        style={{ minWidth: '10rem' }}
      />
      <SyncOutlined
        className={`text-${network}-main inline-flex items-center justify-center text-xl transition-transform duration-300 transform hover:rotate-90 fee-market-refresh`}
        onClick={refresh}
      />
    </div>
  ) : null;
};
