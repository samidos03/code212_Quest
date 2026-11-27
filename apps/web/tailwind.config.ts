import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

/**
 * Code212 Quest — Design system
 * Charte : magenta #c5027f · cyan #00dfff · violet #6701e6
 * Thème clair = espaces pédagogiques (défaut) · Thème sombre =_arène & compétitions
 */
const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1rem', sm: '1.25rem', lg: '2rem' }, screens: { '2xl': '1440px' } },
    extend: {
      colors: {
        bg: 'hsl(var(--bg) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        'surface-2': 'hsl(var(--surface-2) / <alpha-value>)',
        'surface-3': 'hsl(var(--surface-3) / <alpha-value>)',
        fg: 'hsl(var(--fg) / <alpha-value>)',
        'fg-muted': 'hsl(var(--fg-muted) / <alpha-value>)',
        'fg-subtle': 'hsl(var(--fg-subtle) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        'border-strong': 'hsl(var(--border-strong) / <alpha-value>)',
        primary: { DEFAULT: 'hsl(var(--primary) / <alpha-value>)', soft: 'hsl(var(--primary-soft) / <alpha-value>)', fg: 'hsl(var(--primary-fg) / <alpha-value>)' },
        accent: { DEFAULT: 'hsl(var(--accent) / <alpha-value>)', soft: 'hsl(var(--accent-soft) / <alpha-value>)', fg: 'hsl(var(--accent-fg) / <alpha-value>)' },
        cyan: { DEFAULT: 'hsl(var(--cyan) / <alpha-value>)', soft: 'hsl(var(--cyan-soft) / <alpha-value>)', fg: 'hsl(var(--cyan-fg) / <alpha-value>)' },
        success: { DEFAULT: 'hsl(var(--success) / <alpha-value>)', soft: 'hsl(var(--success-soft) / <alpha-value>)' },
        warning: { DEFAULT: 'hsl(var(--warning) / <alpha-value>)', soft: 'hsl(var(--warning-soft) / <alpha-value>)' },
        danger: { DEFAULT: 'hsl(var(--danger) / <alpha-value>)', soft: 'hsl(var(--danger-soft) / <alpha-value>)' },
        brand: { magenta: '#c5027f', cyan: '#00dfff', violet: '#6701e6' },
      },
      fontFamily: {
        display: ['Rajdhani', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: { xl: '0.9rem', '2xl': '1.25rem', '3xl': '1.75rem' },
      boxShadow: {
        card: 'var(--shadow-card)',
        lift: 'var(--shadow-lift)',
        glow: '0 0 0 1px hsl(var(--primary) / 0.28), 0 8px 30px -8px hsl(var(--primary) / 0.45)',
        'glow-accent': '0 0 0 1px hsl(var(--accent) / 0.28), 0 8px 30px -8px hsl(var(--accent) / 0.45)',
        'glow-cyan': '0 0 0 1px hsl(var(--cyan) / 0.3), 0 8px 30px -8px hsl(var(--cyan) / 0.4)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'pulse-ring': { '0%': { transform: 'scale(.85)', opacity: '.8' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
        'gradient-x': { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        'ticker-y': { from: { transform: 'translateY(0)' }, to: { transform: 'translateY(-50%)' } },
      },
      animation: {
        'accordion-down': 'accordion-down .2s ease-out',
        'accordion-up': 'accordion-up .2s ease-out',
        float: 'float 5s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(.2,.7,.3,1) infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
        'ticker-y': 'ticker-y 24s linear infinite',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #c5027f 0%, #6701e6 52%, #00dfff 140%)',
        'brand-gradient-soft': 'linear-gradient(120deg, hsl(var(--accent) / .14) 0%, hsl(var(--primary) / .14) 55%, hsl(var(--cyan) / .12) 100%)',
        'hero-aurora': 'radial-gradient(120% 120% at 0% 0%, hsl(var(--primary) / .30) 0%, transparent 55%), radial-gradient(90% 90% at 100% 10%, hsl(var(--accent) / .26) 0%, transparent 60%), radial-gradient(80% 80% at 60% 100%, hsl(var(--cyan) / .18) 0%, transparent 60%)',
        'grid-lines': 'linear-gradient(hsl(var(--border) / .6) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / .6) 1px, transparent 1px)',
        'arena-grid': 'linear-gradient(hsl(var(--primary) / .10) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / .10) 1px, transparent 1px)',
      },
      backgroundSize: { 'grid-lines': '32px 32px', 'arena-grid': '44px 44px' },
    },
  },
  plugins: [animate],
}

export default config
