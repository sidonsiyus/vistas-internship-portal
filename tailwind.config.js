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
          bg: '#FAF9F6',          // Warm White Background
          card: '#FFFFFF',        // Pure White Surface
          primary: '#14532D',     // Deep Emerald
          primaryHover: '#0F4224',// Hover Emerald
          primaryActive: '#0B351C',// Active/Pressed Emerald
          primaryLight: '#E8F3EC',// Soft Emerald Tint
          textMain: '#172019',    // Deep Charcoal
          textSecondary: '#66736A',// Muted Slate
          textMuted: '#98A39C',   // Soft Grey
          border: '#E4E7E2',      // Warm Grey
          divider: '#F1F3EF',     // Soft Divider
          success: '#166534',
          successBg: '#ECFDF3',
          warning: '#A16207',
          warningBg: '#FEFCE8',
          error: '#B91C1C',
          errorBg: '#FEF2F2',
          info: '#14532D',
          infoBg: '#E8F3EC',
        },
        vistas: {
          blue: '#14532D',        // Deep Emerald
          navy: '#0F4224',        // Hover Emerald
          accent: '#14532D',      // Primary Accent
          lightBg: '#FAF9F6',     // Warm White
          card: '#FFFFFF',        // Pure White Card
        },
        // Deep Emerald Brand System
        blue: {
          50: '#E8F3EC',          // Soft Emerald / Information Background: #E8F3EC
          100: '#D2E7D9',         // Subtle emerald tint
          200: '#B0D5BC',         // Soft emerald border
          300: '#86BE98',
          400: '#54A06D',
          500: '#16A34A',         // Secondary Emerald: #16A34A
          600: '#14532D',         // Primary: #14532D (Deep Emerald)
          700: '#0F4224',         // Primary Hover: #0F4224
          800: '#0B351C',         // Active/Pressed: #0B351C
          900: '#082815',
          950: '#04170C',
        },
        // Slate mapping to Warm White & Deep Charcoal system
        slate: {
          50: '#FAF9F6',          // Warm White Background: #FAF9F6
          100: '#F1F3EF',         // Soft Divider: #F1F3EF
          200: '#E4E7E2',         // Warm Grey Border: #E4E7E2
          300: '#CFD5CD',         // Soft border
          400: '#98A39C',         // Soft Grey Muted Text: #98A39C
          500: '#66736A',         // Muted Slate Secondary Text: #66736A
          600: '#4B574F',         // Deep neutral text
          700: '#353F38',         // Dark neutral text
          800: '#1F2821',         // Card dark
          900: '#172019',         // Deep Charcoal Main Text: #172019
          950: '#0E140F',         // Dark base background
        },
        // Status: Success (#166534, bg: #ECFDF3)
        emerald: {
          50: '#ECFDF3',          // Success Background: #ECFDF3
          100: '#D1FADF',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#16A34A',
          600: '#166534',         // Success: #166534
          700: '#166534',         // Success: #166534
          800: '#14532D',
          900: '#0F4224',
          950: '#052E16',
        },
        // Status: Warning (#A16207, bg: #FEFCE8)
        amber: {
          50: '#FEFCE8',          // Warning Background: #FEFCE8
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#A16207',         // Warning: #A16207
          700: '#A16207',         // Warning: #A16207
          800: '#854D0E',
          900: '#713F12',
          950: '#422006',
        },
        // Status: Error (#B91C1C, bg: #FEF2F2)
        rose: {
          50: '#FEF2F2',          // Error Background: #FEF2F2
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
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
