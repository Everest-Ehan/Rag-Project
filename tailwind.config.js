/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,mdx}',
    './components/**/*.{js,jsx,mdx}',
    './app/**/*.{js,jsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-primary': '#1a1a1a',
        'dark-secondary': '#242424',
        'dark-tertiary': '#2a2a2a',
        'text-primary': '#e5e5e5',
        'text-secondary': '#b0b0b0',
        'text-muted': '#808080',
        'accent-blue': '#4a9eff',
        'accent-blue-dark': '#3b7acc',
        'border-dark': '#333333',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neuro-inset': 'inset 3px 3px 6px #0f0f0f, inset -3px -3px 6px #252525',
        'neuro-outset': '4px 4px 8px #0f0f0f, -4px -4px 8px #252525',
        'neuro-pressed': 'inset 4px 4px 8px #0f0f0f, inset -4px -4px 8px #252525',
        'neuro-hover': '6px 6px 12px #0f0f0f, -6px -6px 12px #252525',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} 