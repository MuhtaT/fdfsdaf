'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuthWithPassword } from '@/lib/hooks/useAuthWithPassword'
import LoadingScreen from '@/components/ui/loading-screen'
import ErrorScreen from '@/components/ui/error-screen'
import WelcomeScreen from '@/components/ui/welcome-screen'
import PasswordSetup from '@/components/auth/PasswordSetup'
import PasswordInput from '@/components/auth/PasswordInput'
import type { User } from '@/lib/generated/prisma'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderWithPasswordProps {
  children: ReactNode
}

export function AuthProviderWithPassword({ children }: AuthProviderWithPasswordProps) {
  const auth = useAuthWithPassword()

  // Показываем экран загрузки во время инициализации
  if (auth.isLoading) {
    return (
      <LoadingScreen 
        title="Инициализация..."
        subtitle="Подготавливаем приложение"
      />
    )
  }

  // Показываем welcome screen при первом запуске
  if (auth.showWelcome) {
    return (
      <WelcomeScreen 
        onComplete={auth.completeWelcome}
      />
    )
  }

  // Показываем экран установки пароля
  if (auth.needsPasswordSetup && !auth.isAuthenticated) {
    return (
      <PasswordSetup
        onPasswordSet={auth.setupPassword}
        isLoading={auth.isLoading}
      />
    )
  }

  // Показываем экран ввода пароля
  if (auth.needsPasswordInput) {
    return (
      <PasswordInput
        onPasswordSubmit={auth.loginWithPassword}
        isLoading={auth.isLoading}
        error={auth.error}
        attempts={auth.passwordAttempts}
      />
    )
  }

  // Показываем экран ошибки только для критических ошибок
  if (auth.error && !auth.needsPasswordInput && !auth.needsPasswordSetup && !auth.showWelcome) {
    return (
      <ErrorScreen
        title="Ошибка приложения"
        subtitle={auth.error}
        buttonText="Перезапустить"
        onButtonClick={() => window.location.reload()}
      />
    )
  }

  // Если пользователь не аутентифицирован, но нет флагов для экранов
  if (!auth.isAuthenticated) {
    return (
      <LoadingScreen 
        title="Загрузка..."
        subtitle="Подготавливаем данные"
      />
    )
  }

  // Основной контент для аутентифицированных пользователей
  return (
    <AuthContext.Provider value={{
      user: auth.user,
      isLoading: auth.isLoading,
      isAuthenticated: auth.isAuthenticated,
      error: auth.error,
      logout: auth.logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext должен использоваться внутри AuthProviderWithPassword')
  }
  return context
} 