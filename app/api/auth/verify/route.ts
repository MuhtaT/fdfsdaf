import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/services/session-service'
import { updateUserLastActive } from '@/lib/services/user-service'

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, userId } = await request.json()

    if (!sessionToken) {
      return NextResponse.json(
        { error: true, message: 'Отсутствует токен сессии' },
        { status: 400 }
      )
    }

    // Валидация сессии через базу данных
    const sessionWithUser = await validateSession(sessionToken)
    
    if (!sessionWithUser) {
      return NextResponse.json(
        { error: true, message: 'Сессия недействительна или истекла' },
        { status: 401 }
      )
    }

    // Дополнительная проверка userId если передан
    if (userId && sessionWithUser.user.id !== userId) {
      return NextResponse.json(
        { error: true, message: 'Несоответствие пользователя' },
        { status: 403 }
      )
    }

    // Обновляем время последней активности пользователя
    await updateUserLastActive(sessionWithUser.user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: sessionWithUser.user.id,
        telegramId: sessionWithUser.user.telegramId,
        firstName: sessionWithUser.user.firstName,
        lastName: sessionWithUser.user.lastName,
        username: sessionWithUser.user.username,
        photoUrl: sessionWithUser.user.photoUrl,
        isPremium: sessionWithUser.user.isPremium,
        createdAt: sessionWithUser.user.createdAt,
        lastActiveAt: new Date()
      },
      session: {
        id: sessionWithUser.id,
        expiresAt: sessionWithUser.expiresAt,
        lastActiveAt: sessionWithUser.lastActiveAt
      }
    })

  } catch (error) {
    console.error('Ошибка проверки сессии:', error)
    return NextResponse.json(
      { error: true, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 