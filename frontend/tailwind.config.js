/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        veloura: {
          burgundy: '#4A1525',
          gold: '#C5A059',
          cream: '#FFFDF9',
        }
      }
    },
  },
  plugins: [],
}
