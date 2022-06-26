import { Select } from 'antd';
import { useRouteMatch } from 'react-router-dom';
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
  destinations,
  onSelect,
}: {
  destinations: CrossChainDestination[];
  onSelect: (destination: CrossChainDestination) => void;
}) => {
  const matchPath = useRouteMatch({
    path: Path.feemarket,
    exact: true,
  });
  const options = destinations.map((item) => ({ label: labels[item], value: item }));

  return matchPath && destinations.length ? (
    <Select options={options} onSelect={onSelect} defaultValue={destinations[0]} style={{ minWidth: '10rem' }} />
  ) : null;
};
