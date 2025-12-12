/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      },
      colors: {
        tivro: {
          dark: '#0f172a', // Slate 900
          primary: '#059669', // Emerald 600
          accent: '#f97316', // Orange 500
          light: '#f8fafc', // Slate 50
        }
      }
    },
  },
  plugins: [],
}
