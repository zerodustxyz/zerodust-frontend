import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors - Dusty Sage & Sand palette
        brand: {
          primary: '#8B9E82',      // Dusty sage - Main brand color
          secondary: '#C4B49A',    // Sand/beige - Secondary accent
          light: '#A8B8A0',        // Lighter sage
          dark: '#6B7E62',         // Darker sage
          muted: '#CBD5C5',        // Pale sage
        },
        // Sand/beige palette
        sand: {
          50: '#FAF8F5',
          100: '#F5F1EA',
          200: '#EBE4D8',
          300: '#DDD2C0',
          400: '#C4B49A',
          500: '#B5A488',
          600: '#9A8A70',
          700: '#7D705A',
          800: '#655A49',
          900: '#4D453A',
        },
        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#F43F5E',
        info: '#3B82F6',
        // Dark mode palette
        dark: {
          bg: '#0A0A0B',
          surface: '#141416',
          elevated: '#1C1C1F',
          border: '#2A2A2E',
          muted: '#71717A',
        },
        // Light mode palette
        light: {
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          elevated: '#F4F4F5',
          border: '#E4E4E7',
          muted: '#A1A1AA',
        },
      },
      backgroundImage: {
        // Brand gradients - Sage & Sand
        'gradient-brand': 'linear-gradient(135deg, #8B9E82 0%, #A8B8A0 100%)',
        'gradient-brand-hover': 'linear-gradient(135deg, #6B7E62 0%, #8B9E82 100%)',
        'gradient-brand-vertical': 'linear-gradient(180deg, #8B9E82 0%, #A8B8A0 100%)',
        'gradient-brand-reverse': 'linear-gradient(135deg, #A8B8A0 0%, #8B9E82 100%)',
        'gradient-brand-vibrant': 'linear-gradient(135deg, #A8B8A0 0%, #C4B49A 100%)',
        // Sand gradients
        'gradient-sand': 'linear-gradient(135deg, #C4B49A 0%, #DDD2C0 100%)',
        'gradient-sage-sand': 'linear-gradient(135deg, #8B9E82 0%, #C4B49A 100%)',
        // Background effects - subtle, no glow
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'gradient-radial-top': 'radial-gradient(ellipse at top, var(--tw-gradient-stops))',
        'gradient-subtle': 'radial-gradient(circle at 50% 0%, rgba(139, 158, 130, 0.08) 0%, transparent 50%)',
        'gradient-subtle-bottom': 'radial-gradient(circle at 50% 100%, rgba(196, 180, 154, 0.06) 0%, transparent 50%)',
        // Mesh gradients for hero - muted
        'mesh-gradient': `
          radial-gradient(at 40% 20%, rgba(139, 158, 130, 0.12) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(196, 180, 154, 0.10) 0px, transparent 50%),
          radial-gradient(at 0% 50%, rgba(139, 158, 130, 0.08) 0px, transparent 50%),
          radial-gradient(at 80% 50%, rgba(196, 180, 154, 0.06) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(168, 184, 160, 0.05) 0px, transparent 50%)
        `,
        'mesh-gradient-light': `
          radial-gradient(at 40% 20%, rgba(139, 158, 130, 0.05) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(196, 180, 154, 0.04) 0px, transparent 50%),
          radial-gradient(at 0% 50%, rgba(139, 158, 130, 0.03) 0px, transparent 50%)
        `,
        // Noise texture
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        'display': ['4rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'soft-xl': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'warm': '0 4px 12px rgba(196, 180, 154, 0.15)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 12px 20px -5px rgba(0, 0, 0, 0.1), 0 6px 8px -4px rgba(0, 0, 0, 0.08)',
        'card-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.25), 0 2px 4px -2px rgba(0, 0, 0, 0.15)',
        'card-elevated': '0 6px 20px rgba(0, 0, 0, 0.08)',
        'card-elevated-hover': '0 12px 32px rgba(0, 0, 0, 0.12)',
        'inner-soft': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'button': '0 1px 2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        'button-hover': '0 4px 8px rgba(0, 0, 0, 0.1)',
        'button-active': '0 1px 4px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 3s',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'orbit': 'orbit 20s linear infinite',
        'sweep': 'sweep 3s ease-in-out infinite',
        'particle-float': 'particleFloat 4s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        particleFloat: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
          '50%': { transform: 'translate(10px, -20px) scale(1.2)', opacity: '0.7' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
