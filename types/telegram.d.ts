// Типы для Telegram WebApp API
declare global {
    interface Window {
      Telegram?: {
        WebApp: TelegramWebApp
      }
    }
  }
  
  interface TelegramWebApp {
    // Основные свойства
    initData: string
    initDataUnsafe: {
      user?: TelegramUser
      receiver?: TelegramUser
      chat?: TelegramChat
      chat_type?: string
      chat_instance?: string
      start_param?: string
      can_send_after?: number
      auth_date?: number
      hash?: string
    }
    version: string
    platform: string
    colorScheme: 'light' | 'dark'
    themeParams: TelegramThemeParams
    isExpanded: boolean
    viewportHeight: number
    viewportStableHeight: number
    headerColor: string
    backgroundColor: string
    isClosingConfirmationEnabled: boolean
    isVerticalSwipesEnabled: boolean
  
    // Методы
    ready(): void
    expand(): void
    close(): void
    setHeaderColor(color: string): void
    setBackgroundColor(color: string): void
    enableClosingConfirmation(): void
    disableClosingConfirmation(): void
    enableVerticalSwipes(): void
    disableVerticalSwipes(): void
    
    // Уведомления и диалоги
    showAlert(message: string, callback?: () => void): void
    showConfirm(message: string, callback?: (confirmed: boolean) => void): void
    showPopup(params: {
      title?: string
      message: string
      buttons?: Array<{
        id?: string
        type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
        text?: string
      }>
    }, callback?: (buttonId: string) => void): void
    showScanQrPopup(params: {
      text?: string
    }, callback?: (text: string) => void): void
  
    // Навигация
    openLink(url: string, options?: { try_instant_view?: boolean }): void
    openTelegramLink(url: string): void
    shareToStory(media_url: string, params?: {
      text?: string
      widget_link?: {
        url: string
        name?: string
      }
    }): void
    switchInlineQuery(query: string, choose_chat_types?: string[]): void
  
    // Данные
    sendData(data: string): void
  
    // События
    onEvent(eventType: string, callback: () => void): void
    offEvent(eventType: string, callback: () => void): void
  
    // Вибрация
    hapticFeedback: {
      impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
      notificationOccurred(type: 'error' | 'success' | 'warning'): void
      selectionChanged(): void
    }
  
    // Кнопки
    MainButton: TelegramMainButton
    BackButton: TelegramBackButton
    SettingsButton: TelegramSettingsButton
  
    // Облачное хранилище
    CloudStorage: {
      setItem(key: string, value: string, callback?: (error: string | null, success: boolean) => void): void
      getItem(key: string, callback: (error: string | null, value: string | null) => void): void
      getItems(keys: string[], callback: (error: string | null, values: Record<string, string>) => void): void
      removeItem(key: string, callback?: (error: string | null, success: boolean) => void): void
      removeItems(keys: string[], callback?: (error: string | null, success: boolean) => void): void
      getKeys(callback: (error: string | null, keys: string[]) => void): void
    }
  
    // Биометрия
    BiometricManager?: {
      isInited: boolean
      isBiometricAvailable: boolean
      biometricType: string
      isAccessRequested: boolean
      isAccessGranted: boolean
      isBiometricTokenSaved: boolean
      deviceId: string
      init(callback?: () => void): void
      requestAccess(params: { reason?: string }, callback?: (success: boolean) => void): void
      authenticate(params: { reason?: string }, callback?: (success: boolean, token?: string) => void): void
      updateBiometricToken(token: string, callback?: (success: boolean) => void): void
      openSettings(): void
    }
  }
  
  interface TelegramUser {
    id: number
    is_bot?: boolean
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
    is_premium?: boolean
    added_to_attachment_menu?: boolean
    allows_write_to_pm?: boolean
    photo_url?: string
  }
  
  interface TelegramChat {
    id: number
    type: 'group' | 'supergroup' | 'channel'
    title: string
    username?: string
    photo_url?: string
  }
  
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
    section_separator_color?: string
    bottom_bar_bg_color?: string
  }
  
  interface TelegramMainButton {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    
    setText(text: string): TelegramMainButton
    onClick(callback: () => void): TelegramMainButton
    offClick(callback: () => void): TelegramMainButton
    show(): TelegramMainButton
    hide(): TelegramMainButton
    enable(): TelegramMainButton
    disable(): TelegramMainButton
    showProgress(leaveActive?: boolean): TelegramMainButton
    hideProgress(): TelegramMainButton
    setParams(params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }): TelegramMainButton
  }
  
  interface TelegramBackButton {
    isVisible: boolean
    
    onClick(callback: () => void): TelegramBackButton
    offClick(callback: () => void): TelegramBackButton
    show(): TelegramBackButton
    hide(): TelegramBackButton
  }
  
  interface TelegramSettingsButton {
    isVisible: boolean
    
    onClick(callback: () => void): TelegramSettingsButton
    offClick(callback: () => void): TelegramSettingsButton
    show(): TelegramSettingsButton
    hide(): TelegramSettingsButton
  }
  
  export type {
    TelegramWebApp,
    TelegramUser,
    TelegramChat,
    TelegramThemeParams,
    TelegramMainButton,
    TelegramBackButton,
    TelegramSettingsButton
  }