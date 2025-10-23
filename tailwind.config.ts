import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom font families
      fontFamily: {
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
        heading: ['Poppins', ...defaultTheme.fontFamily.sans],
        body: ['Lora', ...defaultTheme.fontFamily.serif],
        mono: ['"Geist Mono"', ...defaultTheme.fontFamily.mono],
      },

      // Anthropic Brand Colors
      colors: {
        // Primary/Dark Mode
        'brand-dark': '#141413',
        'brand-light': '#faf9f5',
        'brand-gray': {
          mid: '#b0aea5',
          light: '#e8e6dc',
        },

        // Accent colors
        'accent-orange': '#d97757',
        'accent-blue': '#6a9bcc',
        'accent-green': '#788c5d',

        // Backgrounds
        'bg-primary': '#141413',
        'bg-secondary': '#1c1b1a',
        'bg-tertiary': '#272624',
        'bg-elevated': '#2f2e2d',
        'bg-hover': '#353433',

        // Text colors
        'text-primary': '#faf9f5',
        'text-secondary': '#b0aea5',
        'text-muted': '#7c7a72',

        // Semantic colors
        'success': '#788c5d',
        'warning': '#d97757',
        'error': '#e85d5d',
        'info': '#6a9bcc',

        // Borders
        'border-light': '#353433',
        'border-medium': '#7c7a72',
        'border-dark': '#b0aea5',
      },

      // Border radius
      borderRadius: {
        xs: '0.25rem',
        sm: '0.5rem',
        base: '0.75rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },

      // Shadows
      boxShadow: {
        xs: '0 1px 2px 0 rgba(20, 20, 19, 0.05)',
        sm: '0 1px 3px 0 rgba(20, 20, 19, 0.1)',
        base: '0 1px 3px 0 rgba(20, 20, 19, 0.1), 0 1px 2px 0 rgba(20, 20, 19, 0.06)',
        md: '0 4px 6px -1px rgba(20, 20, 19, 0.1), 0 2px 4px -1px rgba(20, 20, 19, 0.06)',
        lg: '0 10px 15px -3px rgba(20, 20, 19, 0.1), 0 4px 6px -2px rgba(20, 20, 19, 0.05)',
        xl: '0 20px 25px -5px rgba(20, 20, 19, 0.1), 0 10px 10px -5px rgba(20, 20, 19, 0.04)',
        elevated: '0 25px 50px -12px rgba(20, 20, 19, 0.25)',
        'glow-orange': '0 0 20px rgba(217, 119, 87, 0.3)',
        'glow-blue': '0 0 20px rgba(106, 155, 204, 0.3)',
        'glow-green': '0 0 20px rgba(120, 140, 93, 0.3)',
        inset: 'inset 0 2px 4px 0 rgba(20, 20, 19, 0.06)',
      },

      // Spacing scale
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '0.75rem',
        base: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '5rem',
        '5xl': '6rem',
        '6xl': '8rem',
      },

      // Transitions/Animations
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        slower: '500ms',
      },

      transitionTimingFunction: {
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // Opacity scale for backgrounds
      opacity: {
        5: '0.05',
        10: '0.1',
        15: '0.15',
        20: '0.2',
        25: '0.25',
        30: '0.3',
        40: '0.4',
        50: '0.5',
        60: '0.6',
        70: '0.7',
        75: '0.75',
        80: '0.8',
        90: '0.9',
        95: '0.95',
      },

      // Keyboard focus ring
      outline: {
        brand: '2px solid #d97757',
      },

      // Backdrop blur for glassmorphic effects
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
