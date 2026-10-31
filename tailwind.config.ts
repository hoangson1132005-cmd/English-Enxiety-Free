import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary teal
        primary: {
          DEFAULT: "#2F7F7A",
          50: "#E3F2EF",
          100: "#C8E6E2",
          200: "#91CCC5",
          300: "#5AB3A8",
          400: "#3D9990",
          500: "#2F7F7A",
          600: "#256A66",
          700: "#1E5A57",
          800: "#164340",
          900: "#0D2B29",
          hover: "#256A66",
          dark: "#1E5A57",
          foreground: "#ffffff",
        },
        // Accent pink (cherry blossom)
        accent: {
          DEFAULT: "#F4A7B9",
          light: "#FDE7EC",
          dark: "#E8769A",
          foreground: "#7C2D4A",
        },
        // Cream/warm background
        cream: {
          DEFAULT: "#FFF4CC",
          dark: "#FFE980",
        },
        // Background
        background: {
          DEFAULT: "#FBFDFC",
          secondary: "#E3F2EF",
          warm: "#FFF4CC",
        },
        // Text
        text: {
          primary: "#1F2D2B",
          secondary: "#5F7370",
          muted: "#9BAFAC",
        },
        // Status colors
        success: {
          DEFAULT: "#3BA776",
          light: "#E8F7F0",
          dark: "#2D8760",
        },
        error: {
          DEFAULT: "#E5676B",
          light: "#FDEAEA",
          dark: "#C94A4E",
        },
        warning: {
          DEFAULT: "#F2B84B",
          light: "#FEF6E4",
          dark: "#D9963A",
        },
      },
      fontFamily: {
        sans: ["Be Vietnam Pro", "system-ui", "sans-serif"],
        serif: ["Be Vietnam Pro", "system-ui", "sans-serif"],
        display: ["Be Vietnam Pro", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(47, 127, 122, 0.08), 0 4px 6px -2px rgba(47, 127, 122, 0.04)",
        "soft-lg": "0 10px 40px -10px rgba(47, 127, 122, 0.12), 0 4px 6px -2px rgba(47, 127, 122, 0.06)",
        card: "0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(47, 127, 122, 0.06)",
        "card-hover": "0 4px 20px rgba(47, 127, 122, 0.12), 0 1px 3px rgba(0,0,0,0.06)",
        glow: "0 0 20px rgba(47, 127, 122, 0.2)",
      },
      backgroundImage: {
        "gradient-teal-cream": "linear-gradient(135deg, #2F7F7A 0%, #3D9990 30%, #FFF4CC 100%)",
        "gradient-teal": "linear-gradient(135deg, #1E5A57 0%, #2F7F7A 50%, #5AB3A8 100%)",
        "gradient-cream": "linear-gradient(135deg, #FFF4CC 0%, #FDE7EC 100%)",
        "gradient-soft": "linear-gradient(180deg, #FBFDFC 0%, #E3F2EF 100%)",
        "hero-gradient": "linear-gradient(135deg, #E3F2EF 0%, #FFF4CC 50%, #FDE7EC 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "typing": "typing 1.5s steps(3) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        typing: {
          "0%": { content: "." },
          "33%": { content: ".." },
          "66%": { content: "..." },
        },
      },
    },
  },
  plugins: [],
};

export default config;
