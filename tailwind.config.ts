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
          // Fresh modern palette replacing old yellow
          coral: '#FF6B6B',       // Vibrant coral red
          lavender: '#A78BFA',    // Soft lavender purple
          mint: '#6EE7B7',        // Fresh mint green
          sky: '#38BDF8',         // Bright sky blue
          peach: '#FBBF24',       // Warm peach/amber (replacing yellow)
          rose: '#FB7185',        // Soft rose pink
          cyan: '#22D3D3',        // Vivid cyan
          violet: '#8B5CF6',      // Deep violet
          // Keep essential colors
          purple: '#9B5DE5',
          blue: '#4ECDC4',
          green: '#70D6FF',
          pink: '#FF6B6B',
          orange: '#F15BB5',
          yellow: '#FBBF24',      // Updated to warmer amber
          black: '#000000',
          white: '#FFFFFF',
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