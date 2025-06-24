/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors:{
        'primary': '#1DB954',
        'dark': '#121212',
        'darkBg': '#191414',
        'accent': '#282828',
        'lightGray': '#B3B3B3',
        'white': '#FFFFFF',
        'black': '#000000',
      }
    },
  },
  plugins: [],
}

