/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";

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
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Mulish', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
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
        // Status colors
        status: {
          success: {
            bg: "hsl(var(--status-success-bg))",
            text: "hsl(var(--status-success-text))",
            border: "hsl(var(--status-success-border))",
          },
          warning: {
            bg: "hsl(var(--status-warning-bg))",
            text: "hsl(var(--status-warning-text))",
            border: "hsl(var(--status-warning-border))",
          },
          error: {
            bg: "hsl(var(--status-error-bg))",
            text: "hsl(var(--status-error-text))",
            border: "hsl(var(--status-error-border))",
          },
          info: {
            bg: "hsl(var(--status-info-bg))",
            text: "hsl(var(--status-info-text))",
            border: "hsl(var(--status-info-border))",
          },
          neutral: {
            bg: "hsl(var(--status-neutral-bg))",
            text: "hsl(var(--status-neutral-text))",
            border: "hsl(var(--status-neutral-border))",
          },
        },
        // Metrics colors
        metrics: {
          primary: {
            bg: "hsl(var(--metrics-primary-bg))",
            text: "hsl(var(--metrics-primary-text))",
          },
          secondary: {
            bg: "hsl(var(--metrics-secondary-bg))",
            text: "hsl(var(--metrics-secondary-text))",
          },
          tertiary: {
            bg: "hsl(var(--metrics-tertiary-bg))",
            text: "hsl(var(--metrics-tertiary-text))",
          },
          revenue: {
            bg: "hsl(var(--metrics-revenue-bg))",
            text: "hsl(var(--metrics-revenue-text))",
          },
          warning: {
            bg: "hsl(var(--metrics-warning-bg))",
            text: "hsl(var(--metrics-warning-text))",
          },
          danger: {
            bg: "hsl(var(--metrics-danger-bg))",
            text: "hsl(var(--metrics-danger-text))",
          },
        },
        // Inventory colors
        inventory: {
          new: "hsl(var(--inventory-new-text))",
          normal: "hsl(var(--inventory-normal-text))",
          warning: "hsl(var(--inventory-warning-text))",
          critical: "hsl(var(--inventory-critical-text))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
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
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
