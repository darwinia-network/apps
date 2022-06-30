interface Props {
  children?: React.ReactNode;
  className?: string;
  withBorder?: boolean;
  withPadding?: boolean;
}

export const Holder: React.FC<Props> = ({ children }) => {
  return <div>{children}</div>;
};
