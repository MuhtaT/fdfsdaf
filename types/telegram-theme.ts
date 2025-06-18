/**
 * Унифицированные типы для Telegram тем
 * Избегает конфликтов между SDK и собственными типами
 */

export interface TelegramThemeParams {
    bg_color: string
    text_color: string
    hint_color: string
    link_color: string
    button_color: string
    button_text_color: string
    secondary_bg_color: string
    header_bg_color?: string
    accent_text_color?: string
    section_bg_color?: string
    section_header_text_color?: string
    subtitle_text_color?: string
    destructive_text_color?: string
  }
  
  export interface SafeTelegramTheme {
    colorScheme: 'light' | 'dark'
    themeParams: TelegramThemeParams
  }
  
  /**
   * Утилита для создания безопасной темы с значениями по умолчанию
   */
  export function createSafeTelegramTheme(
    theme?: any,
    colorScheme: 'light' | 'dark' = 'light'
  ): SafeTelegramTheme {
    const defaultLightTheme: TelegramThemeParams = {
      bg_color: '#ffffff',
      text_color: '#000000',
      hint_color: '#999999',
      link_color: '#3390EC',
      button_color: '#00C8A8',
      button_text_color: '#ffffff',
      secondary_bg_color: '#f0f0f0',
      header_bg_color: '#ffffff',
      accent_text_color: '#3390EC',
      section_bg_color: '#ffffff',
      section_header_text_color: '#6d6d71',
      subtitle_text_color: '#999999',
      destructive_text_color: '#ff3b30',
    }
  
    const defaultDarkTheme: TelegramThemeParams = {
      bg_color: '#1c1c1e',
      text_color: '#ffffff',
      hint_color: '#8e8e93',
      link_color: '#6ab7ff',
      button_color: '#00C8A8',
      button_text_color: '#ffffff',
      secondary_bg_color: '#2c2c2e',
      header_bg_color: '#1c1c1e',
      accent_text_color: '#6ab7ff',
      section_bg_color: '#1c1c1e',
      section_header_text_color: '#8e8e93',
      subtitle_text_color: '#8e8e93',
      destructive_text_color: '#ff453a',
    }
  
    const defaultTheme = colorScheme === 'dark' ? defaultDarkTheme : defaultLightTheme
  
    if (!theme || !theme.themeParams) {
      return {
        colorScheme,
        themeParams: defaultTheme
      }
    }
  
    return {
      colorScheme,
      themeParams: {
        bg_color: theme.themeParams.bg_color || defaultTheme.bg_color,
        text_color: theme.themeParams.text_color || defaultTheme.text_color,
        hint_color: theme.themeParams.hint_color || defaultTheme.hint_color,
        link_color: theme.themeParams.link_color || defaultTheme.link_color,
        button_color: theme.themeParams.button_color || defaultTheme.button_color,
        button_text_color: theme.themeParams.button_text_color || defaultTheme.button_text_color,
        secondary_bg_color: theme.themeParams.secondary_bg_color || defaultTheme.secondary_bg_color,
        header_bg_color: theme.themeParams.header_bg_color || defaultTheme.header_bg_color,
        accent_text_color: theme.themeParams.accent_text_color || defaultTheme.accent_text_color,
        section_bg_color: theme.themeParams.section_bg_color || defaultTheme.section_bg_color,
        section_header_text_color: theme.themeParams.section_header_text_color || defaultTheme.section_header_text_color,
        subtitle_text_color: theme.themeParams.subtitle_text_color || defaultTheme.subtitle_text_color,
        destructive_text_color: theme.themeParams.destructive_text_color || defaultTheme.destructive_text_color,
      }
    }
  }
  
  /**
   * Хук для получения безопасной темы из store
   */
  export function useSafeTelegramTheme() {
    // Здесь можно импортировать useThemeStore, если нужно
    // const { telegramTheme } = useThemeStore()
    // return createSafeTelegramTheme(telegramTheme)
    
    return createSafeTelegramTheme()
  }
  
  /**
   * CSS переменные для Telegram темы
   */
  export function createTelegramCSSVariables(theme: SafeTelegramTheme): Record<string, string> {
    return {
      '--tg-bg-color': theme.themeParams.bg_color,
      '--tg-text-color': theme.themeParams.text_color,
      '--tg-hint-color': theme.themeParams.hint_color,
      '--tg-link-color': theme.themeParams.link_color,
      '--tg-button-color': theme.themeParams.button_color,
      '--tg-button-text-color': theme.themeParams.button_text_color,
      '--tg-secondary-bg-color': theme.themeParams.secondary_bg_color,
      '--tg-header-bg-color': theme.themeParams.header_bg_color || theme.themeParams.bg_color,
      '--tg-accent-text-color': theme.themeParams.accent_text_color || theme.themeParams.link_color,
      '--tg-section-bg-color': theme.themeParams.section_bg_color || theme.themeParams.bg_color,
      '--tg-section-header-text-color': theme.themeParams.section_header_text_color || theme.themeParams.hint_color,
      '--tg-subtitle-text-color': theme.themeParams.subtitle_text_color || theme.themeParams.hint_color,
      '--tg-destructive-text-color': theme.themeParams.destructive_text_color || '#ff3b30',
    }
  }
  
  /**
   * Проверяет, является ли тема темной
   */
  export function isDarkTheme(theme: SafeTelegramTheme): boolean {
    return theme.colorScheme === 'dark'
  }
  
  /**
   * Получает контрастный цвет для текста
   */
  export function getContrastColor(backgroundColor: string): string {
    // Простая проверка яркости цвета
    const hex = backgroundColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    
    return brightness > 128 ? '#000000' : '#ffffff'
  }