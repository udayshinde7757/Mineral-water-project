/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ─── Brand Color Palette ───────────────────────────────────────────
      colors: {
        primary: {
          DEFAULT: '#0A77B7',
          50:  '#E6F7FF',
          100: '#BAE3FF',
          200: '#7EC8F5',
          300: '#42ACEC',
          400: '#1A91D6',
          500: '#0A77B7',
          600: '#085E92',
          700: '#06456D',
          800: '#042C47',
          900: '#021422',
        },
        teal: {
          DEFAULT: '#00B8A9',
          50:  '#E0F8F6',
          100: '#B3EEE9',
          200: '#66DDDA',
          300: '#33CDCA',
          400: '#00C2B5',
          500: '#00B8A9',
          600: '#009287',
          700: '#006D65',
          800: '#004843',
          900: '#002422',
        },
        lightblue: '#E6F7FF',
        darkgray: {
          DEFAULT: '#333333',
          light: '#555555',
          lighter: '#777777',
          subtle: '#AAAAAA',
        },
      },

      // ─── Typography ─────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4rem',    { lineHeight: '1.1',  fontWeight: '800' }],
        'display-lg': ['3rem',    { lineHeight: '1.15', fontWeight: '700' }],
        'display-md': ['2.25rem', { lineHeight: '1.2',  fontWeight: '700' }],
        'display-sm': ['1.875rem',{ lineHeight: '1.25', fontWeight: '600' }],
      },

      // ─── Spacing ────────────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },

      // ─── Border Radius ──────────────────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ─── Box Shadow ─────────────────────────────────────────────────────
      boxShadow: {
        'brand-sm':  '0 2px 12px rgba(10, 119, 183, 0.12)',
        'brand-md':  '0 4px 24px rgba(10, 119, 183, 0.18)',
        'brand-lg':  '0 8px 40px rgba(10, 119, 183, 0.24)',
        'teal-sm':   '0 2px 12px rgba(0, 184, 169, 0.12)',
        'teal-md':   '0 4px 24px rgba(0, 184, 169, 0.18)',
        'card':      '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)',
        'card-hover':'0 4px 16px rgba(0,0,0,0.08), 0 16px 40px rgba(10, 119, 183, 0.14)',
      },

      // ─── Background gradients (via backgroundImage) ──────────────────────
      backgroundImage: {
        'gradient-brand':    'linear-gradient(135deg, #0A77B7 0%, #00B8A9 100%)',
        'gradient-brand-v':  'linear-gradient(180deg, #0A77B7 0%, #005F90 100%)',
        'gradient-hero':     'linear-gradient(135deg, #0A77B7 0%, #00B8A9 60%, #E6F7FF 100%)',
        'gradient-light':    'linear-gradient(180deg, #E6F7FF 0%, #FFFFFF 100%)',
        'gradient-dark':     'linear-gradient(135deg, #0A3D62 0%, #0A77B7 100%)',
      },

      // ─── Animation ──────────────────────────────────────────────────────
      animation: {
        'fade-in':       'fadeIn 0.5s ease-out forwards',
        'slide-up':      'slideUp 0.5s ease-out forwards',
        'float':         'float 3s ease-in-out infinite',
        'pulse-brand':   'pulseBrand 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        pulseBrand: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },

      // ─── Transitions ────────────────────────────────────────────────────
      transitionDuration: {
        '400': '400ms',
      },

      // ─── Screen breakpoints (Tailwind defaults, documented here) ────────
      // sm: 640px  md: 768px  lg: 1024px  xl: 1280px  2xl: 1536px
    },
  },
  plugins: [],
}
