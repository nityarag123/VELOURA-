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
          burgundy: '#260D16', // Deep Burgundy
          espresso: '#160B0D', // Dark Espresso
          gold: '#D8B879',     // Champagne Gold
          goldLight: '#E8D2A6',
          cream: '#F6EAD5',    // Warm Cream
          ivory: '#FFF9F0',    // Soft Ivory
          // Backwards compatibility
          maroon: '#260D16',
          deep: '#160B0D',
          linen: '#FAF6EE',
          sand: '#ECE5D8',
          charcoal: '#160B0D',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Manrope"', '"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

