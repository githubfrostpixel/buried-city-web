/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Game-specific colors can be added here
      },
      fontFamily: {
        sans: ["'Noto Sans'", 'sans-serif'],
      },
      screens: {
        'mobile': '640px',
      },
    },
  },
  plugins: [],
}


