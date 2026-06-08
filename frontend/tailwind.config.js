/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFAF6',
          100: '#FAF6F0',
          200: '#F2E8D9',
          300: '#E8D5BE',
        },
        dusty: {
          pink: '#E8A0A8',
          'pink-dark': '#C97C85',
          'pink-light': '#F5D0D4',
        },
        sage: {
          DEFAULT: '#B5C9A8',
          dark: '#8BA87B',
          light: '#D9E8D2',
        },
        lavender: {
          DEFAULT: '#C4B5C9',
          dark: '#9B8AA3',
          light: '#E8E0ED',
        },
        gold: {
          DEFAULT: '#D4A96A',
          dark: '#B08040',
          light: '#EDD9B0',
        },
        brown: {
          deep: '#3D2B1F',
          mid: '#6B4C3B',
          soft: '#9B7B6B',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}