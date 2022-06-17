import { Select } from 'antd';
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
  const options = destinations.map((item) => ({ label: labels[item], value: item }));

  return destinations.length ? (
    <Select options={options} onSelect={onSelect} defaultValue={defaultDestination} style={{ minWidth: '10rem' }} />
  ) : null;
};
