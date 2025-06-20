import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { validateTelegramInitData } from '@/lib/telegram-auth'
import { createOrUpdateUser } from '@/lib/services/user-service'

export async function POST(request: NextRequest) {
  try {
    const { initData, startParam } = await request.json()

    if (!initData) {
      return NextResponse.json(
        { error: true, message: 'Отсутствуют данные инициализации' },
        { status: 400 }
      )
    }

    // Валидируем данные Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN не установлен')
      return NextResponse.json(
        { error: true, message: 'Ошибка конфигурации сервера' },
        { status: 500 }
      )
    }

    const validatedData = validateTelegramInitData(initData, botToken)
    if (!validatedData || !validatedData.user) {
      return NextResponse.json(
        { error: true, message: 'Недействительные данные Telegram' },
        { status: 401 }
      )
    }

    // Создаем или обновляем пользователя в базе данных
    const user = await createOrUpdateUser(validatedData.user)

    // Создаем токен сессии
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 часа

    // Здесь можно сохранить токен сессии в базе данных или кэше
    // Для примера просто возвращаем его (в продакшене нужна более сложная система)

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
        lastActiveAt: user.lastActiveAt
      },
      sessionToken,
      expiresAt
    })

  } catch (error) {
    console.error('Ошибка аутентификации:', error)
    return NextResponse.json(
      { error: true, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 