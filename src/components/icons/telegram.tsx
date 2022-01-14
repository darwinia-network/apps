import { svgIconFactory } from './icon-factory';

function Icon() {
  return (
    <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        opacity="0.5"
        d="M0.835918 7.01817C-0.255089 7.49567 -0.237056 8.18651 0.651078 8.49638L4.73559 9.93394L14.2165 3.20837C14.6583 2.87311 15.0686 3.06106 14.735 3.39632L7.06638 11.2039L6.76883 15.9534C7.19261 15.9534 7.37745 15.7452 7.59835 15.4963L9.59553 13.3323L13.7341 16.7662C14.4915 17.2437 15.028 16.9948 15.2309 15.9738L17.9494 1.5473C18.1883 0.277362 17.5436 -0.220452 16.8043 0.0894116L0.835918 7.01817Z"
        fill="url(#paint0_linear_659_2768)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_659_2768"
          x1="17.6786"
          y1="17"
          x2="1.02793"
          y2="-0.953346"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF0050" />
          <stop offset="0.714448" stopColor="#7000FF" />
          <stop offset="1" stopColor="#0027FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export const TelegramIcon = svgIconFactory(Icon);
