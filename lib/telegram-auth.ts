import crypto from 'crypto'

// Интерфейс для данных инициализации Telegram
export interface TelegramInitData {
  query_id?: string
  user?: TelegramUser
  auth_date: number
  hash: string
  chat_type?: string
  chat_instance?: string
  start_param?: string
}

// Интерфейс пользователя Telegram
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  allows_write_to_pm?: boolean
  photo_url?: string
  is_bot?: boolean
  added_to_attachment_menu?: boolean
}

/**
 * Валидация данных инициализации Telegram Mini App
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string,
  expiresIn: number = 3600 // 1 час по умолчанию
): TelegramInitData | null {
  try {
    // Парсим строку с параметрами
    const urlParams = new URLSearchParams(initData)
    const data: Record<string, string> = {}
    
    for (const [key, value] of urlParams.entries()) {
      data[key] = value
    }

    // Извлекаем хеш
    const receivedHash = data.hash
    if (!receivedHash) {
      throw new Error('Hash parameter is missing')
    }
    delete data.hash

    // Проверяем auth_date
    const authDate = parseInt(data.auth_date)
    if (isNaN(authDate)) {
      throw new Error('Invalid auth_date')
    }

    // Проверяем истечение времени
    const currentTime = Math.floor(Date.now() / 1000)
    if (currentTime - authDate > expiresIn) {
      throw new Error('Init data is expired')
    }

    // Создаем строку для проверки подписи
    const dataCheckString = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('\n')

    // Создаем секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest()

    // Создаем подпись
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    // Сравниваем подписи
    if (calculatedHash !== receivedHash) {
      throw new Error('Invalid signature')
    }

    // Парсим данные пользователя
    let user: TelegramUser | undefined
    if (data.user) {
      try {
        user = JSON.parse(decodeURIComponent(data.user))
      } catch (e) {
        throw new Error('Invalid user data')
      }
    }

    return {
      query_id: data.query_id,
      user,
      auth_date: authDate,
      hash: receivedHash,
      chat_type: data.chat_type,
      chat_instance: data.chat_instance,
      start_param: data.start_param,
    }
  } catch (error) {
    console.error('Telegram init data validation error:', error)
    return null
  }
}

/**
 * Создание подписи для Telegram данных
 */
export function signTelegramData(data: Record<string, any>, botToken: string): string {
  const dataCheckString = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n')

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest()

  return crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')
} 