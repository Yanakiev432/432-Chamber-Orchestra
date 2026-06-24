/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "var(--color-brand-bg)",
          warm: "var(--color-brand-warm)",
          surface: "var(--color-brand-surface)",
          text: "var(--color-brand-text)",
          muted: "var(--color-brand-muted)",
          primary: "var(--color-brand-primary)",
          primaryHover: "var(--color-brand-primary-hover)",
          accent: "var(--color-brand-accent)",
          border: "var(--color-brand-border)",
          borderWarm: "var(--color-brand-border-warm)"
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
