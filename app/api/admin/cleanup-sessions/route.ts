import { NextRequest, NextResponse } from 'next/server'
import { runSessionCleanup } from '@/lib/utils/session-cleanup'

export async function POST(request: NextRequest) {
  try {
    // Проверяем, что это запрос от администратора или cron job
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: true, message: 'Неавторизованный доступ' },
        { status: 401 }
      )
    }

    // Запускаем очистку сессий
    await runSessionCleanup()

    return NextResponse.json({
      success: true,
      message: 'Очистка сессий выполнена',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Ошибка очистки сессий:', error)
    return NextResponse.json(
      { error: true, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 