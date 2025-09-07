/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Токены через CSS-переменные
        background: "var(--bg)",
        foreground: "var(--fg)",
        card: "var(--card)",
        border: "var(--border)",
        accent: "var(--accent)",      // фирменный
        accentFg: "var(--accent-fg)", // текст на акценте
      },
      ringColor: {
        DEFAULT: "var(--accent)",
      },
    },
  },
  plugins: [],
};
