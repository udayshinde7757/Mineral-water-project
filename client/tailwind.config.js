/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ─── Premium Water-Brand Color Palette ─────────────────────────────
      colors: {
        primary: {
          DEFAULT: '#0B4F6C',
          50:  '#F0F7FA',
          100: '#D5EAF2',
          200: '#ABD5E5',
          300: '#72B5CF',
          400: '#3A95B9',
          500: '#0B4F6C',
          600: '#094055',
          700: '#07313F',
          800: '#05212A',
          900: '#031015',
        },
        teal: {
          DEFAULT: '#01BAEF',
          50:  '#E6F9FE',
          100: '#B3EEFC',
          200: '#80E3FA',
          300: '#4DD8F8',
          400: '#1ACDF6',
          500: '#01BAEF',
          600: '#0195BF',
          700: '#01708F',
          800: '#004B5F',
          900: '#002530',
        },
        // Background / ambient tones
        ice:    '#F4FBFD',
        sky:    '#DDF3F5',
        mint:   '#C7F0E8',
        lightblue: '#E6F7FF', // kept for backward compatibility
        // Warm accent (used sparingly for CTAs, highlights)
        coral:  '#FFB37D',
        sand:   '#FFDD95',
        // Dark text — soft near-black navy instead of pure black
        navy:   '#0E1B26',
        darkgray: {
          DEFAULT: '#333333',
          light: '#555555',
          lighter: '#777777',
          subtle: '#AAAAAA',
        },
      },

      // ─── Typography ────────────────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.75rem, 6vw, 4.25rem)', { lineHeight: '1.08', fontWeight: '800' }],
        'display-lg': ['clamp(2.25rem, 5vw, 3.5rem)',  { lineHeight: '1.12', fontWeight: '700' }],
        'display-md': ['clamp(1.75rem, 4vw, 2.5rem)',  { lineHeight: '1.2',  fontWeight: '700' }],
        'display-sm': ['clamp(1.375rem, 3vw, 1.875rem)',{ lineHeight: '1.25', fontWeight: '600' }],
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

      // ─── Box Shadow ────────────────────────────────────────────────────
      boxShadow: {
        'brand-sm':  '0 2px 12px rgba(11, 79, 108, 0.12)',
        'brand-md':  '0 4px 24px rgba(11, 79, 108, 0.18)',
        'brand-lg':  '0 8px 40px rgba(11, 79, 108, 0.25)',
        'brand-xl':  '0 12px 56px rgba(11, 79, 108, 0.30)',
        'teal-sm':   '0 2px 12px rgba(1, 186, 239, 0.12)',
        'teal-md':   '0 4px 24px rgba(1, 186, 239, 0.18)',
        'teal-lg':   '0 8px 40px rgba(1, 186, 239, 0.25)',
        'card':      '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover':'0 4px 16px rgba(0,0,0,0.06), 0 16px 40px rgba(11, 79, 108, 0.12)',
        'glow-teal': '0 0 30px rgba(1, 186, 239, 0.25)',
        'glow-coral':'0 0 30px rgba(255, 179, 125, 0.25)',
      },

      // ─── Background gradients ──────────────────────────────────────────
      backgroundImage: {
        'gradient-brand':    'linear-gradient(135deg, #0B4F6C 0%, #01BAEF 100%)',
        'gradient-brand-v':  'linear-gradient(180deg, #0B4F6C 0%, #07313F 100%)',
        'gradient-light':    'linear-gradient(180deg, #F4FBFD 0%, #DDF3F5 40%, #C7F0E8 100%)',
        'gradient-dark':     'linear-gradient(135deg, #07313F 0%, #0B4F6C 100%)',
        'gradient-coral':    'linear-gradient(135deg, #FFB37D 0%, #FFDD95 100%)',
      },

      // ─── Animation ─────────────────────────────────────────────────────
      animation: {
        'fade-in':     'fadeIn 0.6s ease-out forwards',
        'slide-up':    'slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'float':       'float 3s ease-in-out infinite',
        'float-slow':  'float 6s ease-in-out infinite',
        'pulse-brand': 'pulseBrand 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-gentle':'pulseGentle 3s ease-in-out infinite',
        'blob':        'blob 18s ease-in-out infinite',
        'blob-reverse':'blob 22s ease-in-out infinite reverse',
        'wave':        'wave 8s ease-in-out infinite',
        'wave-slow':   'wave 12s ease-in-out infinite',
        'scroll-cue':  'scrollCue 2.4s ease-in-out infinite',
        'scroll-cue-fade':'scrollCueFade 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.85', transform: 'scale(1.08)' },
        },
        pulseBrand: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        blob: {
          '0%':   { transform: 'translate(0px, 0px) scale(1)' },
          '25%':  { transform: 'translate(40px, -30px) scale(1.08)' },
          '50%':  { transform: 'translate(-20px, -60px) scale(0.95)' },
          '75%':  { transform: 'translate(-50px, 20px) scale(1.05)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '25%':      { transform: 'translateX(-15px) translateY(4px)' },
          '50%':      { transform: 'translateX(0) translateY(-4px)' },
          '75%':      { transform: 'translateX(15px) translateY(2px)' },
        },
        scrollCue: {
          '0%':   { transform: 'translateY(0)', opacity: '1' },
          '40%':  { transform: 'translateY(10px)', opacity: '0.4' },
          '60%':  { transform: 'translateY(10px)', opacity: '0.4' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scrollCueFade: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
}
