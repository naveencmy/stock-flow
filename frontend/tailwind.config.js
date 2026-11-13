/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '"Noto Sans Tamil"', '-apple-system', 'sans-serif'],
        tamil: ['"Noto Sans Tamil"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        retail: {
          bg: '#f6f4ee',
          panel: '#ffffff',
          surface: '#faf8f5',
          border: '#e2ded4',
          borderDark: '#d5d0c2',
          textMuted: '#64748b',
          header: '#0f172a'
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        electric: {
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          glow: '#00f0ff',
        },
        dark: {
          800: '#1e293b',
          850: '#151f32',
          900: '#0f172a',
          950: '#090d16',
        }
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'glow-sm': '0 0 12px -2px rgba(59, 130, 246, 0.35)',
        'glow-md': '0 0 24px -4px rgba(59, 130, 246, 0.45)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.4)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.4)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
