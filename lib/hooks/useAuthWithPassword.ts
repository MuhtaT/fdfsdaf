'use client'

import { useState, useEffect, useCallback } from 'react'
import crypto from 'crypto'
import { cloudStorage, retrieveLaunchParams } from '@telegram-apps/sdk-react'
import { encryptData, decryptData, generateSalt, validatePasswordStrength } from '@/lib/utils/encryption'
import type { User } from '../generated/prisma'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  needsPasswordSetup: boolean
  needsPasswordInput: boolean
  passwordAttempts: number
}

interface EncryptedSessionData {
  userId: number
  telegramId: string
  sessionToken: string
  expiresAt: number
  userHash: string // Хеш основных данных пользователя для проверки целостности
}

interface StoredSessionData {
  encrypted: string
  salt: string
  iv: string
  lastActiveAt: number
}

const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 часа
const MAX_PASSWORD_ATTEMPTS = 3

export function useAuthWithPassword() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    needsPasswordSetup: false,
    needsPasswordInput: false,
    passwordAttempts: 0
  })

  const [showWelcome, setShowWelcome] = useState(false)

  // Проверка наличия сохраненной сессии
  const checkStoredSession = useCallback(async (): Promise<StoredSessionData | null> => {
    try {
      if (cloudStorage.getItem.isAvailable()) {
        const sessionString = await cloudStorage.getItem('encrypted_session')
        if (!sessionString) return null
        
        const sessionData: StoredSessionData = JSON.parse(sessionString)
        
        // Проверяем, не истекла ли сессия (24 часа с последней активности)
        if (Date.now() - sessionData.lastActiveAt > SESSION_DURATION) {
          if (cloudStorage.deleteItem.isAvailable()) {
            await cloudStorage.deleteItem('encrypted_session')
          }
          return null
        }
        
        return sessionData
      }
      return null
    } catch (error) {
      console.error('Ошибка проверки сохраненной сессии:', error)
      return null
    }
  }, [])

  // Сохранение зашифрованной сессии
  const saveEncryptedSession = useCallback(async (
    sessionData: EncryptedSessionData,
    password: string
  ): Promise<boolean> => {
    try {
      const dataToEncrypt = JSON.stringify(sessionData)
      const { encrypted, salt, iv } = encryptData(dataToEncrypt, password)
      
      const storedData: StoredSessionData = {
        encrypted,
        salt,
        iv,
        lastActiveAt: Date.now()
      }

      if (cloudStorage.setItem.isAvailable()) {
        await cloudStorage.setItem('encrypted_session', JSON.stringify(storedData))
        return true
      }
      return false
    } catch (error) {
      console.error('Ошибка сохранения зашифрованной сессии:', error)
      return false
    }
  }, [])

  // Расшифровка сессии
  const decryptSession = useCallback(async (
    storedData: StoredSessionData,
    password: string
  ): Promise<EncryptedSessionData | null> => {
    try {
      const decryptedString = decryptData(
        storedData.encrypted,
        password,
        storedData.salt,
        storedData.iv
      )
      
      if (!decryptedString) return null
      
      return JSON.parse(decryptedString) as EncryptedSessionData
    } catch (error) {
      console.error('Ошибка расшифровки сессии:', error)
      return null
    }
  }, [])

  // Очистка сессии
  const clearSession = useCallback(async () => {
    try {
      if (cloudStorage.deleteItem.isAvailable()) {
        await cloudStorage.deleteItem('encrypted_session')
        await cloudStorage.deleteItem('password_attempts')
      }
    } catch (error) {
      console.error('Ошибка очистки сессии:', error)
    }
  }, [])

  // Получение количества попыток ввода пароля
  const getPasswordAttempts = useCallback(async (): Promise<number> => {
    try {
      if (cloudStorage.getItem.isAvailable()) {
        const attemptsString = await cloudStorage.getItem('password_attempts')
        return attemptsString ? parseInt(attemptsString) : 0
      }
      return 0
    } catch (error) {
      return 0
    }
  }, [])

  // Сохранение количества попыток
  const savePasswordAttempts = useCallback(async (attempts: number) => {
    try {
      if (cloudStorage.setItem.isAvailable()) {
        await cloudStorage.setItem('password_attempts', attempts.toString())
      }
    } catch (error) {
      console.error('Ошибка сохранения попыток:', error)
    }
  }, [])

  // Аутентификация через Telegram
  const authenticateWithTelegram = useCallback(async (): Promise<User | null> => {
    try {
      const launchParams = retrieveLaunchParams()
      if (!launchParams.initData || !launchParams.initDataRaw) {
        throw new Error('Нет данных инициализации Telegram')
      }

      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: launchParams.initDataRaw,
          startParam: launchParams.startParam
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Ошибка аутентификации')
      }

      const { user } = await response.json()
      return user
    } catch (error) {
      console.error('Ошибка аутентификации с Telegram:', error)
      throw error
    }
  }, [])

  // Установка пароля (первый вход)
  const setupPassword = useCallback(async (password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      // Валидация пароля
      const validation = validatePasswordStrength(password)
      if (!validation.isValid) {
        throw new Error(validation.errors[0])
      }

      // Аутентификация с Telegram
      const user = await authenticateWithTelegram()
      if (!user) {
        throw new Error('Не удалось получить данные пользователя')
      }

      // Создание зашифрованной сессии
      const sessionData: EncryptedSessionData = {
        userId: user.id,
        telegramId: user.telegramId,
        sessionToken: crypto.randomUUID(),
        expiresAt: Date.now() + SESSION_DURATION,
        userHash: crypto.createHash('sha256').update(JSON.stringify({
          id: user.id,
          telegramId: user.telegramId
        })).digest('hex')
      }

      const saved = await saveEncryptedSession(sessionData, password)
      if (!saved) {
        throw new Error('Не удалось сохранить сессию')
      }

      // Сброс попыток ввода пароля
      await savePasswordAttempts(0)

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
        needsPasswordSetup: false,
        needsPasswordInput: false,
        passwordAttempts: 0
      })

    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      }))
    }
  }, [authenticateWithTelegram, saveEncryptedSession, savePasswordAttempts])

  // Вход с паролем
  const loginWithPassword = useCallback(async (password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const storedSession = await checkStoredSession()
      if (!storedSession) {
        throw new Error('Сессия не найдена')
      }

      const sessionData = await decryptSession(storedSession, password)
      if (!sessionData) {
        // Неверный пароль
        const attempts = await getPasswordAttempts()
        const newAttempts = attempts + 1
        
        if (newAttempts >= MAX_PASSWORD_ATTEMPTS) {
          // Превышено количество попыток - сбрасываем сессию
          await clearSession()
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
            needsPasswordSetup: true,
            needsPasswordInput: false,
            passwordAttempts: 0
          })
          return
        }

        await savePasswordAttempts(newAttempts)
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Неверный пароль',
          passwordAttempts: newAttempts
        }))
        return
      }

      // Проверяем актуальность сессии
      if (Date.now() > sessionData.expiresAt) {
        await clearSession()
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
          needsPasswordSetup: true,
          needsPasswordInput: false,
          passwordAttempts: 0
        })
        return
      }

      // Получаем актуальные данные пользователя
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken: sessionData.sessionToken,
          userId: sessionData.userId
        })
      })

      if (!response.ok) {
        await clearSession()
        throw new Error('Сессия недействительна')
      }

      const { user } = await response.json()

      // Обновляем время последней активности
      await saveEncryptedSession(sessionData, password)
      await savePasswordAttempts(0)

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
        needsPasswordSetup: false,
        needsPasswordInput: false,
        passwordAttempts: 0
      })

    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      }))
    }
  }, [checkStoredSession, decryptSession, getPasswordAttempts, savePasswordAttempts, clearSession, saveEncryptedSession])

  // Выход из системы
  const logout = useCallback(async () => {
    await clearSession()
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      needsPasswordSetup: true,
      needsPasswordInput: false,
      passwordAttempts: 0
    })
  }, [clearSession])

  // Инициализация при загрузке
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedSession = await checkStoredSession()
        const attempts = await getPasswordAttempts()

        // Проверяем, был ли показан welcome screen ранее
        const welcomeShown = cloudStorage.getItem.isAvailable() ? 
          await cloudStorage.getItem('welcome_shown') : null

        if (!storedSession) {
          // Нет сохраненной сессии
          if (!welcomeShown) {
            // Первый запуск - показываем welcome screen
            setShowWelcome(true)
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
              error: null,
              needsPasswordSetup: false,
              needsPasswordInput: false,
              passwordAttempts: 0
            })
          } else {
            // Welcome уже показывался - идем к настройке пароля
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
              error: null,
              needsPasswordSetup: true,
              needsPasswordInput: false,
              passwordAttempts: 0
            })
          }
        } else {
          // Есть сессия - нужен ввод пароля
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
            needsPasswordSetup: false,
            needsPasswordInput: true,
            passwordAttempts: attempts
          })
        }
      } catch (error) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: 'Ошибка инициализации',
          needsPasswordSetup: true,
          needsPasswordInput: false,
          passwordAttempts: 0
        })
      }
    }

    initAuth()
  }, [checkStoredSession, getPasswordAttempts])

  // Завершение welcome screen
  const completeWelcome = useCallback(async () => {
    try {
      if (cloudStorage.setItem.isAvailable()) {
        await cloudStorage.setItem('welcome_shown', 'true')
      }
      setShowWelcome(false)
      setAuthState(prev => ({
        ...prev,
        needsPasswordSetup: true
      }))
    } catch (error) {
      console.error('Ошибка сохранения состояния welcome:', error)
      setShowWelcome(false)
      setAuthState(prev => ({
        ...prev,
        needsPasswordSetup: true
      }))
    }
  }, [])

  return {
    ...authState,
    showWelcome,
    completeWelcome,
    setupPassword,
    loginWithPassword,
    logout
  }
} 