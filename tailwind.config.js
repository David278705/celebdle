// tailwind.config.js
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}", // Se incluyen todos los .vue, .js, etc.
  ],
  theme: {
    extend: {
      fontFamily: {
        // Podrías llamar 'montserrat' como quieras (por ej. 'sans'),
        // pero comúnmente usamos un nombre coherente:
        montserrat: ["Montserrat", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
