/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
        display: ['Black Han Sans', 'sans-serif'],
      },
      colors: {
        basic: {
          bg: '#E0F2F1',
          border: '#00897B',
          text: '#004D40',
        },
        advanced: {
          bg: '#EDE7F6',
          border: '#7E57C2',
          text: '#4527A0',
        },
      },
    },
  },
  plugins: [],
}
