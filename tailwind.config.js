/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E4B8E',
          hover: '#163A6E',
          accent: '#F0E5CF',
        },
        sidebar: {
          bg: '#162F5C',
          text: {
            active: '#FFFFFF',
            inactive: '#C8C6C6',
          }
        },
        background: {
          DEFAULT: '#F7F6F2',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          sand: '#F0E5CF',
          canvas: '#F7F6F2',
        },
        besmindo: {
          blue: '#1E4B8E',
          sand: '#F0E5CF',
          cream: '#F0E5CF',
          offwhite: '#F7F6F2',
          gray: '#C8C6C6',
          border: '#C8C6C6',
        },
        text: {
          primary: '#1A1A2E',
          secondary: '#6B7280',
          muted: '#8A8A8A',
        },
        status: {
          good: '#16A34A',
          broken: '#DC2626',
          warning: '#D97706',
          na: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
      },
      keyframes: {
        borderFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        borderFlow: 'borderFlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
