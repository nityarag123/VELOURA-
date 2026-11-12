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
          maroon: '#3D121A',
          deep: '#230A10',
          gold: '#C5A059',
          goldLight: '#E8D2A6',
          cream: '#FFFDF9',
          linen: '#F8F5EE',
          sand: '#ECE5D8',
          charcoal: '#2D2020',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

