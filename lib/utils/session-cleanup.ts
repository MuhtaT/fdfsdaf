import { cleanupExpiredSessions } from '@/lib/services/session-service'

/**
 * Запуск очистки истекших сессий
 */
export async function runSessionCleanup(): Promise<void> {
  try {
    const cleanedCount = await cleanupExpiredSessions()
    console.log(`🧹 Очищено истекших сессий: ${cleanedCount}`)
  } catch (error) {
    console.error('❌ Ошибка очистки сессий:', error)
  }
}

/**
 * Запуск периодической очистки сессий
 * Рекомендуется вызывать каждые 30 минут в продакшн
 */
export function startSessionCleanupScheduler(intervalMinutes: number = 30): NodeJS.Timeout {
  const intervalMs = intervalMinutes * 60 * 1000
  
  console.log(`🔄 Запуск планировщика очистки сессий (каждые ${intervalMinutes} минут)`)
  
  // Запускаем первую очистку сразу
  runSessionCleanup()
  
  // Планируем периодическую очистку
  return setInterval(runSessionCleanup, intervalMs)
}

/**
 * Остановка планировщика очистки
 */
export function stopSessionCleanupScheduler(scheduler: NodeJS.Timeout): void {
  clearInterval(scheduler)
  console.log('⏹️ Планировщик очистки сессий остановлен')
} 