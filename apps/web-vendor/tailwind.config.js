/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4332', // Deep Forest Green
          dark: '#0D2219',
          light: '#2D6A4F',
        },
        action: {
          DEFAULT: '#A0522D', // Bronze/Brown
          hover: '#8B4513',
          light: '#CD853F',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(0, 0, 0, 0.7)',
          green: 'rgba(27, 67, 50, 0.85)',
          border: 'rgba(255, 255, 255, 0.2)',
        },
        amazon: {
          bg: '#F5F5F7',      // Apple-ish light gray
          link: '#1B4332',    // Green links
          link_hover: '#A0522D'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}