import type { Config } from "tailwindcss"

// TODO uploadthing fix styles
import { withUt } from "uploadthing/tw"

const config = {
  darkMode: ["class"],
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./node_modules/@oberoncms/*/dist/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@tohuhono/*/dist/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@oberon/*/dist/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@datacom-digital/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@oberoncms/**/@tohuhono/*/dist/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@oberoncms/**/@oberon/*/dist/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./.oberon/tailwind.classes",
  ],
  theme: {
    extend: {
      spacing: {
        nav: "var(--nav-height)",
      },
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default withUt(config)
