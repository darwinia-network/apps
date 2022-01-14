import { svgIconFactory } from './icon-factory';

function Icon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.25 11.408L6.07464 16.5009L14.7827 9.46423L16.7892 7.30509L17.7272 8.69993L16.448 9.69894C16.2715 9.83686 16.2325 10.1023 16.361 10.2918C16.4895 10.4813 16.7368 10.5232 16.9134 10.3853L18.5111 9.1375C18.6872 8.99997 18.7265 8.73551 18.5991 8.54598L17.389 6.7465C17.3776 6.7296 17.3653 6.71386 17.3522 6.69931L17.7329 6.28968L11.88 0L1.25 11.408Z"
        fill="currentColor"
        fillOpacity="0.45"
      />
      <path
        d="M17.9391 11.4923V16.5088C17.9391 17.6123 15.2815 18.512 12.0071 18.512C8.7327 18.512 6.0752 17.6123 6.0752 16.5088V11.4923"
        fill="white"
      />
      <path
        d="M17.9391 11.4923V16.5088C17.9391 17.6123 15.2815 18.512 12.0071 18.512C8.7327 18.512 6.0752 17.6123 6.0752 16.5088V11.4923"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.0752 14.0564C6.0752 15.1683 8.7327 16.0596 12.0071 16.0596C15.2815 16.0596 17.9391 15.2108 17.9391 14.0564"
        fill="white"
      />
      <path
        d="M6.0752 14.0564C6.0752 15.1683 8.7327 16.0596 12.0071 16.0596C15.2815 16.0596 17.9391 15.2108 17.9391 14.0564"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.9391 11.3401C17.9391 12.5284 15.2815 13.4876 12.0071 13.4876C8.7327 13.4876 6.0752 12.5284 6.0752 11.3401C6.0752 10.1517 8.7327 9.20105 12.0071 9.20105C15.2815 9.20105 17.9391 10.1772 17.9391 11.3401Z"
        fill="white"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const StakingIcon = svgIconFactory(Icon);
