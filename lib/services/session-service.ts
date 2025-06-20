import { db } from '../db'
import crypto from 'crypto'
import type { Session, User } from '../generated/prisma'

export interface CreateSessionData {
  userId: number
  userAgent?: string
  ipAddress?: string
  expiresAt: Date
}

export interface SessionWithUser extends Session {
  user: User
}

/**
 * Создание новой сессии
 */
export async function createSession(data: CreateSessionData): Promise<Session> {
  // Генерируем уникальный токен сессии
  const sessionToken = crypto.randomBytes(32).toString('hex')
  
  return await db.session.create({
    data: {
      sessionToken,
      userId: data.userId,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      expiresAt: data.expiresAt,
      lastActiveAt: new Date()
    }
  })
}

/**
 * Получение сессии по токену
 */
export async function getSessionByToken(sessionToken: string): Promise<SessionWithUser | null> {
  return await db.session.findUnique({
    where: {
      sessionToken,
      isActive: true
    },
    include: {
      user: true
    }
  })
}

/**
 * Проверка валидности сессии
 */
export async function validateSession(sessionToken: string): Promise<SessionWithUser | null> {
  const session = await getSessionByToken(sessionToken)
  
  if (!session) {
    return null
  }
  
  // Проверяем, не истекла ли сессия
  if (session.expiresAt < new Date()) {
    await invalidateSession(sessionToken)
    return null
  }
  
  // Обновляем время последней активности
  await updateSessionActivity(sessionToken)
  
  return session
}

/**
 * Обновление времени последней активности сессии
 */
export async function updateSessionActivity(sessionToken: string): Promise<void> {
  await db.session.update({
    where: {
      sessionToken,
      isActive: true
    },
    data: {
      lastActiveAt: new Date(),
      updatedAt: new Date()
    }
  })
}

/**
 * Деактивация сессии
 */
export async function invalidateSession(sessionToken: string): Promise<void> {
  await db.session.update({
    where: {
      sessionToken
    },
    data: {
      isActive: false,
      updatedAt: new Date()
    }
  })
}

/**
 * Деактивация всех сессий пользователя
 */
export async function invalidateAllUserSessions(userId: number): Promise<void> {
  await db.session.updateMany({
    where: {
      userId,
      isActive: true
    },
    data: {
      isActive: false,
      updatedAt: new Date()
    }
  })
}

/**
 * Получение всех активных сессий пользователя
 */
export async function getUserActiveSessions(userId: number): Promise<Session[]> {
  return await db.session.findMany({
    where: {
      userId,
      isActive: true,
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      lastActiveAt: 'desc'
    }
  })
}

/**
 * Очистка истекших сессий (для периодического запуска)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await db.session.updateMany({
    where: {
      expiresAt: {
        lt: new Date()
      },
      isActive: true
    },
    data: {
      isActive: false,
      updatedAt: new Date()
    }
  })
  
  return result.count
}

/**
 * Продление сессии
 */
export async function extendSession(sessionToken: string, newExpiresAt: Date): Promise<Session | null> {
  try {
    return await db.session.update({
      where: {
        sessionToken,
        isActive: true
      },
      data: {
        expiresAt: newExpiresAt,
        lastActiveAt: new Date(),
        updatedAt: new Date()
      }
    })
  } catch (error) {
    return null
  }
}

/**
 * Получение статистики сессий пользователя
 */
export async function getUserSessionStats(userId: number): Promise<{
  totalSessions: number
  activeSessions: number
  lastActiveSession?: Date
}> {
  const [totalSessions, activeSessions, lastActiveSession] = await Promise.all([
    db.session.count({
      where: { userId }
    }),
    db.session.count({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    }),
    db.session.findFirst({
      where: {
        userId,
        isActive: true
      },
      orderBy: {
        lastActiveAt: 'desc'
      },
      select: {
        lastActiveAt: true
      }
    })
  ])
  
  return {
    totalSessions,
    activeSessions,
    lastActiveSession: lastActiveSession?.lastActiveAt
  }
} 