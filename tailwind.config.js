/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D0D0D',
        surface: '#161616',
        accent: '#A6E3E9',
        'secondary-accent': '#F8E1A1',
        primary: '#FFFFFF',
        muted: '#B0B0B0',
        divider: '#2A2A2A',
      },
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'title': '2rem',
        'header': '1.5rem',
        'body': '1rem',
        'label': '0.875rem',
      },
      borderRadius: {
        'standard': '1rem',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)',
        'inner-card': 'inset 0 1px 4px rgba(0, 0, 0, 0.2)',
      },
      backdropBlur: {
        'player': '12px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}