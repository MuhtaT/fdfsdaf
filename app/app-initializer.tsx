"use client"

import { useEffect, useState } from "react"
import WelcomeScreen from "@/components/ui/welcome-screen"
import { useTelegram, useTelegramCloudStorage, useTelegramAuth } from "@/hooks/useTelegram"
import { useThemeStore } from "@/stores/useThemeStore"

export function AppInitializer() {
  const [showWelcome, setShowWelcome] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const { user, isReady } = useTelegram()
  const { getItem, setItem } = useTelegramCloudStorage()
  const { isAuthenticated } = useTelegramAuth()
  const { isInTelegram, syncWithTelegramTheme } = useThemeStore()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Ждем готовности Telegram
        if (isInTelegram && !isReady) {
          return
        }

        // Инициализируем тему
        syncWithTelegramTheme()

        // Проверяем, показывали ли уже welcome screen
        let hasSeenWelcome = false

        if (isInTelegram && user) {
          // В Telegram используем Cloud Storage
          try {
            const cloudData = await getItem('hasSeenWelcome')
            hasSeenWelcome = cloudData === 'true'
          } catch (error) {
            console.warn('Не удалось загрузить данные из Cloud Storage:', error)
            // Fallback на localStorage
            hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true'
          }
        } else {
          // Вне Telegram используем localStorage
          hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true'
        }

        console.log('🚀 Инициализация приложения:', {
          isInTelegram,
          user: user ? `${user.first_name} (${user.id})` : null,
          hasSeenWelcome,
          isAuthenticated
        })

        if (!hasSeenWelcome) {
          setShowWelcome(true)
        }

      } catch (error) {
        console.error('❌ Ошибка инициализации приложения:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [isReady, isInTelegram, user, isAuthenticated, getItem, syncWithTelegramTheme])

  const handleWelcomeComplete = async () => {
    try {
      if (isInTelegram && user) {
        // Сохраняем в Telegram Cloud Storage
        try {
          await setItem('hasSeenWelcome', 'true')
          console.log('✅ Сохранено в Telegram Cloud Storage')
        } catch (error) {
          console.warn('Не удалось сохранить в Cloud Storage, используем localStorage:', error)
          localStorage.setItem('hasSeenWelcome', 'true')
        }
      } else {
        // Сохраняем в localStorage
        localStorage.setItem('hasSeenWelcome', 'true')
      }

      setShowWelcome(false)
    } catch (error) {
      console.error('❌ Ошибка сохранения welcome состояния:', error)
      setShowWelcome(false)
    }
  }

  // Показываем загрузку пока инициализируемся
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-tg-primary">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading-spinner w-8 h-8"></div>
          <p className="text-sm text-tg-hint">
            {isInTelegram ? 'Подключение к Telegram...' : 'Загрузка приложения...'}
          </p>
        </div>
      </div>
    )
  }

  // Показываем welcome screen
  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />
  }

  // Показываем предупреждение если не в Telegram (только в production)
  if (!isInTelegram && process.env.NODE_ENV === 'production') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-neutral-900 p-6">
        <div className="max-w-md text-center space-y-6">
          <div className="text-6xl">🚀</div>
          
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
              Telegram Mini App
            </h1>
            
            <p className="text-neutral-600 dark:text-neutral-400">
              Это приложение предназначено для работы внутри Telegram. 
              Пожалуйста, откройте его через бота в Telegram.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.open('https://t.me/your_bot_username', '_blank')}
              className="w-full tg-button py-3"
            >
              Открыть в Telegram
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Показываем development режим если не в Telegram
  if (!isInTelegram && process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-neutral-900 p-6">
        <div className="max-w-md text-center space-y-6">
          <div className="text-6xl">🧪</div>
          
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
              Development Mode
            </h1>
            
            <p className="text-neutral-600 dark:text-neutral-400">
              Приложение запущено в режиме разработки вне Telegram. 
              Некоторые функции могут работать ограниченно.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.open('https://t.me/your_bot_username', '_blank')}
              className="w-full tg-button py-3"
            >
              Открыть в Telegram
            </button>

            <button
              onClick={() => setShowWelcome(false)}
              className="w-full text-sm text-neutral-500 hover:text-neutral-700 transition-colors border border-neutral-300 rounded-lg py-2"
            >
              Продолжить как веб-приложение
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Приложение готово
  return null
}

/**
 * Компонент для отображения информации о пользователе Telegram
 */
export function TelegramUserInfo() {
  const { user, isReady } = useTelegram()
  const { isInTelegram } = useThemeStore()

  if (!isInTelegram || !isReady || !user) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs">
      <div className="font-semibold mb-1">Telegram User:</div>
      <div>ID: {user.id}</div>
      <div>Name: {user.first_name} {user.last_name || ''}</div>
      {user.username && <div>@{user.username}</div>}
      <div>Lang: {user.language_code || 'unknown'}</div>
      {user.is_premium && <div className="text-yellow-400">⭐ Premium</div>}
    </div>
  )
}

/**
 * Хук для получения состояния инициализации приложения
 */
export function useAppInitialization() {
  const { isReady } = useTelegram()
  const { isInitialized, isInTelegram } = useThemeStore()
  
  return {
    isAppReady: isReady && isInitialized,
    isInTelegram,
    needsTelegramConnection: !isInTelegram && process.env.NODE_ENV === 'production',
  }
}