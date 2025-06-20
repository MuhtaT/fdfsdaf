import { NextRequest, NextResponse } from 'next/server'
import { validateTelegramInitData, type TelegramUser } from '@/lib/telegram-auth'
import { createOrUpdateUser, updateUserLastActive } from '@/lib/services/user-service'
import { createSession } from '@/lib/services/session-service'
import { headers } from 'next/headers'

const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 часа

export async function POST(request: NextRequest) {
  try {
    const { initData, startParam } = await request.json()

    if (!initData) {
      return NextResponse.json(
        { error: true, message: 'Отсутствуют данные инициализации' },
        { status: 400 }
      )
    }

    // Валидация данных Telegram
    let isValid = false
    let userData: TelegramUser | null = null
    
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN
      if (!botToken) {
        throw new Error('TELEGRAM_BOT_TOKEN не установлен')
      }
      
      const validatedData = validateTelegramInitData(initData, botToken)
      if (validatedData && validatedData.user) {
        isValid = true
        userData = validatedData.user
      }
    } catch (error) {
      // В development режиме можем пропустить валидацию
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Development режим: пропускаем валидацию Telegram')
        
        // Парсим мок данные для разработки
        try {
          const params = new URLSearchParams(initData)
          const userParam = params.get('user')
          if (userParam) {
            userData = JSON.parse(decodeURIComponent(userParam))
            isValid = true
          }
        } catch (parseError) {
          // Если не удалось распарсить, используем дефолтные данные
          userData = {
            id: 12345,
            first_name: 'Dev',
            last_name: 'User',
            username: 'devuser',
            language_code: 'ru'
          }
          isValid = true
        }
      }
    }

    if (!isValid || !userData) {
      return NextResponse.json(
        { error: true, message: 'Недействительные данные Telegram' },
        { status: 401 }
      )
    }

    // Создаем или обновляем пользователя
    const user = await createOrUpdateUser(userData)

    // Получаем информацию о клиенте для сессии
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || undefined
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwarded?.split(',')[0] || realIp || undefined

    // Создаем новую сессию
    const expiresAt = new Date(Date.now() + SESSION_DURATION)
    const session = await createSession({
      userId: user.id,
      userAgent,
      ipAddress,
      expiresAt
    })

    // Обновляем время последней активности пользователя
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
      },
      sessionToken: session.sessionToken,
      expiresAt: session.expiresAt
    })

  } catch (error) {
    console.error('Ошибка аутентификации:', error)
    return NextResponse.json(
      { error: true, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 