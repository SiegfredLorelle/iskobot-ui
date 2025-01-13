import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "background-clr": "var(--background-clr)",
        "foreground-clr": "var(--foreground-clr)",
        "primary-clr": "var(--primary-clr)",
        "secondary-clr": "var(--secondary-clr)",
        "text-clr": "var(--text-clr)",
        "hover-clr": "var(--hover-clr)",
      },
    },
  },
  darkMode: "class", // Enables dark mode with class strategy
  plugins: [],
} satisfies Config;
