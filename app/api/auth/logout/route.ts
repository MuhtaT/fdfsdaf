import { NextRequest, NextResponse } from 'next/server'
import { invalidateSession, invalidateAllUserSessions, validateSession } from '@/lib/services/session-service'

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, logoutAll = false } = await request.json()

    if (!sessionToken) {
      return NextResponse.json(
        { error: true, message: 'Отсутствует токен сессии' },
        { status: 400 }
      )
    }

    if (logoutAll) {
      // Деактивируем все сессии пользователя
      // Сначала получаем информацию о сессии для получения userId
      const sessionWithUser = await validateSession(sessionToken)
      if (sessionWithUser) {
        await invalidateAllUserSessions(sessionWithUser.user.id)
      } else {
        // Если сессия уже недействительна, просто деактивируем её
        await invalidateSession(sessionToken)
      }
    } else {
      // Деактивируем только текущую сессию
      await invalidateSession(sessionToken)
    }

    return NextResponse.json({
      success: true,
      message: logoutAll ? 'Выход из всех устройств выполнен' : 'Выход выполнен'
    })

  } catch (error) {
    console.error('Ошибка выхода из системы:', error)
    return NextResponse.json(
      { error: true, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 