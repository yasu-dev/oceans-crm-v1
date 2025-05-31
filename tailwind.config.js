/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // Background colors
    'bg-green-600',
    'bg-amber-600',
    'bg-red-600',
    'bg-orange-600',
    'bg-yellow-600',
    'bg-green-50',
    'bg-amber-50',
    'bg-red-50',
    'bg-orange-50',
    'bg-yellow-50',
    // Text colors
    'text-green-700',
    'text-amber-700',
    'text-red-700',
    'text-orange-700',
    'text-yellow-700',
    // Border colors
    'border-green-200',
    'border-amber-200',
    'border-red-200',
    'border-orange-200',
  ],
  theme: {
    extend: {
      colors: {
        // OCEANSブランドカラー - 英国紳士的なダークネイビー
        primary: {
          50: '#f0f3f7',
          100: '#e2e8f0',
          200: '#c7d2e0',
          300: '#a0b3c8',
          400: '#728fa9',
          500: '#506f8d',
          600: '#3e5772',
          700: '#33475d',
          800: '#2c3b4e',
          900: '#263242',
          950: '#1a222e',
        },
        // OCEANSセカンダリカラー - 高級感のあるゴールド/ブラス
        secondary: {
          50: '#fdfbf7',
          100: '#fcf5e9',
          200: '#f8e8ce',
          300: '#f4d4a2',
          400: '#edb86b',
          500: '#e59f42',
          600: '#d48534',
          700: '#b1692c',
          800: '#8e5328',
          900: '#754424',
          950: '#3f2110',
        },
        // OCEANSアクセントカラー
        oceans: {
          navy: '#1a222e',      // 最も濃いネイビー
          darkblue: '#263242',  // ダークブルー
          gold: '#d48534',      // ゴールド
          brass: '#e59f42',     // ブラス
          pearl: '#f8f9fa',     // パールホワイト
          smoke: '#e9ecef',     // スモークグレー
          charcoal: '#495057',  // チャコールグレー
        }
      },
      backgroundColor: {
        'oceans-gradient': 'linear-gradient(135deg, #1a222e 0%, #263242 50%, #2c3b4e 100%)',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};