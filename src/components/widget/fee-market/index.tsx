import { SegmentedType } from '../../../model';

export const Segmented = ({
  onSelect = () => undefined,
  value = SegmentedType.ALL,
  className,
}: {
  onSelect?: (type: SegmentedType) => void;
  value?: SegmentedType;
  className?: string;
}) => {
  return (
    <div className={`inline-flex items-center justify-center space-x-1 ${className}`}>
      <span
        className={`cursor-pointer bg-gray-300 px-2 rounded-l-sm ${value === SegmentedType.ALL ? 'bg-gray-400' : ''}`}
        onClick={() => onSelect(SegmentedType.ALL)}
      >
        All
      </span>
      <span
        className={`cursor-pointer bg-gray-300 px-2 ${value === SegmentedType.L7D ? 'bg-gray-400' : ''}`}
        onClick={() => onSelect(SegmentedType.L7D)}
      >
        7D
      </span>
      <span
        className={`cursor-pointer bg-gray-300 px-2 rounded-r-sm ${value === SegmentedType.L30D ? 'bg-gray-400' : ''}`}
        onClick={() => onSelect(SegmentedType.L30D)}
      >
        30D
      </span>
    </div>
  );
};
