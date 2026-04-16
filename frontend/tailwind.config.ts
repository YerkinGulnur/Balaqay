import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f0ecff",
          100: "#e4deff",
          400: "#9d87f5",
          500: "#7c5fe6",
          600: "#667eea",
          700: "#5a6fd6",
        },
        brand: {
          purple: "#667eea",
          violet: "#764ba2",
          pink: "#f093fb",
          orange: "#fcb69f",
          peach: "#ff8c69",
          green: "#43e97b",
          teal: "#38f9d7",
          gold: "#ffd200",
          amber: "#f7971e",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 4px 24px rgba(102,126,234,0.10)",
        "card-lg": "0 12px 40px rgba(102,126,234,0.18)",
        purple: "0 8px 24px rgba(102,126,234,0.35)",
        orange: "0 8px 24px rgba(252,182,159,0.45)",
        green: "0 8px 24px rgba(67,233,123,0.30)",
        amber: "0 8px 24px rgba(247,151,30,0.25)",
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease both",
        "fade-in": "fadeIn 0.3s ease both",
        "slide-up": "slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both",
        "bounce-in": "bounceIn 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.7)" },
          "70%": { transform: "scale(1.05)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
