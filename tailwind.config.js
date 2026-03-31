/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5EFE7',
        foreground: '#1F2933',
        primary: {
          DEFAULT: '#4B1D3F',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#F5EFE7',
          foreground: '#1F2933',
        },
        muted: {
          DEFAULT: '#ececf0',
          foreground: '#717182',
        },
        accent: {
          DEFAULT: '#D4A017',
          foreground: '#1F2933',
        },
        destructive: {
          DEFAULT: '#d4183d',
          foreground: '#ffffff',
        },
        border: 'rgba(75, 29, 63, 0.1)',
        input: '#ffffff',
        ring: '#4B1D3F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
      },
    },
  },
  plugins: [],
}