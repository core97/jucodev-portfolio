import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "selector",
  theme: {
    extend: {
      keyframes: {
        "blur-fade": {
          "0%": { opacity: "0", transform: "translateY(0.75rem)" },
          "100%": { opacity: "1", transform: "translateY(0rem)" },
        },
      },
      animation: {
        "blur-fade": "blur-fade 0.7s ease-in-out",
      },
    },
  },
  plugins: [typography],
};
