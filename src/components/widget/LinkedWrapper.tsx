import { Labelled } from './Labelled';

interface Props {
  children: React.ReactNode;
  className?: string;
  help?: React.ReactNode;
  label: React.ReactNode;
  withLabel?: boolean;
}

export const LinkedWrapper: React.FC<Props> = ({ children, className, help, label, withLabel }) => {
  return (
    <div className={className}>
      <Labelled help={help} label={label} withLabel={withLabel}>
        <div>{children}</div>
      </Labelled>
    </div>
  );
};
