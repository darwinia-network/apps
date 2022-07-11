import { svgIconFactory } from './icon-factory';

function Chart() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.0208 0.25H0.979167C0.578125 0.25 0.25 0.578125 0.25 0.979167V17.0208C0.25 17.4219 0.578125 17.75 0.979167 17.75H17.0208C17.4219 17.75 17.75 17.4219 17.75 17.0208V0.979167C17.75 0.578125 17.4219 0.25 17.0208 0.25ZM7.54167 6.86719L10.4583 9.78385L15.2344 5.00781L16.2734 6.04688L10.4583 11.862L7.54167 8.94531L5.68229 10.7865L4.64323 9.7474L7.54167 6.86719ZM16.2917 16.2917H1.70833V1.70833H3.16667V14.8333H16.2917V16.2917Z"
        fill="black"
        fillOpacity="0.45"
      />
    </svg>
  );
}

export const ChartIcon = svgIconFactory(Chart);
