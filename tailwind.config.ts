import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
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
        // Telegram цвета
        telegram: {
          primary: "#3390EC",
          secondary: "#40A7E3",
          surface: "#FFFFFF",
          background: "#F4F4F5",
          button: "#00C8A8",
          destructive: "#FF3B30",
          hint: "#999999",
        },
        // Avito цвета  
        avito: {
          primary: "#00C8A8",
          accent: "#FF6B35",
          success: "#00B956",
          warning: "#FFB800",
          error: "#FF3B30",
        },
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Telegram specific радиусы
        tg: "12px",
        "tg-small": "8px",
        "tg-large": "16px",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        // Системные шрифты для разных платформ
        system: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif"
        ],
      },
      // РАСШИРЕННЫЕ SCALE ЗНАЧЕНИЯ для haptic feedback
      scale: {
        "97": "0.97",
        "98": "0.98",
        "99": "0.99",
        "101": "1.01",
        "102": "1.02",
      },
      animation: {
        "duck-float": "duck-float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Telegram-специфичные анимации
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.3s ease-out",
        "bounce-gentle": "bounce-gentle 0.6s ease-out",
        "pulse-slow": "pulse 3s infinite",
        // Haptic feedback анимации
        "tap-scale": "tap-scale 0.1s ease-out",
        "button-press": "button-press 0.15s ease-out",
      },
      keyframes: {
        "duck-float": {
          "0%, 100%": { transform: "translateY(0px) rotate(-2deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "tap-scale": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.98)" },
          "100%": { transform: "scale(1)" },
        },
        "button-press": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.96)" },
          "100%": { transform: "scale(1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      spacing: {
        safe: "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
        // Telegram-специфичные отступы
        "tg-padding": "16px",
        "tg-margin": "12px",
        "tg-gap": "8px",
      },
      // Переходы для лучшего UX
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      // Расширенные тени для глубины интерфейса
      boxShadow: {
        "tg": "0 2px 8px rgba(0, 0, 0, 0.1)",
        "tg-card": "0 4px 16px rgba(0, 0, 0, 0.08)",
        "tg-modal": "0 8px 32px rgba(0, 0, 0, 0.16)",
        "tg-button": "0 2px 4px rgba(0, 0, 0, 0.12)",
        "inner-tg": "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
      },
      // Градиенты для modern UI
      backgroundImage: {
        "gradient-tg": "linear-gradient(135deg, var(--tg-button-color), var(--tg-link-color))",
        "gradient-avito": "linear-gradient(135deg, #00C8A8, #00B956)",
        "gradient-shimmer": "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Кастомный плагин для haptic feedback утилит
    function({ addUtilities }: { addUtilities: Function }) {
      const hapticUtilities = {
        '.haptic-feedback': {
          'transition': 'transform 0.1s ease-out',
          'transform-origin': 'center',
        },
        '.haptic-light': {
          'transition': 'transform 75ms ease-out',
          '&:active': {
            'transform': 'scale(0.98)',
          },
        },
        '.haptic-medium': {
          'transition': 'transform 100ms ease-out',
          '&:active': {
            'transform': 'scale(0.95)',
          },
        },
        '.haptic-heavy': {
          'transition': 'transform 150ms ease-out',
          '&:active': {
            'transform': 'scale(0.90)',
          },
        },
        '.haptic-lift': {
          'transition': 'transform 200ms ease-out',
          '&:hover': {
            'transform': 'translateY(-2px)',
          },
          '&:active': {
            'transform': 'translateY(0) scale(0.98)',
          },
        },
      }
      addUtilities(hapticUtilities)
    }
  ],
}

export default config