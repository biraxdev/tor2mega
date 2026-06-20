/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6d28d9",
          light: "#a78bfa",
          dark: "#4c1d95",
        },
      },
    },
  },
  plugins: [],
};
