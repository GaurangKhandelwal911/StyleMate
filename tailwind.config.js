/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF9',
          100: '#F9F6F0',
          200: '#F3EFE6',
          300: '#EAE4D7',
          400: '#DFD5C3',
          500: '#CDBFA9',
        },
        charcoal: {
          900: '#151413',
          800: '#1F1E1D',
          700: '#2E2D2B',
          600: '#4A4845',
          500: '#686561',
          400: '#8C8984',
          300: '#B5B2AC',
          200: '#DDD9D2',
          100: '#EFECE6',
        },
        olive: {
          50: '#F4F6F2',
          100: '#E7ECE3',
          200: '#D2DEC9',
          500: '#5A6E4F',
          600: '#47583D',
          700: '#384630',
          800: '#2A3524',
        },
        sand: {
          100: '#F2EDE4',
          200: '#E6DCce',
          300: '#D5C7B2',
          400: '#C2B095',
          500: '#A89475',
        },
        terracotta: {
          500: '#C76A52',
          600: '#A9523C',
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'subtle': '12px',
        'pill': '9999px',
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'float': '0 12px 30px -4px rgba(28, 25, 23, 0.08), 0 4px 12px -2px rgba(28, 25, 23, 0.03)',
        'modal': '0 24px 50px -12px rgba(21, 20, 19, 0.25)',
      }
    },
  },
  plugins: [],
};
