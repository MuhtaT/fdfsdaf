/**
 * Утилиты для работы с аватарками пользователей Telegram
 */

export interface TelegramUserPhoto {
  file_id: string
  file_unique_id: string
  width: number
  height: number
}

export interface TelegramUserProfilePhotos {
  total_count: number
  photos: TelegramUserPhoto[][]
}

/**
 * Получение аватарки пользователя через Telegram Bot API
 */
export async function getTelegramUserAvatar(telegramId: string): Promise<string | null> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      console.warn('TELEGRAM_BOT_TOKEN не установлен')
      return null
    }

    // Получаем фотографии профиля пользователя
    const photosResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${telegramId}&limit=1`
    )

    if (!photosResponse.ok) {
      console.warn('Не удалось получить фотографии профиля:', photosResponse.statusText)
      return null
    }

    const photosData: { ok: boolean; result: TelegramUserProfilePhotos } = await photosResponse.json()

    if (!photosData.ok || photosData.result.total_count === 0) {
      return null
    }

    // Берем первую (самую большую) фотографию из первого набора
    const firstPhotoSet = photosData.result.photos[0]
    if (!firstPhotoSet || firstPhotoSet.length === 0) {
      return null
    }

    // Берем фото наибольшего размера
    const largestPhoto = firstPhotoSet[firstPhotoSet.length - 1]
    
    // Получаем информацию о файле
    const fileResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${largestPhoto.file_id}`
    )

    if (!fileResponse.ok) {
      console.warn('Не удалось получить информацию о файле:', fileResponse.statusText)
      return null
    }

    const fileData: { ok: boolean; result: { file_path: string } } = await fileResponse.json()

    if (!fileData.ok || !fileData.result.file_path) {
      return null
    }

    // Возвращаем URL для загрузки файла
    return `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`

  } catch (error) {
    console.error('Ошибка получения аватарки пользователя:', error)
    return null
  }
}

/**
 * Генерация аватарки с инициалами пользователя
 */
export function generateInitialsAvatar(firstName?: string, lastName?: string, username?: string): string {
  // Определяем инициалы
  let initials = ''
  
  if (firstName) {
    initials += firstName.charAt(0).toUpperCase()
  }
  
  if (lastName) {
    initials += lastName.charAt(0).toUpperCase()
  }
  
  // Если нет имени и фамилии, используем username
  if (!initials && username) {
    initials = username.charAt(0).toUpperCase()
  }
  
  // Если ничего нет, используем дефолтную букву
  if (!initials) {
    initials = 'У'
  }

  // Генерируем цвет на основе инициалов
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  
  const colorIndex = initials.charCodeAt(0) % colors.length
  const backgroundColor = colors[colorIndex]

  // Создаем SVG аватарку
  const svg = `
    <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="${backgroundColor}"/>
      <text x="40" y="50" font-family="Arial, sans-serif" font-size="28" font-weight="bold" 
            text-anchor="middle" dominant-baseline="middle" fill="white">
        ${initials}
      </text>
    </svg>
  `

  // Конвертируем SVG в base64 data URL
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

/**
 * Форматирование полного имени пользователя
 */
export function formatUserName(firstName?: string, lastName?: string, username?: string): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }
  
  if (firstName) {
    return firstName
  }
  
  if (username) {
    return `@${username}`
  }
  
  return 'Пользователь'
}

/**
 * Форматирование даты регистрации
 */
export function formatMemberSince(createdAt: Date): string {
  const year = createdAt.getFullYear()
  const month = createdAt.toLocaleDateString('ru-RU', { month: 'long' })
  
  return `${month} ${year}`
} 