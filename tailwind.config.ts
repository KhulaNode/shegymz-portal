import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@khulanode/khula-scheduler/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          50: '#faf5fa',
          100: '#f3dff1',
          700: '#66224f',
          800: '#4e193d',
          900: '#351229',
        },
        sand: '#f5f1ec',
        background: 'rgb(var(--scheduler-background) / <alpha-value>)',
        foreground: 'rgb(var(--scheduler-foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--scheduler-card) / <alpha-value>)',
          foreground: 'rgb(var(--scheduler-card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--scheduler-popover) / <alpha-value>)',
          foreground: 'rgb(var(--scheduler-popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--scheduler-primary) / <alpha-value>)',
          foreground: 'rgb(var(--scheduler-primary-foreground) / <alpha-value>)',
          600: 'rgb(var(--scheduler-primary) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--scheduler-secondary) / <alpha-value>)',
          foreground: 'rgb(var(--scheduler-secondary-foreground) / <alpha-value>)',
          500: 'rgb(var(--scheduler-secondary-500) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--scheduler-muted) / <alpha-value>)',
          foreground: 'rgb(var(--scheduler-muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--scheduler-accent) / <alpha-value>)',
          foreground: 'rgb(var(--scheduler-accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--scheduler-destructive) / <alpha-value>)',
          foreground: 'rgb(var(--scheduler-destructive-foreground) / <alpha-value>)',
        },
        border: 'rgb(var(--scheduler-border) / <alpha-value>)',
        input: 'rgb(var(--scheduler-input) / <alpha-value>)',
        ring: 'rgb(var(--scheduler-ring) / <alpha-value>)',
        default: {
          50: 'rgb(var(--scheduler-default-50) / <alpha-value>)',
          100: 'rgb(var(--scheduler-default-100) / <alpha-value>)',
          200: 'rgb(var(--scheduler-default-200) / <alpha-value>)',
          400: 'rgb(var(--scheduler-default-400) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--scheduler-radius)',
        md: 'calc(var(--scheduler-radius) - 2px)',
        sm: 'calc(var(--scheduler-radius) - 4px)',
      },
    },
  },
  plugins: [animate],
};

export default config;
