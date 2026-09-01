/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#F5F5F5',
          100: '#E8E8E8',
          200: '#D4D4D4',
          300: '#B0B0B0',
          400: '#8A8A8A',
          500: '#6B6B6B',
          600: '#4A4A4A',
          700: '#333333',
          800: '#1F1F1F',
          900: '#1A1A1A',
        },
        accent: {
          DEFAULT: '#D62828',
          light:   '#FDEAEA',
          dark:    '#A61E1E',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted:   '#FAFAFA',
          hover:   '#F5F5F5',
        },
      },
      boxShadow: {
        'soft-sm':  '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
        'soft-md':  '0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.03), 0 10px 15px rgba(0,0,0,0.02)',
        'soft-lg':  '0 10px 25px rgba(0,0,0,0.05), 0 4px 10px rgba(0,0,0,0.03), 0 20px 40px rgba(0,0,0,0.02)',
        'soft-xl':  '0 15px 35px rgba(0,0,0,0.06), 0 5px 15px rgba(0,0,0,0.04), 0 25px 50px rgba(0,0,0,0.03)',
        'float':    '0 20px 60px rgba(0,0,0,0.07), 0 8px 20px rgba(0,0,0,0.04)',
      },
      borderRadius: {
        'material': '12px',
        'material-lg': '16px',
        'material-xl': '20px',
      },
    },
  },
  plugins: [],
};
