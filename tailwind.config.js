/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'retro-green': '#00ff00',
        'retro-cyan': '#00ffff',
        'retro-purple': '#ff00ff',
        'retro-orange': '#ff8000',
        'retro-dark': '#1a1a1a',
        'retro-gray': '#333333',
      },
      fontFamily: {
        'retro': ['Orbitron_400Regular', 'monospace'],
        'retro-bold': ['Orbitron_700Bold', 'monospace'],
      },
    },
  },
  plugins: [],
};