"use client"

import { useState } from "react"
import { Settings, Star, Package, MessageCircle, Shield, ChevronRight, Edit, Camera, Moon, Sun } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Header from "@/components/navigation/Header"
import { useThemeStore } from "@/stores/useThemeStore"
import { createSafeTelegramTheme } from "@/types/telegram-theme"

const mockUser = {
  name: "Александр Петров",
  avatar: "/placeholder.svg?height=80&width=80",
  rating: 4.8,
  reviewsCount: 127,
  isVerified: true,
  memberSince: "2020",
  phone: "+7 (999) 123-45-67",
  email: "alex@example.com",
  location: "Москва",
  stats: {
    activeAds: 12,
    soldItems: 89,
    totalViews: 15420,
  },
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"ads" | "reviews" | "settings">("ads")
  const [showSettings, setShowSettings] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: mockUser.name,
    phone: mockUser.phone,
    email: mockUser.email,
    location: mockUser.location,
  })
  const { telegramTheme, isDark, toggleDarkMode } = useThemeStore()
  const safeTheme = createSafeTelegramTheme(telegramTheme)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveSettings = () => {
    // Логика сохранения
    console.log("Saving settings:", formData)
    setEditMode(false)
  }

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
                <Image
                  src={mockUser.avatar || "/placeholder.svg"}
                  alt={mockUser.name}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-avito-primary text-white rounded-full flex items-center justify-center hover:bg-avito-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="font-display text-xl text-neutral-800 dark:text-neutral-200">{mockUser.name}</h1>
                  {mockUser.isVerified && (
                    <div className="w-6 h-6 bg-avito-success rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span>{mockUser.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{mockUser.reviewsCount} отзывов</span>
                  <span>•</span>
                  <span>На сайте с {mockUser.memberSince}</span>
                </div>

                <p className="text-neutral-600 dark:text-neutral-400 text-sm">{mockUser.location}</p>
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
                <div className="text-2xl font-bold text-avito-primary">{mockUser.stats.activeAds}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Активных</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-avito-primary">{mockUser.stats.soldItems}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Продано</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-avito-primary">
                  {mockUser.stats.totalViews.toLocaleString()}
                </div>
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
                  className={`flex-1 py-3 px-4 font-medium transition-colors ${
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
                  <Package className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-3" />
                  <p className="text-neutral-600 dark:text-neutral-400">Здесь будут отображаться ваши объявления</p>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-4">
                  {[1, 2, 3].map((review) => (
                    <div
                      key={review}
                      className="border-b border-neutral-100 dark:border-neutral-700 pb-4 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <Image
                          src="/placeholder.svg?height=40&width=40"
                          alt="Reviewer"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <div className="font-medium text-neutral-800 dark:text-neutral-200">Мария К.</div>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 text-sm">
                        Отличный продавец! Товар соответствует описанию, быстрая доставка.
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">Личные данные</h4>
                    {!editMode ? (
                      <button onClick={() => setEditMode(true)} className="text-avito-primary hover:underline">
                        Редактировать
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditMode(false)
                            setFormData({
                              name: mockUser.name,
                              phone: mockUser.phone,
                              email: mockUser.email,
                              location: mockUser.location,
                            })
                          }}
                          className="text-neutral-600 dark:text-neutral-400 hover:underline"
                        >
                          Отмена
                        </button>
                        <button onClick={handleSaveSettings} className="text-avito-primary hover:underline">
                          Сохранить
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Имя</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      readOnly={!editMode}
                      className={`w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-avito-primary focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 ${!editMode ? "cursor-not-allowed opacity-60" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Телефон</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      readOnly={!editMode}
                      className={`w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-avito-primary focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 ${!editMode ? "cursor-not-allowed opacity-60" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      readOnly={!editMode}
                      className={`w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-avito-primary focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 ${!editMode ? "cursor-not-allowed opacity-60" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Город</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      readOnly={!editMode}
                      className={`w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-avito-primary focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 ${!editMode ? "cursor-not-allowed opacity-60" : ""}`}
                    />
                  </div>

                  {editMode && (
                    <button
                      onClick={handleSaveSettings}
                      className="w-full bg-avito-primary text-white py-3 rounded-xl font-medium hover:bg-avito-primary/90 transition-colors mt-6"
                    >
                      Сохранить изменения
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
