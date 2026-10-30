/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Brand: forest green (dark mode) / deep emerald (light) ──
        brand: {
          50:  '#f0f7f4',
          100: '#d9ebe2',
          200: '#b3d7c6',
          300: '#7fba9d',
          400: '#4d9973',
          500: '#2b7a55',
          600: '#1e5f42',
          700: '#184a34',
          800: '#123828',
          900: '#0c281c',
          950: '#061a11',
        },
        // ── Kenya-specific accents (keep as brand heritage) ──
        kenya: {
          green: '#1B4D3E',
          red:   '#B22222',
          black: '#0a0a0a',
        },
        mpesa: {
          green: '#4CAF50',
          dark:  '#2E7D32',
          light: '#C8E6C9',
        },
        // ── Neutral scale: warm-tinted, not stock gray ──
        ink: {
          50:  '#f7f7f6',
          100: '#e9e8e6',
          200: '#d3d1cd',
          300: '#b0ada7',
          400: '#87837c',
          500: '#66625c',
          600: '#4f4c47',
          700: '#3d3a36',
          800: '#2a2825',
          900: '#1a1816',
          950: '#0d0c0b',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bricolage Grotesque', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      // ── Single radius scale — intentional, not the Tailwind default ladder ──
      borderRadius: {
        'sm':  '6px',
        DEFAULT: '10px',
        'md':  '10px',
        'lg':  '14px',
        'xl':  '20px',
        '2xl': '28px',
        '3xl': '36px',
      },
      // ── Sharp, low-spread shadows — no default Tailwind shadow-md ──
      boxShadow: {
        'card':     '0 1px 0 0 rgba(26,24,22,0.04), 0 1px 3px 0 rgba(26,24,22,0.06)',
        'card-hover': '0 1px 0 0 rgba(26,24,22,0.05), 0 4px 12px 0 rgba(26,24,22,0.08)',
        'popover':  '0 4px 16px 0 rgba(26,24,22,0.10), 0 1px 4px 0 rgba(26,24,22,0.06)',
        'brand-glow': '0 0 0 1px rgba(43,122,85,0.18), 0 4px 16px 0 rgba(43,122,85,0.14)',
      },
      // ── Keep only animations we actually use; delete the rest as you clean up ──
      animation: {
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
