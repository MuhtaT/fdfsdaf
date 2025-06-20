import { NextRequest, NextResponse } from 'next/server'
import { getUserById, updateUserLastActive } from '@/lib/services/user-service'

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, userId } = await request.json()

    if (!sessionToken || !userId) {
      return NextResponse.json(
        { error: true, message: 'Отсутствуют данные сессии' },
        { status: 400 }
      )
    }

    // В реальном приложении здесь нужно проверить токен сессии в базе данных/кэше
    // Для упрощения примера просто проверяем, что пользователь существует
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: true, message: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Обновляем время последней активности
    await updateUserLastActive(user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.photoUrl,
        isPremium: user.isPremium,
        createdAt: user.createdAt,
        lastActiveAt: new Date()
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