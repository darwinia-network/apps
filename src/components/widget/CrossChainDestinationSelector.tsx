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
  defaultDestination,
  onSelect,
}: {
  destinations: CrossChainDestination[];
  defaultDestination?: CrossChainDestination;
  onSelect: (destination: CrossChainDestination) => void;
}) => {
  const match = useRouteMatch({
    path: Path.feemarket,
    exact: true,
  });
  const options = destinations.map((item) => ({ label: labels[item], value: item }));

  return match && destinations.length ? (
    <Select options={options} onSelect={onSelect} defaultValue={defaultDestination} style={{ minWidth: '10rem' }} />
  ) : null;
};
