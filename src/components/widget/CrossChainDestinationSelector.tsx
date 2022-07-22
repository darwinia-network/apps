import { Select } from 'antd';
import { useMatch } from 'react-router-dom';
import { Path } from '../../config/routes';
import { CrossChainDestination } from '../../model';

const labels: Record<CrossChainDestination, string> = {
  Crab: 'Crab',
  Darwinia: 'Darwinia',
  Pangolin: 'Pangolin',
  Pangoro: 'Pangoro',
  CrabParachain: 'Crab Parachain',
  PangolinParachain: 'Pangolin Parachain',
  Default: 'Default',
};

export const CrossChainDestinationSelector = ({
  defaultValue,
  destinations,
  onSelect,
}: {
  defaultValue?: CrossChainDestination | null;
  destinations: CrossChainDestination[];
  onSelect: (destination: CrossChainDestination) => void;
}) => {
  const matchPath = useMatch({
    path: Path.feemarket,
  });
  const options = destinations.map((item) => ({ label: labels[item], value: item }));

  return !!matchPath && destinations.length ? (
    <Select
      options={options}
      onSelect={onSelect}
      defaultValue={defaultValue || destinations[0]}
      style={{ minWidth: '10rem' }}
    />
  ) : null;
};
