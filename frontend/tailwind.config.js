/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        royalblue: {
          950: '#070D1F', // Dark mode deep editor background
          900: '#0A1128', // Dark mode page background
          850: '#111E3D', // Dark mode panel cards
          800: '#1A2D5C', // Dark mode borders
          700: '#233E7E',
          600: '#334DAF', // User's requested deep royal blue
          500: '#4162D4',
          400: '#7096D1', // User's requested mid-tone blue
          300: '#A0BEEC',
          200: '#BED6F7',
          100: '#D0E4FE', // User's requested ice blue
          50: '#F0F6FE',  // Very soft light surface
        },
        navy: {
          950: '#070D1F',
          900: '#0A1128',
          850: '#111E3D',
          800: '#1A2D5C',
          750: '#233E7E',
          700: '#334DAF',
        },
        violet: {
          500: '#7096D1',
          600: '#334DAF',
          700: '#233E7E',
        },
        purple: {
          500: '#7096D1',
          600: '#334DAF',
        }
      },
      boxShadow: {
        'glow-blue': '0 0 20px -3px rgba(112, 150, 209, 0.35)',
        'glow-royal': '0 0 20px -3px rgba(51, 77, 175, 0.4)',
        'glow-violet': '0 0 20px -3px rgba(112, 150, 209, 0.35)',
        'glow-purple': '0 0 20px -3px rgba(51, 77, 175, 0.4)',
      }
    },
  },
  plugins: [],
}
