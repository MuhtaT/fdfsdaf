"use client"

import { useState } from "react"
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react"
import TelegramSticker from "@/components/ui/telegram-sticker"

interface PasswordInputProps {
  onPasswordSubmit: (password: string) => void
  isLoading?: boolean
  error?: string | null
  attempts?: number
}

export default function PasswordInput({ 
  onPasswordSubmit, 
  isLoading = false, 
  error = null,
  attempts = 0 
}: PasswordInputProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = () => {
    if (password.trim()) {
      onPasswordSubmit(password)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password.trim()) {
      handleSubmit()
    }
  }

  const maxAttempts = 3
  const remainingAttempts = maxAttempts - attempts

  return (
    <div className="h-screen max-h-screen overflow-y-auto bg-tg-primary">
      <div className="min-h-screen flex flex-col items-center justify-center z-50 p-6">
        {/* Стикер */}
        <div className="mb-8">
          <TelegramSticker 
            sticker={error ? "DUCK_RAIN" : "DUCK_WAVE"} 
            size={150} 
          />
        </div>

        {/* Заголовок */}
        <div className="text-center mb-8 max-w-sm">
          <h1 className="font-display text-3xl text-tg-primary mb-4">
            {error ? "Неверный пароль" : "Добро пожаловать!"}
          </h1>
          <p className="text-tg-hint leading-relaxed">
            {error 
              ? "Попробуйте еще раз. Введите пароль для доступа к приложению."
              : "Введите пароль для доступа к вашим зашифрованным данным."
            }
          </p>
        </div>

        {/* Форма */}
        <div className="w-full max-w-sm space-y-4 mb-6">
          {/* Поле пароля */}
          <div className="relative">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-tg-hint" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Введите пароль"
                className={`tg-input w-full pl-12 pr-12 py-4 text-lg ${
                  error ? 'border-red-500 dark:border-red-400' : ''
                }`}
                disabled={isLoading}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-tg-hint hover:text-tg-primary transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-start">
              <AlertCircle className="w-5 h-5 text-tg-destructive mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-tg-destructive text-sm font-medium">
                  {error}
                </p>
                {attempts > 0 && remainingAttempts > 0 && (
                  <p className="text-tg-hint text-xs mt-1">
                    Осталось попыток: {remainingAttempts}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Предупреждение о блокировке */}
          {attempts >= maxAttempts - 1 && attempts < maxAttempts && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3">
              <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                ⚠️ Последняя попытка
              </p>
              <p className="text-tg-hint text-xs mt-1">
                После неудачного ввода потребуется повторная настройка пароля
              </p>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={handleSubmit}
            disabled={!password.trim() || isLoading}
            className={`w-full py-4 text-lg font-medium rounded-xl transition-all duration-200 ${
              password.trim() && !isLoading
                ? "tg-button haptic-medium"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner mr-2" />
                Проверка...
              </div>
            ) : (
              "Войти"
            )}
          </button>

          {/* Кнопка сброса пароля (появляется после нескольких неудачных попыток) */}
          {attempts >= 2 && (
            <button
              onClick={() => {
                // Здесь будет логика сброса пароля
                console.log("Reset password")
              }}
              disabled={isLoading}
              className="w-full py-3 text-base font-medium rounded-xl tg-secondary-button"
            >
              Забыли пароль?
            </button>
          )}
        </div>

        {/* Информация о безопасности */}
        <div className="mt-8 text-center max-w-xs">
          <p className="text-tg-hint text-xs leading-relaxed">
            Сессия действительна 24 часа с момента последнего входа
          </p>
        </div>
      </div>
    </div>
  )
} 