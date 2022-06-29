interface Props {
  defaultValue?: Uint8Array | string | null;
}

export const InputAddress = ({ defaultValue }: Props) => {
  void defaultValue;

  return (
    <div>
      <span>Input Address</span>
    </div>
  );
};
