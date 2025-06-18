"use client"

import React, { type ReactNode } from "react"
import TelegramSticker from "@/components/ui/telegram-sticker"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Telegram Mini App Error:', error)
    console.error('🚨 Error Info:', errorInfo)
    
    // ✅ Исправлено: добавлена проверка на существование window.Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.sendData(JSON.stringify({
          type: 'error',
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        }))
        console.log('✅ Ошибка отправлена в Telegram')
      } catch (e) {
        console.error('❌ Не удалось отправить ошибку в Telegram:', e)
      }
    } else {
      console.warn('⚠️ Telegram WebApp недоступен для отправки ошибки')
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-neutral-900 p-6">
          <div className="max-w-md text-center space-y-6">
            {/* Грустный утёнок */}
            <div className="flex justify-center">
              <TelegramSticker sticker="DUCK_RAIN" size={120} />
            </div>

            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                Упс! Что-то пошло не так
              </h1>
              
              <p className="text-neutral-600 dark:text-neutral-400">
                Произошла неожиданная ошибка в приложении. Попробуйте перезагрузить или обратитесь к разработчику.
              </p>

              {/* Показываем ошибку в dev режиме */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <summary className="cursor-pointer text-red-600 dark:text-red-400 font-medium text-sm">
                    Детали ошибки (dev)
                  </summary>
                  <div className="mt-2 text-xs font-mono text-red-700 dark:text-red-300 whitespace-pre-wrap">
                    <div className="font-bold">Message:</div>
                    <div className="mb-2">{this.state.error.message}</div>
                    
                    <div className="font-bold">Stack:</div>
                    <div>{this.state.error.stack}</div>
                  </div>
                </details>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-6 py-3 bg-avito-primary text-white rounded-xl font-medium hover:bg-avito-primary/90 transition-colors"
              >
                Попробовать снова
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 border-2 border-avito-primary text-avito-primary rounded-xl font-medium hover:bg-avito-primary/5 transition-colors"
              >
                Перезагрузить приложение
              </button>

              {/* ✅ Исправлено: добавлена проверка на существование window.Telegram */}
              {typeof window !== 'undefined' && window.Telegram?.WebApp && (
                <button
                  onClick={() => {
                    try {
                      window.Telegram?.WebApp?.close()
                    } catch (error) {
                      console.error('Ошибка закрытия приложения:', error)
                    }
                  }}
                  className="w-full px-6 py-3 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors text-sm"
                >
                  Закрыть приложение
                </button>
              )}
            </div>

            {/* Информация для пользователя */}
            <div className="text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <p>Если проблема повторяется, попробуйте:</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>• Обновить Telegram до последней версии</li>
                <li>• Очистить кэш браузера</li>
                <li>• Перезапустить Telegram</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Хук для программного вызова ошибки (для тестирования)
 */
export function useErrorHandler() {
  return (error: Error) => {
    throw error
  }
}

/**
 * Functional компонент Error Boundary для использования с хуками
 */
export function ErrorBoundaryWrapper({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}