/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: "#052E24",
        },
        sage: {
          50: "#F4F7F2",
          100: "#E6EDE3",
          200: "#D0DDCC",
          500: "#829A7C",
        },
        ivory: "#FAFAF6",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};