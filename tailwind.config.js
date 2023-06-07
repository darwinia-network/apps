/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF0083",
        "bg-primary": "#1A1D1F",
        "bg-component": "#242A2E",
      },
      screens: {
        "2xl": "1280px",
      },
      container: {
        padding: "0.625rem",
      },
    },
  },
  plugins: [],
};
