"use client"

import { Heart, MapPin, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMarketplaceStore } from "@/stores/useMarketplaceStore"
import Image from "next/image"

interface Product {
  id: string
  title: string
  price: number
  currency: "RUB" | "USD" | "EUR"
  location: string
  images: string[]
  seller: string
  condition: "new" | "excellent" | "good" | "fair"
  description: string
  createdAt: Date
  isFavorite: boolean
  isPromoted: boolean
}

interface ProductGridProps {
  viewMode?: "grid" | "list"
  selectionMode?: boolean
  selectedItems?: string[]
  onSelectionChange?: (items: string[]) => void
  showOnlyFavorites?: boolean
}

const mockProducts: Product[] = [
  {
    id: "1",
    title: "iPhone 15 Pro Max 256GB",
    price: 120000,
    currency: "RUB",
    location: "Москва, Центральный округ",
    images: ["/placeholder.svg?height=300&width=400"],
    seller: "Александр",
    condition: "excellent",
    description: "Продаю iPhone 15 Pro Max в отличном состоянии",
    createdAt: new Date("2024-01-15"),
    isFavorite: false,
    isPromoted: true,
  },
  {
    id: "2",
    title: 'MacBook Air M2 13"',
    price: 95000,
    currency: "RUB",
    location: "Санкт-Петербург",
    images: ["/placeholder.svg?height=300&width=400"],
    seller: "Мария",
    condition: "new",
    description: "Новый MacBook Air с гарантией",
    createdAt: new Date("2024-01-14"),
    isFavorite: true,
    isPromoted: false,
  },
  {
    id: "3",
    title: "Toyota Camry 2020",
    price: 2500000,
    currency: "RUB",
    location: "Екатеринбург",
    images: ["/placeholder.svg?height=300&width=400"],
    seller: "Дмитрий",
    condition: "good",
    description: "Автомобиль в хорошем состоянии, один владелец",
    createdAt: new Date("2024-01-13"),
    isFavorite: false,
    isPromoted: false,
  },
  {
    id: "4",
    title: "Квартира 2-к, 65 м²",
    price: 8500000,
    currency: "RUB",
    location: "Москва, Южный округ",
    images: ["/placeholder.svg?height=300&width=400"],
    seller: "Елена",
    condition: "excellent",
    description: "Продается уютная двухкомнатная квартира",
    createdAt: new Date("2024-01-12"),
    isFavorite: false,
    isPromoted: true,
  },
]

export default function ProductGrid({
  viewMode = "grid",
  selectionMode = false,
  selectedItems = [],
  onSelectionChange,
  showOnlyFavorites = false,
}: ProductGridProps) {
  const { toggleFavorite, favorites } = useMarketplaceStore()
  const router = useRouter()

  const displayProducts = showOnlyFavorites
    ? mockProducts.filter((product) => favorites.includes(product.id))
    : mockProducts

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: currency === "RUB" ? "RUB" : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Сегодня"
    if (diffDays === 2) return "Вчера"
    return `${diffDays} дней назад`
  }

  const handleProductClick = (productId: string) => {
    if (!selectionMode) {
      router.push(`/product/${productId}`)
    }
  }

  return (
    <div className={`grid gap-4 ${viewMode === "list" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
      {displayProducts.map((product) => (
        <div
          key={product.id}
          onClick={() => handleProductClick(product.id)}
          className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-neutral-100 dark:border-neutral-700 group cursor-pointer relative"
        >
          {selectionMode && (
            <div className="absolute top-3 left-3 z-10">
              <input
                type="checkbox"
                checked={selectedItems.includes(product.id)}
                onChange={(e) => {
                  e.stopPropagation()
                  if (onSelectionChange) {
                    if (e.target.checked) {
                      onSelectionChange([...selectedItems, product.id])
                    } else {
                      onSelectionChange(selectedItems.filter((id) => id !== product.id))
                    }
                  }
                }}
                className="w-5 h-5 text-avito-primary rounded border-2 border-white shadow-sm"
              />
            </div>
          )}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {product.isPromoted && (
              <div className="absolute top-3 left-3 bg-avito-accent text-white text-xs font-bold px-2 py-1 rounded-lg">
                Продвижение
              </div>
            )}

            <div className="absolute top-3 left-3 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg px-3 py-1 font-bold text-neutral-800 dark:text-neutral-200">
              {formatPrice(product.price, product.currency)}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(product.id)
              }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-neutral-700 transition-colors"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  product.isFavorite ? "text-red-500 fill-red-500" : "text-neutral-600 hover:text-red-500"
                }`}
              />
            </button>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm mb-2 line-clamp-2 group-hover:text-avito-primary transition-colors">
              {product.title}
            </h3>

            <div className="flex items-center text-neutral-500 dark:text-neutral-400 text-xs mb-2">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{product.location}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                <span>{formatDate(product.createdAt)}</span>
              </div>
              <span className="font-medium">{product.seller}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
