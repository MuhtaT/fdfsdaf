"use client"

import { useState } from "react"
import { Heart, Share, MessageCircle, Phone, MapPin, Clock, Eye, Star } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Header from "@/components/navigation/Header"
import { useMarketplaceStore } from "@/stores/useMarketplaceStore"
import { useThemeStore } from "@/stores/useThemeStore"
import { createSafeTelegramTheme } from "@/types/telegram-theme"

const mockProduct = {
  id: "1",
  title: "iPhone 15 Pro Max 256GB Titanium Blue",
  price: 120000,
  currency: "RUB",
  location: "Москва, Центральный округ",
  images: [
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
  ],
  seller: {
    name: "Александр",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 4.8,
    reviewsCount: 127,
    isVerified: true,
    memberSince: "2020",
  },
  condition: "excellent",
  description: `Продаю iPhone 15 Pro Max в отличном состоянии. Телефон использовался аккуратно, всегда в чехле и с защитным стеклом.

Комплектация:
• Оригинальная коробка
• Зарядный кабель USB-C
• Документы

Состояние:
• Экран без царапин
• Корпус без повреждений
• Батарея держит отлично
• Все функции работают исправно

Причина продажи: переход на Android.

Торг возможен при личной встрече.`,
  createdAt: new Date("2024-01-15"),
  views: 1247,
  isFavorite: false,
  isPromoted: true,
  specifications: {
    "Объем памяти": "256 ГБ",
    Цвет: "Titanium Blue",
    Состояние: "Отличное",
    Гарантия: "Нет",
  },
}

export default function ProductPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const { toggleFavorite } = useMarketplaceStore()
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
      month: "long",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header
        showBackButton
        theme={safeTheme}
        actions={[
          <button
            key="favorite"
            onClick={() => toggleFavorite(id)}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                mockProduct.isFavorite ? "text-red-500 fill-red-500" : "text-neutral-600 dark:text-neutral-400"
              }`}
            />
          </button>,
          <button
            key="share"
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Share className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>,
        ]}
      />

      <main className="pt-14 pb-24">
        {/* Image Gallery */}
        <div className="relative">
          <div className="aspect-square bg-white dark:bg-neutral-800">
            <Image
              src={mockProduct.images[currentImageIndex] || "/placeholder.svg"}
              alt={mockProduct.title}
              fill
              className="object-cover"
            />
            {mockProduct.isPromoted && (
              <div className="absolute top-4 left-4 bg-avito-accent text-white text-xs font-bold px-2 py-1 rounded-lg">
                Продвижение
              </div>
            )}
          </div>

          {mockProduct.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {mockProduct.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 space-y-4">
          {/* Price and Title */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h1 className="font-display text-xl mb-2 text-neutral-800 dark:text-neutral-200">
                  {mockProduct.title}
                </h1>
                <div className="text-2xl font-bold text-avito-primary mb-2">
                  {formatPrice(mockProduct.price, mockProduct.currency)}
                </div>
              </div>
            </div>

            <div className="flex items-center text-neutral-500 dark:text-neutral-400 text-sm space-x-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{mockProduct.location}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{formatDate(mockProduct.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                <span>{mockProduct.views}</span>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Image
                  src={mockProduct.seller.avatar || "/placeholder.svg"}
                  alt={mockProduct.seller.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{mockProduct.seller.name}</h3>
                    {mockProduct.seller.isVerified && (
                      <div className="w-5 h-5 bg-avito-success rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span>{mockProduct.seller.rating}</span>
                    </div>
                    <span>•</span>
                    <span>{mockProduct.seller.reviewsCount} отзывов</span>
                    <span>•</span>
                    <span>На сайте с {mockProduct.seller.memberSince}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/chat/${mockProduct.seller.name}`)}
                className="flex-1 bg-avito-primary text-white py-3 px-4 rounded-xl font-medium hover:bg-avito-primary/90 transition-colors flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Написать
              </button>
              <button className="flex-1 bg-white dark:bg-neutral-700 border-2 border-avito-primary text-avito-primary py-3 px-4 rounded-xl font-medium hover:bg-avito-primary/5 transition-colors flex items-center justify-center">
                <Phone className="w-5 h-5 mr-2" />
                Позвонить
              </button>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3 text-neutral-800 dark:text-neutral-200">Характеристики</h3>
            <div className="space-y-2">
              {Object.entries(mockProduct.specifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0"
                >
                  <span className="text-neutral-600 dark:text-neutral-400">{key}</span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3 text-neutral-800 dark:text-neutral-200">Описание</h3>
            <div className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {showFullDescription ? (
                <div className="whitespace-pre-line">{mockProduct.description}</div>
              ) : (
                <div className="whitespace-pre-line">
                  {mockProduct.description.slice(0, 200)}
                  {mockProduct.description.length > 200 && "..."}
                </div>
              )}
              {mockProduct.description.length > 200 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-avito-primary font-medium mt-2 hover:underline"
                >
                  {showFullDescription ? "Скрыть" : "Показать полностью"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4 pb-safe">
        <div className="flex space-x-3">
          <button
            onClick={() => toggleFavorite(id)}
            className="p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500 transition-colors"
          >
            <Heart
              className={`w-6 h-6 ${mockProduct.isFavorite ? "text-red-500 fill-red-500" : "text-neutral-600 dark:text-neutral-400"}`}
            />
          </button>
          <button
            onClick={() => router.push(`/chat/${mockProduct.seller.name}`)}
            className="flex-1 bg-avito-primary text-white py-3 px-4 rounded-xl font-medium hover:bg-avito-primary/90 transition-colors flex items-center justify-center"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Написать продавцу
          </button>
        </div>
      </div>
    </div>
  )
}
