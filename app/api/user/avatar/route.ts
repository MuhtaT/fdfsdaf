import { NextRequest, NextResponse } from 'next/server'
import { getTelegramUserAvatar, generateInitialsAvatar } from '@/lib/utils/telegram-avatar'
import { validateSession } from '@/lib/services/session-service'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '')
    const telegramId = request.nextUrl.searchParams.get('telegramId')

    if (!sessionToken) {
      return NextResponse.json(
        { error: true, message: 'Отсутствует токен сессии' },
        { status: 401 }
      )
    }

    // Валидация сессии
    const sessionWithUser = await validateSession(sessionToken)
    if (!sessionWithUser) {
      return NextResponse.json(
        { error: true, message: 'Сессия недействительна' },
        { status: 401 }
      )
    }

    // Используем telegramId из параметров или из сессии
    const targetTelegramId = telegramId || sessionWithUser.user.telegramId

    try {
      // Пытаемся получить аватарку через Telegram API
      const telegramAvatar = await getTelegramUserAvatar(targetTelegramId)
      
      if (telegramAvatar) {
        return NextResponse.json({
          success: true,
          avatarUrl: telegramAvatar,
          type: 'telegram'
        })
      }

      // Если нет аватарки в Telegram, генерируем аватарку с инициалами
      const initialsAvatar = generateInitialsAvatar(
        sessionWithUser.user.firstName || undefined,
        sessionWithUser.user.lastName || undefined,
        sessionWithUser.user.username || undefined
      )

      return NextResponse.json({
        success: true,
        avatarUrl: initialsAvatar,
        type: 'initials'
      })

    } catch (avatarError) {
      console.warn('Ошибка получения аватарки, используем инициалы:', avatarError)
      
      // В случае ошибки всегда возвращаем аватарку с инициалами
      const initialsAvatar = generateInitialsAvatar(
        sessionWithUser.user.firstName || undefined,
        sessionWithUser.user.lastName || undefined,
        sessionWithUser.user.username || undefined
      )

      return NextResponse.json({
        success: true,
        avatarUrl: initialsAvatar,
        type: 'initials'
      })
    }

  } catch (error) {
    console.error('Ошибка получения аватарки пользователя:', error)
    return NextResponse.json(
      { error: true, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 