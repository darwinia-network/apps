import { svgIconFactory } from './icon-factory';

function Icon() {
  return (
    <svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        opacity="0.5"
        d="M20 0.362913L18.4053 1.99958C18.2658 2.11344 18.1993 2.29845 18.2259 2.47635V14.5237C18.1993 14.7087 18.2658 14.8937 18.4053 15.0004L19.9668 16.6371V17H12.1262V16.6513L13.7409 14.972C13.9003 14.8012 13.9003 14.7514 13.9003 14.4952V4.75345L9.40864 16.9644H8.80399L3.57475 4.75345V12.9368C3.52824 13.2784 3.6412 13.627 3.86711 13.8761L5.96678 16.6015V16.9644H0V16.6015L2.09967 13.8761C2.32558 13.627 2.42525 13.2784 2.37209 12.9368V3.47258C2.39867 3.20929 2.30565 2.95312 2.1196 2.77522L0.252492 0.362913V0H6.05316L10.5316 10.5316L14.4718 0.0071159H20V0.362913Z"
        fill="url(#paint0_linear_659_2770)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_659_2770"
          x1="19.6429"
          y1="17"
          x2="3.21388"
          y2="-2.68261"
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

export const MediumIcon = svgIconFactory(Icon);
