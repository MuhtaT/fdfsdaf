import { NextRequest, NextResponse } from 'next/server'
import { validateSession, getUserActiveSessions, getUserSessionStats } from '@/lib/services/session-service'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!sessionToken) {
      return NextResponse.json(
        { error: true, message: 'Отсутствует токен сессии' },
        { status: 401 }
      )
    }

    // Валидация текущей сессии
    const currentSession = await validateSession(sessionToken)
    if (!currentSession) {
      return NextResponse.json(
        { error: true, message: 'Сессия недействительна' },
        { status: 401 }
      )
    }

    // Получаем все активные сессии пользователя
    const [activeSessions, sessionStats] = await Promise.all([
      getUserActiveSessions(currentSession.user.id),
      getUserSessionStats(currentSession.user.id)
    ])

    // Форматируем данные сессий для клиента
    const formattedSessions = activeSessions.map(session => ({
      id: session.id,
      sessionToken: session.sessionToken === sessionToken ? session.sessionToken : '***hidden***',
      isCurrent: session.sessionToken === sessionToken,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
      expiresAt: session.expiresAt
    }))

    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
      stats: sessionStats
    })

  } catch (error) {
    console.error('Ошибка получения сессий:', error)
    return NextResponse.json(
      { error: true, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 