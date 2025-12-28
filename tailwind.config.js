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
        // Game-specific fonts can be added here
      },
      screens: {
        'mobile': '640px',
      },
    },
  },
  plugins: [],
}


