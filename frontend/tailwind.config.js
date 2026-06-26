/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        urdu: ['"Noto Nastaliq Urdu"', 'serif'],
      },
      colors: {
        primary: '#0d6efd',
        'primary-dark': '#0a58ca',
      },
    },
  },
  plugins: [],
}
