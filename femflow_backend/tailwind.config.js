/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fem: {
          cream: "#F4E1D7",
          peach: "#EFBDA6",
          terracotta: "#CC6A5A",
          teal: "#335953",
        },
      },
    },
  },
  plugins: [],
};