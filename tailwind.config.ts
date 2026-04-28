import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
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
      },
    },
  },
  plugins: [],
};

export default config;
