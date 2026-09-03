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
        julex: {
          gold: '#D4A017',
          'gold-light': '#F5C842',
          'gold-dark': '#A87A00',
          pink: '#E040FB',
          dark: '#111111',
          surface: '#1C1C1C',
          'surface-light': '#F5F5F0',
        },
        gold: {
          50: '#FFFBEA',
          100: '#FFF3C4',
          200: '#FCE588',
          300: '#F5C842',
          400: '#D4A017',
          500: '#C89B00',
          600: '#A87A00',
          700: '#8A6200',
          800: '#6B4D00',
          900: '#4D3700',
        },
        obsidian: {
          950: '#0A0A0A',
          900: '#111111',
          850: '#161616',
          800: '#1C1C1C',
          700: '#252525',
          600: '#333333',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        script: ['"Great Vibes"', '"Alex Brush"', '"Pinyon Script"', 'cursive'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 160, 23, 0.40)',
        'gold-glow-lg': '0 0 40px -5px rgba(212, 160, 23, 0.50)',
        'luxury': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'dark-card': '0 4px 24px rgba(0,0,0,0.6)',
        'light-card': '0 2px 16px rgba(0,0,0,0.06)',
      }
    },
  },
  plugins: [],
}
