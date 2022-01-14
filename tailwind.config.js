module.exports = {
  darkMode: 'class', // or 'media' or 'class'
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {},
      keyframes: {},
      backgroundImage: (_) => ({
        darwinia: 'linear-gradient(-45deg, #fe3876 0%, #7c30dd 71%, #3a30dd 100%)',
      }),
      backgroundColor: (_) => ({
        antDark: '#151e33',
        crab: '#EC3783',
        pangolin: '#5745DE',
        pangoro: '#5745DE',
      }),
      borderRadius: {
        xl: '10px',
        lg: '8px',
      },
      boxShadow: {
        'mock-bottom-border': '0px 10px 1px -8px #5745de',
        'mock-bottom-border-light': '0px 10px 1px -8px rgba(255,255,255,.85)',
      },
      colors: (_) => ({
        crab: {
          main: '#EC3783',
        },
        darwinia: {
          main: '#3a30dd',
        },
        pangolin: {
          main: '#5745DE',
        },
        pangoro: {
          main: '#5745DE',
        },
      }),
    },
  },
  plugins: [
    require('tailwindcss-pseudo-elements')({
      customPseudoClasses: ['step'],
      customPseudoElements: ['div'],
      emptyContent: false,
    }),
  ],
  variants: {
    extend: {
      backgroundColor: ['before', 'after'],
      backgroundOpacity: ['before', 'after'],
    },
  },
};
