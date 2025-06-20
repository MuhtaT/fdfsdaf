"use client"

import { useState } from "react"
import { Eye, EyeOff, Lock, Shield } from "lucide-react"
import TelegramSticker from "@/components/ui/telegram-sticker"

interface PasswordSetupProps {
  onPasswordSet: (password: string) => void
  isLoading?: boolean
}

export default function PasswordSetup({ onPasswordSet, isLoading = false }: PasswordSetupProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = []
    
    if (pwd.length < 6) {
      errors.push("Пароль должен содержать минимум 6 символов")
    }
    if (!/[A-Za-z]/.test(pwd)) {
      errors.push("Пароль должен содержать буквы")
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push("Пароль должен содержать цифры")
    }
    
    return errors
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (value) {
      setErrors(validatePassword(value))
    } else {
      setErrors([])
    }
  }

  const handleSubmit = () => {
    const passwordErrors = validatePassword(password)
    
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors)
      return
    }
    
    if (password !== confirmPassword) {
      setErrors(["Пароли не совпадают"])
      return
    }
    
    onPasswordSet(password)
  }

  const isValid = password.length >= 6 && 
                 password === confirmPassword && 
                 validatePassword(password).length === 0

  return (
    <div className="h-screen max-h-screen overflow-y-auto bg-tg-primary">
      <div className="min-h-screen flex flex-col items-center justify-center z-50 p-6">
        {/* Стикер */}
        <div className="mb-8">
          <TelegramSticker sticker="DUCK_HEART" size={150} />
        </div>

        {/* Заголовок */}
        <div className="text-center mb-8 max-w-sm">
          <h1 className="font-display text-3xl text-tg-primary mb-4">
            Установите пароль
          </h1>
          <p className="text-tg-hint leading-relaxed">
            Создайте надежный пароль для защиты ваших данных. Он будет использоваться для шифрования вашей сессии.
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
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Введите пароль"
                className="tg-input w-full pl-12 pr-12 py-4 text-lg"
                disabled={isLoading}
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

          {/* Поле подтверждения пароля */}
          <div className="relative">
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-tg-hint" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Подтвердите пароль"
                className="tg-input w-full pl-12 pr-12 py-4 text-lg"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-tg-hint hover:text-tg-primary transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Список ошибок */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              {errors.map((error, index) => (
                <p key={index} className="text-tg-destructive text-sm">
                  • {error}
                </p>
              ))}
            </div>
          )}

          {/* Требования к паролю */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
            <p className="text-tg-hint text-sm font-medium mb-2">Требования к паролю:</p>
            <div className="space-y-1 text-xs">
              <p className={`flex items-center ${password.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-tg-hint'}`}>
                <span className="mr-2">{password.length >= 6 ? '✓' : '○'}</span>
                Минимум 6 символов
              </p>
              <p className={`flex items-center ${/[A-Za-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-tg-hint'}`}>
                <span className="mr-2">{/[A-Za-z]/.test(password) ? '✓' : '○'}</span>
                Содержит буквы
              </p>
              <p className={`flex items-center ${/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-tg-hint'}`}>
                <span className="mr-2">{/[0-9]/.test(password) ? '✓' : '○'}</span>
                Содержит цифры
              </p>
            </div>
          </div>
        </div>

        {/* Кнопка */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className={`w-full max-w-sm py-4 text-lg font-medium rounded-xl transition-all duration-200 ${
            isValid && !isLoading
              ? "tg-button haptic-medium"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="loading-spinner mr-2" />
              Настройка...
            </div>
          ) : (
            "Установить пароль"
          )}
        </button>

        {/* Информация о безопасности */}
        <div className="mt-8 text-center max-w-xs">
          <p className="text-tg-hint text-xs leading-relaxed">
            Ваш пароль будет использоваться только для шифрования данных локально и никогда не передается на сервер
          </p>
        </div>
      </div>
    </div>
  )
} 