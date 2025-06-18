import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

/**
 * API для валидации Telegram initData
 * 
 * Этот эндпоинт проверяет подлинность данных, полученных от Telegram WebApp
 * Валидация основана на HMAC подписи с использованием токена бота
 */

export async function POST(request: NextRequest) {
  try {
    const { initData, botToken } = await request.json()

    if (!initData) {
      return NextResponse.json(
        { valid: false, error: 'Missing initData' },
        { status: 400 }
      )
    }

    // В development режиме всегда считаем данные валидными
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: валидация пропущена')
      return NextResponse.json({ 
        valid: true, 
        message: 'Development mode validation' 
      })
    }

    // Получаем токен бота из переменных окружения или из запроса
    const token = botToken || process.env.TELEGRAM_BOT_TOKEN

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Bot token not provided' },
        { status: 400 }
      )
    }

    // Валидируем данные Telegram
    const isValid = validateTelegramData(initData, token)

    if (isValid) {
      console.log('✅ Telegram данные валидны')
      
      // Парсим данные пользователя для логирования
      const userData = parseTelegramData(initData)
      
      // Дополнительная проверка безопасности
      try {
        await validateUserSecurity(userData.user?.id, initData)
      } catch (securityError) {
        console.warn('🔒 Ошибка проверки безопасности:', securityError)
        return NextResponse.json(
          { valid: false, error: 'Security validation failed' },
          { status: 403 }
        )
      }

      console.log('👤 Авторизован пользователь:', userData.user?.first_name, userData.user?.id)

      return NextResponse.json({ 
        valid: true,
        user: userData.user,
        auth_date: userData.auth_date
      })
    } else {
      console.warn('❌ Невалидные Telegram данные')
      return NextResponse.json(
        { valid: false, error: 'Invalid signature' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('❌ Ошибка валидации Telegram данных:', error)
    return NextResponse.json(
      { valid: false, error: 'Validation failed' },
      { status: 500 }
    )
  }
}

/**
 * Валидирует подпись Telegram WebApp данных
 */
function validateTelegramData(initData: string, botToken: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get('hash')
    
    if (!hash) {
      return false
    }

    // Убираем hash из параметров
    urlParams.delete('hash')

    // Сортируем параметры по ключу
    const sortedParams = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    // Создаем секретный ключ
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()

    // Создаем подпись
    const signature = createHmac('sha256', secretKey).update(sortedParams).digest('hex')

    // Сравниваем подписи
    return signature === hash

  } catch (error) {
    console.error('Ошибка валидации подписи:', error)
    return false
  }
}

/**
 * Парсит данные Telegram из строки initData
 */
function parseTelegramData(initData: string) {
  const urlParams = new URLSearchParams(initData)
  const result: Record<string, any> = {}

  for (const [key, value] of urlParams) {
    if (key === 'user' || key === 'receiver' || key === 'chat') {
      try {
        result[key] = JSON.parse(decodeURIComponent(value))
      } catch {
        result[key] = value
      }
    } else if (key === 'auth_date') {
      result[key] = parseInt(value, 10)
    } else if (key !== 'hash') {
      result[key] = value
    }
  }

  return result
}

/**
 * Проверяет, не истекли ли данные (по умолчанию 24 часа)
 */
function isDataFresh(authDate: number, maxAgeSeconds = 86400): boolean {
  const now = Math.floor(Date.now() / 1000)
  return (now - authDate) <= maxAgeSeconds
}

/**
 * Дополнительная проверка безопасности
 * ВНУТРЕННЯЯ функция - не экспортируется
 */
async function validateUserSecurity(userId: number, initData: string): Promise<boolean> {
  // Здесь можно добавить дополнительные проверки:
  // - Проверка в базе данных
  // - Rate limiting
  // - Blacklist проверка
  // - Проверка подписки бота
  
  console.log(`🔒 Дополнительная проверка безопасности для пользователя ${userId}`)
  
  // Пример: проверка свежести данных
  const userData = parseTelegramData(initData)
  if (userData.auth_date && !isDataFresh(userData.auth_date)) {
    throw new Error('Auth data is too old')
  }

  return true
}