"use client"

import type React from "react"
import { useRouter } from "next/navigation"

import { Car, Home, Smartphone, Shirt, Gamepad2, Baby, Wrench, Briefcase } from "lucide-react"
import { useMarketplaceStore } from "@/stores/useMarketplaceStore"
import type { CategoryUI, CategoryStore } from "@/types/marketplace"
import { mapUIToStoreCategory, CATEGORY_ICONS } from "@/types/marketplace"

/**
 * Локальные категории с React иконками для отображения
 */
const localCategories: CategoryUI[] = [
  {
    id: "1",
    name: "Транспорт",
    slug: "transport",
    icon: <Car className="w-6 h-6" />,
    color: "from-blue-400 to-blue-600",
    productCount: 15420,
  },
  {
    id: "2",
    name: "Недвижимость",
    slug: "real-estate",
    icon: <Home className="w-6 h-6" />,
    color: "from-green-400 to-green-600",
    productCount: 8930,
  },
  {
    id: "3",
    name: "Электроника",
    slug: "electronics",
    icon: <Smartphone className="w-6 h-6" />,
    color: "from-purple-400 to-purple-600",
    productCount: 12340,
  },
  {
    id: "4",
    name: "Одежда",
    slug: "clothing",
    icon: <Shirt className="w-6 h-6" />,
    color: "from-pink-400 to-pink-600",
    productCount: 9870,
  },
  {
    id: "5",
    name: "Хобби и отдых",
    slug: "hobby",
    icon: <Gamepad2 className="w-6 h-6" />,
    color: "from-orange-400 to-orange-600",
    productCount: 5670,
  },
  {
    id: "6",
    name: "Детские товары",
    slug: "kids",
    icon: <Baby className="w-6 h-6" />,
    color: "from-yellow-400 to-yellow-600",
    productCount: 4320,
  },
  {
    id: "7",
    name: "Услуги",
    slug: "services",
    icon: <Wrench className="w-6 h-6" />,
    color: "from-teal-400 to-teal-600",
    productCount: 7890,
  },
  {
    id: "8",
    name: "Работа",
    slug: "jobs",
    icon: <Briefcase className="w-6 h-6" />,
    color: "from-indigo-400 to-indigo-600",
    productCount: 3450,
  },
]

export default function CategoryGrid() {
  const { setSelectedCategory } = useMarketplaceStore()
  const router = useRouter()

  const handleCategorySelect = (uiCategory: CategoryUI) => {
    // ✅ ИСПРАВЛЕНО: преобразуем UI категорию в store категорию
    const storeCategory: CategoryStore = mapUIToStoreCategory(uiCategory)
    
    setSelectedCategory(storeCategory)
    router.push(`/category/${uiCategory.slug}`)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {localCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategorySelect(category)}
          className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out group border border-neutral-100 dark:border-neutral-700"
        >
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 text-white group-hover:scale-110 transition-transform duration-200`}
          >
            {category.icon}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm mb-1 group-hover:text-avito-primary transition-colors">
              {category.name}
            </h3>
            <p className="font-medium text-neutral-500 dark:text-neutral-400 text-xs">
              {category.productCount.toLocaleString("ru-RU")}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}