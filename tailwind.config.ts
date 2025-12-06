import type { Config } from "tailwindcss";
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        neo: {
          yellow: '#FFDD57',      // Vibrant Yellow (Not white, not neon)
          lime: '#D4F75E',        // Soft Acid Lime
          green: '#57F287',       // Vivid Mint
          cyan: '#55E6EE',        // Bright Cyan
          blue: '#4D96FF',        // Soft Royal Blue
          purple: '#9F7AEA',      // Medium Purple
          magenta: '#F687B3',     // Soft Magenta
          pink: '#FF80BF',        // Matte Hot Pink
          red: '#FF6B6B',         // Soft Red
          orange: '#FFAB4C',      // Vivid Orange
          black: '#1a1a1a',       // Soft Black
          white: '#FFFFFF',       // Pure White (for text/cards)
          gray: '#F3F4F6',        // Light Gray
          'gray-dark': '#374151', // Dark Gray
        }
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px rgba(0,0,0,1)',
        'neo-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'neo-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
      },
      borderRadius: {
        DEFAULT: '0px',
        'none': '0px',
        'sm': '0px',
        'md': '0px',
        'lg': '0px',
        'xl': '0px',
        '2xl': '0px',
        '3xl': '0px',
        'full': '0px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} satisfies Config;

export default config;