import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0B0D17',
          secondary: '#111425',
          card: 'rgba(17, 20, 37, 0.75)',
          glass: 'rgba(25, 30, 56, 0.65)',
        },
        border: {
          glass: 'rgba(255, 255, 255, 0.08)',
          glow: 'rgba(0, 240, 255, 0.3)',
        },
        neon: {
          cyan: '#00F0FF',
          blue: '#0066FF',
          purple: '#9D00FF',
          pink: '#FF007A',
          green: '#00FF66',
          red: '#FF3366',
          yellow: '#FFB800',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glowCyan: '0 0 20px rgba(0, 240, 255, 0.25)',
        glowPurple: '0 0 20px rgba(157, 0, 255, 0.25)',
        glowGreen: '0 0 15px rgba(0, 255, 102, 0.25)',
        glowRed: '0 0 15px rgba(255, 51, 102, 0.25)',
      },
      backgroundImage: {
        'tech-grid': 'radial-gradient(circle, rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
        'gradient-cyan-purple': 'linear-gradient(135deg, #00F0FF 0%, #9D00FF 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
