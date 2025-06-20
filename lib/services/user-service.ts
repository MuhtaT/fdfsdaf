import { db } from '../db'
import type { TelegramUser } from '../telegram-auth'
import type { User } from '../generated/prisma'

export interface CreateUserData {
  telegramId: string
  firstName?: string
  lastName?: string
  username?: string
  photoUrl?: string
  languageCode?: string
  isPremium?: boolean
  allowsWriteToPm?: boolean
  isBot?: boolean
}

/**
 * Создание или обновление пользователя на основе Telegram данных
 */
export async function createOrUpdateUser(telegramUser: TelegramUser): Promise<User> {
  const userData: CreateUserData = {
    telegramId: telegramUser.id.toString(),
    firstName: telegramUser.first_name,
    lastName: telegramUser.last_name,
    username: telegramUser.username,
    photoUrl: telegramUser.photo_url,
    languageCode: telegramUser.language_code,
    isPremium: telegramUser.is_premium || false,
    allowsWriteToPm: telegramUser.allows_write_to_pm || false,
    isBot: telegramUser.is_bot || false
  }

  // Пытаемся найти существующего пользователя
  const existingUser = await db.user.findUnique({
    where: { telegramId: userData.telegramId }
  })

  if (existingUser) {
    // Обновляем данные существующего пользователя
    return await db.user.update({
      where: { telegramId: userData.telegramId },
      data: {
        ...userData,
        lastActiveAt: new Date()
      }
    })
  } else {
    // Создаем нового пользователя
    return await db.user.create({
      data: {
        ...userData,
        createdAt: new Date(),
        lastActiveAt: new Date()
      }
    })
  }
}

/**
 * Получение пользователя по ID
 */
export async function getUserById(userId: number): Promise<User | null> {
  return await db.user.findUnique({
    where: { id: userId }
  })
}

/**
 * Получение пользователя по Telegram ID
 */
export async function getUserByTelegramId(telegramId: string): Promise<User | null> {
  return await db.user.findUnique({
    where: { telegramId }
  })
}

/**
 * Обновление времени последней активности пользователя
 */
export async function updateUserLastActive(userId: number): Promise<User> {
  return await db.user.update({
    where: { id: userId },
    data: { lastActiveAt: new Date() }
  })
}

/**
 * Получение всех пользователей (для админки)
 */
export async function getAllUsers(skip = 0, take = 20): Promise<User[]> {
  return await db.user.findMany({
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Получение статистики пользователей
 */
export async function getUserStats() {
  const total = await db.user.count()
  const active24h = await db.user.count({
    where: {
      lastActiveAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    }
  })
  const premium = await db.user.count({
    where: { isPremium: true }
  })

  return {
    total,
    active24h,
    premium,
    activePercentage: total > 0 ? (active24h / total * 100).toFixed(1) : '0'
  }
}