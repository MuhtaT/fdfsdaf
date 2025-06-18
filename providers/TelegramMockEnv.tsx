"use client"

import { useEffect } from "react"

/**
 * Mock окружение Telegram для разработки
 * Эмулирует Telegram WebApp API для тестирования вне Telegram
 */
export function TelegramMockEnv() {
  useEffect(() => {
    if (typeof window === 'undefined' || window.Telegram) {
      return // Уже есть Telegram или запущено на сервере
    }

    // Создаем mock Telegram WebApp API
    const mockWebApp = {
      initData: 'user=%7B%22id%22%3A12345%2C%22first_name%22%3A%22Dev%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22devuser%22%2C%22language_code%22%3A%22ru%22%7D&query_id=AAHdF6IQAAAAAN0XohDhrOrc&auth_date=1703840000&hash=mock_hash',
      initDataUnsafe: {
        user: {
          id: 12345,
          first_name: "Dev",
          last_name: "User", 
          username: "devuser",
          language_code: "ru"
        },
        query_id: "AAHdF6IQAAAAAN0XohDhrOrc",
        auth_date: 1703840000,
        hash: "mock_hash"
      },
      version: "7.0",
      platform: "web",
      colorScheme: "light" as const,
      themeParams: {
        bg_color: "#ffffff",
        text_color: "#000000", 
        hint_color: "#999999",
        link_color: "#3390EC",
        button_color: "#00C8A8",
        button_text_color: "#ffffff",
        secondary_bg_color: "#f0f0f0"
      },
      isExpanded: true,
      viewportHeight: window.innerHeight,
      viewportStableHeight: window.innerHeight,
      headerColor: "#ffffff",
      backgroundColor: "#ffffff",
      isClosingConfirmationEnabled: false,
      isVerticalSwipesEnabled: true,

      // Методы
      ready: () => {
        console.log('📱 Telegram WebApp.ready() вызван (mock)')
      },
      
      expand: () => {
        console.log('📱 Telegram WebApp.expand() вызван (mock)')
      },

      close: () => {
        console.log('📱 Telegram WebApp.close() вызван (mock)')
        alert('В реальном Telegram тут было бы закрытие приложения')
      },

      setHeaderColor: (color: string) => {
        console.log(`📱 Telegram WebApp.setHeaderColor(${color}) вызван (mock)`)
      },

      setBackgroundColor: (color: string) => {
        console.log(`📱 Telegram WebApp.setBackgroundColor(${color}) вызван (mock)`)
      },

      enableClosingConfirmation: () => {
        console.log('📱 Telegram WebApp.enableClosingConfirmation() вызван (mock)')
      },

      disableClosingConfirmation: () => {
        console.log('📱 Telegram WebApp.disableClosingConfirmation() вызван (mock)')
      },

      enableVerticalSwipes: () => {
        console.log('📱 Telegram WebApp.enableVerticalSwipes() вызван (mock)')
      },

      disableVerticalSwipes: () => {
        console.log('📱 Telegram WebApp.disableVerticalSwipes() вызван (mock)')
      },

      hapticFeedback: {
        impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
          console.log(`📳 Haptic feedback: ${style} (mock)`)
        },
        notificationOccurred: (type: 'error' | 'success' | 'warning') => {
          console.log(`📳 Haptic notification: ${type} (mock)`)
        },
        selectionChanged: () => {
          console.log('📳 Haptic selection changed (mock)')
        }
      },

      showAlert: (message: string, callback?: () => void) => {
        alert(message)
        callback?.()
      },

      showConfirm: (message: string, callback?: (confirmed: boolean) => void) => {
        const result = confirm(message)
        callback?.(result)
      },

      showPopup: (params: any, callback?: (buttonId: string) => void) => {
        const result = confirm(params.message || 'Popup')
        callback?.(result ? 'ok' : 'cancel')
      },

      showScanQrPopup: (params: any, callback?: (text: string) => void) => {
        const result = prompt('Введите QR код данные:', '')
        if (result) callback?.(result)
      },

      openLink: (url: string, options?: any) => {
        console.log(`📱 Открытие ссылки: ${url} (mock)`)
        if (options?.try_instant_view) {
          window.open(url, '_blank')
        } else {
          window.location.href = url
        }
      },

      openTelegramLink: (url: string) => {
        console.log(`📱 Открытие Telegram ссылки: ${url} (mock)`)
        window.open(url, '_blank')
      },

      shareToStory: (media_url: string, params?: any) => {
        console.log(`📱 Поделиться в Stories: ${media_url} (mock)`)
      },

      switchInlineQuery: (query: string, choose_chat_types?: string[]) => {
        console.log(`📱 Switch inline query: ${query} (mock)`)
      },

      sendData: (data: string) => {
        console.log(`📱 Отправка данных боту: ${data} (mock)`)
      },

      onEvent: (eventType: string, callback: () => void) => {
        console.log(`📱 Подписка на событие: ${eventType} (mock)`)
      },

      offEvent: (eventType: string, callback: () => void) => {
        console.log(`📱 Отписка от события: ${eventType} (mock)`)
      },

      // Главная кнопка
      MainButton: {
        text: '',
        color: '#00C8A8',
        textColor: '#ffffff',
        isVisible: false,
        isActive: true,
        isProgressVisible: false,
        setText: function(text: string) {
          this.text = text
          console.log(`📱 MainButton.setText(${text}) (mock)`)
        },
        show: function() {
          this.isVisible = true
          console.log('📱 MainButton.show() (mock)')
        },
        hide: function() {
          this.isVisible = false
          console.log('📱 MainButton.hide() (mock)')
        },
        enable: function() {
          this.isActive = true
          console.log('📱 MainButton.enable() (mock)')
        },
        disable: function() {
          this.isActive = false
          console.log('📱 MainButton.disable() (mock)')
        },
        showProgress: function(leaveActive = false) {
          this.isProgressVisible = true
          if (!leaveActive) this.isActive = false
          console.log('📱 MainButton.showProgress() (mock)')
        },
        hideProgress: function() {
          this.isProgressVisible = false
          this.isActive = true
          console.log('📱 MainButton.hideProgress() (mock)')
        },
        setParams: function(params: any) {
          Object.assign(this, params)
          console.log('📱 MainButton.setParams() (mock)', params)
        },
        onClick: function(callback: () => void) {
          console.log('📱 MainButton.onClick() подключен (mock)')
        },
        offClick: function(callback: () => void) {
          console.log('📱 MainButton.offClick() отключен (mock)')
        }
      },

      // Кнопка назад
      BackButton: {
        isVisible: false,
        show: function() {
          this.isVisible = true
          console.log('📱 BackButton.show() (mock)')
        },
        hide: function() {
          this.isVisible = false
          console.log('📱 BackButton.hide() (mock)')
        },
        onClick: function(callback: () => void) {
          console.log('📱 BackButton.onClick() подключен (mock)')
        },
        offClick: function(callback: () => void) {
          console.log('📱 BackButton.offClick() отключен (mock)')
        }
      },

      // Настройки кнопка
      SettingsButton: {
        isVisible: false,
        show: function() {
          this.isVisible = true
          console.log('📱 SettingsButton.show() (mock)')
        },
        hide: function() {
          this.isVisible = false
          console.log('📱 SettingsButton.hide() (mock)')
        },
        onClick: function(callback: () => void) {
          console.log('📱 SettingsButton.onClick() подключен (mock)')
        },
        offClick: function(callback: () => void) {
          console.log('📱 SettingsButton.offClick() отключен (mock)')
        }
      },

      // Cloud Storage (Telegram облачное хранилище)
      CloudStorage: {
        setItem: (key: string, value: string, callback?: (error: string | null, success: boolean) => void) => {
          try {
            localStorage.setItem(`tg_cloud_${key}`, value)
            console.log(`☁️ CloudStorage.setItem(${key}) (mock)`)
            callback?.(null, true)
          } catch (error) {
            callback?.(error as string, false)
          }
        },
        getItem: (key: string, callback: (error: string | null, value: string | null) => void) => {
          try {
            const value = localStorage.getItem(`tg_cloud_${key}`)
            console.log(`☁️ CloudStorage.getItem(${key}) (mock)`)
            callback(null, value)
          } catch (error) {
            callback(error as string, null)
          }
        },
        getItems: (keys: string[], callback: (error: string | null, values: Record<string, string>) => void) => {
          try {
            const values: Record<string, string> = {}
            keys.forEach(key => {
              const value = localStorage.getItem(`tg_cloud_${key}`)
              if (value !== null) values[key] = value
            })
            console.log(`☁️ CloudStorage.getItems() (mock)`)
            callback(null, values)
          } catch (error) {
            callback(error as string, {})
          }
        },
        removeItem: (key: string, callback?: (error: string | null, success: boolean) => void) => {
          try {
            localStorage.removeItem(`tg_cloud_${key}`)
            console.log(`☁️ CloudStorage.removeItem(${key}) (mock)`)
            callback?.(null, true)
          } catch (error) {
            callback?.(error as string, false)
          }
        },
        removeItems: (keys: string[], callback?: (error: string | null, success: boolean) => void) => {
          try {
            keys.forEach(key => localStorage.removeItem(`tg_cloud_${key}`))
            console.log(`☁️ CloudStorage.removeItems() (mock)`)
            callback?.(null, true)
          } catch (error) {
            callback?.(error as string, false)
          }
        },
        getKeys: (callback: (error: string | null, keys: string[]) => void) => {
          try {
            const keys = Object.keys(localStorage)
              .filter(key => key.startsWith('tg_cloud_'))
              .map(key => key.replace('tg_cloud_', ''))
            console.log(`☁️ CloudStorage.getKeys() (mock)`)
            callback(null, keys)
          } catch (error) {
            callback(error as string, [])
          }
        }
      }
    }

    // Устанавливаем mock в window
    ;(window as any).Telegram = {
      WebApp: mockWebApp
    }

    console.log('🔧 Telegram WebApp Mock Environment инициализирован')
    console.log('📱 Доступные mock методы:', Object.keys(mockWebApp))

  }, [])

  return null
}