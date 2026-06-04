import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cookbook design system
        cream: {
          0: "#faf4e6",
          1: "#f3ead6",
          2: "#ece0c8",
          3: "#e2d3b6",
        },
        ink: {
          DEFAULT: "#3a2c20",
          soft: "#6e5a48",
          faint: "#9a866f",
        },
        line: "#d8c7a8",
        accent: {
          DEFAULT: "#bf6243",
          deep: "#9c4a30",
          soft: "#ecc8b6",
          ink: "#7e3a24",
        },
        secondary: {
          DEFAULT: "#7c8a5b",
          soft: "#d9dec6",
        },
        honey: "#c9a24a",
        "rule-blue": "#b9c2cf",
        "rule-red": "#d39b8f",
        // shadcn/ui compat (CSS var based)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      fontFamily: {
        slab: ['"Zilla Slab"', "Georgia", "serif"],
        hand: ['"Caveat"', '"Segoe Script"', "cursive"],
        sans: ['"Nunito Sans"', "system-ui", "sans-serif"],
        mono: [
          "ui-monospace",
          '"SF Mono"',
          '"Roboto Mono"',
          "Menlo",
          "monospace",
        ],
      },
      fontSize: {
        "title-xl": ["clamp(48px,6vw,76px)", { lineHeight: "0.95" }],
        "title-lg": ["clamp(36px,4vw,58px)", { lineHeight: "1.0" }],
        "title-md": ["clamp(28px,3vw,40px)", { lineHeight: "1.05" }],
      },
      borderRadius: {
        card: "3px",
        btn: "6px",
        input: "9px",
        pill: "999px",
        modal: "16px",
        hero: "12px",
        avatar: "50%",
        brand: "8px",
      },
      boxShadow: {
        card: "0 1px 0 #fff inset, 0 2px 5px rgba(58,44,32,.10), 0 14px 28px -18px rgba(58,44,32,.45)",
        "card-hover":
          "0 1px 0 #fff inset, 0 8px 14px rgba(58,44,32,.16), 0 26px 40px -22px rgba(58,44,32,.55)",
        "btn-primary":
          "0 2px 0 #9c4a30, 0 6px 16px -6px #9c4a30",
        modal: "0 30px 80px -20px rgba(40,30,22,.6)",
        stamp: "0 1px 2px rgba(0,0,0,.12)",
        topbar: "0 8px 20px -16px rgba(58,44,32,.5)",
      },
      animation: {
        "view-in": "viewIn .36s cubic-bezier(.2,.7,.3,1)",
        "sheet-in": "sheetIn .26s cubic-bezier(.2,.7,.3,1)",
        "toast-in": "toastIn .3s cubic-bezier(.2,.7,.3,1)",
      },
      keyframes: {
        viewIn: {
          from: { transform: "translateY(9px)" },
          to: { transform: "none" },
        },
        sheetIn: {
          from: { transform: "translateY(18px) scale(.98)" },
          to: { transform: "none" },
        },
        toastIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
