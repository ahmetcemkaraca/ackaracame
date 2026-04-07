/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#197fe6",
        "primary-hover": "#156cbd",
        "primary-dark": "#156cb8",
        "background-light": "#f6f7f8",
        "background-dark": "#111921",
        "surface-dark": "#1a2632",
        "surface-light": "#ffffff",
        "line-dark": "#2c3b4b",
        "card-dark": "#1a242f",
        // Extended neutral palette from Screen 4
        "neutral-800": "#151e29",
        "neutral-700": "#1e2b3b",
        "neutral-600": "#334155",
        "neutral-400": "#94a3b8",
        "neutral-200": "#e2e8f0",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
        "serif": ["Playfair Display", "serif"],
        "mono": ["Space Grotesk", "monospace"], // Using Space Grotesk as mono for that specific technical feel, or actual mono
        "lexend": ["Lexend", "sans-serif"],
        "noto": ["Noto Serif", "serif"],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'bounce': 'bounce 1s infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
