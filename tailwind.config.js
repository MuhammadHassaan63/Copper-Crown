/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        copper: {
          50: '#fdf8f3',
          100: '#f8e8d6',
          200: '#f0d0ae',
          300: '#e4b07e',
          400: '#d68e52',
          500: '#c87038',
          600: '#b85c2e',
          700: '#984628',
          800: '#7a3a26',
          900: '#623022',
          950: '#381912',
        },
        crown: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e3',
          300: '#b0b8cc',
          400: '#8591ab',
          500: '#677290',
          600: '#525b78',
          700: '#434a62',
          800: '#3a4053',
          900: '#1e2233',
          950: '#131626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
