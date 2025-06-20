"use client"

import { useState } from "react"
import { Settings, Star, Package, MessageCircle, Shield, ChevronRight, Edit, Camera, Moon, Sun } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Header from "@/components/navigation/Header"
import { useThemeStore } from "@/stores/useThemeStore"
import { createSafeTelegramTheme } from "@/types/telegram-theme"
import { useAuthWithPassword } from "@/lib/hooks/useAuthWithPassword"
import { useUserAvatar } from "@/lib/hooks/useUserAvatar"
import { formatUserName, formatMemberSince } from "@/lib/utils/telegram-avatar"
import LoadingScreen from "@/components/ui/loading-screen"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"ads" | "reviews" | "settings">("ads")
  const [showSettings, setShowSettings] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const { telegramTheme, isDark, toggleDarkMode } = useThemeStore()
  const safeTheme = createSafeTelegramTheme(telegramTheme)
  const router = useRouter()

  // Получаем данные пользователя из системы авторизации
  const { user, isAuthenticated, isLoading, logout } = useAuthWithPassword()

  // Получаем аватарку пользователя
  const { avatarUrl, type: avatarType, isLoading: avatarLoading } = useUserAvatar(
    null, // sessionToken получим из localStorage или другого источника
    user?.firstName || undefined,
    user?.lastName || undefined,
    user?.username || undefined,
    user?.telegramId || undefined
  )

  const [formData, setFormData] = useState({
    name: formatUserName(user?.firstName || undefined, user?.lastName || undefined, user?.username || undefined),
    phone: user?.phone || '',
    email: user?.email || '',
    location: 'Не указано', // TODO: добавить поле location в модель User
  })

  // Показываем загрузку если данные еще загружаются
  if (isLoading) {
    return <LoadingScreen title="Загрузка профиля..." />
  }

  // Если пользователь не авторизован, перенаправляем на главную
  if (!isAuthenticated || !user) {
    router.push('/')
    return null
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveSettings = () => {
    // TODO: Логика сохранения настроек через API
    console.log("Saving settings:", formData)
    setEditMode(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Ошибка выхода:', error)
    }
  }

  // Форматируем данные пользователя
  const userName = formatUserName(
    user.firstName || undefined, 
    user.lastName || undefined, 
    user.username || undefined
  )
  const memberSince = formatMemberSince(new Date(user.createdAt))
  const userRating = user.rating || 0
  const reviewsCount = user.reviewCount || 0
  const userTelegramId = user.telegramId // Это уже string, не null

  return (
    <div className="h-screen max-h-screen overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
      <Header
        title="Профиль"
        theme={safeTheme}
        actions={[
          <button
            key="settings"
            onClick={() => setActiveTab("settings")}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Settings className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>,
        ]}
      />

      <main className="pt-16 pb-20">
        {/* Profile Header */}
        <div className="bg-white dark:bg-neutral-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                {avatarLoading ? (
                  <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />
                ) : (
                  <Image
                    src={avatarUrl}
                    alt={userName}
                    width={80}
                    height={80}
                    className="rounded-full"
                    unoptimized={avatarType === 'initials'} // Для SVG аватарок
                  />
                )}
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-avito-primary text-white rounded-full flex items-center justify-center hover:bg-avito-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="font-display text-xl text-neutral-800 dark:text-neutral-200">{userName}</h1>
                  {user.verified && (
                    <div className="w-6 h-6 bg-avito-success rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {user.isPremium && (
                    <div className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                      PREMIUM
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  {userRating > 0 && (
                    <>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span>{userRating.toFixed(1)}</span>
                      </div>
                      <span>•</span>
                    </>
                  )}
                  <span>{reviewsCount} отзывов</span>
                  <span>•</span>
                  <span>На сайте с {memberSince}</span>
                </div>

                {user.username && (
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">@{user.username}</p>
                )}
              </div>

              <button
                onClick={() => setEditMode(true)}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <Edit className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-avito-primary">0</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Активных</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-avito-primary">0</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Продано</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-avito-primary">0</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Просмотров</div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 space-y-4 mt-4">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3 text-neutral-800 dark:text-neutral-200">Быстрые действия</h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/my-ads")}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-avito-primary mr-3" />
                  <span className="text-neutral-800 dark:text-neutral-200">Мои объявления</span>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              </button>

              <button
                onClick={() => router.push("/messages")}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 text-avito-primary mr-3" />
                  <span className="text-neutral-800 dark:text-neutral-200">Сообщения</span>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              </button>

              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center">
                  {isDark ? (
                    <Sun className="w-5 h-5 text-avito-primary mr-3" />
                  ) : (
                    <Moon className="w-5 h-5 text-avito-primary mr-3" />
                  )}
                  <span className="text-neutral-800 dark:text-neutral-200">
                    {isDark ? "Светлая тема" : "Темная тема"}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              </button>

              <button
                onClick={() => setActiveTab("reviews")}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-avito-primary mr-3" />
                  <span className="text-neutral-800 dark:text-neutral-200">Отзывы обо мне</span>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
              >
                <div className="flex items-center">
                  <span className="text-red-600 dark:text-red-400">Выйти из аккаунта</span>
                </div>
                <ChevronRight className="w-5 h-5 text-red-400 dark:text-red-500" />
              </button>
            </div>
          </div>

          {/* User Info Section */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3 text-neutral-800 dark:text-neutral-200">Информация</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">Telegram ID</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-mono">{userTelegramId}</span>
              </div>
              
              {user.phone && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 dark:text-neutral-400">Телефон</span>
                  <span className="text-neutral-800 dark:text-neutral-200">{user.phone}</span>
                </div>
              )}
              
              {user.email && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 dark:text-neutral-400">Email</span>
                  <span className="text-neutral-800 dark:text-neutral-200">{user.email}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">Дата регистрации</span>
                <span className="text-neutral-800 dark:text-neutral-200">
                  {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">Последняя активность</span>
                <span className="text-neutral-800 dark:text-neutral-200">
                  {new Date(user.lastActiveAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex border-b border-neutral-100 dark:border-neutral-700">
              {[
                { key: "ads", label: "Объявления" },
                { key: "reviews", label: "Отзывы" },
                { key: "settings", label: "Настройки" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "text-avito-primary border-b-2 border-avito-primary"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {activeTab === "ads" && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">У вас пока нет активных объявлений</p>
                  <button
                    onClick={() => router.push("/create")}
                    className="mt-4 px-6 py-2 bg-avito-primary text-white rounded-xl hover:bg-avito-primary/90 transition-colors"
                  >
                    Создать объявление
                  </button>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">У вас пока нет отзывов</p>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Имя
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-avito-primary focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 disabled:bg-neutral-100 dark:disabled:bg-neutral-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-avito-primary focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 disabled:bg-neutral-100 dark:disabled:bg-neutral-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-avito-primary focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 disabled:bg-neutral-100 dark:disabled:bg-neutral-800"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    {editMode ? (
                      <>
                        <button
                          onClick={handleSaveSettings}
                          className="flex-1 px-4 py-2 bg-avito-primary text-white rounded-lg hover:bg-avito-primary/90 transition-colors"
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={() => setEditMode(false)}
                          className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                        >
                          Отмена
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditMode(true)}
                        className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                      >
                        Редактировать
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
