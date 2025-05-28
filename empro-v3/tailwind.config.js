/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        qatar: ['Qatar2022', 'sans-serif'],
        barcelona: ['barcelona', 'sans-serif'],
      }
    },
  },
  plugins: [],
  
}

