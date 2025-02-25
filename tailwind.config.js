/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      animation: {
        "spin-slow": "spin 2s linear infinite", // Faster from 3s to 2s
        "bounce-slow": "bounce 2s ease-in-out infinite", // Faster from 3s to 2s
        "fade-in": "fadeIn 1s ease-in-out", // Faster from 1.5s to 1s
        float: "float 15s ease-in-out infinite", // Faster from 30s to 15s
        "float-alt": "float-alt 12s ease-in-out infinite", // Faster from 25s to 12s
        "pulse-slow": "pulse 3s ease-in-out infinite", // Faster from 4s to 3s
        wiggle: "wiggle 1.5s ease-in-out infinite", // Faster from 2s to 1.5s
        zoom: "zoom 10s ease-in-out infinite", // Faster from 20s to 10s
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
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%": { transform: "translateY(0px) rotate(0deg) scale(1)" },
          "25%": { transform: "translateY(-20px) rotate(10deg) scale(1.05)" },
          "50%": { transform: "translateY(0px) rotate(0deg) scale(1)" },
          "75%": { transform: "translateY(20px) rotate(-10deg) scale(0.95)" },
          "100%": { transform: "translateY(0px) rotate(0deg) scale(1)" },
        },
        "float-alt": {
          "0%": { transform: "translateX(0px) translateY(0px) rotate(0deg)" },
          "20%": { transform: "translateX(15px) translateY(-10px) rotate(5deg)" },
          "40%": { transform: "translateX(30px) translateY(0px) rotate(0deg)" },
          "60%": { transform: "translateX(15px) translateY(10px) rotate(-5deg)" },
          "80%": { transform: "translateX(0px) translateY(0px) rotate(0deg)" },
          "100%": { transform: "translateX(0px) translateY(0px) rotate(0deg)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        zoom: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

