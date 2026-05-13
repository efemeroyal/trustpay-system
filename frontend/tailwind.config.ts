import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        tp: {
          bg:        '#080a0f',
          surface:   '#0f1117',
          surface2:  '#171b24',
          surface3:  '#1e2330',
          border:    'rgba(255,255,255,0.07)',
          border2:   'rgba(255,255,255,0.13)',
          green:     '#00e5a0',
          'green-d': '#00b87e',
          amber:     '#f5a623',
          blue:      '#4f9cf9',
          red:       '#ff5757',
          text:      '#e8eaf2',
          text2:     '#8b8fa8',
          text3:     '#42465a',
        },
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 3s linear infinite',
        'shimmer':    'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
} satisfies Config
