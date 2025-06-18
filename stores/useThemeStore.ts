import { create } from "zustand"

interface TelegramThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
  header_bg_color?: string
  accent_text_color?: string
  section_bg_color?: string
  section_header_text_color?: string
  subtitle_text_color?: string
  destructive_text_color?: string
}

interface TelegramTheme {
  colorScheme: "light" | "dark"
  themeParams: TelegramThemeParams
}

interface ThemeState {
  telegramTheme: TelegramTheme
  isDark: boolean
  primaryColor: string
  isInitialized: boolean
  isInTelegram: boolean
}

interface ThemeActions {
  updateTelegramTheme: (theme: TelegramTheme) => void
  setIsDark: (isDark: boolean) => void
  toggleDarkMode: () => void  // ✅ Добавили недостающий метод
  setPrimaryColor: (color: string) => void
  initializeTheme: () => void
  syncWithTelegramTheme: () => void
  applyTelegramCSS: () => void
}

type ThemeStore = ThemeState & ThemeActions

// Дефолтная светлая тема
const defaultLightTheme: TelegramTheme = {
  colorScheme: "light",
  themeParams: {
    bg_color: "#ffffff",
    text_color: "#000000",
    hint_color: "#999999",
    link_color: "#3390EC",
    button_color: "#00C8A8",
    button_text_color: "#ffffff",
    secondary_bg_color: "#f0f0f0",
    header_bg_color: "#ffffff",
    accent_text_color: "#3390EC",
    section_bg_color: "#ffffff",
    section_header_text_color: "#6d6d71",
    subtitle_text_color: "#999999",
    destructive_text_color: "#ff3b30",
  },
}

// Дефолтная темная тема
const defaultDarkTheme: TelegramTheme = {
  colorScheme: "dark",
  themeParams: {
    bg_color: "#1c1c1e",
    text_color: "#ffffff",
    hint_color: "#8e8e93",
    link_color: "#6ab7ff",
    button_color: "#00C8A8",
    button_text_color: "#ffffff",
    secondary_bg_color: "#2c2c2e",
    header_bg_color: "#1c1c1e",
    accent_text_color: "#6ab7ff",
    section_bg_color: "#1c1c1e",
    section_header_text_color: "#8e8e93",
    subtitle_text_color: "#8e8e93",
    destructive_text_color: "#ff453a",
  },
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  // State
  telegramTheme: defaultLightTheme,
  isDark: false,
  primaryColor: "#00C8A8",
  isInitialized: false,
  isInTelegram: false,

  // Actions
  updateTelegramTheme: (theme) => {
    const isDark = theme.colorScheme === "dark"
    
    set({
      telegramTheme: theme,
      isDark,
      primaryColor: theme.themeParams.button_color || "#00C8A8",
    })

    // Применяем CSS переменные
    get().applyTelegramCSS()
  },

  setIsDark: (isDark) => {
    const newTheme = isDark ? defaultDarkTheme : defaultLightTheme
    
    set({
      isDark,
      telegramTheme: newTheme,
    })

    // Обновляем класс dark в DOM
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", isDark)
      localStorage.setItem("theme", isDark ? "dark" : "light")
    }

    get().applyTelegramCSS()
  },

  // ✅ Реализация toggleDarkMode
  toggleDarkMode: () => {
    const { isDark } = get()
    get().setIsDark(!isDark)
    console.log('🌓 Переключение темы:', !isDark ? 'темная' : 'светлая')
  },

  setPrimaryColor: (color) => set({ primaryColor: color }),

  initializeTheme: () => {
    if (typeof window === "undefined") return

    const isInTelegram = !!(
      window.Telegram?.WebApp ||
      window.parent !== window ||
      window.location.search.includes('tgWebAppData')
    )

    set({ isInTelegram })

    if (isInTelegram) {
      // Инициализируем тему из Telegram
      get().syncWithTelegramTheme()
    } else {
      // Инициализируем тему из localStorage
      const savedTheme = localStorage.getItem("theme")
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const isDark = savedTheme === "dark" || (!savedTheme && prefersDark)
      
      get().setIsDark(isDark)
    }

    set({ isInitialized: true })
  },

  syncWithTelegramTheme: () => {
    if (typeof window === "undefined" || !window.Telegram?.WebApp) return

    const webApp = window.Telegram.WebApp
    const colorScheme = webApp.colorScheme || "light"
    const themeParams = webApp.themeParams || {}

    console.log('🎨 Синхронизация с Telegram темой:', { colorScheme, themeParams })

    const telegramTheme: TelegramTheme = {
      colorScheme,
      themeParams: {
        bg_color: themeParams.bg_color,
        text_color: themeParams.text_color,
        hint_color: themeParams.hint_color,
        link_color: themeParams.link_color,
        button_color: themeParams.button_color,
        button_text_color: themeParams.button_text_color,
        secondary_bg_color: themeParams.secondary_bg_color,
        header_bg_color: themeParams.header_bg_color,
        accent_text_color: themeParams.accent_text_color,
        section_bg_color: themeParams.section_bg_color,
        section_header_text_color: themeParams.section_header_text_color,
        subtitle_text_color: themeParams.subtitle_text_color,
        destructive_text_color: themeParams.destructive_text_color,
      },
    }

    get().updateTelegramTheme(telegramTheme)

    // Слушаем изменения темы в Telegram
    webApp.onEvent('themeChanged', () => {
      console.log('🎨 Тема Telegram изменилась')
      get().syncWithTelegramTheme()
    })
  },

  applyTelegramCSS: () => {
    if (typeof window === "undefined") return

    const { telegramTheme, isDark } = get()
    const { themeParams } = telegramTheme

    // Обновляем CSS переменные для интеграции с Telegram
    const root = document.documentElement

    // Основные цвета Telegram
    if (themeParams.bg_color) {
      root.style.setProperty('--tg-bg-color', themeParams.bg_color)
    }
    if (themeParams.text_color) {
      root.style.setProperty('--tg-text-color', themeParams.text_color)
    }
    if (themeParams.hint_color) {
      root.style.setProperty('--tg-hint-color', themeParams.hint_color)
    }
    if (themeParams.link_color) {
      root.style.setProperty('--tg-link-color', themeParams.link_color)
    }
    if (themeParams.button_color) {
      root.style.setProperty('--tg-button-color', themeParams.button_color)
    }
    if (themeParams.button_text_color) {
      root.style.setProperty('--tg-button-text-color', themeParams.button_text_color)
    }
    if (themeParams.secondary_bg_color) {
      root.style.setProperty('--tg-secondary-bg-color', themeParams.secondary_bg_color)
    }

    // Обновляем основные CSS переменные приложения
    const hslFromHex = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0
      let s = 0
      const l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break
          case g: h = (b - r) / d + 2; break
          case b: h = (r - g) / d + 4; break
        }
        h /= 6
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
    }

    try {
      if (themeParams.bg_color) {
        root.style.setProperty('--background', hslFromHex(themeParams.bg_color))
      }
      if (themeParams.text_color) {
        root.style.setProperty('--foreground', hslFromHex(themeParams.text_color))
      }
      if (themeParams.button_color) {
        root.style.setProperty('--primary', hslFromHex(themeParams.button_color))
      }
    } catch (error) {
      console.warn('Ошибка конвертации цвета:', error)
    }

    // Обновляем класс dark
    document.documentElement.classList.toggle("dark", isDark)

    // Синхронизируем цвета с Telegram WebApp
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      webApp.setBackgroundColor(themeParams.bg_color || (isDark ? '#1c1c1e' : '#ffffff'))
      webApp.setHeaderColor(themeParams.header_bg_color || themeParams.bg_color || (isDark ? '#1c1c1e' : '#ffffff'))
    }

    console.log('🎨 CSS переменные Telegram темы применены')
  },
}))

// Хуки для удобного использования
export const useTelegramTheme = () => {
  const store = useThemeStore()
  return {
    theme: store.telegramTheme,
    isDark: store.isDark,
    primaryColor: store.primaryColor,
    isInTelegram: store.isInTelegram,
    isInitialized: store.isInitialized,
  }
}

export const useTelegramColors = () => {
  const { themeParams } = useThemeStore().telegramTheme
  return {
    backgroundColor: themeParams.bg_color || '#ffffff',
    textColor: themeParams.text_color || '#000000',
    hintColor: themeParams.hint_color || '#999999',
    linkColor: themeParams.link_color || '#3390EC',
    buttonColor: themeParams.button_color || '#00C8A8',
    buttonTextColor: themeParams.button_text_color || '#ffffff',
    secondaryBackgroundColor: themeParams.secondary_bg_color || '#f0f0f0',
  }
}