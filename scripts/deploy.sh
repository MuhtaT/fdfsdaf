#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода цветного текста
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверяем наличие git
if ! command -v git &> /dev/null; then
    print_error "Git не установлен"
    exit 1
fi

# Проверяем наличие npm
if ! command -v npm &> /dev/null; then
    print_error "NPM не установлен"
    exit 1
fi

print_status "🚀 Начинаем автоматический деплой..."

# Сохраняем текущий коммит
CURRENT_COMMIT=$(git rev-parse HEAD)
print_status "Текущий коммит: $CURRENT_COMMIT"

# Защищаем критические файлы от перезаписи
print_status "🔒 Защищаем критические файлы..."

# Создаем резервные копии критических файлов
if [ -f ".env" ]; then
    cp .env .env.backup
    print_status "📄 .env файл защищен"
fi

if [ -f ".env.local" ]; then
    cp .env.local .env.local.backup
    print_status "📄 .env.local файл защищен"
fi

if [ -f ".env.production" ]; then
    cp .env.production .env.production.backup
    print_status "📄 .env.production файл защищен"
fi

# Получаем обновления
print_status "📦 Получаем обновления из GitHub..."
if ! git fetch origin main; then
    print_error "Не удалось получить обновления из GitHub"
    exit 1
fi

# Проверяем есть ли обновления
LATEST_COMMIT=$(git rev-parse origin/main)
if [ "$CURRENT_COMMIT" = "$LATEST_COMMIT" ]; then
    print_success "✅ Уже актуальная версия"
    exit 0
fi

print_status "🔄 Найдены новые обновления. Применяем..."

# Создаем резервную копию
print_status "💾 Создаем резервную копию..."
if [ -d ".next" ]; then
    cp -r .next .next.backup
fi

# Создаем точку восстановления для package.json
cp package.json package.json.backup

# Функция восстановления
rollback() {
    print_warning "🔄 Выполняем откат..."
    git reset --hard $CURRENT_COMMIT
    
    if [ -f "package.json.backup" ]; then
        mv package.json.backup package.json
    fi
    
    if [ -d ".next.backup" ]; then
        rm -rf .next
        mv .next.backup .next
    fi
    
    # Восстанавливаем защищенные файлы
    if [ -f ".env.backup" ]; then
        mv .env.backup .env
        print_status "🔒 .env файл восстановлен"
    fi
    
    if [ -f ".env.local.backup" ]; then
        mv .env.local.backup .env.local
        print_status "🔒 .env.local файл восстановлен"
    fi
    
    if [ -f ".env.production.backup" ]; then
        mv .env.production.backup .env.production
        print_status "🔒 .env.production файл восстановлен"
    fi
    
    print_error "❌ Деплой отменен, выполнен откат"
    exit 1
}

# Устанавливаем обработчик ошибок
trap rollback ERR

# Применяем изменения
print_status "📝 Применяем изменения из Git..."
git reset --hard origin/main

# Восстанавливаем защищенные файлы после git reset
print_status "🔒 Восстанавливаем защищенные файлы..."

if [ -f ".env.backup" ]; then
    mv .env.backup .env
    print_status "📄 .env файл восстановлен"
fi

if [ -f ".env.local.backup" ]; then
    mv .env.local.backup .env.local
    print_status "📄 .env.local файл восстановлен"
fi

if [ -f ".env.production.backup" ]; then
    mv .env.production.backup .env.production
    print_status "📄 .env.production файл восстановлен"
fi

# Проверяем изменения в package.json
if ! cmp -s package.json package.json.backup; then
    print_status "📦 Обнаружены изменения в зависимостях, переустанавливаем..."
    
    # Сохраняем node_modules если возможно
    if [ -d "node_modules" ]; then
        print_status "💾 Создаем резервную копию node_modules..."
        mv node_modules node_modules.backup
    fi
    
    # Устанавливаем зависимости
    if ! npm ci; then
        print_error "Не удалось установить зависимости"
        
        # Восстанавливаем node_modules при ошибке
        if [ -d "node_modules.backup" ]; then
            print_status "🔄 Восстанавливаем node_modules..."
            rm -rf node_modules
            mv node_modules.backup node_modules
        fi
        
        rollback
    else
        # Удаляем старую резервную копию при успехе
        if [ -d "node_modules.backup" ]; then
            rm -rf node_modules.backup
        fi
    fi
else
    print_status "📦 Зависимости не изменились, используем существующие"
    
    # Проверяем целостность node_modules
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        print_warning "⚠️ node_modules поврежден, переустанавливаем..."
        if ! npm ci; then
            print_error "Не удалось восстановить зависимости"
            rollback
        fi
    fi
fi

# Собираем приложение
print_status "🏗️ Собираем приложение..."
if ! npm run build; then
    print_error "Не удалось собрать приложение"
    rollback
fi

# Проверяем работоспособность сборки
print_status "🧪 Проверяем сборку..."
if [ ! -d ".next" ] || [ ! -f ".next/BUILD_ID" ]; then
    print_error "Сборка не создана корректно"
    rollback
fi

# Graceful restart приложения
print_status "🔄 Перезапускаем приложение..."

# Пробуем PM2 сначала
if command -v pm2 &> /dev/null; then
    print_status "Используем PM2 для graceful restart..."
    
    # Проверяем существует ли процесс
    if pm2 list | grep -q "aurora-website"; then
        # Graceful reload
        pm2 reload aurora-website --update-env
        print_success "✅ Приложение перезапущено через PM2"
    else
        # Запускаем новый процесс
        pm2 start npm --name "aurora-website" -- start
        print_success "✅ Приложение запущено через PM2"
    fi
else
    print_warning "PM2 не найден, создаем флаг для ручного перезапуска"
    touch .update-flag
    
    # Если запущен через systemd
    if systemctl is-active --quiet aurora-website 2>/dev/null; then
        print_status "Перезапускаем через systemd..."
        systemctl reload aurora-website || systemctl restart aurora-website
        print_success "✅ Приложение перезапущено через systemd"
    else
        print_warning "⚠️ Требуется ручной перезапуск приложения"
    fi
fi

# Очищаем резервные копии
print_status "🧹 Очищаем резервные копии..."
rm -f package.json.backup
rm -rf .next.backup

# Очищаем резервные копии защищенных файлов (они уже восстановлены)
rm -f .env.backup 2>/dev/null || true
rm -f .env.local.backup 2>/dev/null || true  
rm -f .env.production.backup 2>/dev/null || true
rm -rf node_modules.backup 2>/dev/null || true

# Получаем информацию о новом коммите
NEW_COMMIT=$(git rev-parse HEAD)
COMMIT_MESSAGE=$(git log -1 --pretty=format:"%s")
AUTHOR=$(git log -1 --pretty=format:"%an")

print_success "🎉 Деплой завершен успешно!"
print_status "📋 Детали:"
print_status "   Коммит: $NEW_COMMIT"
print_status "   Автор: $AUTHOR"
print_status "   Сообщение: $COMMIT_MESSAGE"
print_status "   Время: $(date)"

# Отправляем уведомление если настроен Telegram
if [ ! -z "$TELEGRAM_BOT_TOKEN" ] && [ ! -z "$TELEGRAM_CHAT_ID" ]; then
    print_status "📱 Отправляем уведомление в Telegram..."
    
    MESSAGE="🚀 *Автообновление Avrora App*%0A%0A✅ Деплой завершен успешно%0A%0A📋 *Детали:*%0A🔸 Коммит: \`${NEW_COMMIT:0:7}\`%0A🔸 Автор: $AUTHOR%0A🔸 Время: $(date '+%H:%M %d.%m.%Y')%0A%0A💬 *Изменения:* $COMMIT_MESSAGE"
    
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        -d "chat_id=$TELEGRAM_CHAT_ID" \
        -d "text=$MESSAGE" \
        -d "parse_mode=Markdown" > /dev/null
fi

print_success "🎯 Деплой успешно завершен!" 