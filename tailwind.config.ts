import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Yellow Glitter Dark Theme
        primary: {
          DEFAULT: '#FFD700', // Gold/Yellow
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
          DEFAULT: '#1A1A1A', // Dark Background
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
        accent: {
          DEFAULT: '#FF6B35', // Orange accent
          50: '#FFF4F0',
          100: '#FFE6DC',
          200: '#FFCCB8',
          300: '#FFB08A',
          400: '#FF8A5B',
          500: '#FF6B35',
          600: '#E55A2B',
          700: '#CC4A1F',
          800: '#B33C15',
          900: '#99300C',
        },
        // Dark variations
        dark: {
          50: '#F7F7F7',
          100: '#E3E3E3',
          200: '#C8C8C8',
          300: '#A4A4A4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#1A1A1A',
        },
        // Glitter effect colors
        glitter: {
          gold: '#FFD700',
          yellow: '#FFFF00',
          amber: '#FFBF00',
          shine: '#FFF8DC',
        },
        // Legacy compatibility
        'primary-gold': '#FFD700',
        'secondary-gold': '#F5C842',
        cream: '#FFF8DC',
        charcoal: '#1A1A1A',
        
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'brand': ['var(--font-dancing-script)', 'Dancing Script', 'cursive'],
        'heading': ['var(--font-playfair)', 'Playfair Display', 'serif'],
        'body': ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'hero-title': 'heroTitle 1.2s ease-out forwards',
        'hero-cta': 'heroCTA 1.5s ease-out 0.5s forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        heroTitle: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        heroCTA: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
