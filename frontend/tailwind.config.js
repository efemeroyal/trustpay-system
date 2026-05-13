/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        tp: {
          bg: '#080a0e',
          surface: '#0f1117',
          surface2: '#161921',
          border: 'rgba(255,255,255,0.07)',
          border2: 'rgba(255,255,255,0.12)',
          green: '#00e5a0',
          'green-dim': 'rgba(0,229,160,0.10)',
          'green-glow': 'rgba(0,229,160,0.22)',
          amber: '#f5a623',
          'amber-dim': 'rgba(245,166,35,0.12)',
          blue: '#4f9cf9',
          'blue-dim': 'rgba(79,156,249,0.10)',
          red: '#ff5757',
          'red-dim': 'rgba(255,87,87,0.10)',
          text: '#e8eaf0',
          text2: '#8b8fa8',
          text3: '#3e4155',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
