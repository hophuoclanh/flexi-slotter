
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    extend: {
      colors: {
        primary: "#541919", // Deep red from logo
        accent: "#a8342c",  // Slightly lighter shade
        background: "#f6ebd3", // Logo beige
        "background-dark": "#1a1a1a",
        "text-dark": "#541919",
        "text-light": "#f6ebd3",
        "white-100": "#fff6e8",
      },
      // fontFamily: {
      //   heading: ["'Barlow Condensed'", "sans-serif"],
      // },
      boxShadow: {
        card: "0 25px 80px -10px rgba(84, 25, 25, 0.4)",
        soft: "0 8px 24px rgba(0, 0, 0, 0.1)",
      },
      backgroundImage: {
        "logo-gradient": "linear-gradient(90deg, #541919 0%, #a8342c 100%)",
        "beige-gradient": "linear-gradient(90deg, #f6ebd3 0%, #fff6e8 100%)",
      },
      screens: {
        xs: "450px",
      },
    },
  },
  plugins: [],
};