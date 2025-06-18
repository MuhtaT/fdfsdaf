"use client"

import { type PropsWithChildren, useEffect, useState } from "react"
import { init, miniApp, themeParams, viewport } from "@telegram-apps/sdk-react"
import { TelegramMockEnv } from "./TelegramMockEnv"
import { ErrorBoundary } from "./ErrorBoundary"

/**
 * Props для TelegramProvider
 */
interface TelegramProviderProps extends PropsWithChildren {
  /**
   * Показывать ли mock для разработки вне Telegram
   * @default true в development режиме
   */
  enableMock?: boolean
}

/**
 * Компонент инициализации Telegram SDK
 */
function TelegramSDKInitializer({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeTelegramApp = async () => {
      try {
        console.log('🚀 Инициализируем Telegram SDK v3.x...')
        
        // ✅ Инициализируем SDK (теперь синхронная функция)
        init()
        console.log('✅ SDK инициализирован')

        // ✅ Монтируем компоненты с проверкой доступности
        try {
          if (miniApp.mountSync && miniApp.mountSync.isAvailable()) {
            miniApp.mountSync()
            console.log('✅ MiniApp смонтирован (sync)')
          } else if (miniApp.mount && miniApp.mount.isAvailable()) {
            await miniApp.mount()
            console.log('✅ MiniApp смонтирован (async)')
          }
        } catch (error) {
          console.warn('⚠️ MiniApp монтирование не удалось:', error)
        }

        try {
          if (themeParams.mountSync && themeParams.mountSync.isAvailable()) {
            themeParams.mountSync()
            console.log('✅ ThemeParams смонтированы (sync)')
          } else if (themeParams.mount && themeParams.mount.isAvailable()) {
            await themeParams.mount()
            console.log('✅ ThemeParams смонтированы (async)')
          }
        } catch (error) {
          console.warn('⚠️ ThemeParams монтирование не удалось:', error)
        }

        try {
          if (viewport.mount && viewport.mount.isAvailable()) {
            viewport.mount()
            console.log('✅ Viewport смонтирован')
          }
        } catch (error) {
          console.warn('⚠️ Viewport монтирование не удалось:', error)
        }

        setIsInitialized(true)

        // ✅ Настраиваем приложение
        if (miniApp && miniApp.isMounted()) {
          try {
            // Уведомляем Telegram что приложение готово
            if (miniApp.ready && miniApp.ready.isAvailable()) {
              miniApp.ready()
              console.log('✅ MiniApp готов')
            }

            // ✅ Настраиваем цвета из темы
            const bgColor = themeParams.backgroundColor ? themeParams.backgroundColor() : undefined
            const headerBgColor = themeParams.headerBackgroundColor ? themeParams.headerBackgroundColor() : undefined

            // Устанавливаем цвета если доступны методы
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
              const webApp = window.Telegram.WebApp
              try {
                if (bgColor) {
                  webApp.setBackgroundColor(bgColor)
                  console.log('✅ Цвет фона установлен:', bgColor)
                }
                if (headerBgColor) {
                  webApp.setHeaderColor(headerBgColor)
                  console.log('✅ Цвет хедера установлен:', headerBgColor)
                }
                
                // Включаем подтверждение закрытия
                webApp.enableClosingConfirmation()
                console.log('✅ Подтверждение закрытия включено')
              } catch (error) {
                console.warn('⚠️ Ошибка настройки цветов через WebApp:', error)
              }
            }

            console.log('✅ Telegram Mini App успешно настроен')
          } catch (error) {
            console.warn('⚠️ Ошибка настройки MiniApp:', error)
          }
        }

        // ✅ Расширяем viewport если возможно
        if (viewport && viewport.isMounted()) {
          try {
            if (viewport.expand && viewport.expand.isAvailable()) {
              viewport.expand()
              console.log('✅ Viewport расширен')
            }
          } catch (error) {
            console.warn('⚠️ Не удалось расширить viewport:', error)
          }
        }

        setIsReady(true)
      } catch (error) {
        console.error('❌ Ошибка инициализации Telegram SDK:', error)
        setIsReady(true) // Все равно показываем приложение
      }
    }

    initializeTelegramApp()
  }, [])

  if (!isReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-neutral-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Инициализация Telegram Mini App...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Главный провайдер для Telegram Mini App
 */
export function TelegramProvider({ children, enableMock }: TelegramProviderProps) {
  const [shouldShowMock, setShouldShowMock] = useState(false)

  useEffect(() => {
    // ✅ ИСПРАВЛЕНО: принудительное преобразование в boolean
    const isInTelegram = typeof window !== 'undefined' && 
      !!(window.Telegram?.WebApp || 
         window.parent !== window || 
         window.location.search.includes('tgWebAppData'))

    console.log('🔍 Проверка окружения:', {
      isInTelegram,
      hasTelegramWebApp: !!(typeof window !== 'undefined' && window.Telegram?.WebApp),
      isInIframe: typeof window !== 'undefined' && window.parent !== window,
      hasInitData: typeof window !== 'undefined' && window.location.search.includes('tgWebAppData'),
      enableMock,
      isDevelopment: process.env.NODE_ENV === 'development'
    })

    // Показываем mock только если не в Telegram и включен enableMock
    if (!isInTelegram && (enableMock ?? process.env.NODE_ENV === 'development')) {
      console.log('🔧 Запуск в режиме разработки с Telegram mock')
      setShouldShowMock(true)
    } else {
      setShouldShowMock(false)
    }
  }, [enableMock])

  return (
    <ErrorBoundary>
      {shouldShowMock && <TelegramMockEnv />}
      
      <TelegramSDKInitializer>
        {children}
      </TelegramSDKInitializer>
    </ErrorBoundary>
  )
}

/**
 * Хук для проверки, запущено ли приложение в Telegram
 */
export function useIsTelegramEnvironment(): boolean {
  const [isInTelegram, setIsInTelegram] = useState(false)

  useEffect(() => {
    const checkEnvironment = () => {
      // ✅ ИСПРАВЛЕНО: принудительное преобразование в boolean
      const result = typeof window !== 'undefined' && 
        !!(window.Telegram?.WebApp || 
           window.parent !== window || 
           window.location.search.includes('tgWebAppData'))
      
      console.log('🔍 Telegram environment check:', {
        result,
        hasTelegramWebApp: !!(typeof window !== 'undefined' && window.Telegram?.WebApp),
        isInIframe: typeof window !== 'undefined' && window.parent !== window,
        hasInitData: typeof window !== 'undefined' && window.location.search.includes('tgWebAppData')
      })
      
      return result
    }

    setIsInTelegram(checkEnvironment())
  }, [])

  return isInTelegram
}

/**
 * Хук для получения статуса инициализации SDK компонентов
 */
export function useTelegramSDKStatus() {
  const [status, setStatus] = useState({
    miniAppMounted: false,
    themeParamsMounted: false,
    viewportMounted: false,
  })

  useEffect(() => {
    const checkStatus = () => {
      setStatus({
        miniAppMounted: miniApp.isMounted(),
        themeParamsMounted: themeParams.isMounted(),
        viewportMounted: viewport.isMounted(),
      })
    }

    // Проверяем статус каждые 100ms пока все не смонтируется
    const interval = setInterval(() => {
      checkStatus()
      
      // Останавливаем проверку когда все смонтировано
      if (miniApp.isMounted() && themeParams.isMounted() && viewport.isMounted()) {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return status
}