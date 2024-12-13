/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f9f5ff',
          100: '#f3e8ff',
          200: '#e0b7f9',
          300: '#d0a1f1',
          400: '#8e46e1',
          500: '#6a28d9',
          600: '#5b20b7',
          700: '#4b1a99',
          800: '#3b157b',
          900: '#2a0f5e',
        },
        secondary: {
          50: '#f4e9f9',
          100: '#e8c9f2',
          200: '#d3a2ea',
          300: '#b77ce3',
          400: '#9c59dd',
          500: '#8a38c8',
          600: '#722bb2',
          700: '#5a2199',
          800: '#461880',
          900: '#340e66',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}