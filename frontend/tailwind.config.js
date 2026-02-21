/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        kenya: {
          green: '#1B4D3E',
          red: '#B22222',
          black: '#000000',
          white: '#FFFFFF',
        },
        mpesa: {
          green: '#4CAF50',
          dark: '#2E7D32',
          light: '#C8E6C9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'kenya-wave': 'kenyaWave 10s ease infinite',
        'gradient': 'gradient 15s ease infinite',
        'ripple': 'ripple 0.6s ease-out',
        'confetti': 'confetti 1s ease-out forwards',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(14, 165, 233, 0.5)',
            opacity: 1,
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(14, 165, 233, 0.8)',
            opacity: 0.8,
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        kenyaWave: {
          '0%, 100%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        ripple: {
          'to': {
            transform: 'scale(4)',
            opacity: '0',
          },
        },
        confetti: {
          '0%': {
            opacity: '0',
            transform: 'translate(-50%, -50%) scale(0)',
          },
          '50%': {
            opacity: '1',
            transform: 'translate(-50%, -50%) scale(1.5)',
          },
          '100%': {
            opacity: '0',
            transform: 'translate(-50%, -50%) scale(2)',
          },
        },
      },
      backgroundImage: {
        'kenya-flag': "linear-gradient(135deg, #000000 0%, #000000 20%, #B22222 20%, #B22222 40%, #1B4D3E 40%, #1B4D3E 60%, #000000 60%, #000000 80%, #B22222 80%, #B22222 100%)",
        'mpesa-gradient': "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
      },
      boxShadow: {
        'glow': '0 0 20px rgba(14, 165, 233, 0.5)',
        'glow-green': '0 0 20px rgba(76, 175, 80, 0.5)',
        'glow-purple': '0 0 20px rgba(147, 51, 234, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
        'neon': '0 0 10px rgba(14, 165, 233, 0.5), inset 0 0 10px rgba(14, 165, 233, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
