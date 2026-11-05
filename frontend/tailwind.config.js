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
        navy: {
          950: '#070a12',
          900: '#0b0f19',
          850: '#0f172a',
          800: '#151e34',
          750: '#1a2440',
          700: '#223055',
        },
        violet: {
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        purple: {
          500: '#a855f7',
          600: '#9333ea',
        }
      },
      boxShadow: {
        'glow-violet': '0 0 20px -3px rgba(139, 92, 246, 0.25)',
        'glow-purple': '0 0 20px -3px rgba(168, 85, 247, 0.3)',
      }
    },
  },
  plugins: [],
}
