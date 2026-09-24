/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#021630',
          900: '#03234C', // Exact logo dominant navy
          800: '#03335F', // Logo mid navy
          700: '#034875',
          600: '#035888',
          100: '#E6EFF8',
          50: '#F2F7FC',
        },
        sea: {
          700: '#005C8A',
          600: '#0070AB', // Logo vibrant azure
          500: '#008BC9', // Logo cyan-blue fin
          400: '#009AD6', // Logo dorsal highlight
          100: '#E0F4FC',
          50: '#F0F9FD',
        },
        v2orange: {
          700: '#CE421D',
          600: '#D8511C', // Logo deep flame
          500: '#E15E18', // Logo exponent flame orange
          400: '#F47F19', // Logo bright orange
          300: '#FC9D0B', // Logo apex gold
          100: '#FFEEDB',
          50: '#FFF7EE',
        },
        coral: {
          700: '#CE421D',
          600: '#D8511C',
          500: '#E15E18', // Synced with logo V² orange
          400: '#F47F19',
          300: '#FC9D0B',
          100: '#FFEEDB',
          50: '#FFF7EE',
        },
        freshGreen: {
          600: '#15803D',
          500: '#16A34A',
          50: '#F0FDF4',
        }
      },
      borderRadius: {
        'none': '0px',
        'sm': '2px',
        'DEFAULT': '5px',
        'md': '5px',
        'lg': '5px',
        'xl': '5px',
        '2xl': '5px',
        '3xl': '5px',
        'card': '5px',
        'btn': '5px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(3, 35, 76, 0.06), 0 1px 2px rgba(3, 35, 76, 0.04)',
        'card': '0 2px 6px -1px rgba(3, 35, 76, 0.08), 0 1px 3px -1px rgba(3, 35, 76, 0.04)',
        'dropdown': '0 6px 16px rgba(3, 35, 76, 0.12)',
      },
      keyframes: {
        fadeInSlide: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeInSlide: 'fadeInSlide 0.45s ease-out forwards',
      }
    },
  },
  plugins: [],
}
