import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Функция для проверки подписи GitHub
function verifyGitHubSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = createHmac('sha256', secret)
  hmac.update(payload)
  const expectedSignature = `sha256=${hmac.digest('hex')}`
  return signature === expectedSignature
}

// Функция для выполнения обновления
async function performUpdate() {
  try {
    console.log('🚀 Начинаем автообновление...')
    
    // 1. Останавливаем текущий процесс gracefully
    console.log('📦 Получаем обновления из GitHub...')
    await execAsync('git fetch origin main')
    
    // 2. Проверяем есть ли обновления
    const { stdout: currentCommit } = await execAsync('git rev-parse HEAD')
    const { stdout: latestCommit } = await execAsync('git rev-parse origin/main')
    
    if (currentCommit.trim() === latestCommit.trim()) {
      console.log('✅ Обновления не требуются')
      return { success: true, message: 'Уже актуальная версия' }
    }
    
    console.log('🔄 Применяем обновления...')
    
    // 3. Делаем резервную копию
    await execAsync('cp -r .next .next.backup || true')
    
    // 4. Получаем изменения
    await execAsync('git reset --hard origin/main')
    
    // 5. Устанавливаем зависимости если нужно
    console.log('📦 Проверяем зависимости...')
    await execAsync('npm ci --production=false')
    
    // 6. Собираем новую версию
    console.log('🏗️ Собираем приложение...')
    await execAsync('npm run build')
    
    // 7. Перезапускаем приложение
    console.log('🔄 Перезапускаем приложение...')
    
    // Используем PM2 для graceful restart если доступен
    try {
      await execAsync('pm2 reload aurora-website --update-env || pm2 restart aurora-website')
      console.log('✅ Приложение успешно перезапущено через PM2')
    } catch (pm2Error) {
      // Если PM2 недоступен, используем альтернативный метод
      console.log('⚠️ PM2 недоступен, используем стандартный перезапуск')
      
      // Создаем файл флаг для graceful restart
      await execAsync('touch .update-flag')
      
      // Даем сигнал родительскому процессу
      if (process.env.NODE_ENV === 'production') {
        setTimeout(() => {
          process.kill(process.pid, 'SIGUSR2')
        }, 1000)
      }
    }
    
    // 8. Удаляем резервную копию при успехе
    await execAsync('rm -rf .next.backup')
    
    console.log('🎉 Автообновление завершено успешно!')
    return { success: true, message: 'Обновление применено успешно' }
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении:', error)
    
    // Восстанавливаем из резервной копии
    try {
      await execAsync('rm -rf .next && mv .next.backup .next')
      console.log('🔄 Восстановлено из резервной копии')
    } catch (restoreError) {
      console.error('💥 Критическая ошибка восстановления:', restoreError)
    }
    
    return { success: false, message: `Ошибка обновления: ${error}` }
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('x-hub-signature-256')
    const event = request.headers.get('x-github-event')
    
    // Проверяем наличие секрета
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('❌ GITHUB_WEBHOOK_SECRET не настроен')
      return NextResponse.json(
        { error: 'Webhook secret не настроен' },
        { status: 500 }
      )
    }
    
    // Проверяем подпись
    if (!signature || !verifyGitHubSignature(payload, signature, webhookSecret)) {
      console.error('❌ Неверная подпись webhook')
      return NextResponse.json(
        { error: 'Неверная подпись' },
        { status: 401 }
      )
    }
    
    const data = JSON.parse(payload)
    
    // Обрабатываем только push события в главную ветку
    if (event === 'push' && data.ref === 'refs/heads/main') {
      console.log(`📨 Получен push в main ветку от ${data.pusher.name}`)
      console.log(`💬 Коммит: ${data.head_commit.message}`)
      
      // Проверяем, нужно ли пропустить деплой
      const skipDeploy = data.head_commit.message.includes('[skip deploy]') || 
                        data.head_commit.message.includes('[skip ci]')
      
      if (skipDeploy) {
        console.log('⏭️ Пропускаем деплой по метке в коммите')
        return NextResponse.json({ message: 'Деплой пропущен' })
      }
      
      // Запускаем обновление асинхронно
      performUpdate().then(result => {
        console.log('🎯 Результат обновления:', result)
      }).catch(error => {
        console.error('💥 Критическая ошибка обновления:', error)
      })
      
      return NextResponse.json({ 
        message: 'Автообновление запущено',
        commit: data.head_commit.id.substring(0, 7),
        author: data.head_commit.author.name
      })
    }
    
    // Для других событий просто подтверждаем получение
    return NextResponse.json({ message: 'Webhook получен, но не обработан' })
    
  } catch (error) {
    console.error('❌ Ошибка webhook:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// Для GET запросов - статус здоровья
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    service: 'GitHub Webhook Handler',
    timestamp: new Date().toISOString()
  })
} 