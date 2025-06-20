"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Package, Edit, Eye, Trash2, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Header from "@/components/navigation/Header"
import { useThemeStore } from "@/stores/useThemeStore"
import { createSafeTelegramTheme } from "@/types/telegram-theme"

interface UserAd {
  id: string
  title: string
  price: number
  currency: "RUB"
  images: string[]
  status: "active" | "inactive" | "sold"
  views: number
  favorites: number
  createdAt: Date
  category: string
}

const mockUserAds: UserAd[] = [
  {
    id: "1",
    title: "iPhone 15 Pro Max 256GB",
    price: 120000,
    currency: "RUB",
    images: ["/placeholder.svg?height=300&width=400"],
    status: "active",
    views: 1247,
    favorites: 23,
    createdAt: new Date("2024-01-15"),
    category: "Электроника",
  },
  {
    id: "2",
    title: 'MacBook Air M2 13"',
    price: 95000,
    currency: "RUB",
    images: ["/placeholder.svg?height=300&width=400"],
    status: "active",
    views: 856,
    favorites: 15,
    createdAt: new Date("2024-01-10"),
    category: "Электроника",
  },
  {
    id: "3",
    title: "Диван угловой",
    price: 25000,
    currency: "RUB",
    images: ["/placeholder.svg?height=300&width=400"],
    status: "sold",
    views: 432,
    favorites: 8,
    createdAt: new Date("2024-01-05"),
    category: "Мебель",
  },
]

export default function MyAdsPage() {
  const [ads] = useState<UserAd[]>(mockUserAds)
  const [contextMenu, setContextMenu] = useState<{ adId: string; x: number; y: number } | null>(null)
  const router = useRouter()
  const { telegramTheme } = useThemeStore()
  const safeTheme = createSafeTelegramTheme(telegramTheme)

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: currency === "RUB" ? "RUB" : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-avito-success bg-avito-success/10"
      case "inactive":
        return "text-neutral-500 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400"
      case "sold":
        return "text-neutral-600 bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300"
      default:
        return "text-neutral-500 bg-neutral-100"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Активно"
      case "inactive":
        return "Неактивно"
      case "sold":
        return "Продано"
      default:
        return "Неизвестно"
    }
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null)
    }

    if (contextMenu) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [contextMenu])

  const handleContextMenu = (e: React.MouseEvent, adId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setContextMenu({
      adId,
      x: rect.right - 150, // Позиционируем меню слева от кнопки
      y: rect.bottom + 5,
    })
  }

  const closeContextMenu = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setContextMenu(null)
  }

  if (ads.length === 0) {
    return (
      <div className="h-screen max-h-screen overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
        <Header title="Мои объявления" theme={safeTheme} />

        <main className="container mx-auto px-4 pt-16 pb-20">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
              <Package className="w-12 h-12 text-neutral-400 dark:text-neutral-500" />
            </div>
            <h2 className="font-display text-xl mb-2 text-neutral-800 dark:text-neutral-200">У вас нет объявлений</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-sm">
              Разместите свое первое объявление и начните продавать уже сегодня
            </p>
            <button
              onClick={() => router.push("/create")}
              className="bg-avito-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-avito-primary/90 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Разместить объявление
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen max-h-screen overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
      <Header title="Мои объявления" theme={safeTheme} />

      <main className="container mx-auto px-4 pt-16 pb-24">
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-avito-primary">
                  {ads.filter((ad) => ad.status === "active").length}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Активных</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-avito-primary">
                  {ads.reduce((sum, ad) => sum + ad.views, 0)}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Просмотров</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-avito-primary">
                  {ads.reduce((sum, ad) => sum + ad.favorites, 0)}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">В избранном</div>
              </div>
            </div>
          </div>

          {/* Ads List */}
          <div className="space-y-3">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm border border-neutral-100 dark:border-neutral-700"
              >
                <div className="flex space-x-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={ad.images[0] || "/placeholder.svg"}
                      alt={ad.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm line-clamp-2 cursor-pointer hover:text-avito-primary transition-colors"
                        onClick={() => router.push(`/product/${ad.id}`)}
                      >
                        {ad.title}
                      </h3>
                      <button
                        onClick={(e) => handleContextMenu(e, ad.id)}
                        className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ml-2"
                      >
                        <svg className="w-4 h-4 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>

                    <div className="text-avito-primary font-bold mb-2">{formatPrice(ad.price, ad.currency)}</div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                          {getStatusText(ad.status)}
                        </span>
                        <span>{formatDate(ad.createdAt)}</span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          <span>{ad.views}</span>
                        </div>
                        <div className="flex items-center">
                          <Heart className="w-3 h-3 mr-1" />
                          <span>{ad.favorites}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Ad Button */}
            <button
              onClick={() => router.push("/create")}
              className="w-full bg-avito-primary text-white py-3 px-4 rounded-xl font-medium hover:bg-avito-primary/90 transition-colors flex items-center justify-center shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Разместить объявление
            </button>
          </div>
        </div>
      </main>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-2 z-50 min-w-[150px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeContextMenu()
              // Добавить логику редактирования
            }}
            className="w-full px-4 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center text-neutral-700 dark:text-neutral-300"
          >
            <Edit className="w-4 h-4 mr-2" />
            Редактировать
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeContextMenu()
              // Добавить логику удаления
            }}
            className="w-full px-4 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center text-red-600 dark:text-red-400"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Удалить
          </button>
        </div>
      )}
    </div>
  )
}
