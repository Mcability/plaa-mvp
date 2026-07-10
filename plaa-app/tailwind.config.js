/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#064A76", dark: "#043758", light: "#0B5E94", 50: "#EAF2F7" },
        gold: { DEFAULT: "#C7A24A", light: "#E0C27A", dark: "#9C7C32" },
        ink: "#1A1A1A",
        parchment: "#FBF8F2",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        page: "0 4px 24px rgba(6, 74, 118, 0.12)",
      },
    },
  },
  plugins: [],
};
