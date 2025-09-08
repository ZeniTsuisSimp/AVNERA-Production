/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFD700',
          50: '#FFFBEB',
          100: '#FFF3C4',
          200: '#FFEB9C',
          300: '#FFE066',
          400: '#FFD700',
          500: '#F5C842',
          600: '#E6B800',
          700: '#CC9900',
          800: '#B37D00',
          900: '#996600',
        },
        secondary: {
          DEFAULT: '#1A1A1A',
          50: '#F8F8F8',
          100: '#E6E6E6',
          200: '#CCCCCC',
          300: '#B3B3B3',
          400: '#808080',
          500: '#666666',
          600: '#4D4D4D',
          700: '#333333',
          800: '#262626',
          900: '#1A1A1A',
        },
        'primary-gold': '#FFD700',
        'secondary-gold': '#F5C842',
        cream: '#FFF8DC',
        charcoal: '#1A1A1A',
      },
      fontFamily: {
        'brand': ['Dancing Script', 'cursive'],
        'heading': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}