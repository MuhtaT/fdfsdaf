import { useEffect, useState, useCallback } from "react"
import { 
  useLaunchParams, 
  miniApp, 
  themeParams, 
  viewport,
  mainButton,
  backButton,
  settingsButton,
  cloudStorage,
  hapticFeedback,
  useSignal,
  useRawInitData
} from "@telegram-apps/sdk-react"

/**
 * Данные пользователя Telegram
 */
interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

/**
 * Главный хук для работы с Telegram Mini App
 */
export function useTelegram() {
  const launchParams = useLaunchParams()
  const rawInitData = useRawInitData()
  
  // ✅ Исправлено: используем функции вместо свойств
  const backgroundColor = useSignal(themeParams.backgroundColor)
  const textColor = useSignal(themeParams.textColor)
  const isExpanded = useSignal(viewport.isExpanded)

  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (launchParams?.tgWebAppData) {
      // Парсим пользователя из launch params
      try {
        const userData = launchParams.tgWebAppData.user
        if (userData) {
          setUser(userData as TelegramUser)
          console.log('👤 Пользователь Telegram:', userData)
        }
      } catch (error) {
        console.error('Ошибка парсинга пользователя:', error)
      }
    }

    setIsReady(true)
  }, [launchParams])

  // Методы для работы с приложением
  const expand = useCallback(() => {
    if (viewport && viewport.expand.isAvailable()) {
      viewport.expand()
    }
  }, [])

  const close = useCallback(() => {
    if (miniApp && miniApp.close.isAvailable()) {
      miniApp.close()
    }
  }, [])

  const ready = useCallback(() => {
    if (miniApp && miniApp.ready.isAvailable()) {
      miniApp.ready()
    }
  }, [])

  // ⚠️ ПРИМЕЧАНИЕ: В SDK 3.x API для showAlert/showConfirm может отличаться
  // Нужно проверить актуальную документацию или использовать postEvent
  const showAlert = useCallback((message: string) => {
    return new Promise<void>((resolve) => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        // Fallback на старый API через window.Telegram
        try {
          window.Telegram.WebApp.showAlert(message, () => resolve())
        } catch (error) {
          console.warn('ShowAlert error:', error)
          alert(message)
          resolve()
        }
      } else {
        alert(message)
        resolve()
      }
    })
  }, [])

  const showConfirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        // Fallback на старый API через window.Telegram
        try {
          window.Telegram.WebApp.showConfirm(message, (confirmed: boolean) => resolve(confirmed))
        } catch (error) {
          console.warn('ShowConfirm error:', error)
          resolve(confirm(message))
        }
      } else {
        resolve(confirm(message))
      }
    })
  }, [])

  const openLink = useCallback((url: string, options?: { tryInstantView?: boolean }) => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.openLink(url, { try_instant_view: options?.tryInstantView })
      } catch (error) {
        console.warn('OpenLink error:', error)
        window.open(url, '_blank')
      }
    } else {
      window.open(url, '_blank')
    }
  }, [])

  const shareToStory = useCallback((mediaUrl: string, options?: { 
    text?: string
    widget_link?: { url: string, name?: string }
  }) => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.shareToStory(mediaUrl, {
          text: options?.text,
          widget_link: options?.widget_link
        })
      } catch (error) {
        console.warn('ShareToStory error:', error)
      }
    }
  }, [])

  const sendData = useCallback((data: string) => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.sendData(data)
      } catch (error) {
        console.warn('SendData error:', error)
      }
    }
  }, [])

  return {
    // Данные
    user,
    initData: rawInitData,
    isReady,
    themeParams: {
      // ✅ Исправлено: значения уже доступны напрямую из useSignal
      backgroundColor,
      textColor,
      hintColor: useSignal(themeParams.hintColor),
      linkColor: useSignal(themeParams.linkColor),
      buttonColor: useSignal(themeParams.buttonColor),
      buttonTextColor: useSignal(themeParams.buttonTextColor),
      secondaryBackgroundColor: useSignal(themeParams.secondaryBackgroundColor),
      headerBackgroundColor: useSignal(themeParams.headerBackgroundColor),
    },
    viewport: {
      isExpanded,
      height: useSignal(viewport.height),
      stableHeight: useSignal(viewport.stableHeight),
    },
    
    // Методы
    expand,
    close,
    ready,
    showAlert,
    showConfirm,
    openLink,
    shareToStory,
    sendData,
    hapticFeedback,

    // Проверки
    isExpanded,
    platform: launchParams?.tgWebAppPlatform,
    version: launchParams?.tgWebAppVersion,
  }
}

/**
 * Хук для работы с главной кнопкой Telegram
 */
export function useTelegramMainButton() {
  const isVisible = useSignal(mainButton.isVisible)
  const isEnabled = useSignal(mainButton.isEnabled)
  const text = useSignal(mainButton.text)
  const isLoaderVisible = useSignal(mainButton.isLoaderVisible)

  const showButton = useCallback((text: string, onClick?: () => void) => {
    try {
      // ✅ Сначала монтируем если не смонтировано
      if (!mainButton.isMounted() && mainButton.mount.isAvailable()) {
        mainButton.mount()
      }

      // ✅ Используем новый API setParams
      if (mainButton.setParams.isAvailable()) {
        mainButton.setParams({
          text,
          isVisible: true,
          isEnabled: true,
        })
      }
      
      if (onClick && mainButton.onClick.isAvailable()) {
        // Убираем предыдущие обработчики
        mainButton.offClick(onClick)
        mainButton.onClick(onClick)
      }
    } catch (error) {
      console.warn('MainButton showButton error:', error)
    }
  }, [])

  const hideButton = useCallback(() => {
    try {
      if (mainButton.setParams.isAvailable()) {
        mainButton.setParams({ isVisible: false })
      }
    } catch (error) {
      console.warn('MainButton hideButton error:', error)
    }
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    try {
      if (mainButton.setParams.isAvailable()) {
        mainButton.setParams({ isLoaderVisible: loading })
      }
    } catch (error) {
      console.warn('MainButton setLoading error:', error)
    }
  }, [])

  const updateButton = useCallback((params: {
    text?: string
    backgroundColor?: string
    textColor?: string
    enabled?: boolean
  }) => {
    try {
      if (mainButton.setParams.isAvailable()) {
        const updateParams: any = {}
        
        if (params.text !== undefined) updateParams.text = params.text
        if (params.backgroundColor) updateParams.backgroundColor = params.backgroundColor
        if (params.textColor) updateParams.textColor = params.textColor
        if (params.enabled !== undefined) updateParams.isEnabled = params.enabled

        mainButton.setParams(updateParams)
      }
    } catch (error) {
      console.warn('MainButton updateButton error:', error)
    }
  }, [])

  return {
    showButton,
    hideButton,
    setLoading,
    updateButton,
    isVisible,
    isEnabled,
    isLoaderVisible,
    text,
  }
}

/**
 * Хук для работы с кнопкой назад Telegram
 */
export function useTelegramBackButton() {
  const isVisible = useSignal(backButton.isVisible)

  const showBackButton = useCallback((onClick?: () => void) => {
    try {
      // ✅ Сначала монтируем если не смонтировано
      if (!backButton.isMounted() && backButton.mount.isAvailable()) {
        backButton.mount()
      }

      if (backButton.show.isAvailable()) {
        backButton.show()
      }
      
      if (onClick && backButton.onClick.isAvailable()) {
        // Убираем предыдущие обработчики
        backButton.offClick(onClick)
        backButton.onClick(onClick)
      }
    } catch (error) {
      console.warn('BackButton showBackButton error:', error)
    }
  }, [])

  const hideBackButton = useCallback(() => {
    try {
      if (backButton.hide.isAvailable()) {
        backButton.hide()
      }
    } catch (error) {
      console.warn('BackButton hideBackButton error:', error)
    }
  }, [])

  return {
    showBackButton,
    hideBackButton,
    isVisible,
  }
}

/**
 * Хук для работы с облачным хранилищем Telegram
 */
export function useTelegramCloudStorage() {
  const setItem = useCallback(async (key: string, value: string): Promise<boolean> => {
    try {
      if (cloudStorage && cloudStorage.setItem.isAvailable()) {
        // ✅ Новый API - возвращает Promise
        await cloudStorage.setItem(key, value)
        return true
      } else {
        // Fallback на localStorage
        localStorage.setItem(`tg_cloud_${key}`, value)
        return true
      }
    } catch (error) {
      console.error('CloudStorage setItem error:', error)
      // Fallback на localStorage
      try {
        localStorage.setItem(`tg_cloud_${key}`, value)
        return true
      } catch {
        return false
      }
    }
  }, [])

  const getItem = useCallback(async (key: string): Promise<string | null> => {
    try {
      if (cloudStorage && cloudStorage.getItem.isAvailable()) {
        // ✅ Новый API - возвращает Promise
        const value = await cloudStorage.getItem(key)
        return value || null
      } else {
        // Fallback на localStorage
        return localStorage.getItem(`tg_cloud_${key}`)
      }
    } catch (error) {
      console.error('CloudStorage getItem error:', error)
      // Fallback на localStorage
      try {
        return localStorage.getItem(`tg_cloud_${key}`)
      } catch {
        return null
      }
    }
  }, [])

  const removeItem = useCallback(async (key: string): Promise<boolean> => {
    try {
      if (cloudStorage && cloudStorage.deleteItem.isAvailable()) {
        // ✅ Новый API - deleteItem вместо removeItem
        await cloudStorage.deleteItem(key)
        return true
      } else {
        // Fallback на localStorage
        localStorage.removeItem(`tg_cloud_${key}`)
        return true
      }
    } catch (error) {
      console.error('CloudStorage removeItem error:', error)
      // Fallback на localStorage
      try {
        localStorage.removeItem(`tg_cloud_${key}`)
        return true
      } catch {
        return false
      }
    }
  }, [])

  const getKeys = useCallback(async (): Promise<string[]> => {
    try {
      if (cloudStorage && cloudStorage.getKeys.isAvailable()) {
        // ✅ Новый API - возвращает Promise
        const keys = await cloudStorage.getKeys()
        return keys
      } else {
        // Fallback на localStorage
        const keys = Object.keys(localStorage)
          .filter(key => key.startsWith('tg_cloud_'))
          .map(key => key.replace('tg_cloud_', ''))
        return keys
      }
    } catch (error) {
      console.error('CloudStorage getKeys error:', error)
      // Fallback на localStorage
      try {
        const keys = Object.keys(localStorage)
          .filter(key => key.startsWith('tg_cloud_'))
          .map(key => key.replace('tg_cloud_', ''))
        return keys
      } catch {
        return []
      }
    }
  }, [])

  return {
    setItem,
    getItem,
    removeItem,
    getKeys,
  }
}

/**
 * Хук для вибрации (haptic feedback)
 */
export function useTelegramHaptic() {
  const impactLight = useCallback(() => {
    try {
      if (hapticFeedback && hapticFeedback.impactOccurred.isAvailable()) {
        hapticFeedback.impactOccurred('light')
      }
    } catch (error) {
      console.warn('HapticFeedback impactLight error:', error)
    }
  }, [])

  const impactMedium = useCallback(() => {
    try {
      if (hapticFeedback && hapticFeedback.impactOccurred.isAvailable()) {
        hapticFeedback.impactOccurred('medium')
      }
    } catch (error) {
      console.warn('HapticFeedback impactMedium error:', error)
    }
  }, [])

  const impactHeavy = useCallback(() => {
    try {
      if (hapticFeedback && hapticFeedback.impactOccurred.isAvailable()) {
        hapticFeedback.impactOccurred('heavy')
      }
    } catch (error) {
      console.warn('HapticFeedback impactHeavy error:', error)
    }
  }, [])

  const notificationSuccess = useCallback(() => {
    try {
      if (hapticFeedback && hapticFeedback.notificationOccurred.isAvailable()) {
        hapticFeedback.notificationOccurred('success')
      }
    } catch (error) {
      console.warn('HapticFeedback notificationSuccess error:', error)
    }
  }, [])

  const notificationError = useCallback(() => {
    try {
      if (hapticFeedback && hapticFeedback.notificationOccurred.isAvailable()) {
        hapticFeedback.notificationOccurred('error')
      }
    } catch (error) {
      console.warn('HapticFeedback notificationError error:', error)
    }
  }, [])

  const notificationWarning = useCallback(() => {
    try {
      if (hapticFeedback && hapticFeedback.notificationOccurred.isAvailable()) {
        hapticFeedback.notificationOccurred('warning')
      }
    } catch (error) {
      console.warn('HapticFeedback notificationWarning error:', error)
    }
  }, [])

  const selectionChanged = useCallback(() => {
    try {
      if (hapticFeedback && hapticFeedback.selectionChanged.isAvailable()) {
        hapticFeedback.selectionChanged()
      }
    } catch (error) {
      console.warn('HapticFeedback selectionChanged error:', error)
    }
  }, [])

  return {
    impactLight,
    impactMedium,
    impactHeavy,
    notificationSuccess,
    notificationError,
    notificationWarning,
    selectionChanged,
  }
}

/**
 * Хук для валидации initData
 */
export function useTelegramAuth() {
  const { initData, user } = useTelegram()
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const validateInitData = useCallback(async (botToken?: string): Promise<boolean> => {
    if (!initData) {
      setIsValid(false)
      return false
    }

    try {
      // В реальном приложении валидация должна происходить на сервере
      // Здесь показан упрощенный пример
      
      if (process.env.NODE_ENV === 'development') {
        // В dev режиме считаем данные валидными
        setIsValid(true)
        return true
      }

      // Отправляем на сервер для валидации
      const response = await fetch('/api/validate-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, botToken })
      })

      const result = await response.json()
      setIsValid(result.valid)
      return result.valid

    } catch (error) {
      console.error('Ошибка валидации initData:', error)
      setIsValid(false)
      return false
    }
  }, [initData])

  return {
    isValid,
    validateInitData,
    user,
    initData,
    isAuthenticated: !!user && isValid !== false,
  }
}

/**
 * Хук для работы с настройками приложения в Telegram Cloud Storage
 */
export function useTelegramSettings<T extends Record<string, any>>(
  defaultSettings: T,
  storageKey = 'app_settings'
) {
  const { setItem, getItem } = useTelegramCloudStorage()
  const [settings, setSettings] = useState<T>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored)
          setSettings({ ...defaultSettings, ...parsed })
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [storageKey, getItem])

  const updateSettings = useCallback(async (updates: Partial<T>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    
    try {
      await setItem(storageKey, JSON.stringify(newSettings))
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error)
    }
  }, [settings, setItem, storageKey])

  const resetSettings = useCallback(async () => {
    setSettings(defaultSettings)
    
    try {
      await setItem(storageKey, JSON.stringify(defaultSettings))
    } catch (error) {
      console.error('Ошибка сброса настроек:', error)
    }
  }, [defaultSettings, setItem, storageKey])

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
  }
}