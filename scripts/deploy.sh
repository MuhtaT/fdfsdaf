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
    
    print_error "❌ Деплой отменен, выполнен откат"
    exit 1
}

# Устанавливаем обработчик ошибок
trap rollback ERR

# Применяем изменения
print_status "📝 Применяем изменения из Git..."
git reset --hard origin/main

# Проверяем изменения в package.json
if ! cmp -s package.json package.json.backup; then
    print_status "📦 Обнаружены изменения в зависимостях, переустанавливаем..."
    
    # Очищаем node_modules для чистой установки
    if [ -d "node_modules" ]; then
        rm -rf node_modules
    fi
    
    # Устанавливаем зависимости
    if ! npm ci; then
        print_error "Не удалось установить зависимости"
        rollback
    fi
else
    print_status "📦 Зависимости не изменились"
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