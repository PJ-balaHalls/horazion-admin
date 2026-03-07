/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        horazion: {
          red: '#B6192E',
          black: '#000000',
          gray: '#545454',
          light: '#F2F2F2',
          white: '#FFFFFF',
          success: '#10B981',
          warning: '#F59E0B',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'hz': '12px',
      }
    },
  },
  plugins: [],
}