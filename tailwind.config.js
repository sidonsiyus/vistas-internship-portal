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
        // Base Design Tokens
        palette: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          primary: '#1E3A5F',
          primaryHover: '#16304F',
          primaryLight: '#E8EEF5',
          textMain: '#172033',
          textSecondary: '#64748B',
          textMuted: '#94A3B8',
          border: '#E2E8F0',
          divider: '#EEF2F6',
          success: '#15803D',
          successBg: '#ECFDF3',
          warning: '#B45309',
          warningBg: '#FFF7ED',
          error: '#B91C1C',
          errorBg: '#FEF2F2',
          info: '#1E3A5F',
          infoBg: '#E8EEF5',
        },
        vistas: {
          blue: '#1E3A5F',        // Primary Deep Navy
          navy: '#16304F',        // Primary Hover
          accent: '#1E3A5F',      // Primary
          lightBg: '#F8FAFC',     // Background
          card: '#FFFFFF',        // Card / Surface
        },
        // Deep Navy & Aviation Academic Primary Palette
        blue: {
          50: '#E8EEF5',          // Primary Light / Information Background: #E8EEF5
          100: '#DDE7F0',         // Soft tint
          200: '#C2D5E6',         // Primary light border
          300: '#9BBED9',
          400: '#5E8EB8',
          500: '#326696',
          600: '#1E3A5F',         // Primary: #1E3A5F (Deep Navy)
          700: '#16304F',         // Primary Hover: #16304F
          800: '#12253E',         // Deep Navy dark
          900: '#0E1D31',         // Midnight Navy
          950: '#07101C',
        },
        // Slate mapping strictly to Base Colours
        slate: {
          50: '#F8FAFC',          // Background: #F8FAFC
          100: '#EEF2F6',         // Divider: #EEF2F6
          200: '#E2E8F0',         // Border: #E2E8F0
          300: '#CBD5E1',         // Light grey border/muted
          400: '#94A3B8',         // Muted Text: #94A3B8
          500: '#64748B',         // Secondary Text: #64748B
          600: '#475569',         // Slate text
          700: '#334155',         // Dark slate text
          800: '#1E293B',         // Card dark
          900: '#172033',         // Main Text: #172033
          950: '#0B1120',         // Dark background
        },
        // Status: Success (#15803D, bg: #ECFDF3)
        emerald: {
          50: '#ECFDF3',          // Success Background: #ECFDF3
          100: '#D1FADF',
          200: '#A6F4C5',
          300: '#6CE9A6',
          400: '#32D583',
          500: '#12B76A',
          600: '#15803D',         // Success: #15803D
          700: '#15803D',         // Success: #15803D
          800: '#05603A',
          900: '#054F31',
          950: '#022C1A',
        },
        // Status: Warning (#B45309, bg: #FFF7ED)
        amber: {
          50: '#FFF7ED',          // Warning Background: #FFF7ED
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F79009',
          600: '#B45309',         // Warning: #B45309
          700: '#B45309',         // Warning: #B45309
          800: '#92400E',
          900: '#78350F',
          950: '#451A03',
        },
        // Status: Error (#B91C1C, bg: #FEF2F2)
        rose: {
          50: '#FEF2F2',          // Error Background: #FEF2F2
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#F04438',
          600: '#B91C1C',         // Error: #B91C1C
          700: '#B91C1C',         // Error: #B91C1C
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A',
        },
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        sm: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        DEFAULT: '0 2px 4px -1px rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        md: '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        lg: '0 6px 12px -2px rgba(15, 23, 42, 0.06), 0 3px 6px -3px rgba(15, 23, 42, 0.04)',
        xl: '0 8px 16px -4px rgba(15, 23, 42, 0.06), 0 4px 8px -4px rgba(15, 23, 42, 0.04)',
        '2xl': '0 12px 24px -6px rgba(15, 23, 42, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
