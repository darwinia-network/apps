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
      backgroundColor: (_) => ({
        antDark: '#151e33',
        crab: '#512DBC',
        'crab-parachain': '#512DBC',
        darwinia: '#FF0083',
        pangolin: '#4B30DD',
        'pangolin-parachain': '#4B30DD',
        pangoro: '#4B30DD',
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
          main: '#512DBC',
        },
        'crab-parachain': {
          main: '#512DBC',
        },
        darwinia: {
          main: '#FF0083',
        },
        pangolin: {
          main: '#4B30DD',
        },
        'pangolin-parachain': {
          main: '#4B30DD',
        },
        pangoro: {
          main: '#4B30DD',
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
