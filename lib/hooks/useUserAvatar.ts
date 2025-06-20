'use client'

import { useState, useEffect, useCallback } from 'react'
import { generateInitialsAvatar } from '@/lib/utils/telegram-avatar'

interface AvatarState {
  avatarUrl: string
  type: 'telegram' | 'initials' | 'loading'
  isLoading: boolean
  error: string | null
}

/**
 * Хук для получения аватарки пользователя
 */
export function useUserAvatar(
  sessionToken: string | null,
  firstName?: string,
  lastName?: string,
  username?: string,
  telegramId?: string
) {
  const [avatarState, setAvatarState] = useState<AvatarState>({
    avatarUrl: generateInitialsAvatar(firstName, lastName, username),
    type: 'loading',
    isLoading: true,
    error: null
  })

  const fetchAvatar = useCallback(async () => {
    if (!sessionToken) {
      // Если нет токена сессии, используем аватарку с инициалами
      setAvatarState({
        avatarUrl: generateInitialsAvatar(firstName, lastName, username),
        type: 'initials',
        isLoading: false,
        error: null
      })
      return
    }

    try {
      setAvatarState(prev => ({ ...prev, isLoading: true, error: null }))

      const params = new URLSearchParams()
      if (telegramId) {
        params.append('telegramId', telegramId)
      }

      const response = await fetch(`/api/user/avatar?${params}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Не удалось получить аватарку')
      }

      const data = await response.json()

      if (data.success) {
        setAvatarState({
          avatarUrl: data.avatarUrl,
          type: data.type,
          isLoading: false,
          error: null
        })
      } else {
        throw new Error(data.message || 'Ошибка получения аватарки')
      }

    } catch (error) {
      console.warn('Ошибка загрузки аватарки, используем инициалы:', error)
      
      // В случае ошибки используем аватарку с инициалами
      setAvatarState({
        avatarUrl: generateInitialsAvatar(firstName, lastName, username),
        type: 'initials',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      })
    }
  }, [sessionToken, firstName, lastName, username, telegramId])

  useEffect(() => {
    fetchAvatar()
  }, [fetchAvatar])

  return {
    ...avatarState,
    refetch: fetchAvatar
  }
} 