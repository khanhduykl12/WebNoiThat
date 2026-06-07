/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E4D36',
        'primary-light': '#2d6a4f',
        'primary-dark': '#153326',
        accent: '#c8a165',
        'accent-light': '#d4b07a',
        dark: '#1a1a1a',
        'gray-custom': '#f5f5f5',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
