/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#091F19",
          warm: "#F0E8D9",
          surface: "#234531",
          text: "#F0E8D9",
          muted: "#D7CEBF",
          primary: "#F0E8D9",
          primaryHover: "#D8B989",
          accent: "#C7A76D",
          burgundy: "#723A42",
          border: "#345746",
          borderWarm: "#C7A76D"
        }
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
