module.exports = {
  important: true,
  darkMode: 'class', // or 'media' or 'class'
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'ball-scale-pulse': 'ball-scale-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'ball-scale-pulse': {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0)' },
        },
      },
      backgroundImage: (_) => ({
        darwinia: 'linear-gradient(-45deg, #fe3876 0%, #7c30dd 71%, #3a30dd 100%)',
      }),
      backgroundColor: (_) => ({
        antDark: '#151e33',
        crab: '#EC3783',
        'crab-parachain': '#EC3783',
        pangolin: '#5745DE',
        'pangolin-parachain': '#5745DE',
        pangoro: '#5745DE',
      }),
      borderRadius: {
        xl: '20px',
        lg: '10px',
      },
      boxShadow: {
        xxl: '0px 0px 24px rgb(191 194 234 / 41%)',
        'mock-bottom-border': '0px 10px 1px -8px #5745de',
        'mock-bottom-border-light': '0px 10px 1px -8px rgba(255,255,255,.85)',
      },
      colors: (_) => ({
        crab: {
          main: '#EC3783',
        },
        'crab-parachain': {
          main: '#EC3783',
        },
        darwinia: {
          main: '#3a30dd',
        },
        pangolin: {
          main: '#5745DE',
        },
        'pangolin-parachain': {
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
