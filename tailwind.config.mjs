/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#f8fafc",
          warm: "#ffffcc",
          surface: "#ffffff",
          text: "#1f2937",
          muted: "#334155",
          primary: "#123c3c",
          primaryHover: "#0b2f2f",
          accent: "#a16207",
          border: "#cbd5e1",
          borderWarm: "#d8c99b"
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
