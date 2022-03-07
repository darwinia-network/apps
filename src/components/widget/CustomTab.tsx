import React from 'react';

const Tab = (props: { text: string; tabKey: string | number; activeKey: string | number }) => (
  <span
    className={`transition-opacity  hover:opacity-80 text-base not-italic text-black ${
      props.tabKey === props.activeKey ? 'font-medium' : 'font-normal opacity-60'
    }`}
  >
    {props.text}
  </span>
);

export const CustomTab = React.memo(Tab);
