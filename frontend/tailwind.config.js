/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'light-bg': '#f8fafc',
        'dark-bg': '#0f172a',
        'light-surface': '#ffffff',
        'dark-surface': '#1e293b',
        'light-border': '#e2e8f0',
        'dark-border': '#334155',
        'light-text': {
          primary: '#1e293b',
          secondary: '#64748b',
          tertiary: '#94a3b8'
        },
        'dark-text': {
          primary: '#f8fafc',
          secondary: '#cbd5e1',
          tertiary: '#94a3b8'
        },
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1'
        },
        secondary: {
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9'
        }
      },
      boxShadow: {
        'soft': '0 2px 4px rgba(0,0,0,0.05)',
        'soft-lg': '0 4px 6px rgba(0,0,0,0.07)',
        'dark-soft': '0 2px 4px rgba(0,0,0,0.2)',
        'dark-soft-lg': '0 4px 6px rgba(0,0,0,0.25)'
      }
    }
  },
  plugins: [],
} 