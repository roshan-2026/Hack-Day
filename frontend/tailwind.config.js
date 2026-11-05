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
        forest: {
          950: '#0F2A1D', // Dark mode deep background
          900: '#163826',
          800: '#375534', // Dark mode panels/cards
          600: '#527750',
          500: '#6B9071', // Sage accent / light mode textarea
          300: '#AEC3B0', // Light mode panel background
          100: '#E3EED4', // Light mode page background
        },
        navy: {
          950: '#0F2A1D',
          900: '#163826',
          850: '#375534',
          800: '#3d5e3a',
          750: '#4a6d47',
          700: '#5b8058',
        },
        violet: {
          500: '#6B9071',
          600: '#527750',
          700: '#375534',
        },
        purple: {
          500: '#6B9071',
          600: '#527750',
        }
      },
      boxShadow: {
        'glow-violet': '0 0 20px -3px rgba(107, 144, 113, 0.4)',
        'glow-purple': '0 0 20px -3px rgba(55, 85, 52, 0.4)',
      }
    },
  },
  plugins: [],
}
